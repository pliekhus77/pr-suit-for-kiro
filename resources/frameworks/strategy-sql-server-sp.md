---
inclusion: always
category: Database
framework: SQL Server Stored Procedures
description: Best practices for designing, implementing, and maintaining SQL Server stored procedures with security and performance guidance
tags: [sql-server, stored-procedures, database, t-sql, security, performance]
---

# SQL Server Stored Procedures Strategy

## Purpose

Use stored procedures for complex business logic, performance-critical operations, and secure data access patterns. Ideal for batch processing, data validation, and operations requiring minimal network overhead with strong security controls.

## Key Concepts

- **Parameterization**: Always use parameters to prevent SQL injection
- **Transactions**: Implement ACID properties with proper isolation levels
- **Error Handling**: Use TRY-CATCH blocks for robust error management
- **Performance**: Leverage execution plan caching and set-based operations

## Best Practices

- **Use parameters**: Never concatenate user input into SQL strings
- **Implement TRY-CATCH**: Wrap all operations in error handling blocks
- **SET NOCOUNT ON**: Reduce network traffic and improve performance
- **Avoid cursors**: Use set-based operations for better performance
- **Use appropriate isolation levels**: Balance consistency and performance needs
- **Grant minimal permissions**: Apply principle of least privilege
- **Version control**: Track all stored procedure changes

## Implementation Patterns

### CRUD with Error Handling
```sql
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

### Pagination Pattern
```sql
CREATE PROCEDURE dbo.GetCustomers
    @PageNumber INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@PageNumber - 1) * @PageSize;
    
    SELECT CustomerId, FirstName, LastName, Email
    FROM dbo.Customers
    ORDER BY LastName, FirstName
    OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY;
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
            UPDATE SET FirstName = source.FirstName, LastName = source.LastName,
                      Email = source.Email, ModifiedDate = GETUTCDATE()
        WHEN NOT MATCHED THEN
            INSERT (FirstName, LastName, Email, CreatedDate)
            VALUES (source.FirstName, source.LastName, source.Email, GETUTCDATE());
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
```

### Batch Processing
```sql
CREATE PROCEDURE dbo.ProcessOrderBatch
    @OrderIds dbo.IntTableType READONLY
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRANSACTION;
    BEGIN TRY
        UPDATE o SET Status = 'Processed', ProcessedDate = GETUTCDATE()
        FROM dbo.Orders o INNER JOIN @OrderIds oi ON o.OrderId = oi.Value
        WHERE o.Status = 'Pending';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

### Transaction Management
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
        UPDATE dbo.Accounts SET Balance = Balance - @Amount 
        WHERE AccountId = @FromAccountId;
        UPDATE dbo.Accounts SET Balance = Balance + @Amount 
        WHERE AccountId = @ToAccountId;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        THROW;
    END CATCH
END
```

## When to Use

**Choose Stored Procedures When:**
- Complex business logic requires multiple database operations
- Performance is critical and network round-trips must be minimized
- Data security requires controlled access patterns
- Batch processing operations need transaction consistency

**Consider Alternatives When:**
- Simple CRUD operations that map directly to entities
- Cross-database portability is required
- Rapid prototyping with frequent schema changes

## Anti-Patterns

- **Dynamic SQL without parameters**: Creates SQL injection vulnerabilities
- **Missing error handling**: Leads to inconsistent application state
- **Using cursors for set operations**: Poor performance compared to set-based operations
- **No transaction management**: Risk of data inconsistency
- **Overly complex procedures**: Difficult to maintain and test

## Integration Points

### TDD/BDD Integration
- Use tSQLt framework for unit testing stored procedures
- Implement behavior-driven tests for complex business scenarios
- Write tests before implementing stored procedure logic

### DevOps Integration
- Version control all stored procedures with migration scripts
- Implement automated testing in CI/CD pipelines
- Use database deployment automation tools

### Security Integration
- Implement security controls at the database layer
- Use stored procedures to enforce business security rules
- Apply principle of least privilege for procedure permissions

### APM Integration
- Monitor stored procedure performance and execution times
- Implement logging and metrics collection within procedures
- Set up alerts for procedure failures and performance degradation

## Quick Reference

**File Locations:**
- Framework Guide: `frameworks/sql-server-stored-procedures.md`
- Strategy Guide: `resources/frameworks/strategy-sql-server-sp.md`

**Key Commands:**
- `CREATE PROCEDURE` - Define new stored procedure
- `ALTER PROCEDURE` - Modify existing procedure
- `EXEC` - Execute stored procedure
- `SET NOCOUNT ON` - Improve performance
- `BEGIN TRY...END TRY` - Error handling block

**Common Scenarios:**
- CRUD operations with validation
- Batch data processing
- Complex business logic execution
- Secure data access patterns
- Performance-critical operations
