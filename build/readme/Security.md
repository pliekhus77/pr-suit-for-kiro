# Kiro Steering: Security Strategy (SABSA)

## Overview

This package provides the Security strategy guide for Amazon Kiro based on the SABSA framework. It covers threat modeling, secure coding, compliance, and defense in depth principles.

## Installation

### Package Manager Console
```powershell
Install-Package PragmaticRhino.Kiro.Steering.Security
```

### .NET CLI
```bash
dotnet add package PragmaticRhino.Kiro.Steering.Security
```

## What's Included

This package installs `strategy-security.md` to your project's `.kiro/steering/` directory. The file includes:

- SABSA framework principles (business-driven security)
- Security by Design (shift left approach)
- Threat modeling using STRIDE
- Security requirements for every feature
- Secure coding practices
- Security testing (SAST, DAST, dependency scanning)
- Compliance guidance (GDPR, HIPAA, PCI-DSS, SOC2)

## How Kiro Uses This

When installed, Kiro automatically discovers and uses this steering file to:

- Perform threat modeling during design phase
- Generate security requirements for features
- Apply secure coding practices
- Implement security testing in CI/CD
- Ensure compliance requirements are met
- Create pre-production security checklists

The steering file is configured with `inclusion: always`, meaning Kiro will reference it for all relevant operations.

## Benefits

- **Security by Design**: Built-in from the start, not bolted on
- **Threat Modeling**: STRIDE framework for systematic analysis
- **Compliance Ready**: GDPR, HIPAA, PCI-DSS, SOC2 guidance
- **Defense in Depth**: Multiple layers of security controls
- **Shift Left**: Early detection and prevention of security issues

## Learn More

- [GitHub Repository](https://github.com/pragmaticrhino/agentic-reviewer)
- [SABSA](https://sabsa.org/)
