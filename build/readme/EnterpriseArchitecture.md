# Kiro Steering: Enterprise Architecture

## Overview

This package provides the Enterprise Architecture strategy guide for Amazon Kiro using TOGAF and Zachman frameworks. It provides strategic questions for product planning, feature design, and system monitoring.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.EnterpriseArchitecture
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.EnterpriseArchitecture
```

## What's Included

This package installs `strategy-ea.md` to your project's `.kiro/steering/` directory. The file includes:

- TOGAF Architecture Vision questions
- Zachman Framework interrogatives (What, How, Where, Who, When, Why)
- Product planning questions
- Feature planning and design questions
- System monitoring and governance questions
- Outstanding questions workflow

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Ask strategic questions during product planning
- Ensure comprehensive feature requirements
- Guide architectural decisions with framework questions
- Identify gaps in planning and design
- Track outstanding questions that need answers

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Strategic Alignment**: TOGAF and Zachman frameworks ensure completeness
- **Comprehensive Planning**: Systematic interrogatives cover all aspects
- **Gap Identification**: Outstanding questions workflow prevents oversights
- **Traceability**: Clear connection from business needs to implementation
- **Governance**: Built-in monitoring and compliance questions

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [TOGAF](https://www.opengroup.org/togaf)
- [Zachman Framework](https://www.zachman.com/)
