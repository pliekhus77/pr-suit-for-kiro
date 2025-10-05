# Kiro Steering: C4 Model Architecture

## Overview

This package provides the C4 Model architecture documentation strategy for Amazon Kiro. It defines when and how to create System Context, Container, Component, and Dynamic diagrams for clear architectural communication.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.C4Model
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.C4Model
```

## What's Included

This package installs `strategy-c4-model.md` to your project's `.kiro/steering/` directory. The file includes:

- C4 diagram types and when to use them
- Placement rules (which diagrams go where)
- Development process integration
- Quality standards and validation
- Mermaid diagram standards
- Common mistakes to avoid

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Create appropriate C4 diagrams during design phase
- Place diagrams in correct locations (product.md vs design.md)
- Ensure diagrams are at the right abstraction level
- Generate Mermaid syntax for diagrams
- Validate diagram quality and completeness

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Clear Communication**: Standardized architecture diagrams
- **Right Abstraction**: Guidance on appropriate detail levels
- **Consistent Placement**: Diagrams in the right documents
- **Quality Standards**: Built-in validation criteria
- **Team Alignment**: Common visual language

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [C4 Model](https://c4model.com/)
