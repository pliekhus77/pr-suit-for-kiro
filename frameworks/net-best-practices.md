# .NET Best Practices Framework

## Overview

This framework provides comprehensive best practices for modern .NET development, covering .NET Core, .NET 5+, performance optimization, security, testing, and architectural patterns.

**Target Versions:**
- .NET 8.0 (LTS) - Current recommended
- .NET 6.0 (LTS) - Still supported
- .NET Core 3.1+ - Legacy support

**Key Principles:**
- Performance by default
- Security first
- Cloud-native ready
- Cross-platform compatibility
- Maintainable and testable code

---

## Project Structure and Organization

### Solution Structure

```
MySolution/
├── src/
│   ├── MyApp.Api/              # Web API project
│   ├── MyApp.Core/             # Business logic
│   ├── MyApp.Infrastructure/   # Data access, external services
│   └── MyApp.Shared/           # Common utilities
├── tests/
│   ├── MyApp.UnitTests/
│   ├── MyApp.IntegrationTests/
│   └── MyApp.PerformanceTests/
├── docs/
├── scripts/
├── .editorconfig
├── Directory.Build.props
├── Directory.Build.targets
└── global.json
```

### Directory.Build.props

```xml
<Project>
  <PropertyGroup>
    <TargetFramework>net8.0</TargetFramework>
    <LangVersion>latest</LangVersion>
    <Nullable>enable</Nullable>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>
    <EnableNETAnalyzers>true</EnableNETAnalyzers>
    <AnalysisLevel>latest</AnalysisLevel>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="8.0.0" PrivateAssets="all" />
    <PackageReference Include="StyleCop.Analyzers" Version="1.1.118" PrivateAssets="all" />
  </ItemGroup>
</Project>
```

---

## Code Quality and Analysis

### Analyzer Configuration

**.editorconfig:**
```ini
root = true

[*.cs]
# .NET rules take precedence
dotnet_diagnostic.CA*.severity = default
dotnet_diagnostic.SA*.severity = suggestion

# Critical rules as errors
dotnet_diagnostic.CA1001.severity = error  # Disposable types
dotnet_diagnostic.CA2007.severity = error  # ConfigureAwait
dotnet_diagnostic.CA1062.severity = error  # Null parameter validation

# Code style
dotnet_sort_system_directives_first = true
csharp_new_line_before_open_brace = all
csharp_indent_case_contents = true
```

### Essential NuGet Packages

```xml
<!-- Code Analysis -->
<PackageReference Include="Microsoft.CodeAnalysis.NetAnalyzers" Version="8.0.0" PrivateAssets="all" />
<PackageReference Include="StyleCop.Analyzers" Version="1.1.118" PrivateAssets="all" />

<!-- Security -->
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" Version="8.0.0" />
<PackageReference Include="System.IdentityModel.Tokens.Jwt" Version="7.0.3" />

<!-- Performance -->
<PackageReference Include="System.Text.Json" Version="8.0.0" />
<PackageReference Include="Microsoft.Extensions.Caching.Memory" Version="8.0.0" />

<!-- Logging -->
<PackageReference Include="Serilog.AspNetCore" Version="8.0.0" />
<PackageReference Include="Serilog.Sinks.Console" Version="5.0.1" />
```

---

## Performance Best Practices

### Memory Management

**Use Span<T> and Memory<T>:**
```csharp
// Good - Zero allocation string manipulation
public static ReadOnlySpan<char> GetFileExtension(ReadOnlySpan<char> path)
{
    int lastDot = path.LastIndexOf('.');
    return lastDot >= 0 ? path[(lastDot + 1)..] : ReadOnlySpan<char>.Empty;
}

// Good - Efficient array operations
public static void ProcessData(Span<int> data)
{
    for (int i = 0; i < data.Length; i++)
    {
        data[i] *= 2;
    }
}
```

**Object Pooling:**
```csharp
public class StringBuilderPool
{
    private static readonly ObjectPool<StringBuilder> Pool = 
        new DefaultObjectPoolProvider().CreateStringBuilderPool();

    public static StringBuilder Get() => Pool.Get();
    public static void Return(StringBuilder sb) => Pool.Return(sb);
}
```

### Async/Await Patterns

**ConfigureAwait(false):**
```csharp
// Good - Library code
public async Task<string> GetDataAsync()
{
    var response = await httpClient.GetAsync(url).ConfigureAwait(false);
    return await response.Content.ReadAsStringAsync().ConfigureAwait(false);
}

// Good - Use ValueTask for frequently synchronous operations
public ValueTask<int> GetCachedValueAsync(string key)
{
    if (cache.TryGetValue(key, out int value))
        return new ValueTask<int>(value);
    
    return GetValueFromDatabaseAsync(key);
}
```

**Avoid Async Void:**
```csharp
// Bad
public async void ProcessData() { }

// Good
public async Task ProcessDataAsync() { }

// Exception: Event handlers only
private async void Button_Click(object sender, EventArgs e) { }
```

---

## Security Best Practices

### Input Validation

```csharp
public class UserController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        // Validate input
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Sanitize input
        var sanitizedEmail = request.Email?.Trim().ToLowerInvariant();
        
        // Validate business rules
        if (await userService.EmailExistsAsync(sanitizedEmail))
            return Conflict("Email already exists");

        var user = await userService.CreateUserAsync(sanitizedEmail, request.Name);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }
}
```

### Authentication and Authorization

```csharp
// Startup.cs / Program.cs
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = configuration["Jwt:Issuer"],
            ValidAudience = configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(configuration["Jwt:Key"]!))
        };
    });

// Controller
[Authorize(Roles = "Admin")]
[HttpDelete("{id}")]
public async Task<IActionResult> DeleteUser(int id)
{
    await userService.DeleteUserAsync(id);
    return NoContent();
}
```

### Secrets Management

```csharp
// Use IConfiguration with proper hierarchy
public class DatabaseService
{
    private readonly string connectionString;

    public DatabaseService(IConfiguration configuration)
    {
        // Order: Environment Variables > User Secrets > appsettings.json
        connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string not found");
    }
}
```

---

## Dependency Injection Patterns

### Service Registration

```csharp
// Program.cs
var builder = WebApplication.CreateBuilder(args);

// Scoped services (per request)
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// Singleton services (application lifetime)
builder.Services.AddSingleton<IMemoryCache, MemoryCache>();
builder.Services.AddSingleton<IConfiguration>(builder.Configuration);

// Transient services (per injection)
builder.Services.AddTransient<IEmailService, EmailService>();

// Factory pattern
builder.Services.AddSingleton<IHttpClientFactory, HttpClientFactory>();
builder.Services.AddHttpClient<ApiService>(client =>
{
    client.BaseAddress = new Uri("https://api.example.com/");
    client.Timeout = TimeSpan.FromSeconds(30);
});
```

### Service Interfaces

```csharp
public interface IUserService
{
    Task<User?> GetUserAsync(int id, CancellationToken cancellationToken = default);
    Task<User> CreateUserAsync(string email, string name, CancellationToken cancellationToken = default);
    Task UpdateUserAsync(User user, CancellationToken cancellationToken = default);
    Task DeleteUserAsync(int id, CancellationToken cancellationToken = default);
}

public class UserService : IUserService
{
    private readonly IUserRepository repository;
    private readonly ILogger<UserService> logger;

    public UserService(IUserRepository repository, ILogger<UserService> logger)
    {
        this.repository = repository ?? throw new ArgumentNullException(nameof(repository));
        this.logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task<User?> GetUserAsync(int id, CancellationToken cancellationToken = default)
    {
        logger.LogInformation("Getting user with ID {UserId}", id);
        return await repository.GetByIdAsync(id, cancellationToken);
    }
}
```

---

## Error Handling and Logging

### Global Exception Handling

```csharp
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate next;
    private readonly ILogger<GlobalExceptionMiddleware> logger;

    public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
    {
        this.next = next;
        this.logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "An unhandled exception occurred");
            await HandleExceptionAsync(context, ex);
        }
    }

    private static async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        
        var response = exception switch
        {
            NotFoundException => new { StatusCode = 404, Message = "Resource not found" },
            ValidationException => new { StatusCode = 400, Message = exception.Message },
            UnauthorizedAccessException => new { StatusCode = 401, Message = "Unauthorized" },
            _ => new { StatusCode = 500, Message = "An error occurred" }
        };

        context.Response.StatusCode = response.StatusCode;
        await context.Response.WriteAsync(JsonSerializer.Serialize(response));
    }
}
```

### Structured Logging

```csharp
// Program.cs
builder.Host.UseSerilog((context, configuration) =>
{
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .WriteTo.File("logs/app-.txt", rollingInterval: RollingInterval.Day);
});

// Usage in services
public class OrderService
{
    private readonly ILogger<OrderService> logger;

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        using var scope = logger.BeginScope("Creating order for user {UserId}", request.UserId);
        
        logger.LogInformation("Processing order with {ItemCount} items", request.Items.Count);
        
        try
        {
            var order = new Order(request.UserId, request.Items);
            await repository.SaveAsync(order);
            
            logger.LogInformation("Order {OrderId} created successfully", order.Id);
            return order;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to create order for user {UserId}", request.UserId);
            throw;
        }
    }
}
```

---

## Data Access Patterns

### Entity Framework Core Best Practices

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Apply all configurations from assembly
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
        
        // Global query filters
        modelBuilder.Entity<User>().HasQueryFilter(u => !u.IsDeleted);
    }
}

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        builder.HasKey(u => u.Id);
        builder.Property(u => u.Email).IsRequired().HasMaxLength(256);
        builder.HasIndex(u => u.Email).IsUnique();
        
        // Owned types for value objects
        builder.OwnsOne(u => u.Address, address =>
        {
            address.Property(a => a.Street).HasMaxLength(200);
            address.Property(a => a.City).HasMaxLength(100);
        });
    }
}
```

### Repository Pattern

```csharp
public interface IRepository<T> where T : class
{
    Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<IEnumerable<T>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<T> AddAsync(T entity, CancellationToken cancellationToken = default);
    Task UpdateAsync(T entity, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, CancellationToken cancellationToken = default);
}

public class Repository<T> : IRepository<T> where T : class
{
    protected readonly ApplicationDbContext context;
    protected readonly DbSet<T> dbSet;

    public Repository(ApplicationDbContext context)
    {
        this.context = context;
        this.dbSet = context.Set<T>();
    }

    public virtual async Task<T?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await dbSet.FindAsync(new object[] { id }, cancellationToken);
    }

    public virtual async Task<T> AddAsync(T entity, CancellationToken cancellationToken = default)
    {
        await dbSet.AddAsync(entity, cancellationToken);
        await context.SaveChangesAsync(cancellationToken);
        return entity;
    }
}
```

---

## Testing Best Practices

### Unit Testing

```csharp
public class UserServiceTests
{
    private readonly Mock<IUserRepository> mockRepository;
    private readonly Mock<ILogger<UserService>> mockLogger;
    private readonly UserService service;

    public UserServiceTests()
    {
        mockRepository = new Mock<IUserRepository>();
        mockLogger = new Mock<ILogger<UserService>>();
        service = new UserService(mockRepository.Object, mockLogger.Object);
    }

    [Fact]
    public async Task GetUserAsync_WithValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;
        var expectedUser = new User { Id = userId, Email = "test@example.com" };
        mockRepository.Setup(r => r.GetByIdAsync(userId, default))
                     .ReturnsAsync(expectedUser);

        // Act
        var result = await service.GetUserAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedUser);
        mockRepository.Verify(r => r.GetByIdAsync(userId, default), Times.Once);
    }

    [Fact]
    public async Task CreateUserAsync_WithNullEmail_ThrowsArgumentException()
    {
        // Act & Assert
        await service.Invoking(s => s.CreateUserAsync(null!, "Test User"))
                    .Should().ThrowAsync<ArgumentException>()
                    .WithMessage("*email*");
    }
}
```

### Integration Testing

```csharp
public class UserControllerIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> factory;
    private readonly HttpClient client;

    public UserControllerIntegrationTests(WebApplicationFactory<Program> factory)
    {
        this.factory = factory;
        this.client = factory.CreateClient();
    }

    [Fact]
    public async Task GetUser_WithValidId_ReturnsUser()
    {
        // Arrange
        var userId = 1;

        // Act
        var response = await client.GetAsync($"/api/users/{userId}");

        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var content = await response.Content.ReadAsStringAsync();
        var user = JsonSerializer.Deserialize<User>(content, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });
        user.Should().NotBeNull();
        user!.Id.Should().Be(userId);
    }
}
```

---

## Configuration and Environment Management

### Configuration Patterns

```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MyApp;Trusted_Connection=true;"
  },
  "JwtSettings": {
    "Issuer": "MyApp",
    "Audience": "MyApp-Users",
    "ExpirationMinutes": 60
  },
  "EmailSettings": {
    "SmtpServer": "smtp.example.com",
    "Port": 587,
    "EnableSsl": true
  }
}

// Configuration classes
public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; }
}

// Registration
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// Usage
public class AuthService
{
    private readonly JwtSettings jwtSettings;

    public AuthService(IOptions<JwtSettings> jwtOptions)
    {
        jwtSettings = jwtOptions.Value;
    }
}
```

---

## API Design Best Practices

### RESTful API Design

```csharp
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class UsersController : ControllerBase
{
    private readonly IUserService userService;

    public UsersController(IUserService userService)
    {
        this.userService = userService;
    }

    /// <summary>
    /// Gets a user by ID
    /// </summary>
    /// <param name="id">The user ID</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The user if found</returns>
    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserDto>> GetUser(int id, CancellationToken cancellationToken)
    {
        var user = await userService.GetUserAsync(id, cancellationToken);
        if (user == null)
            return NotFound();

        return Ok(user.ToDto());
    }

    [HttpPost]
    [ProducesResponseType(typeof(UserDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<UserDto>> CreateUser(
        [FromBody] CreateUserRequest request, 
        CancellationToken cancellationToken)
    {
        var user = await userService.CreateUserAsync(request.Email, request.Name, cancellationToken);
        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user.ToDto());
    }
}
```

### API Versioning

```csharp
// Program.cs
builder.Services.AddApiVersioning(options =>
{
    options.DefaultApiVersion = new ApiVersion(1, 0);
    options.AssumeDefaultVersionWhenUnspecified = true;
    options.ApiVersionReader = ApiVersionReader.Combine(
        new UrlSegmentApiVersionReader(),
        new HeaderApiVersionReader("X-Version"),
        new QueryStringApiVersionReader("version")
    );
});

// Controller
[ApiController]
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Route("api/v{version:apiVersion}/[controller]")]
public class UsersController : ControllerBase
{
    [HttpGet("{id}")]
    [MapToApiVersion("1.0")]
    public async Task<ActionResult<UserV1Dto>> GetUserV1(int id) { }

    [HttpGet("{id}")]
    [MapToApiVersion("2.0")]
    public async Task<ActionResult<UserV2Dto>> GetUserV2(int id) { }
}
```

This covers the essential .NET best practices. Would you like me to continue with additional sections covering deployment, monitoring, or specific architectural patterns?

---

## Deployment and DevOps

### Docker Best Practices

**Multi-stage Dockerfile:**
```dockerfile
# Build stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyApp.Api/MyApp.Api.csproj", "MyApp.Api/"]
COPY ["MyApp.Core/MyApp.Core.csproj", "MyApp.Core/"]
RUN dotnet restore "MyApp.Api/MyApp.Api.csproj"

COPY . .
WORKDIR "/src/MyApp.Api"
RUN dotnet build "MyApp.Api.csproj" -c Release -o /app/build

# Publish stage
FROM build AS publish
RUN dotnet publish "MyApp.Api.csproj" -c Release -o /app/publish

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
EXPOSE 8080
COPY --from=publish /app/publish .

# Security: Run as non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

ENTRYPOINT ["dotnet", "MyApp.Api.dll"]
```

### CI/CD Pipeline (GitHub Actions)

```yaml
name: .NET CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup .NET
      uses: actions/setup-dotnet@v4
      with:
        dotnet-version: '8.0.x'
    
    - name: Restore dependencies
      run: dotnet restore
    
    - name: Build
      run: dotnet build --no-restore --configuration Release
    
    - name: Test
      run: dotnet test --no-build --configuration Release --collect:"XPlat Code Coverage"
    
    - name: Upload coverage reports
      uses: codecov/codecov-action@v3

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v4
    
    - name: Build Docker image
      run: docker build -t myapp:${{ github.sha }} .
    
    - name: Deploy to production
      run: |
        # Deploy to your cloud provider
        echo "Deploying to production..."
```

---

## Monitoring and Observability

### Application Insights Integration

```csharp
// Program.cs
builder.Services.AddApplicationInsightsTelemetry();

// Custom telemetry
public class OrderService
{
    private readonly TelemetryClient telemetryClient;

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        using var activity = telemetryClient.StartOperation<RequestTelemetry>("CreateOrder");
        
        try
        {
            var stopwatch = Stopwatch.StartNew();
            var order = await ProcessOrderAsync(request);
            
            // Custom metrics
            telemetryClient.TrackMetric("OrderProcessingTime", stopwatch.ElapsedMilliseconds);
            telemetryClient.TrackEvent("OrderCreated", new Dictionary<string, string>
            {
                ["OrderId"] = order.Id.ToString(),
                ["UserId"] = request.UserId.ToString(),
                ["ItemCount"] = request.Items.Count.ToString()
            });
            
            return order;
        }
        catch (Exception ex)
        {
            telemetryClient.TrackException(ex);
            throw;
        }
    }
}
```

### Health Checks

```csharp
// Program.cs
builder.Services.AddHealthChecks()
    .AddDbContext<ApplicationDbContext>()
    .AddUrlGroup(new Uri("https://api.external.com/health"), "External API")
    .AddCheck<CustomHealthCheck>("custom-check");

var app = builder.Build();
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});

// Custom health check
public class CustomHealthCheck : IHealthCheck
{
    private readonly IServiceScopeFactory scopeFactory;

    public CustomHealthCheck(IServiceScopeFactory scopeFactory)
    {
        this.scopeFactory = scopeFactory;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context, 
        CancellationToken cancellationToken = default)
    {
        try
        {
            using var scope = scopeFactory.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
            
            await dbContext.Database.CanConnectAsync(cancellationToken);
            return HealthCheckResult.Healthy("Database connection successful");
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Database connection failed", ex);
        }
    }
}
```

---

## Architectural Patterns

### Clean Architecture Implementation

```csharp
// Domain Layer - Core business logic
public class User
{
    public int Id { get; private set; }
    public string Email { get; private set; }
    public string Name { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private User() { } // EF Core

    public User(string email, string name)
    {
        Email = email ?? throw new ArgumentNullException(nameof(email));
        Name = name ?? throw new ArgumentNullException(nameof(name));
        CreatedAt = DateTime.UtcNow;
        
        // Domain validation
        if (!IsValidEmail(email))
            throw new ArgumentException("Invalid email format", nameof(email));
    }

    public void UpdateName(string newName)
    {
        if (string.IsNullOrWhiteSpace(newName))
            throw new ArgumentException("Name cannot be empty", nameof(newName));
            
        Name = newName;
    }

    private static bool IsValidEmail(string email) =>
        !string.IsNullOrWhiteSpace(email) && email.Contains('@');
}

// Application Layer - Use cases
public interface IUserService
{
    Task<User> CreateUserAsync(string email, string name, CancellationToken cancellationToken = default);
}

public class UserService : IUserService
{
    private readonly IUserRepository repository;
    private readonly IEmailService emailService;

    public UserService(IUserRepository repository, IEmailService emailService)
    {
        this.repository = repository;
        this.emailService = emailService;
    }

    public async Task<User> CreateUserAsync(string email, string name, CancellationToken cancellationToken = default)
    {
        // Business rule: Email must be unique
        if (await repository.ExistsByEmailAsync(email, cancellationToken))
            throw new BusinessException("Email already exists");

        var user = new User(email, name);
        await repository.AddAsync(user, cancellationToken);
        
        // Side effect
        await emailService.SendWelcomeEmailAsync(email, cancellationToken);
        
        return user;
    }
}
```

### CQRS Pattern

```csharp
// Command side
public record CreateUserCommand(string Email, string Name) : IRequest<int>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, int>
{
    private readonly ApplicationDbContext context;

    public CreateUserCommandHandler(ApplicationDbContext context)
    {
        this.context = context;
    }

    public async Task<int> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new User(request.Email, request.Name);
        context.Users.Add(user);
        await context.SaveChangesAsync(cancellationToken);
        return user.Id;
    }
}

// Query side
public record GetUserQuery(int Id) : IRequest<UserDto?>;

public class GetUserQueryHandler : IRequestHandler<GetUserQuery, UserDto?>
{
    private readonly IReadOnlyRepository<User> repository;

    public GetUserQueryHandler(IReadOnlyRepository<User> repository)
    {
        this.repository = repository;
    }

    public async Task<UserDto?> Handle(GetUserQuery request, CancellationToken cancellationToken)
    {
        var user = await repository.GetByIdAsync(request.Id, cancellationToken);
        return user?.ToDto();
    }
}

// Controller
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IMediator mediator;

    public UsersController(IMediator mediator)
    {
        this.mediator = mediator;
    }

    [HttpPost]
    public async Task<ActionResult<int>> CreateUser(CreateUserCommand command)
    {
        var userId = await mediator.Send(command);
        return CreatedAtAction(nameof(GetUser), new { id = userId }, userId);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(int id)
    {
        var user = await mediator.Send(new GetUserQuery(id));
        return user == null ? NotFound() : Ok(user);
    }
}
```

---

## Modern .NET Features

### Minimal APIs

```csharp
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Minimal API endpoints
app.MapGet("/users/{id:int}", async (int id, IUserService userService) =>
{
    var user = await userService.GetUserAsync(id);
    return user is not null ? Results.Ok(user) : Results.NotFound();
})
.WithName("GetUser")
.WithOpenApi();

app.MapPost("/users", async (CreateUserRequest request, IUserService userService) =>
{
    var user = await userService.CreateUserAsync(request.Email, request.Name);
    return Results.Created($"/users/{user.Id}", user);
})
.WithName("CreateUser")
.WithOpenApi();

app.Run();
```

### Record Types and Pattern Matching

```csharp
// Records for DTOs
public record UserDto(int Id, string Email, string Name, DateTime CreatedAt);

public record CreateUserRequest(string Email, string Name)
{
    // Validation using data annotations
    [Required, EmailAddress]
    public string Email { get; init; } = Email;
    
    [Required, StringLength(100)]
    public string Name { get; init; } = Name;
}

// Pattern matching
public static string GetUserStatus(User user) => user switch
{
    { IsActive: true, LastLoginAt: var login } when login > DateTime.UtcNow.AddDays(-30) => "Active",
    { IsActive: true, LastLoginAt: var login } when login > DateTime.UtcNow.AddDays(-90) => "Inactive",
    { IsActive: true } => "Dormant",
    { IsActive: false } => "Disabled",
    _ => "Unknown"
};
```

### Source Generators

```csharp
// Custom source generator for mapping
[AutoMap(typeof(User))]
public partial record UserDto(int Id, string Email, string Name);

// Generated code (by source generator)
public partial record UserDto
{
    public static UserDto FromUser(User user) => new(user.Id, user.Email, user.Name);
    public User ToUser() => new(Email, Name) { Id = Id };
}
```

---

## Performance Optimization

### Caching Strategies

```csharp
public class CachedUserService : IUserService
{
    private readonly IUserService innerService;
    private readonly IMemoryCache cache;
    private readonly ILogger<CachedUserService> logger;

    public CachedUserService(IUserService innerService, IMemoryCache cache, ILogger<CachedUserService> logger)
    {
        this.innerService = innerService;
        this.cache = cache;
        this.logger = logger;
    }

    public async Task<User?> GetUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"user:{id}";
        
        if (cache.TryGetValue(cacheKey, out User? cachedUser))
        {
            logger.LogDebug("Cache hit for user {UserId}", id);
            return cachedUser;
        }

        logger.LogDebug("Cache miss for user {UserId}", id);
        var user = await innerService.GetUserAsync(id, cancellationToken);
        
        if (user != null)
        {
            cache.Set(cacheKey, user, TimeSpan.FromMinutes(15));
        }

        return user;
    }
}

// Distributed caching with Redis
public class DistributedCachedUserService : IUserService
{
    private readonly IUserService innerService;
    private readonly IDistributedCache cache;
    private readonly JsonSerializerOptions jsonOptions;

    public async Task<User?> GetUserAsync(int id, CancellationToken cancellationToken = default)
    {
        var cacheKey = $"user:{id}";
        var cachedJson = await cache.GetStringAsync(cacheKey, cancellationToken);
        
        if (cachedJson != null)
        {
            return JsonSerializer.Deserialize<User>(cachedJson, jsonOptions);
        }

        var user = await innerService.GetUserAsync(id, cancellationToken);
        if (user != null)
        {
            var json = JsonSerializer.Serialize(user, jsonOptions);
            await cache.SetStringAsync(cacheKey, json, new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(15)
            }, cancellationToken);
        }

        return user;
    }
}
```

### Database Optimization

```csharp
// Efficient queries with EF Core
public class OptimizedUserRepository : IUserRepository
{
    private readonly ApplicationDbContext context;

    public async Task<IEnumerable<User>> GetActiveUsersAsync(CancellationToken cancellationToken = default)
    {
        return await context.Users
            .Where(u => u.IsActive)
            .AsNoTracking() // Read-only queries
            .ToListAsync(cancellationToken);
    }

    public async Task<User?> GetUserWithOrdersAsync(int userId, CancellationToken cancellationToken = default)
    {
        return await context.Users
            .Include(u => u.Orders.Where(o => o.CreatedAt > DateTime.UtcNow.AddMonths(-6))) // Filtered include
            .FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);
    }

    // Bulk operations
    public async Task UpdateUserStatusBulkAsync(IEnumerable<int> userIds, bool isActive, CancellationToken cancellationToken = default)
    {
        await context.Users
            .Where(u => userIds.Contains(u.Id))
            .ExecuteUpdateAsync(u => u.SetProperty(x => x.IsActive, isActive), cancellationToken);
    }
}
```

---

## Security Hardening

### Input Validation and Sanitization

```csharp
public class InputValidationService
{
    private static readonly Regex EmailRegex = new(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", RegexOptions.Compiled);
    private static readonly Regex SqlInjectionRegex = new(@"(\b(ALTER|CREATE|DELETE|DROP|EXEC(UTE){0,1}|INSERT( +INTO){0,1}|MERGE|SELECT|UPDATE|UNION( +ALL){0,1})\b)", RegexOptions.IgnoreCase | RegexOptions.Compiled);

    public static bool IsValidEmail(string email)
    {
        return !string.IsNullOrWhiteSpace(email) && EmailRegex.IsMatch(email);
    }

    public static string SanitizeInput(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Remove potential SQL injection patterns
        if (SqlInjectionRegex.IsMatch(input))
            throw new SecurityException("Potentially malicious input detected");

        // HTML encode
        return WebUtility.HtmlEncode(input.Trim());
    }
}

// Model validation
public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .Must(InputValidationService.IsValidEmail)
            .WithMessage("Invalid email format");

        RuleFor(x => x.Name)
            .NotEmpty()
            .Length(2, 100)
            .Must(name => !SqlInjectionRegex.IsMatch(name))
            .WithMessage("Invalid characters in name");
    }
}
```

### Rate Limiting

```csharp
// Program.cs
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("Api", limiterOptions =>
    {
        limiterOptions.PermitLimit = 100;
        limiterOptions.Window = TimeSpan.FromMinutes(1);
        limiterOptions.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        limiterOptions.QueueLimit = 10;
    });
});

var app = builder.Build();
app.UseRateLimiter();

// Apply to endpoints
app.MapPost("/users", CreateUser)
   .RequireRateLimiting("Api");
```

---

## Testing Strategies

### Test Categories and Organization

```csharp
// Test categories
public static class TestCategories
{
    public const string Unit = "Unit";
    public const string Integration = "Integration";
    public const string Performance = "Performance";
    public const string Security = "Security";
}

// Performance tests
[Fact]
[Trait("Category", TestCategories.Performance)]
public async Task GetUsers_WithLargeDataset_CompletesWithinTimeLimit()
{
    // Arrange
    var stopwatch = Stopwatch.StartNew();
    
    // Act
    var users = await userService.GetUsersAsync(pageSize: 1000);
    stopwatch.Stop();
    
    // Assert
    users.Should().NotBeNull();
    stopwatch.ElapsedMilliseconds.Should().BeLessThan(5000); // 5 second limit
}

// Security tests
[Theory]
[Trait("Category", TestCategories.Security)]
[InlineData("'; DROP TABLE Users; --")]
[InlineData("<script>alert('xss')</script>")]
[InlineData("admin' OR '1'='1")]
public async Task CreateUser_WithMaliciousInput_ThrowsSecurityException(string maliciousInput)
{
    // Act & Assert
    await userService.Invoking(s => s.CreateUserAsync(maliciousInput, "Test"))
                    .Should().ThrowAsync<SecurityException>();
}
```

### Test Data Builders

```csharp
public class UserBuilder
{
    private string email = "test@example.com";
    private string name = "Test User";
    private bool isActive = true;
    private DateTime createdAt = DateTime.UtcNow;

    public UserBuilder WithEmail(string email)
    {
        this.email = email;
        return this;
    }

    public UserBuilder WithName(string name)
    {
        this.name = name;
        return this;
    }

    public UserBuilder Inactive()
    {
        this.isActive = false;
        return this;
    }

    public UserBuilder CreatedAt(DateTime createdAt)
    {
        this.createdAt = createdAt;
        return this;
    }

    public User Build() => new(email, name)
    {
        IsActive = isActive,
        CreatedAt = createdAt
    };

    public static implicit operator User(UserBuilder builder) => builder.Build();
}

// Usage in tests
[Fact]
public async Task GetActiveUsers_ReturnsOnlyActiveUsers()
{
    // Arrange
    var activeUser = new UserBuilder().WithEmail("active@test.com");
    var inactiveUser = new UserBuilder().WithEmail("inactive@test.com").Inactive();
    
    await repository.AddAsync(activeUser);
    await repository.AddAsync(inactiveUser);
    
    // Act
    var result = await repository.GetActiveUsersAsync();
    
    // Assert
    result.Should().ContainSingle()
          .Which.Email.Should().Be("active@test.com");
}
```

---

## Key Takeaways

### Essential Principles
1. **Performance First** - Use Span<T>, ValueTask, ConfigureAwait(false)
2. **Security by Default** - Input validation, authentication, authorization
3. **Testability** - Dependency injection, interfaces, clean architecture
4. **Observability** - Structured logging, health checks, metrics
5. **Maintainability** - Clean code, SOLID principles, documentation

### Modern .NET Features to Embrace
- **Nullable reference types** for better null safety
- **Record types** for immutable data structures
- **Pattern matching** for cleaner conditional logic
- **Minimal APIs** for lightweight services
- **Source generators** for compile-time code generation

### Performance Optimization
- Use **System.Text.Json** over Newtonsoft.Json
- Implement **caching strategies** (memory, distributed)
- Optimize **database queries** with EF Core best practices
- Use **async/await** properly with ConfigureAwait(false)
- Leverage **Span<T>** and **Memory<T>** for zero-allocation scenarios

### Security Best Practices
- **Never trust user input** - validate and sanitize everything
- Use **parameterized queries** to prevent SQL injection
- Implement **proper authentication and authorization**
- Apply **rate limiting** to prevent abuse
- Keep **dependencies updated** and scan for vulnerabilities

### Testing Strategy
- **Unit tests** for business logic (80% coverage target)
- **Integration tests** for API endpoints and database operations
- **Performance tests** for critical paths
- **Security tests** for input validation and authorization
- Use **test builders** and **factories** for maintainable test data

This framework provides a solid foundation for building robust, secure, and maintainable .NET applications following modern best practices and patterns.
