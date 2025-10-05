# Kiro Steering: DevOps CI/CD Strategy

## Overview

This package provides the DevOps CI/CD strategy guide for Amazon Kiro. It covers automation, DORA metrics, deployment strategies, and continuous delivery practices for high-performing teams.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.DevOps
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.DevOps
```

## What's Included

This package installs `strategy-devops.md` to your project's `.kiro/steering/` directory. The file includes:

- CI/CD pipeline strategy and quality gates
- DORA metrics (deployment frequency, lead time, MTTR, change failure rate)
- Deployment strategies (blue-green, canary, rolling)
- Branching strategy (trunk-based development)
- Environment strategy and promotion
- DevSecOps practices

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Design CI/CD pipelines with appropriate quality gates
- Apply DORA metrics for measuring performance
- Recommend deployment strategies based on requirements
- Implement trunk-based development practices
- Integrate security scanning and validation

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Automation First**: Fully automated build, test, and deploy
- **Fast Feedback**: Quick detection and resolution of issues
- **Measurable Performance**: DORA metrics for continuous improvement
- **Safe Deployments**: Multiple deployment strategies for risk mitigation
- **Security Built-In**: DevSecOps practices from the start

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [DORA Metrics](https://dora.dev/)
