# Kiro Steering: Azure Hosting Strategy

## Overview

This package provides the Azure hosting and architecture strategy guide for Amazon Kiro. It helps teams make informed decisions about Azure services, hosting options, and Well-Architected principles.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.Azure
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.Azure
```

## What's Included

This package installs `strategy-azure.md` to your project's `.kiro/steering/` directory. The file includes:

- Azure hosting decision matrix (App Service, Container Apps, AKS, Functions)
- Data storage options (SQL, Cosmos DB, Blob Storage, Redis)
- Well-Architected pillars (Reliability, Security, Cost, Operations, Performance)
- Security baseline requirements
- Cost estimation guidance
- Common patterns and anti-patterns

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Recommend appropriate Azure services for your workload
- Apply Well-Architected principles to designs
- Ensure security baseline requirements are met
- Guide infrastructure decisions
- Optimize for cost and performance

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Informed Decisions**: Clear guidance on which Azure services to use
- **Best Practices**: Well-Architected principles built-in
- **Security First**: Security baseline requirements from the start
- **Cost Optimization**: Guidance on cost-effective choices
- **Proven Patterns**: Common patterns and anti-patterns documented

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [Azure Well-Architected Framework](https://learn.microsoft.com/azure/well-architected/)
