---
inclusion: always
category: Development Strategy
framework: .NET Best Practices
description: Modern .NET 8.0+ development patterns for performance, security, maintainability, and cloud-native deployment
tags: [dotnet, csharp, performance, security, cloud-native, minimal-apis]
---

# .NET Best Practices Strategy

## Purpose
Guide development teams in applying modern .NET 8.0+ development patterns for performance, security, maintainability, and cloud-native deployment.

## Core Principles

### Modern .NET Features
- **Performance First**: Optimize for throughput and memory efficiency
- **Cloud Native**: Design for containers, microservices, and serverless
- **Minimal APIs**: Reduce ceremony, focus on business logic
- **Source Generators**: Compile-time code generation over runtime reflection
- **Nullable Reference Types**: Compile-time null safety

### Platform Advantages
| Feature | Benefit | Use Case |
|---------|---------|----------|
| **Span<T>/Memory<T>** | Zero-allocation operations | High-performance data processing |
| **System.Text.Json** | Fast JSON serialization | API responses, configuration |
| **Native AOT** | Faster startup, smaller footprint | Serverless functions, containers |
| **Record Types** | Immutable data structures | DTOs, value objects |
| **Minimal APIs** | Lightweight HTTP endpoints | Microservices, simple APIs |

## API Development Best Practices

### Minimal API Pattern
```csharp
var builder = WebApplication.CreateBuilder(args);

// Service configuration
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddDbContext<OrderContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

var app = builder.Build();

// Endpoint mapping with validation
app.MapPost("/api/orders", async (CreateOrderRequest request, IOrderService service) =>
{
    var result = await service.CreateOrderAsync(request);
    return result.IsSuccess 
        ? Results.Created($"/api/orders/{result.Value.Id}", result.Value)
        : Results.BadRequest(result.Error);
})
.WithName("CreateOrder")
.WithOpenApi()
.Produces<OrderResponse>(201)
.Produces<ProblemDetails>(400);
```

### Error Handling Pattern
```csharp
// Result pattern for error handling
public record Result<T>(bool IsSuccess, T? Value, string? Error)
{
    public static Result<T> Success(T value) => new(true, value, null);
    public static Result<T> Failure(string error) => new(false, default, error);
}

// Global exception handling
app.UseExceptionHandler(exceptionHandlerApp =>
{
    exceptionHandlerApp.Run(async context =>
    {
        var exception = context.Features.Get<IExceptionHandlerFeature>()?.Error;
        var response = new ProblemDetails
        {
            Status = 500,
            Title = "An error occurred",
            Detail = exception?.Message
        };
        await context.Response.WriteAsJsonAsync(response);
    });
});
```

## Performance Optimization

### Memory Management
```csharp
// Use Span<T> for high-performance operations
public static int ProcessData(ReadOnlySpan<byte> data)
{
    var sum = 0;
    foreach (var b in data)
    {
        sum += b;
    }
    return sum;
}

// Object pooling for frequently allocated objects
services.AddSingleton<ObjectPool<StringBuilder>>(serviceProvider =>
{
    var provider = serviceProvider.GetService<ObjectPoolProvider>();
    return provider.CreateStringBuilderPool();
});
```

### Async Best Practices
```csharp
// Proper async/await usage
public async Task<OrderResponse> CreateOrderAsync(CreateOrderRequest request)
{
    // Use ConfigureAwait(false) in libraries
    var order = await _repository.CreateAsync(request).ConfigureAwait(false);
    
    // Parallel operations when possible
    var tasks = new[]
    {
        _emailService.SendConfirmationAsync(order.Email),
        _inventoryService.ReserveItemsAsync(order.Items),
        _paymentService.ProcessPaymentAsync(order.Payment)
    };
    
    await Task.WhenAll(tasks);
    return order.ToResponse();
}
```

## Security Implementation

### Authentication & Authorization
```csharp
// JWT authentication setup
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]))
        };
    });

// Policy-based authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("AdminOnly", policy => 
        policy.RequireRole("Admin"));
    options.AddPolicy("CanManageOrders", policy =>
        policy.RequireClaim("permission", "orders:manage"));
});
```

### Input Validation
```csharp
// Data annotations with custom validation
public record CreateOrderRequest
{
    [Required, EmailAddress]
    public string Email { get; init; } = string.Empty;
    
    [Required, Range(0.01, double.MaxValue)]
    public decimal Amount { get; init; }
    
    [Required, MinLength(1)]
    public List<OrderItem> Items { get; init; } = new();
}

// FluentValidation for complex scenarios
public class CreateOrderValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Amount).GreaterThan(0);
        RuleFor(x => x.Items).NotEmpty();
        RuleForEach(x => x.Items).SetValidator(new OrderItemValidator());
    }
}
```

## Database Integration

### Entity Framework Core Best Practices
```csharp
// DbContext configuration
public class OrderContext : DbContext
{
    public OrderContext(DbContextOptions<OrderContext> options) : base(options) { }
    
    public DbSet<Order> Orders => Set<Order>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        // Configure entities
        modelBuilder.Entity<Order>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.Amount).HasPrecision(18, 2);
            entity.HasIndex(e => e.Email);
        });
    }
}

// Repository pattern with async operations
public class OrderRepository : IOrderRepository
{
    private readonly OrderContext _context;
    
    public async Task<Order?> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id, cancellationToken);
    }
    
    public async Task<Order> CreateAsync(Order order, CancellationToken cancellationToken = default)
    {
        _context.Orders.Add(order);
        await _context.SaveChangesAsync(cancellationToken);
        return order;
    }
}
```

## Testing Strategy

### Unit Testing with xUnit
```csharp
public class OrderServiceTests
{
    private readonly Mock<IOrderRepository> _mockRepository;
    private readonly OrderService _service;
    
    public OrderServiceTests()
    {
        _mockRepository = new Mock<IOrderRepository>();
        _service = new OrderService(_mockRepository.Object);
    }
    
    [Fact]
    public async Task CreateOrderAsync_ValidRequest_ReturnsSuccess()
    {
        // Arrange
        var request = new CreateOrderRequest { Email = "test@example.com", Amount = 100 };
        var expectedOrder = new Order { Id = 1, Email = request.Email, Amount = request.Amount };
        
        _mockRepository.Setup(r => r.CreateAsync(It.IsAny<Order>(), default))
                      .ReturnsAsync(expectedOrder);
        
        // Act
        var result = await _service.CreateOrderAsync(request);
        
        // Assert
        Assert.True(result.IsSuccess);
        Assert.Equal(expectedOrder.Id, result.Value?.Id);
    }
}
```

### Integration Testing
```csharp
public class OrderApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public OrderApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }
    
    [Fact]
    public async Task CreateOrder_ValidRequest_ReturnsCreated()
    {
        // Arrange
        var request = new CreateOrderRequest { Email = "test@example.com", Amount = 100 };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", request);
        
        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        Assert.NotNull(order);
    }
}
```

## Cloud Deployment

### Docker Configuration
```dockerfile
# Multi-stage build for optimized images
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["MyApp.csproj", "."]
RUN dotnet restore
COPY . .
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.dll"]
```

### Health Checks
```csharp
// Health check configuration
builder.Services.AddHealthChecks()
    .AddDbContext<OrderContext>()
    .AddUrlGroup(new Uri("https://external-api.com/health"), "external-api");

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = UIResponseWriter.WriteHealthCheckUIResponse
});
```

## Configuration Management

### Strongly-Typed Configuration
```csharp
// Configuration classes
public class JwtSettings
{
    public string Issuer { get; set; } = string.Empty;
    public string Audience { get; set; } = string.Empty;
    public string Key { get; set; } = string.Empty;
    public int ExpirationMinutes { get; set; } = 60;
}

// Registration
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection("Jwt"));

// Usage with IOptions
public class AuthService
{
    private readonly JwtSettings _jwtSettings;
    
    public AuthService(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings.Value;
    }
}
```

## Monitoring Integration

### Logging with Serilog
```csharp
// Serilog configuration
builder.Host.UseSerilog((context, configuration) =>
    configuration.ReadFrom.Configuration(context.Configuration)
                 .Enrich.FromLogContext()
                 .WriteTo.Console()
                 .WriteTo.ApplicationInsights());

// Structured logging usage
_logger.LogInformation("Order {OrderId} created for user {UserId} with amount {Amount:C}",
    order.Id, order.UserId, order.Amount);
```

## Best Practices Summary

### Do's
- ✅ Use minimal APIs for simple endpoints
- ✅ Implement proper error handling with Result patterns
- ✅ Use async/await consistently
- ✅ Apply nullable reference types
- ✅ Use Span<T> for high-performance scenarios
- ✅ Implement comprehensive logging
- ✅ Use strongly-typed configuration

### Don'ts
- ❌ Block async calls with .Result or .Wait()
- ❌ Ignore cancellation tokens
- ❌ Use exceptions for control flow
- ❌ Forget to dispose resources
- ❌ Use reflection in hot paths
- ❌ Ignore security best practices
- ❌ Skip input validation
