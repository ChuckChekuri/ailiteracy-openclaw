"use strict";

var fs = require("fs");

var path = require("path");

var root = process.cwd();
var envPath = path.join(root, ".env");
var envExamplePath = path.join(root, ".env.example");
var workspacePath = path.join(root, "workspace");

function ensureDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, {
      recursive: true
    });
    console.log("[setup] Created directory: ".concat(path.relative(root, dirPath)));
  }
}

function ensureFile(filePath, content) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log("[setup] Created file: ".concat(path.relative(root, filePath)));
  }
}

if (fs.existsSync(envPath)) {
  console.log("[setup] .env already exists, leaving it unchanged.");
} else {
  if (!fs.existsSync(envExamplePath)) {
    console.error("[setup] Missing .env.example. Cannot create .env.");
    process.exit(1);
  }

  fs.copyFileSync(envExamplePath, envPath);
  console.log("[setup] Created .env from .env.example.");
}

ensureDirectory(workspacePath);
ensureFile(path.join(workspacePath, "IDENTITY.md"), "# Identity\n\nName: Teaching Assistant\nEmoji: :lobster:\n");
ensureFile(path.join(workspacePath, "AGENTS.md"), "# AGENTS\n\nDefine your agent behavior and collaboration style here.\n");
ensureFile(path.join(workspacePath, "SOUL.md"), "# SOUL\n\nDefine persona, voice, and reasoning preferences here.\n");