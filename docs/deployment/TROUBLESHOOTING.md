# Troubleshooting Guide: GitHub Actions CI/CD Pipeline

## Overview

This comprehensive troubleshooting guide provides solutions for common issues encountered in the GitHub Actions CI/CD pipeline for the Pragmatic Rhino SUIT VS Code extension. It covers build failures, deployment issues, workflow problems, and debugging techniques.

**Target Audience:** Developers, DevOps engineers, repository maintainers

**Related Documentation:**
- [RUNBOOK.md](./RUNBOOK.md) - Deployment procedures
- [MANUAL_TRIGGERS.md](./MANUAL_TRIGGERS.md) - Manual workflow triggers
- [SECRETS.md](./SECRETS.md) - Secrets configuration

---

## Table of Contents

1. [Build Workflow Issues](#build-workflow-issues)
2. [PR Quality Gate Failures](#pr-quality-gate-failures)
3. [Version Workflow Problems](#version-workflow-problems)
4. [Package Workflow Issues](#package-workflow-issues)
5. [Deployment Failures](#deployment-failures)
6. [Rollback Issues](#rollback-issues)
7. [Authentication Problems](#authentication-problems)
8. [Artifact Management Issues](#artifact-management-issues)
9. [Marketplace Issues](#marketplace-issues)
10. [Performance Problems](#performance-problems)
11. [Debugging Techniques](#debugging-techniques)
12. [Emergency Procedures](#emergency-procedures)

---

## Build Workflow Issues

### Issue: TypeScript Compilation Errors

**Symptoms:**
- Build workflow fails at compile step
- Error messages about type mismatches or missing types
- "Cannot find module" errors
- "Property does not exist on type" errors

**Common Causes:**
- Missing or outdated dependencies
- Type definition files not installed
- TypeScript version mismatch
- Incorrect tsconfig.json configuration

**Resolution Steps:**

1. **Update Dependencies:**
   ```bash
   # Clean install dependencies
   rm -rf node_modules package-lock.json
   npm install
   
   # Verify TypeScript version
   npx tsc --version
   ```

2. **Check Type Definitions:**
   ```bash
   # Install missing type definitions
   npm install --save-dev @types/node @types/vscode
   
   # Verify types installed
   npm list @types/node @types/vscode
   ```

3. **Validate tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "module": "commonjs",
       "target": "ES2020",
       "lib": ["ES2020"],
       "sourceMap": true,
       "rootDir": "src",
       "outDir": "out",
       "strict": true
     }
   }
   ```

4. **Run Local Compilation:**
   ```bash
   # Compile with verbose output
   npx tsc --noEmit --listFiles
   
   # Check for specific errors
   npx tsc --noEmit
   ```

**Prevention:**
- Run `npm run compile` before committing
- Enable TypeScript checking in your IDE
- Use pre-commit hooks to validate compilation
- Keep dependencies up to date

**Related Issues:**
- Missing type definitions → Install @types packages
- Version conflicts → Check package.json for compatible versions
- Path resolution issues → Verify tsconfig paths configuration

---

### Issue: Test Failures in CI

**Symptoms:**
- Tests pass locally but fail in GitHub Actions
- Intermittent test failures
- Timeout errors in test execution
- "Cannot find module" errors during tests

**Common Causes:**
- Environment differences (local vs CI)
- Race conditions in async tests
- Hardcoded paths or environment variables
- Missing test dependencies
- Timezone or locale differences

**Resolution Steps:**

1. **Reproduce Locally:**
   ```bash
   # Run tests with CI environment variables
   CI=true npm test
   
   # Run tests with verbose output
   npm test -- --verbose --no-cache
   
   # Run specific failing test
   npm test -- path/to/failing.test.ts
   ```

2. **Check Test Dependencies:**
   ```bash
   # Verify all dev dependencies installed
   npm ci
   
   # Check for missing peer dependencies
   npm ls
   ```

3. **Fix Async Test Issues:**
   ```typescript
   // Bad: No await, race condition
   test('async operation', () => {
     doAsyncThing().then(result => {
       expect(result).toBe(expected);
     });
   });
   
   // Good: Proper async/await
   test('async operation', async () => {
     const result = await doAsyncThing();
     expect(result).toBe(expected);
   });
   ```

4. **Increase Timeouts:**
   ```typescript
   // In test file
   jest.setTimeout(10000); // 10 seconds
   
   // Or in jest.config.js
   module.exports = {
     testTimeout: 10000
   };
   ```

5. **Mock External Dependencies:**
   ```typescript
   // Mock VS Code API
   jest.mock('vscode', () => ({
     window: {
       showInformationMessage: jest.fn()
     }
   }));
   ```

**Prevention:**
- Avoid test interdependencies
- Use deterministic test data
- Mock external dependencies
- Avoid time-based assertions
- Test in CI environment before merging

**Debugging Commands:**
```bash
# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm test -- --watch

# Run tests with specific pattern
npm test -- --testNamePattern="should validate"
```

---

### Issue: Code Coverage Below Threshold

**Symptoms:**
- Build fails with "Coverage below 80%"
- Specific files show low coverage
- Coverage report shows uncovered lines

**Common Causes:**
- New code added without tests
- Edge cases not tested
- Error handling paths not covered
- Test files excluded from coverage

**Resolution Steps:**

1. **Generate Detailed Coverage Report:**
   ```bash
   # Run tests with coverage
   npm run test:coverage
   
   # Open HTML report
   open coverage/index.html  # macOS
   start coverage/index.html  # Windows
   xdg-open coverage/index.html  # Linux
   ```

2. **Identify Uncovered Code:**
   ```bash
   # View coverage summary
   cat coverage/coverage-summary.json | jq
   
   # Find files below threshold
   cat coverage/coverage-summary.json | jq '.[] | select(.lines.pct < 80)'
   ```

3. **Add Missing Tests:**
   ```typescript
   // Test happy path
   test('should process valid input', () => {
     const result = processInput('valid');
     expect(result).toBe('processed');
   });
   
   // Test error path
   test('should handle invalid input', () => {
     expect(() => processInput('invalid')).toThrow();
   });
   
   // Test edge cases
   test('should handle empty input', () => {
     const result = processInput('');
     expect(result).toBe('');
   });
   ```

4. **Check Coverage Configuration:**
   ```javascript
   // jest.config.js
   module.exports = {
     collectCoverageFrom: [
       'src/**/*.ts',
       '!src/**/*.d.ts',
       '!src/**/*.test.ts',
       '!src/test/**'
     ],
     coverageThreshold: {
       global: {
         branches: 80,
         functions: 80,
         lines: 80,
         statements: 80
       }
     }
   };
   ```

**Prevention:**
- Write tests alongside code (TDD)
- Review coverage in pull requests
- Set up coverage tracking
- Use coverage badges in README

**Coverage Analysis Tips:**
- Focus on critical paths first
- Test error handling
- Cover edge cases and boundaries
- Don't chase 100% coverage blindly

---

### Issue: ESLint Errors

**Symptoms:**
- Build fails at linting step
- "Parsing error" messages
- Style violations reported
- Unused variable warnings

**Common Causes:**
- Code doesn't follow style guidelines
- ESLint configuration issues
- Missing ESLint plugins
- Conflicting rules

**Resolution Steps:**

1. **Run ESLint Locally:**
   ```bash
   # Run ESLint on all files
   npm run lint
   
   # Run with auto-fix
   npm run lint -- --fix
   
   # Check specific file
   npx eslint src/path/to/file.ts
   ```

2. **Fix Common Issues:**
   ```typescript
   // Unused variables
   // Bad
   const unused = 'value';
   
   // Good - prefix with underscore if intentionally unused
   const _unused = 'value';
   
   // Or remove if truly unused
   
   // Missing semicolons
   // Bad
   const value = 'test'
   
   // Good
   const value = 'test';
   
   // Prefer const
   // Bad
   let value = 'test';
   
   // Good
   const value = 'test';
   ```

3. **Update ESLint Configuration:**
   ```json
   // .eslintrc.json
   {
     "extends": [
       "eslint:recommended",
       "plugin:@typescript-eslint/recommended"
     ],
     "parser": "@typescript-eslint/parser",
     "plugins": ["@typescript-eslint"],
     "rules": {
       "@typescript-eslint/no-unused-vars": ["error", {
         "argsIgnorePattern": "^_"
       }]
     }
   }
   ```

4. **Disable Specific Rules (Use Sparingly):**
   ```typescript
   // Disable for single line
   // eslint-disable-next-line @typescript-eslint/no-explicit-any
   const value: any = getData();
   
   // Disable for block
   /* eslint-disable @typescript-eslint/no-explicit-any */
   const value1: any = getData1();
   const value2: any = getData2();
   /* eslint-enable @typescript-eslint/no-explicit-any */
   ```

**Prevention:**
- Enable ESLint in your IDE
- Run lint before committing
- Use pre-commit hooks
- Follow team style guide

---

## PR Quality Gate Failures

### Issue: Security Vulnerabilities Detected

**Symptoms:**
- PR check fails with "Security vulnerabilities found"
- npm audit reports critical or high severity issues
- Dependabot alerts

**Common Causes:**
- Outdated dependencies with known vulnerabilities
- Transitive dependencies with vulnerabilities
- New vulnerabilities discovered in existing dependencies

**Resolution Steps:**

1. **Run Security Audit:**
   ```bash
   # Check for vulnerabilities
   npm audit
   
   # View detailed report
   npm audit --json | jq
   
   # Check specific severity
   npm audit --audit-level=high
   ```

2. **Fix Vulnerabilities:**
   ```bash
   # Auto-fix vulnerabilities
   npm audit fix
   
   # Force fix (may introduce breaking changes)
   npm audit fix --force
   
   # Update specific package
   npm update package-name
   ```

3. **Check Dependency Tree:**
   ```bash
   # Find which package depends on vulnerable package
   npm ls vulnerable-package
   
   # Example output:
   # pragmatic-rhino-suit@1.2.3
   # └─┬ some-package@1.0.0
   #   └── vulnerable-package@1.0.0
   ```

4. **Manual Resolution:**
   ```bash
   # Update parent package that depends on vulnerable package
   npm update some-package
   
   # Or update package.json and reinstall
   npm install
   ```

5. **Override Dependency (Last Resort):**
   ```json
   // package.json
   {
     "overrides": {
       "vulnerable-package": "^2.0.0"
     }
   }
   ```

**When to Use Audit Exceptions:**

Only use `npm audit --audit-level=moderate` or skip audit if:
- Vulnerability is in dev dependency only
- No fix available and risk is acceptable
- False positive confirmed
- Documented exception approved by security team

**Prevention:**
- Enable Dependabot alerts
- Regular dependency updates
- Monitor security advisories
- Use `npm audit` in pre-commit hooks

**Related Commands:**
```bash
# Check for outdated packages
npm outdated

# Update all packages to latest
npm update

# Check specific package versions
npm view package-name versions
```

---

### Issue: Version Validation Failure

**Symptoms:**
- PR check fails with "Invalid version format"
- "Version not incremented" error
- "Version must follow semantic versioning" message

**Common Causes:**
- Version doesn't follow SemVer format (X.Y.Z)
- Version not incremented from base branch
- Pre-release version format incorrect
- Manual version edit without following rules

**Resolution Steps:**

1. **Check Current Version:**
   ```bash
   # View current version
   cat package.json | jq .version
   
   # View base branch version
   git show origin/main:package.json | jq .version
   ```

2. **Fix Version Format:**
   ```json
   // package.json
   {
     "version": "1.2.3"  // Correct: X.Y.Z format
   }
   
   // Invalid formats:
   // "version": "v1.2.3"  // No 'v' prefix
   // "version": "1.2"     // Must have patch version
   // "version": "1.2.3.4" // Only three parts
   ```

3. **Increment Version Correctly:**
   ```bash
   # Patch version (bug fixes)
   npm version patch  # 1.2.3 → 1.2.4
   
   # Minor version (new features)
   npm version minor  # 1.2.3 → 1.3.0
   
   # Major version (breaking changes)
   npm version major  # 1.2.3 → 2.0.0
   ```

4. **Pre-release Versions:**
   ```bash
   # Create pre-release version
   npm version prerelease --preid=beta  # 1.2.3 → 1.2.4-beta.0
   
   # Increment pre-release
   npm version prerelease  # 1.2.4-beta.0 → 1.2.4-beta.1
   ```

**Version Increment Rules:**

| Change Type | Version Bump | Example |
|-------------|--------------|---------|
| Bug fix | Patch | 1.2.3 → 1.2.4 |
| New feature (backward compatible) | Minor | 1.2.3 → 1.3.0 |
| Breaking change | Major | 1.2.3 → 2.0.0 |
| Pre-release | Prerelease | 1.2.3 → 1.2.4-beta.0 |

**Prevention:**
- Use automated versioning workflow
- Never manually edit version in package.json
- Follow conventional commits
- Let CI/CD handle versioning

---

## Version Workflow Problems

### Issue: Version Not Bumped Automatically

**Symptoms:**
- Merge to main doesn't trigger version bump
- Version workflow runs but doesn't create tag
- CHANGELOG not updated

**Common Causes:**
- Commit messages don't follow conventional commits
- Version workflow not triggered
- Insufficient permissions for workflow
- Git configuration issues

**Resolution Steps:**

1. **Check Commit Messages:**
   ```bash
   # View recent commits
   git log --oneline -10
   
   # Check if commits follow conventional format
   # Valid: feat: add new feature
   # Valid: fix: resolve bug
   # Valid: chore: update dependencies
   # Invalid: added new feature
   # Invalid: bug fix
   ```

2. **Verify Workflow Triggered:**
   ```bash
   # Check workflow runs
   gh run list --workflow=version.yml --limit=5
   
   # View specific run
   gh run view <run-id>
   ```

3. **Check Workflow Permissions:**
   ```yaml
   # .github/workflows/version.yml
   permissions:
     contents: write  # Required to push tags
     pull-requests: write  # Required for PR comments
   ```

4. **Manual Version Bump (If Needed):**
   ```bash
   # Analyze commits manually
   node scripts/analyze-version.js
   
   # Bump version
   npm version patch -m "chore: bump version to %s"
   
   # Push tag
   git push --follow-tags
   ```

**Conventional Commit Format:**

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Valid Types:**
- `feat:` - New feature (minor bump)
- `fix:` - Bug fix (patch bump)
- `chore:` - Maintenance (patch bump)
- `docs:` - Documentation only (patch bump)
- `BREAKING CHANGE:` - Breaking change (major bump)

**Examples:**
```
feat: add spec validation command
fix: resolve memory leak in tree view
chore: update dependencies
docs: update README with examples
feat!: redesign API (breaking change)
```

**Prevention:**
- Use commitizen for guided commits
- Set up commit message linting
- Document conventional commits in CONTRIBUTING.md
- Use PR templates with commit guidelines

---

### Issue: CHANGELOG Generation Fails

**Symptoms:**
- Version workflow completes but CHANGELOG not updated
- CHANGELOG has incorrect format
- Missing commit entries in CHANGELOG

**Common Causes:**
- Changelog generator script error
- Incorrect commit message parsing
- Git history issues
- File permission problems

**Resolution Steps:**

1. **Test Changelog Generator:**
   ```bash
   # Run generator manually
   node scripts/generate-changelog.js
   
   # Check output
   cat CHANGELOG.md
   ```

2. **Verify Git History:**
   ```bash
   # Check commits since last tag
   git log $(git describe --tags --abbrev=0)..HEAD --oneline
   
   # Verify conventional commit format
   git log --pretty=format:"%s" $(git describe --tags --abbrev=0)..HEAD
   ```

3. **Fix CHANGELOG Format:**
   ```markdown
   # CHANGELOG.md
   
   ## [1.2.3] - 2025-01-15
   
   ### Added
   - New spec validation command
   - C4 diagram generation improvements
   
   ### Fixed
   - Memory leak in tree view
   - Framework detection issues
   
   ### Changed
   - Updated dependencies
   
   ## [1.2.2] - 2025-01-10
   ...
   ```

4. **Manual CHANGELOG Update:**
   ```bash
   # Edit CHANGELOG.md manually
   nano CHANGELOG.md
   
   # Commit changes
   git add CHANGELOG.md
   git commit -m "docs: update CHANGELOG for v1.2.3"
   git push
   ```

**CHANGELOG Best Practices:**
- Follow [Keep a Changelog](https://keepachangelog.com/) format
- Group changes by type (Added, Changed, Fixed, Removed)
- Include issue/PR references
- Write for end users, not developers
- Keep entries concise and clear

---

## Package Workflow Issues

### Issue: VSIX Package Creation Fails

**Symptoms:**
- Package workflow fails at vsce package step
- "Error: Missing publisher name" message
- "Error: Make sure to edit the README.md" message
- Package validation errors

**Common Causes:**
- Missing or invalid package.json fields
- README not customized from template
- Missing required files
- Invalid manifest configuration

**Resolution Steps:**

1. **Validate package.json:**
   ```json
   {
     "name": "pragmatic-rhino-suit",
     "displayName": "Pragmatic Rhino SUIT",
     "description": "Standards-Unified Integration Toolkit",
     "version": "1.2.3",
     "publisher": "pragmatic-rhino",
     "engines": {
       "vscode": "^1.85.0"
     },
     "categories": ["Other"],
     "activationEvents": ["onStartupFinished"],
     "main": "./out/extension.js",
     "contributes": {},
     "repository": {
       "type": "git",
       "url": "https://github.com/your-org/pragmatic-rhino-suit"
     },
     "license": "MIT"
   }
   ```

2. **Check Required Files:**
   ```bash
   # Verify required files exist
   ls -la README.md LICENSE CHANGELOG.md
   
   # Check README is not default template
   grep -i "replace this" README.md
   ```

3. **Test Package Locally:**
   ```bash
   # Clean build
   rm -rf out node_modules *.vsix
   npm ci --production
   npm run compile
   
   # Create package
   vsce package
   
   # List package contents
   vsce ls
   ```

4. **Check Package Size:**
   ```bash
   # View package size
   ls -lh *.vsix
   
   # If too large, check .vscodeignore
   cat .vscodeignore
   ```

5. **Validate .vscodeignore:**
   ```
   # .vscodeignore
   .vscode/**
   .vscode-test/**
   src/**
   .gitignore
   .yarnrc
   vsc-extension-quickstart.md
   **/tsconfig.json
   **/.eslintrc.json
   **/*.map
   **/*.ts
   **/*.test.js
   **/node_modules/**
   ```

**Common package.json Issues:**

| Issue | Fix |
|-------|-----|
| Missing publisher | Add `"publisher": "your-publisher-name"` |
| Invalid engine version | Use `"vscode": "^1.85.0"` format |
| Missing main entry | Add `"main": "./out/extension.js"` |
| No activation events | Add `"activationEvents": ["onStartupFinished"]` |
| Missing repository | Add repository URL |

**Prevention:**
- Validate package.json before committing
- Test packaging locally before pushing
- Use vsce ls to verify package contents
- Keep .vscodeignore up to date

---

### Issue: Package Validation Fails

**Symptoms:**
- Package created but validation script fails
- "Version mismatch" error
- "Missing required files" error
- "Package size exceeds limit" warning

**Common Causes:**
- Manifest version doesn't match tag
- Required files not included in package
- Package too large (> 50MB)
- Invalid file structure

**Resolution Steps:**

1. **Check Version Match:**
   ```bash
   # Extract and check manifest version
   unzip -p pragmatic-rhino-suit-1.2.3.vsix extension/package.json | jq .version
   
   # Should match tag version (without 'v' prefix)
   # Tag: v1.2.3 → Manifest: "1.2.3"
   ```

2. **Verify Package Contents:**
   ```bash
   # List all files in package
   vsce ls --packagePath pragmatic-rhino-suit-1.2.3.vsix
   
   # Check for required files
   vsce ls --packagePath pragmatic-rhino-suit-1.2.3.vsix | grep -E "(README|LICENSE|CHANGELOG)"
   ```

3. **Check Package Size:**
   ```bash
   # View package size
   ls -lh pragmatic-rhino-suit-1.2.3.vsix
   
   # If > 50MB, identify large files
   unzip -l pragmatic-rhino-suit-1.2.3.vsix | sort -k4 -n -r | head -20
   ```

4. **Reduce Package Size:**
   ```
   # Add to .vscodeignore
   node_modules/**
   src/**
   **/*.ts
   **/*.map
   .github/**
   docs/**
   tests/**
   coverage/**
   *.vsix
   ```

5. **Run Validation Script:**
   ```bash
   # Run validation manually
   node scripts/validate-vsix.js pragmatic-rhino-suit-1.2.3.vsix
   
   # Check exit code
   echo $?  # Should be 0 for success
   ```

**Package Size Optimization:**

| Item | Action | Savings |
|------|--------|---------|
| Source files | Exclude via .vscodeignore | ~5-10MB |
| node_modules | Production only | ~50-100MB |
| Tests | Exclude test files | ~1-5MB |
| Documentation | Exclude docs folder | ~1-2MB |
| Source maps | Exclude .map files | ~2-5MB |

**Prevention:**
- Test packaging locally before CI
- Monitor package size trends
- Review .vscodeignore regularly
- Use production dependencies only

---

## Deployment Failures

### Issue: Authentication Failed (401 Unauthorized)

**Symptoms:**
- Deploy workflow fails with "401 Unauthorized"
- "Authentication failed" error
- "Invalid credentials" message
- vsce publish fails

**Common Causes:**
- VSCE_PAT expired (90-day lifetime)
- VSCE_PAT has insufficient permissions
- VSCE_PAT not configured in GitHub Secrets
- Token revoked or deleted

**Resolution Steps:**

1. **Verify Secret Exists:**
   ```bash
   # Check if secret is configured (requires admin access)
   # Navigate to: Settings → Secrets and variables → Actions
   # Verify VSCE_PAT is listed
   ```

2. **Check Token Expiration:**
   - Log in to Azure DevOps
   - Navigate to User Settings → Personal Access Tokens
   - Check VSCE_PAT expiration date
   - If expired or expiring soon, rotate token

3. **Verify Token Permissions:**
   - Token must have "Marketplace: Manage" permission
   - Check token scope in Azure DevOps
   - Recreate token if permissions incorrect

4. **Rotate Token:**
   ```bash
   # Follow SECRETS.md rotation procedure
   # 1. Create new token in Azure DevOps
   # 2. Update GitHub secret
   # 3. Test with manual deployment
   # 4. Revoke old token
   ```

5. **Test Authentication:**
   ```bash
   # Test locally with new token
   export VSCE_PAT="new-token-value"
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   unset VSCE_PAT
   ```

**Token Creation Checklist:**
- [ ] Organization: All accessible organizations
- [ ] Expiration: 90 days (or custom)
- [ ] Scopes: Marketplace (Manage) ✓
- [ ] Token saved securely
- [ ] GitHub secret updated
- [ ] Old token revoked after verification

**Prevention:**
- Set calendar reminders for token rotation (every 80 days)
- Document token rotation procedure
- Test authentication before expiration
- Use longest acceptable expiration period

**Related Documentation:**
- [SECRETS.md](./SECRETS.md) - Complete token rotation procedure

---

### Issue: Marketplace Rejection

**Symptoms:**
- Publish succeeds but extension not visible on marketplace
- Email notification about validation failure
- "Package rejected" message in publisher dashboard
- Extension shows as "unpublished"

**Common Causes:**
- Extension violates marketplace policies
- Missing or invalid icon
- Incomplete or misleading README
- Broken links in marketplace page
- Copyright or trademark issues
- Malicious code detected

**Resolution Steps:**

1. **Check Publisher Dashboard:**
   - Log in to [VS Code Marketplace](https://marketplace.visualstudio.com/manage)
   - Navigate to your extension
   - Check for validation errors or warnings
   - Review rejection reason

2. **Review Marketplace Email:**
   - Check email associated with publisher account
   - Look for validation failure notification
   - Note specific policy violations
   - Follow remediation instructions

3. **Common Rejection Reasons:**

   **Missing/Invalid Icon:**
   ```json
   // package.json
   {
     "icon": "resources/icon.png"  // Must be 128x128 PNG
   }
   ```
   
   **Incomplete README:**
   - Must not be default template
   - Must describe extension functionality
   - Must include usage instructions
   - Must have screenshots or examples

   **Broken Links:**
   ```markdown
   <!-- Check all links in README -->
   - Repository URL
   - Issue tracker URL
   - Documentation links
   - Image URLs
   ```

   **Policy Violations:**
   - No misleading functionality claims
   - No trademark infringement
   - No malicious code
   - No privacy violations

4. **Fix and Republish:**
   ```bash
   # Fix issues in code
   # Update version
   npm version patch
   
   # Create new package
   vsce package
   
   # Republish
   vsce publish --packagePath pragmatic-rhino-suit-1.2.4.vsix
   ```

5. **Contact Marketplace Support:**
   - If rejection reason unclear
   - If you believe rejection is incorrect
   - For policy clarification
   - Email: vsmarketplace@microsoft.com

**Marketplace Guidelines Checklist:**
- [ ] Icon is 128x128 PNG
- [ ] README is complete and accurate
- [ ] All links work correctly
- [ ] No trademark violations
- [ ] No misleading claims
- [ ] Privacy policy included (if collecting data)
- [ ] License file included
- [ ] Extension tested and works as described

**Prevention:**
- Review [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
- Test extension thoroughly before publishing
- Use `vsce ls` to verify package contents
- Get peer review before publishing

---

### Issue: Deployment Timeout

**Symptoms:**
- Deploy workflow runs for extended period
- Workflow times out after 6 hours (GitHub Actions limit)
- Marketplace processing takes too long
- No response from marketplace API

**Common Causes:**
- Marketplace service degradation
- Large package size causing slow upload
- Network connectivity issues
- Marketplace API rate limiting

**Resolution Steps:**

1. **Check Marketplace Status:**
   - Visit [Azure DevOps Status](https://status.dev.azure.com/)
   - Check for marketplace service incidents
   - Review planned maintenance windows

2. **Verify Package Size:**
   ```bash
   # Check package size
   ls -lh *.vsix
   
   # If > 10MB, consider optimization
   # Target: < 5MB for fast uploads
   ```

3. **Retry Deployment:**
   ```bash
   # Wait 15-30 minutes
   # Retry via workflow re-run
   gh run rerun <run-id>
   
   # Or manual deployment
   vsce publish --packagePath pragmatic-rhino-suit-1.2.3.vsix
   ```

4. **Increase Workflow Timeout:**
   ```yaml
   # .github/workflows/deploy.yml
   jobs:
     deploy:
       timeout-minutes: 30  # Increase from default 360
   ```

5. **Check Network Connectivity:**
   ```bash
   # Test marketplace API
   curl -I https://marketplace.visualstudio.com/
   
   # Test Azure DevOps
   curl -I https://dev.azure.com/
   ```

**Timeout Thresholds:**

| Operation | Normal | Warning | Timeout |
|-----------|--------|---------|---------|
| Package upload | < 2 min | 2-5 min | > 10 min |
| Marketplace processing | < 5 min | 5-15 min | > 30 min |
| Verification | < 1 min | 1-3 min | > 5 min |
| Total deployment | < 10 min | 10-25 min | > 30 min |

**Prevention:**
- Optimize package size
- Monitor marketplace status before deployment
- Deploy during off-peak hours
- Set appropriate timeout values

---

## Rollback Issues

### Issue: Artifact Not Found for Rollback

**Symptoms:**
- Rollback workflow fails with "Artifact not found"
- Cannot download VSIX for target version
- "Artifact expired" message

**Common Causes:**
- Artifact retention period expired (> 90 days)
- Package workflow never ran for that version
- Artifact manually deleted
- Workflow run deleted

**Resolution Steps:**

1. **Check Artifact Age:**
   ```bash
   # Find package workflow run for version
   gh run list --workflow=package.yml --limit=50 | grep v1.2.2
   
   # Check run details
   gh run view <run-id>
   ```

2. **Rebuild from Tag:**
   ```bash
   # Checkout target version
   git checkout tags/v1.2.2
   
   # Clean build
   rm -rf node_modules out *.vsix
   npm ci --production
   npm run compile
   
   # Create package
   vsce package
   
   # Verify package
   ls -la pragmatic-rhino-suit-1.2.2.vsix
   ```

3. **Manual Rollback:**
   ```bash
   # Publish rebuilt package
   export VSCE_PAT="your-token"
   vsce publish --packagePath pragmatic-rhino-suit-1.2.2.vsix
   unset VSCE_PAT
   ```

4. **Upload Artifact to Release:**
   ```bash
   # Upload VSIX to GitHub release as asset
   gh release upload v1.2.2 pragmatic-rhino-suit-1.2.2.vsix
   
   # Modify rollback workflow to download from release if artifact unavailable
   ```

**Artifact Retention Strategy:**

| Version Type | Retention | Storage |
|--------------|-----------|---------|
| Latest stable | 90 days | GitHub Actions |
| Critical versions | Indefinite | GitHub Releases |
| All versions | 90 days | GitHub Actions |
| Major versions | Indefinite | External backup |

**Prevention:**
- Archive critical versions to GitHub Releases
- Maintain external backup of major versions
- Document artifact retention policy
- Test rollback procedure quarterly

---

### Issue: Rollback Doesn't Fix Problem

**Symptoms:**
- Rollback completes successfully
- Marketplace shows rolled-back version
- Users still report the same issue
- Problem persists after rollback

**Common Causes:**
- Issue exists in rolled-back version too
- Marketplace cache not refreshed
- Users haven't updated extension
- Problem is environmental, not code-related

**Resolution Steps:**

1. **Verify Marketplace Version:**
   ```bash
   # Check current marketplace version
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   
   # Verify version matches rollback target
   ```

2. **Check User Extension Version:**
   ```
   # Ask users to check their installed version
   # In VS Code: Extensions → Pragmatic Rhino SUIT → Version
   
   # Users may need to:
   # 1. Reload VS Code
   # 2. Manually update extension
   # 3. Uninstall and reinstall
   ```

3. **Verify Issue in Rolled-Back Version:**
   ```bash
   # Checkout rolled-back version
   git checkout tags/v1.2.2
   
   # Test locally
   npm ci
   npm run compile
   code --install-extension pragmatic-rhino-suit-1.2.2.vsix
   
   # Reproduce issue
   ```

4. **Rollback Further:**
   ```bash
   # If issue exists in v1.2.2, rollback to v1.2.1
   # Use rollback workflow with v1.2.1
   ```

5. **Investigate Root Cause:**
   - Check if issue is environmental
   - Verify VS Code version compatibility
   - Check for conflicting extensions
   - Review error logs and stack traces

**Rollback Decision Tree:**

```
Issue Reported
├─ Exists in current version?
│   ├─ Yes → Rollback to previous version
│   └─ No → Investigate user environment
│
├─ Exists in rolled-back version?
│   ├─ Yes → Rollback further or hotfix
│   └─ No → Wait for marketplace cache refresh
│
└─ Environmental issue?
    ├─ Yes → Provide workaround
    └─ No → Hotfix required
```

**Prevention:**
- Test thoroughly before release
- Maintain good version history
- Document known issues per version
- Have multiple rollback targets ready

---

## Authentication Problems

### Issue: GitHub Token Permissions Insufficient

**Symptoms:**
- Workflow fails with "Permission denied"
- "Resource not accessible by integration" error
- Cannot push tags or create releases
- Cannot write to repository

**Common Causes:**
- GITHUB_TOKEN has insufficient permissions
- Workflow permissions not configured
- Repository settings restrict workflow permissions
- Branch protection rules block workflow

**Resolution Steps:**

1. **Check Workflow Permissions:**
   ```yaml
   # .github/workflows/version.yml
   permissions:
     contents: write        # Required to push tags
     pull-requests: write   # Required for PR comments
     issues: write          # Required for issue comments
   ```

2. **Verify Repository Settings:**
   - Navigate to: Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"

3. **Check Branch Protection:**
   - Settings → Branches → Branch protection rules
   - Verify workflow can push to protected branches
   - Add workflow to bypass list if needed

4. **Use Personal Access Token (If Needed):**
   ```yaml
   # For operations requiring elevated permissions
   - name: Checkout
     uses: actions/checkout@v4
     with:
       token: ${{ secrets.PAT_TOKEN }}  # Instead of GITHUB_TOKEN
   ```

**Permission Requirements by Workflow:**

| Workflow | Required Permissions |
|----------|---------------------|
| Build | contents: read |
| PR Quality Gates | contents: read, pull-requests: write |
| Version | contents: write |
| Package | contents: read |
| Deploy | contents: read |
| Rollback | contents: write |

**Prevention:**
- Configure permissions in workflow files
- Document required permissions
- Test workflows with minimal permissions
- Review repository settings regularly

---

## Artifact Management Issues

### Issue: Artifact Upload Fails

**Symptoms:**
- Workflow fails at artifact upload step
- "Failed to upload artifact" error
- Artifact partially uploaded
- Timeout during upload

**Common Causes:**
- Artifact too large (> 10GB limit)
- Network connectivity issues
- GitHub Actions service degradation
- Invalid artifact path

**Resolution Steps:**

1. **Check Artifact Size:**
   ```bash
   # Check file size
   ls -lh *.vsix
   
   # Check total artifact size
   du -sh artifacts/
   ```

2. **Verify Artifact Path:**
   ```yaml
   # .github/workflows/package.yml
   - name: Upload VSIX
     uses: actions/upload-artifact@v4
     with:
       name: vsix-package
       path: '*.vsix'  # Verify path is correct
       retention-days: 90
   ```

3. **Split Large Artifacts:**
   ```yaml
   # Upload multiple smaller artifacts instead of one large
   - name: Upload VSIX
     uses: actions/upload-artifact@v4
     with:
       name: vsix-package
       path: '*.vsix'
   
   - name: Upload Reports
     uses: actions/upload-artifact@v4
     with:
       name: reports
       path: 'coverage/'
   ```

4. **Retry Upload:**
   ```yaml
   # Add retry logic
   - name: Upload VSIX
     uses: actions/upload-artifact@v4
     with:
       name: vsix-package
       path: '*.vsix'
     continue-on-error: true
   
   - name: Retry Upload
     if: failure()
     uses: actions/upload-artifact@v4
     with:
       name: vsix-package
       path: '*.vsix'
   ```

**Artifact Size Limits:**

| Type | Limit | Recommendation |
|------|-------|----------------|
| Single artifact | 10 GB | < 100 MB |
| Total per workflow | 10 GB | < 500 MB |
| VSIX package | No specific limit | < 50 MB |
| Test reports | No specific limit | < 10 MB |

**Prevention:**
- Keep artifacts small and focused
- Compress large files before upload
- Clean up unnecessary files
- Monitor artifact storage usage

---

### Issue: Artifact Download Fails

**Symptoms:**
- Deploy workflow fails at artifact download step
- "Artifact not found" error
- Downloaded artifact is corrupted
- Artifact name mismatch

**Common Causes:**
- Artifact name doesn't match
- Artifact from wrong workflow run
- Artifact expired or deleted
- Network issues during download

**Resolution Steps:**

1. **Verify Artifact Name:**
   ```yaml
   # Upload (package.yml)
   - name: Upload VSIX
     uses: actions/upload-artifact@v4
     with:
       name: vsix-package  # Must match download name
   
   # Download (deploy.yml)
   - name: Download VSIX
     uses: actions/download-artifact@v4
     with:
       name: vsix-package  # Must match upload name
   ```

2. **Check Workflow Run:**
   ```bash
   # List recent package workflow runs
   gh run list --workflow=package.yml --limit=10
   
   # Check specific run for artifacts
   gh run view <run-id>
   ```

3. **Download Artifact Manually:**
   ```bash
   # Download artifact using GitHub CLI
   gh run download <run-id> --name vsix-package
   
   # Verify downloaded file
   ls -la *.vsix
   ```

4. **Verify Artifact Integrity:**
   ```bash
   # Check file is valid VSIX
   unzip -t pragmatic-rhino-suit-1.2.3.vsix
   
   # If corrupted, re-run package workflow
   gh run rerun <package-run-id>
   ```

5. **Use Workflow Run ID:**
   ```yaml
   # Download from specific workflow run
   - name: Download VSIX
     uses: actions/download-artifact@v4
     with:
       name: vsix-package
       run-id: ${{ needs.package.outputs.run-id }}
   ```

**Artifact Download Patterns:**

```yaml
# Pattern 1: Download from same workflow
- uses: actions/download-artifact@v4
  with:
    name: vsix-package

# Pattern 2: Download from different workflow
- uses: dawidd6/action-download-artifact@v2
  with:
    workflow: package.yml
    name: vsix-package

# Pattern 3: Download from specific run
- uses: actions/download-artifact@v4
  with:
    name: vsix-package
    run-id: ${{ github.event.workflow_run.id }}
```

**Prevention:**
- Use consistent artifact names
- Document artifact naming convention
- Test artifact download in staging
- Verify artifact integrity after download

---

## Marketplace Issues

### Issue: Extension Not Visible After Deployment

**Symptoms:**
- Deployment succeeds but extension not found on marketplace
- Search doesn't return extension
- Direct link shows 404 error
- Extension shows as "unpublished"

**Common Causes:**
- Marketplace cache not refreshed (15-30 minutes)
- Extension unpublished or hidden
- Publisher account issues
- First-time publication delay

**Resolution Steps:**

1. **Wait for Cache Refresh:**
   ```bash
   # Wait 15-30 minutes after deployment
   # Then check marketplace
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   ```

2. **Check Publisher Dashboard:**
   - Log in to [VS Code Marketplace](https://marketplace.visualstudio.com/manage)
   - Verify extension is published
   - Check visibility settings
   - Review any warnings or errors

3. **Verify Extension URL:**
   ```
   # Direct URL format:
   https://marketplace.visualstudio.com/items?itemName=pragmatic-rhino.pragmatic-rhino-suit
   
   # Format: itemName=<publisher>.<extension-name>
   ```

4. **Check Extension Status:**
   ```bash
   # Use vsce to check status
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   
   # Expected output:
   # Name: Pragmatic Rhino SUIT
   # Publisher: pragmatic-rhino
   # Version: 1.2.3
   # ...
   ```

5. **Republish if Necessary:**
   ```bash
   # If extension truly not published
   vsce publish --packagePath pragmatic-rhino-suit-1.2.3.vsix
   ```

**Marketplace Cache Timeline:**

| Action | Cache Refresh | Visibility |
|--------|---------------|------------|
| First publish | 30-60 minutes | Delayed |
| Version update | 15-30 minutes | Moderate |
| Metadata update | 5-15 minutes | Fast |
| Unpublish | Immediate | Immediate |

**Prevention:**
- Allow time for marketplace processing
- Verify deployment in publisher dashboard
- Test with direct URL before announcing
- Monitor marketplace status

---

### Issue: Extension Install Fails for Users

**Symptoms:**
- Users report "Failed to install extension" error
- Extension downloads but doesn't install
- VS Code shows "Incompatible" message
- Installation hangs indefinitely

**Common Causes:**
- VS Code version incompatibility
- Conflicting extensions
- Corrupted download
- Platform incompatibility
- Extension activation failure

**Resolution Steps:**

1. **Check VS Code Version Compatibility:**
   ```json
   // package.json
   {
     "engines": {
       "vscode": "^1.85.0"  // Minimum VS Code version
     }
   }
   ```
   
   **User Action:**
   - Check VS Code version: Help → About
   - Update VS Code if below minimum version
   - Reload VS Code after update

2. **Check for Conflicting Extensions:**
   ```
   # Ask users to:
   1. Disable all other extensions
   2. Try installing Pragmatic Rhino SUIT
   3. If successful, enable extensions one by one
   4. Identify conflicting extension
   ```

3. **Clear Extension Cache:**
   ```bash
   # Windows
   rmdir /s /q %USERPROFILE%\.vscode\extensions\pragmatic-rhino.pragmatic-rhino-suit-*
   
   # macOS/Linux
   rm -rf ~/.vscode/extensions/pragmatic-rhino.pragmatic-rhino-suit-*
   
   # Then reinstall
   code --install-extension pragmatic-rhino.pragmatic-rhino-suit
   ```

4. **Check Extension Logs:**
   ```
   # In VS Code:
   1. View → Output
   2. Select "Extension Host" from dropdown
   3. Look for activation errors
   4. Check for stack traces
   ```

5. **Test Installation Locally:**
   ```bash
   # Download VSIX from marketplace
   # Install locally
   code --install-extension pragmatic-rhino-suit-1.2.3.vsix
   
   # Check for errors
   code --list-extensions --show-versions | grep pragmatic-rhino
   ```

**Common Installation Errors:**

| Error | Cause | Solution |
|-------|-------|----------|
| "Incompatible" | VS Code version too old | Update VS Code |
| "Failed to install" | Corrupted download | Clear cache, retry |
| "Activation failed" | Extension bug | Check logs, report issue |
| "Cannot find module" | Missing dependency | Reinstall extension |

**Prevention:**
- Test on multiple VS Code versions
- Document minimum VS Code version clearly
- Provide troubleshooting guide for users
- Monitor installation success rate

---

## Performance Problems

### Issue: Workflow Runs Too Slow

**Symptoms:**
- Build workflow takes > 10 minutes
- Test execution exceeds 5 minutes
- Deployment takes > 30 minutes
- Workflows queued for extended periods

**Common Causes:**
- Inefficient dependency installation
- Slow test execution
- No caching configured
- Large artifact uploads
- GitHub Actions service degradation

**Resolution Steps:**

1. **Enable Dependency Caching:**
   ```yaml
   # .github/workflows/build.yml
   - name: Setup Node.js
     uses: actions/setup-node@v4
     with:
       node-version: '18'
       cache: 'npm'  # Enable npm caching
   
   - name: Install dependencies
     run: npm ci  # Faster than npm install
   ```

2. **Optimize Test Execution:**
   ```yaml
   # Run tests in parallel
   - name: Run tests
     run: npm test -- --maxWorkers=4
   
   # Or use matrix strategy
   strategy:
     matrix:
       node-version: [18]
       test-suite: [unit, integration]
   ```

3. **Cache Build Outputs:**
   ```yaml
   - name: Cache TypeScript build
     uses: actions/cache@v3
     with:
       path: out/
       key: ${{ runner.os }}-build-${{ hashFiles('src/**/*.ts') }}
   ```

4. **Reduce Artifact Size:**
   ```yaml
   # Compress before upload
   - name: Compress artifacts
     run: tar -czf artifacts.tar.gz coverage/ test-results/
   
   - name: Upload artifacts
     uses: actions/upload-artifact@v4
     with:
       name: compressed-artifacts
       path: artifacts.tar.gz
   ```

5. **Monitor Workflow Performance:**
   ```bash
   # Check workflow duration trends
   gh run list --workflow=build.yml --limit=20 --json conclusion,startedAt,updatedAt
   
   # Identify slow steps
   gh run view <run-id> --log | grep "took"
   ```

**Performance Targets:**

| Workflow | Target | Warning | Critical |
|----------|--------|---------|----------|
| Build | < 5 min | 5-10 min | > 10 min |
| PR Quality Gates | < 7 min | 7-15 min | > 15 min |
| Package | < 3 min | 3-5 min | > 5 min |
| Deploy | < 10 min | 10-25 min | > 25 min |

**Optimization Checklist:**
- [ ] npm caching enabled
- [ ] Use `npm ci` instead of `npm install`
- [ ] TypeScript incremental compilation
- [ ] Parallel test execution
- [ ] Compressed artifacts
- [ ] Minimal artifact retention
- [ ] Efficient workflow triggers

**Prevention:**
- Monitor workflow performance trends
- Set performance budgets
- Optimize slow steps
- Use caching aggressively

---

## Debugging Techniques

### Workflow Debugging

**Enable Debug Logging:**

```yaml
# Add to workflow file
env:
  ACTIONS_STEP_DEBUG: true
  ACTIONS_RUNNER_DEBUG: true
```

Or set repository secrets:
- `ACTIONS_STEP_DEBUG` = `true`
- `ACTIONS_RUNNER_DEBUG` = `true`

**View Detailed Logs:**

```bash
# View workflow run logs
gh run view <run-id> --log

# View specific job logs
gh run view <run-id> --log --job=<job-id>

# Download logs
gh run download <run-id> --name logs
```

**Add Debug Output:**

```yaml
- name: Debug Information
  run: |
    echo "Node version: $(node --version)"
    echo "npm version: $(npm --version)"
    echo "Working directory: $(pwd)"
    echo "Files: $(ls -la)"
    echo "Environment: ${{ runner.os }}"
    echo "Event: ${{ github.event_name }}"
```

**Inspect Context:**

```yaml
- name: Dump GitHub context
  run: echo '${{ toJSON(github) }}'

- name: Dump runner context
  run: echo '${{ toJSON(runner) }}'

- name: Dump job context
  run: echo '${{ toJSON(job) }}'
```

---

### Local Workflow Testing

**Using act:**

```bash
# Install act
# macOS: brew install act
# Windows: choco install act-cli
# Linux: curl https://raw.githubusercontent.com/nektos/act/master/install.sh | sudo bash

# Run workflow locally
act push

# Run specific job
act push --job build

# Run with secrets
act push --secret-file .secrets

# Dry run
act push --dryrun
```

**Test Scripts Locally:**

```bash
# Test version analysis
node scripts/analyze-version.js

# Test changelog generation
node scripts/generate-changelog.js

# Test VSIX validation
node scripts/validate-vsix.js pragmatic-rhino-suit-1.2.3.vsix

# Test with different inputs
VERSION=1.2.3 node scripts/validate-version.js
```

---

### Debugging Failed Deployments

**Step-by-Step Verification:**

1. **Check Workflow Status:**
   ```bash
   gh run list --workflow=deploy.yml --limit=5
   gh run view <run-id>
   ```

2. **Verify Artifact:**
   ```bash
   # Download artifact
   gh run download <run-id> --name vsix-package
   
   # Validate VSIX
   unzip -t pragmatic-rhino-suit-1.2.3.vsix
   vsce ls --packagePath pragmatic-rhino-suit-1.2.3.vsix
   ```

3. **Test Authentication:**
   ```bash
   # Test VSCE_PAT locally
   export VSCE_PAT="your-token"
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   unset VSCE_PAT
   ```

4. **Check Marketplace:**
   ```bash
   # Verify current version
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   
   # Check publisher dashboard
   # https://marketplace.visualstudio.com/manage
   ```

5. **Review Logs:**
   ```bash
   # Check for errors
   gh run view <run-id> --log | grep -i error
   
   # Check for warnings
   gh run view <run-id> --log | grep -i warning
   ```

---

### Common Debugging Commands

```bash
# GitHub CLI
gh run list --workflow=<workflow-name> --limit=10
gh run view <run-id>
gh run view <run-id> --log
gh run rerun <run-id>
gh run cancel <run-id>
gh run download <run-id>

# Git
git log --oneline -10
git tag --sort=-version:refname | head -10
git show <tag>
git describe --tags --abbrev=0

# npm
npm list --depth=0
npm outdated
npm audit
npm run <script>

# vsce
vsce show <publisher>.<extension>
vsce ls --packagePath <vsix-file>
vsce package
vsce publish --packagePath <vsix-file>

# VS Code
code --list-extensions
code --install-extension <vsix-file>
code --uninstall-extension <extension-id>
```

---

## Emergency Procedures

### Critical Failure Response

**Severity Levels:**

| Level | Description | Response Time | Action |
|-------|-------------|---------------|--------|
| P0 | Extension crashes VS Code, data loss | Immediate (< 15 min) | Emergency rollback |
| P1 | Major feature broken, high error rate | < 1 hour | Rollback or hotfix |
| P2 | Minor feature broken, moderate errors | < 4 hours | Hotfix in next release |
| P3 | Cosmetic issues, minor bugs | < 24 hours | Fix in normal cycle |

---

### P0: Emergency Rollback (< 15 minutes)

**Immediate Actions:**

1. **Assess Impact (2 minutes):**
   ```bash
   # Check error reports
   # Check marketplace reviews
   # Check GitHub issues
   # Determine affected users
   ```

2. **Initiate Rollback (3 minutes):**
   ```bash
   # Navigate to Actions → Rollback Deployment
   # Click "Run workflow"
   # Enter last known good version (e.g., v1.2.2)
   # Click "Run workflow"
   ```

3. **Monitor Rollback (5-10 minutes):**
   ```bash
   # Watch workflow execution
   gh run watch
   
   # Verify each step completes
   # Check for errors
   ```

4. **Verify Success (2 minutes):**
   ```bash
   # Check marketplace version
   vsce show pragmatic-rhino.pragmatic-rhino-suit
   
   # Test installation
   code --install-extension pragmatic-rhino.pragmatic-rhino-suit
   ```

5. **Communicate (3 minutes):**
   ```
   # Post in team chat
   # Update GitHub issue
   # Notify stakeholders
   # Update status page (if applicable)
   ```

---

### P1: Hotfix Deployment (< 1 hour)

**Rapid Hotfix Process:**

1. **Create Hotfix Branch (5 minutes):**
   ```bash
   git checkout -b hotfix/critical-bug main
   ```

2. **Implement Fix (20 minutes):**
   ```typescript
   // Write minimal fix
   // Add test to verify fix
   // Verify fix resolves issue
   ```

3. **Test Thoroughly (15 minutes):**
   ```bash
   npm test
   npm run test:coverage
   # Manual testing in VS Code
   ```

4. **Deploy (15 minutes):**
   ```bash
   # Bump patch version
   npm version patch
   
   # Push changes
   git push origin hotfix/critical-bug
   
   # Create PR and merge
   # Or manual deployment if CI/CD unavailable
   ```

5. **Verify and Communicate (5 minutes):**
   ```bash
   # Verify hotfix deployed
   # Test in production
   # Notify team and users
   ```

---

### Emergency Contact Escalation

**Contact Chain:**

1. **Repository Maintainer** (First responder)
   - Assess severity
   - Initiate rollback if P0
   - Coordinate response

2. **DevOps Lead** (If rollback fails)
   - Troubleshoot deployment issues
   - Manual deployment if needed
   - Infrastructure support

3. **Repository Admin** (For access issues)
   - Secret rotation
   - Permission issues
   - Repository settings

4. **Security Lead** (For security incidents)
   - Security vulnerability assessment
   - Incident response coordination
   - Communication with security team

**Emergency Communication Template:**

```
🚨 EMERGENCY: Extension Critical Issue

Severity: P0/P1/P2/P3
Version: v1.2.3
Issue: [Brief description]
Impact: [Number of users, scope]
Action: [Rollback/Hotfix/Investigation]
ETA: [Expected resolution time]
Status: [In Progress/Resolved]

Updates:
- [Timestamp] Action taken
- [Timestamp] Current status
- [Timestamp] Resolution
```

---

### Post-Emergency Actions

**Within 24 Hours:**

- [ ] Complete incident report
- [ ] Analyze root cause
- [ ] Identify contributing factors
- [ ] Document timeline of events
- [ ] Communicate resolution to users

**Within 1 Week:**

- [ ] Implement preventive measures
- [ ] Add tests to prevent recurrence
- [ ] Update monitoring/alerting
- [ ] Update documentation
- [ ] Conduct team retrospective

**Incident Report Template:**

```markdown
# Incident Report: [Brief Title]

## Summary
- **Date:** 2025-01-15
- **Duration:** 45 minutes
- **Severity:** P1
- **Impact:** 500 users affected

## Timeline
- 10:00 - Issue reported
- 10:05 - Severity assessed as P1
- 10:10 - Rollback initiated
- 10:25 - Rollback completed
- 10:30 - Verification successful
- 10:45 - Users notified

## Root Cause
[Detailed explanation of what caused the issue]

## Resolution
[How the issue was resolved]

## Preventive Measures
1. [Action to prevent recurrence]
2. [Monitoring improvement]
3. [Process change]

## Lessons Learned
- What went well
- What could be improved
- Action items
```

---

## Quick Reference

### Diagnostic Commands

```bash
# Check versions
cat package.json | jq .version
git describe --tags --abbrev=0
vsce show pragmatic-rhino.pragmatic-rhino-suit

# Check workflow status
gh run list --workflow=deploy.yml --limit=5
gh run view <run-id>
gh run view <run-id> --log

# Check dependencies
npm list --depth=0
npm outdated
npm audit

# Test locally
npm test
npm run test:coverage
npm run compile
npm run lint

# Package operations
vsce package
vsce ls --packagePath pragmatic-rhino-suit-1.2.3.vsix
vsce show pragmatic-rhino.pragmatic-rhino-suit

# Git operations
git log --oneline -10
git tag --sort=-version:refname | head -10
git status
git diff

# VS Code operations
code --list-extensions
code --install-extension pragmatic-rhino-suit-1.2.3.vsix
code --uninstall-extension pragmatic-rhino.pragmatic-rhino-suit
```

---

### Common Error Messages

| Error | Likely Cause | Quick Fix |
|-------|--------------|-----------|
| "401 Unauthorized" | VSCE_PAT expired | Rotate token |
| "Artifact not found" | Artifact expired | Rebuild from tag |
| "Version already exists" | Duplicate version | Bump version |
| "Coverage below 80%" | Insufficient tests | Add tests |
| "npm audit found vulnerabilities" | Outdated dependencies | `npm audit fix` |
| "TypeScript compilation failed" | Type errors | Fix type issues |
| "Test failed" | Broken tests | Fix failing tests |
| "Package rejected" | Policy violation | Review guidelines |

---

### Workflow Triggers

| Workflow | Trigger | Manual |
|----------|---------|--------|
| Build | Push to any branch | No |
| PR Quality Gates | PR opened/updated | No |
| Version | Push to main | No |
| Package | Tag push (v*.*.*) | No |
| Deploy | Release published | No |
| Rollback | - | Yes |

---

### File Locations

```
.github/workflows/
├── build.yml              # Build and test
├── pr-quality-gates.yml   # PR validation
├── version.yml            # Version management
├── package.yml            # VSIX packaging
├── deploy.yml             # Marketplace deployment
└── rollback.yml           # Rollback procedure

scripts/
├── analyze-version.js     # Version bump analysis
├── generate-changelog.js  # Changelog generation
├── validate-version.js    # Version validation
├── validate-vsix.js       # Package validation
└── verify-deployment.js   # Deployment verification

docs/deployment/
├── RUNBOOK.md            # Deployment procedures
├── MANUAL_TRIGGERS.md    # Manual workflow guide
├── SECRETS.md            # Secrets configuration
├── TROUBLESHOOTING.md    # This file
└── WORKFLOWS.md          # Workflow documentation
```

---

### Support Resources

**Documentation:**
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [vsce CLI Docs](https://github.com/microsoft/vscode-vsce)
- [Semantic Versioning](https://semver.org/)

**Internal:**
- [RUNBOOK.md](./RUNBOOK.md) - Deployment procedures
- [MANUAL_TRIGGERS.md](./MANUAL_TRIGGERS.md) - Manual workflows
- [SECRETS.md](./SECRETS.md) - Secrets management
- [README.md](../../README.md) - Project overview

**Support Contacts:**
- **GitHub Support:** https://support.github.com/
- **VS Code Marketplace:** vsmarketplace@microsoft.com
- **Team Chat:** [Your team channel]
- **On-Call:** [Your on-call rotation]

---

## Document Maintenance

**Last Updated:** 2025-01-15  
**Next Review:** 2025-04-15  
**Owner:** DevOps Team  
**Reviewers:** Repository Maintainers, Release Managers

**Change Log:**
- 2025-01-15: Initial troubleshooting guide created
- Covers all common failure scenarios
- Includes debugging techniques
- Documents emergency procedures

---

## Feedback

If you encounter an issue not covered in this guide:

1. **Document the Issue:**
   - Error message
   - Steps to reproduce
   - Expected vs actual behavior
   - Workflow logs

2. **Create GitHub Issue:**
   - Use "Documentation" label
   - Reference this guide
   - Suggest addition or improvement

3. **Update This Guide:**
   - Add new troubleshooting section
   - Update existing solutions
   - Improve clarity

**Continuous Improvement:**
This guide should evolve based on real-world issues encountered. Please contribute your troubleshooting experiences to help the team.

---

**End of Troubleshooting Guide**
