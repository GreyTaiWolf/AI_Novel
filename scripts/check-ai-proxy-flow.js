const { spawn } = require("child_process");
const fs = require("fs");
const path = require("path");

loadEnvLocal();

const ROOT = path.join(__dirname, "..");
const PORT = Number(process.env.PORT || 4187);
const BASE = `http://127.0.0.1:${PORT}`;
const START_TIMEOUT_MS = 15000;
const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";

if (!apiKey) {
  console.error("DeepSeek API Key missing. Set DEEPSEEK_API_KEY in .env.local or your shell.");
  process.exit(2);
}

main().catch(error => {
  console.error(`AI proxy flow check failed: ${sanitize(error.message)}`);
  process.exit(1);
});

async function main() {
  const server = spawn(process.execPath, ["server-runtime.js"], {
    cwd: ROOT,
    env: { ...process.env, PORT: String(PORT) },
    stdio: ["ignore", "pipe", "pipe"]
  });

  const logs = [];
  server.stdout.on("data", chunk => logs.push(sanitize(chunk.toString())));
  server.stderr.on("data", chunk => logs.push(sanitize(chunk.toString())));

  try {
    await waitForServer(server);

    const status = await getJson("/api/ai/status");
    assert(status.ok === true, "status.ok should be true");
    assert(status.connected === true, `proxy status should be connected, got lastError=${status.lastError || ""}`);
    assert(status.hasServerKey === true, "server key should be verified by a real provider probe");
    console.log(`✓ proxy status connected: provider=${status.provider}, model=${status.model}, mode=${status.connectionMode}`);

    const testResult = await postJson("/api/ai/test", {});
    assert(testResult.ok === true, "AI test endpoint should return ok=true");
    assert(typeof testResult.message === "string" && testResult.message.length > 0, "AI test should return a message");
    console.log(`✓ /api/ai/test returned: ${testResult.message.slice(0, 80)}`);

    const chapter = {
      id: "ch-proxy-check",
      volume: "验证卷",
      title: "代理模式真实连接验证章",
      goal: "验证 AI 可以根据有限资料返回结构化内容。",
      conflict: "必须确认返回内容不是演示假数据。",
      taboo: "不要输出真实 API Key。",
      status: "写作中"
    };
    const loreIndex = [
      {
        id: "proxy-hero",
        type: "人物",
        title: "验证角色",
        summary: "用于检查代理模式真实 AI 调用的临时角色。",
        tags: ["验证"],
        importance: "中",
        status: "有效",
        relations: [],
        references: ["代理模式真实连接验证章"],
        fields: {},
        links: []
      }
    ];
    const loreDetails = [
      {
        ...loreIndex[0],
        detail: "这个角色只用于自动化检查：AI 必须正常返回 reply、contextBundle、actions 和 proposedChanges 字段。",
        timeline: "验证时刻"
      }
    ];

    const chatResult = await postJson("/api/ai/chat", {
      message: "请用一句话确认你读取了验证角色，并返回 JSON 结构。",
      view: "ai",
      chapter,
      loreIndex,
      loreDetails,
      selectedLore: loreDetails[0],
      proposedChanges: []
    });
    assert(chatResult.ok === true, "AI chat endpoint should return ok=true");
    assert(typeof chatResult.reply === "string" && chatResult.reply.trim(), "AI chat should return reply");
    assert(Array.isArray(chatResult.actions), "AI chat should normalize actions array");
    assert(Array.isArray(chatResult.proposedChanges), "AI chat should normalize proposedChanges array");
    assert(chatResult.contextBundle && typeof chatResult.contextBundle === "object", "AI chat should return contextBundle object");
    console.log(`✓ /api/ai/chat reply: ${chatResult.reply.slice(0, 120)}`);

    const draftResult = await postJson("/api/ai/draft", {
      chapter,
      loreIndex,
      loreDetails,
      proposedChanges: []
    });
    assert(draftResult.ok === true, "AI draft endpoint should return ok=true");
    assert(typeof draftResult.reply === "string" && draftResult.reply.trim(), "AI draft should return reply");
    assert(typeof draftResult.draft === "string", "AI draft should normalize draft string");
    assert(draftResult.contextBundle && typeof draftResult.contextBundle === "object", "AI draft should return contextBundle object");
    assert(Array.isArray(draftResult.proposedChanges), "AI draft should normalize proposedChanges array");
    console.log(`✓ /api/ai/draft returned draft chars=${draftResult.draft.length}, proposedChanges=${draftResult.proposedChanges.length}`);

    console.log("AI proxy flow check OK. No API key was printed or written to the repository.");
  } catch (error) {
    if (logs.length) console.error(logs.join(""));
    throw error;
  } finally {
    server.kill("SIGTERM");
  }
}

async function waitForServer(server) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < START_TIMEOUT_MS) {
    if (server.exitCode !== null) throw new Error(`server exited early with code ${server.exitCode}`);
    try {
      const response = await fetch(`${BASE}/api/library/index`);
      if (response.ok) return;
    } catch {
      // Retry until the local server starts accepting connections.
    }
    await delay(250);
  }
  throw new Error("local proxy server did not start in time");
}

async function getJson(endpoint) {
  const response = await fetch(`${BASE}${endpoint}`);
  return readCheckedJson(response, endpoint);
}

async function postJson(endpoint, body) {
  const response = await fetch(`${BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  return readCheckedJson(response, endpoint);
}

async function readCheckedJson(response, endpoint) {
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text || "{}");
  } catch {
    throw new Error(`${endpoint} returned non-JSON response: ${sanitize(text).slice(0, 300)}`);
  }
  if (!response.ok || data.ok === false) {
    throw new Error(`${endpoint} failed: ${sanitize(data.error || response.status)}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [rawKey, ...rawValue] = trimmed.split("=");
    const key = rawKey.trim();
    const value = rawValue.join("=").trim().replace(/^["']|["']$/g, "");
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

function sanitize(value) {
  return String(value || "")
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/ds-[A-Za-z0-9_-]+/g, "ds-***")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***");
}
