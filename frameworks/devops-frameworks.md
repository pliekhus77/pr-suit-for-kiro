# DevOps Frameworks: The Three Ways and CALMS

## Overview

DevOps is the integration and automation of software development and IT operations. While there's no single "DevOps certification," two key frameworks help organizations understand and implement DevOps principles:

1. **The Three Ways** - Principles underpinning DevOps (Gene Kim)
2. **CALMS Framework** - Assessment and measurement framework (Jez Humble)

## CI/CD Platform Strategy

### GitHub Actions (Preferred Platform)

**Based on AWS Prescriptive Guidance and industry best practices:**

GitHub Actions is our **preferred CI/CD platform** for implementing DevOps practices, with Azure DevOps and Jenkins as approved alternatives.

#### Why GitHub Actions?

**AWS Integration Excellence:**
- Native AWS service integrations via official actions
- Seamless AWS SAM deployment workflows
- Built-in AWS credential management
- Support for multi-account DevOps environments

**Developer Experience:**
- Integrated with source code repository
- YAML-based workflow configuration
- Rich marketplace of pre-built actions
- Matrix builds for multiple environments

**Cost Effectiveness:**
- Free for public repositories
- Generous free tier for private repositories
- Pay-per-use pricing model
- No infrastructure management overhead

#### GitHub Actions Implementation

**Basic AWS Deployment Workflow:**
```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v3
      - uses: aws-actions/setup-sam@v2
      - uses: aws-actions/configure-aws-credentials@v1
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-2
      - run: sam build --use-container
      - run: sam deploy --no-confirm-changeset --no-fail-on-empty-changeset
```

**Multi-Environment Strategy:**
```yaml
name: Multi-Environment Deployment
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Tests
        run: npm test

  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    needs: test
    runs-on: ubuntu-latest
    environment: development
    steps:
      - name: Deploy to Development
        run: echo "Deploying to dev environment"

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: echo "Deploying to production environment"
```

#### GitHub Flow Branching Strategy

**Recommended Approach** (AWS Prescriptive Guidance):
- **Main branch:** Production-ready code
- **Feature branches:** Development work
- **Pull requests:** Code review and testing
- **Automated deployments:** On merge to main

**Workflow Process:**
1. Create feature branch from main
2. Develop and commit changes
3. Open pull request
4. Automated testing runs
5. Code review and approval
6. Merge to main triggers production deployment

### Alternative Platforms (Approved)

#### Azure DevOps
**When to Use:**
- Microsoft-centric technology stack
- Enterprise Azure integration requirements
- Advanced work item tracking needs

**Key Features:**
- Azure Pipelines for CI/CD
- Azure Boards for project management
- Azure Repos for source control
- Azure Artifacts for package management

#### Jenkins
**When to Use:**
- Existing Jenkins infrastructure
- Complex, custom build requirements
- On-premises deployment needs

**Key Features:**
- Extensive plugin ecosystem
- Self-hosted flexibility
- Custom pipeline scripting
- Enterprise-grade security

### Platform Selection Criteria

**Choose GitHub Actions when:**
- Using GitHub for source control
- Building cloud-native applications
- Need rapid setup and deployment
- Want integrated security scanning

**Choose Azure DevOps when:**
- Heavy Microsoft ecosystem usage
- Need advanced project management
- Require enterprise compliance features
- Building .NET applications

**Choose Jenkins when:**
- Need maximum customization
- Have complex build requirements
- Require on-premises deployment
- Have existing Jenkins expertise

---

## The Three Ways (Gene Kim)

### Overview

**Created By:** Gene Kim (author of The Phoenix Project, The DevOps Handbook, Accelerate)
**Purpose:** Describe the values and philosophies that frame DevOps processes, procedures, and practices

**Key Concept:** All DevOps patterns can be derived from these three fundamental principles.

---

### The First Way: Flow / Systems Thinking

#### Core Principle
Emphasize the performance of the **entire system**, not individual silos or departments.

#### Focus Areas

**Business Value Streams:**
- Begins when requirements are identified
- Built in Development
- Transitioned to IT Operations
- Delivered to customer as a service

**System-Wide Optimization:**
- Optimize the whole, not the parts
- Focus on end-to-end flow
- Consider downstream impacts

#### Key Outcomes

1. **Never Pass Defects Downstream**
   - Quality at the source
   - Stop the line when problems occur
   - Fix issues immediately

2. **Never Allow Local Optimization to Create Global Degradation**
   - Avoid sub-optimization
   - Consider system-wide impacts
   - Balance competing priorities

3. **Always Seek to Increase Flow**
   - Reduce batch sizes
   - Limit work in progress (WIP)
   - Eliminate bottlenecks
   - Reduce handoffs

4. **Achieve Profound Understanding of the System**
   - Systems thinking (Deming)
   - Understand dependencies
   - Map value streams
   - Identify constraints

#### Practices That Support First Way

- **Continuous Integration** - Integrate code frequently
- **Continuous Delivery** - Automate deployment pipeline
- **Small Batch Sizes** - Deploy smaller changes more frequently
- **Visible Work** - Kanban boards, dashboards
- **Limit WIP** - Reduce multitasking and context switching
- **Value Stream Mapping** - Identify waste and bottlenecks

#### Anti-Patterns to Avoid

- Throwing work "over the wall"
- Optimizing individual team metrics at expense of system
- Large batch deployments
- Long lead times
- Hidden work and dependencies

---

### The Second Way: Amplify Feedback Loops

#### Core Principle
Create **right-to-left feedback loops** to enable fast detection and recovery from problems.

#### Focus Areas

**Feedback at All Levels:**
- From production to development
- From customers to product teams
- From operations to developers
- From automated systems to humans

**Shorten and Amplify:**
- Make feedback fast
- Make feedback visible
- Make feedback actionable

#### Key Outcomes

1. **Understand and Respond to All Customers**
   - Internal customers (other teams)
   - External customers (end users)
   - Real-time feedback
   - Customer-centric mindset

2. **Shorten and Amplify All Feedback Loops**
   - Faster detection of problems
   - Quicker response times
   - Continuous improvement
   - Learning from failures

3. **Embed Knowledge Where Needed**
   - Documentation at point of use
   - Self-service capabilities
   - Automated checks and validations
   - Shared understanding

#### Practices That Support Second Way

- **Continuous Testing** - Automated test suites
- **Monitoring and Observability** - Real-time system health
- **Telemetry** - Comprehensive logging and metrics
- **A/B Testing** - Experiment and measure
- **Peer Review** - Code reviews, pair programming
- **Incident Response** - Blameless postmortems
- **Customer Feedback** - User analytics, surveys, support tickets

#### Feedback Loop Examples

**Fast Feedback:**
- Unit tests (seconds)
- Integration tests (minutes)
- Deployment validation (minutes)
- Monitoring alerts (real-time)

**Medium Feedback:**
- User acceptance testing (hours/days)
- Performance testing (hours/days)
- Security scanning (hours/days)

**Slow Feedback:**
- Customer satisfaction surveys (weeks/months)
- Business metrics (weeks/months)
- Market response (months)

#### Anti-Patterns to Avoid

- Delayed feedback (finding bugs weeks later)
- Ignored feedback (alerts that no one acts on)
- Blame culture (punishing messengers)
- Siloed information (feedback doesn't reach right people)

---

### The Third Way: Culture of Continual Experimentation and Learning

#### Core Principle
Foster a culture that encourages **experimentation, risk-taking, learning from failure**, and **mastery through practice**.

#### Two Essential Elements

**1. Experimentation and Risk-Taking**
- Push boundaries
- Try new approaches
- Accept that failure is part of learning
- Go into the "danger zone" to improve

**2. Repetition and Practice**
- Mastery requires practice
- Build muscle memory
- Develop skills to recover from failures
- Create safety through competence

#### Key Outcomes

1. **Allocate Time for Improvement of Daily Work**
   - Technical debt reduction
   - Process improvements
   - Tool enhancements
   - Learning and development

2. **Create Rituals That Reward Risk-Taking**
   - Celebrate experiments (even failures)
   - Share learnings openly
   - Recognize innovation
   - Psychological safety

3. **Introduce Faults to Increase Resilience**
   - Chaos engineering
   - Game days
   - Disaster recovery drills
   - Failure injection testing

#### Practices That Support Third Way

- **Chaos Engineering** - Netflix's Chaos Monkey
- **Game Days** - Simulated incidents
- **Blameless Postmortems** - Learn from failures
- **Innovation Time** - 20% time, hack days
- **Continuous Learning** - Training, conferences, books
- **Experimentation** - A/B tests, feature flags
- **Improvement Kata** - Structured improvement practice

#### Learning Culture Indicators

**Positive Signs:**
- Failures are learning opportunities
- Experiments are encouraged
- Time allocated for improvement
- Knowledge sharing is valued
- Psychological safety exists

**Warning Signs:**
- Blame culture
- Risk aversion
- No time for improvement
- Knowledge hoarding
- Fear of failure

#### Anti-Patterns to Avoid

- Punishing failure
- No time for learning
- Avoiding experimentation
- Repeating same mistakes
- Hero culture (relying on individuals)

---

## CALMS Framework (Jez Humble)

### Overview

**Created By:** Jez Humble (co-author of The DevOps Handbook, Continuous Delivery, Accelerate)
**Purpose:** Assess company's ability to adopt DevOps and measure success during transformation

**CALMS Stands For:**
- **C**ulture
- **A**utomation
- **L**ean
- **M**easurement
- **S**haring

---

### C - Culture

#### Core Principle
DevOps is fundamentally a **culture change**, not just a process or tooling change.

#### Key Aspects

**Collaboration Over Silos:**
- Break down walls between Dev and Ops
- Product-oriented teams (not function-based)
- Shared goals and responsibilities
- Cross-functional teams

**Team Structure:**
- Include: Dev, QA, Product, Design, Ops, PM
- Long-running product teams
- Shared ownership of outcomes
- "You build it, you run it"

#### Building DevOps Culture

**Start Small:**
- Invite Ops to Dev meetings (sprint planning, standups, demos)
- Invite Dev to Ops meetings
- Shared on-call rotation
- Joint problem-solving

**Scale Up:**
- Product-based teams across organization
- Open communication channels
- Shared responsibility for customer happiness
- DevOps becomes "just how we work"

#### Culture Tests

**Good Signs:**
- Teams swarm on problems together
- Blameless postmortems
- Focus on improving outcomes
- Shared success and failure
- Trust and mutual respect

**Warning Signs:**
- Finger-pointing
- Siloed decision-making
- "Not my job" mentality
- Blame culture
- Lack of collaboration

#### Key Quote
> "DevOps doesn't solve tooling problems. It solves human problems."

---

### A - Automation

#### Core Principle
Eliminate repetitive manual work, create repeatable processes, and build reliable systems.

#### Key Areas for Automation

**1. Build Automation**
- Automated compilation
- Dependency management
- Artifact creation
- Consistent builds

**2. Test Automation**
- Unit tests
- Integration tests
- End-to-end tests
- Security tests
- Performance tests

**3. Deployment Automation**
- Automated deployments
- Environment provisioning
- Configuration management
- Rollback capabilities

**4. Infrastructure Automation**
- Infrastructure as Code (IaC)
- Configuration as Code
- Immutable infrastructure
- Self-service provisioning

#### Continuous Delivery

**Pipeline Stages:**
1. Code commit
2. Automated build
3. Automated tests
4. Package artifact
5. Deploy to environments
6. Automated validation
7. Production deployment

**Benefits:**
- Computers execute tests more rigorously than humans
- Catch bugs and security flaws sooner
- Reduce surprises at release time
- Detect environment drift
- "Works on my machine" becomes irrelevant

#### Configuration as Code

**Principles:**
- Treat infrastructure like application code
- Version control everything
- Modular and composable
- Testable and repeatable
- Self-documenting

**Tools:**
- Terraform, CloudFormation, ARM templates
- Ansible, Chef, Puppet, Salt
- Docker, Kubernetes
- CI/CD: Jenkins, GitLab CI, GitHub Actions, Bitbucket Pipelines

---

### L - Lean

#### Core Principle
Eliminate waste, move quickly, embrace **continuous improvement** and **failure as learning**.

#### Lean Concepts in DevOps

**1. Continuous Improvement**
- Regular retrospectives
- Kaizen mindset
- Small, incremental changes
- Feedback-driven improvements

**2. Eliminate Waste**
- Reduce waiting time
- Minimize handoffs
- Remove unnecessary steps
- Focus on value-adding activities

**3. Fast Feedback**
- Short iteration cycles
- Rapid experimentation
- Quick validation
- Early customer feedback

**4. Embrace Failure**
- Failure is inevitable
- Learn from failures
- Build for fast detection
- Enable rapid recovery
- Anti-fragile systems

#### Agile Connection

**Agile Principles Applied:**
- Simple product today > perfect product in 6 months
- Continuous improvement over perfection
- Customer feedback drives development
- Adapt to change quickly

#### Failure Management

**Assumptions:**
- Things will go wrong
- Build for detection and recovery
- Blameless postmortems
- Focus on process improvement
- Not on individual blame

**Key Quote:**
> "If you're not failing once in a while, you're not trying hard enough."

---

### M - Measurement

#### Core Principle
Use data to prove improvements and make informed decisions.

#### What to Measure

**Basic Metrics (Start Here):**

1. **Lead Time**
   - Time from development to deployment
   - Measures flow efficiency

2. **Deployment Frequency**
   - How often you deploy
   - Measures agility

3. **Mean Time to Recovery (MTTR)**
   - How long to recover from failure
   - Measures resilience

4. **Change Failure Rate**
   - How often deployments cause failures
   - Measures quality

**User Metrics:**
- Active users (current)
- User growth/churn (weekly/monthly)
- Feature usage
- Customer journeys
- Session duration

**Business Metrics:**
- Conversion rates
- Revenue impact
- Customer satisfaction
- Support tickets
- SLA compliance

#### DORA Metrics

**Four Key Metrics** (from Accelerate book):
1. Deployment Frequency
2. Lead Time for Changes
3. Mean Time to Recovery
4. Change Failure Rate

**Added in 2021:**
5. Reliability (availability, performance)

#### Using Measurements

**Decision Making:**
- Data-driven roadmaps
- Prioritization based on impact
- Resource allocation
- Risk assessment

**Stakeholder Communication:**
- Share data across teams
- Build consensus with evidence
- Justify technical debt work
- Demonstrate value of improvements

**Continuous Improvement:**
- Track progress over time
- Identify trends
- Validate hypotheses
- Measure experiment outcomes

---

### S - Sharing

#### Core Principle
Share responsibility, success, knowledge, and tools to break down silos.

#### What to Share

**1. Responsibility**
- Shared ownership of outcomes
- "You build it, you run it"
- Collective accountability
- Cross-functional collaboration

**2. Success (and Failure)**
- Celebrate wins together
- Learn from failures together
- Shared metrics and goals
- Team-based rewards

**3. Knowledge**
- Documentation
- Runbooks
- Postmortems
- Best practices
- Lessons learned

**4. Tools and Practices**
- Common toolchains
- Shared platforms
- Reusable components
- Standard practices

#### Developer On-Call

**Rotating Role:**
- Developers carry the pager
- Handle production issues
- Create patches when needed
- Work through customer-reported defects

**Benefits:**
- Developers learn how app is used in production
- Build trust with operations
- Mutual respect between teams
- Better understanding of operational concerns

#### Peer Review

**Research Shows:**
- Peer-reviewed code results in better delivery and performance
- External reviewers no more effective than no review
- Collaboration improves quality

**Practices:**
- Code reviews
- Pair programming
- Mob programming
- Design reviews
- Architecture reviews

---

## Relationship Between Three Ways and CALMS

### Mapping the Frameworks

| Three Ways | CALMS | Focus |
|------------|-------|-------|
| **First Way: Flow** | Lean, Automation | Optimize system flow, eliminate waste |
| **Second Way: Feedback** | Measurement, Automation | Fast feedback loops, data-driven decisions |
| **Third Way: Learning** | Culture, Sharing | Experimentation, continuous improvement |
| **All Three Ways** | Culture | Collaboration, shared responsibility |

### Complementary Use

**Three Ways:**
- Philosophical foundation
- Principles to derive practices from
- "Why" of DevOps

**CALMS:**
- Assessment framework
- Practical implementation areas
- "What" and "How" of DevOps

**Together:**
- Three Ways provide principles
- CALMS provides structure for implementation
- Both emphasize culture as foundation

---

## Related DevOps Concepts

### DORA Metrics

**Four Key Metrics:**
1. Deployment Frequency
2. Lead Time for Changes
3. Change Failure Rate
4. Failed Deployment Recovery Time (formerly MTTR)

**Added 2021:**
5. Reliability

### Site Reliability Engineering (SRE)

**Google's Implementation of DevOps:**
- Error budgets
- Service Level Objectives (SLOs)
- Toil reduction
- Blameless postmortems
- Gradual rollouts

### DevSecOps

**Security Integration:**
- Shift security left
- Automated security testing
- Security as code
- Continuous compliance

### Platform Engineering

**Internal Developer Platforms:**
- Self-service capabilities
- Standardized tools
- Reusable components
- Reduced cognitive load

---

## GitHub Actions AWS Integration

### Security and Compliance

**AWS Security Best Practices with GitHub Actions:**

#### OIDC Authentication (Recommended)
```yaml
name: Deploy with OIDC
on:
  push:
    branches: [main]

permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789012:role/GitHubActionsRole
          aws-region: us-east-1
      - name: Deploy to AWS
        run: aws s3 sync ./dist s3://my-bucket
```

#### Security Scanning Integration
```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Amazon Inspector
        uses: aws-actions/amazon-inspector-scan-action@v1
        with:
          artifact-type: 'container'
          artifact-path: 'Dockerfile'
      - name: Run CodeGuru Reviewer
        uses: aws-actions/codeguru-reviewer@v1
        with:
          build_path: './src'
```

### Multi-Account Deployment Strategy

**Environment-Based Deployments:**
```yaml
name: Multi-Account Deployment
on:
  push:
    branches: [main, develop]

jobs:
  deploy-dev:
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    steps:
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.DEV_AWS_ROLE }}
          aws-region: us-east-1
      - name: Deploy to Development
        run: sam deploy --config-env dev

  deploy-prod:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    needs: [security-scan, integration-tests]
    steps:
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: ${{ secrets.PROD_AWS_ROLE }}
          aws-region: us-east-1
      - name: Deploy to Production
        run: sam deploy --config-env prod
```

### Monitoring and Observability

**CloudWatch Integration:**
```yaml
name: Deploy with Monitoring
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Application
        run: sam deploy
      - name: Create CloudWatch Dashboard
        run: |
          aws cloudwatch put-dashboard \
            --dashboard-name "MyApp-Dashboard" \
            --dashboard-body file://dashboard.json
      - name: Set up Alarms
        run: |
          aws cloudwatch put-metric-alarm \
            --alarm-name "HighErrorRate" \
            --alarm-description "Alert on high error rate" \
            --metric-name "Errors" \
            --namespace "AWS/Lambda" \
            --statistic "Sum" \
            --period 300 \
            --threshold 10 \
            --comparison-operator "GreaterThanThreshold"
```

### Cost Optimization

**GitHub Actions Cost Management:**
- Use self-hosted runners for long-running jobs
- Optimize workflow triggers (avoid unnecessary runs)
- Use matrix strategies efficiently
- Cache dependencies to reduce build times

**Example Optimized Workflow:**
```yaml
name: Optimized Build
on:
  push:
    branches: [main]
    paths: ['src/**', 'package.json']

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/cache@v3
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
      - run: npm ci
      - run: npm run build
```

---

## Implementation Roadmap

### Phase 1: Culture Foundation
1. Build cross-functional teams
2. Establish shared goals
3. Create psychological safety
4. Start collaboration practices

### Phase 2: Automation Basics
1. Implement CI/CD pipeline
2. Automate testing
3. Automate deployments
4. Infrastructure as Code

### Phase 3: Measurement
1. Define key metrics
2. Implement monitoring
3. Create dashboards
4. Establish baselines

### Phase 4: Lean Practices
1. Value stream mapping
2. Eliminate waste
3. Reduce batch sizes
4. Continuous improvement

### Phase 5: Sharing and Learning
1. Knowledge sharing practices
2. Blameless postmortems
3. Experimentation culture
4. Continuous learning

---

## Key Takeaways

### The Three Ways
1. **Flow** - Optimize the entire system, not parts
2. **Feedback** - Fast, amplified feedback loops
3. **Learning** - Experimentation and continuous improvement

### CALMS
1. **Culture** - Collaboration over silos
2. **Automation** - Eliminate manual toil
3. **Lean** - Continuous improvement, embrace failure
4. **Measurement** - Data-driven decisions
5. **Sharing** - Knowledge, responsibility, success

### Core Principles
- DevOps is primarily a culture change
- Automation enables but doesn't create DevOps
- Measurement proves improvement
- Sharing breaks down silos
- Continuous learning is essential
- Failure is a learning opportunity
- Systems thinking over local optimization

---

## Resources

### Books
- **The Phoenix Project** - Gene Kim (novel)
- **The DevOps Handbook** - Gene Kim, Jez Humble, Patrick Debois, John Willis
- **Accelerate** - Nicole Forsgren, Jez Humble, Gene Kim
- **The Unicorn Project** - Gene Kim (novel)
- **Continuous Delivery** - Jez Humble, David Farley

### Reports
- **State of DevOps Report** - Annual report by DORA
- Published since 2012
- Research-based metrics and findings

### Organizations
- **IT Revolution** - Gene Kim's company
- **DevOps Enterprise Summit** - Annual conference
- **DORA** - DevOps Research and Assessment

### Online Resources
- IT Revolution articles and blog
- Atlassian DevOps resources
- Google Cloud DevOps resources

---

## Conclusion

The Three Ways and CALMS provide complementary frameworks for understanding and implementing DevOps. The Three Ways offer philosophical principles that underpin all DevOps practices, while CALMS provides a practical structure for assessment and implementation.

Both frameworks emphasize that DevOps is fundamentally about culture change - breaking down silos, fostering collaboration, and creating an environment where continuous improvement and learning are valued. Automation, measurement, and lean practices are enablers, but without the cultural foundation, they won't deliver the full benefits of DevOps.

Success in DevOps requires commitment to all aspects: building collaborative culture, automating repetitive work, embracing lean principles, measuring outcomes, and sharing knowledge and responsibility across teams.
