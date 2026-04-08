#!/usr/bin/env node
/**
 * Test access to qwen3-14b-edu-clean on Tailscale node 100.75.219.24
 * Assumes an OpenAI-compatible API (e.g. Ollama, vLLM, llama.cpp server).
 */

const BASE_URL = process.env.LLM_BASE_URL || "http://100.75.219.24:11434";
const MODEL = process.env.LLM_MODEL || "qwen3-14b-edu-clean";

async function jsonFetch(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  console.log(`→ ${options.method || "GET"} ${url}`);
  const res = await fetch(url, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  return res.json();
}

// 1. Health / connectivity check
async function checkHealth() {
  console.log("\n=== 1. Health check ===");
  try {
    const res = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    console.log(`✓ Server responded (status ${res.status})`);
  } catch (err) {
    throw new Error(`Cannot reach server at ${BASE_URL}: ${err.message}`);
  }
}

// 2. List available models
async function listModels() {
  console.log("\n=== 2. List models ===");
  try {
    // Try OpenAI-compatible endpoint first
    const data = await jsonFetch("/v1/models");
    const names = (data.data || []).map((m) => m.id);
    console.log("Available models:", names.join(", ") || "(none)");
    return names;
  } catch {
    // Fallback: Ollama-style endpoint
    try {
      const data = await jsonFetch("/api/tags");
      const names = (data.models || []).map((m) => m.name);
      console.log("Available models (Ollama):", names.join(", ") || "(none)");
      return names;
    } catch (err) {
      console.log("⚠ Could not list models:", err.message);
      return [];
    }
  }
}

// 3. Send a test chat completion
async function testChat() {
  console.log("\n=== 3. Chat completion test ===");
  console.log(`Model: ${MODEL}`);

  // Try OpenAI-compatible endpoint
  try {
    const data = await jsonFetch("/v1/chat/completions", {
      method: "POST",
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "What does the first chapter of Russell & Norvig's 'Artificial Intelligence: A Modern Approach' say about AI? Summarize the key points in a few paragraphs." }],
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    const reply = data.choices?.[0]?.message?.content;
    console.log("✓ Response:", reply);
    return;
  } catch (err) {
    console.log("OpenAI endpoint failed, trying Ollama endpoint…", err.message);
  }

  // Fallback: Ollama /api/chat
  try {
    const data = await jsonFetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "What does the first chapter of Russell & Norvig's 'Artificial Intelligence: A Modern Approach' say about AI? Summarize the key points in a few paragraphs." }],
        stream: false,
      }),
    });

    const reply = data.message?.content;
    console.log("✓ Response:", reply);
  } catch (err) {
    throw new Error(`Chat completion failed: ${err.message}`);
  }
}

// Run all checks
(async () => {
  console.log(`Testing LLM access: ${BASE_URL}  model=${MODEL}`);
  try {
    await checkHealth();
    await listModels();
    await testChat();
    console.log("\n✅ All checks passed.");
  } catch (err) {
    console.error("\n❌ Test failed:", err.message);
    process.exit(1);
  }
})();
