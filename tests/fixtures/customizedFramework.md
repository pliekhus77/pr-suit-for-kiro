# TDD/BDD Testing Strategy Guide (CUSTOMIZED)

**NOTE: This document has been customized by the team. Original version: 1.0.0**

## Purpose
Define testing strategy for all features using TDD and BDD practices. Every spec MUST include `testing-plan.md`. Every spec must update the `tasks.md` to include tasks that cover the details of the testing plan.

**TEAM CUSTOMIZATION:** We've added our own testing requirements and modified some sections to match our team's workflow.

## Testing Artifacts

| Artifact | Location | When | Purpose |
|----------|----------|------|---------|
| testing-plan.md | `specs/{feature}/` | Requirements phase | Define all test scenarios |
| Unit Tests | `tests/{Library}.Tests/Unit/` | Implementation (TDD) | Test components |
| Integration Tests | `tests/{Library}.Tests/Integration/` | Implementation | Test interactions |
| BDD Tests | `tests/{Library}.BDD/Features/` | Implementation | Test behavior |
| **Performance Tests** | `tests/{Library}.Performance/` | **Before release** | **Test performance** |

**TEAM ADDITION:** We require performance tests for all critical paths before release.

## Required: testing-plan.md Template

```markdown
# Testing Plan: [Feature Name]
**Created:** [Date] | **Updated:** [Date] | **Status:** [Draft/In Progress/Complete]

## Test Strategy
**Scope:** [What will be tested]
**Approach:** Unit (TDD), Integration, BDD, Performance (if needed), Security (if needed)
**Pyramid:** Unit [X]%, Integration [Y]%, BDD/E2E [Z]%

## TEAM REQUIREMENT: Risk Assessment
**High-Risk Areas:** [List with extra testing needed]
**Mitigation:** [How we'll address high-risk areas]

## Unit Test Scenarios
### [Component Name]
**Happy Path:** [List scenarios with Given/When/Then]
**Failure Path:** [List error scenarios with expected exceptions]
**Edge Cases:** [List boundary conditions]
**Range/Boundary:** [List min/max/zero/negative test values]

## Integration Test Scenarios
### [Integration Point]
**Happy Path:** [List integration scenarios]
**Failure Path:** [List failure handling scenarios]

## BDD Scenarios
[Gherkin feature with scenarios for happy/failure/range paths]

## Test Data
**Sets:** Happy path, invalid, edge case, performance
**Management:** Location, generation method, cleanup strategy

## Coverage Goals
Overall: 85% (TEAM: Increased from 80%) | Critical: 100% | Public APIs: 100% | Business Logic: 90%+

## TEAM ADDITION: Performance Criteria
**Response Time:** < 200ms for API calls
**Throughput:** > 1000 requests/second
**Memory:** < 512MB under load
```

## Scenario Identification Rules

When creating testing-plan.md, identify ALL scenarios:

### 1. Happy Path (REQUIRED)
Primary use case, alternative valid paths, optimal conditions

### 2. Failure Path (REQUIRED)
Invalid input, missing data, auth/authz failures, external system failures, business rule violations, concurrent access issues

### 3. Edge Cases (REQUIRED)
Boundary conditions, empty/single/large collections, special characters, timing issues, state transitions

### 4. Range/Boundary (REQUIRED)
For numeric inputs test: min, just below min, max, just above max, zero, negative, decimal, very large
**Example (age 18-120):** 17, 18, 65, 120, 121, 0, -5

### 5. State-Based (if applicable)
Initial state, valid transitions, invalid transitions, final states

### 6. Security (if applicable)
SQL injection, XSS, auth bypass, authz bypass, data exposure

### 7. Performance (TEAM REQUIREMENT: ALWAYS REQUIRED)
Load, stress, spike, endurance testing

**TEAM CUSTOMIZATION:** Performance testing is mandatory for all features, not optional.

## TDD Process: Red-Green-Refactor

### RED (Write Failing Test)
Location: `tests/{Library}.Tests/Unit/`
1. Review testing-plan.md for next scenario
2. Write test with AAA pattern (Arrange, Act, Assert)
3. Run test - MUST fail for right reason

### GREEN (Make Test Pass)
Location: `src/{Library}/`
1. Write minimal code (hard-coding OK initially)
2. No extra functionality
3. Run test - MUST pass
4. All existing tests MUST still pass

### REFACTOR (Improve Code)
1. Improve quality, remove duplication, improve naming
2. Extract methods/classes
3. All tests MUST still pass after each change

**TEAM ADDITION:** Pair programming required for complex refactoring

**Repeat** with next scenario from testing-plan.md

## BDD Process

### Feature Files
Location: `tests/{Library}.BDD/Features/`
- Review testing-plan.md BDD scenarios
- Create .feature with Gherkin (Given/When/Then)
- Use ubiquitous language (domain terms)
- Focus on behavior, not implementation

### Step Definitions
Location: `tests/{Library}.BDD/StepDefinitions/`
- Generate from feature file
- Implement with Playwright for UI
- Use page object pattern
- Keep steps reusable

**TEAM CUSTOMIZATION:** All BDD scenarios must be reviewed by product owner before implementation.

## Integration with tasks.md

When creating `specs/{feature}/tasks.md`, ALWAYS include:

```markdown
## Testing Tasks
### Unit Tests (TDD)
- [ ] Review testing-plan.md scenarios
- [ ] Implement [Component] happy/failure/edge/boundary tests (list specific tests)
- [ ] Verify 85% minimum coverage (TEAM: Increased from 80%)

### Integration Tests
- [ ] Review testing-plan.md integration scenarios
- [ ] Implement [Integration Point] happy/failure tests (list specific tests)
- [ ] Verify all integration points tested

### BDD Acceptance Tests
- [ ] Review testing-plan.md BDD scenarios
- [ ] Create feature file: [FeatureName].feature
- [ ] Implement step definitions (happy/failure/edge paths)
- [ ] Create page objects (if UI)
- [ ] Verify all scenarios pass
- [ ] **TEAM: Get product owner approval**

### Performance Tests (TEAM REQUIREMENT)
- [ ] Create performance test suite
- [ ] Test response time < 200ms
- [ ] Test throughput > 1000 req/s
- [ ] Test memory usage < 512MB
- [ ] Document performance results

### Test Data & Review
- [ ] Create test data sets, builders, cleanup
- [ ] All scenarios implemented, coverage met, tests passing
- [ ] Update testing-plan.md with results
```

## Test Organization

### File Naming
- Unit: `{ClassName}Tests.cs`
- Integration: `{Feature}IntegrationTests.cs`
- BDD: `Features/{FeatureName}.feature`, `StepDefinitions/{FeatureName}Steps.cs`
- **Performance: `{Feature}PerformanceTests.cs`** (TEAM ADDITION)

### Class Structure
Group tests by scenario type (happy path, failures, edge cases) using nested classes. Use `[Theory]` with `[InlineData]` for range testing.

## Quality Standards

**All tests must have:**
- Descriptive name (MethodName_Scenario_ExpectedBehavior)
- AAA structure (Arrange, Act, Assert)
- Single responsibility
- No dependencies on other tests
- Deterministic results
- Fast execution (unit < 100ms)
- Clear assertions

**Test code quality:**
- Same standards as production code
- Use builders for complex objects
- Use fixtures for shared setup
- No magic numbers/strings

## Coverage Requirements

| Type | Minimum |
|------|---------|
| Public APIs | 100% |
| Business Logic | 90% |
| Services | 85% |
| Controllers | 85% (TEAM: Increased from 80%) |
| Models/DTOs | 70% |
| Overall | 85% (TEAM: Increased from 80%) |

**Exclude:** Generated code, third-party libraries, simple DTOs, configuration classes

**TEAM CUSTOMIZATION:** We have higher coverage requirements than the standard framework.

## Test Execution

**Local:** `dotnet test` (all), `dotnet test --filter Category=Unit` (unit only)  
**CI/CD:** Commit (unit), PR (unit+integration+coverage), Merge (full suite), Nightly (full+perf+security)  
**Failure Policy:** Any failure = build fails, coverage below threshold = build fails, flaky tests = fix or remove

**TEAM ADDITION:** Performance tests run on every PR, not just nightly.

## Common Patterns

Use test data builders (fluent API), fixtures (IClassFixture), and mocking (Moq/NSubstitute) for external dependencies. See `frameworks/test-driven-development.md` for detailed examples.

## Summary

1. Create testing-plan.md during requirements phase
2. Identify ALL scenarios: happy, failure, edge, boundary, state, security, performance
3. Use TDD (Red-Green-Refactor) for unit tests
4. Use BDD (Given-When-Then) for acceptance tests
5. Include testing tasks in tasks.md referencing testing-plan.md
6. Maintain 85% minimum coverage (100% for critical paths) - TEAM CUSTOMIZATION
7. Update testing-plan.md as scenarios discovered
8. All tests pass before merging
9. **TEAM: Performance tests required for all features**
10. **TEAM: Product owner approval required for BDD scenarios**

**Golden Rule:** If it's not tested, it's broken. If it's not in testing-plan.md, it won't be tested.

**TEAM MOTTO:** "Test early, test often, test everything."

---

**CUSTOMIZATION HISTORY:**
- 2025-01-15: Increased coverage requirements from 80% to 85%
- 2025-01-15: Made performance testing mandatory for all features
- 2025-01-15: Added product owner approval requirement for BDD scenarios
- 2025-01-15: Added performance criteria to testing-plan.md template
- 2025-01-15: Added pair programming requirement for complex refactoring
