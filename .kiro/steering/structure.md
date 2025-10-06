# Project Structure and Organization

## Purpose
Define organizational structure for VS Code extension development following best practices.

## Repository Structure

```
project-root/
├── .kiro/                      # Kiro configuration
│   ├── settings/               # MCP, IDE settings
│   ├── steering/               # Project guidance (product, tech, structure, strategies)
│   └── specs/{feature}/        # Feature specs (requirements, design, tasks, testing-plan)
├── frameworks/                 # Reference documentation
├── src/                        # Extension source code
│   ├── commands/               # Command implementations
│   ├── providers/              # Tree views, code lens, diagnostics
│   ├── services/               # Business logic
│   ├── models/                 # Data structures
│   ├── utils/                  # Helpers
│   ├── webviews/               # UI panels
│   └── extension.ts            # Entry point
├── tests/                      # Tests
│   ├── unit/                   # Jest unit tests
│   ├── integration/            # VS Code extension tests
│   └── fixtures/               # Test data
├── resources/                  # Extension resources
│   ├── frameworks/             # Framework templates
│   ├── schemas/                # Validation schemas
│   └── images/                 # Icons, images
├── docs/                       # Documentation
│   ├── architecture/           # ADRs, C4 diagrams
│   └── guides/                 # User guides
├── build/                      # Build scripts
├── .github/workflows/          # CI/CD pipelines
├── .vscode/                    # VS Code settings
├── package.json                # Extension manifest
├── tsconfig.json               # TypeScript config
├── README.md
├── LICENSE
└── CHANGELOG.md
```

## Key Directories

**`.kiro/`** - Kiro configuration (settings, steering, specs)  
**`frameworks/`** - Reference documentation  
**`src/`** - Extension source code (commands, providers, services)  
**`tests/`** - Unit & integration tests  
**`resources/`** - Extension resources (frameworks, schemas, images)  
**`docs/`** - Architecture, API docs, guides  
**`build/`** - Build scripts and packaging

## Source Code Organization

### Extension Folder Structure
```
src/
├── commands/        # Command implementations
├── providers/       # Tree views, code lens, diagnostics
├── services/        # Business logic
├── models/          # Data structures, interfaces
├── utils/           # Helper functions
├── webviews/        # UI panels (HTML/CSS/JS)
└── extension.ts     # Activation/deactivation
```

### Test Organization
```
tests/
├── unit/            # Fast, isolated tests (Jest)
│   ├── commands/
│   ├── services/
│   └── utils/
├── integration/     # VS Code extension tests
│   ├── commands.test.ts
│   └── providers.test.ts
└── fixtures/        # Test data and mocks

## Naming Conventions

**TypeScript Files:** `kebab-case.ts` (e.g., `framework-manager.ts`)  
**Classes:** `PascalCase` (e.g., `FrameworkManager`)  
**Interfaces:** `PascalCase` (e.g., `Framework`, no `I` prefix)  
**Functions:** `camelCase` (e.g., `installFramework`)  
**Tests:** `{filename}.test.ts` (e.g., `framework-manager.test.ts`)  
**Docs:** `{topic}.md` (kebab-case), ADRs: `{NNNN}-{title}.md`

## Module Organization

**Pattern:** Organize by feature/responsibility

**Examples:**
- `src/commands/framework-commands.ts`
- `src/services/framework-manager.ts`
- `src/providers/framework-tree-provider.ts`
- `tests/unit/services/framework-manager.test.ts`

## Configuration Files

**package.json:**
- Extension manifest with metadata
- Commands, views, configuration contributions
- Dependencies and scripts
- Activation events

**tsconfig.json:**
- Target: ES2020
- Module: commonjs
- Strict mode enabled
- Source maps for debugging

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
