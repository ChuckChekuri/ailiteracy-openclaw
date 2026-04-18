import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`[setup] Created directory: ${path.relative(root, dirPath)}`);
  }
}

function ensureFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`[setup] Created file: ${path.relative(root, filePath)}`);
  }
}

// Ensure workspace directory exists
ensureDirectory(path.join(root, "workspace"));
ensureDirectory(path.join(root, "agents"));
ensureDirectory(path.join(root, "data", "raw"));
ensureDirectory(path.join(root, "data", "processed"));
ensureDirectory(path.join(root, "data", "outputs"));
ensureDirectory(path.join(root, "shared"));
ensureDirectory(path.join(root, "state"));

// Ensure .env exists from .env.example
const envExamplePath = path.join(root, ".env.example");
const envPath = path.join(root, ".env");

if (fs.existsSync(envPath)) {
  console.log("[setup] .env already exists, leaving it unchanged.");
} else if (fs.existsSync(envExamplePath)) {
  fs.copyFileSync(envExamplePath, envPath);
  console.log("[setup] Created .env from .env.example. Fill in your keys.");
} else {
  console.warn("[setup] No .env.example found. Create a .env file manually.");
}

console.log("[setup] Done. Run 'npx openclaw setup' next.");
