#!/bin/bash

# Push to all remotes
# This ensures changes are synchronized to both GitHub and Gitea

BRANCH=$(git branch --show-current)

echo "🚀 Pushing branch '$BRANCH' to all remotes..."

# Push to GitHub
echo "📤 Pushing to GitHub..."
git push github $BRANCH
GITHUB_EXIT=$?

# Push to Gitea
echo "📤 Pushing to Gitea..."
git push gitea $BRANCH
GITEA_EXIT=$?

# Also push main as master to gitea for compatibility
if [ "$BRANCH" = "main" ]; then
    echo "📤 Pushing main as master to Gitea..."
    git push gitea main:master
fi

# Summary
echo ""
echo "✅ Push Summary:"
if [ $GITHUB_EXIT -eq 0 ]; then
    echo "  ✓ GitHub: Success"
else
    echo "  ✗ GitHub: Failed (exit code: $GITHUB_EXIT)"
fi

if [ $GITEA_EXIT -eq 0 ]; then
    echo "  ✓ Gitea: Success"
else
    echo "  ✗ Gitea: Failed (exit code: $GITEA_EXIT)"
fi

# Exit with error if either push failed
if [ $GITHUB_EXIT -ne 0 ] || [ $GITEA_EXIT -ne 0 ]; then
    exit 1
fi