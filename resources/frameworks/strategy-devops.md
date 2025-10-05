---
inclusion: always
---

# DevOps CI/CD Strategy Guide

## Purpose
Define CI/CD strategy and process principles for continuous delivery. Tools specified in `tech.md`.

## Core Principles

**The Three Ways:**
1. **Flow:** Optimize entire system, fast flow dev→production
2. **Feedback:** Amplify feedback loops, detect problems early
3. **Continuous Learning:** Experimentation culture, innovation

**CALMS:** Culture (collaboration), Automation (repeatability), Lean (small batches), Measurement (metrics), Sharing (transparency)

## Pipeline Strategy

**Flow:** Commit → Build → Test → Package → Deploy (Non-Prod) → Deploy (Prod) → Monitor

### Quality Gates by Stage

| Stage | Must Pass | Blocks Pipeline |
|-------|-----------|-----------------|
| **Build** | Compilation, static analysis, dependencies | Yes |
| **Test** | Unit tests, integration tests, 80%+ coverage, no critical vulnerabilities | Yes |
| **Package** | Versioning, artifact creation | Yes |
| **Deploy (Non-Prod)** | Smoke tests, acceptance tests, health checks | Yes |
| **Deploy (Prod)** | Approval (if required), health checks, metrics | Yes |
| **Monitor** | Alerts configured, logs centralized | No (post-deploy) |

## Branching Strategy

**Trunk-Based Development (Recommended):**
- Main always deployable
- Short-lived branches (<2 days)
- Frequent integration
- Feature flags for incomplete work

**GitHub Flow (Alternative):**
- Main = production
- Feature branches + PR
- Merge triggers deploy

**Avoid GitFlow:** Too complex, slows delivery

## Deployment Strategies

| Strategy | Process | Use Case |
|----------|---------|----------|
| **Blue-Green** | Deploy to new env, test, switch traffic, keep old for rollback | Zero-downtime, easy rollback |
| **Canary** | Deploy to 5-10%, monitor, gradually increase to 100% | Risk mitigation, gradual rollout |
| **Rolling** | Deploy one instance at a time, wait for health check | Resource-constrained |
| **Feature Flags** | Deploy disabled, enable gradually by user segment | Decouple deploy from release |

## Environment Strategy

| Environment | Tests | Approval | Frequency | Purpose |
|-------------|-------|----------|-----------|---------|
| **Dev** | Unit | No | Every commit | Fast feedback |
| **Test/QA** | Unit + Integration | No | Every PR merge | Integration validation |
| **Staging** | Full suite + BDD | Optional | Daily/on-demand | Production-like testing |
| **Production** | Smoke | Yes (initially) | Multiple/day (goal) | Live system |

## DORA Metrics

| Metric | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| **Deployment Frequency** | Multiple/day | Daily-weekly | Weekly-monthly | <Monthly |
| **Lead Time** | <1 hour | 1 day-1 week | 1 week-1 month | >1 month |
| **MTTR** | <1 hour | <1 day | 1 day-1 week | >1 week |
| **Change Failure Rate** | 0-15% | 16-30% | 31-45% | 46-60% |

**Target:** Elite or High across all metrics

## CI/CD Best Practices

**Continuous Integration:**
- Commit frequently (daily minimum)
- Automate build, test, deploy
- Fast feedback (<10 min build, <5 min tests)
- Fix broken builds immediately (stop the line)
- Test in production-like environments

**Continuous Deployment:**
- Fully automated (no manual steps)
- Small batches (lower risk)
- Monitor everything (app, infra, business metrics)
- Automated rollback capability
- Progressive delivery (canary, feature flags)

**Infrastructure as Code:**
- All infrastructure in version control
- Automated provisioning
- Immutable infrastructure
- Consistency across environments

**Security (DevSecOps):**
- Shift left (early security checks)
- Automated scanning (SAST, dependencies, containers, DAST)
- Block on critical vulnerabilities
- Secrets in vault, never in code

**Artifact Management:**
- Semantic versioning
- Immutable artifacts
- Centralized repository
- Full traceability (commit→build→test→deploy)

**Rollback Strategy:**
- Automated triggers (health checks, error rate, performance)
- Fast (<5 min)
- Tested regularly
- Blameless postmortems

**Continuous Improvement:**
- Weekly DORA metrics review
- Blameless postmortems (process, not people)
- Time-boxed experiments
- Measure and adapt

## Anti-Patterns

❌ Manual deployments → ✅ Fully automated  
❌ Long-lived branches → ✅ Trunk-based (<2 days)  
❌ Deploy on Friday → ✅ Deploy anytime with confidence  
❌ No rollback plan → ✅ Automated rollback  
❌ Test after deploy → ✅ Test before deploy  
❌ Separate ops team → ✅ Cross-functional DevOps  
❌ Blame culture → ✅ Blameless postmortems  
❌ Manual config → ✅ Infrastructure as Code

## Summary

**Process:** Commit → Build → Test → Package → Deploy (Non-Prod) → Deploy (Prod) → Monitor

**Principles:**
- Automate everything
- Fast feedback (<10 min)
- Small, frequent deployments
- Monitor and measure (DORA metrics)
- Continuous improvement

**Deployment:**
- Blue-green or canary preferred
- Feature flags for risk mitigation
- Automated rollback
- Target: Multiple deploys/day

**Golden Rule:** If it hurts, do it more often. Automate the pain away.
