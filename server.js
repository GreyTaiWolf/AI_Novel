const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 4173);
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, "data");
const LIBRARY_DATA_PATH = path.join(DATA_DIR, "library.json");
const DEFAULT_BASE_URL = "https://api.deepseek.com";
const DEFAULT_MODEL = "deepseek-v4-flash";
const LORE_SCHEMA_VERSION = 2;
const LORE_TYPE_ALIASES = {
  地点: "地点/地理",
  物品: "物品/线索",
  世界规则: "世界观/规则",
  世界观: "世界观/规则",
  规则: "世界观/规则"
};
const RELATION_TYPE_LABELS = {
  member: "成员",
  ally: "盟友",
  enemy: "敌对",
  related: "关联",
  owner: "持有",
  affects: "影响",
  belongsTo: "归属"
};

loadEnvLocal();

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".ico": "image/x-icon"
};

const server = http.createServer(async (req, res) => {
  setCorsHeaders(res);

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
      return;
    }

    serveStatic(url.pathname, res);
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, error: error.message || "服务器内部错误" });
  }
});

server.listen(PORT, () => {
  console.log(`笔维斯 prototype running at http://localhost:${PORT}`);
  console.log(`DeepSeek key: ${getServerApiKey() ? "configured" : "missing"}`);
});

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

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
}

function readLibraryStore() {
  ensureLibraryFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(LIBRARY_DATA_PATH, "utf8"));
    return {
      schemaVersion: LORE_SCHEMA_VERSION,
      updatedAt: parsed.updatedAt || new Date().toISOString(),
      lore: normalizeLoreCollection(parsed.lore)
    };
  } catch {
    return { schemaVersion: LORE_SCHEMA_VERSION, updatedAt: new Date().toISOString(), lore: [] };
  }
}

function writeLibraryStore(store) {
  ensureLibraryFile();
  const payload = {
    schemaVersion: LORE_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    lore: normalizeLoreCollection(store.lore)
  };
  fs.writeFileSync(LIBRARY_DATA_PATH, JSON.stringify(payload, null, 2), "utf8");
}

function ensureLibraryFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(LIBRARY_DATA_PATH)) {
    fs.writeFileSync(
      LIBRARY_DATA_PATH,
      JSON.stringify({ schemaVersion: LORE_SCHEMA_VERSION, updatedAt: new Date().toISOString(), lore: [] }, null, 2),
      "utf8"
    );
  }
}

function normalizeLoreType(type = "") {
  const value = String(type || "").trim();
  if (!value) return "人物";
  return LORE_TYPE_ALIASES[value] || value;
}

function normalizeLoreCollection(items = []) {
  const normalized = (Array.isArray(items) ? items : []).map(normalizeLoreItem);
  const byId = new Map(normalized.map(item => [item.id, item]));
  const byTitle = new Map(normalized.map(item => [item.title, item]).filter(([, item]) => item.title));
  return normalized.map(item => enrichLoreItemLinks(item, byId, byTitle));
}

function normalizeLoreItem(item = {}) {
  const links = normalizeLinks(item.links);
  const relations = unique([...toArray(item.relations), ...links.map(link => link.targetTitle)]);
  return {
    id: String(item.id || uniqueId("lore", 0)),
    type: normalizeLoreType(item.type || "人物"),
    title: String(item.title || "").trim(),
    summary: String(item.summary || "").trim(),
    detail: String(item.detail || "").trim(),
    tags: toArray(item.tags).map(String),
    importance: String(item.importance || "中"),
    status: String(item.status || "有效"),
    relations,
    timeline: String(item.timeline || ""),
    references: toArray(item.references).map(String),
    fields: normalizeFields(item.fields),
    links
  };
}

function toLoreIndexItem(item = {}) {
  return {
    id: item.id,
    type: item.type,
    title: item.title,
    summary: item.summary,
    tags: toArray(item.tags),
    importance: item.importance,
    status: item.status,
    relations: toArray(item.relations),
    references: toArray(item.references),
    fields: normalizeFields(item.fields),
    links: normalizeLinks(item.links)
  };
}

function normalizeFields(fields = {}) {
  if (!fields || typeof fields !== "object" || Array.isArray(fields)) return {};
  return Object.entries(fields).reduce((out, [key, value]) => {
    if (Array.isArray(value)) out[key] = unique(value.map(item => String(item).trim()));
    else if (value !== undefined && value !== null) out[key] = String(value).trim();
    return out;
  }, {});
}

function normalizeLinks(links = []) {
  if (!Array.isArray(links)) return [];
  return links
    .map(link => {
      if (!link || typeof link !== "object") {
        return { targetId: "", targetTitle: String(link || "").trim(), relationType: "related", note: "" };
      }
      return {
        targetId: String(link.targetId || "").trim(),
        targetTitle: String(link.targetTitle || link.title || "").trim(),
        relationType: normalizeRelationType(link.relationType || link.type || "related"),
        note: String(link.note || "").trim()
      };
    })
    .filter(link => link.targetId || link.targetTitle);
}

function normalizeRelationType(type = "related") {
  const value = String(type || "related").trim();
  return RELATION_TYPE_LABELS[value] ? value : "related";
}

function enrichLoreItemLinks(item, byId, byTitle) {
  const links = [];
  const addLink = link => {
    const target = link.targetId ? byId.get(link.targetId) : byTitle.get(link.targetTitle);
    const targetId = link.targetId || target?.id || "";
    const targetTitle = link.targetTitle || target?.title || "";
    if (!targetId && !targetTitle) return;
    if (links.some(entry => (targetId && entry.targetId === targetId && entry.relationType === link.relationType) || (!targetId && entry.targetTitle === targetTitle && entry.relationType === link.relationType))) return;
    links.push({ targetId, targetTitle, relationType: normalizeRelationType(link.relationType), note: link.note || "" });
  };

  normalizeLinks(item.links).forEach(addLink);
  toArray(item.relations).forEach(title => {
    const target = byTitle.get(title);
    const relationType = item.type === "家族/势力" && target?.type === "人物" ? "member" : "related";
    addLink({ targetId: target?.id || "", targetTitle: target?.title || title, relationType, note: "" });
  });

  const fields = normalizeFields(item.fields);
  if (item.type === "家族/势力") {
    addStructuredFamilyLinks("members", "member");
    addStructuredFamilyLinks("allies", "ally");
    addStructuredFamilyLinks("enemies", "enemy");
    fields.members = unique([...toArray(fields.members), ...links.filter(link => link.relationType === "member").map(link => link.targetId).filter(Boolean)]);
    fields.allies = unique([...toArray(fields.allies), ...links.filter(link => link.relationType === "ally").map(link => link.targetId).filter(Boolean)]);
    fields.enemies = unique([...toArray(fields.enemies), ...links.filter(link => link.relationType === "enemy").map(link => link.targetId).filter(Boolean)]);
  }

  const relations = unique([...toArray(item.relations), ...links.map(link => link.targetTitle).filter(Boolean)]);
  return { ...item, fields, links, relations };

  function addStructuredFamilyLinks(fieldName, relationType) {
    toArray(fields[fieldName]).forEach(id => {
      const target = byId.get(id);
      if (target) addLink({ targetId: target.id, targetTitle: target.title, relationType, note: "" });
    });
  }
}

function searchLoreItems(lore, query = {}) {
  const types = toArray(query.types);
  const terms = tokenize([query.query, query.chapterId, query.message].filter(Boolean).join(" "));
  const limit = Math.min(Math.max(Number(query.limit || 6), 1), 12);
  return lore
    .filter(item => !types.length || types.includes(item.type))
    .map(item => ({ item, score: scoreLoreItem(item, terms) }))
    .filter(entry => !terms.length || entry.score > 0)
    .sort((left, right) => right.score - left.score || importanceRank(right.item.importance) - importanceRank(left.item.importance))
    .slice(0, limit)
    .map(entry => entry.item);
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter(term => term.length >= 2);
}

function scoreLoreItem(item, terms) {
  const fieldValues = Object.values(normalizeFields(item.fields)).flatMap(value => toArray(value));
  const linkValues = normalizeLinks(item.links).flatMap(link => [link.targetTitle, RELATION_TYPE_LABELS[link.relationType], link.note]);
  const haystack = [item.title, item.type, item.summary, item.detail, item.timeline, ...toArray(item.tags), ...toArray(item.relations), ...toArray(item.references), ...fieldValues, ...linkValues]
    .join(" ")
    .toLowerCase();
  if (!terms.length) return importanceRank(item.importance);
  return terms.reduce((score, term) => score + (haystack.includes(term) ? 1 : 0), 0);
}

function importanceRank(value = "") {
  if (value === "核心") return 4;
  if (value === "高") return 3;
  if (value === "中") return 2;
  return 1;
}

function applyApprovedChangeToLore(lore, change = {}) {
  const patch = change.patch || {};
  const loreItem = patch.loreItem || patch.item || patch;
  const target = findLoreTargetInList(lore, change, patch);

  if (change.type === "新增") {
    addLoreFromApprovedChange(lore, change, loreItem);
    return;
  }

  if (change.type === "修改" && target) {
    Object.assign(target, pickLoreFieldsForStore(loreItem));
    target.tags = unique([...(target.tags || []), "AI已审批"]);
    const normalized = normalizeLoreCollection(lore);
    lore.splice(0, lore.length, ...normalized);
    return;
  }

  if (change.type === "关联" && target) {
    const relations = toArray(loreItem.relations || patch.relations || [cleanChangeTitle(change.title)]);
    target.relations = unique([...(target.relations || []), ...relations]);
    target.fields = { ...normalizeFields(target.fields), ...normalizeFields(loreItem.fields || patch.fields) };
    target.links = uniqueLinks([...(target.links || []), ...normalizeLinks(loreItem.links || patch.links)]);
    target.tags = unique([...(target.tags || []), "AI已审批"]);
    const normalized = normalizeLoreCollection(lore);
    lore.splice(0, lore.length, ...normalized);
    return;
  }

  if (change.type === "删除" && target) {
    target.status = "已归档";
    target.tags = unique([...(target.tags || []), "AI建议删除-已归档"]);
    return;
  }

  addLoreFromApprovedChange(lore, change, loreItem);
}

function addLoreFromApprovedChange(lore, change, loreItem = {}) {
  const title = loreItem.title || cleanChangeTitle(change.title);
  if (lore.some(item => item.title === title)) return;
  lore.push(
    normalizeLoreItem({
      id: loreItem.id || uniqueId("lore", lore.length),
      type: loreItem.type || inferLoreType(change.title),
      title,
      summary: loreItem.summary || change.reason || "AI 审批后新增资料。",
      detail: loreItem.detail || `${change.reason || ""}\n\n影响范围：${change.impact || ""}`.trim(),
      tags: unique(["AI已审批", ...toArray(loreItem.tags)]),
      importance: loreItem.importance || "中",
      status: loreItem.status || "有效",
      relations: toArray(loreItem.relations),
      timeline: loreItem.timeline || "",
      references: toArray(loreItem.references),
      fields: normalizeFields(loreItem.fields),
      links: normalizeLinks(loreItem.links)
    })
  );
  const normalized = normalizeLoreCollection(lore);
  lore.splice(0, lore.length, ...normalized);
}

function findLoreTargetInList(lore, change, patch = {}) {
  const targetId = patch.targetId || patch.id;
  if (targetId) {
    const byId = lore.find(item => item.id === targetId);
    if (byId) return byId;
  }
  const targetTitle = patch.targetTitle || patch.title || cleanChangeTitle(change.title);
  return lore.find(item => item.title === targetTitle || String(change.title || "").includes(item.title));
}

function pickLoreFieldsForStore(source = {}) {
  const allowed = ["type", "title", "summary", "detail", "tags", "importance", "status", "relations", "timeline", "references", "fields", "links"];
  return allowed.reduce((out, key) => {
    if (source[key] !== undefined) out[key] = Array.isArray(source[key]) ? [...source[key]] : source[key];
    return out;
  }, {});
}

function uniqueId(prefix, index) {
  return `${prefix}-${Date.now()}-${index}`;
}

function cleanChangeTitle(title = "") {
  return String(title).replace(/^(新增|修改|关联|删除)(人物|事件|地点\/地理|地点|物品\/线索|物品|世界观\/规则|世界规则|历史\/年表|种族\/生物|能力\/魔法|宗教\/文化|国家\/制度|卷章|家族\/势力)?[:：\s]*/, "").trim() || "AI 新资料";
}

function inferLoreType(title = "") {
  if (title.includes("人物")) return "人物";
  if (title.includes("地点") || title.includes("地理")) return "地点/地理";
  if (title.includes("物品") || title.includes("线索")) return "物品/线索";
  if (title.includes("规则") || title.includes("世界观")) return "世界观/规则";
  if (title.includes("历史") || title.includes("年表")) return "历史/年表";
  if (title.includes("种族") || title.includes("生物")) return "种族/生物";
  if (title.includes("能力") || title.includes("魔法")) return "能力/魔法";
  if (title.includes("宗教") || title.includes("文化")) return "宗教/文化";
  if (title.includes("国家") || title.includes("制度")) return "国家/制度";
  if (title.includes("家族") || title.includes("势力")) return "家族/势力";
  return "事件";
}

function unique(items) {
  return [...new Set(toArray(items).filter(Boolean))];
}

function uniqueLinks(links = []) {
  const seen = new Set();
  return normalizeLinks(links).filter(link => {
    const key = `${link.relationType}:${link.targetId || link.targetTitle}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function handleApi(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/config") {
    sendJson(res, 200, {
      ok: true,
      provider: "DeepSeek",
      baseUrl: process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL,
      model: process.env.DEEPSEEK_MODEL || DEFAULT_MODEL,
      hasServerKey: Boolean(getServerApiKey())
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/library/state") {
    const store = readLibraryStore();
    sendJson(res, 200, {
      ok: true,
      schemaVersion: store.schemaVersion,
      updatedAt: store.updatedAt,
      lore: store.lore
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/api/library/index") {
    const store = readLibraryStore();
    sendJson(res, 200, {
      ok: true,
      updatedAt: store.updatedAt,
      loreIndex: store.lore.map(toLoreIndexItem)
    });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/api/library/items/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/library/items/", ""));
    const item = readLibraryStore().lore.find(entry => entry.id === id);
    if (!item) {
      sendJson(res, 404, { ok: false, error: "资料不存在" });
      return;
    }
    sendJson(res, 200, { ok: true, item });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/library/search") {
    const body = await readJson(req);
    const store = readLibraryStore();
    const results = searchLoreItems(store.lore, body);
    sendJson(res, 200, {
      ok: true,
      query: body.query || "",
      results: results.map(toLoreIndexItem),
      details: results.slice(0, Number(body.detailLimit || body.limit || 6)).map(item => item)
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/library/items") {
    const body = await readJson(req);
    const store = readLibraryStore();
    const item = normalizeLoreItem(body.item || body);
    if (!item.title) {
      sendJson(res, 400, { ok: false, error: "资料标题不能为空" });
      return;
    }
    if (store.lore.some(entry => entry.id === item.id)) item.id = uniqueId("lore", store.lore.length);
    store.lore.push(item);
    writeLibraryStore(store);
    sendJson(res, 200, { ok: true, item, lore: store.lore });
    return;
  }

  if (req.method === "PUT" && url.pathname.startsWith("/api/library/items/")) {
    const id = decodeURIComponent(url.pathname.replace("/api/library/items/", ""));
    const body = await readJson(req);
    const store = readLibraryStore();
    const index = store.lore.findIndex(entry => entry.id === id);
    if (index === -1) {
      sendJson(res, 404, { ok: false, error: "资料不存在" });
      return;
    }
    store.lore[index] = normalizeLoreItem({ ...store.lore[index], ...(body.item || body), id });
    writeLibraryStore(store);
    sendJson(res, 200, { ok: true, item: store.lore[index], lore: store.lore });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/library/apply-approved-change") {
    const body = await readJson(req);
    const change = body.change || body;
    const store = readLibraryStore();
    applyApprovedChangeToLore(store.lore, change);
    writeLibraryStore(store);
    sendJson(res, 200, { ok: true, lore: store.lore });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai/test") {
    const body = await readJson(req);
    const settings = resolveAiSettings(body);
    const completion = await requestChatCompletion(settings, [
      {
        role: "system",
        content: "你是连接测试助手。只返回 JSON，格式为 {\"ok\":true,\"message\":\"连接成功\"}。"
      },
      { role: "user", content: "请确认 DeepSeek API 可以工作。" }
    ], { maxTokens: 120, json: true });

    const parsed = parseJsonObject(completion.content);
    sendJson(res, 200, {
      ok: true,
      model: settings.model,
      baseUrl: settings.baseUrl,
      message: parsed.message || completion.content || "连接成功"
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai/draft") {
    const body = await readJson(req);
    const settings = resolveAiSettings(body.api || {});
    const messages = buildDraftMessages(body);
    const completion = await requestChatCompletion(settings, messages, { maxTokens: 2600, json: true });
    const payload = normalizeDraftPayload(parseJsonObject(completion.content), body);
    sendJson(res, 200, { ok: true, ...payload });
    return;
  }

  if (req.method === "POST" && url.pathname === "/api/ai/chat") {
    const body = await readJson(req);
    const settings = resolveAiSettings(body.api || {});
    const messages = buildChatMessages(body);
    const completion = await requestChatCompletion(settings, messages, { maxTokens: 1400, json: true });
    const parsed = parseJsonObject(completion.content);
    sendJson(res, 200, {
      ok: true,
      reply: parsed.reply || parsed.message || completion.content,
      contextBundle: normalizeContextBundle(parsed.contextBundle || {}, body),
      actions: normalizeAIActions(parsed.actions || []),
      proposedChanges: normalizeProposedChanges(parsed.proposedChanges || [])
    });
    return;
  }

  sendJson(res, 404, { ok: false, error: "接口不存在" });
}

function resolveAiSettings(input = {}) {
  const apiKey = String(input.apiKey || getServerApiKey() || "").trim();
  if (!apiKey) {
    const error = new Error("未配置 DeepSeek API Key。请在设置页填写，或创建 .env.local。");
    error.status = 400;
    throw error;
  }

  const baseUrl = normalizeBaseUrl(input.baseUrl || process.env.DEEPSEEK_BASE_URL || DEFAULT_BASE_URL);
  const model = String(input.model || process.env.DEEPSEEK_MODEL || DEFAULT_MODEL).trim();
  return { apiKey, baseUrl, model };
}

function getServerApiKey() {
  return process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
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

function completionUrl(baseUrl) {
  if (baseUrl.endsWith("/chat/completions")) return baseUrl;
  return `${baseUrl}/chat/completions`;
}

async function requestChatCompletion(settings, messages, options = {}) {
  const body = {
    model: settings.model,
    messages,
    stream: false,
    temperature: 0.72,
    max_tokens: options.maxTokens || 1200
  };
  if (options.json) body.response_format = { type: "json_object" };

  let response = await fetch(completionUrl(settings.baseUrl), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${settings.apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok && options.json) {
    delete body.response_format;
    response = await fetch(completionUrl(settings.baseUrl), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify(body)
    });
  }

  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: { message: text } };
  }

  if (!response.ok) {
    const message = data?.error?.message || `DeepSeek 请求失败：${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  const content = data?.choices?.[0]?.message?.content || "";
  return { content, raw: data };
}

function buildDraftMessages(body) {
  const chapter = body.chapter || {};
  const loreIndex = Array.isArray(body.loreIndex) ? body.loreIndex.slice(0, 80) : [];
  const loreDetails = Array.isArray(body.loreDetails)
    ? body.loreDetails.slice(0, 8)
    : Array.isArray(body.lore)
      ? body.lore.slice(0, 8)
      : [];
  const proposedChanges = Array.isArray(body.proposedChanges) ? body.proposedChanges : [];

  return [
    {
      role: "system",
      content: [
        "你是长篇中文小说创作工作台里的 AI 写作引擎。",
        "你可以控制：根据资料目录选择需要读取的资料、生成章节草稿、指出矛盾、提出资料库变更。",
        "你不可以控制：直接写入、删除或覆盖用户资料库。任何资料变化必须放进 proposedChanges，状态必须是“待审批”。",
        "你只能把 loreDetails 视为已读资料；loreIndex 只是目录，不可当作完整事实扩写。",
        "输出必须是 JSON 对象，不要 Markdown，不要解释 JSON 外的内容。",
        "JSON 格式：{ reply, draft, contextBundle:{ loreItemIds, relationHints, timelineRefs, chapterId }, proposedChanges:[{ type, title, reason, impact, conflict, status, patch }] }。",
        "资料 patch.loreItem 可包含 fields 和 links；links 形如 { targetId, targetTitle, relationType, note }，relationType 可用 member、ally、enemy、related。"
      ].join("\n")
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          task: "根据章节目标生成章节草稿，并只提出待审批资料变更。",
          chapter,
          loreIndex,
          loreDetails,
          proposedChanges,
          rules: [
            "draft 用中文小说正文，800 到 1400 字为宜。",
            "contextBundle 只能引用 loreDetails 中本次确实用到的资料 id。",
            "proposedChanges 最多 4 条，必须有 reason、impact、conflict。",
            "如果发现新设定、矛盾或关系变化，只能进入 proposedChanges。"
          ]
        },
        null,
        2
      )
    }
  ];
}

function buildChatMessages(body) {
  const loreIndex = Array.isArray(body.loreIndex) ? body.loreIndex.slice(0, 80) : [];
  const loreDetails = Array.isArray(body.loreDetails)
    ? body.loreDetails.slice(0, 8)
    : Array.isArray(body.lore)
      ? body.lore.slice(0, 8)
      : [];
  return [
    {
      role: "system",
      content: [
        "你是长篇小说资料库 AI 助手。",
        "你可以读取资料、回答问题、建议修改，但不能直接写入资料库。",
        "你可以返回 actions 来让前端安全执行：打开弹窗、切换页面、搜索资料、读取资料、生成草稿或提交待审批变更。",
        "可用 actions 格式：[{ kind, targetType, targetId, targetView, payload, requiresApproval }]。",
        "kind 可选：openModal、navigate、searchLore、readLore、generateDraft、proposeLoreChange、proposeChapterChange。",
        "targetType 可选：lore、chapter、relation、settings、context；targetId 使用资料或章节 id。",
        "你只能把 loreDetails 视为已读资料；loreIndex 只是资料目录，用来定位，不可当作完整正文事实。",
        "如需改资料或大纲，只返回 proposedChanges 或 requiresApproval=true 的 action，状态为“待审批”。",
        "输出 JSON：{ reply, actions, contextBundle, proposedChanges }。",
        "资料变更 patch.loreItem 可包含 fields 和 links；家族成员用 links.relationType=member。"
      ].join("\n")
    },
    {
      role: "user",
      content: JSON.stringify(
        {
          userMessage: body.message || "",
          view: body.view || "",
          chapter: body.chapter || null,
          loreIndex,
          loreDetails,
          selectedLore: body.selectedLore || null,
          proposedChanges: Array.isArray(body.proposedChanges) ? body.proposedChanges.slice(0, 8) : []
        },
        null,
        2
      )
    }
  ];
}

function normalizeDraftPayload(parsed, body) {
  return {
    reply: parsed.reply || "已生成章节草稿，并把资料变更放入待审批列表。",
    draft: parsed.draft || parsed.text || "",
    contextBundle: normalizeContextBundle(parsed.contextBundle || {}, body),
    proposedChanges: normalizeProposedChanges(parsed.proposedChanges || [])
  };
}

function normalizeContextBundle(contextBundle = {}, body = {}) {
  return {
    loreItemIds: toArray(contextBundle.loreItemIds),
    relationHints: toArray(contextBundle.relationHints),
    timelineRefs: toArray(contextBundle.timelineRefs),
    chapterId: contextBundle.chapterId || body.chapter?.id || ""
  };
}

function normalizeAIActions(actions) {
  const allowedKinds = new Set(["openModal", "navigate", "searchLore", "readLore", "generateDraft", "proposeLoreChange", "proposeChapterChange"]);
  const allowedTargets = new Set(["lore", "chapter", "relation", "settings", "context", "ai", "library", "outline", "graph"]);
  return toArray(actions)
    .slice(0, 6)
    .map((action, index) => {
      const kind = allowedKinds.has(action.kind) ? action.kind : "";
      return {
        id: action.id || `ai-action-${Date.now()}-${index}`,
        kind,
        targetType: allowedTargets.has(action.targetType) ? action.targetType : "",
        targetView: allowedTargets.has(action.targetView) ? action.targetView : "",
        targetId: String(action.targetId || action.id || "").slice(0, 80),
        payload: typeof action.payload === "object" && action.payload ? action.payload : {},
        requiresApproval: Boolean(action.requiresApproval || kind.startsWith("propose"))
      };
    })
    .filter(action => action.kind);
}

function normalizeProposedChanges(changes) {
  return toArray(changes).slice(0, 6).map((change, index) => ({
    id: change.id || `ai-change-${Date.now()}-${index}`,
    type: normalizeChangeType(change.type),
    title: String(change.title || "AI 提议资料变更").slice(0, 80),
    reason: String(change.reason || "AI 根据当前章节草稿提出。").slice(0, 260),
    impact: String(change.impact || "需要用户确认影响范围。").slice(0, 260),
    conflict: String(change.conflict || "未发现明显冲突，但需要人工复核。").slice(0, 260),
    status: "待审批",
    patch: typeof change.patch === "object" && change.patch ? change.patch : {}
  }));
}

function normalizeChangeType(type) {
  const value = String(type || "新增");
  return ["新增", "修改", "关联", "删除"].includes(value) ? value : "新增";
}

function parseJsonObject(content) {
  const text = String(content || "").trim();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { reply: text };
    try {
      return JSON.parse(match[0]);
    } catch {
      return { reply: text };
    }
  }
}

function toArray(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return String(value)
    .split(/[、,，\n]/)
    .map(item => item.trim())
    .filter(Boolean);
}

async function readJson(req) {
  let raw = "";
  for await (const chunk of req) raw += chunk;
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    const error = new Error("请求体不是有效 JSON。");
    error.status = 400;
    throw error;
  }
}

function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload, null, 2));
}

function serveStatic(pathname, res) {
  const cleanPath = decodeURIComponent(pathname === "/" ? "/index.html" : pathname);
  const requested = path.normalize(path.join(ROOT, cleanPath));
  if (!requested.startsWith(ROOT)) {
    sendJson(res, 403, { ok: false, error: "禁止访问该路径" });
    return;
  }

  fs.readFile(requested, (error, data) => {
    if (error) {
      sendJson(res, 404, { ok: false, error: "文件不存在" });
      return;
    }
    const ext = path.extname(requested).toLowerCase();
    res.writeHead(200, { "Content-Type": MIME_TYPES[ext] || "application/octet-stream" });
    res.end(data);
  });
}
