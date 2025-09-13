# Prettier Setup Guide

This document explains the Prettier configuration and usage in the Inventory Management System frontend.

## 📋 Overview

Prettier is configured to ensure consistent code formatting across the entire frontend codebase. It automatically formats JavaScript, TypeScript, JSON, CSS, and Markdown files.

## 🛠️ Configuration Files

### `.prettierrc`

Main Prettier configuration file with the following settings:

- **Semicolons**: Always use semicolons
- **Trailing Commas**: ES5 compatible trailing commas
- **Single Quotes**: Use single quotes for strings
- **Print Width**: 80 characters per line
- **Tab Width**: 2 spaces for indentation
- **Use Tabs**: false (use spaces)
- **Bracket Spacing**: true
- **Arrow Parens**: avoid when possible
- **End of Line**: LF (Unix style)

### `.prettierignore`

Excludes the following from formatting:

- `node_modules/`
- Build outputs (`.next/`, `out/`, `build/`, `dist/`)
- Environment files (`.env*`)
- Log files
- Cache directories
- Package lock files
- Generated files

### `.vscode/settings.json`

VS Code settings for automatic formatting:

- Format on save
- Format on paste
- Use Prettier as default formatter
- Auto-fix ESLint issues on save

## 📜 Available Scripts

```bash
# Format all files
npm run format

# Check if files are formatted (used in CI)
npm run format:check

# Format only staged files (used in pre-commit hook)
npm run format:staged

# Fix ESLint issues
npm run lint:fix
```

## 🔄 Pre-commit Hooks

The project uses Husky and lint-staged to automatically format files before commits:

1. **Husky**: Manages Git hooks
2. **lint-staged**: Runs Prettier and ESLint on staged files only
3. **Pre-commit hook**: Automatically formats and fixes code before each commit

### Setup Pre-commit Hooks

```bash
# Install dependencies
npm install

# Initialize Husky
npx husky init

# The pre-commit hook is already configured in .husky/pre-commit
```

## 🚀 CI/CD Integration

The frontend CI workflow includes Prettier checks:

```yaml
- name: Run Prettier check
  run: |
    cd frontend/inventory-management-system
    npm run format:check
```

**Note**: If Prettier check fails, the CI pipeline will fail, ensuring all code is properly formatted.

## 📝 Usage Examples

### Format a specific file

```bash
npx prettier --write src/components/MyComponent.tsx
```

### Check formatting without fixing

```bash
npx prettier --check src/components/MyComponent.tsx
```

### Format only TypeScript files

```bash
npx prettier --write "src/**/*.{ts,tsx}"
```

## 🎯 Benefits

1. **Consistency**: All code follows the same formatting rules
2. **Readability**: Clean, uniform code structure
3. **Team Collaboration**: No formatting conflicts in pull requests
4. **Automation**: Automatic formatting on save and commit
5. **CI Integration**: Prevents unformatted code from being merged

## 🔧 Troubleshooting

### VS Code Not Formatting on Save

1. Install the Prettier VS Code extension
2. Ensure `.vscode/settings.json` is in the project root
3. Check that Prettier is set as the default formatter

### Pre-commit Hook Not Working

1. Ensure Husky is installed: `npm install husky --save-dev`
2. Initialize Husky: `npx husky init`
3. Make the pre-commit hook executable: `chmod +x .husky/pre-commit`

### CI Failing Due to Formatting

1. Run `npm run format` locally
2. Commit the formatted files
3. Push the changes

## 📊 Current Status

✅ **All 135 files** have been formatted with Prettier
✅ **CI integration** is active
✅ **Pre-commit hooks** are configured
✅ **VS Code settings** are optimized

## 🔄 Maintenance

- **Regular Updates**: Keep Prettier updated to the latest version
- **Rule Changes**: Update `.prettierrc` if formatting rules need to change
- **Ignore Updates**: Add new patterns to `.prettierignore` as needed
- **Team Sync**: Ensure all team members have the same VS Code settings
