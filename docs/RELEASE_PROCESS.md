# Release Process

This document describes the automated release process for the Pragmatic Rhino SUIT VS Code extension.

## Overview

The release process is fully automated through GitHub Actions and consists of the following steps:

1. **Tag Creation** - Developer creates a version tag
2. **Automated Build** - CI/CD builds, tests, and packages the extension
3. **GitHub Release** - Creates a GitHub release with VSIX attachment
4. **Marketplace Publishing** - Optionally publishes to VS Code Marketplace

## Release Workflow

### 1. Prepare for Release

Before creating a release, ensure:

- [ ] All features are complete and tested
- [ ] Version number in `package.json` matches the intended release
- [ ] `CHANGELOG.md` is updated with release notes
- [ ] All tests pass locally: `npm test`
- [ ] Code coverage meets 80% threshold
- [ ] No linting errors: `npm run lint`

### 2. Create Release Tag

Create and push a version tag following semantic versioning:

```bash
# Update version in package.json (if needed)
npm version patch  # or minor, major

# Create and push tag
git tag v1.2.3
git push origin v1.2.3
```

**Tag Format:** `v{MAJOR}.{MINOR}.{PATCH}` (e.g., `v1.2.3`)

### 3. Automated Release Process

Once the tag is pushed, the release workflow automatically:

#### Build & Test Phase
- ✅ Validates tag format (semantic versioning)
- ✅ Checks out the tagged commit
- ✅ Installs dependencies and compiles TypeScript
- ✅ Runs ESLint and all tests
- ✅ Verifies code coverage meets 80% threshold

#### Package Phase
- 📦 Creates VSIX package using `vsce package`
- 🔍 Validates VSIX structure and metadata
- ⬆️ Uploads VSIX as GitHub artifact (90-day retention)

#### Release Phase
- 📝 Generates release notes from changelog
- 🚀 Creates GitHub release with VSIX attachment
- 🏷️ Marks pre-releases for versions with `-` (e.g., `v1.2.3-beta.1`)

#### Marketplace Phase (Optional)
- 🌐 Publishes to VS Code Marketplace (if `VSCE_PAT` secret configured)
- ⏳ Waits for marketplace processing
- ✅ Verifies extension is live on marketplace
- 📝 Updates release with marketplace information

## Configuration Requirements

### Required Secrets

| Secret | Purpose | Required |
|--------|---------|----------|
| `GITHUB_TOKEN` | Create releases, upload assets | ✅ Auto-provided |
| `VSCE_PAT` | Publish to VS Code Marketplace | ⚠️ Optional |

### Setting up VSCE_PAT

To enable marketplace publishing:

1. **Create Azure DevOps PAT:**
   - Go to [Azure DevOps](https://dev.azure.com)
   - User Settings → Personal Access Tokens
   - Create new token with **Marketplace (Publish)** scope
   - Copy the token value

2. **Add GitHub Secret:**
   - Go to repository Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `VSCE_PAT`
   - Value: Your Azure DevOps PAT
   - Click "Add secret"

## Release Types

### Stable Release
- **Tag Format:** `v1.2.3`
- **Behavior:** 
  - Creates public GitHub release
  - Publishes to VS Code Marketplace (if configured)
  - Sends success notifications

### Pre-release
- **Tag Format:** `v1.2.3-beta.1`, `v1.2.3-alpha.1`, `v1.2.3-rc.1`
- **Behavior:**
  - Creates GitHub pre-release
  - **Does NOT** publish to marketplace
  - Available for testing via GitHub release download

## Manual Installation

### From GitHub Release
```bash
# Download VSIX from release page, then:
code --install-extension pragmatic-rhino-suit-1.2.3.vsix
```

### From VS Code Marketplace
```bash
# If published to marketplace:
code --install-extension pragmatic-rhino.pragmatic-rhino-suit
```

## Monitoring & Verification

### Workflow Status
- Monitor workflow progress: [Actions tab](../../actions)
- Check workflow summaries for detailed results
- Review logs if any step fails

### Release Verification
The workflow automatically verifies:
- ✅ VSIX package structure and metadata
- ✅ File integrity (ZIP validation)
- ✅ Marketplace availability (if published)
- ✅ Version consistency across components

### Metrics Collected
- 📊 Deployment duration
- 📦 Package size
- 🔄 Retry attempts (if any)
- ✅ Success/failure rates

## Troubleshooting

### Common Issues

#### Invalid Tag Format
```
❌ Invalid semantic version format: 1.2.3
Expected format: MAJOR.MINOR.PATCH (e.g., 1.2.3)
```
**Solution:** Use `v` prefix: `git tag v1.2.3`

#### Coverage Below Threshold
```
❌ Coverage below threshold: 75% (minimum: 80%)
```
**Solution:** Add more tests to reach 80% coverage

#### VSIX Validation Failed
```
❌ VSIX validation failed
```
**Solution:** Check `package.json` metadata and file structure

#### Marketplace Publishing Failed
```
❌ Failed to publish after 3 attempts
```
**Solutions:**
- Verify `VSCE_PAT` secret is valid
- Check if version already exists on marketplace
- Review marketplace service status

### Recovery Actions

#### Failed Release
1. Fix the underlying issue
2. Delete the failed tag: `git tag -d v1.2.3 && git push origin :refs/tags/v1.2.3`
3. Create new tag with same or incremented version

#### Marketplace Publishing Failed
1. Release was created successfully (VSIX available on GitHub)
2. Manually publish: `vsce publish --packagePath pragmatic-rhino-suit-1.2.3.vsix`
3. Or wait and retry with next version

## Rollback Process

If a release needs to be rolled back:

1. **GitHub Release:** Mark as pre-release or delete
2. **Marketplace:** Use the rollback workflow (if available)
3. **Users:** Will need to manually downgrade

See [rollback workflow](../.github/workflows/rollback.yml) for automated rollback options.

## Best Practices

### Version Management
- Follow [Semantic Versioning](https://semver.org/)
- Update `CHANGELOG.md` before each release
- Test pre-releases before stable releases

### Quality Gates
- Maintain 80%+ code coverage
- Fix all linting errors before release
- Test extension functionality manually

### Release Cadence
- **Patch releases:** Bug fixes, small improvements
- **Minor releases:** New features, non-breaking changes  
- **Major releases:** Breaking changes, major features

### Communication
- Use clear, descriptive release notes
- Announce major releases to users
- Monitor feedback and issues post-release

## Workflow Files

| File | Purpose |
|------|---------|
| [`.github/workflows/release.yml`](../.github/workflows/release.yml) | Main release workflow |
| [`.github/workflows/build.yml`](../.github/workflows/build.yml) | Build and test validation |
| [`.github/workflows/package.yml`](../.github/workflows/package.yml) | Legacy package workflow |
| [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml) | Legacy deploy workflow |

## Support

For issues with the release process:

1. Check [workflow logs](../../actions) for error details
2. Review this documentation for common solutions
3. Create an issue with workflow run details
4. Contact the development team for assistance

---

**Next Steps After Reading:**
1. Ensure `VSCE_PAT` secret is configured (if marketplace publishing desired)
2. Test the release process with a pre-release version
3. Monitor the first few releases to ensure everything works correctly