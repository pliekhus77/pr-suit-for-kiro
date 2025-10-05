# Project Structure and Organization

## Purpose
Define organizational structure for .NET NuGet libraries following best practices.

## Repository Structure

```
project-root/
├── .kiro/                      # Kiro configuration
│   ├── settings/               # MCP, IDE settings
│   ├── steering/               # Project guidance (product, tech, structure, strategies)
│   └── specs/{feature}/        # Feature specs (requirements, design, tasks, testing-plan)
├── frameworks/                 # Reference documentation
├── src/{Library}/              # Source code
│   ├── {Feature}/              # Feature folders (Models, Services, Interfaces, etc.)
│   ├── Configuration/
│   ├── DependencyInjection/
│   └── {Library}.csproj
├── tests/{Library}.Tests/      # Unit & integration tests
│   ├── {Feature}/Unit/
│   ├── {Feature}/Integration/
│   ├── Fixtures/
│   └── Builders/
├── tests/{Library}.BDD/        # BDD tests
│   ├── Features/
│   ├── StepDefinitions/
│   └── Support/
├── docs/                       # Documentation
│   ├── architecture/           # ADRs, C4 diagrams
│   ├── api/
│   └── guides/
├── infrastructure/             # IaC (Pulumi/Bicep)
├── build/                      # Build scripts and props
└── .github/workflows/          # CI/CD pipelines
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## Key Directories

**`.kiro/`** - Kiro configuration (settings, steering, specs)  
**`frameworks/`** - Reference documentation  
**`src/{Library}/`** - Source code organized by feature  
**`tests/{Library}.Tests/`** - Unit & integration tests  
**`tests/{Library}.BDD/`** - BDD tests (Reqnroll + Playwright)  
**`docs/`** - Architecture, API docs, guides  
**`infrastructure/`** - IaC (Pulumi/Bicep)  
**`build/`** - Build scripts and shared props

## Source Code Organization

### Feature Folder Structure
```
{Feature}/
├── Models/          # Entities, DTOs, value objects
├── Services/        # Business logic, application services
├── Interfaces/      # Service contracts, abstractions
├── Extensions/      # Extension methods
├── Validators/      # FluentValidation validators
└── Exceptions/      # Custom exceptions
```

### Test Organization
```
Tests/
├── Unit/            # Fast, isolated tests ({ClassName}Tests.cs)
├── Integration/     # Component interaction tests
├── Fixtures/        # Shared test setup (xUnit fixtures)
└── Builders/        # Test data builders (fluent API)

BDD/
├── Features/        # Gherkin scenarios ({Feature}.feature)
├── StepDefinitions/ # Given/When/Then implementations
├── Support/         # Hooks, test context
└── Drivers/         # Page objects (Playwright)

## Naming Conventions

**C# Files:** `{ClassName}.cs`, `I{InterfaceName}.cs` (PascalCase)  
**Tests:** `{ClassName}Tests.cs`, `{Feature}IntegrationTests.cs`  
**BDD:** `{Feature}.feature`, `{Feature}Steps.cs`  
**Docs:** `{topic}.md` (kebab-case), ADRs: `{NNNN}-{title}.md`  
**Projects:** `AgenticReviewer.{LibraryName}.csproj`

## Namespaces

**Pattern:** `AgenticReviewer.{LibraryName}.{Feature}.{Layer}`

**Examples:**
- `AgenticReviewer.Kiro.Configuration.Models`
- `AgenticReviewer.Kiro.Configuration.Services`
- `AgenticReviewer.Kiro.Tests.Configuration.Unit`

**Special:** DependencyInjection, Configuration, Exceptions (no feature folder)

## Project Files

**Library (.csproj):**
- TargetFramework: net8.0
- Nullable: enable
- GenerateDocumentationFile: true
- PackageId, Version, Authors, Description, Tags

**Test (.csproj):**
- IsPackable: false
- References: xUnit, FluentAssertions, Moq, Microsoft.NET.Test.Sdk
- ProjectReference to library under test

## Code Organization

### Class File Structure
1. Using statements (organized)
2. Namespace
3. XML documentation
4. Private fields
5. Constructor(s)
6. Public properties
7. Public methods
8. Protected methods
9. Private methods
10. Nested types

### Member Ordering
Fields → Constructors → Properties → Public Methods → Protected Methods → Private Methods → Nested Types

## Documentation

**ADRs:** `docs/architecture/adr/{NNNN}-{title}.md` (Status, Context, Decision, Consequences)  
**API Docs:** Generated from XML comments  
**User Guides:** Getting started, configuration, migration, troubleshooting

## Build & CI/CD

**Artifacts:** `artifacts/` (packages, coverage, test-results, docs)  
**Pipeline Stages:** Restore → Build → Test → Coverage → Pack → Publish  
**Retention:** Test results (30d), coverage (90d), packages (indefinite)
