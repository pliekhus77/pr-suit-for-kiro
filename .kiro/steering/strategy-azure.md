---
inclusion: always
---

# Azure Hosting Strategy Guide

## Purpose
Define Azure hosting options and decision criteria for .NET applications.

## Hosting Decision Matrix

| Service | Best For | Pros | Cons | Cost |
|---------|----------|------|------|------|
| **App Service** | Web apps, APIs, mobile backends | Easy deployment, auto-scale, managed | Limited control, Windows/Linux only | $$ |
| **Container Apps** | Microservices, event-driven apps | Serverless containers, KEDA scaling, simple | Less control than AKS | $$ |
| **AKS** | Complex microservices, full K8s control | Full Kubernetes, maximum flexibility | Complex, requires K8s expertise | $$$ |
| **Functions** | Event-driven, short tasks | True serverless, pay-per-execution | Cold starts, execution limits | $ |
| **Static Web Apps** | SPAs, JAMstack | Free tier, global CDN, auto-deploy | Static only (with API routes) | $ |
| **Virtual Machines** | Legacy apps, full OS control | Complete control, any workload | Manual management, patching | $$$ |

## Quick Decision Tree

```
Is it a static site (HTML/JS/CSS)?
├─ Yes → Static Web Apps
└─ No → Is it event-driven/short-lived?
    ├─ Yes → Azure Functions
    └─ No → Does it need containers?
        ├─ No → App Service (Web Apps)
        └─ Yes → Need full Kubernetes control?
            ├─ No → Container Apps
            └─ Yes → AKS
```

## Hosting by Application Type

| Type | Primary | Alternative | Why |
|------|---------|-------------|-----|
| .NET Web Apps | App Service | Container Apps | Native .NET, easy deploy, auto-scale |
| .NET APIs | App Service/Container Apps | Functions (HTTP) | API management, CORS, auth |
| Microservices | Container Apps | AKS | Serverless containers, Dapr, KEDA |
| Background Jobs | Functions (Timer/Queue) | Container Apps | Event-driven, pay-per-use |
| Real-Time (SignalR) | App Service + SignalR | Container Apps + SignalR | Managed SignalR, WebSockets |
| Blazor | Static Web Apps (WASM) / App Service (Server) | - | Native support, CDN |

## Data Storage Decision Matrix

| Service | Best For | Use Case | Cost |
|---------|----------|----------|------|
| **Azure SQL Database** | Relational data, ACID transactions | Primary database for .NET apps | $$$ |
| **Cosmos DB** | Global distribution, NoSQL | Multi-region, low-latency reads | $$$$ |
| **PostgreSQL** | Open-source relational | Cost-effective relational DB | $$ |
| **Blob Storage** | Files, images, backups | Unstructured data, CDN origin | $ |
| **Table Storage** | Simple key-value | Logs, telemetry, cheap NoSQL | $ |
| **Redis Cache** | Session state, caching | Performance optimization | $$ |

## Integration Services

| Service | Best For | Use Case |
|---------|----------|----------|
| **Service Bus** | Enterprise messaging | Reliable async messaging, queues, topics |
| **Event Grid** | Event routing | Reactive programming, event-driven architecture |
| **Event Hubs** | High-throughput streaming | Telemetry, logs, real-time analytics |
| **Storage Queues** | Simple queuing | Basic async processing, low cost |
| **API Management** | API gateway | Rate limiting, authentication, versioning |

## Well-Architected Pillars

| Pillar | Key Practices |
|--------|---------------|
| **Reliability** | Availability zones, health checks, auto-healing, DR testing (99.9% target) |
| **Security** | Managed Identity, Key Vault, Azure AD, encryption, network isolation, Defender |
| **Cost** | Consumption pricing, right-sizing, reserved instances, auto-scale, monitoring |
| **Operations** | IaC (Bicep/Terraform), CI/CD, App Insights, Log Analytics, automation |
| **Performance** | CDN, caching (Redis), async/await, compression, query optimization |

## Regions & Deployment

**Primary US Regions:** East US 2 (Virginia), West US 2 (Washington), Central US (Iowa - DR pair)  
**Consider:** Data residency, latency, service availability, cost

**Deployment Patterns:**
- Blue-Green: App Service slots, Container Apps revisions (zero-downtime)
- Canary: Traffic Manager, traffic splitting (gradual rollout)
- Rolling: AKS, VM Scale Sets (incremental updates)

**Monitoring (Required):**
- Application Insights (APM, tracing)
- Log Analytics (centralized logs)
- Azure Monitor (metrics, alerts)
- Health checks (liveness, readiness)

## Security Baseline

**Minimum Requirements:**
- [ ] Managed Identity enabled (no connection strings in code)
- [ ] Key Vault for secrets/certificates
- [ ] Azure AD authentication for APIs
- [ ] HTTPS only (TLS 1.2+)
- [ ] Network isolation (VNet integration or Private Endpoints)
- [ ] Microsoft Defender enabled
- [ ] Diagnostic logs enabled
- [ ] Regular security scans (Defender for DevOps)

## Cost Estimation

| Environment | App Service | Azure SQL | Redis | Notes |
|-------------|-------------|-----------|-------|-------|
| Dev/Test | B1 ($13) | Basic ($5) | - | Functions: consumption |
| Prod (Small) | S1 ($70) | S0 ($15) | C0 ($17) | App Insights: PAYG |
| Prod (Medium) | P1V3 ($146) | S2 ($60) | C1 ($55) | + auto-scale |

**Use Azure Pricing Calculator for accurate estimates**

## IaC & CI/CD

**IaC:** Bicep (preferred, native) > Terraform (multi-cloud) > ARM (avoid)

**Pipeline:**
- Build: Restore, build, test, security scan, publish
- Deploy: IaC → app → smoke tests → integration tests → release annotations
- Tools: Azure DevOps Pipelines or GitHub Actions

## Common Patterns

**API + Database:** App Service → SQL + Redis + Key Vault + App Insights  
**Microservices:** Container Apps → Service Bus + Cosmos DB + API Management  
**Event-Driven:** Event Grid → Functions → Cosmos DB/Service Bus/Blob  
**Web + API + Workers:** Static Web Apps → App Service → SQL + Service Bus → Functions

## Migration & Governance

**Migration:**
- Lift & Shift: VMs/App Service (low effort, minimal optimization)
- Replatform: App Service/Container Apps (medium effort, managed services)
- Refactor: Container Apps/Functions/Cosmos DB (high effort, cloud-native)

**Governance:** Azure Policy, Blueprints, Resource Tags, RBAC, Management Groups

## Common Mistakes

❌ Hardcoded connection strings → ✅ Managed Identity + Key Vault  
❌ Single region → ✅ Multi-region for critical workloads  
❌ No monitoring → ✅ App Insights + alerts  
❌ Manual deploys → ✅ CI/CD pipelines  
❌ Over-provisioning → ✅ Right-size + auto-scale  
❌ No DR plan → ✅ Test backups and failover

## Decision Checklist

- [ ] App type, scalability, budget, team expertise
- [ ] Compliance, performance, DR needs
- [ ] Integration, monitoring, security requirements

## Summary

1. **Default choice:** App Service for web apps/APIs, Functions for event-driven
2. **Containers:** Container Apps (simple) or AKS (complex)
3. **Data:** Azure SQL (relational), Cosmos DB (NoSQL), Blob Storage (files)
4. **Security:** Managed Identity, Key Vault, Azure AD, network isolation
5. **Monitoring:** Application Insights + Log Analytics (required)
6. **IaC:** Bicep preferred, Terraform alternative
7. **Cost:** Start small, scale up, use consumption pricing
8. **Regions:** East US 2 or West US 2 for most workloads

**Golden Rule:** Start with managed services (PaaS), avoid VMs unless necessary. Use Well-Architected Framework principles from day one.
