# Audit Logging Guide

## Overview

This document describes the audit logging capabilities for the Pragmatic Rhino SUIT CI/CD pipeline. Audit logs provide a complete record of all workflow executions, deployments, and security-relevant events for compliance, troubleshooting, and security analysis.

**Target Audience:** DevOps engineers, security engineers, compliance officers, repository administrators

**Prerequisites:**
- Repository admin access for audit log configuration
- Understanding of GitHub Actions workflows
- Familiarity with GitHub audit log API

---

## Table of Contents

1. [Audit Log Types](#audit-log-types)
2. [Enabling Audit Logs](#enabling-audit-logs)
3. [Log Retention Configuration](#log-retention-configuration)
4. [Accessing Audit Logs](#accessing-audit-logs)
5. [Audit Log Events](#audit-log-events)
6. [Log Analysis and Monitoring](#log-analysis-and-monitoring)
7. [Compliance and Reporting](#compliance-and-reporting)
8. [Security Considerations](#security-considerations)

---

## Audit Log Types

### 1. GitHub Actions Workflow Logs

**Purpose:** Track all workflow executions, job results, and step outputs

**Includes:**
- Workflow trigger events (push, PR, release, manual)
- Job execution status (queued, in_progress, completed, failed)
- Step-by-step execution logs
- Artifact uploads and downloads
- Secret access (masked values)
- Deployment approvals and rejections

**Retention:** 90 days (GitHub default)

**Access:** Repository admins, workflow runners

### 2. GitHub Audit Logs

**Purpose:** Track repository and organization-level security events

**Includes:**
- Secret creation, updates, and deletions
- Workflow file modifications
- Repository settings changes
- Access permission changes
- Branch protection rule changes
- Deployment environment configuration changes

**Retention:** 
- GitHub Free/Pro: 90 days
- GitHub Enterprise: 180 days (configurable up to 25 months)

**Access:** Organization owners, repository admins

### 3. Deployment Audit Logs

**Purpose:** Track all deployment activities and marketplace interactions

**Includes:**
- VSIX package creation events
- Marketplace authentication attempts
- Extension publish events
- Deployment success/failure events
- Rollback executions
- Manual deployment interventions

**Retention:** Indefinite (stored in workflow logs and release comments)

**Access:** Repository admins, release managers

### 4. Security Audit Logs

**Purpose:** Track security-relevant events and vulnerability findings

**Includes:**
- Dependency vulnerability scan results
- Secret scanning alerts
- Code scanning alerts (if enabled)
- Authentication failures
- Unauthorized access attempts

**Retention:** Indefinite (GitHub Security tab)

**Access:** Security team, repository admins

---

## Enabling Audit Logs

### GitHub Actions Workflow Logs

**Status:** Enabled by default for all workflows

**No configuration required.** All workflow executions automatically generate logs.

**Verification:**
1. Navigate to repository **Actions** tab
2. Select any workflow run
3. Verify logs are visible for all jobs and steps

### GitHub Audit Logs

**Organization-Level Audit Log:**

1. Navigate to organization **Settings**
2. Click **Audit log** in left sidebar
3. Verify audit log is enabled (enabled by default)

**Repository-Level Audit Log:**

1. Navigate to repository **Settings**
2. Click **Security & analysis**
3. Verify audit log streaming is configured (Enterprise only)

**API Access:**

```bash
# List organization audit log events
gh api /orgs/{org}/audit-log

# List repository events (Enterprise only)
gh api /repos/{owner}/{repo}/audit-log
```

### Deployment Audit Logs

**Automatic Logging:**

All deployment workflows automatically log events through:
- Workflow execution logs
- GitHub release comments
- Notification messages

**Manual Logging:**

For manual deployments, maintainers must:
1. Document deployment in release comments
2. Record in deployment log (see RUNBOOK.md)
3. Notify team through configured channels

### Security Audit Logs

**Enable Security Features:**

1. Navigate to repository **Settings** → **Security & analysis**
2. Enable the following features:
   - **Dependency graph:** Enabled
   - **Dependabot alerts:** Enabled
   - **Dependabot security updates:** Enabled
   - **Secret scanning:** Enabled (requires GitHub Advanced Security)
   - **Code scanning:** Enabled (requires GitHub Advanced Security)

**Verification:**
1. Navigate to repository **Security** tab
2. Verify alerts are being tracked
3. Check **Security advisories** for vulnerability reports

---

## Log Retention Configuration

### Workflow Log Retention

**Default Retention:** 90 days

**Custom Retention (Enterprise only):**

1. Navigate to organization **Settings**
2. Click **Actions** → **General**
3. Under **Artifact and log retention**, set custom retention period
4. Options: 1-400 days
5. Click **Save**

**Recommendation:** 
- Development/staging: 90 days (default)
- Production: 180 days (for compliance)
- Critical workflows: 365 days (for audit trail)

### Artifact Retention

**Current Configuration:**

| Artifact Type | Retention Period | Reason |
|---------------|------------------|--------|
| Test results | 30 days | Short-term debugging |
| Coverage reports | 30 days | Short-term analysis |
| VSIX packages | 90 days | Rollback capability |

**Configured in workflows:**

```yaml
- name: Upload artifact
  uses: actions/upload-artifact@v4
  with:
    name: vsix-package
    path: "*.vsix"
    retention-days: 90  # Configurable per artifact
```

**Extending Retention:**

For critical versions, archive artifacts externally:

```bash
# Download artifact from GitHub
gh run download <run-id> --name vsix-package

# Upload to external storage (Azure Blob, S3, etc.)
az storage blob upload \
  --account-name <storage-account> \
  --container-name vsix-archive \
  --name pragmatic-rhino-suit-1.2.3.vsix \
  --file pragmatic-rhino-suit-1.2.3.vsix
```

### Audit Log Retention

**GitHub Audit Log Retention:**

| Plan | Default Retention | Maximum Retention |
|------|-------------------|-------------------|
| Free/Pro | 90 days | 90 days |
| Enterprise Cloud | 180 days | 25 months |
| Enterprise Server | 180 days | Configurable |

**Extending Retention (Enterprise):**

1. Navigate to organization **Settings** → **Audit log**
2. Click **Configure** under **Log streaming**
3. Set up streaming to external system:
   - Azure Event Hubs
   - Amazon EventBridge
   - Splunk
   - Datadog
4. Configure retention in external system (indefinite possible)

**Recommendation:**
- Compliance requirements: Stream to external system
- Long-term retention: Use external storage
- Real-time monitoring: Stream to SIEM

---

## Accessing Audit Logs

### Via GitHub Web Interface

**Workflow Logs:**

1. Navigate to repository **Actions** tab
2. Select workflow (e.g., "Deploy to Marketplace")
3. Click on specific workflow run
4. View job logs and step details
5. Download logs using **Download log archive** button

**Audit Logs:**

1. Navigate to organization **Settings**
2. Click **Audit log** in left sidebar
3. Filter by:
   - Event type (e.g., `workflow_run`, `secret.create`)
   - Actor (user who triggered event)
   - Date range
4. Export logs using **Export** button (CSV or JSON)

**Security Logs:**

1. Navigate to repository **Security** tab
2. Click **Dependabot alerts** or **Code scanning alerts**
3. View vulnerability details and remediation status
4. Export alerts using GitHub API

### Via GitHub CLI

**Workflow Logs:**

```bash
# List recent workflow runs
gh run list --workflow=deploy.yml --limit=10

# View specific run logs
gh run view <run-id> --log

# Download run logs
gh run download <run-id> --name logs
```

**Audit Logs:**

```bash
# List organization audit log events
gh api /orgs/{org}/audit-log \
  --jq '.[] | {action, actor, created_at}'

# Filter by event type
gh api /orgs/{org}/audit-log \
  --field phrase="action:workflow_run" \
  --jq '.[] | {action, actor, created_at, workflow_run_id}'

# Export to JSON
gh api /orgs/{org}/audit-log > audit-log.json
```

**Security Alerts:**

```bash
# List Dependabot alerts
gh api /repos/{owner}/{repo}/dependabot/alerts

# List secret scanning alerts
gh api /repos/{owner}/{repo}/secret-scanning/alerts

# List code scanning alerts
gh api /repos/{owner}/{repo}/code-scanning/alerts
```

### Via GitHub API

**Authentication:**

```bash
# Set GitHub token
export GITHUB_TOKEN="ghp_your_token_here"

# Or use GitHub CLI authentication
gh auth login
```

**Workflow Runs API:**

```bash
# List workflow runs
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/{owner}/{repo}/actions/runs

# Get specific run
curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}

# Download run logs
curl -L -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/repos/{owner}/{repo}/actions/runs/{run_id}/logs \
  -o logs.zip
```

**Audit Log API:**

```bash
# Get organization audit log
curl -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/orgs/{org}/audit-log?phrase=action:workflow_run"

# Filter by date
curl -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/orgs/{org}/audit-log?phrase=created:2025-01-01..2025-01-31"

# Filter by actor
curl -H "Authorization: token $GITHUB_TOKEN" \
  "https://api.github.com/orgs/{org}/audit-log?phrase=actor:username"
```

### Automated Log Collection

**Daily Log Export Script:**

```bash
#!/bin/bash
# export-audit-logs.sh

ORG="your-org"
REPO="pragmatic-rhino-suit"
DATE=$(date +%Y-%m-%d)
OUTPUT_DIR="audit-logs/$DATE"

mkdir -p "$OUTPUT_DIR"

# Export workflow runs
gh api "/repos/$ORG/$REPO/actions/runs?per_page=100" \
  > "$OUTPUT_DIR/workflow-runs.json"

# Export audit log
gh api "/orgs/$ORG/audit-log?per_page=100" \
  > "$OUTPUT_DIR/audit-log.json"

# Export security alerts
gh api "/repos/$ORG/$REPO/dependabot/alerts" \
  > "$OUTPUT_DIR/dependabot-alerts.json"

echo "Logs exported to $OUTPUT_DIR"
```

**Schedule with cron:**

```bash
# Run daily at 2 AM
0 2 * * * /path/to/export-audit-logs.sh
```

---

## Audit Log Events

### Workflow Execution Events

| Event | Description | Logged Information |
|-------|-------------|-------------------|
| `workflow_run.requested` | Workflow triggered | Trigger type, branch, actor, commit SHA |
| `workflow_run.in_progress` | Workflow started | Start time, runner, job queue time |
| `workflow_run.completed` | Workflow finished | End time, status, conclusion, duration |
| `workflow_job.queued` | Job queued | Job name, runner labels, dependencies |
| `workflow_job.in_progress` | Job started | Start time, runner name, steps |
| `workflow_job.completed` | Job finished | End time, status, conclusion, logs |

### Deployment Events

| Event | Description | Logged Information |
|-------|-------------|-------------------|
| `deployment.created` | Deployment initiated | Environment, ref, creator, payload |
| `deployment_status.created` | Deployment status updated | State, description, log URL |
| `release.published` | Release created | Tag, name, body, author |
| `release.edited` | Release modified | Changes, editor, timestamp |

### Security Events

| Event | Description | Logged Information |
|-------|-------------|-------------------|
| `secret.created` | Secret added | Secret name, creator, timestamp |
| `secret.updated` | Secret modified | Secret name, updater, timestamp |
| `secret.deleted` | Secret removed | Secret name, deleter, timestamp |
| `secret_scanning_alert.created` | Secret detected in code | Secret type, location, severity |
| `dependabot_alert.created` | Vulnerability detected | Package, severity, CVE |
| `code_scanning_alert.created` | Code issue detected | Rule, severity, location |

### Repository Events

| Event | Description | Logged Information |
|-------|-------------|-------------------|
| `repo.access` | Repository accessed | Actor, IP address, timestamp |
| `repo.archived` | Repository archived | Actor, timestamp |
| `repo.unarchived` | Repository unarchived | Actor, timestamp |
| `protected_branch.create` | Branch protection added | Branch, rules, creator |
| `protected_branch.update` | Branch protection modified | Branch, changes, updater |
| `protected_branch.destroy` | Branch protection removed | Branch, remover |

### Access Control Events

| Event | Description | Logged Information |
|-------|-------------|-------------------|
| `member.added` | User added to repo | User, role, inviter |
| `member.removed` | User removed from repo | User, remover |
| `member.updated` | User permissions changed | User, old role, new role, updater |
| `team.add_repository` | Team granted access | Team, permission level |
| `team.remove_repository` | Team access revoked | Team, revoker |

---

## Log Analysis and Monitoring

### Key Metrics to Track

**Deployment Metrics:**

```bash
# Count deployments per day
gh api /repos/{owner}/{repo}/actions/runs \
  --jq '[.workflow_runs[] | select(.name=="Deploy to Marketplace")] | length'

# Calculate deployment success rate
gh api /repos/{owner}/{repo}/actions/runs \
  --jq '[.workflow_runs[] | select(.name=="Deploy to Marketplace")] | 
        {total: length, success: [.[] | select(.conclusion=="success")] | length} |
        {success_rate: (.success / .total * 100)}'
```

**Security Metrics:**

```bash
# Count open security alerts
gh api /repos/{owner}/{repo}/dependabot/alerts \
  --jq '[.[] | select(.state=="open")] | length'

# Count critical vulnerabilities
gh api /repos/{owner}/{repo}/dependabot/alerts \
  --jq '[.[] | select(.security_advisory.severity=="critical")] | length'
```

**Access Metrics:**

```bash
# Count secret access events
gh api /orgs/{org}/audit-log \
  --field phrase="action:secret.read" \
  --jq 'length'

# List users who accessed secrets
gh api /orgs/{org}/audit-log \
  --field phrase="action:secret.read" \
  --jq '[.[] | .actor] | unique'
```

### Automated Monitoring

**Daily Security Report Script:**

```bash
#!/bin/bash
# security-report.sh

REPO="owner/pragmatic-rhino-suit"
DATE=$(date +%Y-%m-%d)

echo "Security Report for $DATE"
echo "=========================="

# Dependabot alerts
OPEN_ALERTS=$(gh api /repos/$REPO/dependabot/alerts \
  --jq '[.[] | select(.state=="open")] | length')
echo "Open Dependabot alerts: $OPEN_ALERTS"

# Critical vulnerabilities
CRITICAL=$(gh api /repos/$REPO/dependabot/alerts \
  --jq '[.[] | select(.security_advisory.severity=="critical")] | length')
echo "Critical vulnerabilities: $CRITICAL"

# Failed deployments (last 7 days)
FAILED=$(gh api /repos/$REPO/actions/runs \
  --jq '[.workflow_runs[] | 
        select(.name=="Deploy to Marketplace" and .conclusion=="failure" and 
        (.created_at | fromdateiso8601) > (now - 604800))] | length')
echo "Failed deployments (7 days): $FAILED"

# Secret access events (last 24 hours)
SECRET_ACCESS=$(gh api /orgs/{org}/audit-log \
  --field phrase="action:secret.read created:>=$(date -d '1 day ago' +%Y-%m-%d)" \
  --jq 'length')
echo "Secret access events (24h): $SECRET_ACCESS"

# Alert if thresholds exceeded
if [ $CRITICAL -gt 0 ]; then
  echo "⚠️  ALERT: Critical vulnerabilities detected!"
fi

if [ $FAILED -gt 2 ]; then
  echo "⚠️  ALERT: High deployment failure rate!"
fi
```

**Schedule with GitHub Actions:**

```yaml
# .github/workflows/security-report.yml
name: Daily Security Report

on:
  schedule:
    - cron: '0 8 * * *'  # 8 AM daily
  workflow_dispatch:

jobs:
  security-report:
    runs-on: ubuntu-latest
    steps:
      - name: Generate report
        run: |
          # Run security report script
          bash scripts/security-report.sh
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Send notification
        if: failure()
        run: |
          # Send alert to team
          echo "Security issues detected!"
```

### Log Aggregation

**Centralized Logging with External SIEM:**

**Azure Sentinel Integration:**

```yaml
# Configure audit log streaming
# Organization Settings → Audit log → Log streaming

# Add Azure Event Hubs endpoint
Endpoint: https://{namespace}.servicebus.windows.net/{event-hub}
Shared Access Key: {key}

# Configure Sentinel data connector
# Azure Sentinel → Data connectors → GitHub (Preview)
```

**Splunk Integration:**

```bash
# Install Splunk GitHub App
# Configure HTTP Event Collector (HEC)

# Stream audit logs to Splunk
curl -X POST https://splunk.example.com:8088/services/collector \
  -H "Authorization: Splunk {HEC-token}" \
  -d '{
    "event": {
      "action": "workflow_run.completed",
      "actor": "github-actions",
      "repo": "pragmatic-rhino-suit",
      "conclusion": "success"
    }
  }'
```

---

## Compliance and Reporting

### Compliance Requirements

**SOC 2 Type II:**
- Audit log retention: 1 year minimum
- Access control logging: All access events
- Change management: All configuration changes
- Incident response: All security events

**ISO 27001:**
- Log retention: 6 months minimum
- Access monitoring: All privileged access
- Security events: All authentication failures
- Change tracking: All system modifications

**GDPR:**
- Data access logging: All personal data access
- Data modification: All changes to personal data
- Data deletion: All deletion requests
- Retention: As required by data retention policy

### Compliance Reports

**Monthly Audit Report Template:**

```markdown
# Audit Report - January 2025

## Summary
- Total workflow runs: 150
- Successful deployments: 12
- Failed deployments: 1
- Security alerts: 3 (all resolved)
- Secret access events: 45

## Deployment Activity
| Date | Version | Status | Duration | Deployed By |
|------|---------|--------|----------|-------------|
| 2025-01-15 | v1.2.3 | Success | 12m | GitHub Actions |
| 2025-01-10 | v1.2.2 | Success | 15m | GitHub Actions |
| 2025-01-05 | v1.2.1 | Failed | 8m | GitHub Actions |

## Security Events
| Date | Event | Severity | Status | Resolution |
|------|-------|----------|--------|------------|
| 2025-01-12 | Dependabot alert | High | Resolved | Dependency updated |
| 2025-01-08 | Secret scanning | Medium | Resolved | Secret rotated |
| 2025-01-03 | Failed auth | Low | Resolved | Token refreshed |

## Access Control
| User | Role | Actions | Last Access |
|------|------|---------|-------------|
| admin1 | Admin | 15 | 2025-01-15 |
| dev1 | Write | 45 | 2025-01-14 |
| dev2 | Write | 32 | 2025-01-13 |

## Compliance Status
- ✅ All audit logs retained per policy
- ✅ No unauthorized access detected
- ✅ All security alerts resolved within SLA
- ✅ Secret rotation completed on schedule
```

**Automated Report Generation:**

```bash
#!/bin/bash
# generate-compliance-report.sh

MONTH=$(date +%Y-%m)
REPO="owner/pragmatic-rhino-suit"

echo "# Audit Report - $MONTH" > report.md
echo "" >> report.md

# Deployment statistics
echo "## Deployment Activity" >> report.md
gh api /repos/$REPO/actions/runs \
  --jq '.workflow_runs[] | select(.name=="Deploy to Marketplace") | 
        "| \(.created_at) | \(.head_branch) | \(.conclusion) | \(.run_started_at) |"' \
  >> report.md

# Security alerts
echo "## Security Events" >> report.md
gh api /repos/$REPO/dependabot/alerts \
  --jq '.[] | "| \(.created_at) | \(.security_advisory.summary) | \(.security_advisory.severity) | \(.state) |"' \
  >> report.md

echo "Report generated: report.md"
```

### Audit Trail for Compliance

**Required Documentation:**

1. **Deployment History:**
   - All deployments with timestamps
   - Deployment approvals (if required)
   - Rollback events
   - Manual interventions

2. **Access Control:**
   - User access grants/revocations
   - Permission changes
   - Secret access events
   - Failed authentication attempts

3. **Security Events:**
   - Vulnerability detections
   - Security patches applied
   - Incident responses
   - Secret rotations

4. **Change Management:**
   - Workflow file modifications
   - Configuration changes
   - Branch protection updates
   - Environment changes

**Audit Trail Verification:**

```bash
# Verify complete audit trail exists
gh api /orgs/{org}/audit-log \
  --field phrase="repo:pragmatic-rhino-suit created:2025-01-01..2025-01-31" \
  --jq 'length'

# Expected: > 0 events for active month
```

---

## Security Considerations

### Protecting Audit Logs

**Access Control:**
- Limit audit log access to authorized personnel only
- Use principle of least privilege
- Require MFA for audit log access
- Monitor audit log access itself

**Integrity:**
- Audit logs are immutable in GitHub
- Stream to external system for tamper-proof storage
- Use cryptographic signatures for exported logs
- Regular integrity checks

**Confidentiality:**
- Secrets are automatically masked in logs
- Sensitive data redacted before logging
- Encrypt logs in transit and at rest
- Secure external log storage

### Secret Masking Verification

**Automatic Masking:**

GitHub Actions automatically masks:
- All values from GitHub Secrets
- Values registered with `add-mask` command
- Patterns matching common secret formats

**Verification:**

```bash
# Check workflow logs for exposed secrets
gh run view <run-id> --log | grep -i "secret\|password\|token\|key"

# Should show: ***
# Should NOT show: actual secret values
```

**Manual Masking:**

```yaml
# In workflow file
- name: Mask custom value
  run: |
    echo "::add-mask::${{ secrets.CUSTOM_VALUE }}"
    echo "Value is now masked: ${{ secrets.CUSTOM_VALUE }}"
```

### Monitoring for Suspicious Activity

**Alert on:**
- Multiple failed authentication attempts
- Unusual secret access patterns
- Workflow modifications by unauthorized users
- Deployment attempts outside business hours
- Rapid succession of deployments
- Rollback frequency spikes

**Detection Script:**

```bash
#!/bin/bash
# detect-suspicious-activity.sh

# Check for failed auth attempts
FAILED_AUTH=$(gh api /orgs/{org}/audit-log \
  --field phrase="action:oauth_authorization.create result:failure" \
  --jq 'length')

if [ $FAILED_AUTH -gt 5 ]; then
  echo "⚠️  ALERT: Multiple failed authentication attempts detected!"
fi

# Check for secret access outside business hours
AFTER_HOURS=$(gh api /orgs/{org}/audit-log \
  --field phrase="action:secret.read" \
  --jq '[.[] | select((.created_at | fromdateiso8601 | strftime("%H") | tonumber) < 8 or 
                      (.created_at | fromdateiso8601 | strftime("%H") | tonumber) > 18)] | length')

if [ $AFTER_HOURS -gt 0 ]; then
  echo "⚠️  ALERT: Secret accessed outside business hours!"
fi
```

### Incident Response

**Security Incident Procedure:**

1. **Detection:**
   - Automated alert triggers
   - Manual discovery in audit logs
   - User report

2. **Assessment:**
   - Review audit logs for scope
   - Identify affected systems
   - Determine severity

3. **Containment:**
   - Revoke compromised credentials
   - Disable affected workflows
   - Block suspicious actors

4. **Eradication:**
   - Remove malicious changes
   - Patch vulnerabilities
   - Rotate all secrets

5. **Recovery:**
   - Restore normal operations
   - Verify system integrity
   - Monitor for recurrence

6. **Lessons Learned:**
   - Document incident timeline
   - Identify root cause
   - Implement preventive measures
   - Update procedures

---

## Document Maintenance

**Last Updated:** 2025-01-10  
**Next Review:** 2025-04-10  
**Owner:** Security Team  
**Reviewers:** DevOps Team, Compliance Officer

**Change Log:**
- 2025-01-10: Initial audit logging documentation created

---

## Additional Resources

### Official Documentation

- [GitHub Audit Log Documentation](https://docs.github.com/en/organizations/keeping-your-organization-secure/managing-security-settings-for-your-organization/reviewing-the-audit-log-for-your-organization)
- [GitHub Actions Logs](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/using-workflow-run-logs)
- [GitHub Security Features](https://docs.github.com/en/code-security)
- [Audit Log API](https://docs.github.com/en/rest/orgs/orgs#get-the-audit-log-for-an-organization)

### Internal Documentation

- [SECRETS.md](./SECRETS.md) - Secrets management
- [RUNBOOK.md](./RUNBOOK.md) - Deployment procedures
- [SECRETS_MASKING.md](./SECRETS_MASKING.md) - Secret masking verification

### Support Contacts

- **Security Team:** security@pragmatic-rhino.com
- **DevOps Team:** devops@pragmatic-rhino.com
- **Compliance Officer:** compliance@pragmatic-rhino.com

---

## Quick Reference

### Common Audit Log Queries

```bash
# List all workflow runs
gh api /repos/{owner}/{repo}/actions/runs

# List failed deployments
gh api /repos/{owner}/{repo}/actions/runs \
  --jq '.workflow_runs[] | select(.conclusion=="failure")'

# List secret access events
gh api /orgs/{org}/audit-log --field phrase="action:secret.read"

# List security alerts
gh api /repos/{owner}/{repo}/dependabot/alerts

# Export audit log to JSON
gh api /orgs/{org}/audit-log > audit-log.json

# Count events by type
gh api /orgs/{org}/audit-log \
  --jq 'group_by(.action) | map({action: .[0].action, count: length})'
```

### Retention Periods

| Log Type | Default | Recommended | Maximum |
|----------|---------|-------------|---------|
| Workflow logs | 90 days | 180 days | 400 days |
| Audit logs | 90-180 days | 365 days | 25 months (Enterprise) |
| Test artifacts | 30 days | 30 days | 400 days |
| VSIX artifacts | 90 days | 90 days | 400 days |
| Security alerts | Indefinite | Indefinite | Indefinite |
