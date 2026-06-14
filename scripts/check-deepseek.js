const fs = require("fs");
const path = require("path");

loadEnvLocal();

const apiKey = process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "";
const baseUrl = (process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com").replace(/\/+$/, "");
const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

if (!apiKey) {
  console.error("DeepSeek API Key missing. Set DEEPSEEK_API_KEY in .env.local or your shell.");
  process.exit(2);
}

main().catch(error => {
  console.error(`DeepSeek check failed: ${error.message}`);
  process.exit(1);
});

async function main() {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "You are a connection test assistant. Reply with OK." },
        { role: "user", content: "Connection test." }
      ],
      stream: false,
      max_tokens: 32
    })
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${safeError(text)}`);
  }

  const data = JSON.parse(text);
  const content = data?.choices?.[0]?.message?.content || "";
  console.log(`DeepSeek connection OK. model=${model}, response=${content.slice(0, 80)}`);
}

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (!process.env[key]) process.env[key] = rest.join("=").trim().replace(/^["']|["']$/g, "");
  }
}

function safeError(text) {
  return String(text)
    .replace(/sk-[A-Za-z0-9_-]+/g, "sk-***")
    .replace(/Bearer\s+[A-Za-z0-9._-]+/gi, "Bearer ***")
    .slice(0, 400);
}
