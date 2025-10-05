---
inclusion: always
---

# C4 Model Strategy Guide

## Purpose
Define when and where to use C4 diagrams in the development lifecycle.

## Diagram Placement Rules

| Diagram Type | Location | When | Audience | Update Trigger |
|--------------|----------|------|----------|----------------|
| System Context | `product.md` | Project inception | All stakeholders | Scope changes |
| System Landscape | `product.md` | Multi-system projects | Leadership, architects | New system added |
| Container | `specs/{feature}/design.md` | Feature design | Technical team | Architecture changes |
| Component | `specs/{feature}/design.md` | Complex containers | Developers | Major refactoring |
| Dynamic | `specs/{feature}/design.md` | Complex workflows | Developers | Flow changes |
| Deployment | `docs/architecture/` | Infrastructure planning | DevOps, operations | Environment changes |

## Core Rules by Diagram Type

### System Context
**Location:** `product.md` | **Audience:** All stakeholders

**Include:** System (1 box), users (stick figures), external systems (gray boxes), labeled relationships  
**Exclude:** Internal components, infrastructure, deployment, technology choices  
**Update:** Scope changes, new integrations, user type changes

### System Landscape
**Location:** `product.md` | **Audience:** Leadership, architects

**Include:** Multiple systems, system relationships, shared externals, groupings  
**Exclude:** Internal details, infrastructure, detailed integrations  
**Update:** New systems added, system relationships change

### Container
**Location:** `specs/{feature}/design.md` | **Audience:** Technical team

**Include:** Apps, APIs, databases, message brokers, tech stack, protocols  
**Exclude:** Internal components (use Component), replicas, load balancers, code details  
**Update:** New containers, technology changes, communication pattern changes

### Component
**Location:** `specs/{feature}/design.md` | **Audience:** Developers

**Include:** Major components, controllers/services/repositories, responsibilities, patterns  
**Exclude:** Every class/file, code implementation, multiple containers, infrastructure  
**Update:** Major refactoring, significant components added  
**Note:** Only create for complex containers

### Dynamic
**Location:** `specs/{feature}/design.md` | **Audience:** Developers

**Include:** Numbered steps, involved containers/components, decision points, error handling  
**Exclude:** Every possible path, implementation details, code logic  
**Update:** Workflow changes, error handling added

### Deployment
**Location:** `docs/architecture/deployment/` | **Audience:** DevOps, operations

**Include:** Deployment nodes, container instances, network boundaries, infrastructure services  
**Exclude:** Code details, component internals, dev environment (unless documenting)  
**Update:** Infrastructure changes, new environments

## Development Process Integration

### Requirements Phase (`specs/{feature}/requirements.md`)
- Reference System Context for scope
- Identify affected containers
- Note external integration points
- **Do NOT:** Create detailed diagrams or make technology decisions

### Design Phase (`specs/{feature}/design.md`)
**Required:** Container diagram + descriptions  
**Optional:** Component (complex containers), Dynamic (complex workflows)  
**Include:** Technology decisions, communication patterns

### Implementation Phase
- Reference design diagrams
- Update if implementation reveals issues
- **Do NOT:** Create Code-level diagrams (IDE generates these)

### Review Phase (ADRs)
- Include relevant diagrams
- Show before/after for changes
- Reference when explaining decisions

## Quality Standards

**All diagrams must have:**
- Clear title (type + scope)
- Legend (colors, shapes, lines)
- Labeled relationships with protocols
- Last update date
- Owner/maintainer

**Validation checklist:**
- Target audience can understand without explanation
- Answers specific architectural question
- Correct abstraction level
- Clean, readable layout
- Up to date with current architecture

## Common Mistakes

**Wrong Location:**
- ❌ Container diagrams in product.md → ✅ In feature design specs
- ❌ System Context in feature specs → ✅ In product.md

**Wrong Detail Level:**
- ❌ Internal components in System Context → ✅ Focus on system boundary
- ❌ Every class in Component → ✅ Only major components

**Wrong Timing:**
- ❌ Container diagrams before requirements → ✅ During design phase
- ❌ Diagrams after code written → ✅ During design to guide implementation

**Maintenance:**
- ❌ Create and never update → ✅ Update when architecture changes
- ❌ Duplicate what code shows → ✅ Focus on high-level structure

## Mermaid Standards

**Color Scheme:**
- System in scope: `#1168bd` (blue)
- People/Users: `#08427b` (dark blue)
- External systems: `#999999` (gray)
- Databases: `#438dd5` (light blue)

**Required:** Node labels (type + description), directional arrows with labels, consistent styling, legend

## When to Skip Diagrams

- **System Context:** Small internal tool, no external integrations, obvious scope
- **Container:** Single monolith + database, trivial architecture, very small team
- **Component:** Simple container, self-explanatory code, team prefers code docs
- **Dynamic:** Straightforward workflow, obvious from Container diagram
- **Code:** Always skip (IDEs generate, becomes outdated immediately)

## Approval Requirements

| Diagram | Approvers |
|---------|-----------|
| System Context | Product owner + architect |
| Container | Technical lead + architect |
| Component | Technical lead |
| Dynamic | Developer + technical lead |
| Deployment | DevOps + architect |

## Tools

**Preferred:** Mermaid (version controlled, renders in markdown, easy to update)  
**Alternative:** Structurizr DSL (code-based, automatic layout, large systems)  
**Avoid:** Visio, Lucidchart, PowerPoint, whiteboard photos (hard to maintain)

## Summary

1. System Context → `product.md` (project-wide)
2. Container/Component/Dynamic → `specs/{feature}/design.md` (feature-specific)
3. Deployment → `docs/architecture/deployment/` (infrastructure)
4. Create during design, not after implementation
5. Update when architecture changes
6. Keep at correct abstraction level
7. Skip diagrams that don't add value

**Golden Rule:** If you can't explain why a diagram is needed and who will use it, don't create it.
