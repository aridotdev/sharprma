#!/usr/bin/env bash
set -euo pipefail

# Usage:
#   REMOTE_URL=git@... ./scripts/git-sync.sh [remote-name] [remote-branch] [local-branch] [--push]
# Defaults:
#   remote-name: upstream
#   remote-branch: main
#   local-branch: main

REMOTE_URL="${REMOTE_URL:-}"
REMOTE_NAME="${1:-upstream}"
REMOTE_BRANCH="${2:-main}"
LOCAL_BRANCH="${3:-main}"
DO_PUSH=false
if [ "${4:-}" = "--push" ] || [ "${5:-}" = "--push" ]; then DO_PUSH=true; fi

if [ -z "$REMOTE_URL" ]; then
  echo "ERROR: REMOTE_URL environment variable must be set (e.g. REMOTE_URL=git@... )"
  exit 1
fi

git remote add "$REMOTE_NAME" "$REMOTE_URL" 2>/dev/null || git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
git fetch "$REMOTE_NAME"

# create a timestamped backup of current local branch if it exists
if git show-ref --verify --quiet "refs/heads/$LOCAL_BRANCH"; then
  BACKUP="backup/$LOCAL_BRANCH-$(date +%s)"
  git branch "$BACKUP" "$LOCAL_BRANCH"
  echo "Created local backup branch: $BACKUP"
fi

git checkout -B "$LOCAL_BRANCH"

echo "Merging $REMOTE_NAME/$REMOTE_BRANCH into $LOCAL_BRANCH"
if ! git merge --no-ff --no-edit "$REMOTE_NAME/$REMOTE_BRANCH"; then
  echo "Merge resulted in conflicts. Resolve them manually, then commit."
  exit 2
fi

echo "Merge successful."
if [ "$DO_PUSH" = true ]; then
  echo "Pushing $LOCAL_BRANCH to $REMOTE_NAME"
  git push "$REMOTE_NAME" "$LOCAL_BRANCH"
fi

echo "Done."
