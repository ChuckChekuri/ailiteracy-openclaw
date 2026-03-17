const fs = require("fs");
const path = require("path");

const requiredEnvVars = [
  "OPENAI_API_KEY",
  "DISCORD_TOKEN",
  "DISCORD_APP_ID",
  "DISCORD_GUILD_ID",
  "INFO_ANNOUNCEMENTS_CHANNEL_ID",
  "ACTIVE_TOPICS_CATEGORY_ID",
  "ARCHIVED_CATEGORY_ID",
];

const placeholderPatterns = [
  /^your_/i,
  /^replace/i,
  /^changeme/i,
  /^example/i,
  /^xxx+$/i,
  /^todo$/i,
  /^placeholder$/i,
  /^<.*>$/,
  /^\$\{.+\}$/,
];

function isObviousPlaceholder(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return true;
  return placeholderPatterns.some((pattern) => pattern.test(trimmed));
}

function parseDotEnv(content) {
  const env = {};
  const lines = content.split(/\r?\n/);

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const eqIndex = line.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = line.slice(0, eqIndex).trim();
    let value = line.slice(eqIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

function ensureDirectory(dirPath, errors) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`[check] Created missing directory: ${path.basename(dirPath)}/`);
    }
  } catch (error) {
    errors.push(`Unable to create directory ${dirPath}: ${error.message}`);
  }
}

function ensureFile(filePath, defaultContent, errors) {
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, defaultContent, "utf8");
      console.log(`[check] Created missing file: ${path.relative(process.cwd(), filePath)}`);
    }
  } catch (error) {
    errors.push(`Unable to create required file ${filePath}: ${error.message}`);
  }
}

function main() {
  const root = process.cwd();
  const errors = [];

  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) {
    errors.push("Missing .env file. Run `npm run setup` first, then fill in .env values.");
  }

  let env = {};
  if (fs.existsSync(envPath)) {
    try {
      env = parseDotEnv(fs.readFileSync(envPath, "utf8"));
    } catch (error) {
      errors.push(`Failed to read .env: ${error.message}`);
    }
  }

  for (const key of requiredEnvVars) {
    const value = env[key];
    if (value == null || String(value).trim() === "") {
      errors.push(`Missing required env var ${key} in .env.`);
      continue;
    }
    if (isObviousPlaceholder(value)) {
      errors.push(`Env var ${key} looks like a placeholder (${value}). Replace it with a real value.`);
    }
  }

  const configPath = path.join(root, "openclaw.json");
  if (!fs.existsSync(configPath)) {
    errors.push("Missing openclaw.json file in repository root.");
  } else {
    try {
      JSON.parse(fs.readFileSync(configPath, "utf8"));
    } catch (error) {
      errors.push(`openclaw.json is not valid JSON: ${error.message}`);
    }
  }

  const workspacePath = path.join(root, "workspace");
  ensureDirectory(workspacePath, errors);

  ensureFile(
    path.join(workspacePath, "IDENTITY.md"),
    "# Identity\n\nName: Carbon-Based Caleb\nEmoji: :lobster:\n",
    errors,
  );
  ensureFile(
    path.join(workspacePath, "AGENTS.md"),
    "# AGENTS\n\nDefine your agent behavior and collaboration style here.\n",
    errors,
  );
  ensureFile(
    path.join(workspacePath, "SOUL.md"),
    "# SOUL\n\nDefine persona, voice, and reasoning preferences here.\n",
    errors,
  );

  if (errors.length > 0) {
    console.error("\n[check] Setup validation failed:\n");
    for (const issue of errors) {
      console.error(`- ${issue}`);
    }
    console.error("\n[check] Fix the issues above, then run `npm run check` again.");
    process.exit(1);
  }

  console.log("[check] Setup validation passed.");
}

main();
