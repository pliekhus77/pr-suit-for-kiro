# .NET Best Practices: Modern Development Patterns That Work

*Published: Week 4, Monday - Development & Technology Series*

## The Framework Upgrade Trap

Remember when .NET Core came out and everyone said "just upgrade your existing code"? I tried that on our e-commerce project's predecessor. Three months later, we had a Frankenstein application that used async/await in some places, blocking calls in others, and a mix of dependency injection patterns that made debugging a nightmare.

The problem wasn't .NET - it was that we upgraded the framework without upgrading our patterns. We were writing .NET Framework code in a .NET 8 world.

That's when I realized: modern .NET isn't just about new language features. It's about fundamentally different approaches to performance, memory management, and application architecture.

## What Modern .NET Actually Changes

.NET 8 isn't just "C# with more features." It's a different platform with different performance characteristics, different deployment models, and different best practices:

- **Performance-first**: Everything is optimized for throughput and memory efficiency
- **Cloud-native**: Built for containers, microservices, and serverless deployment
- **Minimal APIs**: Less ceremony, more focus on business logic
- **Source generators**: Compile-time code generation instead of runtime reflection
- **Nullable reference types**: Catching null reference exceptions at compile time

Without guidance, AI generates code that works but doesn't take advantage of these improvements.

## Real Example: Product Search API

**Old .NET Framework approach** - AI generates familiar but inefficient patterns:
```csharp
[ApiController]
[Route("api/[controller]")]
public class ProductController : ControllerBase
{
    private readonly IProductService _productService;
    
    public ProductController(IProductService productService)
    {
        _productService = productService;
    }
    
    [HttpGet("search")]
    public async Task<ActionResult<List<ProductDto>>> Search(string query)
    {
        if (string.IsNullOrEmpty(query))
        {
            return BadRequest("Query cannot be empty");
        }
        
        var products = await _productService.SearchAsync(query);
        var dtos = new List<ProductDto>();
        
        foreach (var product in products)
        {
            dtos.Add(new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description
            });
        }
        
        return Ok(dtos);
    }
}
```

**Modern .NET 8 approach** - AI generates optimized patterns:
```csharp
// Minimal API with source generators
public static class ProductEndpoints
{
    public static void MapProductEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var group = endpoints.MapGroup("/api/products");
        
        group.MapGet("/search", SearchProducts)
             .WithName("SearchProducts")
             .WithOpenApi()
             .CacheOutput(TimeSpan.FromMinutes(5));
    }
    
    private static async Task<Results<Ok<ProductSearchResult[]>, BadRequest<string>>> 
        SearchProducts(
            [FromQuery] string query,
            IProductSearchService searchService,
            CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(query))
            return TypedResults.BadRequest("Query cannot be empty");
            
        // Use memory-efficient patterns
        var results = await searchService
            .SearchAsync(query, cancellationToken)
            .ConfigureAwait(false);
            
        // Source generator creates efficient mapping
        return TypedResults.Ok(results.ToSearchResultArray());
    }
}

// Record types for immutable DTOs
public readonly record struct ProductSearchResult(
    int Id,
    string Name,
    decimal Price,
    string? Description);

// Source generator for efficient mapping
[Mapper]
public static partial class ProductMapper
{
    public static partial ProductSearchResult[] ToSearchResultArray(
        this IEnumerable<Product> products);
}
```

The modern approach is more performant, uses less memory, and has better compile-time safety.

## The Performance Revolution

Modern .NET performance improvements aren't just "nice to have" - they're game-changers:

**Memory Allocation**: Span<T> and Memory<T> reduce garbage collection pressure
**JSON Serialization**: System.Text.Json is 2-3x faster than Newtonsoft.Json
**HTTP Performance**: Minimal APIs have 30% less overhead than MVC controllers
**Startup Time**: Native AOT compilation for sub-second cold starts

Our e-commerce API went from 200ms average response time to 45ms just by applying modern patterns.

## Real Implementation: Order Processing

**Traditional approach**:
```csharp
public class OrderService
{
    public async Task<OrderResult> ProcessOrderAsync(CreateOrderRequest request)
    {
        // Lots of allocations and boxing
        var validationErrors = new List<string>();
        
        if (request.Items == null || request.Items.Count == 0)
            validationErrors.Add("Order must contain items");
            
        if (request.CustomerId <= 0)
            validationErrors.Add("Invalid customer ID");
            
        if (validationErrors.Any())
            return OrderResult.Failed(validationErrors);
            
        // More inefficient patterns...
    }
}
```

**Modern .NET approach**:
```csharp
public class OrderService
{
    public async ValueTask<Result<OrderId, ValidationError>> ProcessOrderAsync(
        CreateOrderRequest request,
        CancellationToken cancellationToken = default)
    {
        // Use discriminated unions instead of exceptions
        var validation = ValidateRequest(request);
        if (validation.IsFailure)
            return validation.Error;
            
        // Use spans for efficient string operations
        ReadOnlySpan<char> customerIdSpan = request.CustomerId.AsSpan();
        
        // Use source generators for serialization
        var orderEvent = new OrderCreatedEvent
        {
            OrderId = OrderId.New(),
            CustomerId = CustomerId.Parse(customerIdSpan),
            Items = request.Items.ToOrderItems(), // Generated mapping
            Timestamp = DateTimeOffset.UtcNow
        };
        
        // Use channels for async processing
        await _orderChannel.Writer.WriteAsync(orderEvent, cancellationToken);
        
        return orderEvent.OrderId;
    }
    
    private static Result<Unit, ValidationError> ValidateRequest(CreateOrderRequest request)
    {
        // Use pattern matching and records
        return request switch
        {
            { Items.Count: 0 } => ValidationError.EmptyOrder,
            { CustomerId: null or "" } => ValidationError.InvalidCustomer,
            _ => Unit.Value
        };
    }
}

// Use records for immutable data
public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.NewGuid());
}

// Discriminated unions for better error handling
public abstract record Result<TSuccess, TError>
{
    public record Success(TSuccess Value) : Result<TSuccess, TError>;
    public record Failure(TError Error) : Result<TSuccess, TError>;
}
```

## The Framework's Practical Guidance

The .NET framework tells AI:
- **Use minimal APIs** for better performance and less ceremony
- **Leverage source generators** instead of runtime reflection
- **Apply memory-efficient patterns** with Span<T> and stackalloc
- **Use nullable reference types** for compile-time null safety
- **Implement proper async patterns** with ConfigureAwait and cancellation tokens
- **Choose record types** for immutable data structures

## What Our E-Commerce Team Gained

**Performance**: 60% faster API responses, 40% less memory usage
**Reliability**: Null reference exceptions caught at compile time
**Maintainability**: Less boilerplate code, more focus on business logic
**Developer Experience**: Better tooling support and IntelliSense
**Deployment**: Smaller container images with native AOT

## The Migration Reality

You can't just upgrade to .NET 8 and get these benefits automatically. The patterns need to change:

**Old Patterns to Avoid**:
- Heavy use of reflection and dynamic code
- Synchronous database calls
- Excessive object allocations in hot paths
- Nullable reference types disabled
- Traditional MVC controllers for simple APIs

**New Patterns to Embrace**:
- Source generators for compile-time code generation
- Async/await with proper cancellation support
- Memory-efficient string and collection operations
- Nullable reference types enabled by default
- Minimal APIs for lightweight endpoints

## When Modern .NET Is Overkill

**Legacy Integration**: If you're stuck with .NET Framework dependencies
**Simple Applications**: CRUD apps might not need advanced performance patterns
**Team Experience**: If your team isn't ready for the learning curve
**Prototype Phase**: Early exploration doesn't need production optimization

But be realistic about performance requirements. Most applications benefit from modern patterns.

## Common Modern .NET Mistakes

**Premature Optimization**: Using Span<T> everywhere instead of where it matters
**Source Generator Overuse**: Generating code that's simpler to write by hand
**Async Everywhere**: Making everything async even when it doesn't need to be
**Record Abuse**: Using records for mutable data that should be classes
**Minimal API Overreach**: Using minimal APIs for complex scenarios that need MVC

## The Learning Investment

Modern .NET requires learning new concepts:
- Understanding memory management and allocation patterns
- Mastering async/await and cancellation tokens
- Learning source generators and compile-time metaprogramming
- Adopting functional programming concepts like discriminated unions

The framework helps AI generate the right patterns, but the team needs to understand the principles.

## What's Next

Wednesday we'll explore Infrastructure as Code with Pulumi - why we chose it over Terraform and how modern programming languages make infrastructure more maintainable than YAML or HCL.

Friday we'll look at DevOps frameworks and how to move from "DevOps as culture" to "DevOps as implementation" with practical CI/CD patterns.

## Your Turn

Are you using modern .NET patterns, or still writing .NET Framework code in .NET 8? What's your biggest challenge - performance optimization, learning new patterns, or migrating existing code?

---

*Want to see the full .NET Best Practices framework content? Check out the [.NET framework reference](link) or see how it helps AI generate modern, performant C# code that takes advantage of the latest platform improvements.*
