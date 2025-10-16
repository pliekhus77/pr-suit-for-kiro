---
inclusion: always
---

# AWS Well-Architected Strategy Guide

## Purpose
Define AWS architecture strategy based on the 6 pillars of the Well-Architected Framework. Use AWS MCP tools to get detailed, up-to-date best practices for specific services and scenarios.

## The 6 Pillars of AWS Well-Architected Framework

### 1. Operational Excellence 🔧
**Goal:** Run and monitor systems to deliver business value and continuously improve processes

**Core Principles:**
- Perform operations as code (Infrastructure as Code)
- Make frequent, small, reversible changes
- Refine operations procedures frequently
- Anticipate failure and learn from all operational events

**Key Practices:** CloudFormation/CDK, CI/CD pipelines, CloudWatch, AWS Config, automated testing

**When to Use AWS MCP:** Get operational best practices for deployment, monitoring, and management of specific services

### 2. Security 🔒
**Goal:** Protect information, systems, and assets while delivering business value through risk assessments and mitigation strategies

**Core Principles:**
- Implement strong identity foundation
- Apply security at all layers
- Enable traceability
- Automate security best practices
- Protect data in transit and at rest
- Prepare for security events

**Key Practices:** IAM roles, least privilege, encryption (KMS), VPC, Security Groups, CloudTrail, GuardDuty

**When to Use AWS MCP:** Get security configurations for specific services and compliance requirements

### 3. Reliability 🛡️
**Goal:** Ensure workloads perform their intended functions correctly and consistently when expected

**Core Principles:**
- Automatically recover from failure
- Test recovery procedures
- Scale horizontally to increase aggregate workload availability
- Stop guessing capacity
- Manage change through automation

**Key Metrics:** 99.9%+ availability, RTO < 4 hours, RPO < 1 hour

**When to Use AWS MCP:** Get specific reliability patterns for your service (EC2, Lambda, ECS, etc.)

### 4. Performance Efficiency ⚡
**Goal:** Use computing resources efficiently to meet system requirements and maintain efficiency as demand changes

**Core Principles:**
- Democratize advanced technologies
- Go global in minutes
- Use serverless architectures
- Experiment more often
- Consider mechanical sympathy

**Key Practices:** Auto Scaling, CloudFront CDN, ElastiCache, Lambda, right-sizing instances

**When to Use AWS MCP:** Get performance tuning recommendations for your specific architecture and bottlenecks

### 5. Cost Optimization 💰
**Goal:** Run systems to deliver business value at the lowest price point

**Core Principles:**
- Implement cloud financial management
- Adopt a consumption model
- Measure overall efficiency
- Stop spending money on undifferentiated heavy lifting
- Analyze and attribute expenditure

**Key Practices:** Reserved Instances, Spot Instances, S3 storage classes, Lambda, Cost Explorer, budgets

**When to Use AWS MCP:** Get cost optimization recommendations for your specific workload and usage patterns

### 6. Sustainability 🌱
**Goal:** Minimize environmental impacts of running cloud workloads

**Core Principles:**
- Understand your impact
- Establish sustainability goals
- Maximize utilization
- Anticipate and adopt new, more efficient hardware and software offerings
- Use managed services
- Reduce downstream impact of your cloud workloads

**Key Practices:** Serverless computing, right-sizing, efficient regions, managed services, lifecycle policies

**When to Use AWS MCP:** Get sustainability recommendations for reducing environmental impact

## AWS MCP Integration Strategy

### When to Leverage AWS MCP Tools

**During Architecture Design:**
```bash
# Get best practices for your chosen services
Use AWS MCP: "Get best practices for Lambda with DynamoDB"
Use AWS MCP: "Show security recommendations for ECS Fargate"
Use AWS MCP: "Cost optimization strategies for EC2 workloads"
```

**During Implementation:**
```bash
# Get specific configurations and code examples
Use AWS MCP: "CloudFormation template for API Gateway with Lambda"
Use AWS MCP: "CloudWatch configuration for .NET applications"
Use AWS MCP: "IAM policies for least privilege access"
```

**During Operations:**
```bash
# Get troubleshooting and optimization guidance
Use AWS MCP: "Diagnose Lambda performance issues"
Use AWS MCP: "Monitor ECS cluster health"
Use AWS MCP: "Optimize RDS costs and performance"
```

### MCP Tool Categories Available

| Category | Use For | Examples |
|----------|---------|----------|
| **Documentation** | Latest AWS guidance | Service limits, best practices, tutorials |
| **Best Practices** | Architecture recommendations | Security baselines, performance patterns |
| **CloudFormation** | IaC templates | Service configurations, networking setups |
| **Monitoring** | Observability setup | CloudWatch dashboards, X-Ray tracing |
| **Troubleshooting** | Issue diagnosis | Performance analysis, error investigation |

## Quick Service Selection Guide

**For detailed service comparisons and recommendations, use AWS MCP tools**

| Workload Type | Start Here | Then Ask AWS MCP |
|---------------|------------|-------------------|
| **Web Applications** | Lambda + API Gateway | "Best practices for serverless web apps" |
| **APIs** | API Gateway + Lambda | "API security and performance patterns" |
| **Microservices** | ECS Fargate / EKS | "Microservices architecture on AWS" |
| **Event-Driven** | Lambda + EventBridge | "Event-driven patterns and best practices" |
| **Data Processing** | Lambda + Step Functions | "Data processing pipeline recommendations" |
| **Static Sites** | S3 + CloudFront | "Static website hosting strategies" |

## Architecture Decision Process

### 1. Define Requirements (Use Well-Architected Pillars)
- **Operational Excellence:** Team expertise? Automation requirements?
- **Security:** What data classification? Compliance needs?
- **Reliability:** What's your availability target? DR requirements?
- **Performance Efficiency:** Latency requirements? Scale expectations?
- **Cost Optimization:** What's your budget? Usage patterns?
- **Sustainability:** Environmental impact goals? Efficiency targets?

### 2. Get AWS MCP Recommendations
```bash
# Example queries for AWS MCP
"Architecture recommendations for e-commerce platform with 99.9% availability"
"Security best practices for healthcare application on AWS"
"Cost-effective serverless architecture for seasonal workloads"
"Sustainable computing patterns for data processing"
```

### 3. Validate Against Pillars
- Does the architecture meet all 6 pillar requirements?
- Are there trade-offs that need documentation?
- What monitoring and alerting is needed?

### 4. Document Decisions (ADRs)
- Record architectural choices and rationale
- Include Well-Architected pillar considerations
- Reference AWS MCP recommendations used

## Common Architecture Patterns

**Get detailed implementations using AWS MCP tools**

| Pattern | Services | Ask AWS MCP |
|---------|----------|---------------|
| **Serverless Web App** | CloudFront + API Gateway + Lambda + DynamoDB | "Serverless web application best practices" |
| **Microservices** | ALB + ECS Fargate + RDS/DynamoDB | "Microservices patterns with ECS" |
| **Event-Driven** | EventBridge + Lambda + SQS + S3 | "Event-driven architecture best practices" |
| **Data Pipeline** | S3 + Lambda + Step Functions + Redshift | "Data processing pipeline recommendations" |

## Monitoring & Observability Strategy

**Essential for all 6 pillars - use AWS MCP for specific configurations**

| Pillar | What to Monitor | AWS MCP Query |
|--------|-----------------|---------------|
| **Operational Excellence** | Deployment success, change impact | "CloudWatch operational monitoring" |
| **Security** | Failed logins, privilege escalation | "Security monitoring with GuardDuty" |
| **Reliability** | Availability, errors, dependencies | "CloudWatch reliability monitoring" |
| **Performance Efficiency** | Response times, throughput | "Performance monitoring configuration" |
| **Cost Optimization** | Resource usage, budget alerts | "Cost monitoring and alerting setup" |
| **Sustainability** | Resource utilization, efficiency | "Sustainability metrics and monitoring" |

## Getting Started Checklist

### Phase 1: Foundation
- [ ] Define requirements using 6 pillars
- [ ] Use AWS MCP to get service recommendations
- [ ] Create architecture diagrams (C4 model)
- [ ] Document decisions in ADRs

### Phase 2: Implementation
- [ ] Use AWS MCP for CloudFormation/CDK templates
- [ ] Implement security baseline (IAM roles, encryption)
- [ ] Set up monitoring (CloudWatch, X-Ray)
- [ ] Configure CI/CD pipelines

### Phase 3: Operations
- [ ] Use AWS MCP for troubleshooting guidance
- [ ] Monitor all 6 pillars continuously
- [ ] Regular Well-Architected reviews
- [ ] Cost and sustainability optimization reviews

## Key Principles

**Start with Well-Architected:** Every decision should consider all 6 pillars  
**Leverage AWS MCP:** Get current, detailed best practices for your specific scenario  
**Serverless First:** Prefer Lambda, managed services over EC2 when possible  
**Automate Everything:** IaC, CI/CD, monitoring, scaling, security  
**Security by Design:** IAM roles, encryption, least privilege from day one  
**Monitor Continuously:** All pillars, not just performance  

## Anti-Patterns

❌ Ignore Well-Architected pillars → ✅ Design with all 6 pillars in mind  
❌ Use outdated guidance → ✅ Leverage AWS MCP for latest best practices  
❌ Manual processes → ✅ Automate with CloudFormation/CDK  
❌ Single AZ deployment → ✅ Multi-AZ for critical workloads  
❌ EC2 by default → ✅ Serverless and managed services first  
❌ No monitoring → ✅ Comprehensive observability from day one  

## Summary

1. **Foundation:** Use the 6 Well-Architected pillars as your design framework
2. **Guidance:** Leverage AWS MCP tools for detailed, current best practices
3. **Implementation:** Start with serverless and managed services
4. **Operations:** Monitor all pillars, not just performance
5. **Continuous Improvement:** Regular Well-Architected reviews and optimization

**Golden Rule:** Architecture is not a one-time decision. Use AWS MCP tools to stay current with evolving best practices and continuously optimize across all 6 pillars.