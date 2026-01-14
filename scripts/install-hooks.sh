#!/bin/bash
# Install git hooks for CLAUDE.md auto-update

HOOK_DIR="$(git rev-parse --git-dir)/hooks"

# Create post-commit hook
cat > "$HOOK_DIR/post-commit" << 'EOF'
#!/bin/bash
# Auto-analyze changes and suggest CLAUDE.md updates after commits

# Only run if ANTHROPIC_API_KEY is set
if [ -z "$ANTHROPIC_API_KEY" ]; then
  exit 0
fi

# Check if this commit modified significant files (not just CLAUDE.md)
CHANGED_FILES=$(git diff-tree --no-commit-id --name-only -r HEAD | grep -v "CLAUDE.md" | grep -v "package-lock.json")

if [ -z "$CHANGED_FILES" ]; then
  exit 0
fi

echo ""
echo "🔍 Analyzing changes for CLAUDE.md updates..."
echo "   Run 'npx ts-node scripts/update-claude-md.ts' to see suggestions"
EOF

chmod +x "$HOOK_DIR/post-commit"

echo "✅ Git hooks installed!"
echo ""
echo "The post-commit hook will remind you to update CLAUDE.md after significant commits."
echo ""
echo "To manually analyze and update, run:"
echo "  npx ts-node scripts/update-claude-md.ts"
echo ""
echo "To auto-apply updates:"
echo "  npx ts-node scripts/update-claude-md.ts --auto"
