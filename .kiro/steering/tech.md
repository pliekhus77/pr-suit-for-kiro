# Technical Standards and Practices

## Technology Stack

### Primary Languages
- **TypeScript**: VS Code extension development (primary focus)
- **JavaScript/Node.js**: Extension runtime and tooling
- **Markdown**: Documentation, framework references, spec templates

### Build and Packaging
- **npm/pnpm**: Package management and dependency resolution
- **TypeScript Compiler (tsc)**: Build system for extension
- **vsce**: VS Code Extension packaging and publishing
- **esbuild/webpack**: Bundling for production
- **Semantic Versioning**: All releases follow SemVer 2.0.0

### Testing Frameworks
- **Jest**: Primary unit testing framework for TypeScript
- **@vscode/test-electron**: VS Code extension integration testing
- **Sinon**: Mocking and stubbing for tests
- **Chai**: Assertion library (if needed beyond Jest)
- **Future**: Playwright for webview E2E tests

## Code Standards

### TypeScript Conventions
- Follow TypeScript ESLint recommended rules
- Enable strict mode (`strict: true` in tsconfig.json)
- Use explicit types for function parameters and return values
- Prefer `const` over `let`, avoid `var`
- Use async/await over raw Promises
- Async functions naturally return Promises (no suffix needed)

### Naming Conventions
- **Modules/Files**: kebab-case (e.g., `spec-manager.ts`)
- **Classes**: PascalCase, descriptive nouns (e.g., `SpecManager`)
- **Interfaces**: PascalCase, no `I` prefix (TypeScript convention)
- **Functions/Methods**: camelCase, action verbs (e.g., `createSpec`)
- **Private fields**: `#privateField` (ES2022 private fields) or `_privateField`
- **Constants**: UPPER_SNAKE_CASE for true constants
- **Type aliases**: PascalCase (e.g., `SpecType`)

### File Organization
```
src/
  extension.ts              # Extension entry point (activate/deactivate)
  commands/                 # Command implementations
    spec-commands.ts
    diagram-commands.ts
    hook-commands.ts
  providers/                # Tree views, code lens, diagnostics
    spec-tree-provider.ts
    framework-validator.ts
  services/                 # Business logic
    spec-manager.ts
    template-engine.ts
    diagram-generator.ts
  models/                   # Data structures
    spec.ts
    framework-rule.ts
  utils/                    # Helpers
    file-system.ts
    markdown-parser.ts
  webviews/                 # UI panels
    diagram-preview/
    hook-builder/
tests/
  unit/                     # Jest unit tests
    services/
    utils/
  integration/              # VS Code extension tests
    commands.test.ts
    providers.test.ts
```

## Architecture Patterns

### Design Principles
- **SOLID**: Apply all five principles rigorously
- **DRY**: Don't Repeat Yourself
- **YAGNI**: You Aren't Gonna Need It
- **KISS**: Keep It Simple, Stupid
- **Separation of Concerns**: Clear boundaries between layers

### Recommended Patterns
- **Repository Pattern**: For data access abstraction
- **Factory Pattern**: For complex object creation
- **Strategy Pattern**: For interchangeable algorithms
- **Options Pattern**: For configuration (IOptions<T>)
- **Dependency Injection**: Constructor injection preferred
- **Async/Await**: For all I/O operations

### Domain-Driven Design
- Use **Aggregates** for consistency boundaries
- Implement **Value Objects** for domain concepts
- Define **Domain Events** for cross-aggregate communication
- Keep **Entities** focused on identity and lifecycle
- Use **Domain Services** for operations that don't fit entities

## Testing Standards

### Test Structure
- **Arrange-Act-Assert (AAA)**: Standard test structure
- **Given-When-Then**: For BDD scenarios
- **One assertion per test**: Preferred for unit tests
- **Test naming**: `MethodName_Scenario_ExpectedBehavior`

### Coverage Requirements
- **Minimum**: 80% code coverage for libraries
- **Critical paths**: 100% coverage required
- **Public APIs**: Must have integration tests
- **BDD scenarios**: For user-facing features

### Test Categories
```csharp
[Trait("Category", "Unit")]
[Trait("Category", "Integration")]
[Trait("Category", "BDD")]
[Trait("Category", "Performance")]
```

## Documentation Standards

### XML Documentation
- All public types and members must have XML docs
- Include `<summary>`, `<param>`, `<returns>`, `<exception>`
- Provide `<example>` for complex APIs
- Use `<remarks>` for additional context

### README Requirements
Each library must include:
- Overview and purpose
- Installation instructions
- Quick start guide
- Configuration examples
- API reference links
- Contributing guidelines
- License information

### Architecture Documentation
- Use C4 model for system context and containers
- Maintain architecture decision records (ADRs)
- Document integration points
- Include sequence diagrams for complex flows

## Dependency Management

### npm Package Guidelines
- Pin major versions, allow minor/patch updates
- Avoid pre-release packages in production
- Regular dependency audits for security vulnerabilities (npm audit)
- Minimize external dependencies

### Common Dependencies
- **@types/vscode**: VS Code API type definitions
- **@types/node**: Node.js type definitions
- **vscode-test**: Extension testing framework
- **jest**: Unit testing framework

## Performance Considerations

### Best Practices
- Use `Span<T>` and `Memory<T>` for high-performance scenarios
- Avoid allocations in hot paths
- Use `ValueTask<T>` for frequently synchronous async methods
- Implement `IDisposable` and `IAsyncDisposable` properly
- Use object pooling for frequently allocated objects

### Benchmarking
- Use **BenchmarkDotNet** for performance testing
- Establish baseline metrics
- Monitor for performance regressions in CI/CD

## Security Standards

### Code Security
- Never hardcode secrets or credentials
- Use **Azure Key Vault** or **AWS Secrets Manager** for secrets
- Validate all inputs
- Sanitize outputs to prevent injection attacks
- Use parameterized queries for database access

### Authentication & Authorization
- Support standard protocols (OAuth 2.0, OpenID Connect)
- Implement least privilege principle
- Use claims-based authorization
- Support role-based and policy-based authorization

### Data Protection
- Encrypt sensitive data at rest and in transit
- Use **Data Protection API** for encryption keys
- Implement proper key rotation
- Follow GDPR and healthcare compliance requirements (HIPAA, HITECH)

## CI/CD Standards

### Build Pipeline
- Automated builds on every commit
- Run all unit tests
- Generate code coverage reports
- Static code analysis (SonarQube, Roslyn analyzers)
- Security scanning (OWASP dependency check)

### Release Pipeline
- Automated versioning based on commits
- Generate release notes automatically
- Publish to VS Code Marketplace
- Tag releases in source control
- Deploy documentation to GitHub Pages or similar

### Quality Gates
- All tests must pass
- Code coverage must meet threshold
- No critical security vulnerabilities
- No code smells above threshold
- Successful integration tests

## Logging and Monitoring

### Logging Standards
- Use structured logging (JSON format)
- Include correlation IDs for distributed tracing
- Log levels: Trace, Debug, Information, Warning, Error, Critical
- Never log sensitive information (PII, credentials)
- Use semantic logging with named parameters

### Monitoring
- Implement health checks
- Expose metrics (Prometheus format)
- Use Application Insights or CloudWatch
- Set up alerts for critical errors
- Monitor performance counters

## Error Handling

### Exception Handling
- Use specific exception types
- Include meaningful error messages
- Preserve stack traces when rethrowing
- Don't catch exceptions you can't handle
- Use `ArgumentException`, `InvalidOperationException` appropriately

### Resilience Patterns
- Implement retry logic with exponential backoff
- Use circuit breakers for external dependencies
- Set appropriate timeouts
- Implement fallback strategies
- Use **Polly** library for resilience policies

## Accessibility and Internationalization

### Accessibility
- Follow WCAG 2.1 Level AA guidelines
- Provide meaningful error messages
- Support keyboard navigation
- Include ARIA labels where applicable

### Internationalization (i18n)
- Use resource files for user-facing strings
- Support culture-specific formatting
- Use `CultureInfo.InvariantCulture` for internal operations
- Test with multiple locales

## Version Control

### Git Workflow
- Use feature branches
- Require pull requests for main branch
- Squash commits before merging
- Write meaningful commit messages (Conventional Commits)
- Tag releases with version numbers

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

Types: feat, fix, docs, style, refactor, test, chore

## Code Review Standards

### Review Checklist
- Code follows style guidelines
- Tests are included and passing
- Documentation is updated
- No security vulnerabilities introduced
- Performance implications considered
- Breaking changes are documented

### Review Process
- At least one approval required
- Address all comments before merging
- Use GitHub/Azure DevOps review features
- Automated checks must pass

## Tools and IDE

### Recommended Tools
- **Visual Studio 2022** or **Rider**: Primary IDEs
- **VS Code**: For lightweight editing
- **ReSharper**: Code analysis and refactoring
- **dotTrace/dotMemory**: Performance profiling
- **LINQPad**: Quick prototyping and testing

### Required Extensions
- EditorConfig support
- Code analyzers (StyleCop, Roslynator)
- Test runners
- Git integration

## Configuration Management

### Configuration Sources
- appsettings.json for defaults
- Environment variables for deployment-specific values
- Azure App Configuration or AWS Parameter Store for centralized config
- User secrets for local development

### Configuration Validation
- Use `IValidateOptions<T>` for validation
- Fail fast on invalid configuration
- Provide clear error messages
- Document all configuration options
