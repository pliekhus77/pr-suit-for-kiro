# .NET Best Practices Strategy

## Purpose
Guide development teams in applying modern .NET 8.0+ development patterns for performance, security, maintainability, and cloud-native deployment.

## Key Concepts

### Modern .NET Principles
- **Performance First** - Optimize for throughput and memory efficiency
- **Cloud Native** - Design for containers, microservices, and serverless
- **Minimal APIs** - Reduce ceremony, focus on business logic
- **Source Generators** - Compile-time code generation over runtime reflection
- **Nullable Reference Types** - Compile-time null safety

### Platform Features
- **Span<T> and Memory<T>** - High-performance memory operations
- **System.Text.Json** - Fast, low-allocation JSON serialization
- **Native AOT** - Ahead-of-time compilation for faster startup
- **Minimal APIs** - Lightweight HTTP APIs with less overhead
- **Record Types** - Immutable data structures with value semantics

## Best Practices

### API Development
```csharp
// Minimal API with proper patterns
var builder = WebApplication.CreateBuilder(args);

// Configure services
builder.Services.AddScoped<IOrderService, OrderService>();
builder.Services.AddDbContext<OrderContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

// Map endpoints with proper validation and error handling
app.MapPost("/api/orders", async (CreateOrderRequest request, IOrderService orderService) =>
{
    var result = await orderService.CreateOrderAsync(request);
    return result.IsSuccess 
        ? Results.Created($"/api/orders/{result.Value.Id}", result.Value)
        : Results.BadRequest(result.Error);
})
.WithName("CreateOrder")
.WithOpenApi()
.Produces<OrderResponse>(StatusCodes.Status201Created)
.Produces<ProblemDetails>(StatusCodes.Status400BadRequest);

app.Run();
```

### Performance Patterns
```csharp
// Use Span<T> for efficient string operations
public static string FormatOrderId(ReadOnlySpan<char> prefix, int orderId)
{
    Span<char> buffer = stackalloc char[32];
    prefix.CopyTo(buffer);
    
    var orderIdSpan = buffer[prefix.Length..];
    orderId.TryFormat(orderIdSpan, out var written);
    
    return new string(buffer[..(prefix.Length + written)]);
}

// Efficient JSON serialization with source generators
[JsonSerializable(typeof(OrderResponse))]
[JsonSerializable(typeof(CreateOrderRequest))]
public partial class OrderJsonContext : JsonSerializerContext { }

// Use in API
app.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.TypeInfoResolverChain.Insert(0, OrderJsonContext.Default);
});
```

### Memory Management
```csharp
// Use object pooling for frequently allocated objects
public class OrderProcessor
{
    private readonly ObjectPool<StringBuilder> _stringBuilderPool;
    
    public OrderProcessor(ObjectPool<StringBuilder> stringBuilderPool)
    {
        _stringBuilderPool = stringBuilderPool;
    }
    
    public string ProcessOrder(Order order)
    {
        var sb = _stringBuilderPool.Get();
        try
        {
            // Use StringBuilder for string building
            sb.AppendLine($"Order: {order.Id}");
            sb.AppendLine($"Customer: {order.CustomerId}");
            return sb.ToString();
        }
        finally
        {
            _stringBuilderPool.Return(sb);
        }
    }
}
```

### Async Patterns
```csharp
// Proper async/await with ConfigureAwait
public class OrderService
{
    private readonly HttpClient _httpClient;
    
    public async Task<OrderResult> ProcessOrderAsync(Order order, CancellationToken cancellationToken = default)
    {
        // Use ConfigureAwait(false) in library code
        var response = await _httpClient.PostAsJsonAsync("/api/validate", order, cancellationToken)
            .ConfigureAwait(false);
        
        if (!response.IsSuccessStatusCode)
        {
            return OrderResult.Failed("Validation failed");
        }
        
        // Use ValueTask for potentially synchronous operations
        var result = await SaveOrderAsync(order, cancellationToken).ConfigureAwait(false);
        return OrderResult.Success(result);
    }
    
    private ValueTask<Order> SaveOrderAsync(Order order, CancellationToken cancellationToken)
    {
        // Return completed ValueTask if already cached
        if (_orderCache.TryGetValue(order.Id, out var cached))
        {
            return ValueTask.FromResult(cached);
        }
        
        // Otherwise perform async operation
        return new ValueTask<Order>(SaveOrderToDbAsync(order, cancellationToken));
    }
}
```

## Data Access Patterns

### Entity Framework Core
```csharp
// Efficient EF Core patterns
public class OrderRepository
{
    private readonly OrderContext _context;
    
    public async Task<Order?> GetOrderWithItemsAsync(int orderId)
    {
        // Use AsNoTracking for read-only queries
        return await _context.Orders
            .AsNoTracking()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }
    
    public async Task<IEnumerable<OrderSummary>> GetOrderSummariesAsync(int customerId)
    {
        // Project to DTOs to avoid loading full entities
        return await _context.Orders
            .Where(o => o.CustomerId == customerId)
            .Select(o => new OrderSummary
            {
                Id = o.Id,
                Total = o.Total,
                Status = o.Status,
                CreatedAt = o.CreatedAt
            })
            .ToListAsync();
    }
}
```

### Dapper for High Performance
```csharp
// Use Dapper for performance-critical queries
public class OrderQueryService
{
    private readonly IDbConnection _connection;
    
    public async Task<IEnumerable<OrderSummary>> GetTopOrdersAsync(int limit)
    {
        const string sql = """
            SELECT Id, CustomerId, Total, Status, CreatedAt 
            FROM Orders 
            ORDER BY Total DESC 
            LIMIT @Limit
            """;
        
        return await _connection.QueryAsync<OrderSummary>(sql, new { Limit = limit });
    }
}
```

## Error Handling and Validation

### Result Pattern
```csharp
// Use Result pattern instead of exceptions for business logic
public readonly record struct Result<T, TError>
{
    public T? Value { get; }
    public TError? Error { get; }
    public bool IsSuccess { get; }
    
    private Result(T value)
    {
        Value = value;
        Error = default;
        IsSuccess = true;
    }
    
    private Result(TError error)
    {
        Value = default;
        Error = error;
        IsSuccess = false;
    }
    
    public static Result<T, TError> Success(T value) => new(value);
    public static Result<T, TError> Failure(TError error) => new(error);
}
```

### Input Validation
```csharp
// Use FluentValidation for complex validation
public class CreateOrderRequestValidator : AbstractValidator<CreateOrderRequest>
{
    public CreateOrderRequestValidator()
    {
        RuleFor(x => x.CustomerId)
            .NotEmpty()
            .WithMessage("Customer ID is required");
            
        RuleFor(x => x.Items)
            .NotEmpty()
            .WithMessage("Order must contain at least one item");
            
        RuleForEach(x => x.Items)
            .SetValidator(new OrderItemValidator());
    }
}
```

## Testing Patterns

### Unit Testing
```csharp
// Use record types for test data
public record OrderTestData(
    int Id,
    int CustomerId,
    decimal Total,
    OrderStatus Status = OrderStatus.Pending);

[Fact]
public async Task CreateOrder_WithValidData_ReturnsSuccess()
{
    // Arrange
    var testData = new OrderTestData(1, 123, 99.99m);
    var mockRepository = new Mock<IOrderRepository>();
    var service = new OrderService(mockRepository.Object);
    
    // Act
    var result = await service.CreateOrderAsync(testData.ToCreateRequest());
    
    // Assert
    result.IsSuccess.Should().BeTrue();
    result.Value.Total.Should().Be(testData.Total);
}
```

### Integration Testing
```csharp
// Use WebApplicationFactory for API testing
public class OrderApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    
    public OrderApiTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
    }
    
    [Fact]
    public async Task CreateOrder_ReturnsCreatedOrder()
    {
        // Arrange
        var request = new CreateOrderRequest { CustomerId = 123, Items = [...] };
        
        // Act
        var response = await _client.PostAsJsonAsync("/api/orders", request);
        
        // Assert
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var order = await response.Content.ReadFromJsonAsync<OrderResponse>();
        order.Should().NotBeNull();
    }
}
```

## Anti-Patterns

### Avoid These Approaches
- **Blocking Async Code** - Using .Result or .Wait() on async methods
- **Excessive Allocations** - Creating unnecessary objects in hot paths
- **Reflection in Hot Paths** - Use source generators instead
- **Ignoring Cancellation** - Not passing CancellationToken through async chains
- **Poor Exception Handling** - Using exceptions for control flow

### Common Mistakes
- Not using ConfigureAwait(false) in library code
- Mixing async and sync code incorrectly
- Not disposing IDisposable resources properly
- Ignoring nullable reference type warnings
- Using outdated patterns from .NET Framework

## Security Best Practices

### Authentication and Authorization
```csharp
// Use JWT Bearer authentication
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

// Use policy-based authorization
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireManagerRole", policy =>
        policy.RequireRole("Manager"));
});
```

### Input Sanitization
```csharp
// Sanitize user input
public class OrderController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        // Validate and sanitize input
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }
        
        // Use parameterized queries to prevent SQL injection
        var sanitizedRequest = new CreateOrderRequest
        {
            CustomerId = request.CustomerId,
            Items = request.Items.Select(SanitizeOrderItem).ToList()
        };
        
        var result = await _orderService.CreateOrderAsync(sanitizedRequest);
        return result.IsSuccess ? Ok(result.Value) : BadRequest(result.Error);
    }
}
```

## Summary

Modern .NET development emphasizes performance, security, and maintainability through proper use of platform features, async patterns, and cloud-native design. Focus on minimal APIs, efficient memory usage, and proper error handling while leveraging source generators and nullable reference types for better developer experience.

Key decision points:
- Use minimal APIs for lightweight HTTP services
- Apply Span<T> and Memory<T> for performance-critical code
- Implement proper async/await patterns with cancellation
- Use source generators instead of runtime reflection
- Apply nullable reference types for compile-time safety
- Design for cloud-native deployment and scaling
