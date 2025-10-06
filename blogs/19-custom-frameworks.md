# Custom Frameworks: Building Team-Specific Guidance

*Published: Week 7, Monday - Advanced Implementation Series*

## The "Not Invented Here" Problem

Every team thinks they're special. "Our business logic is unique." "Our architecture is different." "Those frameworks don't understand our domain." I've heard it all, and sometimes it's even true.

On our e-commerce project, we installed the standard frameworks - TDD/BDD, Clean Architecture, AWS hosting. They covered 80% of our needs perfectly. But we had specific patterns that kept coming up: complex pricing rules, multi-tenant data isolation, and integration with our parent company's legacy ERP system.

After the fifth time explaining "how we handle pricing calculations" to a new developer, I realized we needed to capture our team's specific knowledge in a custom framework. Not because we're special snowflakes, but because some knowledge is genuinely organization-specific.

## When Custom Frameworks Actually Make Sense

Most teams don't need custom frameworks. The standard ones cover common patterns well. But custom frameworks make sense when:

- **Domain-Specific Patterns**: Your business has unique rules that appear in multiple features
- **Regulatory Requirements**: Industry-specific compliance that isn't covered by standard frameworks
- **Legacy Integration**: Specific patterns for working with your existing systems
- **Organizational Standards**: Company-wide architectural decisions that need consistency
- **Tribal Knowledge**: Critical patterns that exist only in senior developers' heads

The key is "patterns that repeat." If it's a one-off solution, document it. If it's a pattern you use everywhere, framework it.

## Real Example: Our Pricing Framework

**The Problem**: Complex pricing rules that appeared everywhere:
- Base product pricing with volume discounts
- Customer-specific pricing tiers (B2B vs B2C)
- Time-based promotions and seasonal adjustments
- Geographic pricing variations
- Currency conversion with margin adjustments

**Standard frameworks didn't help** because this was business-specific logic that needed to be consistent across catalog, cart, checkout, and reporting systems.

**Our Custom Framework Solution**:
```markdown
# Pricing Framework v1.2

## Purpose
Standardize pricing calculations across all e-commerce systems to ensure consistency and maintainability.

## Core Principles
1. **Single Source of Truth**: All pricing logic flows through PricingEngine
2. **Immutable Price Objects**: Prices are calculated, not modified
3. **Audit Trail**: Every price calculation is logged with context
4. **Currency Consistency**: All internal calculations in base currency (USD)
5. **Performance First**: Pricing calculations must complete in <50ms

## Standard Patterns

### Price Calculation Pipeline
```csharp
public class PricingEngine
{
    private readonly IPricingRule[] _rules;
    
    public async Task<Price> CalculatePriceAsync(PricingContext context)
    {
        var basePrice = await GetBasePrice(context.ProductId);
        
        // Apply rules in priority order
        var finalPrice = basePrice;
        foreach (var rule in _rules.OrderBy(r => r.Priority))
        {
            if (await rule.AppliesAsync(context))
            {
                finalPrice = await rule.ApplyAsync(finalPrice, context);
            }
        }
        
        return new Price(finalPrice.Amount, finalPrice.Currency, context.CalculatedAt);
    }
}
```

### Required Pricing Rules
1. **Volume Discount Rule**: Quantity-based pricing tiers
2. **Customer Tier Rule**: B2B vs B2C pricing
3. **Geographic Rule**: Regional pricing adjustments
4. **Promotion Rule**: Time-based discounts
5. **Currency Rule**: Multi-currency conversion

### Implementation Requirements
- All pricing rules must implement `IPricingRule`
- Price calculations must be deterministic (same inputs = same outputs)
- All price changes must be audited with `IPricingAuditLogger`
- Performance: <50ms for single product, <200ms for cart pricing

## Anti-Patterns to Avoid
- ❌ Modifying prices after calculation
- ❌ Different pricing logic in different systems
- ❌ Hard-coded discounts or margins
- ❌ Currency calculations without proper rounding
- ❌ Pricing logic in controllers or UI components

## Testing Requirements
- Unit tests for each pricing rule
- Integration tests for rule combinations
- Performance tests for pricing engine
- Audit trail verification tests
```

## The Framework Creation Process

**Step 1: Identify the Pattern**
Look for code that gets copied and modified across features. In our case, every feature that dealt with money had slightly different pricing logic.

**Step 2: Extract Common Elements**
What's the same across all implementations? What varies? For pricing, the pipeline was always the same (base price + rules), but the specific rules varied.

**Step 3: Define the Interface**
Create abstractions that capture the common pattern:
```csharp
public interface IPricingRule
{
    int Priority { get; }
    Task<bool> AppliesAsync(PricingContext context);
    Task<Price> ApplyAsync(Price currentPrice, PricingContext context);
}

public class PricingContext
{
    public ProductId ProductId { get; set; }
    public CustomerId CustomerId { get; set; }
    public int Quantity { get; set; }
    public DateTime CalculatedAt { get; set; }
    public GeographicRegion Region { get; set; }
    public CustomerTier CustomerTier { get; set; }
}
```

**Step 4: Document the Patterns**
Write clear guidance for AI and developers about when and how to use the framework.

**Step 5: Validate with Real Use Cases**
Apply the framework to existing features to make sure it actually works.

## How AI Uses Custom Frameworks

With our pricing framework installed, AI now generates consistent pricing code:

**Before Custom Framework** - Inconsistent pricing logic:
```csharp
// Different pricing logic in every feature
public class CartService
{
    public decimal CalculateCartTotal(Cart cart)
    {
        decimal total = 0;
        foreach (var item in cart.Items)
        {
            var price = item.Product.BasePrice;
            
            // Ad-hoc discount logic (different everywhere)
            if (item.Quantity > 10) price *= 0.9m;
            if (cart.Customer.Type == "B2B") price *= 0.85m;
            
            total += price * item.Quantity;
        }
        return total;
    }
}
```

**After Custom Framework** - Consistent pricing patterns:
```csharp
// AI generates code following our pricing framework
public class CartService
{
    private readonly IPricingEngine _pricingEngine;
    
    public async Task<Money> CalculateCartTotalAsync(Cart cart)
    {
        var cartTotal = Money.Zero(cart.Currency);
        
        foreach (var item in cart.Items)
        {
            var pricingContext = new PricingContext
            {
                ProductId = item.ProductId,
                CustomerId = cart.CustomerId,
                Quantity = item.Quantity,
                CalculatedAt = DateTime.UtcNow,
                Region = cart.ShippingAddress.Region,
                CustomerTier = cart.Customer.Tier
            };
            
            var itemPrice = await _pricingEngine.CalculatePriceAsync(pricingContext);
            cartTotal = cartTotal.Add(itemPrice.Multiply(item.Quantity));
        }
        
        return cartTotal;
    }
}
```

AI now follows our established patterns automatically.

## Real Implementation: Multi-Tenant Data Framework

**The Problem**: Every feature needed to handle multi-tenant data isolation, but developers implemented it differently each time.

**Our Custom Framework**:
```markdown
# Multi-Tenant Data Framework v2.1

## Purpose
Ensure consistent data isolation across all features in our multi-tenant e-commerce platform.

## Core Principles
1. **Tenant Context Required**: All data operations must include tenant context
2. **Automatic Filtering**: Repository layer automatically filters by tenant
3. **Cross-Tenant Prevention**: System prevents accidental cross-tenant data access
4. **Audit Everything**: All tenant data access is logged

## Standard Patterns

### Tenant-Aware Entities
```csharp
public abstract class TenantEntity
{
    public TenantId TenantId { get; protected set; }
    
    protected TenantEntity(TenantId tenantId)
    {
        TenantId = tenantId ?? throw new ArgumentNullException(nameof(tenantId));
    }
}

public class Product : TenantEntity
{
    public ProductId Id { get; private set; }
    public string Name { get; private set; }
    
    public Product(TenantId tenantId, string name) : base(tenantId)
    {
        Id = ProductId.New();
        Name = name;
    }
}
```

### Tenant-Aware Repositories
```csharp
public interface ITenantRepository<T> where T : TenantEntity
{
    Task<T?> GetAsync(TenantId tenantId, object id);
    Task<IEnumerable<T>> GetAllAsync(TenantId tenantId);
    Task SaveAsync(T entity);
}

public class ProductRepository : ITenantRepository<Product>
{
    public async Task<Product?> GetAsync(TenantId tenantId, object id)
    {
        // Automatic tenant filtering
        return await _context.Products
            .Where(p => p.TenantId == tenantId && p.Id == (ProductId)id)
            .FirstOrDefaultAsync();
    }
}
```

## Implementation Requirements
- All entities must inherit from `TenantEntity`
- All repositories must implement `ITenantRepository<T>`
- All API endpoints must validate tenant context
- Cross-tenant data access must throw `TenantViolationException`
```

## What Our Custom Frameworks Gained Us

**Consistency**: New features automatically follow established patterns
**Onboarding Speed**: New developers learn our patterns from the framework documentation
**Quality**: AI generates code that follows our specific business rules
**Maintainability**: Changes to patterns happen in one place (the framework)
**Knowledge Capture**: Senior developer knowledge is preserved in framework form

## When Custom Frameworks Go Wrong

**Over-Engineering**: Creating frameworks for patterns that appear twice
**Premature Abstraction**: Building frameworks before understanding the real patterns
**Framework Sprawl**: Too many custom frameworks that conflict with each other
**Maintenance Burden**: Custom frameworks need ongoing maintenance and updates
**Team Resistance**: Forcing frameworks that don't match how the team actually works

## The Framework Lifecycle

**Version 1.0**: Extract existing patterns, document basic usage
**Version 1.x**: Refine based on real usage, add missing patterns
**Version 2.0**: Major refactoring based on lessons learned
**Deprecation**: When business changes make the framework obsolete

Our pricing framework is on version 1.2. Our multi-tenant framework is on version 2.1. Both have evolved based on real usage.

## Integration with Standard Frameworks

Custom frameworks should complement, not replace, standard frameworks:
- **TDD/BDD**: Write tests for your custom framework patterns
- **Clean Architecture**: Custom frameworks often define domain-specific abstractions
- **Security**: Custom frameworks must follow security framework patterns
- **DevOps**: Custom frameworks need deployment and monitoring patterns

## The AI Training Process

To get AI to use your custom frameworks effectively:
1. **Clear Documentation**: Write framework docs like you're training a new developer
2. **Code Examples**: Include lots of before/after examples
3. **Anti-Patterns**: Explicitly document what NOT to do
4. **Integration Points**: Show how the framework works with other frameworks
5. **Validation**: Include tests that verify framework usage

## What's Next

Wednesday we'll explore enterprise rollout strategies - how to introduce frameworks across large organizations without causing rebellion, and how to measure whether frameworks are actually helping or just adding overhead.

Friday we'll look at ROI analysis for frameworks - how to measure productivity gains, quality improvements, and the real cost of consistency.

## Your Turn

What patterns does your team repeat across multiple features? Have you tried creating custom frameworks, or do you rely on documentation and code reviews? What's your biggest challenge with capturing and sharing team-specific knowledge?

---

*Want to see examples of custom framework creation? Check out the [custom framework guide](link) or see how to extend SUIT with your own organization-specific patterns and requirements.*
