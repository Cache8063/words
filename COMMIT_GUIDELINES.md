# Commit Guidelines

## Commit Message Format

All commits should follow the Conventional Commits format without emojis:

```
<type>: <description>

[optional body]

[optional footer(s)]
```

## Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation only changes
- **style**: Code style changes (formatting, missing semicolons, etc.)
- **refactor**: Code refactoring without changing functionality
- **test**: Adding or updating tests
- **chore**: Maintenance tasks, dependency updates

## Rules

1. **No emojis** in commit messages
2. **Use imperative mood** in the subject line ("add" not "added")
3. **Keep subject line under 72 characters**
4. **Separate subject from body with blank line**
5. **Use body to explain what and why, not how**
6. **Reference issues and PRs in footer**

## Examples

### Good
```
feat: add user authentication with ATProto

- Implement login/logout endpoints
- Add session management
- Create auth UI components

Closes #42
```

### Bad
```
🚀 Added awesome auth features!!! 🔐
```

## Git Workflow

1. **Stage specific files**:
   ```bash
   git add src/specific-file.js
   git add assets/style.css
   ```

2. **Review staged changes**:
   ```bash
   git status
   git diff --staged
   ```

3. **Commit with message**:
   ```bash
   git commit -m "type: concise description"
   ```

4. **For longer messages**:
   ```bash
   git commit
   # Opens editor for detailed message
   ```

## Pre-commit Checklist

- [ ] Tests pass (`npm test`)
- [ ] No console.log statements
- [ ] Code follows project style
- [ ] Commit message follows format
- [ ] Only related changes in commit