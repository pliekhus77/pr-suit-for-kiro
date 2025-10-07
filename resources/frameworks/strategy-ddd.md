# Domain-Driven Design (DDD) Strategy

## Purpose
Guide development teams in applying Domain-Driven Design principles to manage complexity in software systems with rich business logic and multiple bounded contexts.

## Key Concepts

### Strategic Design
- **Bounded Context** - Explicit boundaries where domain models apply
- **Ubiquitous Language** - Shared vocabulary between domain experts and developers
- **Context Mapping** - Relationships and integration patterns between contexts
- **Domain Events** - Significant business events that trigger actions across contexts

### Tactical Design
- **Entities** - Objects with identity that persist over time
- **Value Objects** - Immutable objects defined by their attributes
- **Aggregates** - Consistency boundaries that group related entities
- **Domain Services** - Operations that don't naturally belong to entities
- **Repositories** - Abstractions for data access and persistence

## Best Practices

### Bounded Context Design
- Keep contexts small and focused on specific business capabilities
- Align contexts with team boundaries (Conway's Law)
- Define clear interfaces between contexts
- Avoid sharing domain models across contexts

### Aggregate Design
- Design aggregates around business invariants
- Keep aggregates small for better performance
- Use eventual consistency between aggregates
- Load entire aggregates, not partial data

### Domain Model Implementation
```csharp
// Entity with business logic
public class Order : AggregateRoot
{
    public OrderId Id { get; private set; }
    public CustomerId CustomerId { get; private set; }
    public Money Total => _items.Sum(i => i.LineTotal);
    
    private readonly List<OrderItem> _items = new();
    
    public void AddItem(Product product, int quantity)
    {
        // Business rule validation
        if (quantity <= 0)
            throw new InvalidOperationException("Quantity must be positive");
            
        var item = new OrderItem(product, quantity);
        _items.Add(item);
        
        // Domain event
        RaiseDomainEvent(new ItemAddedToOrderEvent(Id, item));
    }
}

// Value Object
public class Money : ValueObject
{
    public decimal Amount { get; }
    public string Currency { get; }
    
    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency ?? throw new ArgumentNullException(nameof(currency));
    }
    
    protected override IEnumerable<object> GetEqualityComponents()
    {
        yield return Amount;
        yield return Currency;
    }
}
```

### Repository Pattern
```csharp
// Domain repository interface
public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id);
    Task SaveAsync(Order order);
    Task<IEnumerable<Order>> GetByCustomerAsync(CustomerId customerId);
}

// Infrastructure implementation
public class OrderRepository : IOrderRepository
{
    private readonly DbContext _context;
    
    public async Task<Order?> GetByIdAsync(OrderId id)
    {
        return await _context.Orders
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);
    }
}
```

## Implementation Patterns

### Domain Events
```csharp
public abstract class AggregateRoot
{
    private readonly List<IDomainEvent> _domainEvents = new();
    
    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }
    
    public IReadOnlyList<IDomainEvent> GetDomainEvents() => _domainEvents.AsReadOnly();
    public void ClearDomainEvents() => _domainEvents.Clear();
}

public class OrderPlacedEvent : IDomainEvent
{
    public OrderId OrderId { get; }
    public CustomerId CustomerId { get; }
    public DateTime OccurredOn { get; }
    
    public OrderPlacedEvent(OrderId orderId, CustomerId customerId)
    {
        OrderId = orderId;
        CustomerId = customerId;
        OccurredOn = DateTime.UtcNow;
    }
}
```

### Domain Services
```csharp
public class PricingService : IDomainService
{
    public Money CalculateOrderTotal(Order order, Customer customer)
    {
        var subtotal = order.Items.Sum(i => i.LineTotal);
        var discount = CalculateDiscount(subtotal, customer);
        var tax = CalculateTax(subtotal - discount, customer.Address);
        
        return subtotal - discount + tax;
    }
    
    private Money CalculateDiscount(Money subtotal, Customer customer)
    {
        // Complex business logic for discounts
        return customer.Tier switch
        {
            CustomerTier.Premium => subtotal * 0.1m,
            CustomerTier.Gold => subtotal * 0.05m,
            _ => Money.Zero(subtotal.Currency)
        };
    }
}
```

## Context Mapping Patterns

### Shared Kernel
- Small shared model between closely related contexts
- Requires coordination between teams
- Use sparingly and keep minimal

### Customer/Supplier
- Downstream context depends on upstream context
- Upstream team provides APIs for downstream consumption
- Clear service contracts and versioning

### Anti-Corruption Layer
- Protect domain model from external systems
- Translate between different models
- Isolate legacy system complexity

### Published Language
- Well-documented shared language between contexts
- Often implemented as events or APIs
- Stable interface that multiple contexts can consume

## Anti-Patterns

### Avoid These Approaches
- **Anemic Domain Model** - Entities with only getters/setters, no behavior
- **God Objects** - Aggregates that try to do everything
- **Shared Database** - Multiple contexts accessing same database tables
- **CRUD Thinking** - Focusing on data operations instead of business operations
- **Technical Partitioning** - Organizing by layers instead of business capabilities

### Common Mistakes
- Making aggregates too large
- Sharing entities across bounded contexts
- Not involving domain experts in modeling
- Applying DDD to simple CRUD applications
- Ignoring performance implications of aggregate design

## When to Use DDD

### Good Candidates
- Complex business logic with many rules
- Multiple teams working on related functionality
- Domain experts available for collaboration
- Long-term, evolving software systems
- Multiple integration points with external systems

### Poor Candidates
- Simple CRUD applications
- Technical utilities or infrastructure
- Small teams with simple domains
- Short-term or prototype projects
- Well-understood, stable domains

## Integration with Other Patterns

### Event Sourcing
- Store domain events as the source of truth
- Rebuild aggregates from event streams
- Natural fit with DDD domain events
- Provides audit trail and temporal queries

### CQRS (Command Query Responsibility Segregation)
- Separate read and write models
- Commands operate on domain aggregates
- Queries use optimized read models
- Often combined with event sourcing

### Hexagonal Architecture
- Domain at the center, isolated from external concerns
- Ports and adapters for external integrations
- Repository interfaces as ports
- Infrastructure implementations as adapters

## Summary

DDD is most valuable for complex domains with rich business logic. Focus on understanding the business domain, creating a ubiquitous language, and designing aggregates around business invariants. Use bounded contexts to manage complexity and define clear integration patterns between contexts.

Key decision points:
- Apply DDD only when domain complexity justifies the overhead
- Involve domain experts throughout the modeling process
- Design aggregates around business rules and invariants
- Use domain events for loose coupling between contexts
- Keep bounded contexts aligned with team boundaries
