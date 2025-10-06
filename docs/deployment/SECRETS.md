# GitHub Secrets Configuration Guide

## Overview

This document provides instructions for setting up and managing GitHub Secrets required for the CI/CD pipeline. These secrets enable secure authentication with the Visual Studio Code Marketplace and other services without exposing credentials in code or logs.

## Required Secrets

### VSCE_PAT (Visual Studio Code Extension Personal Access Token)

**Purpose:** Authenticates with the VS Code Marketplace to publish extensions

**Required For:**
- Deploy workflow (`deploy.yml`)
- Rollback workflow (`rollback.yml`)

**Permissions Required:**
- Marketplace: Manage (publish and update extensions)

**Rotation Schedule:** Every 90 days

---

## Creating the VSCE_PAT

### Step 1: Access Azure DevOps

1. Navigate to [Azure DevOps](https://dev.azure.com/)
2. Sign in with your Microsoft account (must be the publisher account)
3. Click on your profile icon in the top-right corner
4. Select **Personal access tokens**

### Step 2: Create New Token

1. Click **+ New Token**
2. Configure the token:
   - **Name:** `GitHub Actions - Pragmatic Rhino SUIT`
   - **Organization:** Select your organization (or "All accessible organizations")
   - **Expiration:** 90 days (custom date)
   - **Scopes:** 
     - Select **Custom defined**
     - Expand **Marketplace**
     - Check **Manage** (this includes Acquire and Publish)

3. Click **Create**
4. **IMPORTANT:** Copy the token immediately - it will only be shown once

### Step 3: Verify Publisher Account

Before adding the token, verify you have a publisher account:

1. Navigate to [Visual Studio Marketplace Publisher Management](https://marketplace.visualstudio.com/manage)
2. Sign in with the same Microsoft account
3. Verify your publisher ID (e.g., `pragmatic-rhino`)
4. Ensure the publisher is active and verified

---

## Adding Secrets to GitHub

### Step 1: Navigate to Repository Settings

1. Go to your GitHub repository: `https://github.com/your-org/pragmatic-rhino-suit`
2. Click **Settings** tab
3. In the left sidebar, expand **Secrets and variables**
4. Click **Actions**

### Step 2: Add VSCE_PAT Secret

1. Click **New repository secret**
2. Configure the secret:
   - **Name:** `VSCE_PAT` (must match exactly)
   - **Secret:** Paste the Personal Access Token from Azure DevOps
3. Click **Add secret**

### Step 3: Verify Secret Configuration

1. The secret should now appear in the list as `VSCE_PAT`
2. The value will be masked (shown as `***`)
3. Note the creation date for rotation tracking

---

## Secret Rotation Procedures

### When to Rotate

- **Scheduled:** Every 90 days (before expiration)
- **Immediate:** If token is compromised or exposed
- **Immediate:** If team member with access leaves
- **Immediate:** If suspicious activity detected

### Rotation Process

#### 1. Create New Token

Follow the "Creating the VSCE_PAT" steps above to create a new token with:
- New expiration date (90 days from today)
- Same permissions (Marketplace: Manage)
- Updated name to include date: `GitHub Actions - Pragmatic Rhino SUIT - 2025-01`

#### 2. Update GitHub Secret

1. Navigate to repository **Settings** → **Secrets and variables** → **Actions**
2. Click on `VSCE_PAT` secret
3. Click **Update secret**
4. Paste the new token value
5. Click **Update secret**

#### 3. Verify New Token

1. Trigger a test deployment (create a test release or use manual workflow)
2. Monitor workflow execution for authentication success
3. Verify extension can be published

#### 4. Revoke Old Token

1. Return to [Azure DevOps Personal Access Tokens](https://dev.azure.com/_usersSettings/tokens)
2. Find the old token (check by name and date)
3. Click **Revoke**
4. Confirm revocation

#### 5. Document Rotation

Update the rotation log:
- Date rotated
- Rotated by (team member name)
- New expiration date
- Any issues encountered

---

## Secret Security Best Practices

### Do's ✅

- **Store secrets only in GitHub Secrets** - Never in code, config files, or documentation
- **Use descriptive names** - Include purpose and date in Azure DevOps token names
- **Set expiration dates** - Always use 90-day expiration for tokens
- **Rotate on schedule** - Set calendar reminders for rotation
- **Limit access** - Only repository admins should manage secrets
- **Audit regularly** - Review secret access logs quarterly
- **Document rotation** - Keep a log of when secrets were rotated

### Don'ts ❌

- **Never commit secrets** - Check `.gitignore` includes secret files
- **Never log secrets** - GitHub Actions automatically masks secrets in logs
- **Never share secrets** - Use GitHub's secret sharing features instead
- **Never reuse tokens** - Create separate tokens for different purposes
- **Never skip expiration** - Always set expiration dates
- **Never ignore warnings** - Act immediately on expiration warnings
- **Never use personal accounts** - Use organization/team accounts for tokens

---

## Troubleshooting

### Authentication Failures

**Symptom:** Deploy workflow fails with "Authentication failed" or "401 Unauthorized"

**Possible Causes:**
1. Token expired
2. Token revoked
3. Incorrect token value
4. Insufficient permissions

**Resolution:**
1. Check token expiration in Azure DevOps
2. Verify token has Marketplace: Manage permission
3. Rotate token following rotation procedures
4. Verify publisher account is active

### Token Not Found

**Symptom:** Workflow fails with "Secret VSCE_PAT not found"

**Possible Causes:**
1. Secret not configured in GitHub
2. Secret name mismatch (case-sensitive)
3. Workflow running in forked repository

**Resolution:**
1. Verify secret exists in repository settings
2. Check secret name is exactly `VSCE_PAT`
3. Ensure workflow is running in main repository (not fork)

### Marketplace Rejection

**Symptom:** Authentication succeeds but publish fails with marketplace error

**Possible Causes:**
1. Publisher account suspended
2. Extension violates marketplace policies
3. Version already published
4. Manifest validation errors

**Resolution:**
1. Check publisher account status
2. Review marketplace policy compliance
3. Verify version number is unique
4. Validate extension manifest

### Secret Exposure

**Symptom:** Secret value visible in logs or artifacts

**Immediate Actions:**
1. **Stop all workflows** - Disable workflows immediately
2. **Revoke token** - Revoke the exposed token in Azure DevOps
3. **Rotate secret** - Create new token and update GitHub secret
4. **Audit logs** - Review workflow logs for exposure scope
5. **Notify team** - Alert team members of potential compromise
6. **Review code** - Identify and fix exposure source

**Prevention:**
- GitHub Actions automatically masks secrets in logs
- Never echo or print secret values
- Never write secrets to files or artifacts
- Use secret scanning tools (GitHub Advanced Security)

---

## Secret Expiration Monitoring

### Setting Up Reminders

1. **Calendar Reminders:**
   - Set reminder 2 weeks before expiration
   - Set reminder 1 week before expiration
   - Set reminder 1 day before expiration

2. **Token Naming Convention:**
   - Include expiration date in token name
   - Example: `GitHub Actions - Pragmatic Rhino SUIT - Expires 2025-04-15`

3. **Documentation:**
   - Maintain rotation log with next rotation date
   - Update log after each rotation

### Expiration Warning Signs

- Workflow failures with authentication errors
- Azure DevOps email notifications about expiring tokens
- Marketplace publish failures

### Emergency Rotation

If a token expires unexpectedly:

1. **Create new token immediately** (follow creation steps)
2. **Update GitHub secret** (follow update steps)
3. **Test deployment** (verify new token works)
4. **Document incident** (note what happened and why)
5. **Improve monitoring** (add better expiration tracking)

---

## Access Control

### Who Can Manage Secrets

**Repository Admins:**
- Create, update, and delete secrets
- View secret names (not values)
- Audit secret usage

**Repository Maintainers:**
- View secret names (not values)
- Cannot modify secrets

**Contributors:**
- Cannot view or modify secrets
- Workflows can access secrets when triggered

### Granting Access

To grant secret management access:

1. Navigate to repository **Settings** → **Collaborators and teams**
2. Add user or team
3. Set role to **Admin** for secret management
4. Document access grant in team records

### Revoking Access

When team member leaves:

1. Remove from repository collaborators
2. Rotate all secrets immediately
3. Review recent workflow runs for suspicious activity
4. Document access revocation

---

## Compliance and Audit

### Audit Log Review

**Frequency:** Quarterly

**What to Review:**
- Secret access patterns
- Workflow execution history
- Failed authentication attempts
- Secret modifications

**How to Access:**
1. Navigate to repository **Settings** → **Actions** → **Audit log**
2. Filter by secret name: `VSCE_PAT`
3. Review access events
4. Document findings

### Compliance Requirements

**Security Standards:**
- Secrets encrypted at rest (GitHub provides)
- Secrets masked in logs (GitHub provides)
- Access control enforced (repository settings)
- Rotation schedule followed (90 days)

**Documentation Requirements:**
- Secret purpose documented (this file)
- Rotation procedures documented (this file)
- Access control documented (this file)
- Audit log maintained (GitHub provides)

---

## Rotation Log Template

Maintain a rotation log in your team documentation:

```markdown
## VSCE_PAT Rotation Log

| Date | Rotated By | Expiration Date | Notes |
|------|------------|-----------------|-------|
| 2025-01-15 | Patrick Liekhus | 2025-04-15 | Initial setup |
| 2025-04-10 | [Name] | 2025-07-10 | Scheduled rotation |
| 2025-07-05 | [Name] | 2025-10-05 | Scheduled rotation |
```

---

## Additional Resources

### Official Documentation

- [GitHub Actions Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Azure DevOps Personal Access Tokens](https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate)
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)

### Support Contacts

- **GitHub Support:** https://support.github.com/
- **Azure DevOps Support:** https://azure.microsoft.com/en-us/support/devops/
- **VS Code Marketplace Support:** https://aka.ms/vsmarketplace-support

### Team Contacts

- **Repository Admin:** [Name/Email]
- **Security Lead:** [Name/Email]
- **DevOps Lead:** [Name/Email]

---

## Quick Reference

### Secret Names

| Secret Name | Purpose | Rotation |
|-------------|---------|----------|
| `VSCE_PAT` | Marketplace authentication | 90 days |

### Common Commands

```bash
# Test token locally (DO NOT commit this script)
vsce login <publisher-name>
# Enter token when prompted

# Verify publisher
vsce show <publisher-name>

# Test publish (dry run)
vsce publish --dry-run
```

### Emergency Contacts

If you encounter issues with secrets:

1. **Check this documentation first**
2. **Review troubleshooting section**
3. **Contact repository admin**
4. **Escalate to security team if compromise suspected**

---

## Document Maintenance

**Last Updated:** 2025-01-10  
**Next Review:** 2025-04-10  
**Owner:** DevOps Team  
**Reviewers:** Security Team, Repository Admins

**Change Log:**
- 2025-01-10: Initial documentation created
