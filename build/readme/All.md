# Kiro Steering: Complete Suite

## Overview

This meta-package installs the complete suite of Kiro steering strategy files for .NET projects. It includes all best practice guides to help teams build high-quality software with Amazon Kiro.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.All
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.All
```

## What's Included

This package installs all 8 steering strategy files to your project's `.kiro/steering/` directory:

### 1. **4D SDLC + SAFe** (`strategy-4d-safe.md`)
Define-Design-Develop-Deploy phases with SAFe practices, WSJF prioritization, and agile best practices.

### 2. **Azure Hosting** (`strategy-azure.md`)
Azure service selection, hosting options, Well-Architected principles, and cost optimization guidance.

### 3. **C4 Model** (`strategy-c4-model.md`)
Architecture documentation with System Context, Container, Component, and Dynamic diagrams.

### 4. **DevOps CI/CD** (`strategy-devops.md`)
Automation, DORA metrics, deployment strategies, and continuous delivery practices.

### 5. **Enterprise Architecture** (`strategy-ea.md`)
TOGAF and Zachman frameworks for strategic planning and comprehensive requirements.

### 6. **Infrastructure as Code** (`strategy-iac.md`)
Pulumi-based IaC with stacks, components, and cloud infrastructure best practices.

### 7. **Security (SABSA)** (`strategy-security.md`)
Threat modeling, secure coding, compliance (GDPR, HIPAA, PCI-DSS), and defense in depth.

### 8. **TDD/BDD Testing** (`strategy-tdd-bdd.md`)
Red-Green-Refactor, Given-When-Then, testing-plan.md, and quality standards.

## How Kiro Uses These

When installed, Kiro automatically discovers and uses all steering files to:

- Guide development through structured phases
- Apply industry best practices and frameworks
- Ensure security and compliance from the start
- Create comprehensive architecture documentation
- Implement automated testing and CI/CD
- Make informed infrastructure decisions

All steering files are configured with `inclusion: always`, meaning Kiro will reference them for all relevant operations.

## Benefits

- **Complete Guidance**: All best practices in one package
- **Consistent Standards**: Unified approach across all areas
- **Quick Bootstrap**: Get started immediately with proven patterns
- **Framework-Driven**: Based on industry-standard frameworks
- **Quality Focus**: Built-in quality from requirements to deployment

## Individual Packages

If you prefer to install only specific strategies, individual packages are available:

- `PragmaticRhino.Kiro.Steering.4DSafe`
- `PragmaticRhino.Kiro.Steering.Azure`
- `PragmaticRhino.Kiro.Steering.C4Model`
- `PragmaticRhino.Kiro.Steering.DevOps`
- `PragmaticRhino.Kiro.Steering.EnterpriseArchitecture`
- `PragmaticRhino.Kiro.Steering.InfrastructureAsCode`
- `PragmaticRhino.Kiro.Steering.Security`
- `PragmaticRhino.Kiro.Steering.TestDrivenDevelopment`

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [Kiro Documentation](https://docs.aws.amazon.com/kiro/)
