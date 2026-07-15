#!/bin/sh
# Untrack previously committed build artifacts (run locally)
set -e
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git rm -r --cached docs || true
  git rm -r --cached dist || true
  git commit -m "chore: remove tracked build artifacts (docs/dist)" || true
  echo "Committed removal of tracked build artifacts. Push to remote with: git push origin main"
else
  echo "Not a git repo. Run this inside the repository root."
fi
