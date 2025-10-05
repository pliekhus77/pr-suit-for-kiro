---
inclusion: always
---

# 4D SDLC + SAFe Work Management Strategy

## Purpose
Define work management approach combining 4D SDLC phases with SAFe practices for agile teams.

## The 4D Phases

| Phase | Focus | Key Question | Primary Artifacts |
|-------|-------|--------------|-------------------|
| **Define** | Problem & requirements | What problem are we solving? | Requirements, user stories, success criteria |
| **Design** | Solution architecture | How will we solve it? | Architecture diagrams, ADRs, design docs |
| **Develop** | Implementation & testing | Are we building it right? | Code, tests, documentation |
| **Deploy** | Release & operations | Is it delivering value? | Deployed system, metrics, feedback |

## Phase Integration with Specs

### Define Phase → `specs/{feature}/requirements.md`

**Purpose:** Understand the problem before jumping to solutions

**Jobs-to-be-Done Approach:**
1. Identify the job users are trying to accomplish
2. Understand constraints preventing job completion
3. Use Five Whys to find root causes
4. Validate assumptions with users

**Key Activities:**
- Stakeholder interviews
- User research and personas
- Requirements gathering (functional, non-functional, compliance)
- Feasibility analysis (technical, operational, economic, schedule)
- Risk identification
- Success metrics definition

**Deliverables:**
- User stories with acceptance criteria
- Requirements specification
- Success criteria (outcomes, not outputs)
- Risk register
- Feasibility assessment

**SAFe Integration:**
- Epic hypothesis statement
- Lean business case
- WSJF prioritization
- Capacity allocation

**Anti-Pattern:** Jumping to solutions without validating problems

### Design Phase → `specs/{feature}/design.md`

**Purpose:** Create blueprint for implementation

**Key Activities:**
- System architecture (C4 diagrams)
- Component design
- API specifications
- Database schema
- Security architecture
- Technology decisions (ADRs)

**Deliverables:**
- Architecture diagrams (Container, Component)
- Architecture Decision Records (ADRs)
- API specifications
- Data models
- Design review sign-off

**SAFe Integration:**
- Architectural runway
- Enabler work identification
- Technical debt assessment
- Built-in quality planning

**Anti-Pattern:** Over-designing before validating with code

### Develop Phase → Implementation (TDD/BDD)

**Purpose:** Build and test the solution

**Key Activities:**
- Test-Driven Development (Red-Green-Refactor)
- Behavior-Driven Development (Gherkin scenarios)
- Code implementation
- Code reviews
- Continuous Integration
- Technical documentation

**Deliverables:**
- Working software
- Unit tests (80%+ coverage)
- Integration tests
- BDD acceptance tests
- Code documentation

**SAFe Integration:**
- Continuous Integration
- Built-in quality practices
- Pair programming
- Collective code ownership
- Definition of Done

**Anti-Pattern:** Writing code without tests, skipping code reviews

### Deploy Phase → Release & Monitor

**Purpose:** Deliver value and gather feedback

**Key Activities:**
- Deployment automation (CI/CD)
- Release to production
- Monitoring and observability
- User feedback collection
- Metrics analysis
- Incident response

**Deliverables:**
- Deployed system
- Release notes
- Monitoring dashboards
- Feedback reports
- Metrics analysis
- Lessons learned

**SAFe Integration:**
- Release on demand
- DevOps practices
- Continuous Deployment
- Customer feedback loops
- Inspect and adapt

**Anti-Pattern:** Deploy and forget, no monitoring or feedback

## SAFe Work Management

### Team Level (2-week sprints)
**Ceremonies:** Planning, Daily Standup (15min), Review, Retrospective  
**Artifacts:** Sprint Backlog, Increment, Definition of Done  
**Roles:** Product Owner (what), Scrum Master (how), Dev Team (build)

### Program Level (10-week PI = 5 sprints)
**Ceremonies:** PI Planning (2-day), System Demo (bi-weekly), Inspect & Adapt  
**Artifacts:** Program Backlog, PI Objectives, Roadmap (3-4 PIs)  
**Roles:** RTE (facilitates), Product Mgmt (features), System Architect (tech)

### Portfolio Level (Quarterly)
**Practices:** Lean Portfolio Mgmt, Portfolio Kanban, WSJF, Capacity (70/20/10)  
**Artifacts:** Strategic themes, Portfolio canvas, Epic hypotheses, Lean business cases

## Prioritization: WSJF (Weighted Shortest Job First)

**Formula:** WSJF = (User-Business Value + Time Criticality + Risk Reduction) / Job Size

**Scoring (1-10 scale):**
- **User-Business Value:** How much value to users/business?
- **Time Criticality:** How time-sensitive is this?
- **Risk Reduction:** Does it reduce risk or enable other work?
- **Job Size:** How much effort? (smaller = higher score)

**Usage:** Prioritize backlog items by WSJF score (highest first)

**Example:**
```
Feature A: (8 + 5 + 3) / 5 = 3.2
Feature B: (6 + 8 + 7) / 3 = 7.0  ← Do this first
Feature C: (9 + 2 + 4) / 8 = 1.9
```

## Work Item Hierarchy

```
Portfolio Epic (months)
  └─ Feature (2-10 weeks)
      └─ User Story (2-5 days)
          └─ Task (hours)
```

**Epic:** Large initiative requiring multiple features  
**Feature:** Functionality delivered in 1-2 sprints  
**User Story:** Small, testable piece of functionality  
**Task:** Technical work to complete a story

## Templates

**User Story:**
```
As a [role] I want [capability] So that [value]
Acceptance: Given [context] When [action] Then [outcome]
DoD: Code complete, tests (80%+), reviewed, docs updated, deployed to test, criteria met
```

**Epic Hypothesis:**
```
For [users] Who [need] The [solution] Is a [category] That [benefit]
Unlike [competitor] Our product [differentiation]
Success: [measurable outcome 1], [outcome 2], [outcome 3]
```

## Quality & Metrics

**Built-In Quality:** TDD, pair programming, code reviews, static analysis, 80%+ coverage, ADRs, refactoring

**Flow Metrics:** Velocity (features/PI), Time (start→done), Load (WIP), Efficiency (active/total)

**DORA Metrics:** Deployment frequency, lead time, MTTR, change failure rate  
**Target:** Elite = multiple deploys/day, <1hr lead time

**Capacity:** 70% features, 20% enablers, 10% debt (adjust for maturity/debt/urgency)

**Risk:** Technical, schedule, cost, business, compliance → Avoid/Mitigate/Transfer/Accept  
**Spike:** Time-boxed research to reduce uncertainty

## DoR & DoD

**Ready:** Clear story, acceptance criteria, dependencies ID'd, estimated, prioritized (WSJF), no blockers  
**Done:** Code complete/reviewed, tests passing (unit/integration/BDD), docs updated, deployed to test, criteria met, PO accepted, no defects

## Continuous Improvement

**Sprint Retro (2 weeks):** What went well/didn't, what to improve, 1-3 action items  
**Inspect & Adapt (10 weeks):** PI demo, metrics review, team health, problem-solving, retro

## Anti-Patterns

❌ Skip Define → ✅ Validate problem first  
❌ BDUF → ✅ Emergent design  
❌ No tests → ✅ TDD/BDD day one  
❌ No monitoring → ✅ Observability built-in  
❌ Silos → ✅ Cross-functional teams  
❌ Output focus → ✅ Measure outcomes  
❌ 100% utilization → ✅ 70-80% capacity

## Team & Tools

**Team:** 5-9 people, full-stack, cross-functional, long-lived  
**Types:** Stream-aligned (features), Platform (services), Enabling (coaching), Complicated-subsystem (specialized)

**Tools:**
- Work: Azure DevOps/Jira, Miro/Mural
- Docs: `.kiro/specs/`, `docs/architecture/adr/`, Confluence
- Code: Git, GitHub/Azure DevOps, Pipelines/Actions
- Monitor: App Insights, Azure Monitor, Grafana

## Summary

**4D Phases:**
1. Define → Validate problem (requirements.md)
2. Design → Plan solution (design.md)
3. Develop → Build with quality (TDD/BDD)
4. Deploy → Deliver value (CI/CD + monitoring)

**SAFe Practices:**
- 2-week sprints (team level)
- 10-week PIs (program level)
- WSJF prioritization
- Built-in quality
- Flow metrics
- Continuous improvement

**Key Principles:**
- Outcomes over outputs
- Jobs-to-be-done (understand the problem)
- Built-in quality (TDD/BDD)
- Flow optimization (limit WIP)
- Continuous feedback (inspect & adapt)
- Cross-functional teams

**Golden Rule:** Validate the problem before designing the solution. Measure outcomes, not outputs.
