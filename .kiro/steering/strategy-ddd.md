# Domain-Driven Design (DDD) Strategy Guide

## Purpose
Define when and how to apply DDD patterns for complex business domains. Use DDD for competitive advantage in core domains, not simple CRUD applications.

## When to Use DDD

| Use DDD | Don't Use DDD |
|---------|---------------|
| Complex business logic, rich domain rules | Simple CRUD applications |
| Business-critical systems, competitive advantage | Data entry forms, minimal validation |
| Access to domain experts, collaborative teams | Technical utilities, infrastructure tools |
| Long-lived systems, evolving requirements | Prototypes, proof of concepts, short-term projects |
| Multiple teams, large systems | Small teams, simple domains |

**Golden Rule:** Use DDD only for complex domains where the model provides clear benefits in formulating common understanding.

## Three Pillars

### 1. Ubiquitous Language
**Shared vocabulary between business and technical teams**

Use domain terms in class/method/variable names, eliminate translation, document in glossary, refine continuously

### 2. Strategic Design
**High-level organization and boundaries**

**Bounded Context:** Specific boundary where a domain model is consistent and valid
- Each context has its own model
- Same term can mean different things in different contexts
- Explicit boundaries prevent model confusion

**Example:**
- Sales Context: "Customer" = potential buyer with contact info
- Support Context: "Customer" = existing user with support history
- Billing Context: "Customer" = account with payment information

**Subdomains:**
- **Core Domain:** Competitive advantage, invest heavily, custom development
- **Supporting Subdomain:** Necessary but not differentiating, moderate investment
- **Generic Subdomain:** Common across industries (auth, logging), use existing solutions

### 3. Tactical Design
**Implementation patterns and building blocks**

## Tactical Patterns

| Pattern | Definition | When to Use |
|---------|------------|-------------|
| **Entity** | Object defined by identity, not attributes | Unique identifier, attributes change over time (Customer, Order) |
| **Value Object** | Immutable object defined by attributes | No identity, interchangeable (Money, Address, Email) |
| **Aggregate** | Cluster of objects with one root entity | Transaction boundary, consistency enforcement (Order + OrderLines) |
| **Repository** | Collection-like interface for retrieving domain objects | Abstract data access, domain-oriented queries |
| **Factory** | Creates complex domain objects | Encapsulate creation logic, ensure valid objects |
| **Domain Service** | Stateless operation not belonging to any object | Coordinates multiple aggregates, implements domain logic |



## Context Mapping Patterns

| Pattern | Use Case | Description |
|---------|----------|-------------|
| **Partnership** | Two teams succeed/fail together | Coordinated planning, mutual dependency |
| **Shared Kernel** | Small shared subset | Explicit boundary, changes require coordination |
| **Customer/Supplier** | Clear upstream-downstream | Downstream is customer, negotiated interface |
| **Anticorruption Layer (ACL)** | Protect from upstream changes | Translation layer, maintains model integrity |
| **Open-Host Service** | Integrate with many others | Standardized API, well-documented |
| **Separate Ways** | No connection needed | Independent solutions, duplication acceptable |

## Domain Events

**Domain Events:** Internal to bounded context, lighter payloads  
**Integration Events:** Cross-context communication, heavier payloads

## CQRS (Command Query Responsibility Segregation)

**Separate read (queries) from write (commands)**

Commands invoke aggregate root methods → validate → publish domain events → update read models

## Event Sourcing

**Store events instead of current state:** Complete audit trail, rebuild state from events, time travel, event-driven integration

## Layered Architecture

**Layers:** UI (controllers, DTOs) → Application (use cases, transactions) → Domain (entities, no dependencies) → Infrastructure (repositories, database)

**Dependency Rule:** Inner layers don't depend on outer layers

## Hexagonal Architecture

**Components:** Domain Core (pure logic) → Ports (interfaces) → Adapters (implementations) → Application Services (orchestration)

**Benefits:** Technology adaptability, testable domain logic, clear separation

## Mapping to Microservices

**Bounded Context to Microservice:**
- **One-to-One (Ideal):** Each bounded context = one microservice
- **One-to-Many:** Split context for different scalability needs
- **Many-to-One:** Multiple small contexts in one service (simplicity)

**Considerations:** Business goals, technical constraints, operational requirements, team structure

## Event Storming

**Collaborative workshop:** Gather stakeholders, use color-coded sticky notes (Orange=events, Blue=commands, Yellow=aggregates, Pink=external, Purple=policies, Red=issues), map chronologically, discover bounded contexts

## Implementation Steps

1. **Discover Domain:** Interview experts, event storming, identify core domain
2. **Define Ubiquitous Language:** Create glossary, document terms, use in conversations
3. **Identify Bounded Contexts:** Find boundaries, define context maps, establish integration patterns
4. **Model Aggregates:** Identify entities/value objects, define boundaries, establish invariants
5. **Implement Tactical Patterns:** Create repositories, factories, services, domain events
6. **Iterate and Refine:** Continuous learning, refactor as understanding grows

## AWS Implementation

**AWS Well-Architected Guidance:** Build services focused on specific business domains and functionality (REL03-BP02)

**AWS Benefits:**
- Independent reliability per bounded context
- Fault isolation through encapsulation
- Independent scaling per domain service

**AWS Services:**
- **Compute:** Lambda (domain services), ECS/EKS (bounded contexts)
- **Data:** DynamoDB (event sourcing), RDS (complex models), purpose-built databases
- **Integration:** EventBridge (domain events), SNS/SQS (async messaging), API Gateway (service contracts)

**AWS Anti-Patterns:**
- Teams formed around technical domains (UI, middleware, DB) instead of business domains
- Applications spanning domain responsibilities across bounded contexts
- Shared domain dependencies requiring coordinated changes
- Service contracts lacking common business language

## Azure Implementation

**Azure Services:**
- **Compute:** App Service (web apps), Container Apps (microservices), Functions (domain services)
- **Data:** Azure SQL (relational), Cosmos DB (event sourcing), purpose-built databases
- **Integration:** Event Grid (domain events), Service Bus (messaging), API Management (service contracts)

## Testing Strategy

**Unit Tests:** Domain logic without infrastructure dependencies (mock adapters)  
**Integration Tests:** Aggregate interactions, repository implementations  
**BDD Tests:** Business scenarios in ubiquitous language (Given-When-Then)

## Common Mistakes

❌ Using DDD for simple CRUD → ✅ Use only for complex domains  
❌ No domain expert access → ✅ Collaborate continuously  
❌ Anemic domain model → ✅ Rich domain logic in entities/aggregates  
❌ Shared database across contexts → ✅ Database per bounded context  
❌ Technical language in code → ✅ Ubiquitous language everywhere  
❌ Large aggregates → ✅ Small, focused aggregates  
❌ Ignoring bounded contexts → ✅ Explicit context boundaries

## Benefits

**Business:** Software matches business needs, shared language, flexibility, focus on core domain  
**Technical:** Maintainability, testability, scalability, modularity  
**Team:** Collaboration, embedded domain knowledge, autonomy, quality

## Anti-Patterns

**Organizational:**
- Teams organized by technical layers (UI, API, DB) instead of business domains
- No access to domain experts
- Skipping ubiquitous language definition

**Technical:**
- Anemic domain model (entities with only getters/setters, logic in services)
- Large aggregates (performance issues, complex transactions)
- Shared database across bounded contexts
- No anticorruption layer when integrating with legacy systems

**Process:**
- Big design upfront (BDUF) instead of iterative refinement
- No event storming or domain discovery
- Ignoring bounded context boundaries

## Summary

**Core Concepts:**
1. **Ubiquitous Language:** Shared vocabulary between business and tech
2. **Bounded Contexts:** Divide large systems into manageable contexts
3. **Strategic Design:** High-level organization (subdomains, context mapping)
4. **Tactical Design:** Implementation patterns (entities, aggregates, repositories)
5. **Domain Events:** Track what happened, enable integration
6. **CQRS:** Separate read and write models
7. **Event Sourcing:** Store events instead of state

**When to Use:**
- Complex business logic
- Business-critical systems
- Access to domain experts
- Long-lived systems

**When NOT to Use:**
- Simple CRUD applications
- Technical utilities
- Prototypes
- No domain expert access

**Implementation:**
- Start with event storming
- Define ubiquitous language
- Identify bounded contexts
- Model aggregates
- Implement tactical patterns
- Iterate and refine

**Golden Rule:** DDD is about understanding the business domain and modeling software to match it. Use only when complexity justifies the investment. Focus on core domain, use off-the-shelf for generic subdomains.
