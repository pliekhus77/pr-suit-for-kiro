# Secrets Masking in GitHub Actions

## Overview

This document describes how secrets are masked in GitHub Actions workflows to prevent accidental exposure in logs, artifacts, and error messages. Proper secrets masking is critical for maintaining security and preventing unauthorized access to sensitive credentials.

## How GitHub Actions Masks Secrets

GitHub Actions automatically masks secrets in workflow logs when they are:

1. **Accessed via `${{ secrets.NAME }}`** - GitHub knows these are secrets and masks them
2. **Set in `env` blocks** - Environment variables containing secrets are automatically masked
3. **Passed to actions via `with` parameters** - Secrets passed to actions are masked

### What Gets Masked

When a secret is properly configured, GitHub Actions will:

- Replace the secret value with `***` in all log output
- Mask the secret in error messages
- Mask the secret in step summaries
- Mask the secret in annotations

### What Does NOT Get Masked

GitHub Actions **cannot** mask secrets that are:

- Hardcoded in workflow files
- Constructed dynamically from non-secret values
- Exposed through indirect means (e.g., base64 encoding)
- Written to files that are then displayed

## Best Practices

### ✅ DO: Use Secrets in Environment Variables

```yaml
- name: Publish to marketplace
  run: |
    vsce publish --pat "$VSCE_PAT"
  env:
    VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

**Why this works:**
- Secret is accessed via `${{ secrets.VSCE_PAT }}`
- Secret is set in `env` block
- GitHub automatically masks the value in logs

### ❌ DON'T: Use Secrets Directly in Commands

```yaml
# BAD - Secret may be exposed in logs
- name: Publish to marketplace
  run: |
    vsce publish --pat "${{ secrets.VSCE_PAT }}"
```

**Why this is dangerous:**
- Secret is used directly in command
- May appear in error messages
- May appear in debug logs
- May be exposed if command fails

### ✅ DO: Pass Secrets to Actions via `with`

```yaml
- name: Deploy to Azure
  uses: azure/webapps-deploy@v2
  with:
    app-name: 'my-app'
    publish-profile: ${{ secrets.AZURE_PUBLISH_PROFILE }}
```

**Why this works:**
- GitHub Actions automatically masks secrets passed via `with`
- Action receives the secret securely
- Secret never appears in logs

### ❌ DON'T: Echo or Print Secrets

```yaml
# BAD - Exposes secret in logs
- name: Debug
  run: |
    echo "Token: ${{ secrets.VSCE_PAT }}"
```

**Why this is dangerous:**
- Explicitly prints the secret to logs
- Defeats GitHub's masking mechanism
- Creates security vulnerability

### ✅ DO: Use Conditional Checks Without Exposing Values

```yaml
- name: Check if secret exists
  run: |
    if [ -z "$VSCE_PAT" ]; then
      echo "❌ VSCE_PAT secret is not configured"
      exit 1
    fi
    echo "✅ VSCE_PAT secret is configured"
  env:
    VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

**Why this works:**
- Checks if secret exists without printing value
- Uses environment variable (masked)
- Provides useful feedback without exposing secret

### ❌ DON'T: Write Secrets to Files That Are Displayed

```yaml
# BAD - Secret may be exposed if file is displayed
- name: Create config file
  run: |
    echo "token=${{ secrets.VSCE_PAT }}" > config.txt
    cat config.txt
```

**Why this is dangerous:**
- Secret is written to file
- File contents are displayed in logs
- Secret is exposed despite masking

## Verification and Testing

### Automated Verification

Use the provided test script to verify secrets masking:

```bash
node scripts/test-secrets-masking.js
```

This script checks:
- ✅ All secrets are used in `env` blocks
- ✅ No secrets are used directly in `run` commands
- ✅ No hardcoded secret patterns detected
- ✅ Proper secret usage patterns followed

### Manual Verification

1. **Review Workflow Logs:**
   - Check that secrets appear as `***` in logs
   - Verify no secret values are visible
   - Check error messages for exposed secrets

2. **Test with Sample Secrets:**
   - Use test secrets in non-production workflows
   - Verify masking works correctly
   - Check all log outputs

3. **Review Artifacts:**
   - Ensure no secrets are written to artifacts
   - Check artifact contents before upload
   - Verify artifact security

## Current Implementation

### Secrets Used in Workflows

| Secret Name | Purpose | Used In | Masking Status |
|-------------|---------|---------|----------------|
| `VSCE_PAT` | VS Code Marketplace authentication | `deploy.yml`, `rollback.yml` | ✅ Properly masked |
| `GITHUB_TOKEN` | GitHub API authentication | All workflows | ✅ Auto-provided and masked |

### Masking Implementation in Deploy Workflow

```yaml
# Example from deploy.yml
- name: Authenticate with VS Code Marketplace
  id: auth
  run: |
    if [ -z "${{ secrets.VSCE_PAT }}" ]; then
      echo "❌ VSCE_PAT secret is not configured"
      exit 1
    fi
    echo "✅ VSCE_PAT secret is configured"
  env:
    # Ensure secret is masked in logs
    VSCE_PAT: ${{ secrets.VSCE_PAT }}

- name: Publish to VS Code Marketplace
  run: |
    vsce publish --packagePath "$VSIX_FILE" --pat "${{ secrets.VSCE_PAT }}"
  env:
    # Ensure PAT is masked in logs
    VSCE_PAT: ${{ secrets.VSCE_PAT }}
```

**Key Points:**
- ✅ Secret accessed via `${{ secrets.VSCE_PAT }}`
- ✅ Secret set in `env` block for masking
- ✅ Secret used via environment variable in commands
- ✅ No direct secret usage in run commands

## Common Pitfalls and Solutions

### Pitfall 1: Secrets in Error Messages

**Problem:**
```yaml
- name: Deploy
  run: |
    deploy --token "${{ secrets.API_TOKEN }}" || echo "Failed with token: ${{ secrets.API_TOKEN }}"
```

**Solution:**
```yaml
- name: Deploy
  run: |
    deploy --token "$API_TOKEN" || echo "Failed to deploy (check token configuration)"
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
```

### Pitfall 2: Secrets in Conditional Expressions

**Problem:**
```yaml
- name: Check token
  if: ${{ secrets.API_TOKEN == 'expected-value' }}
  run: echo "Token matches"
```

**Solution:**
```yaml
- name: Check token
  run: |
    if [ "$API_TOKEN" == "expected-value" ]; then
      echo "Token matches"
    fi
  env:
    API_TOKEN: ${{ secrets.API_TOKEN }}
```

### Pitfall 3: Secrets in Artifact Names

**Problem:**
```yaml
- name: Upload artifact
  uses: actions/upload-artifact@v3
  with:
    name: build-${{ secrets.BUILD_ID }}
    path: ./dist
```

**Solution:**
```yaml
- name: Upload artifact
  uses: actions/upload-artifact@v3
  with:
    name: build-${{ github.run_number }}
    path: ./dist
```

## Security Checklist

Before committing workflow changes, verify:

- [ ] All secrets are accessed via `${{ secrets.NAME }}`
- [ ] All secrets are set in `env` blocks
- [ ] No secrets are used directly in `run` commands
- [ ] No secrets are echoed or printed to logs
- [ ] No secrets are written to files that are displayed
- [ ] No secrets are used in artifact names or paths
- [ ] No secrets are exposed in error messages
- [ ] Automated test script passes: `node scripts/test-secrets-masking.js`
- [ ] Manual review of workflow logs shows `***` for secrets
- [ ] No hardcoded secret patterns in workflow files

## Testing Secrets Masking

### Test Workflow

Create a test workflow to verify masking:

```yaml
name: Test Secrets Masking

on:
  workflow_dispatch:
    inputs:
      test-secret:
        description: 'Test secret value'
        required: true

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Test secret masking
        run: |
          echo "Testing secret masking..."
          echo "Secret length: ${#TEST_SECRET}"
          echo "Secret is configured: $([ -n "$TEST_SECRET" ] && echo "yes" || echo "no")"
          # Secret value should appear as *** in logs
        env:
          TEST_SECRET: ${{ github.event.inputs.test-secret }}
```

### Expected Results

When you run this workflow:
1. The secret value should appear as `***` in logs
2. The secret length should be displayed correctly
3. The "Secret is configured" check should show "yes"
4. No actual secret value should be visible anywhere

## Incident Response

If a secret is accidentally exposed:

1. **Immediate Actions:**
   - Revoke the exposed secret immediately
   - Generate a new secret
   - Update GitHub Secrets with new value
   - Review all workflow logs for exposure

2. **Investigation:**
   - Identify how the secret was exposed
   - Check if secret was used maliciously
   - Review access logs for unauthorized use
   - Document the incident

3. **Prevention:**
   - Fix the workflow that exposed the secret
   - Run automated test script
   - Add additional checks if needed
   - Update documentation

4. **Communication:**
   - Notify team of the incident
   - Document lessons learned
   - Update security procedures
   - Train team on proper secret handling

## Additional Resources

- [GitHub Actions Security Hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)
- [Using Secrets in GitHub Actions](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Security Best Practices](../SECRETS.md)

## Maintenance

This document should be reviewed and updated:
- When new secrets are added to workflows
- When workflow patterns change
- After any security incident
- Quarterly as part of security review
- When GitHub Actions features change

---

**Last Updated:** 2025-01-06  
**Maintained By:** DevOps Team  
**Review Frequency:** Quarterly
