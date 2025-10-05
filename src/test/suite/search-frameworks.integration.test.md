# Search Frameworks Integration Tests

## Overview
This test suite validates the search frameworks command functionality, ensuring users can search across framework reference documentation and navigate to relevant sections.

## Test Coverage

### Command Registration
- Verifies `agentic-reviewer.searchFrameworks` command is registered
- Ensures command is available in the command palette

### Search Functionality
- **Query Input**: Tests that the command prompts for search input
- **Results Display**: Validates search results are displayed from framework reference docs
- **Result Structure**: Verifies each result contains fileName, filePath, lineNumber, line, and matchedText
- **Navigation**: Tests clicking a result opens the document at the correct line
- **No Results**: Validates appropriate message when no results found

### Edge Cases
- **Special Characters**: Tests search with special characters (C4 Model, test-driven, API/Gateway, etc.)
- **Regex Patterns**: Ensures regex special characters are handled safely (.*[abc], (group), pattern+, etc.)
- **Case Insensitivity**: Verifies search is case-insensitive
- **Multiple Files**: Tests search across multiple framework files
- **Context**: Validates results include surrounding context
- **Empty Directory**: Handles empty frameworks directory gracefully
- **Long Queries**: Tests with very long search queries (1000 characters)
- **Unicode**: Handles Unicode characters in search queries
- **Long Lines**: Limits matched text length for display
- **Missing Directory**: Handles case when frameworks directory doesn't exist

## Test Data
The test suite creates temporary framework reference files:
- `test-ddd.md`: Domain-Driven Design concepts (aggregates, entities, value objects)
- `test-tdd.md`: Test-Driven Development practices (Red-Green-Refactor)
- `test-c4.md`: C4 Model diagram types

## Requirements Covered
- Requirement 7.1: Framework reference integration
- Requirement 7.2: Hover provider for framework-specific terms
- Requirement 7.3: Search command registration
- Requirement 7.4: Full-text search across framework references
- Requirement 7.5: Open framework reference at relevant section
- Requirement 7.6: Search results display

## Running Tests
```bash
npm test -- --grep "Search Frameworks Command"
```

## Notes
- Tests use temporary files to avoid interfering with actual framework references
- Cleanup is performed after each test to maintain isolation
- Tests verify both happy path and error scenarios
- Integration tests run in VS Code Extension Development Host
