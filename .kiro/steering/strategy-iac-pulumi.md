# Infrastructure as Code (IaC) Strategy - Pulumi

## Purpose
Define IaC strategy using Pulumi for infrastructure management. Use real programming languages instead of DSLs for type safety, testing, and reusability.

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

**Reusable infrastructure abstractions:** Encapsulation, reusability, consistency, testability

Create `ComponentResource` subclass, compose primitive resources, expose outputs, call `RegisterOutputs()`

## Configuration & Secrets

**Stack Config:** Environment-specific settings in `Pulumi.{stack}.yaml` (dev: small instances, prod: large instances + encrypted secrets)

**Secrets:** Never commit, use `pulumi config set --secret`, store in Key Vault, access via `config.RequireSecret()`

## Testing

**Unit:** `Testing.RunAsync<T>()` without deploying  
**Integration:** Deploy to test stack, validate, destroy  
**Policy:** Validate compliance (encryption, tagging, naming)

## CI/CD

**Pipeline:** Restore → Build → Test → Login → Select stack → Preview → Up

**Quality Gates:** Build succeeds, tests pass, preview valid, no secrets, policy checks pass

**Promotion:** Dev → Staging → Prod (manual approval for prod), export state before deploy for rollback

## State & Drift

**Backends:** Pulumi Cloud (teams), Azure Blob (self-hosted), S3 (AWS), Local (dev only)  
**State Locking:** Automatic (Pulumi handles concurrency)  
**Drift Detection:** `pulumi refresh` before every deployment

## Naming & Tagging

**Naming:** `{project}-{environment}-{resource}-{instance}`  
**Tags:** Environment, Project, ManagedBy, Owner, CostCenter (use `Deployment.Instance.StackName/ProjectName`)

## Multi-Stack Patterns

**Stack References:** Share outputs between stacks via `StackReference`, `GetOutput()`

**Use Case:** Separate networking, shared services, applications by lifecycle

## Best Practices

**Code:** One resource per variable, use components, separate stacks by lifecycle, keep focused  
**Config:** Stack-specific settings, encrypt secrets, validate at startup, document requirements  
**State:** Managed backend, never edit manually, export before risky ops, regular backups  
**Testing:** Unit test components, integration test in dev, policy tests for compliance  
**Security:** Least privilege, encrypt secrets, audit logs, regular scans  
**Performance:** Use `--parallel`, minimize dependencies, `--target` for selective updates

## Common Patterns

**App + Database:** Component composition  
**Multi-Region:** Loop through regions  
**Conditional:** Config flags to enable/disable resources

## Automation API

**Programmatic Pulumi operations:** Custom CLIs, self-service portals, CI/CD pipelines, multi-stack workflows, drift detection

Use `LocalWorkspace.CreateOrSelectStackAsync()`, `SetConfigAsync()`, `UpAsync()`

## Policy as Code

**CrossGuard:** Enforce compliance, validate resources, `enforcementLevel` (mandatory/advisory), `validateResourceOfType()`

## AWS Implementation

**Services:** Lambda, ECS, EKS, EC2, RDS, DynamoDB, S3, EventBridge, SQS, SNS, API Gateway

## Azure Implementation

**Services:** App Service, Container Apps, Functions, Azure SQL, Cosmos DB, Blob Storage, Event Grid, Service Bus, API Management

## Anti-Patterns

❌ Hardcoded values → ✅ Use stack config  
❌ Manual infrastructure changes → ✅ All changes via Pulumi  
❌ Secrets in code → ✅ Encrypted config or Key Vault  
❌ Single stack for all environments → ✅ Stack per environment  
❌ No testing → ✅ Unit and integration tests  
❌ Ignoring drift → ✅ Regular refresh and reconciliation  
❌ No state backups → ✅ Regular exports  
❌ Complex monolithic stacks → ✅ Modular components

## Pulumi vs Terraform

| Aspect | Pulumi | Terraform |
|--------|--------|-----------|
| **Language** | Real languages (C#, TypeScript, Python, Go) | HCL (DSL) |
| **Type Safety** | Compile-time checking | Runtime checking |
| **IDE Support** | Full IntelliSense | Limited |
| **Testing** | Standard frameworks (xUnit, Jest) | Terratest (Go) |
| **Loops** | Native language loops | `count`, `for_each` |
| **Functions** | Native functions | Limited built-ins |
| **State** | Managed or self-hosted | Self-managed (or Terraform Cloud) |
| **Learning Curve** | Use existing language knowledge | Learn HCL |

## Summary

**Why Pulumi:** Real languages (C#, TypeScript, Python, Go), type safety, IDE support, testable, reusable components

**Key Concepts:** Stacks (environments), Resources (infrastructure), Components (abstractions), Outputs (exported values), Config (settings)

**Workflow:** Define → Preview → Deploy → Verify → Iterate

**Best Practices:** Components for reusability, stack per environment, encrypt secrets, test infrastructure, drift detection, managed backend

**Golden Rule:** Infrastructure is code. Treat it like application code - version control, testing, code review, CI/CD.
