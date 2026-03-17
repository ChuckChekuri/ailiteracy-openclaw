#!/bin/bash
export OPENCLAW_HOME="$(pwd)"
export OPENCLAW_CONFIG_PATH="$(pwd)/openclaw.json"

mkdir -p workspace

if [ "$#" -eq 0 ]; then
	npx openclaw gateway
else
	npx openclaw "$@"
fi
