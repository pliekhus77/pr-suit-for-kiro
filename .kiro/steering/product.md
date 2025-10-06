---
inclusion: always
---

# Product Context: Pragmatic Rhino SUIT
## Standards-Unified Integration Toolkit

**Company:** Pragmatic Rhino  
**Author:** Patrick Liekhus  
**Tagline:** SUIT Up. Standardize. Ship It.

## Mission
Accelerate Amazon Kiro adoption through a VS Code extension that guides developers in applying framework-based best practices and standardized patterns.

## Core Principles

**Reusability First:** Every library must solve a common problem across multiple teams  
**Framework-Driven:** Base implementations on proven frameworks (see `frameworks/` directory)  
**Quality Built-In:** TDD/BDD from day one, 80%+ coverage minimum  
**Well-Architected:** Apply AWS/Azure Well-Architected principles to all designs

## Project Scope

**VS Code Extension Features:**
- Spec scaffolding and management (requirements, design, tasks, testing-plan)
- Framework guidance and validation (inline suggestions, checks)
- C4 diagram generation and preview (Mermaid-based)
- Steering document management and templates
- Hook creation wizards and testing
- MCP configuration UI and tool testing
- Workspace structure validation
- Framework browsing, installation, and updates

**Out of Scope:**
- Application-specific business logic
- One-off solutions without reuse potential
- IDE support beyond VS Code
- Direct customer-facing applications
- Runtime libraries or packages

## Framework References

When implementing features, consult these frameworks in `frameworks/`:

| Framework | Use For | Key Concepts |
|-----------|---------|--------------|
| **C4 Model** | Architecture diagrams | System Context, Container, Component, Dynamic |
| **Domain-Driven Design** | Domain modeling | Aggregates, Entities, Value Objects, Bounded Contexts |
| **TDD/BDD** | Testing strategy | Red-Green-Refactor, Given-When-Then, testing-plan.md |
| **4D SDLC + SAFe** | Work management | Define-Design-Develop-Deploy, WSJF prioritization |
| **SABSA** | Security architecture | Threat modeling, defense in depth, zero trust |
| **AWS/Azure Well-Architected** | Cloud design | Reliability, security, cost, performance, operations |
| **Pulumi** | Infrastructure as Code | Components, stacks, configuration |
| **DevOps** | CI/CD practices | Automation, DORA metrics, deployment strategies |
| **Reqnroll + Playwright** | BDD testing | Feature files, step definitions, browser automation |

## Extension Development Rules

**Naming:** `pragmatic-rhino-suit` (VS Code extension ID: `pragmatic-rhino.pragmatic-rhino-suit`)  
**Versioning:** Semantic versioning (MAJOR.MINOR.PATCH)  
**Target:** VS Code 1.85.0+, Node.js 18+, TypeScript 5.0+  
**Documentation:** README with feature overview, CHANGELOG for releases  
**Testing:** Unit tests (Jest), integration tests (VS Code Extension Test Runner)  
**Dependencies:** Minimize external dependencies, use VS Code API where possible  
**Activation:** Activate on workspace with `.kiro/` folder or Kiro-specific commands

## Kiro Integration Patterns

**Workspace Detection:** Detect `.kiro/` folder structure, validate required directories  
**Spec Management:** CRUD operations for specs (requirements, design, tasks, testing-plan)  
**Framework Validation:** Check specs against framework rules, provide inline diagnostics  
**Template System:** Provide templates for steering docs, specs, hooks  
**Command Palette:** Register commands for common workflows (create spec, validate, generate diagrams)  
**Tree Views:** Custom views for specs, steering docs, hooks, MCP servers  
**Webviews:** Rich UI for complex workflows (C4 diagram editor, hook builder, MCP tester)

## Quality Gates

**Before Commit:**
- [ ] Code compiles without warnings
- [ ] All tests pass (unit + integration)
- [ ] Code coverage ≥ 80%
- [ ] XML documentation complete
- [ ] No hardcoded secrets or credentials

**Before Release:**
- [ ] BDD scenarios pass
- [ ] README updated with examples
- [ ] CHANGELOG.md updated
- [ ] Version number incremented (SemVer)
- [ ] Security scan passed (no critical/high vulnerabilities)
- [ ] Breaking changes documented

## Architecture Decisions

**When to Create ADR:** Technology choice, pattern adoption, breaking change, security decision  
**Location:** `docs/architecture/adr/{NNNN}-{title}.md`  
**Required Sections:** Status, Context, Decision, Consequences  
**Review:** Technical lead + architect approval required

## Spec-Driven Development

**Every feature requires:**
1. `specs/{feature}/requirements.md` - Problem definition, user stories, success criteria
2. `specs/{feature}/design.md` - Architecture diagrams, ADRs, technology decisions
3. `specs/{feature}/tasks.md` - Implementation tasks with testing tasks included
4. `specs/{feature}/testing-plan.md` - All test scenarios (happy/failure/edge/boundary)

**Process:** Define → Design → Develop (TDD/BDD) → Deploy → Monitor

## Security Baseline

**Required for all libraries:**
- No hardcoded secrets (use Key Vault references)
- Input validation on all public APIs
- Parameterized queries for data access
- Encryption for sensitive data (at rest and in transit)
- Least privilege principle in all integrations
- Audit logging for security-relevant operations

## Common Patterns

**Async Operations:** Use async/await for all I/O operations  
**Error Handling:** Specific error types, meaningful messages, preserve stack traces  
**Dependency Injection:** Constructor injection for services  
**Configuration:** VS Code workspace/user settings  
**Logging:** VS Code output channels for diagnostics  
**State Management:** Immutable state, clear ownership

## Anti-Patterns to Avoid

❌ Hardcoded paths → ✅ Use workspace API  
❌ Blocking operations → ✅ Async/await  
❌ Synchronous I/O → ✅ Async file operations  
❌ Generic errors → ✅ Specific error types  
❌ No tests → ✅ TDD/BDD from start  
❌ Tight coupling → ✅ Interface-based abstractions  
❌ Global state → ✅ Context-based state management

## Success Metrics

**Adoption:** Extension installs, active users, workspace activations  
**Quality:** Test coverage %, defect rate, security vulnerabilities  
**Performance:** Extension activation time, command response time, memory usage  
**Satisfaction:** User ratings, GitHub issues/PRs, documentation clarity

## Getting Started

**Extension Development Setup:**
1. Clone repository
2. `npm install` to install dependencies
3. `npm run compile` to build TypeScript
4. Press F5 to launch Extension Development Host
5. Test commands in command palette (Ctrl+Shift+P)

**New Feature Workflow (Using Extension):**
1. Open command palette: "Pragmatic Rhino SUIT: Create New Spec"
2. Enter feature name, select templates
3. Extension scaffolds all four files (requirements, design, tasks, testing-plan)
4. Fill in templates with guidance from inline suggestions
5. Use "Validate Spec" command to check against framework rules
6. Generate C4 diagrams from design.md
7. Create ADR if architectural decision made

**Extension Feature Checklist:**
1. Create spec in `.kiro/specs/{feature}/` (via extension command)
2. Use framework validation to ensure completeness
3. Generate diagrams with preview
4. Implement using TDD (Red-Green-Refactor)
5. Update documentation
6. Create ADR if architectural decision made (via extension command)

## Key Contacts & Resources

**Framework Docs:** `frameworks/` directory (reference implementations and patterns)  
**Steering Docs:** `.kiro/steering/` (tech standards, strategies, structure)  
**Specs:** `.kiro/specs/` (feature requirements, designs, tasks, testing plans)  
**Architecture:** `docs/architecture/` (ADRs, deployment diagrams)
