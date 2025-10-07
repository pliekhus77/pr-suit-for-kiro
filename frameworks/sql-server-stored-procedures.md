# SQL Server Stored Procedures Framework

## Overview

This framework provides comprehensive guidance for designing, implementing, and maintaining SQL Server stored procedures with emphasis on security, performance, and maintainability. Use this framework when building database-centric applications that require complex business logic, data validation, or performance-critical operations at the database layer.

**When to Use Stored Procedures:**
- Complex business logic that benefits from database-level execution
- Performance-critical operations requiring minimal network overhead
- Data validation and integrity enforcement
- Batch processing and data transformation operations
- Security-sensitive operations requiring controlled data access

**Scope:**
- T-SQL stored procedure development patterns
- Security and performance best practices
- Error handling and transaction management
- Testing strategies and deployment patterns
- Integration with application layers

## Key Concepts

### Stored Procedure Fundamentals
- **Stored Procedure**: Precompiled T-SQL code stored in the database
- **Parameters**: Input/output variables for data exchange
- **Return Values**: Integer status codes returned by procedures
- **Result Sets**: Tabular data returned to calling applications

### Parameter Types
- **Input Parameters**: Data passed to the procedure
- **Output Parameters**: Data returned from the procedure
- **Table-Valued Parameters**: Complex data structures passed as parameters
- **Default Parameters**: Parameters with predefined default values

### Execution Context
- **Execution Plan**: Cached query execution strategy
- **Parameter Sniffing**: Query optimizer using first parameter values for plan generation
- **Plan Reuse**: Leveraging cached execution plans for performance

### Transaction Scope
- **ACID Properties**: Atomicity, Consistency, Isolation, Durability
- **Isolation Levels**: Control over concurrent transaction behavior
- **Nested Transactions**: Transactions within transactions

## Best Practices

### Security Practices
1. **Always use parameterized queries** to prevent SQL injection
2. **Grant minimal permissions** using principle of least privilege
3. **Validate input parameters** before processing
4. **Use schema-qualified object names** to avoid ambiguity
5. **Implement row-level security** for multi-tenant scenarios

### Performance Practices
1. **Use SET NOCOUNT ON** to reduce network traffic
2. **Avoid cursors** - use set-based operations instead
3. **Implement proper indexing** for query optimization
4. **Use appropriate isolation levels** to balance consistency and performance
5. **Monitor execution plans** and optimize accordingly

### Code Quality Practices
1. **Implement comprehensive error handling** with TRY-CATCH blocks
2. **Use consistent naming conventions** for procedures and parameters
3. **Document complex business logic** with inline comments
4. **Keep procedures focused** on single responsibilities
5. **Version control** all stored procedure changes

## Implementation Patterns

### CRUD Operations Pattern

```sql
-- Create Operation
CREATE PROCEDURE dbo.CreateCustomer
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @Email NVARCHAR(100),
    @CustomerId INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        INSERT INTO dbo.Customers (FirstName, LastName, Email, CreatedDate)
        VALUES (@FirstName, @LastName, @Email, GETUTCDATE());
        
        SET @CustomerId = SCOPE_IDENTITY();
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
```

```sql
-- Read Operation with Pagination
CREATE PROCEDURE dbo.GetCustomers
    @PageNumber INT = 1,
    @PageSize INT = 20,
    @SearchTerm NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT 
        CustomerId,
        FirstName,
        LastName,
        Email,
        CreatedDate
    FROM dbo.Customers
    WHERE (@SearchTerm IS NULL OR 
           FirstName LIKE '%' + @SearchTerm + '%' OR 
           LastName LIKE '%' + @SearchTerm + '%')
    ORDER BY LastName, FirstName
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
```

### Batch Processing Pattern

```sql
CREATE PROCEDURE dbo.ProcessOrderBatch
    @OrderIds dbo.IntTableType READONLY,
    @ProcessedCount INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET @ProcessedCount = 0;
    
    BEGIN TRANSACTION;
    BEGIN TRY
        UPDATE o
        SET Status = 'Processed',
            ProcessedDate = GETUTCDATE()
        FROM dbo.Orders o
        INNER JOIN @OrderIds oi ON o.OrderId = oi.Value
        WHERE o.Status = 'Pending';
        
        SET @ProcessedCount = @@ROWCOUNT;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

### Audit Logging Pattern

```sql
CREATE PROCEDURE dbo.UpdateCustomerWithAudit
    @CustomerId INT,
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @Email NVARCHAR(100),
    @UserId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Capture original values
        DECLARE @OriginalData NVARCHAR(MAX);
        SELECT @OriginalData = (
            SELECT FirstName, LastName, Email
            FROM dbo.Customers 
            WHERE CustomerId = @CustomerId
            FOR JSON AUTO
        );
        
        -- Update customer
        UPDATE dbo.Customers
        SET FirstName = @FirstName,
            LastName = @LastName,
            Email = @Email,
            ModifiedDate = GETUTCDATE()
        WHERE CustomerId = @CustomerId;
        
        -- Log audit trail
        INSERT INTO dbo.AuditLog (TableName, RecordId, Action, OriginalData, NewData, UserId, AuditDate)
        VALUES ('Customers', @CustomerId, 'UPDATE', @OriginalData, 
                (SELECT @FirstName AS FirstName, @LastName AS LastName, @Email AS Email FOR JSON AUTO),
                @UserId, GETUTCDATE());
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

### Soft Delete Pattern

```sql
CREATE PROCEDURE dbo.SoftDeleteCustomer
    @CustomerId INT,
    @DeletedBy INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        UPDATE dbo.Customers
        SET IsDeleted = 1,
            DeletedDate = GETUTCDATE(),
            DeletedBy = @DeletedBy
        WHERE CustomerId = @CustomerId
          AND IsDeleted = 0;
        
        IF @@ROWCOUNT = 0
            THROW 50001, 'Customer not found or already deleted', 1;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
```

### Upsert Pattern

```sql
CREATE PROCEDURE dbo.UpsertCustomer
    @CustomerId INT = NULL,
    @FirstName NVARCHAR(50),
    @LastName NVARCHAR(50),
    @Email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        MERGE dbo.Customers AS target
        USING (SELECT @CustomerId AS CustomerId, @FirstName AS FirstName, 
                      @LastName AS LastName, @Email AS Email) AS source
        ON target.CustomerId = source.CustomerId
        WHEN MATCHED THEN
            UPDATE SET FirstName = source.FirstName,
                      LastName = source.LastName,
                      Email = source.Email,
                      ModifiedDate = GETUTCDATE()
        WHEN NOT MATCHED THEN
            INSERT (FirstName, LastName, Email, CreatedDate)
            VALUES (source.FirstName, source.LastName, source.Email, GETUTCDATE());
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
```

## Security Considerations

### SQL Injection Prevention

```sql
-- SECURE: Parameterized query
CREATE PROCEDURE dbo.GetCustomerByEmail
    @Email NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT CustomerId, FirstName, LastName, Email
    FROM dbo.Customers
    WHERE Email = @Email;
END

-- INSECURE: Dynamic SQL without parameters (DO NOT USE)
-- CREATE PROCEDURE dbo.GetCustomerByEmailInsecure
--     @Email NVARCHAR(100)
-- AS
-- BEGIN
--     DECLARE @SQL NVARCHAR(MAX) = 'SELECT * FROM Customers WHERE Email = ''' + @Email + '''';
--     EXEC sp_executesql @SQL;
-- END
```

### Permission Management

```sql
-- Grant minimal permissions
GRANT EXECUTE ON dbo.GetCustomers TO [ApplicationRole];
GRANT EXECUTE ON dbo.CreateCustomer TO [ApplicationRole];

-- Deny direct table access
DENY SELECT, INSERT, UPDATE, DELETE ON dbo.Customers TO [ApplicationRole];
```

### Row-Level Security

```sql
-- Create security policy
CREATE FUNCTION dbo.CustomerSecurityPredicate(@TenantId INT)
RETURNS TABLE
WITH SCHEMABINDING
AS
RETURN SELECT 1 AS AccessResult
WHERE @TenantId = CAST(SESSION_CONTEXT(N'TenantId') AS INT);

CREATE SECURITY POLICY dbo.CustomerSecurityPolicy
ADD FILTER PREDICATE dbo.CustomerSecurityPredicate(TenantId) ON dbo.Customers;
```

## Performance Optimization

### Indexing Strategy

```sql
-- Create supporting indexes
CREATE NONCLUSTERED INDEX IX_Customers_Email 
ON dbo.Customers (Email) 
INCLUDE (FirstName, LastName);

CREATE NONCLUSTERED INDEX IX_Customers_Name 
ON dbo.Customers (LastName, FirstName)
WHERE IsDeleted = 0;
```

### Parameter Sniffing Mitigation

```sql
CREATE PROCEDURE dbo.GetCustomersOptimized
    @SearchTerm NVARCHAR(100) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Use local variables to avoid parameter sniffing
    DECLARE @LocalSearchTerm NVARCHAR(100) = @SearchTerm;
    
    SELECT CustomerId, FirstName, LastName, Email
    FROM dbo.Customers
    WHERE (@LocalSearchTerm IS NULL OR 
           FirstName LIKE '%' + @LocalSearchTerm + '%' OR 
           LastName LIKE '%' + @LocalSearchTerm + '%')
    ORDER BY LastName, FirstName;
END
```

### Execution Plan Optimization

```sql
-- Use OPTION hints when necessary
CREATE PROCEDURE dbo.GetCustomersWithHint
    @Status NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT CustomerId, FirstName, LastName, Status
    FROM dbo.Customers
    WHERE Status = @Status
    OPTION (OPTIMIZE FOR (@Status = 'Active'));
END
```

## Testing Strategies

### tSQLt Framework Setup

```sql
-- Install tSQLt framework
EXEC tSQLt.NewTestClass 'CustomerTests';

-- Create test for CreateCustomer procedure
CREATE PROCEDURE CustomerTests.[test CreateCustomer should insert new customer]
AS
BEGIN
    -- Arrange
    DECLARE @FirstName NVARCHAR(50) = 'John';
    DECLARE @LastName NVARCHAR(50) = 'Doe';
    DECLARE @Email NVARCHAR(100) = 'john.doe@example.com';
    DECLARE @CustomerId INT;
    
    -- Act
    EXEC dbo.CreateCustomer @FirstName, @LastName, @Email, @CustomerId OUTPUT;
    
    -- Assert
    DECLARE @ActualCount INT;
    SELECT @ActualCount = COUNT(*)
    FROM dbo.Customers
    WHERE CustomerId = @CustomerId
      AND FirstName = @FirstName
      AND LastName = @LastName
      AND Email = @Email;
    
    EXEC tSQLt.AssertEquals 1, @ActualCount;
END
```

### Test Data Management

```sql
-- Create test data setup procedure
CREATE PROCEDURE CustomerTests.SetUp
AS
BEGIN
    -- Clean up test data
    DELETE FROM dbo.Customers WHERE Email LIKE '%@test.com';
    
    -- Insert test data
    INSERT INTO dbo.Customers (FirstName, LastName, Email, CreatedDate)
    VALUES ('Test', 'User', 'test.user@test.com', GETUTCDATE());
END
```

### Integration Testing

```sql
-- Test procedure with dependencies
CREATE PROCEDURE CustomerTests.[test UpdateCustomerWithAudit should log changes]
AS
BEGIN
    -- Arrange
    DECLARE @CustomerId INT = 1;
    DECLARE @UserId INT = 100;
    
    -- Act
    EXEC dbo.UpdateCustomerWithAudit @CustomerId, 'Updated', 'Name', 'updated@test.com', @UserId;
    
    -- Assert
    DECLARE @AuditCount INT;
    SELECT @AuditCount = COUNT(*)
    FROM dbo.AuditLog
    WHERE TableName = 'Customers' AND RecordId = @CustomerId AND UserId = @UserId;
    
    EXEC tSQLt.AssertEquals 1, @AuditCount;
END
```

## Error Handling

### TRY-CATCH Implementation

```sql
CREATE PROCEDURE dbo.ProcessOrderWithErrorHandling
    @OrderId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- Business logic here
        UPDATE dbo.Orders SET Status = 'Processing' WHERE OrderId = @OrderId;
        
        -- Simulate potential error
        IF NOT EXISTS (SELECT 1 FROM dbo.Orders WHERE OrderId = @OrderId)
            THROW 50001, 'Order not found', 1;
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        
        -- Log error details
        DECLARE @ErrorMessage NVARCHAR(4000) = ERROR_MESSAGE();
        DECLARE @ErrorSeverity INT = ERROR_SEVERITY();
        DECLARE @ErrorState INT = ERROR_STATE();
        
        INSERT INTO dbo.ErrorLog (ProcedureName, ErrorMessage, ErrorSeverity, ErrorState, ErrorDate)
        VALUES ('ProcessOrderWithErrorHandling', @ErrorMessage, @ErrorSeverity, @ErrorState, GETUTCDATE());
        
        -- Re-throw the error
        THROW;
    END CATCH
END
```

### Custom Error Messages

```sql
-- Add custom error messages
EXEC sp_addmessage 
    @msgnum = 50001, 
    @severity = 16, 
    @msgtext = 'Customer with ID %d not found',
    @lang = 'us_english';

-- Use custom error in procedure
CREATE PROCEDURE dbo.GetCustomerById
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE CustomerId = @CustomerId)
        RAISERROR(50001, 16, 1, @CustomerId);
    
    SELECT CustomerId, FirstName, LastName, Email
    FROM dbo.Customers
    WHERE CustomerId = @CustomerId;
END
```

## Transaction Management

### ACID Properties Implementation

```sql
CREATE PROCEDURE dbo.TransferFunds
    @FromAccountId INT,
    @ToAccountId INT,
    @Amount DECIMAL(18,2)
AS
BEGIN
    SET NOCOUNT ON;
    SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;
    
    BEGIN TRANSACTION;
    BEGIN TRY
        -- Check sufficient funds
        DECLARE @FromBalance DECIMAL(18,2);
        SELECT @FromBalance = Balance 
        FROM dbo.Accounts 
        WHERE AccountId = @FromAccountId;
        
        IF @FromBalance < @Amount
            THROW 50002, 'Insufficient funds', 1;
        
        -- Perform transfer
        UPDATE dbo.Accounts 
        SET Balance = Balance - @Amount 
        WHERE AccountId = @FromAccountId;
        
        UPDATE dbo.Accounts 
        SET Balance = Balance + @Amount 
        WHERE AccountId = @ToAccountId;
        
        -- Log transaction
        INSERT INTO dbo.TransactionLog (FromAccountId, ToAccountId, Amount, TransactionDate)
        VALUES (@FromAccountId, @ToAccountId, @Amount, GETUTCDATE());
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

### Deadlock Handling

```sql
CREATE PROCEDURE dbo.UpdateAccountWithRetry
    @AccountId INT,
    @NewBalance DECIMAL(18,2),
    @MaxRetries INT = 3
AS
BEGIN
    SET NOCOUNT ON;
    
    DECLARE @RetryCount INT = 0;
    DECLARE @Success BIT = 0;
    
    WHILE @RetryCount < @MaxRetries AND @Success = 0
    BEGIN
        BEGIN TRY
            BEGIN TRANSACTION;
            
            UPDATE dbo.Accounts 
            SET Balance = @NewBalance 
            WHERE AccountId = @AccountId;
            
            COMMIT TRANSACTION;
            SET @Success = 1;
        END TRY
        BEGIN CATCH
            IF @@TRANCOUNT > 0
                ROLLBACK TRANSACTION;
            
            IF ERROR_NUMBER() = 1205 -- Deadlock
            BEGIN
                SET @RetryCount = @RetryCount + 1;
                WAITFOR DELAY '00:00:01'; -- Wait 1 second before retry
            END
            ELSE
                THROW; -- Re-throw non-deadlock errors
        END CATCH
    END
    
    IF @Success = 0
        THROW 50003, 'Operation failed after maximum retries', 1;
END
```

## Parameter Handling

### Table-Valued Parameters

```sql
-- Create user-defined table type
CREATE TYPE dbo.CustomerTableType AS TABLE
(
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(100)
);

-- Use table-valued parameter
CREATE PROCEDURE dbo.BulkInsertCustomers
    @Customers dbo.CustomerTableType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    
    INSERT INTO dbo.Customers (FirstName, LastName, Email, CreatedDate)
    SELECT FirstName, LastName, Email, GETUTCDATE()
    FROM @Customers;
    
    SELECT @@ROWCOUNT AS InsertedCount;
END
```

### Output Parameters

```sql
CREATE PROCEDURE dbo.GetCustomerStats
    @TotalCustomers INT OUTPUT,
    @ActiveCustomers INT OUTPUT,
    @NewCustomersToday INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT @TotalCustomers = COUNT(*)
    FROM dbo.Customers
    WHERE IsDeleted = 0;
    
    SELECT @ActiveCustomers = COUNT(*)
    FROM dbo.Customers
    WHERE IsDeleted = 0 AND Status = 'Active';
    
    SELECT @NewCustomersToday = COUNT(*)
    FROM dbo.Customers
    WHERE CAST(CreatedDate AS DATE) = CAST(GETUTCDATE() AS DATE);
END
```

## Result Set Patterns

### Multiple Result Sets

```sql
CREATE PROCEDURE dbo.GetCustomerDetails
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    -- First result set: Customer information
    SELECT CustomerId, FirstName, LastName, Email, Status
    FROM dbo.Customers
    WHERE CustomerId = @CustomerId;
    
    -- Second result set: Customer orders
    SELECT OrderId, OrderDate, TotalAmount, Status
    FROM dbo.Orders
    WHERE CustomerId = @CustomerId
    ORDER BY OrderDate DESC;
    
    -- Third result set: Customer addresses
    SELECT AddressId, AddressType, Street, City, State, ZipCode
    FROM dbo.CustomerAddresses
    WHERE CustomerId = @CustomerId;
END
```

### Return Values

```sql
CREATE PROCEDURE dbo.ValidateCustomer
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    IF NOT EXISTS (SELECT 1 FROM dbo.Customers WHERE CustomerId = @CustomerId)
        RETURN 1; -- Customer not found
    
    IF EXISTS (SELECT 1 FROM dbo.Customers WHERE CustomerId = @CustomerId AND Status = 'Inactive')
        RETURN 2; -- Customer inactive
    
    RETURN 0; -- Success
END
```

## When to Use vs. Alternatives

### Decision Framework

**Use Stored Procedures When:**
- Complex business logic requires multiple database operations
- Performance is critical and network round-trips must be minimized
- Data security requires controlled access patterns
- Batch processing operations need transaction consistency
- Database-specific features (like SQL Server's advanced T-SQL) provide significant value

**Consider Alternatives When:**
- Simple CRUD operations that map directly to entities
- Application logic is primarily business rule validation
- Cross-database portability is required
- Development team lacks T-SQL expertise
- Rapid prototyping and frequent schema changes are needed

### ORM vs. Stored Procedures

```sql
-- Stored Procedure Approach
CREATE PROCEDURE dbo.GetCustomerOrderSummary
    @CustomerId INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        c.FirstName + ' ' + c.LastName AS CustomerName,
        COUNT(o.OrderId) AS TotalOrders,
        SUM(o.TotalAmount) AS TotalSpent,
        MAX(o.OrderDate) AS LastOrderDate
    FROM dbo.Customers c
    LEFT JOIN dbo.Orders o ON c.CustomerId = o.CustomerId
    WHERE c.CustomerId = @CustomerId
    GROUP BY c.FirstName, c.LastName;
END
```

```csharp
// ORM Approach (Entity Framework example)
public class CustomerService
{
    public CustomerOrderSummary GetCustomerOrderSummary(int customerId)
    {
        return context.Customers
            .Where(c => c.CustomerId == customerId)
            .Select(c => new CustomerOrderSummary
            {
                CustomerName = c.FirstName + " " + c.LastName,
                TotalOrders = c.Orders.Count(),
                TotalSpent = c.Orders.Sum(o => o.TotalAmount),
                LastOrderDate = c.Orders.Max(o => o.OrderDate)
            })
            .FirstOrDefault();
    }
}
```

## Framework Integration

### TDD/BDD Integration
- Write unit tests for stored procedures using tSQLt framework
- Implement behavior-driven tests for complex business scenarios
- Use test-driven development for stored procedure creation
- Reference: [TDD/BDD Testing Strategy](strategy-tdd-bdd.md)

### SABSA Security Integration
- Implement security controls at the database layer
- Use stored procedures to enforce business security rules
- Apply principle of least privilege for procedure permissions
- Reference: [SABSA Security Strategy](strategy-security.md)

### DevOps Integration
- Version control stored procedures with database migration scripts
- Implement automated testing in CI/CD pipelines
- Use database deployment automation tools
- Reference: [DevOps CI/CD Strategy](strategy-devops.md)

### APM Integration
- Monitor stored procedure performance and execution times
- Implement logging and metrics collection within procedures
- Set up alerts for procedure failures and performance degradation
- Reference: [APM Strategy](strategy-apm.md)

## Summary

This SQL Server Stored Procedures framework provides comprehensive guidance for building secure, performant, and maintainable database solutions. Key takeaways:

1. **Security First**: Always use parameterized queries and implement proper permission management
2. **Performance Matters**: Optimize with proper indexing, avoid cursors, and monitor execution plans
3. **Error Handling**: Implement comprehensive TRY-CATCH blocks and transaction management
4. **Testing**: Use tSQLt framework for unit testing and maintain test data management
5. **Integration**: Align with TDD/BDD, Security, DevOps, and APM frameworks for holistic development

Follow these patterns and practices to build robust stored procedure solutions that integrate seamlessly with modern application architectures while maintaining the performance and security benefits of database-centric processing.
