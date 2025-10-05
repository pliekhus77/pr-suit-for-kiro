---
inclusion: always
---

# Enterprise Architecture Strategy Questions

## Outstanding Questions

**Instructions:** When creating or reviewing specs (product.md, tech.md, requirements.md, design.md), if any TOGAF or Zachman questions below cannot be answered from available documentation, list them here with context about where the answer should come from.

**Format:**
```
- [ ] **Question Category - Specific Question**: Brief note on why this is unanswered and where to find the answer
```

**Example:**
```
- [ ] **Business Architecture - What business capabilities must this product enable?**: Not defined in product.md, needs stakeholder input
- [ ] **Data Model - What is the logical data model?**: Missing from design.md, requires data architect review
```

**Action:** Review and answer outstanding questions before proceeding to next phase. Clear this section once all questions are resolved.

---

## TOGAF & Zachman Questions for Product Development

### Product Planning Questions

#### TOGAF Architecture Vision (Phase A)
- **Business Architecture**: What business capabilities must this product enable?
- **Stakeholder Analysis**: Who are the key stakeholders and what are their concerns?
- **Business Goals**: How does this product align with enterprise strategy?
- **Scope Definition**: What are the boundaries of this product within the enterprise?
- **Success Criteria**: What measurable outcomes define product success?

#### Zachman Framework (Contextual Row)
- **What (Data)**: What business information does this product manage?
- **How (Function)**: What business processes does this product support?
- **Where (Network)**: What business locations/markets does this product serve?
- **Who (People)**: What business roles interact with this product?
- **When (Time)**: What business events trigger product usage?
- **Why (Motivation)**: What business drivers justify this product investment?

### Feature Planning Questions

#### TOGAF Business & Information Architecture (Phases B-C)
- **Business Services**: What business services must this feature provide?
- **Information Requirements**: What data does this feature need to consume/produce?
- **Integration Points**: How does this feature integrate with existing systems?
- **Compliance**: What regulatory/governance requirements affect this feature?
- **Performance**: What are the non-functional requirements for this feature?

#### Zachman Framework (Conceptual Row)
- **What (Entities)**: What business entities does this feature manipulate?
- **How (Processes)**: What business processes does this feature automate?
- **Where (Locations)**: Where will this feature be deployed/accessed?
- **Who (Organizations)**: What organizational units will use this feature?
- **When (Events)**: What business events does this feature handle?
- **Why (Business Rules)**: What business rules does this feature enforce?

### Feature Design Questions

#### TOGAF Technology Architecture (Phase D)
- **Technology Standards**: What technology standards must be followed?
- **Platform Requirements**: What platforms must this feature support?
- **Security Architecture**: What security controls are required?
- **Data Architecture**: How will data be structured, stored, and accessed?
- **Integration Patterns**: What integration patterns will be used?

#### Zachman Framework (Logical Row)
- **What (Data Model)**: What is the logical data model for this feature?
- **How (System Functions)**: What system functions implement business processes?
- **Where (System Architecture)**: What is the logical system distribution?
- **Who (User Interface)**: What are the user interaction patterns?
- **When (Processing Structure)**: What is the system processing flow?
- **Why (Business Rules)**: How are business rules implemented in the system?

#### Zachman Framework (Physical Row)
- **What (Data Design)**: What are the physical data structures?
- **How (Technology)**: What specific technologies will be used?
- **Where (Technology Architecture)**: What is the physical deployment model?
- **Who (Presentations)**: What are the specific user interfaces?
- **When (Control Structure)**: What is the system execution model?
- **Why (Rule Design)**: How are business rules coded/configured?

### System Monitoring Questions

#### TOGAF Implementation & Migration (Phases E-F)
- **Performance Monitoring**: How will we measure system performance against requirements?
- **Business Value**: How will we track business value delivery?
- **Risk Monitoring**: What risks need continuous monitoring?
- **Compliance Monitoring**: How will we ensure ongoing compliance?
- **Change Impact**: How will we monitor the impact of changes?

#### TOGAF Architecture Governance (Phases G-H)
- **Governance Metrics**: What governance metrics indicate architecture health?
- **Architecture Compliance**: How do we monitor adherence to architecture standards?
- **Change Management**: How do we track and approve architecture changes?
- **Capability Assessment**: How do we measure architecture capability maturity?

#### Zachman Framework (Operational Row)
- **What (Data)**: How do we monitor data quality, integrity, and availability?
- **How (Function)**: How do we monitor system function performance and reliability?
- **Where (Network)**: How do we monitor network performance and connectivity?
- **Who (People)**: How do we monitor user adoption and satisfaction?
- **When (Time)**: How do we monitor system timing, schedules, and SLAs?
- **Why (Motivation)**: How do we monitor achievement of business objectives?

### Cross-Cutting Monitoring Questions

#### Business Alignment
- Are we delivering the intended business value?
- How well does the system support business processes?
- What is the user adoption rate and satisfaction?

#### Technical Health
- What is the system availability and performance?
- How is the system scaling under load?
- What are the error rates and failure patterns?

#### Architecture Evolution
- How is the architecture adapting to changing requirements?
- What technical debt is accumulating?
- How well are architecture principles being followed?

#### Risk & Compliance
- What security incidents or vulnerabilities exist?
- Are we maintaining regulatory compliance?
- What operational risks need attention?

## Usage Guidelines

### Product Planning Phase (product.md)
Use TOGAF Phase A and Zachman Contextual questions to establish business context and strategic alignment before any development begins. Use the questions to ask follow up questions.

**Process:**
1. Review all Product Planning Questions above
2. Check if answers exist in product.md
3. Add unanswered questions to "Outstanding Questions" section at top
4. Gather answers from stakeholders
5. Update product.md with answers
6. Clear resolved questions from "Outstanding Questions"

### Feature Planning Phase (requirements.md)
Apply TOGAF Phases B-C and Zachman Conceptual questions to ensure features align with business architecture and information requirements.

**Process:**
1. Review all Feature Planning Questions above
2. Check if answers exist in requirements.md or product.md
3. Add unanswered questions to "Outstanding Questions" section at top
4. Gather answers from product owner/stakeholders
5. Update requirements.md with answers
6. Clear resolved questions from "Outstanding Questions"

### Feature Design Phase (design.md)
Leverage TOGAF Phase D and Zachman Logical/Physical questions to create robust technical designs that meet business needs.

**Process:**
1. Review all Feature Design Questions above
2. Check if answers exist in design.md, requirements.md, or tech.md
3. Add unanswered questions to "Outstanding Questions" section at top
4. Gather answers from architects/technical leads
5. Update design.md with answers
6. Clear resolved questions from "Outstanding Questions"

### System Monitoring Phase (operations)
Implement TOGAF Phases E-H and Zachman Operational questions to ensure ongoing system health and business value delivery.

**Process:**
1. Review all System Monitoring Questions above
2. Check if monitoring strategy exists in design.md or operations docs
3. Add unanswered questions to "Outstanding Questions" section at top
4. Define monitoring approach with DevOps team
5. Document monitoring strategy
6. Clear resolved questions from "Outstanding Questions"

### Outstanding Questions Workflow

**When creating/reviewing any spec document:**
1. Identify relevant EA questions for that phase
2. Attempt to answer from existing documentation (product.md, tech.md, requirements.md, design.md)
3. Add unanswered questions to "Outstanding Questions" section with:
   - Question category and specific question
   - Why it's unanswered (missing from which doc)
   - Who should provide the answer
4. Do not proceed to next phase until critical questions are answered
5. Update relevant documentation with answers
6. Remove resolved questions from "Outstanding Questions"

**Priority Levels:**
- **Critical (P0)**: Must answer before proceeding to next phase
- **Important (P1)**: Should answer before implementation
- **Nice-to-Have (P2)**: Can defer but document as technical debt

These questions ensure comprehensive coverage from strategic product vision through tactical implementation to operational excellence, leveraging both TOGAF's process-driven approach and Zachman's systematic interrogative framework.