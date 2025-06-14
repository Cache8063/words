# Contributing to Words

Thank you for your interest in contributing to Words! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Branching Strategy](#branching-strategy)
- [Development Workflow](#development-workflow)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)
- [Style Guidelines](#style-guidelines)

## Code of Conduct

This project adheres to a code of conduct. By participating, you are expected to:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Branching Strategy

We use a tiered branching model:

### Main Branches

- **`main`** - Production-ready code. Protected branch requiring PR reviews.
- **`staging`** - Pre-production testing. Integration tests run here.
- **`develop`** - Active development branch. All features merge here first.

### Supporting Branches

- **Feature branches** (`feature/issue-number-description`)
  - Branch from: `develop`
  - Merge to: `develop`
  - Example: `feature/123-add-french-dictionary`

- **Bugfix branches** (`bugfix/issue-number-description`)
  - Branch from: `develop`
  - Merge to: `develop`
  - Example: `bugfix/456-fix-keyboard-layout`

- **Hotfix branches** (`hotfix/issue-number-description`)
  - Branch from: `main`
  - Merge to: `main` AND `develop`
  - Example: `hotfix/789-critical-security-fix`

- **Release branches** (`release/version`)
  - Branch from: `develop`
  - Merge to: `main` AND `develop`
  - Example: `release/v1.2.0`

## Development Workflow

1. **Setup your environment**
   ```bash
   git clone https://github.com/Cache8063/words.git
   cd words
   npm install
   cp .env.example .env
   ```

2. **Create a feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/issue-number-description
   ```

3. **Make your changes**
   - Write clean, readable code
   - Add tests for new functionality
   - Update documentation as needed

4. **Test your changes**
   ```bash
   npm test
   npm run test:watch  # For TDD
   ```

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/issue-number-description
   ```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, semicolons, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **build**: Build system or external dependencies
- **ci**: CI/CD configuration
- **chore**: Other changes that don't modify src or test files

### Examples
```
feat: add Swedish dictionary support

- Add sv-se-5 dictionary with 1,200+ words
- Update dictionary selector UI
- Add Swedish language tests

Closes #123
```

```
fix: correct keyboard input on mobile devices

Fixes issue where special characters were not registering
on iOS devices.

Fixes #456
```

## Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new functionality
   - Follow code style guidelines

2. **PR Title:**
   - Use conventional commit format
   - Reference issue number if applicable

3. **PR Description:**
   - Describe what changes were made and why
   - Include screenshots for UI changes
   - List any breaking changes
   - Note any deployment considerations

4. **Review Process:**
   - At least 1 reviewer for `develop` branch
   - At least 2 reviewers for `staging` branch
   - Admin approval required for `main` branch

5. **After approval:**
   - Squash and merge for feature branches
   - Regular merge for release/hotfix branches

## Testing Guidelines

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests
- Place test files next to the code they test
- Name test files with `.spec.js` extension
- Write descriptive test names
- Test both success and failure cases
- Aim for >80% code coverage

### Test Structure
```javascript
describe('FeatureName', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe('expected');
    });
  });
});
```

## Style Guidelines

### JavaScript
- Use ES6+ features
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable names
- Add JSDoc comments for functions
- Keep functions small and focused

### CSS
- Use CSS custom properties for theming
- Follow mobile-first approach
- Use semantic class names
- Group related properties
- Comment complex selectors

### Vue.js
- Use single-file components when possible
- Follow Vue.js style guide
- Use descriptive component names
- Keep components focused and reusable

## Environment Setup

### Required Tools
- Node.js >= 18
- npm or yarn
- Git
- Docker (optional)

### Environment Variables
Copy `.env.example` to `.env` and configure:
- `PORT` - Server port (default: 3333)
- `NODE_ENV` - Environment (development/staging/production)
- `DEBUG` - Enable debug logging
- `LOG_LEVEL` - Logging level

## Getting Help

- **Issues**: Report bugs or request features via [GitHub Issues](https://github.com/Cache8063/words/issues)
- **Discussions**: Ask questions in [GitHub Discussions](https://github.com/Cache8063/words/discussions)
- **Documentation**: Check the README and wiki for more information

## Release Process

1. Create release branch from `develop`
2. Bump version in `package.json`
3. Update CHANGELOG.md
4. Create PR to `main`
5. After merge, tag the release
6. Deploy to production

Thank you for contributing to Words!