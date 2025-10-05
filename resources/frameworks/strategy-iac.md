---
inclusion: always
---

# Infrastructure as Code (IaC) Strategy - Pulumi

## Purpose
Define IaC strategy using Pulumi for infrastructure management.

## Why Pulumi

**Advantages over DSL-based IaC (Terraform, ARM, CloudFormation):**
- Real programming languages (C#, TypeScript, Python, Go, Java)
- Full language features (loops, conditionals, functions, classes)
- Type safety and compile-time validation
- IDE support (IntelliSense, refactoring, debugging)
- Testable infrastructure code
- Reusable components via packages
- Familiar tooling and workflows

**Use Pulumi when:**
- Building cloud-native applications
- Need complex logic in infrastructure
- Want to share code between app and infrastructure
- Team prefers general-purpose languages
- Need strong typing and IDE support

## Language Selection

| Language | Best For | Pros | Cons |
|----------|----------|------|------|
| **C#** | .NET teams, enterprise | Type safety, Visual Studio, NuGet, familiar | Verbose |
| **TypeScript** | Full-stack teams | Type safety, npm ecosystem, popular | Node.js required |
| **Python** | Data/ML teams, ops | Simple syntax, familiar, pip packages | Dynamic typing |
| **Go** | Performance-critical | Fast, compiled, strong typing | Less familiar |

**Recommendation for .NET projects:** C# (consistency with application code)

## Project Structure

```
infrastructure/
├── Pulumi.yaml                 # Project metadata
├── Pulumi.dev.yaml            # Dev stack config
├── Pulumi.staging.yaml        # Staging stack config
├── Pulumi.prod.yaml           # Prod stack config
├── Program.cs                 # Main entry point (C#)
├── Infrastructure.csproj      # Project file
├── Components/                # Reusable components
│   ├── AppServiceComponent.cs
│   ├── SqlDatabaseComponent.cs
│   └── KeyVaultComponent.cs
├── Stacks/                    # Stack-specific code
│   ├── DevStack.cs
│   ├── StagingStack.cs
│   └── ProdStack.cs
└── README.md                  # Setup and usage
```

## Core Concepts

### Stacks
**Definition:** Isolated, independently configurable instance of infrastructure

**Usage:**
- One stack per environment (dev, staging, prod)
- One stack per region (us-east, us-west)
- One stack per tenant (customer-a, customer-b)

**Benefits:** Isolated state, independent configuration, safe experimentation

### Resources
**Definition:** Cloud infrastructure objects (VMs, databases, networks, etc.)

**Types:**
- **Primitive:** Direct cloud provider resources (e.g., `azure.storage.Account`)
- **Component:** Logical grouping of resources (custom abstractions)

### Outputs
**Definition:** Values exported from stack for use by other stacks or applications

**Examples:** API endpoints, connection strings, resource IDs

### Configuration
**Definition:** Stack-specific settings (region, size, feature flags)

**Storage:** `Pulumi.{stack}.yaml` files, encrypted secrets

### State
**Definition:** Current infrastructure state tracked by Pulumi

**Backends:** Pulumi Cloud (managed), S3, Azure Blob, local file

## Workflow

1. **Initialize:** `pulumi new azure-csharp`
2. **Define:** Write infrastructure in C# (resources, components, outputs)
3. **Preview:** `pulumi preview` (see changes before applying)
4. **Deploy:** `pulumi up` (apply changes)
5. **Verify:** `pulumi stack output` (check exported values)

## Component Pattern

**Create reusable components for common infrastructure patterns**

**Benefits:** Encapsulation, reusability, consistency, testability

**Example:** WebAppComponent, SqlDatabaseComponent, KeyVaultComponent

## Configuration & Secrets

**Stack Config:** Environment-specific settings in `Pulumi.{stack}.yaml`

**Examples:**
- Dev: Small instance sizes, logging disabled
- Prod: Large instance sizes, logging enabled, encrypted secrets

**Secrets Management:**
- Never commit to source control
- Use `pulumi config set --secret` for encryption
- Store in Key Vault for shared access
- Access via `config.RequireSecret()` in code

## Testing

**Unit Tests:** Test component logic without deploying (use `Testing.RunAsync`)  
**Integration Tests:** Deploy to test stack, validate, destroy  
**Policy Tests:** Validate compliance (encryption, tagging, naming)

## CI/CD Integration

**Build:** Restore, build, test  
**Deploy:** Login, select stack, preview, up  
**Quality Gates:** Build succeeds, tests pass, preview valid, no secrets in code, policy checks pass

**Environment Promotion:** Dev → Staging → Production (manual approval for prod)  
**Rollback:** Export state before deploy, import to rollback

## State & Drift

**Backends:** Pulumi Cloud (teams), Azure Blob (self-hosted), S3 (AWS), Local (dev only)  
**State Locking:** Automatic (Pulumi handles concurrency)  
**Drift Detection:** `pulumi refresh` before every deployment

## Naming & Tagging

**Naming Pattern:** `{project}-{environment}-{resource}-{instance}`  
**Required Tags:** Environment, Project, ManagedBy, Owner, CostCenter

## Multi-Stack Patterns

**Stack References:** Share outputs between stacks (e.g., networking → application)  
**Stack Dependencies:** Explicit dependencies in `Pulumi.yaml`  
**Use Case:** Separate networking, shared services, applications by lifecycle

## Best Practices

**Code:** One resource per variable, use components, separate stacks by lifecycle, keep focused  
**Config:** Stack-specific settings, encrypt secrets, validate at startup, document requirements  
**State:** Managed backend, never edit manually, export before risky ops, regular backups  
**Testing:** Unit test components, integration test in dev, policy tests for compliance  
**Security:** Least privilege, encrypt secrets, audit logs, regular scans  
**Performance:** Use `--parallel`, minimize dependencies, `--target` for selective updates

## Common Patterns

**App + Database:** Component composition (WebApp + SqlDatabase)  
**Multi-Region:** Loop through regions, deploy to each  
**Conditional:** Use config flags to enable/disable resources (e.g., Redis cache)

## Anti-Patterns

❌ Hardcoded values → ✅ Use stack config  
❌ Manual infrastructure changes → ✅ All changes via Pulumi  
❌ Secrets in code → ✅ Encrypted config or Key Vault  
❌ Single stack for all environments → ✅ Stack per environment  
❌ No testing → ✅ Unit and integration tests  
❌ Ignoring drift → ✅ Regular refresh and reconciliation  
❌ No state backups → ✅ Regular exports  
❌ Complex monolithic stacks → ✅ Modular components

## Summary

**Why Pulumi:** Real languages (C#, TypeScript, Python, Go), type safety, IDE support, testable, reusable components

**Key Concepts:** Stacks (environments), Resources (infrastructure), Components (abstractions), Outputs (exported values), Config (settings)

**Workflow:** Define → Preview → Deploy → Verify → Iterate

**Best Practices:** Components for reusability, stack per environment, encrypt secrets, test infrastructure, drift detection, managed backend

**Golden Rule:** Infrastructure is code. Treat it like application code - version control, testing, code review, CI/CD.
