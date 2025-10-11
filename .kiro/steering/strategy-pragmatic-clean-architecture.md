# Pragmatic Clean Architecture Strategy

## Purpose
Define team adoption guidelines for Milan Jovanovic's pragmatic Clean Architecture approach within Pragmatic Rhino SUIT.

## Core Philosophy

**Pragmatic over Dogmatic:** Adapt Clean Architecture principles to solve real problems. Choose simplicity over strict adherence when it adds complexity without benefit.

**Business Value First:** Architecture serves business needs. Every decision should enable faster delivery, better maintainability, or reduced risk.

**Team Productivity:** Make teams more productive, not slow them down with unnecessary ceremony.

## When to Use Clean Architecture

### ✅ Use When:
- Complex business logic with rich rules/workflows
- Multiple data sources (databases, APIs, files, queues)
- Long-term maintenance (years of evolution)
- Team size 3+ developers
- Comprehensive testing requirements
- Many external dependencies
- Regulatory compliance needs

### ❌ Consider Alternatives When:
- Simple CRUD operations
- Prototypes/proof-of-concepts
- Small teams (1-2 developers)
- Tight deadlines
- Well-understood, stable domains

### Alternative Patterns:
| Scenario | Pattern | Rationale |
|----------|---------|-----------|
| Simple CRUD API | Minimal API + Repository | Less overhead |
| Data pipeline | Functional Pipeline | Clear flow |
| Event-driven service | Vertical Slice | High cohesion |
| Legacy integration | Anti-Corruption Layer | Domain protection |
| Analytics | CQRS + Read Models | Query optimization |

## Four-Layer Structure

```
src/
├── Domain/                     # Business logic and rules
│   ├── DomainEvents/          # Event definitions
│   ├── Entities/              # Business entities
│   ├── Exceptions/            # Domain exceptions
│   ├── Repositories/          # Repository interfaces
│   └── ValueObjects/          # Immutable values
├── Application/               # Use cases and orchestration
│   ├── {Entity}/              # Organized by entity
│   │   ├── Commands/          # Write operations
│   │   ├── Queries/           # Read operations
│   │   └── Events/            # Event handlers
│   ├── Behaviors/             # Cross-cutting (MediatR)
│   └── Contracts/             # DTOs and contracts
├── Infrastructure/            # External concerns
│   ├── Services/              # External integrations
│   └── Persistence/           # Data access
└── Presentation/              # User interface
    ├── Controllers/           # API endpoints
    └── Middlewares/           # Request/response processing
```

## Dependency Rules

**Strict (Never Break):**
- Domain has NO dependencies on other layers
- Application only depends on Domain
- Infrastructure implements Domain/Application interfaces

**Pragmatic Flexibility (Document in ADR):**
- Infrastructure → Application: Complex integrations
- Presentation → Infrastructure: Simple scenarios
- Cross-layer utilities: Shared utilities allowed

## CQRS with MediatR

**Benefits:** Command/query separation, pipeline behaviors, consistent patterns, testable handlers

**Command Example:**
```csharp
public record CreateUserCommand(string Email, string Name) : IRequest<Guid>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, Guid>
{
    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        // Business logic here
    }
}
```

**Query Example (Pragmatic - Direct EF Access):**
```csharp
public record GetUserQuery(Guid Id) : IRequest<UserResponse>;

public class GetUserQueryHandler : IRequestHandler<GetUserQuery, UserResponse>
{
    private readonly IDbContext _context;
    
    public async Task<UserResponse> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        return await _context.Users
            .Where(u => u.Id == request.Id)
            .Select(u => new UserResponse(u.Id, u.Email, u.Name))
            .FirstOrDefaultAsync(cancellationToken);
    }
}
```

## Team Onboarding (6-Week Plan)

### Week 1: Foundation
- [ ] Read `frameworks/clean-architecture.md`
- [ ] Understand four layers and dependency rules
- [ ] Study example project
- [ ] Set up VS Code with Pragmatic Rhino SUIT

### Week 2: Patterns
- [ ] Domain modeling (Entities, Value Objects, Events)
- [ ] CQRS with MediatR (Commands, Queries, Handlers)
- [ ] Repository pattern and dependency injection
- [ ] FluentValidation with behaviors

### Week 3-4: Implementation
- [ ] Create first entity with business rules
- [ ] Implement use case with handler and validation
- [ ] Add repository with EF Core implementation
- [ ] Build API endpoint with error handling
- [ ] Write unit and integration tests

### Week 5-6: Advanced
- [ ] Vertical slice organization
- [ ] Cross-cutting concerns (logging, caching)
- [ ] Performance optimization
- [ ] NetArchTest architecture validation
- [ ] Pragmatic trade-offs and overrides

### Learning Resources
- Milan Jovanovic (YouTube, newsletter, courses)
- Clean Architecture book (Uncle Bob)
- Framework docs and example projects
- Code reviews with experienced team members

## Decision Framework

### 1. Assess Complexity
**Simple:** Basic CRUD → Consider simpler patterns  
**Moderate:** Some business rules → Clean Architecture beneficial  
**Complex:** Rich domain, many integrations → Clean Architecture essential

### 2. Trade-off Matrix
| Factor | Benefit | Cost |
|--------|---------|------|
| **Testability** | Isolated logic, easy mocking | More interfaces |
| **Maintainability** | Clear separation | More files |
| **Flexibility** | Easy implementation changes | Abstraction overhead |
| **Team Scaling** | Clear boundaries | Learning curve |

### 3. Decision Matrix
- **High Complexity + Long-term = Full Clean Architecture**
- **Medium Complexity + Medium Timeline = Pragmatic Clean Architecture**
- **Low Complexity + Short Timeline = Simplified Architecture**

### 4. Pragmatic Overrides (Document in ADR)
**When to break rules:**
- Performance requirements
- Third-party constraints
- Team expertise limitations
- Time constraints

**Override Template:**
```markdown
## Architectural Override: [Title]
**Rule Violated:** [Principle]
**Justification:** [Reason]
**Impact:** [Maintainability/testability effects]
**Mitigation:** [How to minimize negative effects]
**Review Date:** [When to revisit]
```

## Best Practices

### 1. Start Simple, Evolve
- Begin with basic structure
- Add complexity as needed
- Refactor when pain points emerge

### 2. Focus on Business Value
- Domain logic clarity over architectural purity
- Optimize for team productivity
- Measure business outcomes, not compliance

### 3. Embrace Flexibility
- Document decisions and trade-offs
- Allow tactical solutions with refactoring plans
- Balance consistency with context

### 4. Modern Stack
- **EF Core:** Data access with repository
- **MediatR:** CQRS and cross-cutting concerns
- **FluentValidation:** Input validation
- **Serilog:** Structured logging

### 5. Testing Strategy
- **Unit:** Domain entities, handlers
- **Integration:** Repositories, API endpoints
- **Architecture:** NetArchTest validation
- **BDD:** End-to-end scenarios

## Anti-Patterns & Solutions

**❌ Anemic Domain Model** → ✅ Move logic to entities, use events  
**❌ Fat Controllers** → ✅ Thin controllers, logic in handlers  
**❌ Leaky Abstractions** → ✅ Proper interfaces, dependency inversion  
**❌ Over-Engineering** → ✅ Start simple, add complexity when justified  
**❌ Inconsistent Patterns** → ✅ Guidelines, reviews, validation

## Integration with Existing Frameworks

### Domain-Driven Design
- Use DDD tactical patterns within Clean Architecture layers
- Aggregates and entities in Domain layer
- Domain services for complex business operations
- Bounded contexts to organize larger systems

### Test-Driven Development
- Write tests first for domain logic and application handlers
- Use repository interfaces for easy mocking
- Focus on behavior verification over implementation details

### DevOps and CI/CD
- Architecture tests in build pipeline
- Dependency scanning for layer violations
- Performance tests for critical paths
- Automated deployment with health checks

## NetArchTest Architecture Validation

**Location:** `tests/{Project}.ArchitectureTests/`  
**Framework:** NetArchTest.Rules  
**Execution:** Every build, build fails if violated

### Core Rules
```csharp
// Domain has no dependencies on other layers
Domain.Should().NotHaveDependencyOnAll("Application", "Infrastructure", "Presentation")

// Application only depends on Domain
Application.Should().NotHaveDependencyOnAll("Infrastructure", "Presentation")

// Infrastructure doesn't depend on Presentation
Infrastructure.Should().NotHaveDependencyOn("Presentation")
```

### Layer-Specific Rules
**Domain:** Entities sealed/abstract, ValueObjects sealed, no EF references, Repository interfaces  
**Application:** Handlers sealed, Commands/Queries as records, no HttpContext  
**Infrastructure:** Repositories/Services sealed, implement domain interfaces  
**Presentation:** Controllers sealed, no business logic dependencies

### Naming Conventions
- Domain Events: `*Event`
- DTOs: `*Dto`, `*Response`, `*Request`
- Exceptions: `*Exception`

### Pragmatic Overrides
```csharp
[PragmaticOverride(AdrReference = "ADR-001", Justification = "Performance")]
public class DirectDataAccess { }
```

### CI/CD Integration
```yaml
- task: DotNetCoreCLI@2
  inputs:
    command: 'test'
    projects: '**/*ArchitectureTests.csproj'
    failTaskOnFailedTests: true
```

## Success Metrics

### Code Quality
- Test coverage: 80%+ overall, 90%+ domain logic
- Architecture compliance: 95%+ NetArchTest rules passing
- Code reviews for architectural consistency
- Regular refactoring toward cleaner patterns

### Team Productivity
- Consistent velocity and cycle time
- Low defect rate per release
- Positive developer satisfaction feedback

### Business Value
- Faster time to market for features
- Lower cost of changes and enhancements
- Good system performance and reliability

## Getting Help

### Internal Resources
- Architecture guild meetings
- Mandatory code reviews for architectural changes
- Pair programming with experienced practitioners
- Documentation: `frameworks/clean-architecture.md` and ADRs

### External Resources
- Milan Jovanovic (newsletter, YouTube, courses)
- Clean Architecture community and conferences
- Microsoft .NET architectural guidance
- Books: Clean Architecture, DDD, Enterprise Patterns

## Summary

Pragmatic Clean Architecture provides structure without rigidity. We embrace principles while adapting to context, prioritizing business value and team productivity over architectural purity.

**Key Takeaway:** Clean Architecture is a tool, not a religion. Use it wisely, adapt pragmatically, and focus on solving real problems for real users.