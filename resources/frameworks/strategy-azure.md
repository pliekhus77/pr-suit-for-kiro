---
inclusion: always
---

# Azure Well-Architected Strategy Guide

## Purpose
Define Azure architecture strategy based on the 5 pillars of the Well-Architected Framework. Use Azure MCP tools to get detailed, up-to-date best practices for specific services and scenarios.

## The 5 Pillars of Azure Well-Architected Framework

### 1. Reliability 🛡️
**Goal:** Build resilient systems that recover from failures and continue to function

**Core Principles:**
- Design for failure (assume components will fail)
- Eliminate single points of failure
- Build self-healing capabilities
- Test disaster recovery regularly

**Key Metrics:** 99.9%+ availability, RTO < 4 hours, RPO < 1 hour

**When to Use Azure MCP:** Get specific reliability patterns for your service (App Service, AKS, Functions, etc.)

### 2. Security 🔒
**Goal:** Protect applications and data through defense-in-depth

**Core Principles:**
- Zero Trust (never trust, always verify)
- Least privilege access
- Encrypt everything (at rest and in transit)
- Monitor and respond to threats

**Key Practices:** Managed Identity, Key Vault, Azure AD, network isolation, Microsoft Defender

**When to Use Azure MCP:** Get security configurations for specific services and compliance requirements

### 3. Cost Optimization 💰
**Goal:** Maximize business value while minimizing costs

**Core Principles:**
- Right-size resources for actual usage
- Use consumption-based pricing where possible
- Implement auto-scaling
- Monitor and optimize continuously

**Key Practices:** Reserved instances, spot instances, auto-shutdown, cost alerts, resource tagging

**When to Use Azure MCP:** Get cost optimization recommendations for your specific workload and usage patterns

### 4. Operational Excellence 🔧
**Goal:** Run and monitor systems to deliver business value and improve processes

**Core Principles:**
- Infrastructure as Code (IaC)
- Automate everything possible
- Monitor proactively
- Learn from failures

**Key Practices:** Bicep/Terraform, CI/CD pipelines, Application Insights, Log Analytics, automated testing

**When to Use Azure MCP:** Get operational best practices for deployment, monitoring, and management of specific services

### 5. Performance Efficiency ⚡
**Goal:** Use computing resources efficiently to meet system requirements and maintain efficiency as demand changes

**Core Principles:**
- Choose the right services for your workload
- Scale horizontally when possible
- Use caching strategically
- Optimize data access patterns

**Key Practices:** CDN, Redis Cache, async/await patterns, database optimization, load balancing

**When to Use Azure MCP:** Get performance tuning recommendations for your specific architecture and bottlenecks

## Azure MCP Integration Strategy

### When to Leverage Azure MCP Tools

**During Architecture Design:**
```bash
# Get best practices for your chosen services
Use Azure MCP: "Get best practices for App Service with SQL Database"
Use Azure MCP: "Show security recommendations for Container Apps"
Use Azure MCP: "Cost optimization strategies for AKS workloads"
```

**During Implementation:**
```bash
# Get specific configurations and code examples
Use Azure MCP: "Bicep template for App Service with managed identity"
Use Azure MCP: "Application Insights configuration for .NET apps"
Use Azure MCP: "Key Vault integration patterns"
```

**During Operations:**
```bash
# Get troubleshooting and optimization guidance
Use Azure MCP: "Diagnose App Service performance issues"
Use Azure MCP: "Monitor AKS cluster health"
Use Azure MCP: "Optimize SQL Database costs"
```

### MCP Tool Categories Available

| Category | Use For | Examples |
|----------|---------|----------|
| **Documentation** | Latest Azure guidance | Service limits, best practices, tutorials |
| **Best Practices** | Architecture recommendations | Security baselines, performance patterns |
| **Deployment** | IaC and CI/CD | Bicep templates, pipeline guidance |
| **Monitoring** | Observability setup | Application Insights, Log Analytics queries |
| **Troubleshooting** | Issue diagnosis | AppLens diagnostics, performance analysis |

## Quick Service Selection Guide

**For detailed service comparisons and recommendations, use Azure MCP tools**

| Workload Type | Start Here | Then Ask Azure MCP |
|---------------|------------|-------------------|
| **Web Applications** | App Service | "Best practices for App Service reliability" |
| **APIs** | App Service / Container Apps | "API security patterns in Azure" |
| **Microservices** | Container Apps / AKS | "Microservices architecture on Azure" |
| **Event-Driven** | Functions / Event Grid | "Event-driven patterns and best practices" |
| **Data Processing** | Functions / Batch | "Data processing architecture recommendations" |
| **Static Sites** | Static Web Apps | "Static web app deployment strategies" |

## Architecture Decision Process

### 1. Define Requirements (Use Well-Architected Pillars)
- **Reliability:** What's your availability target? DR requirements?
- **Security:** What data classification? Compliance needs?
- **Cost:** What's your budget? Usage patterns?
- **Operations:** Team expertise? Automation requirements?
- **Performance:** Latency requirements? Scale expectations?

### 2. Get Azure MCP Recommendations
```bash
# Example queries for Azure MCP
"Architecture recommendations for e-commerce platform with 99.9% availability"
"Security best practices for healthcare application on Azure"
"Cost-effective architecture for seasonal workloads"
```

### 3. Validate Against Pillars
- Does the architecture meet all 5 pillar requirements?
- Are there trade-offs that need documentation?
- What monitoring and alerting is needed?

### 4. Document Decisions (ADRs)
- Record architectural choices and rationale
- Include Well-Architected pillar considerations
- Reference Azure MCP recommendations used

## Common Architecture Patterns

**Get detailed implementations using Azure MCP tools**

| Pattern | Services | Ask Azure MCP |
|---------|----------|---------------|
| **Web + API + DB** | App Service + SQL + Key Vault | "Best practices for 3-tier web application" |
| **Microservices** | Container Apps + Service Bus + Cosmos DB | "Microservices patterns with Container Apps" |
| **Event-Driven** | Event Grid + Functions + Storage | "Event-driven architecture best practices" |
| **Data Pipeline** | Data Factory + Synapse + Storage | "Data processing pipeline recommendations" |

## Monitoring & Observability Strategy

**Essential for all 5 pillars - use Azure MCP for specific configurations**

| Pillar | What to Monitor | Azure MCP Query |
|--------|-----------------|-----------------|
| **Reliability** | Availability, errors, dependencies | "Application Insights reliability monitoring" |
| **Security** | Failed logins, privilege escalation | "Security monitoring with Sentinel" |
| **Cost** | Resource usage, budget alerts | "Cost monitoring and alerting setup" |
| **Operations** | Deployment success, performance | "Operational monitoring best practices" |
| **Performance** | Response times, throughput | "Performance monitoring configuration" |

## Getting Started Checklist

### Phase 1: Foundation
- [ ] Define requirements using 5 pillars
- [ ] Use Azure MCP to get service recommendations
- [ ] Create architecture diagrams (C4 model)
- [ ] Document decisions in ADRs

### Phase 2: Implementation
- [ ] Use Azure MCP for IaC templates (Bicep/Terraform)
- [ ] Implement security baseline (managed identity, Key Vault)
- [ ] Set up monitoring (Application Insights, Log Analytics)
- [ ] Configure CI/CD pipelines

### Phase 3: Operations
- [ ] Use Azure MCP for troubleshooting guidance
- [ ] Monitor all 5 pillars continuously
- [ ] Regular architecture reviews
- [ ] Cost optimization reviews

## Key Principles

**Start with Well-Architected:** Every decision should consider all 5 pillars  
**Leverage Azure MCP:** Get current, detailed best practices for your specific scenario  
**Document Everything:** ADRs for decisions, monitoring for operations  
**Automate by Default:** IaC, CI/CD, monitoring, scaling  
**Security First:** Zero Trust, least privilege, encrypt everything  
**Monitor Continuously:** All pillars, not just performance  

## Anti-Patterns

❌ Ignore Well-Architected pillars → ✅ Design with all 5 pillars in mind  
❌ Use outdated guidance → ✅ Leverage Azure MCP for latest best practices  
❌ Manual processes → ✅ Automate everything possible  
❌ Single region → ✅ Multi-region for critical workloads  
❌ No monitoring → ✅ Comprehensive observability from day one  

## Summary

1. **Foundation:** Use the 5 Well-Architected pillars as your design framework
2. **Guidance:** Leverage Azure MCP tools for detailed, current best practices
3. **Implementation:** Start with managed services, automate everything
4. **Operations:** Monitor all pillars, not just performance
5. **Continuous Improvement:** Regular reviews and optimization

**Golden Rule:** Architecture is not a one-time decision. Use Azure MCP tools to stay current with evolving best practices and continuously optimize across all 5 pillars.