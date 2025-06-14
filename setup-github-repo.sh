#!/bin/bash

# Script to configure GitHub repository settings
# Requires: GITHUB_TOKEN environment variable with repo permissions

REPO="Cache8063/words"
API_BASE="https://api.github.com"

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo "Error: GITHUB_TOKEN environment variable not set"
    echo "Please set: export GITHUB_TOKEN=your_personal_access_token"
    exit 1
fi

echo "🔧 Configuring GitHub repository settings for $REPO..."

# 1. Update default branch to main
echo "📌 Setting default branch to 'main'..."
curl -X PATCH \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "$API_BASE/repos/$REPO" \
  -d '{"default_branch":"main"}'

# 2. Create branch protection rule for main
echo "🔒 Setting up branch protection for 'main'..."
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "$API_BASE/repos/$REPO/branches/main/protection" \
  -d '{
    "required_status_checks": {
      "strict": true,
      "contexts": ["build-and-push"]
    },
    "enforce_admins": true,
    "required_pull_request_reviews": {
      "dismissal_restrictions": {},
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false,
      "required_approving_review_count": 2
    },
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'

# 3. Create branch protection rule for staging
echo "🔒 Setting up branch protection for 'staging'..."
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "$API_BASE/repos/$REPO/branches/staging/protection" \
  -d '{
    "required_status_checks": {
      "strict": false,
      "contexts": ["build-and-push"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": {
      "dismissal_restrictions": {},
      "dismiss_stale_reviews": true,
      "require_code_owner_reviews": false,
      "required_approving_review_count": 1
    },
    "restrictions": null,
    "allow_force_pushes": true,
    "allow_deletions": false
  }'

# 4. Create branch protection rule for develop
echo "🔒 Setting up branch protection for 'develop'..."
curl -X PUT \
  -H "Authorization: token $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  "$API_BASE/repos/$REPO/branches/develop/protection" \
  -d '{
    "required_status_checks": {
      "strict": false,
      "contexts": ["test"]
    },
    "enforce_admins": false,
    "required_pull_request_reviews": null,
    "restrictions": null,
    "allow_force_pushes": false,
    "allow_deletions": false
  }'

# 5. Delete master branch (optional, uncomment if desired)
# echo "🗑️ Deleting old 'master' branch..."
# curl -X DELETE \
#   -H "Authorization: token $GITHUB_TOKEN" \
#   -H "Accept: application/vnd.github.v3+json" \
#   "$API_BASE/repos/$REPO/git/refs/heads/master"

echo "✅ GitHub repository configuration complete!"
echo ""
echo "Next steps:"
echo "1. Verify settings at https://github.com/$REPO/settings"
echo "2. Update any webhooks or integrations pointing to 'master'"
echo "3. Notify team members of the branch name change"