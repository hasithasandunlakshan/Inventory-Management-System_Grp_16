# Branch Naming Convention

## Branch Types

### Feature Branches
```
feature/feature-name
feature/user-authentication
feature/inventory-tracking
```

### Bug Fix Branches
```
bugfix/bug-description
bugfix/login-validation-error
bugfix/stock-count-display-issue
```

### Hotfix Branches
```
hotfix/critical-issue-description
hotfix/security-vulnerability-fix
hotfix/urgent-production-bug
```

### Release Branches
```
release/version-number
release/v1.2.0
release/v2.0.0-beta
```

## Branch Lifecycle

1. **Create** branch from `main`
2. **Develop** feature/fix
3. **Create** Pull Request
4. **Review** and approve
5. **Merge** to `main`
6. **Auto-delete** branch (configured in GitHub)

## Best Practices

- ✅ Use descriptive names
- ✅ Use lowercase with hyphens
- ✅ Keep branches short-lived (max 2-3 weeks)
- ✅ Delete branches after merging
- ❌ Don't use generic names like `update` or `fix`
- ❌ Don't commit directly to `main`

## Example Workflow

```bash
# Create feature branch
git checkout -b feature/user-dashboard

# Develop and commit
git add .
git commit -m "feat: add user dashboard with analytics"

# Push and create PR
git push origin feature/user-dashboard

# After merge, branch is automatically deleted
# Clean up local references
git checkout main
git pull origin main
git branch -d feature/user-dashboard
```
