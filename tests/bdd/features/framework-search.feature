Feature: Framework Reference Search
  As a developer using Kiro
  I want to search framework reference documentation
  So that I can quickly find relevant information and understand framework concepts

  Background:
    Given I have a Kiro workspace open
    And the frameworks/ directory exists with reference documents

  Scenario: Search frameworks with matching results (Happy Path)
    When I execute the "Search Frameworks" command
    And I enter the search query "test-driven development"
    Then I see search results from framework reference documents
    And the results include "test-driven-development.md"
    And each result shows the matching text snippet
    And each result shows the file name and section

  Scenario: Click search result to open document (Happy Path)
    Given I have executed a search for "domain-driven design"
    And I see search results
    When I click on a search result for "domain-driven-design.md"
    Then the framework document opens in the editor
    And the cursor is positioned at the relevant section
    And the matching text is visible

  Scenario: Search with no results (Failure Path)
    When I execute the "Search Frameworks" command
    And I enter the search query "nonexistent-framework-xyz"
    Then I see a message "No results found"
    And I see a suggestion to check spelling or try different keywords

  Scenario: Search with empty query (Edge Case)
    When I execute the "Search Frameworks" command
    And I enter an empty search query
    Then I see an error "Please enter a search query"
    And no search is performed

  Scenario: Search with special characters (Edge Case)
    When I execute the "Search Frameworks" command
    And I enter the search query "C4 Model (Context)"
    Then the search handles special characters correctly
    And I see relevant results for "C4 Model"

  Scenario: Search with regex patterns (Edge Case)
    When I execute the "Search Frameworks" command
    And I enter the search query "test.*driven"
    Then the search treats the query as plain text
    And I see results matching "test" and "driven"

  Scenario: Search across multiple framework documents (Happy Path)
    When I execute the "Search Frameworks" command
    And I enter the search query "architecture"
    Then I see results from multiple framework documents
    And results include "c4-model.md"
    And results include "domain-driven-design.md"
    And results are sorted by relevance

  Scenario: View framework reference from code lens (Happy Path)
    Given I have a steering document open in the editor
    And the document references a framework
    When I see the code lens "View Framework Reference" at the top
    And I click the code lens
    Then the corresponding framework document opens
    And I see the full framework reference documentation

  Scenario: Initialize frameworks directory when missing (Failure Path)
    Given the frameworks/ directory does not exist
    When I execute the "Search Frameworks" command
    Then I see a prompt "Frameworks directory not found. Initialize it?"
    When I select "Yes"
    Then the frameworks/ directory is created
    And default framework reference documents are copied
    And I see a success notification
    And the search command is re-executed

  Scenario: Hover over framework term for definition (Happy Path)
    Given I have a steering document open in the editor
    And the document contains framework-specific terms
    When I hover over the term "Aggregate"
    Then I see a tooltip with the definition
    And the tooltip includes a link to the full framework reference

  Scenario: Search with very long query (Edge Case)
    When I execute the "Search Frameworks" command
    And I enter a search query longer than 200 characters
    Then the search is performed with the full query
    And I see relevant results or "No results found"

  Scenario: Search performance with large framework library (Performance)
    Given the frameworks/ directory contains 20+ reference documents
    When I execute the "Search Frameworks" command
    And I enter the search query "best practices"
    Then search results are returned in less than 2 seconds
    And I see results from all matching documents

  Scenario: Cancel search operation (Edge Case)
    When I execute the "Search Frameworks" command
    And I see the search input prompt
    When I press Escape or click Cancel
    Then the search is cancelled
    And no results are shown
    And no error is displayed

  Scenario: Search with case-insensitive matching (Happy Path)
    When I execute the "Search Frameworks" command
    And I enter the search query "DOMAIN DRIVEN DESIGN"
    Then I see results matching "domain driven design"
    And the search is case-insensitive
    And results include "domain-driven-design.md"

  Scenario: Open framework reference when directory missing (Failure Path)
    Given I have a steering document open in the editor
    And the frameworks/ directory does not exist
    When I click the code lens "View Framework Reference"
    Then I see a prompt "Frameworks directory not found. Initialize it?"
    When I select "No"
    Then no framework document is opened
    And I see an informational message about initializing frameworks

  Scenario: Search results show context around match (Happy Path)
    When I execute the "Search Frameworks" command
    And I enter the search query "bounded context"
    Then each search result shows 2 lines of context before the match
    And each search result shows 2 lines of context after the match
    And the matching text is highlighted in the context

  Scenario: Navigate between multiple search results (Happy Path)
    Given I have executed a search with multiple results
    When I click on the first search result
    Then the framework document opens at the first match
    When I execute "Go to Next Search Result" command
    Then the cursor moves to the next match in the document
    When I execute "Go to Previous Search Result" command
    Then the cursor moves back to the previous match
