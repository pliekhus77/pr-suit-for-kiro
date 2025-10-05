Feature: Example Feature
  As a developer using Pragmatic Rhino SUIT
  I want to see an example BDD test
  So that I understand how to write feature files

  Background:
    Given the extension is installed and activated

  @extension
  Scenario: Extension is active
    When I check the extension status
    Then the extension should be active
    And the extension ID should be "pragmatic-rhino.pragmatic-rhino-suit"

  @extension
  Scenario: Extension provides commands
    When I list all extension commands
    Then the command list should include "agentic-reviewer.browseFrameworks"
    And the command list should include "agentic-reviewer.installFramework"
    And the command list should include "agentic-reviewer.initializeWorkspace"

  # This is an example of a scenario that would use Playwright for webview testing
  # @webview
  # Scenario: Framework browser webview displays correctly
  #   Given a test workspace with .kiro directory
  #   When I execute the "Browse Frameworks" command
  #   Then a webview should open
  #   And the webview should display framework categories
