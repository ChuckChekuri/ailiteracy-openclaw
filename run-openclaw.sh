#!/bin/bash
export OPENCLAW_HOME="$(pwd)/state"
export OPENCLAW_CONFIG_PATH="$(pwd)/openclaw.json"

mkdir -p state workspace

npx openclaw "$@"
