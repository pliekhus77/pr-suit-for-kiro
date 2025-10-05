# Kiro Steering: Infrastructure as Code (Pulumi)

## Overview

This package provides the Infrastructure as Code strategy guide for Amazon Kiro using Pulumi. It covers stacks, components, configuration management, and IaC best practices for cloud infrastructure.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.InfrastructureAsCode
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.InfrastructureAsCode
```

## What's Included

This package installs `strategy-iac.md` to your project's `.kiro/steering/` directory. The file includes:

- Why Pulumi over DSL-based IaC
- Language selection guidance (C#, TypeScript, Python, Go)
- Project structure and organization
- Core concepts (stacks, resources, outputs, configuration)
- Component pattern for reusability
- Testing and CI/CD integration
- Best practices and anti-patterns

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Generate Pulumi infrastructure code in appropriate language
- Structure projects following best practices
- Create reusable components
- Implement proper configuration and secrets management
- Apply IaC testing strategies

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Real Programming Languages**: Use C#, TypeScript, Python, or Go
- **Type Safety**: Compile-time validation and IDE support
- **Reusable Components**: Build and share infrastructure patterns
- **Testable Infrastructure**: Unit and integration tests for IaC
- **Multi-Cloud**: Consistent approach across cloud providers

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [Pulumi](https://www.pulumi.com/)
