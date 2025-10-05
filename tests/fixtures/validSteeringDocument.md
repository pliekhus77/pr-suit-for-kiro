# Valid Steering Document for Testing

## Purpose

This steering document serves as a test fixture for validating the steering document validation functionality. It contains all required sections with proper formatting and actionable guidance.

The purpose of this document is to guide developers in implementing features following best practices and established patterns. It provides clear, actionable guidance that can be directly applied during development.

## Key Concepts

### Concept 1: Test-Driven Development

Test-Driven Development (TDD) is a software development approach where tests are written before the implementation code. The cycle follows:

1. **Red**: Write a failing test
2. **Green**: Write minimal code to make the test pass
3. **Refactor**: Improve the code while keeping tests passing

**Example:**
```typescript
// 1. Red - Write failing test
describe('Calculator', () => {
  it('should add two numbers', () => {
    const calc = new Calculator();
    expect(calc.add(2, 3)).toBe(5);
  });
});

// 2. Green - Make it pass
class Calculator {
  add(a: number, b: number): number {
    return a + b;
  }
}

// 3. Refactor - Improve if needed
```

### Concept 2: Separation of Concerns

Separate different aspects of functionality into distinct sections. This makes code more maintainable and testable.

**Example:**
```typescript
// Bad: Mixed concerns
class UserService {
  saveUser(user: User) {
    // Validation
    if (!user.email) throw new Error('Email required');
    
    // Database logic
    db.insert('users', user);
    
    // Email logic
    emailService.send(user.email, 'Welcome!');
  }
}

// Good: Separated concerns
class UserValidator {
  validate(user: User): ValidationResult {
    if (!user.email) return { valid: false, error: 'Email required' };
    return { valid: true };
  }
}

class UserRepository {
  save(user: User): Promise<void> {
    return db.insert('users', user);
  }
}

class UserService {
  constructor(
    private validator: UserValidator,
    private repository: UserRepository,
    private emailService: EmailService
  ) {}
  
  async saveUser(user: User): Promise<void> {
    const validation = this.validator.validate(user);
    if (!validation.valid) throw new Error(validation.error);
    
    await this.repository.save(user);
    await this.emailService.send(user.email, 'Welcome!');
  }
}
```

### Concept 3: Dependency Injection

Use dependency injection to make code more testable and flexible. Dependencies should be passed in rather than created internally.

**Example:**
```typescript
// Bad: Hard-coded dependency
class OrderService {
  private paymentProcessor = new PaymentProcessor();
  
  processOrder(order: Order) {
    this.paymentProcessor.charge(order.total);
  }
}

// Good: Injected dependency
class OrderService {
  constructor(private paymentProcessor: PaymentProcessor) {}
  
  processOrder(order: Order) {
    this.paymentProcessor.charge(order.total);
  }
}

// Easy to test with mock
const mockProcessor = { charge: jest.fn() };
const service = new OrderService(mockProcessor);
```

## Best Practices

### 1. Write Tests First

Always write tests before implementation code. This ensures:
- Clear requirements understanding
- Testable design
- Confidence in changes
- Living documentation

### 2. Keep Functions Small

Functions should do one thing and do it well. Aim for:
- Single responsibility
- Less than 20 lines
- Clear, descriptive names
- No side effects

### 3. Use Meaningful Names

Names should reveal intent:
- Variables: `userEmail` not `ue`
- Functions: `calculateTotalPrice()` not `calc()`
- Classes: `UserRepository` not `UR`
- Constants: `MAX_RETRY_ATTEMPTS` not `MAX`

### 4. Handle Errors Gracefully

Always handle potential errors:
- Use try-catch for async operations
- Provide meaningful error messages
- Log errors with context
- Don't swallow exceptions

**Example:**
```typescript
async function loadUser(id: string): Promise<User> {
  try {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error(`User not found: ${id}`);
    }
    return user;
  } catch (error) {
    logger.error('Failed to load user', { id, error });
    throw new Error(`Failed to load user ${id}: ${error.message}`);
  }
}
```

### 5. Document Complex Logic

Add comments for complex algorithms or business rules:
```typescript
// Calculate discount based on customer tier and order value
// Tier 1: 5% for orders > $100
// Tier 2: 10% for orders > $100, 15% for orders > $500
// Tier 3: 15% for orders > $100, 20% for orders > $500, 25% for orders > $1000
function calculateDiscount(tier: number, orderValue: number): number {
  // Implementation...
}
```

## Anti-Patterns

### 1. God Objects

**Problem**: Classes that do too much and know too much.

**Example:**
```typescript
// Bad: God object
class Application {
  validateUser() { }
  saveUser() { }
  sendEmail() { }
  processPayment() { }
  generateReport() { }
  // ... 50 more methods
}
```

**Solution**: Split into focused classes with single responsibilities.

### 2. Magic Numbers

**Problem**: Unexplained numeric literals in code.

**Example:**
```typescript
// Bad: Magic number
if (user.age > 18) { }

// Good: Named constant
const MINIMUM_AGE = 18;
if (user.age > MINIMUM_AGE) { }
```

### 3. Callback Hell

**Problem**: Deeply nested callbacks that are hard to read.

**Example:**
```typescript
// Bad: Callback hell
getData(function(a) {
  getMoreData(a, function(b) {
    getMoreData(b, function(c) {
      getMoreData(c, function(d) {
        // Do something
      });
    });
  });
});

// Good: Async/await
const a = await getData();
const b = await getMoreData(a);
const c = await getMoreData(b);
const d = await getMoreData(c);
```

### 4. Premature Optimization

**Problem**: Optimizing before measuring performance.

**Solution**: 
1. Make it work
2. Make it right
3. Make it fast (only if needed)

### 5. Not Using Version Control

**Problem**: Making changes without committing to version control.

**Solution**: Commit frequently with meaningful messages.

## Summary

This steering document provides guidance on software development best practices:

1. **Test-Driven Development**: Write tests first, then implementation
2. **Separation of Concerns**: Keep different aspects of functionality separate
3. **Dependency Injection**: Pass dependencies rather than creating them
4. **Small Functions**: Keep functions focused and small
5. **Meaningful Names**: Use descriptive names that reveal intent
6. **Error Handling**: Handle errors gracefully with meaningful messages
7. **Avoid Anti-Patterns**: Watch out for god objects, magic numbers, callback hell

Following these practices will result in more maintainable, testable, and reliable code.

## Additional Resources

- [Clean Code by Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [Test Driven Development by Kent Beck](https://www.amazon.com/Test-Driven-Development-Kent-Beck/dp/0321146530)
- [Refactoring by Martin Fowler](https://www.amazon.com/Refactoring-Improving-Design-Existing-Code/dp/0201485672)

