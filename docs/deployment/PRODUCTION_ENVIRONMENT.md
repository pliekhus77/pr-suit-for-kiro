# Production Environment Configuration

## Overview

The production environment is used for deploying the Pragmatic Rhino SUIT extension to the VS Code Marketplace. This environment includes optional manual approval gates and production-specific secrets configuration.

## Environment Setup

### GitHub Environment Configuration

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click **Settings** → **Environments**
   - Click **New environment**
   - Name: `production`

2. **Configure Environment Protection Rules**

   **Option A: Manual Approval (Recommended for Initial Releases)**
   - Enable **Required reviewers**
   - Add authorized approvers (repository maintainers)
   - Approvers will receive notification when deployment is triggered
   - Deployment will wait for approval before proceeding

   **Option B: Fully Automated (Recommended for Mature Pipeline)**
   - Leave protection rules disabled
   - Deployments will proceed automatically on release publish
   - Suitable after establishing confidence in the pipeline

3. **Configure Environment Secrets**
   - Click **Add secret** in the environment
   - Add production-specific secrets (see below)

### Required Secrets

| Secret Name | Description | How to Obtain | Rotation |
|-------------|-------------|---------------|----------|
| `VSCE_PAT` | VS Code Marketplace Personal Access Token | See [SECRETS.md](SECRETS.md) | 90 days |

**Note:** The `VSCE_PAT` can be configured at either:
- **Repository level** (Settings → Secrets and variables → Actions) - Shared across all environments
- **Environment level** (Settings → Environments → production → Secrets) - Production-specific token

**Recommendation:** Use environment-level secrets for production to:
- Separate production credentials from staging/development
- Enable different marketplace publishers per environment
- Provide additional security through environment protection rules

## Workflow Configuration

### Enabling Environment Protection

To enable the production environment with manual approval, uncomment the environment section in `.github/workflows/deploy.yml`:

```yaml
# Optional: Configure environment for production deployment
# Uncomment to enable manual approval requirement
environment:
  name: production
  url: https://marketplace.visualstudio.com/items?itemName=pragmatic-rhino.pragmatic-rhino-suit
```

**After uncommenting:**

```yaml
# Production environment with manual approval
environment:
  name: production
  url: https://marketplace.visualstudio.com/items?itemName=pragmatic-rhino.pragmatic-rhino-suit
```

### Deployment Triggers

The production deployment workflow is triggered by:

```yaml
on:
  release:
    types: [published]
```

**Deployment Process:**
1. Maintainer creates a GitHub release
2. Release triggers the deploy workflow
3. If environment protection is enabled:
   - Workflow waits for manual approval
   - Authorized reviewers receive notification
   - Reviewer approves or rejects deployment
4. Workflow proceeds with marketplace publishing
5. Success/failure notifications sent

## Environment URL

The production environment URL is set to the VS Code Marketplace listing:

```
https://marketplace.visualstudio.com/items?itemName=pragmatic-rhino.pragmatic-rhino-suit
```

This URL:
- Appears in GitHub environment deployments
- Links directly to the published extension
- Provides quick access for verification

## Approval Workflow

### For Approvers

When a deployment requires approval:

1. **Notification Received**
   - Email notification from GitHub
   - GitHub notification in web interface
   - Shows deployment details and requester

2. **Review Deployment**
   - Click notification link to view deployment
   - Review release notes and changes
   - Check package workflow results
   - Verify version number is correct

3. **Approve or Reject**
   - Click **Review deployments** button
   - Select **production** environment
   - Click **Approve and deploy** or **Reject**
   - Add optional comment explaining decision

4. **Monitor Deployment**
   - Watch workflow progress in Actions tab
   - Verify success notification
   - Check marketplace listing

### Approval Best Practices

**When to Approve:**
- ✅ All quality gates passed (tests, coverage, security)
- ✅ Package workflow completed successfully
- ✅ Release notes are clear and accurate
- ✅ Version number follows semantic versioning
- ✅ No critical issues reported in staging
- ✅ Appropriate time for user-facing release

**When to Reject:**
- ❌ Quality gates failed or were skipped
- ❌ Package workflow failed
- ❌ Release notes are incomplete or unclear
- ❌ Version number is incorrect
- ❌ Critical issues discovered in staging
- ❌ Inappropriate timing (e.g., Friday evening, holidays)

## Environment-Specific Configuration

### Production vs. Staging

| Aspect | Staging | Production |
|--------|---------|------------|
| **Trigger** | Push to main branch | Release published |
| **Approval** | None | Optional manual approval |
| **Marketplace** | Test publisher (optional) | Production publisher |
| **Secrets** | Staging VSCE_PAT | Production VSCE_PAT |
| **Monitoring** | Basic | Enhanced with metrics |
| **Rollback** | Not required | Available via rollback workflow |

### Configuration Differences

**Staging Environment:**
- Automatic deployment on version tag
- No manual approval required
- Can use separate marketplace publisher for testing
- Faster feedback loop

**Production Environment:**
- Triggered by GitHub release
- Optional manual approval gate
- Production marketplace publisher
- Enhanced monitoring and notifications
- Rollback capability

## Security Considerations

### Secret Management

**Production Secrets:**
- Store in GitHub environment secrets (not repository secrets)
- Enable environment protection rules
- Limit access to authorized approvers
- Rotate every 90 days
- Never commit to source control
- Masked in all workflow logs

**Access Control:**
- Only repository maintainers can configure environment
- Only authorized approvers can approve deployments
- Audit log tracks all secret access
- Environment protection prevents unauthorized deployments

### Deployment Security

**Pre-Deployment Checks:**
- VSIX artifact integrity validation
- No secrets in package
- Security vulnerability scan passed
- Package validation successful

**During Deployment:**
- Secrets masked in logs
- Secure authentication with marketplace
- Retry logic with exponential backoff
- Timeout protection (15 minutes)

**Post-Deployment:**
- Verification on marketplace
- Success/failure notifications
- Deployment metrics collected
- Audit trail maintained

## Monitoring and Metrics

### Deployment Metrics

The production environment tracks:

**Performance Metrics:**
- Deployment duration (target: < 10 minutes)
- Package size (monitored for growth)
- Marketplace processing time
- Verification response time

**Quality Metrics:**
- Deployment success rate (target: ≥ 98%)
- Rollback frequency (target: < 2%)
- Time to rollback (target: < 15 minutes)
- Manual approval time (if enabled)

**Business Metrics:**
- Release frequency
- Version adoption rate
- User feedback and ratings
- Installation count

### Monitoring Tools

**GitHub Actions:**
- Workflow run history
- Deployment history per environment
- Approval audit log
- Secret usage tracking

**VS Code Marketplace:**
- Extension analytics dashboard
- Installation and update metrics
- User ratings and reviews
- Error reports

### Alerting

**Critical Alerts:**
- Deployment failure
- Marketplace rejection
- Authentication failure
- Verification timeout

**Warning Alerts:**
- Deployment duration exceeds target
- Package size increase > 20%
- Approval pending > 1 hour
- Marketplace processing delay

## Troubleshooting

### Common Issues

**Deployment Waiting for Approval:**
- **Cause:** Environment protection rules enabled
- **Solution:** Authorized approver must approve deployment
- **Check:** Settings → Environments → production → Deployments

**Authentication Failed:**
- **Cause:** Invalid or expired VSCE_PAT
- **Solution:** Rotate VSCE_PAT secret (see [SECRETS.md](SECRETS.md))
- **Check:** Verify token has Marketplace (Publish) scope

**Marketplace Rejection:**
- **Cause:** Package validation failed
- **Solution:** Review rejection reason in workflow logs
- **Check:** Verify package.json, manifest, and VSIX structure

**Verification Failed:**
- **Cause:** Marketplace propagation delay
- **Solution:** Wait 5-10 minutes and manually verify
- **Check:** Visit marketplace URL directly

### Emergency Procedures

**Failed Deployment:**
1. Check workflow logs for error details
2. Verify VSCE_PAT is valid
3. Check marketplace status
4. Use rollback workflow if needed
5. Post incident report

**Rollback Required:**
1. Navigate to Actions → Rollback workflow
2. Click **Run workflow**
3. Select previous version tag
4. Confirm rollback
5. Monitor rollback progress
6. Verify on marketplace

**Secret Compromise:**
1. Immediately revoke compromised token
2. Generate new VSCE_PAT
3. Update GitHub secret
4. Review audit logs
5. Assess impact
6. Document incident

## Best Practices

### Deployment Timing

**Recommended:**
- ✅ Deploy during business hours (9 AM - 5 PM)
- ✅ Deploy early in the week (Monday - Wednesday)
- ✅ Allow time for monitoring and response
- ✅ Coordinate with team availability

**Avoid:**
- ❌ Friday afternoon deployments
- ❌ Holiday or weekend deployments
- ❌ Late night deployments (unless emergency)
- ❌ Deployments when team is unavailable

### Release Cadence

**Recommended Frequency:**
- **Major versions:** Quarterly or as needed
- **Minor versions:** Monthly or bi-weekly
- **Patch versions:** As needed for bug fixes
- **Hotfixes:** Immediately for critical issues

**Quality Over Speed:**
- Don't rush releases to meet arbitrary deadlines
- Ensure all quality gates pass
- Allow time for staging validation
- Gather user feedback before next release

### Communication

**Before Deployment:**
- Announce planned release to team
- Review release notes with stakeholders
- Ensure support team is aware
- Prepare rollback plan

**During Deployment:**
- Monitor workflow progress
- Be available for approval (if required)
- Watch for alerts and notifications
- Verify marketplace listing

**After Deployment:**
- Announce successful deployment
- Share marketplace link
- Monitor user feedback
- Track adoption metrics
- Document lessons learned

## Maintenance

### Regular Tasks

**Weekly:**
- Review deployment metrics
- Check marketplace analytics
- Monitor user feedback
- Review workflow logs

**Monthly:**
- Review and update documentation
- Analyze deployment trends
- Optimize workflow performance
- Update dependencies

**Quarterly:**
- Rotate VSCE_PAT secret
- Review environment configuration
- Test rollback procedure
- Conduct security audit
- Update runbooks

### Continuous Improvement

**Metrics to Track:**
- Deployment frequency (increase over time)
- Deployment duration (decrease over time)
- Success rate (maintain ≥ 98%)
- Time to rollback (decrease over time)

**Optimization Opportunities:**
- Reduce deployment duration
- Improve verification reliability
- Enhance monitoring and alerting
- Streamline approval process
- Automate manual steps

## References

- [Secrets Management](SECRETS.md)
- [Development Environment](DEVELOPMENT_ENVIRONMENT.md)
- [Staging Environment](STAGING_ENVIRONMENT.md)
- [Deployment Runbook](../DEPLOYMENT_RUNBOOK.md)
- [Rollback Procedures](../ROLLBACK_PROCEDURES.md)
- [VS Code Publishing Guide](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [GitHub Environments Documentation](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
