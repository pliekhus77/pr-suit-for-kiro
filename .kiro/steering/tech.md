# Technical Standards and Practices

## Technology Stack

**Primary Languages:** TypeScript (VS Code extension), JavaScript/Node.js (runtime), Markdown (docs)  
**Build:** npm/pnpm, TypeScript Compiler (tsc), vsce (packaging), esbuild/webpack (bundling)  
**Testing:** Jest (unit), @vscode/test-electron (integration), Sinon (mocking), Playwright (E2E)  
**Versioning:** Semantic versioning (SemVer 2.0.0)

## Code Standards

### TypeScript Conventions
- Follow ESLint recommended rules, strict mode enabled
- Explicit types for parameters/returns, prefer `const` over `let`
- Use async/await over raw Promises
- Private fields: `#privateField` or `_privateField`

### Naming Conventions
- **Files/Modules:** kebab-case (`spec-manager.ts`)
- **Classes:** PascalCase (`SpecManager`)
- **Interfaces:** PascalCase, no `I` prefix (`Framework`)
- **Functions:** camelCase (`createSpec`)
- **Constants:** UPPER_SNAKE_CASE
- **Types:** PascalCase (`SpecType`)

### File Organization
```
src/
  extension.ts              # Entry point
  commands/                 # Command implementations
  providers/                # Tree views, diagnostics
  services/                 # Business logic
  models/                   # Data structures
  utils/                    # Helpers
  webviews/                 # UI panels
tests/
  unit/                     # Jest tests
  integration/              # VS Code tests
```

## Architecture Patterns

### Design Principles
**SOLID, DRY, YAGNI, KISS, Separation of Concerns**

### Recommended Patterns
- **Repository:** Data access abstraction
- **Factory:** Complex object creation
- **Strategy:** Interchangeable algorithms
- **Dependency Injection:** Constructor injection
- **Async/Await:** All I/O operations

### Domain-Driven Design
Use Aggregates, Value Objects, Domain Events, Entities, Domain Services

## Testing Standards

### Structure & Coverage
- **AAA Pattern:** Arrange-Act-Assert
- **BDD:** Given-When-Then scenarios
- **Naming:** `MethodName_Scenario_ExpectedBehavior`
- **Coverage:** 80% minimum, 100% critical paths

### Categories
Unit, Integration, BDD, Performance

## Documentation Standards

### Requirements
- XML docs for all public APIs (`<summary>`, `<param>`, `<returns>`)
- README: overview, installation, quick start, examples
- C4 diagrams for architecture
- ADRs for decisions

## Dependencies & Performance

### npm Guidelines
- Pin major versions, allow minor/patch updates
- Regular security audits (`npm audit`)
- Minimize external dependencies

### Performance
- Avoid allocations in hot paths
- Use object pooling for frequent allocations
- Implement proper disposal patterns
- Monitor performance regressions

## Security Standards

### Code Security
- Never hardcode secrets (use Key Vault/Secrets Manager)
- Validate all inputs, sanitize outputs
- Use parameterized queries
- Follow least privilege principle

### Authentication & Data Protection
- OAuth 2.0/OpenID Connect support
- Encrypt sensitive data (AES-256 at rest, TLS 1.2+ in transit)
- GDPR/HIPAA compliance where required

## CI/CD Standards

### Build Pipeline
- Automated builds, unit tests, coverage reports
- Static analysis, security scanning
- Quality gates: tests pass, coverage threshold, no critical vulnerabilities

### Release Pipeline
- Automated versioning, release notes
- VS Code Marketplace publishing
- Documentation deployment

## Logging & Monitoring

### Standards
- Structured logging (JSON), correlation IDs
- Levels: Trace, Debug, Info, Warning, Error, Critical
- Never log PII/credentials
- Health checks, metrics, alerting

## Error Handling & Resilience

### Exception Handling
- Specific exception types, meaningful messages
- Preserve stack traces, don't catch unhandleable exceptions

### Resilience Patterns
- Retry with exponential backoff
- Circuit breakers, timeouts, fallback strategies
- Use Polly library for resilience

## Accessibility & i18n

### Accessibility
- WCAG 2.1 Level AA compliance
- Keyboard navigation, ARIA labels

### Internationalization
- Resource files for strings
- Culture-specific formatting
- Multi-locale testing

## Version Control & Code Review

### Git Workflow
- Feature branches, PR required for main
- Conventional Commits format
- Squash commits before merge

### Review Process
- Style compliance, tests included
- Documentation updated, security reviewed
- Performance considered, breaking changes documented

## Tools & Configuration

### Recommended Tools
- **IDEs:** VS Code, Visual Studio, Rider
- **Analysis:** ESLint, TypeScript compiler
- **Testing:** Jest, VS Code test runner

### Configuration Management
- VS Code settings for defaults
- Environment variables for deployment
- Validation with clear error messages
