# GitHub Repository Setup Instructions

**IMPORTANT**: Never share your GitHub personal access token publicly. Please revoke the token you just shared and create a new one.

## Steps to configure your repository:

1. **Revoke the exposed token immediately**:
   - Go to https://github.com/settings/tokens
   - Find the token you just shared and click "Delete"

2. **Create a new token**:
   - Go to https://github.com/settings/tokens/new
   - Select scopes: `repo` (full control of private repositories)
   - Generate token and copy it

3. **Run the setup script**:
   ```bash
   cd /home/bryan/dev/word-mastermind
   export GITHUB_TOKEN=your_new_token_here
   ./setup-github-repo.sh
   ```

## Alternative: Manual Setup

If you prefer to set up manually:

1. Go to https://github.com/Cache8063/words/settings
2. Change default branch from `master` to `main`
3. Go to Settings → Branches → Add rule
4. Configure protection rules as described in CONTRIBUTING.md

## Security Note

Your personal access token provides full access to your repositories. Always:
- Keep it secret
- Never commit it to code
- Revoke it if exposed
- Use environment variables or secure vaults2