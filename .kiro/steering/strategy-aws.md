# AWS Hosting Strategy Guide

## Purpose
Define AWS hosting options and decision criteria for .NET applications based on AWS Well-Architected Framework.

## Hosting Decision Matrix

| Service | Best For | Pros | Cons | Cost |
|---------|----------|------|------|------|
| **Elastic Beanstalk** | Web apps, APIs | Easy deployment, auto-scale, managed | Limited control, opinionated | $$ |
| **ECS (Fargate)** | Microservices, containers | Serverless containers, simple | Less control than EKS | $$ |
| **EKS** | Complex microservices, full K8s | Full Kubernetes, maximum flexibility | Complex, requires K8s expertise | $$$ |
| **Lambda** | Event-driven, short tasks | True serverless, pay-per-execution | Cold starts, 15min limit | $ |
| **Amplify Hosting** | SPAs, static sites | Free tier, global CDN, CI/CD | Static only (with API routes) | $ |
| **EC2** | Legacy apps, full OS control | Complete control, any workload | Manual management, patching | $$$ |

## Quick Decision Tree

```
Is it a static site (HTML/JS/CSS)?
├─ Yes → Amplify Hosting
└─ No → Is it event-driven/short-lived?
    ├─ Yes → Lambda
    └─ No → Does it need containers?
        ├─ No → Elastic Beanstalk
        └─ Yes → Need full Kubernetes control?
            ├─ No → ECS (Fargate)
            └─ Yes → EKS
```

## Hosting by Application Type

| Type | Primary | Alternative | Why |
|------|---------|-------------|-----|
| .NET Web Apps | Elastic Beanstalk | ECS Fargate | Native .NET, easy deploy, auto-scale |
| .NET APIs | API Gateway + Lambda / ECS | Elastic Beanstalk | API management, CORS, auth |
| Microservices | ECS Fargate | EKS | Serverless containers, service mesh |
| Background Jobs | Lambda (EventBridge/SQS) | ECS Fargate | Event-driven, pay-per-use |
| Real-Time (SignalR) | EC2/ECS + ALB | - | WebSocket support, sticky sessions |
| Blazor | Amplify (WASM) / Beanstalk (Server) | - | CDN for WASM, managed for Server |

## Data Storage Decision Matrix

| Service | Best For | Use Case | Cost |
|---------|----------|----------|------|
| **RDS (SQL Server)** | Relational data, ACID transactions | Primary database for .NET apps | $$$ |
| **Aurora** | High-performance relational | MySQL/PostgreSQL compatible, auto-scaling | $$$ |
| **DynamoDB** | NoSQL, single-digit ms latency | High-scale key-value, global tables | $$ |
| **S3** | Files, images, backups | Unstructured data, static hosting | $ |
| **ElastiCache (Redis)** | Session state, caching | Performance optimization | $$ |
| **DocumentDB** | MongoDB-compatible | Document database, managed | $$$ |

## Integration Services

| Service | Best For | Use Case |
|---------|----------|----------|
| **SQS** | Message queuing | Decoupled async processing, reliable delivery |
| **SNS** | Pub/sub messaging | Fan-out notifications, mobile push |
| **EventBridge** | Event routing | Event-driven architecture, SaaS integration |
| **Kinesis** | Real-time streaming | Telemetry, logs, real-time analytics |
| **API Gateway** | API management | Rate limiting, authentication, versioning |
| **Step Functions** | Workflow orchestration | Complex workflows, state machines |

## Well-Architected Pillars

| Pillar | Key Practices |
|--------|---------------|
| **Operational Excellence** | IaC (CloudFormation/CDK), CI/CD, CloudWatch, runbooks, game days |
| **Security** | IAM roles, Secrets Manager, encryption (KMS), VPC, Security Hub, GuardDuty |
| **Reliability** | Multi-AZ, auto-scaling, health checks, backups, DR testing (99.9% target) |
| **Performance** | CloudFront CDN, ElastiCache, async/await, right-sizing, monitoring |
| **Cost Optimization** | Reserved/Savings Plans, right-sizing, auto-scaling, S3 lifecycle, Cost Explorer |
| **Sustainability** | Right-sizing, Graviton processors, serverless, region selection, auto-scaling |

## Regions & Deployment

**Primary US Regions:** us-east-1 (N. Virginia), us-west-2 (Oregon), us-east-2 (Ohio - DR pair)  
**Consider:** Data residency, latency, service availability, cost (us-east-1 often cheapest)

**Deployment Patterns:**
- Blue-Green: Elastic Beanstalk, ECS, CodeDeploy (zero-downtime)
- Canary: Lambda aliases, ECS, weighted routing (gradual rollout)
- Rolling: Elastic Beanstalk, ECS, Auto Scaling Groups (incremental updates)

**Monitoring (Required):**
- CloudWatch (metrics, logs, alarms)
- X-Ray (distributed tracing)
- CloudTrail (audit logs)
- Health checks (ALB, Route 53)

## Security Baseline

**Minimum Requirements:**
- [ ] IAM roles (no access keys in code)
- [ ] Secrets Manager for secrets/credentials
- [ ] IAM authentication for APIs (Cognito/IAM)
- [ ] HTTPS only (TLS 1.2+, ACM certificates)
- [ ] VPC with private subnets
- [ ] Security Hub + GuardDuty enabled
- [ ] CloudTrail logging enabled
- [ ] Regular security scans (Inspector, ECR scanning)

## Cost Estimation

| Environment | Compute | Database | Cache | Notes |
|-------------|---------|----------|-------|-------|
| Dev/Test | t3.micro ($7) | db.t3.micro ($15) | - | Lambda: free tier |
| Prod (Small) | t3.medium ($30) | db.t3.small ($30) | cache.t3.micro ($12) | CloudWatch: PAYG |
| Prod (Medium) | m5.large ($70) | db.m5.large ($140) | cache.m5.large ($90) | + auto-scale |

**Use AWS Pricing Calculator for accurate estimates**  
**Savings:** Reserved Instances (1-3yr, 30-70% off), Savings Plans, Spot Instances (batch jobs)

## IaC & CI/CD

**IaC:** CloudFormation (native) > CDK (TypeScript/C#) > Terraform (multi-cloud)

**Pipeline:**
- Build: CodeBuild (restore, build, test, security scan, publish)
- Deploy: CodePipeline → CodeDeploy → smoke tests → integration tests
- Tools: CodePipeline or GitHub Actions

## Common Patterns

**API + Database:** API Gateway + Lambda → RDS + ElastiCache + Secrets Manager + CloudWatch  
**Microservices:** ECS Fargate → SQS/SNS + DynamoDB + API Gateway  
**Event-Driven:** EventBridge → Lambda → DynamoDB/SQS/S3  
**Web + API + Workers:** Amplify → API Gateway + Lambda → RDS + SQS → Lambda

## Migration & Governance

**Migration:**
- Lift & Shift: EC2/Elastic Beanstalk (low effort, minimal optimization)
- Replatform: ECS/Elastic Beanstalk (medium effort, managed services)
- Refactor: Lambda/ECS/DynamoDB (high effort, cloud-native)

**Governance:** AWS Organizations, Service Control Policies, Config Rules, Resource Tags, Cost Allocation Tags

## Common Mistakes

❌ Hardcoded credentials → ✅ IAM roles + Secrets Manager  
❌ Single AZ → ✅ Multi-AZ for critical workloads  
❌ No monitoring → ✅ CloudWatch + X-Ray + alarms  
❌ Manual deploys → ✅ CI/CD pipelines  
❌ Over-provisioning → ✅ Right-size + auto-scale  
❌ No DR plan → ✅ Test backups and failover  
❌ Public subnets → ✅ Private subnets + NAT Gateway

## Decision Checklist

- [ ] App type, scalability, budget, team expertise
- [ ] Compliance, performance, DR needs
- [ ] Integration, monitoring, security requirements
- [ ] Well-Architected Review completed

## Well-Architected Tool

**Use AWS Well-Architected Tool (free) to:**
- Review workloads against 6 pillars
- Identify high/medium risks
- Get improvement recommendations
- Track progress over time
- Create milestones

**Process:** Define workload → Answer questions → Review risks → Create improvement plan → Implement → Measure

## Summary

1. **Default choice:** Elastic Beanstalk for web apps/APIs, Lambda for event-driven
2. **Containers:** ECS Fargate (simple) or EKS (complex)
3. **Data:** RDS (relational), DynamoDB (NoSQL), S3 (files)
4. **Security:** IAM roles, Secrets Manager, VPC, encryption (KMS)
5. **Monitoring:** CloudWatch + X-Ray + CloudTrail (required)
6. **IaC:** CloudFormation/CDK preferred, Terraform alternative
7. **Cost:** Reserved Instances, Savings Plans, right-sizing, auto-scale
8. **Regions:** us-east-1 or us-west-2 for most workloads

**Golden Rule:** Start with managed services (PaaS), avoid EC2 unless necessary. Use Well-Architected Framework principles from day one. Run Well-Architected reviews quarterly.
