# Kiro Steering: 4D SDLC + SAFe

## Overview

This package provides the 4D SDLC + SAFe work management strategy guide for Amazon Kiro. It helps teams implement Define-Design-Develop-Deploy phases with SAFe practices, WSJF prioritization, and agile best practices.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.FourDSafe
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.FourDSafe
```

## What's Included

This package installs `strategy-4d-safe.md` to your project's `.kiro/steering/` directory. The file includes:

- 4D SDLC phases (Define, Design, Develop, Deploy)
- SAFe work management practices
- WSJF prioritization framework
- Sprint and PI planning guidance
- Built-in quality practices
- Continuous improvement strategies

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Guide feature development through the 4D phases
- Apply SAFe principles to work management
- Prioritize work using WSJF scoring
- Ensure proper sprint and PI planning
- Maintain quality standards throughout development

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Structured Development**: Clear phases from problem definition to deployment
- **Agile Practices**: SAFe framework integration for enterprise agility
- **Prioritization**: WSJF scoring for data-driven decisions
- **Quality Focus**: Built-in quality practices from day one
- **Team Alignment**: Common language and processes across teams

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [Kiro Documentation](https://docs.aws.amazon.com/kiro/)
