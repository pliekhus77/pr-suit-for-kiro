# Implementation Plan: JMeter Performance Testing Strategy Guide

## Overview
This implementation plan creates a comprehensive JMeter performance testing strategy guide at `.kiro/steering/strategy-jmeter.md`. The guide will provide standardized approaches, best practices, and patterns for implementing performance testing using Apache JMeter, complementing existing testing strategies (TDD/BDD) by focusing on non-functional performance requirements.

---

## 1. Document Structure and Foundation

- [x] 1.1 Create strategy-jmeter.md file with frontmatter and basic structure
  - Create `.kiro/steering/strategy-jmeter.md` with YAML frontmatter (`inclusion: always`)
  - Add document title, purpose statement, and table of contents placeholders
  - Establish section hierarchy matching design document structure
  - _Requirements: 10.7_

- [x] 1.2 Write Purpose & Scope section
  - Define guide's purpose and target audience (developers, QA engineers)
  - Explain relationship to existing testing strategies (TDD/BDD)
  - Clarify when to use JMeter vs other testing approaches
  - List what's in scope and out of scope
  - _Requirements: 10.1, 10.7_

---

## 2. Core Concepts & Terminology

- [x] 2.1 Create JMeter component hierarchy diagram
  - Design Mermaid diagram showing Thread Groups → Samplers → Listeners → Assertions → Timers → Controllers
  - Include visual representation of component relationships
  - Add color coding and legend for component types
  - _Requirements: 1.1, 1.3_

- [x] 2.2 Write terminology definitions section
  - Create comparison table: JMeter terms vs industry-standard equivalents
  - Define throughput, latency, response time, concurrent users with units
  - Provide typical acceptable ranges for each metric
  - Include examples for clarity
  - _Requirements: 1.2, 1.4, 1.5_

---

## 3. Test Types & Selection Guidance

- [x] 3.1 Create test types definition table
  - Define load, stress, spike, endurance, and scalability testing
  - Include columns: Purpose, Duration, Load Pattern, Success Criteria
  - Provide real-world scenario examples for each type
  - _Requirements: 2.1, 2.2, 2.5_

- [x] 3.2 Design test type selection decision matrix
  - Create Mermaid flowchart for test type selection
  - Include decision points based on testing goals
  - Show recommended sequence when multiple types apply
  - Document dependencies between test types
  - _Requirements: 2.3, 2.4_

---

## 4. Test Design & Planning

- [x] 4.1 Create performance test plan template
  - Write markdown template with all required sections (objectives, scope, scenarios, data, environment, schedule, success criteria, risks)
  - Include placeholders and guidance for each section
  - Provide formulas for calculating concurrent users and ramp-up times
  - Add industry-standard baseline targets table
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 4.2 Write scenario derivation guide
  - Explain how to derive performance scenarios from requirements
  - Show how to map user journeys to test scenarios
  - Provide examples from software development context
  - Include decision criteria for scenario prioritization
  - _Requirements: 3.2_

- [x] 4.3 Document test data management strategies
  - Explain data requirements for performance testing
  - Describe data generation approaches (CSV, databases, APIs)
  - Provide data management best practices
  - Include cleanup and reset strategies
  - _Requirements: 3.5_

---

## 5. Test Script Structure & Best Practices

- [x] 5.1 Define standard directory structure
  - Document recommended directory layout for JMeter test files
  - Show structure for test-plans, test-data, test-fragments, config, results
  - Align with project structure conventions
  - Include README template for performance-tests directory
  - _Requirements: 4.1, 10.7_

- [x] 5.2 Create naming conventions guide
  - Define naming patterns for Thread Groups, Samplers, and components
  - Provide examples of good vs bad names
  - Include naming convention table
  - _Requirements: 4.2_

- [x] 5.3 Document reusability patterns
  - Explain Test Fragments, Module Controllers, Include Controllers
  - Provide code examples for each pattern
  - Show how to structure reusable components
  - Include best practices for modular design
  - _Requirements: 4.3, 4.7_

- [x] 5.4 Write configuration management guide
  - Demonstrate User Defined Variables usage
  - Show CSV Data Set configuration examples
  - Explain property files for environment-specific settings
  - Provide examples for dev, staging, prod configurations
  - _Requirements: 4.4_

- [x] 5.5 Create assertions examples section
  - Provide response assertion examples with patterns
  - Show duration assertion configurations
  - Include size assertion examples
  - Document when to use each assertion type
  - _Requirements: 4.5_

- [x] 5.6 Write listeners selection guide
  - List common listeners and their purposes
  - Explain performance impact of each listener
  - Provide recommendations for different scenarios
  - Include table: Listener → Purpose → Performance Impact → When to Use
  - _Requirements: 4.6_

---

## 6. Correlation & Dynamic Data Handling

- [x] 6.1 Create Regular Expression Extractor examples
  - Provide annotated examples for common patterns
  - Show how to extract session tokens, IDs, CSRF tokens
  - Include debugging tips for regex patterns
  - Document common pitfalls and solutions
  - _Requirements: 5.1, 5.6_

- [x] 6.2 Write JSON Extractor guide
  - Show JSON path syntax examples
  - Demonstrate extracting nested values
  - Provide examples for arrays and complex structures
  - Include validation techniques
  - _Requirements: 5.1_

- [x] 6.3 Document authentication patterns
  - Provide token-based authentication example (JWT)
  - Show cookie-based session management
  - Include OAuth 2.0 flow implementation
  - Document correlation for each auth type
  - _Requirements: 5.2_

- [x] 6.4 Create API request chaining examples
  - Show how to use extracted values in subsequent requests
  - Provide complete workflow examples
  - Include error handling patterns
  - Document variable scope and lifetime
  - _Requirements: 5.5_

- [x] 6.5 Write CSRF token handling guide
  - Explain CSRF token extraction patterns
  - Show how to include tokens in requests
  - Provide complete example with form submission
  - Include troubleshooting steps
  - _Requirements: 5.4_

---

## 7. Performance Metrics & Analysis

- [x] 7.1 Create KPI definitions table
  - Define response time, throughput, error rate, percentiles
  - Include units, calculation methods, and typical targets
  - Provide visual examples of metric interpretation
  - _Requirements: 6.1_

- [x] 7.2 Write percentile interpretation guide
  - Explain 50th, 90th, 95th, 99th percentiles
  - Show how to interpret percentile distributions
  - Provide examples of good vs problematic distributions
  - Include visualization examples
  - _Requirements: 6.2_

- [x] 7.3 Document bottleneck identification patterns
  - List common performance bottleneck symptoms
  - Provide pattern recognition guide
  - Include examples from real scenarios
  - Create troubleshooting decision tree (Mermaid)
  - _Requirements: 6.3, 6.7_

- [x] 7.4 Create error categorization guide
  - Define error types (client, server, network, timeout)
  - Explain prioritization criteria
  - Provide error analysis workflow
  - Include examples of error patterns
  - _Requirements: 6.4_

- [x] 7.5 Write baseline and regression detection guide
  - Explain baseline establishment process
  - Show how to compare test runs
  - Provide regression detection criteria
  - Include statistical significance considerations
  - _Requirements: 6.5_

- [x] 7.6 Create performance test report template
  - Write markdown template with all required sections
  - Include tables for metrics, graphs placeholders, analysis sections
  - Provide examples of completed reports
  - Add visualization recommendations
  - _Requirements: 6.6, 12.6_

---

## 8. CI/CD Integration & Automation

- [x] 8.1 Create GitHub Actions pipeline example
  - Write complete YAML workflow file
  - Include JMeter installation, test execution, report generation
  - Show artifact publishing configuration
  - Document quality gate implementation
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8.2 Create Azure DevOps pipeline example
  - Write complete azure-pipelines.yml
  - Include JMeter task configuration
  - Show test results publishing
  - Document pipeline variables for environments
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.6_

- [x] 8.3 Create Jenkins pipeline example
  - Write Jenkinsfile with JMeter integration
  - Include stages for setup, execution, reporting
  - Show artifact archiving configuration
  - Document quality gate implementation
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

- [x] 8.4 Document command-line execution patterns
  - Provide JMeter CLI command examples with parameters
  - Show how to pass environment-specific properties
  - Include non-GUI mode best practices
  - Document output file management
  - _Requirements: 7.2_

- [x] 8.5 Write quality gates configuration guide
  - Define threshold examples for different test types
  - Show how to implement pass/fail criteria
  - Provide examples for each CI/CD platform
  - Include trend analysis setup
  - _Requirements: 7.3, 7.7_

- [x] 8.6 Create test scheduling recommendations
  - Provide frequency recommendations by test type
  - Explain nightly, weekly, pre-release schedules
  - Include resource utilization considerations
  - Document scheduling best practices
  - _Requirements: 7.5_

- [x] 8.7 Write environment configuration management guide
  - Show how to manage environment-specific settings
  - Provide examples for dev, staging, prod
  - Include secrets management approach
  - Document configuration validation
  - _Requirements: 7.6_

---

## 9. Distributed Testing & Scalability

- [x] 9.1 Create distributed testing architecture diagram
  - Design Mermaid diagram showing master-slave setup
  - Include network communication flows
  - Show result aggregation process
  - Document component responsibilities
  - _Requirements: 8.1_

- [x] 9.2 Write master-slave setup configuration guide
  - Provide step-by-step setup instructions
  - Include configuration file examples
  - Document network requirements and firewall rules
  - Show verification steps
  - _Requirements: 8.2_

- [x] 9.3 Document result aggregation process
  - Explain how to collect results from multiple nodes
  - Show aggregation command examples
  - Include result validation steps
  - Provide troubleshooting guide
  - _Requirements: 8.3_

- [x] 9.4 Write cloud-based testing guidance
  - Provide AWS-specific guidance (EC2, ECS)
  - Include Azure-specific guidance (VMs, Container Instances)
  - Show infrastructure provisioning examples
  - Document cost optimization strategies
  - _Requirements: 8.4, 10.5_

- [x] 9.5 Create infrastructure sizing calculator
  - Provide formulas for calculating required resources
  - Include examples for different load levels
  - Show how to estimate costs
  - Document scaling considerations
  - _Requirements: 8.5_

- [x] 9.6 Write distributed testing troubleshooting guide
  - List common issues and solutions
  - Include network connectivity problems
  - Document result synchronization issues
  - Provide diagnostic commands
  - _Requirements: 8.6_

---

## 10. Best Practices & Anti-Patterns

- [x] 10.1 Create best practices list
  - Document minimum 10 best practices with rationale
  - Organize by category (design, execution, analysis, maintenance)
  - Provide examples for each practice
  - Include references to relevant sections
  - _Requirements: 9.1_

- [x] 10.2 Create anti-patterns checklist
  - Document common anti-patterns in three-column table (Problem | Impact | Solution)
  - Include at least 10 anti-patterns
  - Provide real-world examples
  - Reference correct alternatives in guide
  - _Requirements: 9.2, 9.6_

- [x] 10.3 Write test optimization techniques guide
  - Explain JMeter performance optimization
  - Document resource usage best practices
  - Include JVM tuning recommendations
  - Provide monitoring approaches for JMeter itself
  - _Requirements: 9.3, 9.4_

- [x] 10.4 Create version control practices guide
  - Document recommended Git workflow for test scripts
  - Explain branching strategy for performance tests
  - Include .gitignore recommendations
  - Show how to handle test results and reports
  - _Requirements: 9.5_

- [x] 10.5 Write documentation standards section
  - Define documentation requirements for test scripts
  - Provide inline comment examples
  - Include README template for test suites
  - Document change log practices
  - _Requirements: 9.5_

---

## 11. Project Integration

- [x] 11.1 Create integration with testing-plan.md guide
  - Show how to add performance testing section to testing-plan.md
  - Provide template for performance test scenarios
  - Include examples from existing features
  - Reference strategy-tdd-bdd.md template
  - _Requirements: 10.1_

- [x] 11.2 Write BDD integration guide
  - Explain how to derive performance scenarios from BDD feature files
  - Provide examples of mapping Given-When-Then to JMeter tests
  - Show how to use ubiquitous language in performance tests
  - Include practical examples
  - _Requirements: 10.2_

- [x] 11.3 Create tasks.md integration examples
  - Show how to add performance testing tasks to specs/{feature}/tasks.md
  - Provide task template with proper formatting
  - Include examples of task descriptions
  - Document task dependencies
  - _Requirements: 10.3_

- [x] 11.4 Write security testing integration guide
  - Reference strategy-security.md for security-focused performance tests
  - Show how to combine security and performance testing
  - Provide examples of security load testing scenarios
  - Include authentication/authorization performance testing
  - _Requirements: 10.4_

- [x] 11.5 Create IaC integration guide
  - Reference strategy-iac-pulumi.md for test infrastructure
  - Show how to provision JMeter infrastructure as code
  - Provide Pulumi/Terraform examples
  - Document infrastructure testing patterns
  - _Requirements: 10.5_

- [x] 11.6 Write DevOps integration guide
  - Reference strategy-devops.md for pipeline integration
  - Show how performance testing fits in CI/CD workflow
  - Provide deployment strategy examples
  - Document quality gates and metrics
  - _Requirements: 10.6_

- [x] 11.7 Ensure format consistency with other strategy guides
  - Review all existing strategy guides for format patterns
  - Apply consistent section structure
  - Use consistent markdown formatting
  - Ensure frontmatter matches other guides
  - _Requirements: 10.7_

---

## 12. Tool Ecosystem & Extensions

- [x] 12.1 Create essential plugins list
  - List plugins from JMeter Plugins Manager by category
  - Include installation instructions for each
  - Provide use case examples
  - Document compatibility considerations
  - _Requirements: 11.1_

- [x] 12.2 Write monitoring tools integration guide
  - Show Grafana integration for real-time monitoring
  - Include Prometheus metrics export configuration
  - Provide dashboard examples
  - Document setup steps
  - _Requirements: 11.2_

- [x] 12.3 Document complementary analysis tools
  - List tools for result analysis (BlazeMeter, Taurus, etc.)
  - Explain when to use each tool
  - Provide integration examples
  - Include pros/cons comparison
  - _Requirements: 11.3_

- [x] 12.4 Write custom extensions guide
  - Explain how to create custom samplers
  - Show how to create custom functions
  - Provide Java code examples
  - Include packaging and deployment instructions
  - _Requirements: 11.4_

- [x] 12.5 Create tool selection matrix
  - Organize tools by category and purpose
  - Include installation method for each
  - Provide use case recommendations
  - Document licensing considerations
  - _Requirements: 11.5_

---

## 13. Real-World Examples & Templates

- [x] 13.1 Create complete annotated test script example
  - Write full JMeter test plan with detailed annotations
  - Include all major components (Thread Groups, Samplers, Listeners, etc.)
  - Provide explanation for each element
  - Base on realistic e-commerce scenario
  - _Requirements: 12.1_

- [x] 13.2 Create REST API performance testing template
  - Write reusable JMeter template for API testing
  - Include authentication, request chaining, assertions
  - Provide configuration examples
  - Document customization points
  - _Requirements: 12.2_

- [x] 13.3 Create web application testing template
  - Write template for browser-based performance testing
  - Include HTTP Cookie Manager, Cache Manager
  - Show how to handle dynamic content
  - Provide realistic user journey example
  - _Requirements: 12.3_

- [x] 13.4 Create database testing template
  - Write JDBC connection configuration example
  - Include query examples (SELECT, INSERT, UPDATE)
  - Show how to use CSV for parameterization
  - Provide connection pooling configuration
  - _Requirements: 12.4_

- [x] 13.5 Enhance performance test plan template
  - Expand template from section 4.1 with more details
  - Add examples for each section
  - Include filled-out example
  - Ensure consistency with testing-plan.md format
  - _Requirements: 12.5_

- [x] 13.6 Enhance performance test report template
  - Expand template from section 7.6 with more details
  - Add visualization examples
  - Include filled-out example report
  - Provide interpretation guidance
  - _Requirements: 12.6_

- [x] 13.7 Create scenario-based examples
  - Write examples for user registration scenario
  - Include search functionality performance test
  - Provide checkout process example
  - Base all examples on realistic software development scenarios
  - _Requirements: 12.7_

---

## 14. Documentation Review & Quality Assurance

- [x] 14.1 Conduct completeness review
  - Verify all 12 requirements are addressed
  - Check that all sections from design are present
  - Ensure all templates are included
  - Validate all examples are provided
  - _Requirements: All_

- [x] 14.2 Perform technical accuracy validation
  - Review JMeter concepts for correctness
  - Validate all code examples
  - Verify formulas and calculations
  - Test all command-line examples
  - _Requirements: All_

- [x] 14.3 Validate cross-references
  - Check all references to other strategy guides
  - Verify links to testing-plan.md template
  - Validate references to specs/{feature}/tasks.md
  - Ensure all internal links work
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [x] 14.4 Review for consistency
  - Ensure consistent terminology throughout
  - Verify consistent formatting (tables, code blocks, lists)
  - Check consistent use of examples
  - Validate consistent structure with other strategy guides
  - _Requirements: 10.7_

- [x] 14.5 Conduct usability review
  - Verify guide is navigable and scannable
  - Check that examples are clear and actionable
  - Ensure decision matrices are easy to use
  - Validate that new team members can follow the guide
  - _Requirements: All_

---

## 15. Final Integration & Deployment

- [x] 15.1 Add frontmatter and metadata
  - Include YAML frontmatter with `inclusion: always`
  - Add document version number
  - Include last updated date
  - Add author/maintainer information
  - _Requirements: 10.7_

- [x] 15.2 Create table of contents
  - Generate comprehensive table of contents
  - Include links to all major sections
  - Add quick reference section
  - Ensure easy navigation
  - _Requirements: All_

- [x] 15.3 Perform final formatting pass
  - Apply consistent markdown formatting
  - Ensure proper heading hierarchy
  - Validate all code blocks have language tags
  - Check all tables render correctly
  - _Requirements: 10.7_

- [x] 15.4 Update project documentation
  - Add reference to strategy-jmeter.md in main README
  - Update onboarding documentation
  - Include in strategy guides index
  - Document guide usage in project wiki
  - _Requirements: 10.7_

- [x] 15.5 Create changelog entry
  - Document new strategy guide addition
  - List key features and sections
  - Include version information
  - Add to project CHANGELOG.md
  - _Requirements: 10.7_

---

## Notes

- This is a documentation-focused implementation plan
- All tasks involve writing, organizing, and validating documentation content
- No code implementation is required (this is a strategy guide, not a code feature)
- Testing involves reviewing for accuracy, completeness, and usability
- The guide will be stored at `.kiro/steering/strategy-jmeter.md`
- All examples should be based on realistic software development scenarios
- The guide must integrate seamlessly with existing project standards and strategy guides
