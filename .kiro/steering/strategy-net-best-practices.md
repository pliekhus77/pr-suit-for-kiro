# .NET Best Practices Strategy Guide

## Purpose
Define .NET development standards for performance, security, maintainability, and testability. Target .NET 8.0 (LTS) with cross-platform, cloud-native focus.

## Project Setup

**Target:** .NET 8.0 (LTS), C# latest, nullable reference types enabled

**Directory.Build.props:** `net8.0`, `Nullable=enable`, `TreatWarningsAsErrors=true`, `EnableNETAnalyzers=true`

**Structure:** `src/` (Api, Core, Infrastructure, Shared), `tests/` (Unit, Integration, Performance), `docs/`, `.editorconfig`

## Performance

| Pattern | Use Case |
|---------|----------|
| **Span<T>** | Zero-allocation string/array operations |
| **Memory<T>** | Async operations with memory slices |
| **ArrayPool<T>** | Reuse arrays, avoid GC pressure |
| **ObjectPool<T>** | Reuse expensive objects (StringBuilder) |
| **ValueTask<T>** | Frequently synchronous async methods |

**Async/Await:** `ConfigureAwait(false)` in libraries, avoid `async void`, use `ValueTask<T>` for hot paths, always pass `CancellationToken`

## Security

**Input Validation:** Model state in controllers, business rules in services, sanitize input (trim, lowercase), data annotations + FluentValidation

**Authentication:** JWT Bearer with `ValidateIssuer`, `ValidateAudience`, `ValidateLifetime`, `ValidateIssuerSigningKey`

**Authorization:** `[Authorize(Roles = "Admin")]` on controllers/actions

**Secrets:** Never hardcode. Hierarchy: Environment Variables → User Secrets (dev) → appsettings.json (defaults)

## Dependency Injection

| Lifetime | Use Case |
|----------|----------|
| **Scoped** | Per HTTP request, DbContext |
| **Singleton** | Application lifetime, caching |
| **Transient** | Per injection, stateless |

**HttpClient:** Use `AddHttpClient<T>()` factory pattern, configure BaseAddress and Timeout

## Error Handling & Logging

**Global Exception Middleware:** Catch all exceptions, map to proper HTTP status codes (404, 400, 401, 500), log errors

**Structured Logging (Serilog):** `UseSerilog()`, `ReadFrom.Configuration()`, `Enrich.FromLogContext()`, `WriteTo.Console/File`

**Usage:** `logger.BeginScope()` for context, `LogInformation/LogError` with structured parameters

## Data Access (EF Core)

**DbContext:** `ApplyConfigurationsFromAssembly()`, `IEntityTypeConfiguration<T>`, global query filters (soft deletes), owned types (value objects)

**Repository Pattern:** Generic `IRepository<T>` with `GetByIdAsync`, `GetAllAsync`, `AddAsync`, `UpdateAsync`, `DeleteAsync` (all async with `CancellationToken`)

## Testing

**Unit (xUnit + Moq + FluentAssertions):** AAA pattern, mock dependencies, verify interactions, 80%+ coverage

**Integration (WebApplicationFactory):** Test API endpoints, real HTTP requests, database interactions

## API Design

**Controllers:** `[ApiController]`, route `api/[controller]`, async with `CancellationToken`, proper HTTP codes (200, 201, 400, 404), XML docs for Swagger, `[ProducesResponseType]`

**Versioning:** URL-based `api/v{version:apiVersion}/[controller]`, `AddApiVersioning()`, `DefaultApiVersion`, `AssumeDefaultVersionWhenUnspecified`

## Configuration

**Options Pattern:** Create POCO class, `Configure<T>(GetSection("Name"))`, inject `IOptions<T>`, access via `.Value`

## Architecture

**Clean Architecture:** Domain (entities, no dependencies) → Application (use cases, interfaces) → Infrastructure (data access) → API (controllers)

**CQRS (MediatR):** Commands (`IRequest<T>`, handlers modify state) + Queries (`IRequest<TDto>`, handlers read state)

## Modern Features

**Minimal APIs:** `app.MapGet/MapPost()`, lambda handlers, `Results.Ok/NotFound/Created()`, `.WithName().WithOpenApi()`

**Record Types:** Immutable DTOs with positional syntax `record UserDto(int Id, string Email, string Name);`

## Monitoring

**Application Insights:** `AddApplicationInsightsTelemetry()`, `TrackMetric()`, `TrackEvent()`, custom telemetry

**Health Checks:** `AddHealthChecks().AddDbContext<T>().AddUrlGroup()`, `MapHealthChecks("/health")`

## Docker

**Multi-Stage:** Build stage (sdk:8.0, restore, publish) → Runtime stage (aspnet:8.0, non-root user, EXPOSE 8080)

## Common Anti-Patterns

❌ `async void` methods → ✅ `async Task` (except event handlers)  
❌ Blocking async code (`.Result`, `.Wait()`) → ✅ `await`  
❌ Missing `ConfigureAwait(false)` in libraries → ✅ Always use in library code  
❌ No cancellation tokens → ✅ Pass `CancellationToken` for long operations  
❌ Hardcoded secrets → ✅ Configuration hierarchy (env vars, user secrets)  
❌ Fat controllers → ✅ Thin controllers, business logic in services  
❌ No input validation → ✅ Validate at controller and service layers  
❌ Missing error handling → ✅ Global exception middleware  
❌ No logging → ✅ Structured logging (Serilog)  
❌ Ignoring nullable reference types → ✅ Enable and fix warnings

## Summary

**Core Principles:**
1. **Performance:** Span<T>, ValueTask<T>, object pooling, ConfigureAwait(false)
2. **Security:** Input validation, JWT auth, secrets management, HTTPS
3. **DI:** Scoped (per request), Singleton (app lifetime), Transient (per injection)
4. **Error Handling:** Global middleware, structured logging, proper status codes
5. **Data Access:** EF Core, repository pattern, async all the way
6. **Testing:** Unit (xUnit + Moq), Integration (WebApplicationFactory), 80%+ coverage
7. **API Design:** RESTful, versioning, Swagger/OpenAPI, proper HTTP codes
8. **Architecture:** Clean Architecture, CQRS, domain-driven design
9. **Modern Features:** Minimal APIs, record types, nullable reference types
10. **Deployment:** Docker multi-stage, health checks, Application Insights

**Golden Rule:** Write code that is performant, secure, testable, and maintainable. Use modern .NET features, follow SOLID principles, and always consider the production environment.
