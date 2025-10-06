# Manual Trigger Guide: GitHub Actions Workflows

## Overview

This guide provides step-by-step instructions for manually triggering GitHub Actions workflows for the Pragmatic Rhino SUIT VS Code extension. Manual triggers are used for rollback operations, emergency deployments, and testing purposes.

**Target Audience:** Repository maintainers, DevOps engineers, release managers

**Prerequisites:**
- GitHub repository access with Actions permissions
- Understanding of workflow purposes
- Familiarity with GitHub Actions interface

---

## Table of Contents

1. [Rollback Workflow](#rollback-workflow)
2. [Manual Deployment Workflow](#manual-deployment-workflow)
3. [Emergency Procedures](#emergency-procedures)
4. [Testing Workflows](#testing-workflows)
5. [Troubleshooting Manual Triggers](#troubleshooting-manual-triggers)

---

## Rollback Workflow

### Purpose

The rollback workflow allows you to quickly republish a previous version of the extension to the VS Code Marketplace when the current version has critical issues.

### When to Use

Trigger a rollback immediately if:
- Extension causes VS Code crashes
- Critical bugs affect core functionality
- Security vulnerability discovered
- High error rate reported on marketplace
- Extension fails to activate for users

### Access Requirements

- Repository maintainer or admin role
- Access to GitHub Actions tab
- Knowledge of target rollback version

### Step-by-Step Instructions

#### 1. Navigate to Rollback Workflow

1. Open the GitHub repository in your browser
2. Click the **Actions** tab at the top
3. In the left sidebar, find and click **Rollback Deployment**

![Actions Tab Location](../../resources/images/github-actions-tab.png)

#### 2. Initiate Manual Trigger

1. On the workflow page, click the **Run workflow** button (top right)
2. A dropdown panel will appear with input fields

![Run Workflow Button](../../resources/images/run-workflow-button.png)

#### 3. Configure Rollback Parameters

**Branch Selection:**
- Select `main` from the "Use workflow from" dropdown
- This ensures you're using the latest workflow definition

**Version Input:**
- In the "Version to rollback to" field, enter the target version tag
- Format: `v1.2.2` (include the `v` prefix)
- Example: If rolling back from v1.2.3, enter `v1.2.2`

**How to Find Previous Versions:**
```bash
# List recent version tags
git tag --sort=-version:refname | head -10

# Or check GitHub Releases page
# Navigate to: https://github.com/your-org/pragmatic-rhino-suit/releases
```

#### 4. Execute Rollback

1. Review the version number carefully
2. Click the green **Run workflow** button
3. The workflow will start immediately

#### 5. Monitor Rollback Progress

1. The workflow run will appear at the top of the runs list
2. Click on the run to view detailed progress
3. Monitor each job:
   - **Download Artifact**: Retrieves the VSIX for the target version
   - **Validate Artifact**: Ensures the VSIX file is valid
   - **Publish to Marketplace**: Republishes the extension
   - **Verify Deployment**: Confirms the rollback succeeded
   - **Update Documentation**: Posts rollback information

**Expected Duration:** 10-25 minutes
- Workflow execution: 5-10 minutes
- Marketplace processing: 5-15 minutes

#### 6. Verify Rollback Success

**Check Workflow Status:**
- Ensure all jobs completed successfully (green checkmarks)
- Review the workflow summary for any warnings

**Verify Marketplace:**
```bash
# Check current marketplace version
vsce show pragmatic-rhino.pragmatic-rhino-suit

# Expected output should show the rolled-back version
```

**Test Extension:**
1. Install the extension from marketplace
2. Verify it activates correctly
3. Test core functionality

#### 7. Post-Rollback Actions

1. **Update GitHub Release:**
   - Navigate to the problematic release
   - Add a comment: "⚠️ Rolled back to v1.2.2 due to [reason]"

2. **Notify Team:**
   - Post in team chat/Slack
   - Include rollback reason and version
   - Link to incident tracking issue

3. **Create Incident Report:**
   - Document the issue that triggered rollback
   - Record timeline of events
   - Plan remediation steps

### Rollback Workflow Inputs

| Input Field | Required | Format | Example | Description |
|-------------|----------|--------|---------|-------------|
| Use workflow from | Yes | Branch name | `main` | Branch containing workflow definition |
| Version to rollback to | Yes | `vX.Y.Z` | `v1.2.2` | Target version tag (must exist) |

### Common Rollback Scenarios

**Scenario 1: Extension Crashes on Activation**
```
Version: v1.2.3 → v1.2.2
Reason: Null pointer exception in activation code
Action: Immediate rollback, hotfix in progress
```

**Scenario 2: Breaking Change Not Documented**
```
Version: v2.0.0 → v1.9.5
Reason: API breaking change affects user workflows
Action: Rollback, update migration guide, re-release
```

**Scenario 3: Performance Regression**
```
Version: v1.5.0 → v1.4.9
Reason: Extension activation time increased 10x
Action: Rollback, profile code, optimize, re-release
```

### Rollback Limitations

**Artifact Retention:**
- VSIX artifacts are retained for 90 days
- Cannot rollback to versions older than 90 days
- Mitigation: Rebuild from git tag if artifact unavailable

**Marketplace Constraints:**
- Cannot rollback to a version that was unpublished
- Marketplace may cache versions for 15-30 minutes
- Users may need to restart VS Code to get rolled-back version

**Version Constraints:**
- Cannot rollback to a version that doesn't exist
- Cannot rollback to a pre-release version (unless explicitly published)

---

## Manual Deployment Workflow

### Purpose

Manual deployment allows you to publish the extension to the marketplace without going through the automated release process. This is used for emergency hotfixes or when the CI/CD pipeline is unavailable.

### When to Use

Use manual deployment only when:
- CI/CD pipeline is down or unavailable
- Emergency hotfix required outside normal release cycle
- Testing deployment process in staging environment
- Recovering from failed automated deployment

### Access Requirements

- Repository admin role
- VSCE_PAT secret value (from GitHub Secrets)
- Local development environment set up
- vsce CLI installed globally

### Step-by-Step Instructions

#### 1. Prepare Local Environment

```bash
# Clone repository (if not already cloned)
git clone https://github.com/your-org/pragmatic-rhino-suit.git
cd pragmatic-rhino-suit

# Fetch all tags
git fetch --all --tags

# Checkout the version to deploy
git checkout tags/v1.2.3  # Replace with target version

# Clean previous builds
rm -rf node_modules out *.vsix
```

#### 2. Install Dependencies

```bash
# Install production dependencies only
npm ci --production

# Verify installation succeeded
npm list --depth=0
```

#### 3. Build Extension

```bash
# Compile TypeScript
npm run compile

# Verify compilation succeeded
ls -la out/

# Expected: out/ directory contains compiled JavaScript files
```

#### 4. Run Pre-Deployment Tests

```bash
# Install dev dependencies for testing
npm ci

# Run full test suite
npm test

# Check code coverage
npm run test:coverage

# Verify coverage meets 80% threshold
# Check coverage/index.html for detailed report
```

#### 5. Create VSIX Package

```bash
# Package the extension
vsce package

# Verify VSIX created
ls -la *.vsix

# Expected output: pragmatic-rhino-suit-1.2.3.vsix
```

#### 6. Validate Package

```bash
# List package contents
vsce ls

# Verify manifest version
unzip -p pragmatic-rhino-suit-1.2.3.vsix extension/package.json | jq .version

# Expected: "1.2.3" (matches tag)

# Check package size
ls -lh pragmatic-rhino-suit-1.2.3.vsix

# Expected: < 10 MB (typical extension size)
```

#### 7. Obtain VSCE_PAT

**From GitHub Secrets:**
1. Navigate to repository Settings
2. Click **Secrets and variables** → **Actions**
3. Find `VSCE_PAT` secret
4. Click **Update** to view value (requires admin access)
5. Copy the token value

**⚠️ Security Warning:**
- Never commit the token to version control
- Never share the token in chat or email
- Clear the token from your environment after use
- Rotate the token if it may have been exposed

#### 8. Publish to Marketplace

```bash
# Set VSCE_PAT environment variable
export VSCE_PAT="your-personal-access-token-here"

# Publish the extension
vsce publish --packagePath pragmatic-rhino-suit-1.2.3.vsix

# Expected output:
# Publishing pragmatic-rhino.pragmatic-rhino-suit@1.2.3...
# Successfully published pragmatic-rhino.pragmatic-rhino-suit@1.2.3!

# Clear the token immediately
unset VSCE_PAT
```

**Alternative: Publish Without Storing Token**
```bash
# Publish with inline token (more secure)
VSCE_PAT="your-token" vsce publish --packagePath pragmatic-rhino-suit-1.2.3.vsix
```

#### 9. Verify Deployment

```bash
# Check marketplace version
vsce show pragmatic-rhino.pragmatic-rhino-suit

# Expected: Latest version should be 1.2.3

# Test installation
code --install-extension pragmatic-rhino.pragmatic-rhino-suit

# Verify extension activates
# Open VS Code and check Extensions view
```

#### 10. Post-Deployment Tasks

1. **Update GitHub Release:**
   - Navigate to the release on GitHub
   - Add comment: "✅ Manually deployed to marketplace at [timestamp]"
   - Include deployment reason

2. **Notify Team:**
   - Post in team chat: "Extension v1.2.3 manually deployed"
   - Include marketplace link
   - Note reason for manual deployment

3. **Document Deployment:**
   - Update deployment log
   - Record manual deployment reason
   - Note any issues encountered

### Manual Deployment Checklist

- [ ] Local environment prepared and clean
- [ ] Correct version tag checked out
- [ ] Production dependencies installed
- [ ] Extension compiled successfully
- [ ] All tests passed (80%+ coverage)
- [ ] VSIX package created and validated
- [ ] VSCE_PAT obtained securely
- [ ] Extension published to marketplace
- [ ] Marketplace version verified
- [ ] Extension tested (install and activate)
- [ ] GitHub release updated with deployment note
- [ ] Team notified of manual deployment
- [ ] Deployment documented in log
- [ ] VSCE_PAT cleared from environment

### Manual Deployment Troubleshooting

**Issue: Authentication Failed**
```
Error: Failed request: (401) Unauthorized
```

**Solution:**
1. Verify VSCE_PAT is correct (no extra spaces)
2. Check token hasn't expired (90-day lifetime)
3. Verify token has "Marketplace: Manage" permission
4. Rotate token if necessary (see [SECRETS.md](./SECRETS.md))

**Issue: Version Already Exists**
```
Error: Extension 'pragmatic-rhino.pragmatic-rhino-suit' version 1.2.3 already exists
```

**Solution:**
1. Verify you're deploying the correct version
2. Check if version was already published
3. If this is a re-deployment, you cannot republish the same version
4. Bump version number and create new tag

**Issue: Package Validation Failed**
```
Error: Make sure to edit the README.md file before you publish your extension
```

**Solution:**
1. Ensure README.md is not the default template
2. Verify all required files are included
3. Check package.json has all required fields
4. Review [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

---

## Emergency Procedures

### Critical Failure Response

**Definition:** Extension causes VS Code crashes, data loss, or security breaches requiring immediate action.

### Emergency Rollback (Fastest Path)

**Timeline: Complete within 15 minutes**

#### Quick Steps

1. **Assess Severity** (2 minutes)
   - Determine impact scope
   - Identify affected users
   - Check error reports

2. **Initiate Rollback** (3 minutes)
   - Navigate to Actions → Rollback Deployment
   - Click Run workflow
   - Enter last known good version (e.g., `v1.2.2`)
   - Click Run workflow

3. **Monitor Progress** (5-10 minutes)
   - Watch workflow execution
   - Verify each job completes
   - Check for any errors

4. **Verify Success** (2 minutes)
   - Check marketplace shows rolled-back version
   - Test extension installation
   - Confirm issue resolved

5. **Notify Stakeholders** (3 minutes)
   - Post in emergency channel
   - Alert repository admins
   - Update status page (if applicable)

### Emergency Hotfix Deployment

**Timeline: Complete within 1 hour**

#### Quick Steps

1. **Create Hotfix Branch** (5 minutes)
   ```bash
   git checkout -b hotfix/critical-bug main
   ```

2. **Implement Fix** (20 minutes)
   - Write minimal fix
   - Add test to verify fix
   - Verify fix resolves issue

3. **Test Thoroughly** (15 minutes)
   ```bash
   npm test
   npm run test:coverage
   # Manual testing in VS Code
   ```

4. **Deploy Manually** (15 minutes)
   - Follow manual deployment steps 1-9
   - Skip normal release process
   - Deploy directly to marketplace

5. **Verify and Communicate** (5 minutes)
   - Verify hotfix deployed
   - Test in production
   - Notify team and users

### Emergency Contact Escalation

| Severity | Response Time | Contact | Action |
|----------|---------------|---------|--------|
| P0 - Critical | Immediate | Repository Admin | Initiate emergency rollback |
| P1 - High | < 15 min | DevOps Lead | Assess and coordinate response |
| P2 - Medium | < 1 hour | Team Lead | Plan and execute fix |
| P3 - Low | < 4 hours | Developer | Create fix in normal workflow |

### Emergency Decision Tree

```
Critical Issue Detected
    ├─ Can rollback fix it?
    │   ├─ Yes → Execute emergency rollback (15 min)
    │   └─ No → Continue to hotfix
    │
    ├─ Is hotfix simple?
    │   ├─ Yes → Deploy emergency hotfix (1 hour)
    │   └─ No → Continue to workaround
    │
    └─ Can provide workaround?
        ├─ Yes → Document workaround, plan proper fix
        └─ No → Consider unpublishing extension
```

### Post-Emergency Actions

**Within 24 Hours:**
- [ ] Complete incident report
- [ ] Analyze root cause
- [ ] Identify preventive measures
- [ ] Update monitoring/alerting

**Within 1 Week:**
- [ ] Implement preventive measures
- [ ] Add tests to prevent recurrence
- [ ] Update documentation
- [ ] Conduct team retrospective

---

## Testing Workflows

### Purpose

Test workflows manually to verify they work correctly before relying on them in production scenarios.

### When to Test

- After modifying workflow files
- Quarterly rollback procedure testing
- Before major releases
- After infrastructure changes
- During team training

### Testing Rollback Workflow

**Objective:** Verify rollback workflow can successfully republish a previous version

**Prerequisites:**
- At least 2 published versions exist
- VSIX artifacts available for both versions

**Test Steps:**

1. **Identify Test Versions:**
   - Current version: v1.2.3
   - Rollback target: v1.2.2

2. **Execute Rollback:**
   - Navigate to Actions → Rollback Deployment
   - Run workflow with version `v1.2.2`
   - Monitor execution

3. **Verify Results:**
   - Workflow completes successfully
   - Marketplace shows v1.2.2
   - Extension installs and activates

4. **Restore Current Version:**
   - Run rollback workflow again
   - Enter current version `v1.2.3`
   - Verify restoration succeeds

**Expected Outcome:**
- Both rollback operations succeed
- No errors in workflow logs
- Marketplace reflects correct versions
- Extension functions normally

### Testing Manual Deployment

**Objective:** Verify manual deployment process works end-to-end

**Prerequisites:**
- Local development environment set up
- VSCE_PAT available
- Test version prepared

**Test Steps:**

1. **Prepare Test Version:**
   ```bash
   # Create test branch
   git checkout -b test/manual-deployment main
   
   # Make trivial change (e.g., update README)
   echo "Test deployment" >> README.md
   
   # Commit change
   git add README.md
   git commit -m "test: manual deployment test"
   ```

2. **Follow Manual Deployment Steps:**
   - Execute steps 1-9 from Manual Deployment section
   - Use a test version number (e.g., v1.2.3-test)

3. **Verify Deployment:**
   - Check marketplace shows test version
   - Install and test extension
   - Verify no issues

4. **Clean Up:**
   - Unpublish test version (if possible)
   - Delete test branch
   - Document test results

**Expected Outcome:**
- Manual deployment completes without errors
- Extension publishes successfully
- All steps documented and clear

### Quarterly Rollback Testing

**Schedule:** Every 3 months (January, April, July, October)

**Purpose:** Ensure rollback capability remains functional

**Test Plan:**

1. **Week 1: Plan**
   - Schedule test window
   - Identify test versions
   - Notify team of test

2. **Week 2: Execute**
   - Perform rollback test
   - Document any issues
   - Verify artifact availability

3. **Week 3: Review**
   - Analyze test results
   - Update procedures if needed
   - Train team on any changes

4. **Week 4: Document**
   - Update runbook
   - Record test completion
   - Schedule next test

---

## Troubleshooting Manual Triggers

### Workflow Not Appearing

**Symptom:** Cannot find workflow in Actions tab

**Possible Causes:**
- Workflow file not in `.github/workflows/` directory
- Workflow file has syntax errors
- Workflow not configured for manual trigger

**Solution:**
1. Verify workflow file exists:
   ```bash
   ls -la .github/workflows/rollback.yml
   ```

2. Check workflow syntax:
   ```bash
   # Use GitHub CLI to validate
   gh workflow view rollback.yml
   ```

3. Verify `workflow_dispatch` trigger:
   ```yaml
   on:
     workflow_dispatch:
       inputs:
         version:
           description: 'Version to rollback to'
           required: true
   ```

### Run Workflow Button Disabled

**Symptom:** "Run workflow" button is grayed out

**Possible Causes:**
- Insufficient permissions
- Workflow disabled
- Branch protection rules

**Solution:**
1. Check your repository role (need write access minimum)
2. Verify workflow is enabled:
   - Actions tab → Select workflow
   - Check for "This workflow is disabled" message
   - Click "Enable workflow" if disabled

3. Check branch protection:
   - Settings → Branches
   - Verify you can push to target branch

### Workflow Fails Immediately

**Symptom:** Workflow fails within seconds of starting

**Possible Causes:**
- Invalid input parameters
- Missing secrets
- Syntax errors in workflow

**Solution:**
1. Check workflow logs for error message
2. Verify input parameters are correct format
3. Check required secrets exist:
   - Settings → Secrets and variables → Actions
   - Verify VSCE_PAT exists

4. Review workflow file for syntax errors

### Artifact Not Found Error

**Symptom:** Rollback fails with "Artifact not found"

**Possible Causes:**
- Artifact expired (> 90 days old)
- Package workflow never ran for that version
- Artifact was manually deleted

**Solution:**
1. Check artifact age:
   ```bash
   # Find package workflow run for version
   gh run list --workflow=package.yml --limit=20
   ```

2. If artifact expired, rebuild from tag:
   ```bash
   git checkout tags/v1.2.2
   # Follow manual deployment steps to create VSIX
   ```

3. Upload artifact manually (if needed):
   - Create VSIX locally
   - Upload to GitHub release as asset
   - Modify rollback workflow to download from release

### Authentication Failures

**Symptom:** Workflow fails with "401 Unauthorized"

**Possible Causes:**
- VSCE_PAT expired
- VSCE_PAT has insufficient permissions
- VSCE_PAT not configured

**Solution:**
1. Verify secret exists:
   - Settings → Secrets and variables → Actions
   - Check VSCE_PAT is listed

2. Rotate token:
   - Follow [SECRETS.md](./SECRETS.md) rotation procedure
   - Update GitHub secret with new token

3. Verify token permissions:
   - Token must have "Marketplace: Manage" permission
   - Check in Azure DevOps personal access tokens

### Marketplace Rejection

**Symptom:** Publish succeeds but extension not visible

**Possible Causes:**
- Marketplace validation failed
- Extension violates policies
- Temporary marketplace issue

**Solution:**
1. Check marketplace email for rejection notice
2. Review [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)
3. Check publisher dashboard for validation errors
4. Contact marketplace support if no clear reason

---

## Best Practices

### Before Triggering Manual Workflows

1. **Verify Necessity:**
   - Is manual trigger really needed?
   - Can automated workflow be used instead?
   - Is this an emergency or can it wait?

2. **Check Prerequisites:**
   - Required secrets configured
   - Artifacts available
   - Permissions granted

3. **Notify Team:**
   - Announce manual trigger in team chat
   - Explain reason for manual intervention
   - Coordinate with other team members

4. **Document Intent:**
   - Record why manual trigger is needed
   - Note expected outcome
   - Plan verification steps

### During Workflow Execution

1. **Monitor Actively:**
   - Watch workflow progress in real-time
   - Check logs for warnings or errors
   - Be ready to intervene if needed

2. **Verify Each Step:**
   - Ensure each job completes successfully
   - Review job outputs
   - Check for unexpected behavior

3. **Stay Available:**
   - Don't start manual trigger and walk away
   - Be ready to troubleshoot issues
   - Have rollback plan ready

### After Workflow Completion

1. **Verify Success:**
   - Check expected outcome achieved
   - Test functionality
   - Verify no side effects

2. **Document Results:**
   - Record what was done
   - Note any issues encountered
   - Update procedures if needed

3. **Communicate:**
   - Notify team of completion
   - Share results and learnings
   - Update relevant documentation

---

## Quick Reference

### Rollback Workflow

```
Actions → Rollback Deployment → Run workflow
├─ Branch: main
└─ Version: v1.2.2 (previous stable version)
```

**Duration:** 10-25 minutes  
**Use Case:** Critical bug in current version

### Manual Deployment

```bash
git checkout tags/v1.2.3
npm ci --production
npm run compile
vsce package
VSCE_PAT="token" vsce publish --packagePath pragmatic-rhino-suit-1.2.3.vsix
```

**Duration:** 30-45 minutes  
**Use Case:** CI/CD unavailable, emergency hotfix

### Emergency Rollback

```
1. Actions → Rollback Deployment
2. Run workflow with last known good version
3. Monitor progress (10-25 min)
4. Verify marketplace updated
5. Notify team
```

**Duration:** 15-30 minutes  
**Use Case:** Critical failure requiring immediate action

---

## Additional Resources

### Related Documentation

- [RUNBOOK.md](./RUNBOOK.md) - Complete deployment procedures
- [SECRETS.md](./SECRETS.md) - GitHub Secrets configuration
- [WORKFLOWS.md](./WORKFLOWS.md) - Workflow documentation
- [ENVIRONMENT_CONFIGURATION.md](./ENVIRONMENT_CONFIGURATION.md) - Environment setup

### External Resources

- [GitHub Actions Manual Triggers](https://docs.github.com/en/actions/using-workflows/manually-running-a-workflow)
- [VS Code Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Documentation](https://github.com/microsoft/vscode-vsce)

### Support

- **Team Chat:** [Slack/Teams channel]
- **On-Call:** [PagerDuty/rotation schedule]
- **GitHub Issues:** [Repository issues page]

---

## Document Maintenance

**Last Updated:** 2025-01-10  
**Next Review:** 2025-04-10  
**Owner:** DevOps Team  
**Reviewers:** Release Managers, Repository Maintainers

**Change Log:**
- 2025-01-10: Initial manual triggers guide created

---

**End of Manual Trigger Guide**
