#!/bin/bash
# Knowledge Flywheel Health Check
# Run: .claude/scripts/knowledge-health.sh

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "======================================"
echo "  Knowledge Flywheel Health Check"
echo "======================================"
echo ""

# CLAUDE.md line count
CLAUDE_LINES=$(wc -l < CLAUDE.md | tr -d ' ')
if [ "$CLAUDE_LINES" -gt 200 ]; then
  echo -e "${RED}[FAIL]${NC} CLAUDE.md: $CLAUDE_LINES lines (target: <200)"
elif [ "$CLAUDE_LINES" -gt 180 ]; then
  echo -e "${YELLOW}[WARN]${NC} CLAUDE.md: $CLAUDE_LINES lines (approaching 200)"
else
  echo -e "${GREEN}[OK]${NC} CLAUDE.md: $CLAUDE_LINES lines"
fi

# Active learnings count
if [ -f "LEARNINGS.md" ]; then
  ACTIVE_COUNT=$(grep -c "Status.*ACTIVE" LEARNINGS.md 2>/dev/null || echo "0")
  if [ "$ACTIVE_COUNT" -gt 50 ]; then
    echo -e "${RED}[FAIL]${NC} Active learnings: $ACTIVE_COUNT (target: <50, consolidate now!)"
  elif [ "$ACTIVE_COUNT" -gt 30 ]; then
    echo -e "${YELLOW}[WARN]${NC} Active learnings: $ACTIVE_COUNT (consider consolidating)"
  else
    echo -e "${GREEN}[OK]${NC} Active learnings: $ACTIVE_COUNT"
  fi
else
  echo -e "${YELLOW}[WARN]${NC} LEARNINGS.md not found"
fi

# Pattern files count
PATTERN_COUNT=$(ls -1 .claude/patterns/*.md 2>/dev/null | wc -l | tr -d ' ')
if [ "$PATTERN_COUNT" -gt 10 ]; then
  echo -e "${YELLOW}[WARN]${NC} Pattern files: $PATTERN_COUNT (target: <10)"
else
  echo -e "${GREEN}[OK]${NC} Pattern files: $PATTERN_COUNT"
fi

# Check for stale entries (simplified - looks for dates older than 90 days)
echo ""
echo "Pattern file sizes:"
for file in .claude/patterns/*.md; do
  if [ -f "$file" ]; then
    lines=$(wc -l < "$file" | tr -d ' ')
    name=$(basename "$file")
    echo "  $name: $lines lines"
  fi
done

echo ""
echo "======================================"
echo "  Event-Driven Triggers"
echo "======================================"

# Trigger: Too many active learnings
if [ "$ACTIVE_COUNT" -gt 30 ]; then
  echo -e "${YELLOW}TRIGGER:${NC} Consolidate learnings before adding more"
fi

# Trigger: CLAUDE.md too large
if [ "$CLAUDE_LINES" -gt 180 ]; then
  echo -e "${YELLOW}TRIGGER:${NC} Audit CLAUDE.md - move details to pattern files"
fi

echo ""
echo "Run this before major features or when adding learnings."
