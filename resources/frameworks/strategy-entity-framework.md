---
inclusion: automatic
category: database
framework: Entity Framework
description: Microsoft's ORM for .NET applications with code-first development
tags: [orm, database, dotnet, ef-core, migrations, linq]
---

# Entity Framework Strategy

## Purpose

Entity Framework (EF Core) is Microsoft's modern object-relational mapping (ORM) framework for .NET applications. This strategy provides guidance for implementing data access patterns, managing database schemas through migrations, and optimizing query performance while maintaining clean architecture principles.

## Key Concepts

- **DbContext**: Central class managing database connections and entity tracking
- **Code-First Development**: Define entities in C# and generate database schema
- **Migrations**: Version-controlled database schema changes
- **Change Tracking**: Automatic detection of entity modifications
- **LINQ Queries**: Type-safe database queries using C# syntax
- **Loading Strategies**: Eager, lazy, and explicit loading patterns
- **Repository Pattern**: Abstraction layer over data access operations

## Best Practices

### DbContext Management
- Register DbContext as scoped service in dependency injection
- Use connection pooling for high-throughput applications
- Dispose contexts properly (automatic with DI)
- Configure separate contexts for read and write operations when needed

### Entity Configuration
- Use Fluent API for complex configurations
- Apply Data Annotations for simple validations
- Implement `IEntityTypeConfiguration<T>` for organized configuration
- Configure value objects as owned types for DDD integration

### Query Optimization
- Use `AsNoTracking()` for read-only queries
- Apply projection to avoid loading unnecessary data
- Include related data explicitly to prevent N+1 queries
- Use compiled queries for frequently executed operations

### Migration Management
- Review generated migrations before applying
- Use explicit migration commands in production
- Implement seed data through `HasData()` or seeder classes
- Maintain separate migration environments

## When to Use

**Choose Entity Framework when:**
- Building .NET applications with relational databases
- Need rapid development with strong typing
- Want automatic change tracking and LINQ support
- Require migration-based schema management
- Working with complex object relationships

**Consider alternatives when:**
- Building high-performance, low-latency systems
- Need fine-grained SQL control
- Working primarily with stored procedures
- Using non-relational data stores

## Implementation Patterns

### DbContext Configuration

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options) { }

    public DbSet<Product> Products { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}

// Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

### Entity Configuration

```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        builder.Property(p => p.Name).IsRequired().HasMaxLength(100);
        
        builder.OwnsOne(p => p.Price, price =>
        {
            price.Property(p => p.Amount).HasColumnName("Price");
            price.Property(p => p.Currency).HasColumnName("Currency");
        });
    }
}
```

### Repository Pattern

```csharp
public interface IProductRepository
{
    Task<Product> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
    Task AddAsync(Product product);
    void Update(Product product);
}

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product> GetByIdAsync(int id)
    {
        return await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }
}
```

### Query Optimization

```csharp
// Read-only queries
var products = await _context.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .Select(p => new ProductDto
    {
        Id = p.Id,
        Name = p.Name,
        Price = p.Price.Amount
    })
    .ToListAsync();

// Prevent N+1 queries
var productsWithCategories = await _context.Products
    .Include(p => p.Category)
    .Where(p => p.IsActive)
    .ToListAsync();
```

### Migration Workflow

```bash
# Create migration
dotnet ef migrations add AddProductTable

# Update database
dotnet ef database update

# Generate SQL script
dotnet ef migrations script --from PreviousMigration --to TargetMigration
```

## Anti-Patterns

### Avoid These Common Mistakes

- **N+1 Queries**: Missing `Include()` statements causing multiple database calls
- **Long-lived DbContext**: Using static or singleton contexts leading to memory leaks
- **Synchronous Operations**: Using `Find()` instead of `FindAsync()` in async methods
- **Missing AsNoTracking**: Unnecessary change tracking for read-only operations
- **Direct Entity Exposure**: Returning entities directly from controllers or services

### Refactoring Examples

```csharp
// BAD: N+1 query problem
var products = await _context.Products.ToListAsync();
foreach (var product in products)
{
    Console.WriteLine(product.Category.Name); // Separate query per product
}

// GOOD: Eager loading
var products = await _context.Products
    .Include(p => p.Category)
    .ToListAsync();

// BAD: Unnecessary change tracking
var products = await _context.Products.ToListAsync();

// GOOD: No tracking for read-only
var products = await _context.Products
    .AsNoTracking()
    .ToListAsync();
```

## Integration Points

### Related Frameworks
- **[Domain-Driven Design (DDD)](ddd-strategy.md)**: Entity mapping, value objects, repository patterns
- **[TDD/BDD Testing Strategy](tdd-bdd-strategy.md)**: Unit testing with in-memory provider, integration testing
- **[.NET Best Practices](dotnet-strategy.md)**: Dependency injection, async patterns, configuration
- **[DevOps CI/CD Strategy](devops-strategy.md)**: Migration deployment, database initialization
- **[Security Strategy](security-strategy.md)**: SQL injection prevention, data protection

### Architecture Integration
```csharp
// Clean Architecture with EF Core
public class ProductService : IProductService
{
    private readonly IProductRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public async Task<ProductDto> CreateProductAsync(CreateProductCommand command)
    {
        var product = Product.Create(command.Name, command.Price);
        await _repository.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();
        return ProductDto.FromDomain(product);
    }
}
```

## Quick Reference

### Key Commands
```bash
# Migration commands
dotnet ef migrations add <MigrationName>
dotnet ef database update
dotnet ef migrations remove
dotnet ef migrations script

# Database commands
dotnet ef database drop
dotnet ef database update --connection "ConnectionString"
```

### File Locations
- **DbContext**: `src/Infrastructure/Data/ApplicationDbContext.cs`
- **Entity Configurations**: `src/Infrastructure/Data/Configurations/`
- **Repositories**: `src/Infrastructure/Data/Repositories/`
- **Migrations**: `src/Infrastructure/Data/Migrations/`

### Common Scenarios
- **Connection Strings**: Store in `appsettings.json`, use Azure Key Vault for production
- **Testing**: Use in-memory provider for unit tests, SQLite for integration tests
- **Performance**: Use `AsNoTracking()`, projection, and `Include()` strategically
- **DDD Integration**: Configure aggregates, value objects as owned types, implement repositories
