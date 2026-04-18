#!/usr/bin/env bash
# Source this file to export .env variables into the current shell session:
#   source ./setenv.sh   (or)   . ./setenv.sh
#
# Do NOT run it directly (./setenv.sh) — that spawns a subshell and variables
# will not persist in your current terminal.

# Resolve .env relative to this script's location, even when sourced
if [ -n "${BASH_SOURCE[0]}" ]; then
  ENV_FILE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.env"
else
  ENV_FILE="$(pwd)/.env"
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Error: .env file not found at $ENV_FILE" >&2
  return 1 2>/dev/null || exit 1
fi

set -o allexport
# shellcheck source=.env
source "$ENV_FILE"
set +o allexport

echo "Environment variables loaded from $ENV_FILE"
