#!/bin/bash

# Review latest commit by default, or specific commit if provided
COMMIT=${1:-HEAD}

echo "Reviewing commit: $(git log -1 --pretty=format:'%h - %s' $COMMIT)"
echo ""

git show "$COMMIT" --no-color | claude -p \
  --append-system-prompt "You are an expert code reviewer. Analyze for:
1. Security vulnerabilities
2. Performance issues
3. Code quality and maintainability
4. Potential bugs
5. Test coverage gaps

Provide specific, actionable feedback with line references." \
  --output-format text
