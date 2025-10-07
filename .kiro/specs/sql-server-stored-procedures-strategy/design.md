# Design Document: SQL Server Stored Procedures Strategy

## Overview

This feature adds comprehensive SQL Server Stored Procedures documentation to the Pragmatic Rhino SUIT framework collection. The implementation consists of two primary deliverables:

1. **Detailed Framework Reference** (`frameworks/sql-server-stored-procedures.md`) - A comprehensive guide covering best practices, patterns, security, performance, and testing strategies for stored procedures
2. **Compact Strategy Guide** (`resources/frameworks/strategy-sql-server-sp.md`) - A concise, actionable reference optimized for quick lookup within the VS Code extension

Both documents will be integrated into the existing framework ecosystem through updates to inventory and manifest files, making them discoverable through both the repository structure and the VS Code extension.

### Design Rationale

The dual-document approach serves different user needs:
- **Framework document**: Deep reference for learning and comprehensive understanding
- **Strategy guide**: Quick reference during active development, following the established pattern of other strategy files (DDD, JMeter, APM)

This design aligns with the existing framework structure and maintains consistency with other framework documentation in the repository.

## Architecture

### Document Structure

```
Repository Structure:
├── frameworks/
│   ├── INVENTORY.md (updated)
│   └── sql-server-stored-procedures.md (new)
└── resources/
    └── frameworks/
        ├── manifest.json (updated)
        └── strategy-sql-server-sp.md (new)
```

### Content Organization

#### Framework Document (`frameworks/sql-server-stored-procedures.md`)

**Sections:**
1. **Overview** - Purpose, scope, and when to use stored procedures
2. **Key Concepts** - Fundamental stored procedure concepts and terminology
3. **Best Practices** - Industry-standard practices for stored procedure development
4. **Implementation Patterns** - Common patterns with code examples
5. **Security Considerations** - SQL injection prevention, permissions, encryption
6. **Performance Optimization** - Indexing, execution plans, parameter sniffing
7. **Testing Strategies** - Unit testing, integration testing, test data management
8. **Error Handling** - TRY-CATCH blocks, RAISERROR, transaction rollback
9. **Transaction Management** - ACID properties, isolation levels, deadlock handling
10. **Parameter Handling** - Input/output parameters, table-valued parameters
11. **Result Set Patterns** - Single/multiple result sets, OUTPUT parameters
12. **When to Use vs. Alternatives** - Decision framework for stored procedures vs. ORM, dynamic SQL

#### Strategy Guide (`resources/frameworks/strategy-sql-server-sp.md`)

**Sections (following established strategy format):**
1. **Purpose** - Quick overview of when and why to use stored procedures
2. **Key Concepts** - Essential concepts in compact format
3. **Best Practices** - Actionable guidelines with brief explanations
4. **Implementation Patterns** - Code snippets demonstrating common patterns
5. **When to Use** - Decision criteria for stored procedures
6. **Anti-Patterns** - Common mistakes to avoid
7. **Integration Points** - How this relates to other frameworks (TDD/BDD, DevOps, Security)
8. **Quick Reference** - File locations, key commands, common scenarios

**Front Matter:**
```yaml
---
inclusion: always
category: Database
framework: SQL Server Stored Procedures
description: Best practices for designing, implementing, and maintaining SQL Server stored procedures
tags: [database, sql-server, stored-procedures, performance, security]
---
```

## Components and Interfaces

### Framework Document Component

**Purpose:** Comprehensive reference documentation for stored procedure development

**Key Topics:**

1. **Stored Procedure Fundamentals**
   - Definition and purpose
   - Compilation and execution plans
   - Scope and lifetime
   - Comparison with functions, views, and dynamic SQL

2. **Design Patterns**
   - CRUD operations pattern
   - Batch processing pattern
   - Pagination pattern
   - Audit logging pattern
   - Soft delete pattern
   - Upsert (MERGE) pattern

3. **Security Best Practices**
   - Parameterized queries (SQL injection prevention)
   - Principle of least privilege
   - EXECUTE AS clause
   - Encryption (TDE, Always Encrypted)
   - Row-level security integration
   - Dynamic data masking

4. **Performance Optimization**
   - Index usage and recommendations
   - Execution plan analysis
   - Parameter sniffing mitigation (OPTIMIZE FOR, RECOMPILE)
   - SET NOCOUNT ON
   - Avoiding cursors and loops
   - Batch operations
   - Temp tables vs. table variables vs. CTEs

5. **Error Handling Patterns**
   ```sql
   BEGIN TRY
       -- Business logic
   END TRY
   BEGIN CATCH
       -- Error handling
       THROW;
   END CATCH
   ```

6. **Transaction Management**
   - BEGIN TRANSACTION, COMMIT, ROLLBACK
   - Isolation levels (READ COMMITTED, SNAPSHOT, etc.)
   - Deadlock prevention strategies
   - Nested transactions and savepoints

7. **Testing Approaches**
   - tSQLt framework for unit testing
   - Test data setup and teardown
   - Mocking dependencies
   - Integration testing strategies
   - Performance testing with SET STATISTICS

### Strategy Guide Component

**Purpose:** Quick reference for developers actively writing stored procedures

**Structure:** Follows the established pattern from `strategy-ddd.md` and `strategy-jmeter.md`

**Key Features:**
- Concise explanations (1-3 sentences per concept)
- Code snippets demonstrating patterns
- Decision tables for when to use specific approaches
- Quick reference tables for common scenarios
- Integration guidance with other frameworks

**Example Content Structure:**
```markdown
## Best Practices

### Parameterization
Always use parameters to prevent SQL injection and enable plan reuse.

```sql
CREATE PROCEDURE GetUserById
    @UserId INT
AS
BEGIN
    SELECT * FROM Users WHERE UserId = @UserId;
END
```

### Error Handling
Implement TRY-CATCH blocks for robust error management.

```sql
BEGIN TRY
    BEGIN TRANSACTION;
    -- Operations
    COMMIT TRANSACTION;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION;
    THROW;
END CATCH
```
```

### Inventory Update Component

**File:** `frameworks/INVENTORY.md`

**Changes:**
- Add entry under "Databases & Data Storage" section
- Follow existing format: `- **SQL Server Stored Procedures** - Best practices and patterns for stored procedure development`
- Maintain alphabetical ordering within the section

**Location in File:** After "SQL Server" entry, before any subsequent database entries

### Manifest Update Component

**File:** `resources/frameworks/manifest.json`

**New Entry Structure:**
```json
{
  "id": "sql-server-sp-strategy",
  "name": "SQL Server Stored Procedures Strategy",
  "description": "Best practices for designing, implementing, and maintaining SQL Server stored procedures with security and performance guidance",
  "category": "database",
  "version": "1.0.0",
  "fileName": "strategy-sql-server-sp.md",
  "dependencies": []
}
```

**Placement:** Add to the `frameworks` array, maintaining logical grouping with other database-related strategies

## Data Models

### Framework Metadata

```typescript
interface FrameworkDocument {
  title: string;
  category: 'database';
  filePath: string;
  sections: Section[];
  codeExamples: CodeExample[];
  relatedFrameworks: string[];
}

interface Section {
  heading: string;
  level: number; // 1-6 for h1-h6
  content: string;
  subsections: Section[];
}

interface CodeExample {
  language: 'sql' | 'csharp' | 'typescript';
  code: string;
  description: string;
  category: 'pattern' | 'anti-pattern' | 'best-practice';
}
```

### Strategy Guide Metadata

```typescript
interface StrategyGuide {
  id: string;
  name: string;
  description: string;
  category: string;
  version: string;
  fileName: string;
  dependencies: string[];
  frontMatter: {
    inclusion: 'always' | 'manual' | 'fileMatch';
    category: string;
    framework: string;
    description: string;
    tags: string[];
  };
}
```

## Error Handling

### Documentation Validation

**Validation Rules:**
1. All code examples must be syntactically valid SQL
2. Cross-references between documents must be accurate
3. Markdown formatting must be consistent
4. Links to external resources must be valid

**Error Prevention:**
- Use SQL syntax highlighting in code blocks
- Test all code examples before inclusion
- Validate markdown structure with linting tools
- Verify manifest JSON schema compliance

### Content Quality Checks

**Framework Document:**
- Minimum 8 sections as specified in requirements
- At least 3 code examples per major section
- Cross-references to related frameworks (TDD/BDD, Security, DevOps)
- External references to Microsoft documentation

**Strategy Guide:**
- Follows established format from existing strategy files
- Front matter includes all required fields
- Code examples are concise (< 20 lines)
- Quick reference section includes file paths

## Testing Strategy

### Documentation Testing

**Manual Review:**
1. Technical accuracy review by database expert
2. Code example validation (run all SQL snippets)
3. Consistency check with existing framework documents
4. Readability and clarity assessment

**Automated Checks:**
1. Markdown linting (markdownlint)
2. Link validation (check for broken links)
3. JSON schema validation for manifest.json
4. Spell checking

### Integration Testing

**Inventory Update:**
- Verify entry appears in correct section
- Confirm alphabetical ordering maintained
- Check formatting consistency

**Manifest Update:**
- Validate JSON syntax
- Verify schema compliance
- Confirm unique ID assignment
- Test extension can load the strategy guide

### User Acceptance Criteria

**Framework Document:**
- [ ] Covers all 12 specified sections
- [ ] Includes minimum 20 code examples
- [ ] Addresses transaction management comprehensively
- [ ] Provides guidance on when to use stored procedures vs. alternatives
- [ ] Includes security best practices with examples

**Strategy Guide:**
- [ ] Follows format of existing strategy files
- [ ] Includes front matter with all required fields
- [ ] Provides concise, actionable guidance
- [ ] Contains quick reference section
- [ ] Integrates with other framework strategies

**Integration:**
- [ ] Inventory updated with correct entry
- [ ] Manifest includes valid JSON entry
- [ ] VS Code extension can discover and load strategy guide
- [ ] Cross-references between documents work correctly

## Performance Optimization

### Document Size Considerations

**Framework Document:**
- Target size: 15-25 KB (similar to other framework docs)
- Balance between comprehensiveness and readability
- Use collapsible sections if needed for long code examples

**Strategy Guide:**
- Target size: 8-12 KB (optimized for quick loading)
- Concise code examples (< 20 lines each)
- Minimal prose, maximum actionable content

### Extension Performance

**Loading Strategy:**
- Strategy guide loaded on-demand (not at extension activation)
- Cached after first load
- Minimal impact on extension startup time

**Search Optimization:**
- Use clear, searchable headings
- Include relevant keywords in descriptions
- Tag appropriately for framework search functionality

## Security Considerations

### Content Security

**Code Examples:**
- All examples demonstrate secure practices
- Explicitly show parameterized queries
- Highlight SQL injection prevention
- Demonstrate proper error handling without exposing sensitive information

**Sensitive Information:**
- No real connection strings or credentials
- Use placeholder values (e.g., `[ServerName]`, `[DatabaseName]`)
- Avoid examples that could be misused for malicious purposes

### Documentation Access

**Repository Level:**
- Public documentation (no sensitive information)
- Standard GitHub access controls
- Version controlled for audit trail

**Extension Level:**
- Strategy guide accessible to all extension users
- No authentication required for framework documentation
- Follows VS Code extension security best practices

## Implementation Patterns

### Code Example Standards

**SQL Formatting:**
```sql
-- Standard format for all examples
CREATE PROCEDURE ProcedureName
    @Parameter1 DataType,
    @Parameter2 DataType OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        -- Business logic here
        
    END TRY
    BEGIN CATCH
        -- Error handling
        THROW;
    END CATCH
END
GO
```

**Naming Conventions:**
- Procedures: PascalCase (e.g., `GetUserById`, `UpdateOrderStatus`)
- Parameters: PascalCase with @ prefix (e.g., `@UserId`, `@OrderDate`)
- Variables: PascalCase with @ prefix (e.g., `@TotalAmount`, `@ErrorMessage`)

### Pattern Categories

1. **CRUD Patterns**
   - Create (INSERT)
   - Read (SELECT with various filters)
   - Update (UPDATE with optimistic concurrency)
   - Delete (soft delete vs. hard delete)

2. **Data Modification Patterns**
   - Upsert (MERGE statement)
   - Bulk operations (table-valued parameters)
   - Batch processing (cursor alternatives)

3. **Query Patterns**
   - Pagination (OFFSET-FETCH)
   - Search (full-text search, LIKE optimization)
   - Aggregation (GROUP BY, window functions)

4. **Transaction Patterns**
   - Simple transaction
   - Nested transaction with savepoints
   - Distributed transaction considerations

5. **Error Handling Patterns**
   - Basic TRY-CATCH
   - Custom error messages
   - Error logging
   - Transaction rollback on error

## Integration Points

### Framework Cross-References

**TDD/BDD Integration:**
- Reference testing-plan.md for stored procedure test scenarios
- Link to tSQLt framework for unit testing
- BDD scenarios for stored procedure behavior

**Security Framework Integration:**
- Reference SABSA framework for security architecture
- Link to OWASP guidelines for SQL injection prevention
- Compliance considerations (HIPAA, GDPR)

**DevOps Integration:**
- Database migration strategies
- CI/CD pipeline integration for stored procedure deployment
- Version control best practices for database code

**Performance Monitoring:**
- Reference APM strategy for monitoring stored procedure performance
- Integration with Application Insights or similar tools
- Query performance metrics and alerting

### VS Code Extension Integration

**Discovery:**
- Strategy guide registered in manifest.json
- Searchable through extension's framework browser
- Accessible via command palette

**Usage:**
- Inline suggestions when editing SQL files
- Quick reference panel in VS Code
- Integration with spec validation

**Workflow:**
1. Developer opens SQL file or creates stored procedure
2. Extension suggests relevant strategy guide sections
3. Developer references patterns and best practices
4. Extension validates against documented standards

## Design Decisions

### Decision 1: Dual-Document Approach

**Context:** Need to serve both learning and quick-reference use cases

**Decision:** Create two separate documents:
- Comprehensive framework document for learning
- Concise strategy guide for quick reference

**Rationale:**
- Matches existing pattern (e.g., DDD has both framework and strategy docs)
- Optimizes for different user contexts (learning vs. active development)
- Allows strategy guide to be loaded efficiently in VS Code extension

**Consequences:**
- Requires maintaining consistency between two documents
- Increases initial implementation effort
- Provides better user experience for different scenarios

### Decision 2: Category Classification

**Context:** Need to categorize the strategy guide in manifest.json

**Decision:** Use "database" as the category

**Rationale:**
- Aligns with the "Databases & Data Storage" section in INVENTORY.md
- Clearly indicates the domain of applicability
- Consistent with how other database technologies would be categorized

**Consequences:**
- Easy to find among database-related strategies
- May need subcategories in future if database strategies grow significantly

### Decision 3: Front Matter Inclusion Strategy

**Context:** Strategy guide needs to specify when it should be included in context

**Decision:** Set `inclusion: always` in front matter

**Rationale:**
- Stored procedures are a fundamental database pattern
- Relevant across many different file types (SQL, C#, TypeScript with SQL)
- Low overhead for always-included strategy guides

**Consequences:**
- Always available in Kiro context
- May need to reconsider if performance impact is significant
- Users can still manually exclude if needed

### Decision 4: Code Example Language

**Context:** Need to decide primary language for code examples

**Decision:** Use T-SQL (SQL Server dialect) as primary language, with secondary examples in C# for calling stored procedures

**Rationale:**
- T-SQL is the native language for SQL Server stored procedures
- C# is the primary language in the Pragmatic Rhino SUIT ecosystem
- Shows both implementation and consumption patterns

**Consequences:**
- Examples are directly applicable to SQL Server
- Requires expertise in both T-SQL and C#
- May need additional examples for other languages in future

### Decision 5: Testing Framework Recommendation

**Context:** Need to recommend approach for testing stored procedures

**Decision:** Recommend tSQLt as primary unit testing framework, with integration testing through application code

**Rationale:**
- tSQLt is the industry-standard for SQL Server unit testing
- Aligns with TDD/BDD framework principles
- Provides isolation and mocking capabilities

**Consequences:**
- Requires developers to learn tSQLt framework
- Adds dependency on external testing framework
- Enables true test-driven development for database code

## Dependencies

### External Dependencies

**None** - This is a documentation-only feature with no runtime dependencies

### Internal Dependencies

**Existing Files:**
- `frameworks/INVENTORY.md` - Must be updated
- `resources/frameworks/manifest.json` - Must be updated
- Existing strategy files (for format reference)

**Framework References:**
- TDD/BDD framework (for testing guidance)
- SABSA framework (for security guidance)
- DevOps framework (for CI/CD integration)
- APM strategy (for performance monitoring)

### Tool Dependencies

**Development:**
- Markdown editor (VS Code)
- SQL Server Management Studio or Azure Data Studio (for testing code examples)
- Markdown linting tools

**Validation:**
- markdownlint (markdown validation)
- JSON schema validator (for manifest.json)
- SQL syntax validator

## Deployment Considerations

### Rollout Strategy

**Phase 1: Document Creation**
1. Create framework document with all sections
2. Create strategy guide following established format
3. Validate all code examples

**Phase 2: Integration**
1. Update INVENTORY.md
2. Update manifest.json
3. Validate JSON schema compliance

**Phase 3: Validation**
1. Technical review of content
2. Test extension integration
3. Verify discoverability

**Phase 4: Release**
1. Commit to repository
2. Update CHANGELOG.md
3. Announce availability

### Rollback Plan

**If Issues Discovered:**
1. Revert commits for new files
2. Restore previous versions of INVENTORY.md and manifest.json
3. Document issues for future resolution

**Low Risk:** Documentation-only change with no runtime impact

### Version Control

**Initial Version:** 1.0.0

**Future Updates:**
- Minor version bump for content additions
- Patch version for corrections and clarifications
- Major version for structural changes

## Future Enhancements

### Potential Additions

1. **Video Tutorials**
   - Screen recordings demonstrating patterns
   - Walkthrough of complex scenarios

2. **Interactive Examples**
   - Embedded SQL playground
   - Live execution of examples

3. **Framework-Specific Patterns**
   - Entity Framework integration
   - Dapper integration
   - NHibernate integration

4. **Advanced Topics**
   - CLR stored procedures
   - Service Broker integration
   - Temporal tables with stored procedures

5. **Migration Guides**
   - Converting dynamic SQL to stored procedures
   - Modernizing legacy stored procedures
   - Moving from stored procedures to ORM

### Extension Enhancements

1. **Code Snippets**
   - VS Code snippets for common patterns
   - IntelliSense integration

2. **Validation Rules**
   - Lint rules for stored procedure code
   - Best practice enforcement

3. **Performance Analysis**
   - Integration with execution plan analysis
   - Performance recommendations

## Success Metrics

### Adoption Metrics

- Number of views/accesses of framework document
- Strategy guide usage in VS Code extension
- GitHub stars/forks of repository

### Quality Metrics

- Number of issues/corrections reported
- User feedback ratings
- Code example accuracy (zero errors in production use)

### Impact Metrics

- Reduction in SQL injection vulnerabilities
- Improvement in stored procedure performance
- Increase in test coverage for database code

## Conclusion

This design provides a comprehensive approach to adding SQL Server Stored Procedures documentation to the Pragmatic Rhino SUIT framework collection. The dual-document strategy serves both learning and quick-reference needs, while integration with existing framework infrastructure ensures discoverability and usability. The design follows established patterns from other framework documentation, maintaining consistency across the ecosystem.

Key success factors:
- Comprehensive coverage of stored procedure best practices
- Concise, actionable strategy guide for active development
- Seamless integration with existing framework infrastructure
- High-quality, tested code examples
- Clear cross-references to related frameworks
