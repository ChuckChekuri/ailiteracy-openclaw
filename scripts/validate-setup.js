import fs from "node:fs";
import path from "node:path";

const requiredEnvVars = [
  "OPENROUTER_API_KEY",
  "DISCORD_GUILD_ID",
  "INFO_ANNOUNCEMENTS_CHANNEL_ID",
  "ACTIVE_TOPICS_CHANNEL_ID",
  "OPENCLAW_CONFIG_PATH",
  "OPENCLAW_STATE_DIR"
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

function main() {
  const root = process.cwd();
  const errors = [];

  // Check required directories
  for (const dir of ["workspace", "agents", "shared"]) {
    const dirPath = path.join(root, dir);
    if (!fs.existsSync(dirPath)) {
      errors.push(`Missing required directory: ${dir}. Run \`npm run setup\`.`);
    }
  }

  // Check required files
  const requiredFiles = [
    "openclaw.json",
    "workspace/AGENTS.md",
    "workspace/IDENTITY.md",
    "workspace/SOUL.md",
    "shared/schema.json",
  ];

  for (const file of requiredFiles) {
    if (!fs.existsSync(path.join(root, file))) {
      errors.push(`Missing required file: ${file}.`);
    }
  }

  // Check that at least one agent definition exists
  const agentsDir = path.join(root, "agents");
  if (fs.existsSync(agentsDir)) {
    const agents = fs.readdirSync(agentsDir).filter((f) => f.endsWith(".md"));
    if (agents.length === 0) {
      errors.push("No agent definition files found in agents/.");
    }
  }

  // Validate .env
  const envPath = path.join(root, ".env");
  if (fs.existsSync(envPath)) {
    let env = {};
    try {
      env = parseDotEnv(fs.readFileSync(envPath, "utf8"));
    } catch (error) {
      errors.push(`Failed to read .env: ${error.message}`);
    }

    for (const key of requiredEnvVars) {
      const value = env[key];
      if (value == null || String(value).trim() === "") {
        errors.push(`Missing required env var ${key} in .env.`);
        continue;
      }
      if (isObviousPlaceholder(value)) {
        errors.push(`Env var ${key} in .env looks like a placeholder (${value}). Replace it with a real value.`);
      }
    }
  } else {
    errors.push("Missing .env file. Copy .env.example to .env and fill in your keys.");
  }

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
