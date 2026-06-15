const originalFetch = global.fetch;

if (typeof originalFetch === "function") {
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

require("./server");

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
    return JSON.stringify({ error: { message: String(message).slice(0, 800), status } });
  } catch {
    return JSON.stringify({ error: { message: String(text || `DeepSeek request failed: ${status}`).slice(0, 800), status } });
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
