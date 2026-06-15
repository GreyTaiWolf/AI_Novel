const fs = require("fs");
const http = require("http");
const path = require("path");

const ROOT = __dirname;
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";
const CONNECTION_CACHE_TTL_MS = 5 * 60 * 1000;
const originalFetch = global.fetch;
const originalCreateServer = http.createServer;
const connectionCache = new Map();

loadEnvLocal();
patchHttpServer();
patchDeepSeekFetch();

require("./server");

function patchHttpServer() {
  http.createServer = function patchedCreateServer(requestListener, ...args) {
    const wrappedListener = async (req, res) => {
      try {
        const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);

        if (req.method === "GET" && url.pathname === "/app.js") {
          servePatchedAppScript(res);
          return;
        }

        if (req.method === "GET" && (url.pathname === "/api/config" || url.pathname === "/api/ai/status")) {
          const status = await resolveServerConnectionStatus();
          sendJson(res, 200, status);
          return;
        }
      } catch (error) {
        sendJson(res, error.status || 500, {
          ok: false,
          error: safeErrorText(error.message || "代理模式初始化失败。")
        });
        return;
      }

      requestListener(req, res);
    };

    return originalCreateServer.call(this, wrappedListener, ...args);
  };
}

function patchDeepSeekFetch() {
  if (typeof originalFetch !== "function") return;

  global.fetch = async function patchedDeepSeekFetch(url, options = {}) {
    const response = await originalFetch(url, options);
    if (!isChatCompletionUrl(url)) return response;

    const text = await response.text();
    if (!response.ok) {
      return cloneTextResponse(response, normalizeErrorText(text, response.status));
    }

    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      return cloneTextResponse(response, text);
    }

    const content = payload?.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      const normalized = normalizeAssistantJson(content);
      if (normalized) payload.choices[0].message.content = JSON.stringify(normalized);
    }

    return cloneJsonResponse(response, payload);
  };
}

function servePatchedAppScript(res) {
  const appPath = path.join(ROOT, "app.js");
  fs.readFile(appPath, "utf8", (error, source) => {
    if (error) {
      sendJson(res, 404, { ok: false, error: "app.js 不存在" });
      return;
    }

    res.writeHead(200, {
      "Content-Type": "text/javascript; charset=utf-8",
      "Cache-Control": "no-store"
    });
    res.end(applyProxyModeConnectionGuards(source));
  });
}

function applyProxyModeConnectionGuards(source) {
  return source
    .replace(
      /function isAiConfigured\(\) \{\s*return Boolean\(state\.apiConfig\?\.apiKey \|\| state\.apiConfig\?\.hasServerKey\);\s*\}/,
      `function isAiConfigured() {
  return Boolean(state.apiConfig?.connected);
}`
    )
    .replace(
      /function apiStatusText\(\) \{\s*if \(state\.apiConfig\?\.connected\) return "已连接";\s*if \(state\.apiConfig\?\.hasServerKey\) return "检测到本机 Key";\s*if \(state\.apiConfig\?\.apiKey\) return "已填写 Key";\s*return "未连接";\s*\}/,
      `function apiStatusText() {
  if (state.apiConfig?.connected) return "已真实连接";
  if (state.apiConfig?.lastError) return "连接失败";
  if (state.apiConfig?.hasServerKey || state.apiConfig?.apiKey) return "待真实测试";
  return "未连接";
}`
    )
    .replace(
      '<span class="connection-dot ${apiReady ? "active" : ""}">${apiReady ? "5.5" : "未连接"}</span>',
      '<span class="connection-dot ${apiReady ? "active" : ""}">${apiStatusText()}</span>'
    )
    .replace(
      "hasServerKey: Boolean(data.hasServerKey)",
      `hasServerKey: Boolean(data.hasServerKey),
      connected: Boolean(data.connected),
      lastTestAt: data.lastTestAt || state.apiConfig.lastTestAt,
      lastError: data.lastError || (data.connected ? "" : state.apiConfig.lastError)`
    );
}

async function resolveServerConnectionStatus() {
  const apiKey = getServerApiKey();
  const baseUrl = normalizeBaseUrl(process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL);
  const model = String(process.env.DEEPSEEK_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
  const status = {
    ok: true,
    provider: "DeepSeek",
    baseUrl,
    model,
    hasServerKey: false,
    serverKeyConfigured: Boolean(apiKey),
    connected: false,
    connectionMode: "proxy",
    lastTestAt: null,
    lastError: ""
  };

  if (!apiKey) {
    status.lastError = "未配置 DeepSeek API Key。请在 .env.local 中设置 DEEPSEEK_API_KEY，或在设置页填写后点击测试连接。";
    return status;
  }

  if (typeof originalFetch !== "function") {
    status.lastError = "当前 Node.js 不支持 fetch，请使用 Node.js 18 或更新版本。";
    return status;
  }

  const cacheKey = `${baseUrl}|${model}|${fingerprintKey(apiKey)}`;
  const cached = connectionCache.get(cacheKey);
  if (cached && Date.now() - cached.checkedAt < CONNECTION_CACHE_TTL_MS) {
    return { ...status, ...cached.payload };
  }

  const checkedAt = new Date().toISOString();
  try {
    const probe = await probeDeepSeekConnection({ apiKey, baseUrl, model });
    const payload = {
      hasServerKey: true,
      connected: true,
      lastTestAt: checkedAt,
      lastError: "",
      availableModels: probe.availableModels
    };
    connectionCache.set(cacheKey, { checkedAt: Date.now(), payload });
    return { ...status, ...payload };
  } catch (error) {
    const payload = {
      hasServerKey: false,
      connected: false,
      lastTestAt: checkedAt,
      lastError: safeErrorText(error.message || "DeepSeek 真实连接测试失败。")
    };
    connectionCache.set(cacheKey, { checkedAt: Date.now(), payload });
    return { ...status, ...payload };
  }
}

async function probeDeepSeekConnection(settings) {
  const modelResponse = await fetchWithTimeout(modelsUrl(settings.baseUrl), {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    }
  });

  if (modelResponse.ok) {
    const data = await readJsonResponse(modelResponse);
    const availableModels = Array.isArray(data?.data)
      ? data.data.map(item => item?.id).filter(Boolean)
      : [];

    if (availableModels.length && !availableModels.includes(settings.model)) {
      throw new Error(`DeepSeek Key 有效，但模型 ${settings.model} 不在供应商模型列表中。`);
    }

    return { availableModels };
  }

  if (![404, 405].includes(modelResponse.status)) {
    throw new Error(`${modelResponse.status} ${await readSafeError(modelResponse)}`);
  }

  return probeChatCompletion(settings);
}

async function probeChatCompletion(settings) {
  const response = await fetchWithTimeout(completionUrl(settings.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify({
      model: settings.model,
      messages: [
        { role: "system", content: "You are a real connection probe. Reply with OK." },
        { role: "user", content: "Connection test." }
      ],
      stream: false,
      max_tokens: 16
    })
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${await readSafeError(response)}`);
  }

  const data = await readJsonResponse(response);
  const content = data?.choices?.[0]?.message?.content || "";
  if (!content) throw new Error("DeepSeek 返回了空响应。");
  return { availableModels: [] };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await originalFetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("DeepSeek 连接超时。");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

async function readJsonResponse(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`DeepSeek 返回了非 JSON 响应：${safeErrorText(text).slice(0, 200)}`);
  }
}

async function readSafeError(response) {
  const text = await response.text();
  return safeErrorText(normalizeErrorText(text, response.status));
}

function modelsUrl(baseUrl) {
  return `${apiRootFromBaseUrl(baseUrl)}/models`;
}

function completionUrl(baseUrl) {
  const root = normalizeBaseUrl(baseUrl);
  if (root.endsWith("/chat/completions")) return root;
  return `${root}/chat/completions`;
}

function apiRootFromBaseUrl(baseUrl) {
  return normalizeBaseUrl(baseUrl).replace(/\/chat\/completions$/, "");
}

function normalizeBaseUrl(value) {
  const raw = String(value || DEFAULT_BASE_URL).trim().replace(/\/+$/, "");
  const url = new URL(raw);
  const isLocal = ["localhost", "127.0.0.1", "::1"].includes(url.hostname);
  if (url.protocol !== "https:" && !(url.protocol === "http:" && isLocal)) {
    throw new Error("Base URL 必须是 https，或本机 localhost 地址。");
  }
  return raw;
}

function getServerApiKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
}

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(payload, null, 2));
}

function isChatCompletionUrl(url) {
  return String(url || "").includes("/chat/completions");
}

function cloneTextResponse(response, text) {
  return new Response(text, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers
  });
}

function cloneJsonResponse(response, payload) {
  const headers = new Headers(response.headers);
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(payload), {
    status: response.status,
    statusText: response.statusText,
    headers
  });
}

function normalizeErrorText(text, status) {
  try {
    const parsed = JSON.parse(text);
    const message = parsed?.error?.message || parsed?.message || parsed?.details || text;
    return JSON.stringify({ error: { message: safeErrorText(message), status } });
  } catch {
    return JSON.stringify({ error: { message: safeErrorText(text || `DeepSeek request failed: ${status}`), status } });
  }
}

function normalizeAssistantJson(content) {
  const parsed = parseJsonObject(content);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return null;

  const proposedChanges = firstArray(
    parsed.proposedChanges,
    parsed.proposed_changes,
    parsed.changeSet,
    parsed.changeset,
    parsed.changeSets,
    parsed.changesets,
    parsed.changes,
    parsed.patchSet,
    parsed.patches
  );

  if (proposedChanges && !Array.isArray(parsed.proposedChanges)) parsed.proposedChanges = proposedChanges;
  if (!parsed.reply && typeof parsed.message === "string") parsed.reply = parsed.message;
  if (!parsed.draft && typeof parsed.text === "string") parsed.draft = parsed.text;
  if (!parsed.draft && typeof parsed.chapterDraft === "string") parsed.draft = parsed.chapterDraft;
  if (!parsed.contextBundle && parsed.context_bundle && typeof parsed.context_bundle === "object") parsed.contextBundle = parsed.context_bundle;
  return parsed;
}

function firstArray(...values) {
  return values.find(value => Array.isArray(value));
}

function parseJsonObject(content) {
  const text = String(content || "").trim();
  if (!text) return null;

  const unfenced = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  try {
    return JSON.parse(unfenced);
  } catch {
    const match = unfenced.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
}

function safeErrorText(value) {
  return String(value || "")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/ds-[A-Za-z0-9_-]+/g, "ds-***")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***")
    .slice(0, 800);
}

function fingerprintKey(apiKey) {
  const key = String(apiKey || "");
  if (!key) return "";
  return `${key.slice(0, 4)}:${key.length}:${key.slice(-4)}`;
}
