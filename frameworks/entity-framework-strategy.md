# Entity Framework Strategy Guide

## Table of Contents

1. [Overview](#overview)
2. [DbContext Configuration and Lifecycle](#dbcontext-configuration-and-lifecycle)
3. [Entity Configuration Patterns](#entity-configuration-patterns)
4. [Migrations and Schema Management](#migrations-and-schema-management)
5. [Querying Patterns and Performance](#querying-patterns-and-performance)
6. [Transaction Management](#transaction-management)
7. [Testing Strategies](#testing-strategies)
8. [DDD Integration Patterns](#ddd-integration-patterns)
9. [Security Considerations](#security-considerations)
10. [Anti-Patterns and Common Mistakes](#anti-patterns-and-common-mistakes)
11. [Cross-References and Integration](#cross-references-and-integration)

## Overview

Entity Framework (EF) is Microsoft's object-relational mapping (ORM) framework for .NET applications. This guide focuses on Entity Framework Core (EF Core), the modern, cross-platform version that supports .NET Core/.NET 5+.

### EF Core vs EF6

**Entity Framework Core** (Recommended)
- Cross-platform (.NET Core, .NET 5+)
- Better performance and memory usage
- Modern async/await support
- Lightweight and modular
- Active development and support

**Entity Framework 6** (Legacy)
- .NET Framework only
- Mature but legacy technology
- Use only for existing .NET Framework applications

### When to Use Entity Framework

**Use Entity Framework when:**
- Building .NET applications with relational databases
- Need rapid development with code-first approach
- Want strong typing and LINQ query support
- Require automatic change tracking
- Need migration-based schema management

**Consider alternatives when:**
- Building high-performance, low-latency applications
- Working with complex stored procedures or database-specific features
- Need fine-grained control over SQL generation
- Working with non-relational data stores

## DbContext Configuration and Lifecycle

### DbContext Setup

```csharp
public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) 
        : base(options) { }

    public DbSet<Product> Products { get; set; }
    public DbSet<Category> Categories { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);
    }
}
```

### Connection String Management

```csharp
// appsettings.json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=MyApp;Trusted_Connection=true"
  }
}

// Program.cs
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
```

### DbContext Lifecycle and Disposal

```csharp
// Dependency Injection (Recommended)
public class ProductService
{
    private readonly ApplicationDbContext _context;

    public ProductService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product> GetProductAsync(int id)
    {
        return await _context.Products.FindAsync(id);
    }
}

// Manual Disposal (Avoid in DI scenarios)
using var context = new ApplicationDbContext(options);
var product = await context.Products.FindAsync(id);
```

### Dependency Injection Configuration

```csharp
// Program.cs - Scoped lifetime (recommended)
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
    options.EnableSensitiveDataLogging(builder.Environment.IsDevelopment());
    options.EnableDetailedErrors(builder.Environment.IsDevelopment());
});

// Connection pooling for high-throughput scenarios
builder.Services.AddDbContextPool<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));
```

## Entity Configuration Patterns

### Fluent API Configuration (Recommended)

```csharp
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);
            
        builder.Property(p => p.Description)
            .HasMaxLength(500);
            
        builder.HasOne(p => p.Category)
            .WithMany(c => c.Products)
            .HasForeignKey(p => p.CategoryId);
            
        builder.OwnsOne(p => p.Price, price =>
        {
            price.Property(p => p.Amount).HasColumnName("Price");
            price.Property(p => p.Currency).HasColumnName("Currency");
        });
    }
}
```

### Data Annotations Approach

```csharp
public class Product
{
    public int Id { get; set; }
    
    [Required]
    [MaxLength(100)]
    public string Name { get; set; }
    
    [MaxLength(500)]
    public string Description { get; set; }
    
    public int CategoryId { get; set; }
    public Category Category { get; set; }
}
```

### When to Use Each Method

- **Fluent API**: Complex configurations, value objects, relationships
- **Data Annotations**: Simple validations, basic constraints
- **Hybrid**: Use both - annotations for simple cases, Fluent API for complex scenarios

### Relationships and Navigation Properties

```csharp
// One-to-Many
public class Category
{
    public int Id { get; set; }
    public string Name { get; set; }
    public List<Product> Products { get; set; } = new();
}

// Many-to-Many (EF Core 5+)
public class ProductTag
{
    public List<Product> Products { get; set; } = new();
    public List<Tag> Tags { get; set; } = new();
}

builder.Entity<Product>()
    .HasMany(p => p.Tags)
    .WithMany(t => t.Products);
```

## Migrations and Schema Management

### Migration Workflow

```bash
# Create migration
dotnet ef migrations add InitialCreate

# Update database
dotnet ef database update

# Remove last migration (if not applied)
dotnet ef migrations remove

# Generate SQL script
dotnet ef migrations script
```

### Database Initialization Strategies

```csharp
// Program.cs - Automatic migration (Development only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await context.Database.MigrateAsync();
}

// Production - Use explicit migration commands
// dotnet ef database update --connection "ProductionConnectionString"
```

### Seed Data Patterns

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Category>().HasData(
        new Category { Id = 1, Name = "Electronics" },
        new Category { Id = 2, Name = "Books" }
    );
}

// Or use a seeder class
public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        if (!await context.Categories.AnyAsync())
        {
            context.Categories.AddRange(
                new Category { Name = "Electronics" },
                new Category { Name = "Books" }
            );
            await context.SaveChangesAsync();
        }
    }
}
```

### Migration Rollback and Troubleshooting

```bash
# Rollback to specific migration
dotnet ef database update PreviousMigrationName

# Reset database (Development only)
dotnet ef database drop
dotnet ef database update

# Check migration status
dotnet ef migrations list
```

## Querying Patterns and Performance

### LINQ Query Patterns

```csharp
// Basic queries
var products = await context.Products
    .Where(p => p.IsActive)
    .OrderBy(p => p.Name)
    .ToListAsync();

// Complex queries with joins
var productSummaries = await context.Products
    .Include(p => p.Category)
    .Where(p => p.Price.Amount > 100)
    .Select(p => new ProductSummary
    {
        Id = p.Id,
        Name = p.Name,
        CategoryName = p.Category.Name,
        Price = p.Price.Amount
    })
    .ToListAsync();
```

### Loading Strategies

```csharp
// Eager Loading
var products = await context.Products
    .Include(p => p.Category)
    .Include(p => p.Reviews)
    .ToListAsync();

// Explicit Loading
var product = await context.Products.FindAsync(id);
await context.Entry(product)
    .Collection(p => p.Reviews)
    .LoadAsync();

// Lazy Loading (Enable in OnConfiguring)
protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
{
    optionsBuilder.UseLazyLoadingProxies();
}
```

### Raw SQL and Stored Procedures

```csharp
// Raw SQL queries
var products = await context.Products
    .FromSqlRaw("SELECT * FROM Products WHERE Price > {0}", minPrice)
    .ToListAsync();

// Stored procedures
var results = await context.Database
    .SqlQueryRaw<ProductSummary>("EXEC GetProductSummary @CategoryId = {0}", categoryId)
    .ToListAsync();

// Non-query commands
await context.Database.ExecuteSqlRawAsync(
    "UPDATE Products SET IsActive = 0 WHERE LastUpdated < {0}", cutoffDate);
```

### Query Optimization Techniques

```csharp
// Use AsNoTracking for read-only queries
var products = await context.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();

// Projection to avoid loading full entities
var productNames = await context.Products
    .Where(p => p.IsActive)
    .Select(p => p.Name)
    .ToListAsync();

// Split queries for multiple includes
var products = await context.Products
    .AsSplitQuery()
    .Include(p => p.Category)
    .Include(p => p.Reviews)
    .ToListAsync();

// Compiled queries for frequently used queries
private static readonly Func<ApplicationDbContext, int, Task<Product>> GetProductById =
    EF.CompileAsyncQuery((ApplicationDbContext context, int id) =>
        context.Products.First(p => p.Id == id));
```

### Change Tracking and AsNoTracking Usage

```csharp
// Change tracking enabled (default)
var product = await context.Products.FindAsync(id);
product.Name = "Updated Name";
await context.SaveChangesAsync(); // Automatically detects changes

// No tracking for read-only scenarios
var products = await context.Products
    .AsNoTracking()
    .ToListAsync(); // Better performance, no change detection

// Query tracking behavior
context.ChangeTracker.QueryTrackingBehavior = QueryTrackingBehavior.NoTracking;
```

## Transaction Management

### Transaction Handling

```csharp
// Automatic transactions (SaveChanges)
using var transaction = await context.Database.BeginTransactionAsync();
try
{
    context.Products.Add(new Product { Name = "Product 1" });
    await context.SaveChangesAsync();
    
    context.Categories.Add(new Category { Name = "Category 1" });
    await context.SaveChangesAsync();
    
    await transaction.CommitAsync();
}
catch
{
    await transaction.RollbackAsync();
    throw;
}

// Using transaction scope
using var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled);
await context.SaveChangesAsync();
scope.Complete();
```

### Isolation Levels

```csharp
using var transaction = await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted);
// Perform operations
await transaction.CommitAsync();
```

### Distributed Transactions

```csharp
// Use TransactionScope for distributed transactions
using var scope = new TransactionScope(
    TransactionScopeOption.Required,
    new TransactionOptions { IsolationLevel = IsolationLevel.ReadCommitted },
    TransactionScopeAsyncFlowOption.Enabled);

await context1.SaveChangesAsync();
await context2.SaveChangesAsync();

scope.Complete();
```

## Testing Strategies

### Unit Testing with In-Memory Provider

```csharp
[Test]
public async Task GetProduct_ReturnsCorrectProduct()
{
    // Arrange
    var options = new DbContextOptionsBuilder<ApplicationDbContext>()
        .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
        .Options;

    using var context = new ApplicationDbContext(options);
    context.Products.Add(new Product { Id = 1, Name = "Test Product" });
    await context.SaveChangesAsync();

    // Act
    var service = new ProductService(context);
    var result = await service.GetProductAsync(1);

    // Assert
    Assert.That(result.Name, Is.EqualTo("Test Product"));
}
```

### Integration Testing with SQLite

```csharp
public class IntegrationTestBase : IDisposable
{
    protected ApplicationDbContext Context { get; private set; }

    public IntegrationTestBase()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite("DataSource=:memory:")
            .Options;

        Context = new ApplicationDbContext(options);
        Context.Database.OpenConnection();
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
    }
}
```

### Repository Mocking

```csharp
public interface IProductRepository
{
    Task<Product> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetAllAsync();
}

[Test]
public async Task ProductService_GetProduct_CallsRepository()
{
    // Arrange
    var mockRepo = new Mock<IProductRepository>();
    mockRepo.Setup(r => r.GetByIdAsync(1))
        .ReturnsAsync(new Product { Id = 1, Name = "Test" });

    var service = new ProductService(mockRepo.Object);

    // Act
    var result = await service.GetProductAsync(1);

    // Assert
    mockRepo.Verify(r => r.GetByIdAsync(1), Times.Once);
}
```

## DDD Integration Patterns

### Mapping DDD Entities to EF Entities

```csharp
// Domain Entity
public class Product : AggregateRoot
{
    public ProductId Id { get; private set; }
    public string Name { get; private set; }
    public Money Price { get; private set; }

    public void UpdatePrice(Money newPrice)
    {
        Price = newPrice;
        AddDomainEvent(new ProductPriceUpdatedEvent(Id, newPrice));
    }
}

// EF Configuration
public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);
        
        builder.Property(p => p.Id)
            .HasConversion(id => id.Value, value => new ProductId(value));
            
        builder.OwnsOne(p => p.Price, money =>
        {
            money.Property(m => m.Amount).HasColumnName("Price");
            money.Property(m => m.Currency).HasColumnName("Currency");
        });
        
        builder.Ignore(p => p.DomainEvents);
    }
}
```

### Value Objects as Owned Types

```csharp
public class Money
{
    public decimal Amount { get; private set; }
    public string Currency { get; private set; }

    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }
}

// Configuration
builder.OwnsOne(p => p.Price, price =>
{
    price.Property(p => p.Amount).HasColumnName("Price");
    price.Property(p => p.Currency).HasColumnName("Currency").HasMaxLength(3);
});
```

### Repository Pattern Implementation

```csharp
public interface IProductRepository
{
    Task<Product> GetByIdAsync(ProductId id);
    Task<IEnumerable<Product>> GetByCategoryAsync(CategoryId categoryId);
    Task AddAsync(Product product);
    void Update(Product product);
    void Delete(Product product);
}

public class ProductRepository : IProductRepository
{
    private readonly ApplicationDbContext _context;

    public ProductRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Product> GetByIdAsync(ProductId id)
    {
        return await _context.Products
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);
    }

    public async Task AddAsync(Product product)
    {
        await _context.Products.AddAsync(product);
    }

    public void Update(Product product)
    {
        _context.Products.Update(product);
    }
}
```

## Security Considerations

### SQL Injection Prevention

```csharp
// Safe: Parameterized queries
var products = await context.Products
    .Where(p => p.Name.Contains(searchTerm))
    .ToListAsync();

// Safe: Raw SQL with parameters
var products = await context.Products
    .FromSqlRaw("SELECT * FROM Products WHERE Name LIKE {0}", $"%{searchTerm}%")
    .ToListAsync();

// Dangerous: String concatenation (NEVER DO THIS)
// var sql = $"SELECT * FROM Products WHERE Name = '{userInput}'";
```

### Connection String Security

```csharp
// Use Azure Key Vault or similar
builder.Configuration.AddAzureKeyVault(keyVaultEndpoint, credential);

// Environment variables
var connectionString = Environment.GetEnvironmentVariable("DATABASE_CONNECTION");

// User secrets (Development)
builder.Configuration.AddUserSecrets<Program>();
```

### Data Protection Patterns

```csharp
public class EncryptedStringConverter : ValueConverter<string, string>
{
    public EncryptedStringConverter(IDataProtector protector) 
        : base(
            v => protector.Protect(v),
            v => protector.Unprotect(v))
    {
    }
}

// Usage in configuration
builder.Property(e => e.SensitiveData)
    .HasConversion(new EncryptedStringConverter(dataProtector));
```

### Audit Logging

```csharp
public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
{
    var auditEntries = OnBeforeSaveChanges();
    var result = await base.SaveChangesAsync(cancellationToken);
    await OnAfterSaveChanges(auditEntries);
    return result;
}

private List<AuditEntry> OnBeforeSaveChanges()
{
    ChangeTracker.DetectChanges();
    var auditEntries = new List<AuditEntry>();
    
    foreach (var entry in ChangeTracker.Entries())
    {
        if (entry.State == EntityState.Added || 
            entry.State == EntityState.Modified || 
            entry.State == EntityState.Deleted)
        {
            auditEntries.Add(new AuditEntry(entry));
        }
    }
    
    return auditEntries;
}
```

## Anti-Patterns and Common Mistakes

### N+1 Query Problem

```csharp
// BAD: N+1 queries
var products = await context.Products.ToListAsync();
foreach (var product in products)
{
    Console.WriteLine(product.Category.Name); // Triggers separate query for each product
}

// GOOD: Eager loading
var products = await context.Products
    .Include(p => p.Category)
    .ToListAsync();
```

### Long-lived DbContext

```csharp
// BAD: Static or singleton DbContext
public static ApplicationDbContext Context = new ApplicationDbContext();

// GOOD: Scoped lifetime in DI
services.AddDbContext<ApplicationDbContext>(options => 
    options.UseSqlServer(connectionString));
```

### Synchronous Operations

```csharp
// BAD: Blocking async operations
var product = context.Products.Find(id); // Synchronous
var products = context.Products.ToList(); // Synchronous

// GOOD: Async operations
var product = await context.Products.FindAsync(id);
var products = await context.Products.ToListAsync();
```

### Missing AsNoTracking

```csharp
// BAD: Unnecessary change tracking for read-only queries
var products = await context.Products
    .Where(p => p.IsActive)
    .ToListAsync();

// GOOD: No tracking for read-only scenarios
var products = await context.Products
    .AsNoTracking()
    .Where(p => p.IsActive)
    .ToListAsync();
```

### Direct Entity Exposure

```csharp
// BAD: Exposing entities directly
public async Task<Product> GetProductAsync(int id)
{
    return await context.Products.FindAsync(id);
}

// GOOD: Use DTOs/ViewModels
public async Task<ProductDto> GetProductAsync(int id)
{
    return await context.Products
        .Where(p => p.Id == id)
        .Select(p => new ProductDto
        {
            Id = p.Id,
            Name = p.Name,
            Price = p.Price.Amount
        })
        .FirstOrDefaultAsync();
}
```

## Cross-References and Integration

### Related Framework Documents

- **[Domain-Driven Design (DDD)](ddd-strategy.md)**: Entity mapping, value objects, repository patterns
- **[.NET Best Practices](dotnet-strategy.md)**: Dependency injection, async patterns, configuration
- **[TDD/BDD Testing Strategy](tdd-bdd-strategy.md)**: Unit testing, integration testing, mocking
- **[DevOps CI/CD Strategy](devops-strategy.md)**: Migration deployment, database initialization
- **[Security Strategy](security-strategy.md)**: Data protection, audit logging, secure connections

### Integration Examples

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

// CQRS with EF Core
public class GetProductsQueryHandler : IRequestHandler<GetProductsQuery, List<ProductDto>>
{
    private readonly ApplicationDbContext _context;

    public async Task<List<ProductDto>> Handle(GetProductsQuery request, CancellationToken cancellationToken)
    {
        return await _context.Products
            .AsNoTracking()
            .Where(p => p.IsActive)
            .Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price.Amount
            })
            .ToListAsync(cancellationToken);
    }
}
```

### Key Commands and File Locations

**Migration Commands:**
```bash
dotnet ef migrations add <MigrationName>
dotnet ef database update
dotnet ef migrations remove
dotnet ef migrations script
```

**File Locations:**
- DbContext: `src/Infrastructure/Data/ApplicationDbContext.cs`
- Entity Configurations: `src/Infrastructure/Data/Configurations/`
- Repositories: `src/Infrastructure/Data/Repositories/`
- Migrations: `src/Infrastructure/Data/Migrations/`

**Configuration:**
- Connection strings: `appsettings.json`
- DI registration: `Program.cs` or `Startup.cs`
- Entity configurations: Separate configuration classes implementing `IEntityTypeConfiguration<T>`
