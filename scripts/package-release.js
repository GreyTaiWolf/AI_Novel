const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIST_DIR = path.join(ROOT, "dist");

main();

function main() {
  ensureGitRepository();
  fs.mkdirSync(DIST_DIR, { recursive: true });

  const branch = safeName(runGit(["rev-parse", "--abbrev-ref", "HEAD"]) || "package");
  const sha = (runGit(["rev-parse", "--short", "HEAD"]) || "unknown").trim();
  const outputName = `AI_Novel-${branch}-${sha}.zip`;
  const outputPath = path.join(DIST_DIR, outputName);

  if (fs.existsSync(outputPath)) fs.rmSync(outputPath);

  runGit(["archive", "--format=zip", `--output=${outputPath}`, "HEAD"]);

  const sizeKb = Math.round(fs.statSync(outputPath).size / 1024);
  console.log(`Package created: ${path.relative(ROOT, outputPath)} (${sizeKb} KB)`);
  console.log("This archive contains tracked project files only. Local secrets such as .env.local are not included.");
}

function ensureGitRepository() {
  try {
    runGit(["rev-parse", "--is-inside-work-tree"]);
  } catch (error) {
    console.error("This packaging command must be run inside a cloned Git repository.");
    process.exit(1);
  }
}

function runGit(args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function safeName(value) {
  return String(value || "package")
    .trim()
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "") || "package";
}
