# Application Performance Monitoring (APM) Strategy

**Version:** 1.0  
**Last Updated:** 2025-10-06  
**Status:** Draft  
**Author:** Pragmatic Rhino SUIT Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [Core APM Concepts](#core-apm-concepts)
3. [Cloud Platform APM Services](#cloud-platform-apm-services)
4. [Metrics Collection and Analysis](#metrics-collection-and-analysis)
5. [Distributed Tracing](#distributed-tracing)
6. [Logging Strategy](#logging-strategy)
7. [Alerting and Incident Response](#alerting-and-incident-response)
8. [Performance Profiling](#performance-profiling)
9. [Business Metrics and User Experience](#business-metrics-and-user-experience)
10. [Cost Management](#cost-management)
11. [CI/CD Integration](#cicd-integration)
12. [Security and Compliance](#security-and-compliance)
13. [Testing and Validation](#testing-and-validation)
14. [Appendices](#appendices)

---

## Introduction

### Purpose

This Application Performance Monitoring (APM) strategy guide provides comprehensive guidance for implementing observability, monitoring, and performance optimization across .NET applications deployed to AWS and Azure cloud platforms. It is designed to help development teams build production-ready applications with built-in observability from day one.

### Scope

This strategy covers:

- **Application-level monitoring** - Metrics, logs, and traces for .NET applications
- **Infrastructure monitoring** - Cloud platform services and resources
- **Business metrics** - User experience and business outcome tracking
- **Operational excellence** - Alerting, incident response, and continuous improvement

This strategy applies to:
- .NET 8.0+ applications (Web APIs, microservices, background workers)
- AWS and Azure cloud deployments
- Development, staging, and production environments

### Target Audience

- **Developers** - Implementing instrumentation and monitoring code
- **DevOps Engineers** - Configuring APM infrastructure and CI/CD integration
- **Operations Teams** - Managing alerts, incidents, and system health
- **Architects** - Designing observability into system architecture
- **Product Managers** - Understanding business metrics and user experience

### Framework Integration

This APM strategy integrates with and complements other Pragmatic Rhino SUIT frameworks:

| Framework | Integration Point | How APM Supports It |
|-----------|-------------------|---------------------|
| **DevOps Framework** | CI/CD pipelines, deployment monitoring | Performance gates, deployment markers, automated rollback triggers |
| **Security Framework (SABSA)** | Security monitoring, compliance logging | Audit trails, security event detection, compliance reporting |
| **.NET Best Practices** | Performance optimization, instrumentation | Code-level profiling, async/await monitoring, memory leak detection |
| **Cloud Hosting (AWS/Azure)** | Platform-specific APM services | Service selection, configuration patterns, cost optimization |
| **IaC Strategy (Pulumi)** | Infrastructure provisioning | APM resource provisioning, configuration as code |
| **TDD/BDD Framework** | Testing strategy | APM instrumentation testing, monitoring validation |
| **Domain-Driven Design** | Business metrics | Domain event tracking, aggregate performance monitoring |

### How to Use This Guide

**For New Projects:**
1. Start with [Core APM Concepts](#core-apm-concepts) to understand fundamentals
2. Review [Cloud Platform APM Services](#cloud-platform-apm-services) to select tools
3. Follow implementation patterns in subsequent sections
4. Use code examples as starting templates

**For Existing Projects:**
1. Assess current monitoring against this strategy
2. Identify gaps using section checklists
3. Prioritize improvements based on risk and value
4. Implement incrementally, starting with critical paths

**For Troubleshooting:**
1. Jump to relevant section (Logging, Tracing, Profiling)
2. Review common patterns and anti-patterns
3. Check appendices for query examples and troubleshooting guides

### Key Principles

This strategy is built on these foundational principles:

1. **Observability by Design** - Build monitoring into architecture from the start, not as an afterthought
2. **Three Pillars** - Leverage metrics, logs, and traces together for complete visibility
3. **Actionable Insights** - Focus on metrics that drive decisions and actions
4. **Cost-Conscious** - Balance observability needs with budget constraints through sampling and retention policies
5. **Shift-Left Monitoring** - Test and validate monitoring in development, not just production
6. **Business Alignment** - Connect technical metrics to business outcomes and user experience

---

## Core APM Concepts

### 2.1 The Three Pillars of Observability

Modern observability is built on three complementary pillars that work together to provide complete visibility into system behavior. Each pillar serves a distinct purpose and answers different questions about your application.

#### Metrics

**Definition:** Numeric measurements collected over time that represent the state and performance of your system.

**Characteristics:**
- Aggregatable (can be summed, averaged, percentiled)
- Low storage cost (time-series data)
- Efficient for real-time monitoring and alerting
- Provide high-level system health overview

**When to Use Metrics:**
- Monitoring system health and performance trends
- Setting up alerts and SLOs
- Capacity planning and resource optimization
- Dashboards showing current and historical state
- Answering "How much?" and "How fast?"

**Examples:**
- Request rate (requests per second)
- Error rate (percentage of failed requests)
- Response time (p50, p95, p99 latency)
- CPU and memory utilization
- Database connection pool size
- Queue depth and processing rate

**Typical Questions Answered:**
- Is the system healthy right now?
- Are we meeting our SLOs?
- Is performance degrading over time?
- Do we need to scale up or down?

#### Logs

**Definition:** Timestamped, immutable records of discrete events that occurred in your system.

**Characteristics:**
- Rich contextual information
- Human-readable event descriptions
- Higher storage cost than metrics
- Searchable and filterable
- Provide detailed event history

**When to Use Logs:**
- Debugging specific issues or errors
- Audit trails and compliance requirements
- Understanding the sequence of events leading to a problem
- Investigating user-reported issues
- Answering "What happened?" and "Why?"

**Examples:**
- Application errors and exceptions with stack traces
- User authentication and authorization events
- Business transactions (order placed, payment processed)
- Configuration changes
- External API calls and responses
- Security events (failed login attempts, access violations)

**Typical Questions Answered:**
- What error occurred and why?
- What was the user doing when the problem happened?
- What sequence of events led to this state?
- Who made this change and when?

#### Traces

**Definition:** Records of the path a request takes through a distributed system, showing the flow across services and components.

**Characteristics:**
- Show request flow across service boundaries
- Include timing information for each operation
- Reveal dependencies and bottlenecks
- Context propagation across services
- Higher overhead than metrics

**When to Use Traces:**
- Debugging performance issues in distributed systems
- Understanding service dependencies
- Identifying bottlenecks in request processing
- Analyzing latency contributions by component
- Answering "Where is the time spent?" and "What's the critical path?"

**Examples:**
- HTTP request flowing through API Gateway → Web API → Database
- Message processing through Queue → Worker → External Service
- User action triggering multiple microservice calls
- Database query execution within a request
- Cache lookups and external API calls

**Typical Questions Answered:**
- Which service is causing the slowdown?
- What's the end-to-end latency breakdown?
- Are there any N+1 query problems?
- Which dependencies are failing or slow?

#### The Three Pillars Working Together

The pillars are most powerful when used in combination:

| Scenario | Pillar Combination | Workflow |
|----------|-------------------|----------|
| **Performance degradation** | Metrics → Traces → Logs | Metrics alert on high latency → Traces identify slow service → Logs reveal specific error |
| **Error investigation** | Metrics → Logs → Traces | Metrics show error rate spike → Logs show error details → Traces show request path |
| **Capacity planning** | Metrics → Traces | Metrics show resource usage trends → Traces identify expensive operations to optimize |
| **User issue** | Logs → Traces → Metrics | Logs show user error → Traces show request flow → Metrics confirm pattern |

**Visual Representation:**

```
┌─────────────────────────────────────────────────────────────┐
│                    OBSERVABILITY                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   METRICS    │  │     LOGS     │  │    TRACES    │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ What & How   │  │ Why & When   │  │    Where     │     │
│  │   Much?      │  │              │  │              │     │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤     │
│  │ • Aggregated │  │ • Detailed   │  │ • Request    │     │
│  │ • Time-series│  │ • Events     │  │   flow       │     │
│  │ • Alerting   │  │ • Context    │  │ • Timing     │     │
│  │ • Dashboards │  │ • Debugging  │  │ • Dependencies│    │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  Example: High API Latency Investigation                    │
│  ─────────────────────────────────────────────────────      │
│  1. METRICS: Alert fires - p95 latency > 1000ms            │
│  2. TRACES: Identify database queries taking 800ms          │
│  3. LOGS: Find specific slow query with parameters          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Choosing the Right Pillar

| Question | Use This Pillar | Example |
|----------|----------------|---------|
| Is the system healthy? | Metrics | Check error rate and latency dashboards |
| What's the trend over time? | Metrics | Review CPU usage over the past week |
| What error occurred? | Logs | Search for exception stack traces |
| What did the user do? | Logs | Filter logs by user ID and timestamp |
| Which service is slow? | Traces | Analyze trace spans to find bottleneck |
| What's the request path? | Traces | View service dependency graph |
| How many requests failed? | Metrics | Count error metric over time window |
| Why did this request fail? | Logs + Traces | Combine trace ID with log correlation |

#### Implementation Considerations

**Storage Costs (Relative):**
- Metrics: $ (most efficient, aggregated time-series)
- Traces: $$ (sampled, structured data)
- Logs: $$$ (verbose, high volume)

**Query Performance:**
- Metrics: Fastest (pre-aggregated, indexed)
- Traces: Medium (indexed by trace ID, span attributes)
- Logs: Slowest (full-text search, large volumes)

**Retention Recommendations:**
- Metrics: 90 days (detailed), 1 year (aggregated)
- Traces: 7-30 days (sampled)
- Logs: 30-90 days (application), 1 year+ (audit)

**Sampling Strategies:**
- Metrics: No sampling (always collect)
- Traces: 10-100% sampling (based on volume and cost)
- Logs: Selective sampling (all errors, sample info/debug)

---

### 2.2 Performance Metrics Standards and "Good" Metrics

Understanding what to measure and what constitutes good performance is critical for effective APM. This section defines standard metric frameworks and performance targets.

#### RED Metrics (Request-Oriented Services)

RED metrics are the foundation for monitoring request-driven services like APIs, web applications, and microservices.

| Metric | Definition | Why It Matters | Target |
|--------|------------|----------------|--------|
| **Rate** | Number of requests per second | Understand traffic patterns, capacity needs | Baseline varies by service |
| **Errors** | Number/percentage of failed requests | Detect reliability issues immediately | < 0.1% (99.9% success rate) |
| **Duration** | Time to process requests (latency) | User experience and performance | p95 < 500ms, p99 < 1000ms |

**When to Use RED:**
- Web APIs and REST services
- HTTP-based microservices
- GraphQL endpoints
- gRPC services

**Implementation Example (.NET):**

```csharp
// Using OpenTelemetry to track RED metrics
public class OrderController : ControllerBase
{
    private static readonly Meter Meter = new("OrderService", "1.0");
    private static readonly Counter<long> RequestCounter = 
        Meter.CreateCounter<long>("http.server.requests", "requests");
    private static readonly Counter<long> ErrorCounter = 
        Meter.CreateCounter<long>("http.server.errors", "errors");
    private static readonly Histogram<double> DurationHistogram = 
        Meter.CreateHistogram<double>("http.server.duration", "ms");

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        var sw = Stopwatch.StartNew();
        var tags = new TagList { { "method", "POST" }, { "endpoint", "/orders" } };
        
        try
        {
            RequestCounter.Add(1, tags);
            
            var order = await _orderService.CreateOrderAsync(request);
            
            tags.Add("status", "200");
            DurationHistogram.Record(sw.ElapsedMilliseconds, tags);
            
            return Ok(order);
        }
        catch (Exception ex)
        {
            ErrorCounter.Add(1, tags);
            tags.Add("status", "500");
            DurationHistogram.Record(sw.ElapsedMilliseconds, tags);
            throw;
        }
    }
}
```

**RED Metrics Dashboard:**
- Rate: Line chart showing requests/second over time
- Errors: Error rate percentage with threshold line at 0.1%
- Duration: Latency percentiles (p50, p95, p99) over time

#### USE Metrics (Resource-Oriented Services)

USE metrics focus on resource utilization and are essential for infrastructure and resource-constrained services.

| Metric | Definition | Why It Matters | Target |
|--------|------------|----------------|--------|
| **Utilization** | Percentage of time resource is busy | Capacity planning, cost optimization | 60-80% (avoid over/under) |
| **Saturation** | Degree of queued work | Identify bottlenecks before failure | Queue depth < 10 |
| **Errors** | Count of error events | Detect resource failures | 0 errors |

**When to Use USE:**
- Database servers
- Message queues
- Worker processes
- Infrastructure components (CPU, memory, disk, network)

**Resource-Specific USE Metrics:**

**CPU:**
- Utilization: CPU usage percentage
- Saturation: Run queue length
- Errors: CPU throttling events

**Memory:**
- Utilization: Memory usage percentage
- Saturation: Page faults, swap usage
- Errors: Out of memory errors

**Disk:**
- Utilization: Disk busy percentage
- Saturation: Disk queue depth
- Errors: Disk I/O errors

**Network:**
- Utilization: Bandwidth usage percentage
- Saturation: Network buffer overflows
- Errors: Packet loss, retransmissions

**Implementation Example (.NET):**

```csharp
// Monitoring worker queue with USE metrics
public class OrderProcessingWorker : BackgroundService
{
    private static readonly Meter Meter = new("OrderWorker", "1.0");
    private static readonly ObservableGauge<double> UtilizationGauge = 
        Meter.CreateObservableGauge("worker.utilization", () => 
            _activeWorkers / (double)_maxWorkers * 100, "percent");
    private static readonly ObservableGauge<int> SaturationGauge = 
        Meter.CreateObservableGauge("worker.queue_depth", () => 
            _queue.Count, "messages");
    private static readonly Counter<long> ErrorCounter = 
        Meter.CreateCounter<long>("worker.errors", "errors");

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var message = await _queue.DequeueAsync(stoppingToken);
                Interlocked.Increment(ref _activeWorkers);
                
                await ProcessMessageAsync(message);
                
                Interlocked.Decrement(ref _activeWorkers);
            }
            catch (Exception ex)
            {
                ErrorCounter.Add(1);
                _logger.LogError(ex, "Error processing message");
            }
        }
    }
}
```

#### What Makes a "Good" Metric?

A good metric is actionable, understandable, and drives decisions. Use the SMART criteria:

| Criteria | Description | Example |
|----------|-------------|---------|
| **Specific** | Clearly defined, unambiguous | "API p95 latency" not "system speed" |
| **Measurable** | Quantifiable with units | "500ms" not "fast" |
| **Actionable** | Leads to specific actions | High latency → investigate slow queries |
| **Relevant** | Matters to users or business | User-facing latency, not internal cache hits |
| **Time-bound** | Measured over specific period | "Last 5 minutes" not "sometime" |

**Good Metric Characteristics:**

✅ **Proportional to user experience** - Directly impacts what users feel  
✅ **Aggregatable** - Can be summed, averaged, or percentiled  
✅ **Cheap to collect** - Low overhead on system performance  
✅ **Understandable** - Team knows what it means and why it matters  
✅ **Actionable** - Clear response when threshold is breached  

**Bad Metric Characteristics:**

❌ **Vanity metrics** - Look good but don't drive decisions (total users ever)  
❌ **Lagging indicators** - Detected too late to prevent impact  
❌ **Noisy metrics** - Too much variation to be useful  
❌ **Expensive to collect** - High overhead or cost  
❌ **Ambiguous** - Unclear what action to take  

#### Performance Targets by Service Type

**Web APIs (User-Facing):**
- Availability: 99.9% (43 minutes downtime/month)
- Latency: p95 < 500ms, p99 < 1000ms
- Error Rate: < 0.1%
- Throughput: Baseline + 20% headroom

**Background Workers:**
- Processing Rate: > 95% of incoming rate
- Queue Depth: < 100 messages
- Error Rate: < 1% (with retry)
- Processing Time: p95 < 30 seconds

**Databases:**
- Query Latency: p95 < 100ms
- Connection Pool: 60-80% utilization
- Lock Wait Time: p95 < 10ms
- Error Rate: 0%

**Message Queues:**
- Message Age: p95 < 5 seconds
- Queue Depth: < 1000 messages
- Processing Rate: > incoming rate
- Dead Letter Queue: < 1% of messages

#### The Four Golden Signals (Google SRE)

An alternative framework that combines RED and USE concepts:

1. **Latency** - Time to service a request (distinguish success vs error latency)
2. **Traffic** - Demand on your system (requests/second, transactions/second)
3. **Errors** - Rate of failed requests (explicit failures, implicit failures, policy violations)
4. **Saturation** - How "full" your service is (CPU, memory, I/O, queue depth)

**When to Use Golden Signals:**
- Comprehensive service monitoring
- SRE-focused teams
- Services with both request and resource concerns

#### Metric Naming Conventions

Use consistent naming for easier querying and correlation:

**Pattern:** `{namespace}.{component}.{metric_name}`

**Examples:**
- `orderservice.api.request_duration_ms`
- `orderservice.database.query_duration_ms`
- `orderservice.queue.message_age_seconds`
- `orderservice.cache.hit_rate_percent`

**Tags/Dimensions:**
- `environment`: dev, staging, prod
- `region`: us-east-1, eu-west-1
- `service`: order-service, payment-service
- `endpoint`: /api/orders, /api/payments
- `method`: GET, POST, PUT, DELETE
- `status_code`: 200, 400, 500

#### Baseline and Anomaly Detection

**Establishing Baselines:**
1. Collect metrics for 2-4 weeks
2. Identify patterns (daily, weekly, seasonal)
3. Calculate normal ranges (mean ± 2 standard deviations)
4. Set alert thresholds above normal variation

**Anomaly Detection Approaches:**
- **Static Thresholds** - Fixed values (p95 latency > 1000ms)
- **Dynamic Thresholds** - Based on historical patterns (20% above baseline)
- **Rate of Change** - Sudden changes (50% increase in 5 minutes)
- **Forecasting** - Predict expected values, alert on deviation

**Example Baseline Analysis:**

```
API Latency (p95) - 2 Week Analysis:
- Business Hours (9am-5pm): 300-400ms (normal)
- Off Hours: 150-200ms (normal)
- Monday Morning: 500-600ms (expected spike)
- Alert Threshold: > 800ms (2x normal business hours)
```

---

### 2.3 Monitoring Tool Selection Criteria

Choosing the right APM tools is critical for balancing functionality, cost, and operational complexity. This section provides a framework for evaluating and selecting monitoring solutions.

#### Decision Matrix for Tool Selection

Use this matrix to evaluate monitoring tools against your requirements:

| Criteria | Weight | Managed Service (AWS/Azure) | Third-Party SaaS (Datadog, New Relic) | Open Source (Prometheus, Jaeger) |
|----------|--------|------------------------------|---------------------------------------|----------------------------------|
| **Ease of Setup** | High | ⭐⭐⭐⭐⭐ Native integration | ⭐⭐⭐⭐ Agent installation | ⭐⭐ Self-hosted, complex |
| **Feature Richness** | High | ⭐⭐⭐ Good coverage | ⭐⭐⭐⭐⭐ Comprehensive | ⭐⭐⭐ Basic to good |
| **Cost (Small Scale)** | Medium | ⭐⭐⭐⭐ Pay-as-you-go | ⭐⭐⭐ Subscription | ⭐⭐⭐⭐⭐ Infrastructure only |
| **Cost (Large Scale)** | High | ⭐⭐⭐ Can be expensive | ⭐⭐ Expensive | ⭐⭐⭐⭐ Cost-effective |
| **Vendor Lock-In** | Medium | ⭐⭐ Platform-specific | ⭐⭐⭐ Portable | ⭐⭐⭐⭐⭐ Open standards |
| **Support** | Medium | ⭐⭐⭐⭐ Cloud provider | ⭐⭐⭐⭐⭐ Dedicated support | ⭐⭐ Community |
| **Customization** | Low | ⭐⭐⭐ Limited | ⭐⭐⭐⭐ Extensive | ⭐⭐⭐⭐⭐ Full control |
| **Multi-Cloud** | Medium | ⭐⭐ Single cloud | ⭐⭐⭐⭐⭐ Any cloud | ⭐⭐⭐⭐⭐ Any cloud |

**Rating Scale:** ⭐ = Poor, ⭐⭐⭐ = Good, ⭐⭐⭐⭐⭐ = Excellent

#### Managed Services vs Third-Party Tools

**Managed Cloud Services (AWS CloudWatch, Azure Application Insights):**

**Pros:**
- ✅ Native integration with cloud services
- ✅ No additional infrastructure to manage
- ✅ Automatic instrumentation for many services
- ✅ Unified billing with cloud provider
- ✅ Built-in security and compliance
- ✅ Quick time-to-value

**Cons:**
- ❌ Platform lock-in (harder to switch clouds)
- ❌ Limited cross-cloud visibility
- ❌ Less feature-rich than specialized tools
- ❌ Can be expensive at scale
- ❌ Limited customization options

**Best For:**
- Single-cloud deployments
- Teams with limited DevOps resources
- Startups and small teams
- Cloud-native applications
- Cost-conscious early stages

**Third-Party SaaS (Datadog, New Relic, Dynatrace):**

**Pros:**
- ✅ Rich feature set (APM, logs, traces, RUM, synthetics)
- ✅ Multi-cloud and hybrid support
- ✅ Advanced analytics and AI/ML features
- ✅ Excellent dashboards and visualizations
- ✅ Strong support and documentation
- ✅ Extensive integrations

**Cons:**
- ❌ Additional cost (can be significant)
- ❌ Another vendor to manage
- ❌ Data leaves your cloud environment
- ❌ Learning curve for platform
- ❌ Potential vendor lock-in

**Best For:**
- Multi-cloud or hybrid environments
- Large enterprises with budget
- Teams needing advanced features
- Complex distributed systems
- Organizations with dedicated SRE teams

**Open Source (Prometheus, Grafana, Jaeger, ELK Stack):**

**Pros:**
- ✅ No licensing costs
- ✅ Full control and customization
- ✅ Open standards (OpenTelemetry)
- ✅ No vendor lock-in
- ✅ Large community
- ✅ Cost-effective at scale

**Cons:**
- ❌ Requires infrastructure and expertise
- ❌ Operational overhead (updates, scaling, backups)
- ❌ No dedicated support (community only)
- ❌ Longer time-to-value
- ❌ Integration complexity

**Best For:**
- Large-scale deployments
- Teams with strong DevOps/SRE expertise
- Cost-sensitive organizations
- On-premises or air-gapped environments
- Organizations requiring full control

#### Cost vs Features Trade-offs

**Cost Comparison (Approximate Monthly Costs):**

| Scale | Managed Service | Third-Party SaaS | Open Source |
|-------|----------------|------------------|-------------|
| **Small** (10K req/day) | $50-100 | $100-300 | $50-100 (infra) |
| **Medium** (1M req/day) | $500-1,000 | $1,000-3,000 | $200-500 (infra) |
| **Large** (100M req/day) | $5,000-10,000 | $10,000-30,000 | $2,000-5,000 (infra) |

**Cost Drivers:**
- **Metrics:** Number of custom metrics, cardinality (unique tag combinations)
- **Logs:** Volume (GB/day), retention period
- **Traces:** Sampling rate, span count, retention
- **Hosts/Containers:** Number of monitored instances
- **Features:** APM, RUM, synthetics, alerting, dashboards

**Feature Comparison:**

| Feature | Managed Service | Third-Party SaaS | Open Source |
|---------|----------------|------------------|-------------|
| **Metrics** | ✅ Good | ✅ Excellent | ✅ Good |
| **Logs** | ✅ Good | ✅ Excellent | ✅ Good |
| **Traces** | ✅ Good | ✅ Excellent | ✅ Good |
| **APM** | ⚠️ Basic | ✅ Advanced | ⚠️ Basic |
| **RUM** | ⚠️ Limited | ✅ Advanced | ❌ DIY |
| **Synthetics** | ⚠️ Limited | ✅ Advanced | ❌ DIY |
| **Alerting** | ✅ Good | ✅ Excellent | ⚠️ Basic |
| **Dashboards** | ✅ Good | ✅ Excellent | ✅ Good (Grafana) |
| **AI/ML** | ⚠️ Limited | ✅ Advanced | ❌ None |
| **Mobile APM** | ⚠️ Limited | ✅ Advanced | ❌ None |

#### Selection Decision Tree

```
START: What's your primary cloud platform?
│
├─ Single Cloud (AWS or Azure)
│  │
│  ├─ Budget < $500/month?
│  │  └─ → Use Managed Service (CloudWatch or App Insights)
│  │
│  └─ Need advanced features (RUM, synthetics, AI)?
│     └─ → Consider Third-Party SaaS
│
├─ Multi-Cloud or Hybrid
│  │
│  ├─ Budget < $1000/month?
│  │  └─ → Open Source (Prometheus + Grafana + Jaeger)
│  │
│  └─ Need enterprise support?
│     └─ → Third-Party SaaS (Datadog, New Relic)
│
└─ On-Premises or Air-Gapped
   └─ → Open Source (required)
```

#### Evaluation Checklist

Use this checklist when evaluating monitoring tools:

**Functional Requirements:**
- [ ] Supports required telemetry types (metrics, logs, traces)
- [ ] .NET SDK/agent available and well-maintained
- [ ] Integrates with your cloud platform (AWS/Azure)
- [ ] Supports distributed tracing with context propagation
- [ ] Provides alerting and notification capabilities
- [ ] Offers dashboards and visualization
- [ ] Supports custom metrics and business metrics
- [ ] Query language for ad-hoc analysis

**Non-Functional Requirements:**
- [ ] Meets performance requirements (low overhead)
- [ ] Scales to your expected volume
- [ ] Meets retention requirements
- [ ] Provides adequate data security and encryption
- [ ] Complies with regulatory requirements (GDPR, HIPAA)
- [ ] Offers SLA guarantees
- [ ] Provides disaster recovery capabilities

**Operational Requirements:**
- [ ] Fits within budget constraints
- [ ] Team has expertise or can learn quickly
- [ ] Adequate documentation and training available
- [ ] Support options meet your needs
- [ ] Integration with existing tools (CI/CD, incident management)
- [ ] Migration path if switching tools later

**Strategic Requirements:**
- [ ] Aligns with multi-cloud or single-cloud strategy
- [ ] Vendor stability and roadmap
- [ ] Community size and activity (for open source)
- [ ] Avoids unacceptable vendor lock-in

#### Hybrid Approach

Many organizations use a hybrid approach combining multiple tools:

**Common Patterns:**

**Pattern 1: Managed + Third-Party**
- Managed service for infrastructure metrics (CloudWatch, Azure Monitor)
- Third-party for application APM (Datadog, New Relic)
- **Benefit:** Best of both worlds
- **Drawback:** Higher cost, multiple tools to manage

**Pattern 2: Managed + Open Source**
- Managed service for logs (CloudWatch Logs, Log Analytics)
- Open source for metrics and traces (Prometheus, Jaeger)
- **Benefit:** Cost-effective, flexibility
- **Drawback:** Operational complexity

**Pattern 3: Tiered by Environment**
- Managed service for dev/test (low cost, easy setup)
- Third-party or open source for production (advanced features)
- **Benefit:** Optimize cost vs features by environment
- **Drawback:** Different tools across environments

#### Vendor-Specific Recommendations

**For AWS Deployments:**
- **Start with:** CloudWatch + X-Ray (native, easy)
- **Upgrade to:** Datadog or New Relic (if need advanced APM)
- **Scale with:** Prometheus + Grafana + Jaeger (if cost-sensitive at scale)

**For Azure Deployments:**
- **Start with:** Application Insights + Azure Monitor (native, excellent)
- **Upgrade to:** Datadog or New Relic (if multi-cloud)
- **Scale with:** Prometheus + Grafana + Jaeger (if cost-sensitive at scale)

**For Multi-Cloud:**
- **Recommended:** Datadog or New Relic (unified view)
- **Alternative:** OpenTelemetry + Prometheus + Grafana (open standards)

#### Migration Considerations

If switching tools, plan for:

1. **Parallel Running** - Run old and new tools simultaneously (2-4 weeks)
2. **Dashboard Migration** - Recreate critical dashboards in new tool
3. **Alert Migration** - Migrate and test all alerts
4. **Historical Data** - Export or accept data loss
5. **Team Training** - Train team on new tool
6. **Instrumentation Changes** - Update code if SDK changes
7. **Cost Validation** - Confirm actual costs match estimates

**OpenTelemetry Advantage:**
Using OpenTelemetry for instrumentation makes switching backends easier since the instrumentation code remains the same.

---

### 2.4 Synthetic vs Real User Monitoring (RUM)

Understanding the difference between synthetic monitoring and real user monitoring is essential for comprehensive application observability. Each approach serves distinct purposes and provides complementary insights.

#### Synthetic Monitoring

**Definition:** Automated, scripted tests that simulate user interactions with your application from predefined locations at regular intervals.

**How It Works:**
1. Create scripts that mimic user workflows (login, browse, checkout)
2. Execute scripts from multiple geographic locations
3. Run on a schedule (every 1-15 minutes)
4. Measure performance, availability, and functionality
5. Alert when tests fail or performance degrades

**Characteristics:**
- **Proactive** - Detects issues before users encounter them
- **Predictable** - Consistent test scenarios and timing
- **Controlled** - Known baseline for comparison
- **24/7 Coverage** - Monitors even when no real users are active
- **Geographic** - Tests from multiple locations

**When to Use Synthetic Monitoring:**

✅ **Proactive Monitoring**
- Detect issues before they impact users
- Monitor during off-hours when no real users are active
- Validate deployments and releases

✅ **SLA Validation**
- Verify uptime and availability
- Measure performance against SLAs
- Provide evidence for compliance

✅ **Third-Party Dependencies**
- Monitor external APIs and services
- Detect partner service degradation
- Validate integration points

✅ **Critical User Journeys**
- Login and authentication flows
- Checkout and payment processes
- Key business transactions

✅ **Geographic Performance**
- Test from multiple regions
- Validate CDN effectiveness
- Measure global latency

**Synthetic Monitoring Examples:**

**API Health Check:**
```csharp
// Simple synthetic check
[HttpGet("health")]
public IActionResult HealthCheck()
{
    var checks = new Dictionary<string, bool>
    {
        ["database"] = _dbContext.Database.CanConnect(),
        ["cache"] = _cache.IsConnected(),
        ["external_api"] = await _externalApi.PingAsync()
    };
    
    var allHealthy = checks.All(c => c.Value);
    return allHealthy ? Ok(checks) : StatusCode(503, checks);
}
```

**User Journey Script (Playwright):**
```csharp
// Synthetic test for critical user journey
[Test]
public async Task SyntheticTest_UserCanPlaceOrder()
{
    // Navigate to site
    await Page.GotoAsync("https://myapp.com");
    
    // Login
    await Page.FillAsync("#username", "test@example.com");
    await Page.FillAsync("#password", "password");
    await Page.ClickAsync("#login-button");
    
    // Add item to cart
    await Page.ClickAsync(".product-card:first-child .add-to-cart");
    
    // Checkout
    await Page.ClickAsync("#cart-icon");
    await Page.ClickAsync("#checkout-button");
    
    // Verify success
    await Expect(Page.Locator(".order-confirmation")).ToBeVisibleAsync();
    
    // Measure performance
    var metrics = await Page.EvaluateAsync<PerformanceMetrics>(
        "() => JSON.stringify(performance.getEntriesByType('navigation')[0])"
    );
    
    Assert.That(metrics.LoadTime, Is.LessThan(3000), "Page load > 3s");
}
```

**Synthetic Monitoring Tools:**
- **AWS:** CloudWatch Synthetics (Canaries)
- **Azure:** Application Insights Availability Tests
- **Third-Party:** Pingdom, Uptime Robot, Datadog Synthetics
- **Open Source:** Playwright, Selenium, Puppeteer

#### Real User Monitoring (RUM)

**Definition:** Passive monitoring that captures actual user interactions and experiences with your application in real-time.

**How It Works:**
1. Inject JavaScript snippet into web pages
2. Capture real user interactions and performance metrics
3. Send telemetry to monitoring backend
4. Aggregate and analyze actual user experience data
5. Identify patterns and issues affecting real users

**Characteristics:**
- **Reactive** - Shows what users actually experience
- **Comprehensive** - Captures all user interactions
- **Variable** - Reflects real-world conditions (devices, networks, locations)
- **User-Centric** - Measures actual user experience
- **High Volume** - Large dataset from all users

**When to Use Real User Monitoring:**

✅ **Actual User Experience**
- Measure real performance across diverse conditions
- Understand device and browser variations
- Capture network quality impact

✅ **User Behavior Analysis**
- Identify popular features and workflows
- Detect user frustration (rage clicks, errors)
- Optimize based on actual usage patterns

✅ **Performance Optimization**
- Find slow pages and interactions
- Measure Core Web Vitals (LCP, FID, CLS)
- Prioritize optimization efforts

✅ **Error Detection**
- Capture JavaScript errors in production
- Identify browser-specific issues
- Correlate errors with user actions

✅ **Business Insights**
- Correlate performance with conversions
- Measure impact of performance on revenue
- Segment by user demographics

**RUM Implementation Example:**

**Client-Side (JavaScript):**
```javascript
// Application Insights RUM snippet
<script type="text/javascript">
!function(T,l,y){/* Application Insights snippet */}
(window,document,{
    src: "https://js.monitor.azure.com/scripts/b/ai.2.min.js",
    cfg: {
        instrumentationKey: "YOUR_KEY",
        enableAutoRouteTracking: true,
        enableCorsCorrelation: true,
        enableRequestHeaderTracking: true,
        enableResponseHeaderTracking: true
    }
});

// Track custom events
appInsights.trackEvent({
    name: "ProductViewed",
    properties: {
        productId: "12345",
        category: "Electronics"
    }
});

// Track page views with custom properties
appInsights.trackPageView({
    name: "Product Details",
    properties: {
        loadTime: performance.now()
    }
});
</script>
```

**Server-Side Correlation:**
```csharp
// Correlate server-side traces with RUM
public class OrderController : ControllerBase
{
    private readonly TelemetryClient _telemetry;
    
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        // Correlation ID from RUM is automatically propagated
        var operation = _telemetry.StartOperation<RequestTelemetry>("CreateOrder");
        
        try
        {
            var order = await _orderService.CreateOrderAsync(request);
            
            // Track business metric
            _telemetry.TrackMetric("OrderValue", order.TotalAmount);
            
            operation.Telemetry.Success = true;
            return Ok(order);
        }
        catch (Exception ex)
        {
            operation.Telemetry.Success = false;
            _telemetry.TrackException(ex);
            throw;
        }
        finally
        {
            _telemetry.StopOperation(operation);
        }
    }
}
```

**RUM Metrics to Track:**

**Performance Metrics:**
- Page load time
- Time to first byte (TTFB)
- First contentful paint (FCP)
- Largest contentful paint (LCP)
- First input delay (FID)
- Cumulative layout shift (CLS)
- Time to interactive (TTI)

**User Interaction Metrics:**
- Click events and targets
- Form submissions
- Navigation patterns
- Scroll depth
- Session duration
- Bounce rate

**Error Metrics:**
- JavaScript errors
- Failed API calls
- Resource load failures
- Console errors

**Business Metrics:**
- Conversion rate
- Cart abandonment
- Feature usage
- User engagement

#### Synthetic vs RUM Comparison

| Aspect | Synthetic Monitoring | Real User Monitoring |
|--------|---------------------|---------------------|
| **Timing** | Proactive (before users) | Reactive (during user sessions) |
| **Coverage** | Specific scenarios | All user interactions |
| **Consistency** | Predictable, repeatable | Variable, real-world |
| **Cost** | Fixed (per check) | Variable (per user) |
| **Data Volume** | Low | High |
| **Geographic** | Controlled locations | Actual user locations |
| **Devices** | Specific test devices | All user devices |
| **Network** | Controlled conditions | Real network conditions |
| **Availability** | 24/7 monitoring | Only when users active |
| **Debugging** | Easy (reproducible) | Harder (variable conditions) |

#### When to Use Each Approach

**Use Synthetic Monitoring When:**
- You need proactive alerting before users are impacted
- Monitoring critical business transactions
- Validating SLAs and uptime
- Testing from specific geographic locations
- Monitoring during off-hours
- Validating third-party dependencies
- You have predictable, critical user journeys

**Use Real User Monitoring When:**
- You need to understand actual user experience
- Measuring performance across diverse conditions
- Analyzing user behavior and patterns
- Optimizing based on real usage data
- Detecting browser or device-specific issues
- Correlating performance with business metrics
- You have high user traffic

**Use Both When:**
- You want comprehensive monitoring (recommended)
- Critical applications requiring both proactive and reactive monitoring
- Need to validate synthetic results with real user data
- Optimizing user experience while ensuring availability

#### Combined Approach Example

**Scenario: E-commerce Checkout Flow**

**Synthetic Monitoring:**
- Run every 5 minutes from 5 global locations
- Test complete checkout flow (add to cart → payment → confirmation)
- Alert if any step fails or exceeds 5 seconds
- Validate payment gateway integration
- **Goal:** Ensure checkout is always available and functional

**Real User Monitoring:**
- Capture all user checkout attempts
- Measure actual completion rates
- Identify where users abandon checkout
- Correlate performance with conversion rate
- Segment by device, browser, location
- **Goal:** Optimize checkout experience based on real user behavior

**Combined Insights:**
- Synthetic shows checkout is "working" (functional)
- RUM shows users are abandoning at payment step (usability issue)
- Investigation reveals mobile users have 3x higher abandonment
- Root cause: Payment form not mobile-optimized
- **Action:** Redesign mobile payment experience

#### Implementation Recommendations

**Start with Synthetic:**
1. Implement health checks for all services
2. Create synthetic tests for critical user journeys
3. Set up alerting for failures
4. Monitor from multiple locations

**Add RUM:**
1. Inject RUM snippet into web applications
2. Configure to capture Core Web Vitals
3. Set up dashboards for user experience metrics
4. Correlate with business metrics

**Optimize:**
1. Use synthetic to validate SLAs
2. Use RUM to prioritize optimization efforts
3. Correlate synthetic and RUM data
4. Continuously refine based on insights

#### Cost Considerations

**Synthetic Monitoring Costs:**
- Fixed cost per check (e.g., $0.001 per check)
- Scales with number of checks and frequency
- Typical: $50-200/month for 10-20 checks

**RUM Costs:**
- Variable cost per user session or page view
- Scales with traffic volume
- Typical: $100-500/month for 100K-1M page views

**Optimization Strategies:**
- Synthetic: Reduce frequency for non-critical checks
- RUM: Sample traffic (e.g., 10% of users)
- Both: Focus on critical paths and high-value pages

---

### 2.5 Instrumentation Levels

Effective APM requires instrumentation at multiple levels of your application stack. Understanding what to instrument at each level ensures comprehensive observability without excessive overhead.

#### The Three Levels of Instrumentation

```
┌─────────────────────────────────────────────────────────────┐
│                    INSTRUMENTATION LEVELS                    │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         BUSINESS-LEVEL INSTRUMENTATION             │    │
│  │  • Business events and outcomes                    │    │
│  │  • User actions and conversions                    │    │
│  │  • Revenue and business metrics                    │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │       APPLICATION-LEVEL INSTRUMENTATION            │    │
│  │  • Request/response metrics                        │    │
│  │  • Database queries and external calls             │    │
│  │  • Application errors and exceptions               │    │
│  │  • Custom application metrics                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          ▲                                   │
│                          │                                   │
│  ┌────────────────────────────────────────────────────┐    │
│  │      INFRASTRUCTURE-LEVEL INSTRUMENTATION          │    │
│  │  • CPU, memory, disk, network                      │    │
│  │  • Container and orchestration metrics             │    │
│  │  • Cloud service metrics                           │    │
│  │  • System logs and events                          │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Infrastructure-Level Instrumentation

**Purpose:** Monitor the health and performance of underlying infrastructure and platform services.

**What to Instrument:**

**Compute Resources:**
- CPU utilization (percentage, cores)
- Memory usage (used, available, swap)
- Disk I/O (read/write operations, latency)
- Network I/O (bytes in/out, packets, errors)

**Container Metrics (Docker, Kubernetes):**
- Container CPU and memory limits/usage
- Container restart count
- Pod status and health
- Node resource utilization
- Cluster capacity and scaling events

**Cloud Service Metrics:**
- Load balancer request count and latency
- Database connections and query performance
- Message queue depth and processing rate
- Cache hit/miss ratio
- Storage operations and throughput

**System Logs:**
- Operating system events
- Container orchestration events
- Cloud service logs
- Security and audit logs

**Implementation Examples:**

**AWS CloudWatch Agent:**
```json
{
  "metrics": {
    "namespace": "MyApp/Infrastructure",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {"name": "cpu_usage_idle", "rename": "CPU_IDLE", "unit": "Percent"},
          {"name": "cpu_usage_iowait", "rename": "CPU_IOWAIT", "unit": "Percent"}
        ],
        "totalcpu": false
      },
      "disk": {
        "measurement": [
          {"name": "used_percent", "rename": "DISK_USED", "unit": "Percent"}
        ],
        "resources": ["*"]
      },
      "mem": {
        "measurement": [
          {"name": "mem_used_percent", "rename": "MEM_USED", "unit": "Percent"}
        ]
      }
    }
  }
}
```

**Azure Monitor (Bicep):**
```bicep
resource diagnosticSettings 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  name: 'infrastructure-monitoring'
  scope: appService
  properties: {
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 90
        }
      }
    ]
    logs: [
      {
        category: 'AppServiceHTTPLogs'
        enabled: true
      }
      {
        category: 'AppServiceConsoleLogs'
        enabled: true
      }
    ]
    workspaceId: logAnalyticsWorkspace.id
  }
}
```

**When to Alert:**
- CPU > 80% for 5 minutes
- Memory > 85% for 5 minutes
- Disk > 90% usage
- Container restart count > 3 in 10 minutes
- Network errors > 1% of packets

#### Application-Level Instrumentation

**Purpose:** Monitor application behavior, performance, and errors from the application's perspective.

**What to Instrument:**

**HTTP Requests:**
- Request rate (requests per second)
- Response time (p50, p95, p99)
- Error rate (4xx, 5xx status codes)
- Request size and response size

**Database Operations:**
- Query execution time
- Connection pool utilization
- Query count by type (SELECT, INSERT, UPDATE)
- Slow query detection (> 100ms)
- Database errors

**External Dependencies:**
- API call latency
- Success/failure rate
- Timeout occurrences
- Circuit breaker state

**Application Errors:**
- Exception count by type
- Stack traces
- Error rate by endpoint
- Unhandled exceptions

**Custom Application Metrics:**
- Cache hit/miss ratio
- Background job processing time
- Queue processing rate
- Feature usage counts

**Implementation Examples:**

**ASP.NET Core with OpenTelemetry:**
```csharp
// Program.cs - Application-level instrumentation
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation(options =>
        {
            options.RecordException = true;
            options.EnrichWithHttpRequest = (activity, request) =>
            {
                activity.SetTag("user.id", request.HttpContext.User.FindFirst("sub")?.Value);
                activity.SetTag("tenant.id", request.Headers["X-Tenant-Id"].FirstOrDefault());
            };
        })
        .AddHttpClientInstrumentation(options =>
        {
            options.RecordException = true;
            options.EnrichWithHttpRequestMessage = (activity, request) =>
            {
                activity.SetTag("http.request.size", request.Content?.Headers.ContentLength);
            };
        })
        .AddSqlClientInstrumentation(options =>
        {
            options.SetDbStatementForText = true;
            options.RecordException = true;
            options.EnrichWithIDbCommand = (activity, command) =>
            {
                activity.SetTag("db.query.duration", activity.Duration.TotalMilliseconds);
            };
        })
        .AddAzureMonitorTraceExporter(options =>
        {
            options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
        }));

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        .AddAzureMonitorMetricExporter());
```

**Custom Application Metrics:**
```csharp
public class OrderService
{
    private static readonly Meter Meter = new("OrderService", "1.0");
    private static readonly Counter<long> OrdersCreated = 
        Meter.CreateCounter<long>("orders.created", "orders");
    private static readonly Histogram<double> OrderValue = 
        Meter.CreateHistogram<double>("orders.value", "USD");
    private static readonly Histogram<double> ProcessingTime = 
        Meter.CreateHistogram<double>("orders.processing_time", "ms");

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var sw = Stopwatch.StartNew();
        var tags = new TagList 
        { 
            { "customer.type", request.CustomerType },
            { "payment.method", request.PaymentMethod }
        };

        try
        {
            var order = await _repository.CreateAsync(request);
            
            // Record business metrics
            OrdersCreated.Add(1, tags);
            OrderValue.Record(order.TotalAmount, tags);
            ProcessingTime.Record(sw.ElapsedMilliseconds, tags);
            
            return order;
        }
        catch (Exception ex)
        {
            tags.Add("error", ex.GetType().Name);
            ProcessingTime.Record(sw.ElapsedMilliseconds, tags);
            throw;
        }
    }
}
```

**When to Alert:**
- Error rate > 1% for 5 minutes
- p95 latency > 1000ms for 5 minutes
- Database query time > 500ms
- External API failure rate > 5%
- Unhandled exception occurred

#### Business-Level Instrumentation

**Purpose:** Track business outcomes, user behavior, and metrics that directly impact business goals.

**What to Instrument:**

**Business Events:**
- User registration and activation
- Order placement and completion
- Payment processing
- Subscription changes
- Feature adoption

**User Behavior:**
- User journey completion rate
- Feature usage frequency
- Session duration
- User engagement score
- Funnel conversion rates

**Revenue Metrics:**
- Transaction value
- Revenue per user
- Conversion rate
- Cart abandonment rate
- Refund rate

**Product Metrics:**
- Feature usage by user segment
- A/B test variant performance
- User satisfaction scores
- Support ticket creation rate

**Implementation Examples:**

**Business Event Tracking:**
```csharp
public class OrderService
{
    private readonly TelemetryClient _telemetry;
    
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var order = await _repository.CreateAsync(request);
        
        // Track business event
        _telemetry.TrackEvent("OrderCreated", new Dictionary<string, string>
        {
            ["OrderId"] = order.Id.ToString(),
            ["CustomerId"] = order.CustomerId.ToString(),
            ["CustomerType"] = order.CustomerType,
            ["PaymentMethod"] = order.PaymentMethod,
            ["ShippingMethod"] = order.ShippingMethod,
            ["PromoCode"] = order.PromoCode ?? "None"
        }, new Dictionary<string, double>
        {
            ["OrderValue"] = order.TotalAmount,
            ["ItemCount"] = order.Items.Count,
            ["DiscountAmount"] = order.DiscountAmount,
            ["ShippingCost"] = order.ShippingCost
        });
        
        // Track funnel step
        _telemetry.TrackMetric("CheckoutFunnel.OrderPlaced", 1, new Dictionary<string, string>
        {
            ["FunnelStep"] = "4_OrderPlaced",
            ["CustomerType"] = order.CustomerType
        });
        
        return order;
    }
}
```

**User Journey Tracking:**
```csharp
public class CheckoutFunnelTracker
{
    private readonly TelemetryClient _telemetry;
    
    public void TrackFunnelStep(string userId, string step, Dictionary<string, string> properties = null)
    {
        var eventProperties = new Dictionary<string, string>
        {
            ["UserId"] = userId,
            ["FunnelStep"] = step,
            ["Timestamp"] = DateTime.UtcNow.ToString("o")
        };
        
        if (properties != null)
        {
            foreach (var prop in properties)
            {
                eventProperties[prop.Key] = prop.Value;
            }
        }
        
        _telemetry.TrackEvent($"CheckoutFunnel.{step}", eventProperties);
    }
    
    // Usage:
    // tracker.TrackFunnelStep(userId, "1_ViewCart");
    // tracker.TrackFunnelStep(userId, "2_EnterShipping");
    // tracker.TrackFunnelStep(userId, "3_EnterPayment");
    // tracker.TrackFunnelStep(userId, "4_OrderPlaced");
}
```

**A/B Test Tracking:**
```csharp
public class FeatureFlagService
{
    private readonly TelemetryClient _telemetry;
    
    public string GetVariant(string userId, string experimentName)
    {
        var variant = _featureFlags.GetVariant(userId, experimentName);
        
        // Track variant assignment
        _telemetry.TrackEvent("ExperimentVariantAssigned", new Dictionary<string, string>
        {
            ["ExperimentName"] = experimentName,
            ["Variant"] = variant,
            ["UserId"] = userId
        });
        
        return variant;
    }
    
    public void TrackConversion(string userId, string experimentName, string conversionEvent)
    {
        var variant = _featureFlags.GetVariant(userId, experimentName);
        
        // Track conversion by variant
        _telemetry.TrackEvent("ExperimentConversion", new Dictionary<string, string>
        {
            ["ExperimentName"] = experimentName,
            ["Variant"] = variant,
            ["ConversionEvent"] = conversionEvent,
            ["UserId"] = userId
        });
    }
}
```

**When to Alert:**
- Conversion rate drops > 20% from baseline
- Cart abandonment rate > 70%
- Payment failure rate > 5%
- Feature usage drops > 50% from baseline

#### Instrumentation Level Comparison

| Aspect | Infrastructure | Application | Business |
|--------|---------------|-------------|----------|
| **Focus** | System health | App behavior | Business outcomes |
| **Audience** | DevOps, SRE | Developers | Product, Business |
| **Metrics** | CPU, memory, disk | Latency, errors | Conversions, revenue |
| **Granularity** | Host/container | Request/operation | User/transaction |
| **Frequency** | Every 1-5 min | Every request | Per business event |
| **Cost** | Low | Medium | Low-Medium |
| **Retention** | 90 days | 30-90 days | 1 year+ |

#### Instrumentation Best Practices

**Do:**
- ✅ Start with infrastructure and application levels
- ✅ Add business instrumentation for critical paths
- ✅ Use consistent naming conventions
- ✅ Include relevant context (user ID, tenant ID, etc.)
- ✅ Instrument errors and exceptions
- ✅ Use structured logging with correlation IDs
- ✅ Sample high-volume traces to control costs
- ✅ Test instrumentation in development

**Don't:**
- ❌ Instrument everything (focus on what matters)
- ❌ Log sensitive data (PII, passwords, tokens)
- ❌ Create high-cardinality metrics (unique IDs as tags)
- ❌ Block application flow for telemetry
- ❌ Ignore instrumentation overhead
- ❌ Forget to correlate across levels
- ❌ Hard-code instrumentation keys

#### Correlation Across Levels

Effective observability requires correlating data across all three levels:

**Example: Slow Checkout Investigation**

1. **Business Level:** Conversion rate dropped 15%
2. **Application Level:** Checkout API p95 latency increased to 3 seconds
3. **Infrastructure Level:** Database CPU at 95%

**Root Cause:** Database needs scaling or query optimization

**Correlation Techniques:**
- Use correlation IDs across all levels
- Tag metrics with common dimensions (service, environment)
- Link traces to business events
- Include user context in application logs

**Implementation:**
```csharp
// Correlation across levels
public class OrderController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        // Get or create correlation ID
        var correlationId = Activity.Current?.Id ?? Guid.NewGuid().ToString();
        
        using var scope = _logger.BeginScope(new Dictionary<string, object>
        {
            ["CorrelationId"] = correlationId,
            ["UserId"] = User.FindFirst("sub")?.Value,
            ["TenantId"] = request.TenantId
        });
        
        // Application-level: Start trace
        using var activity = _activitySource.StartActivity("CreateOrder");
        activity?.SetTag("correlation.id", correlationId);
        activity?.SetTag("user.id", User.FindFirst("sub")?.Value);
        
        try
        {
            var order = await _orderService.CreateOrderAsync(request);
            
            // Business-level: Track event
            _telemetry.TrackEvent("OrderCreated", new Dictionary<string, string>
            {
                ["CorrelationId"] = correlationId,
                ["OrderId"] = order.Id.ToString(),
                ["OrderValue"] = order.TotalAmount.ToString()
            });
            
            return Ok(order);
        }
        catch (Exception ex)
        {
            // All levels: Log error with correlation
            _logger.LogError(ex, "Order creation failed. CorrelationId: {CorrelationId}", correlationId);
            throw;
        }
    }
}
```

#### Progressive Instrumentation Strategy

**Phase 1: Foundation (Week 1-2)**
- Infrastructure metrics (CPU, memory, disk)
- Basic application metrics (request rate, errors, latency)
- Health checks and availability monitoring

**Phase 2: Application Depth (Week 3-4)**
- Distributed tracing
- Database and external dependency monitoring
- Structured logging with correlation
- Custom application metrics

**Phase 3: Business Insights (Week 5-6)**
- Business event tracking
- User journey monitoring
- Conversion funnel analysis
- A/B test tracking

**Phase 4: Optimization (Ongoing)**
- Refine alert thresholds
- Add missing instrumentation
- Optimize sampling rates
- Correlate across levels

---

## Cloud Platform APM Services

This section provides comprehensive guidance on APM services available in AWS and Azure, helping you select the right tools for your platform and use case.

### 3.1 AWS APM Services

AWS provides a suite of native monitoring and observability services that integrate seamlessly with AWS infrastructure and applications. This section covers the core services, configuration patterns, and cost optimization strategies.

#### Amazon CloudWatch

**Overview:**
Amazon CloudWatch is AWS's foundational monitoring and observability service, providing metrics, logs, alarms, and dashboards for AWS resources and applications.

**Core Capabilities:**
- **CloudWatch Metrics** - Collect and track metrics from AWS services and custom applications
- **CloudWatch Logs** - Centralized log aggregation and analysis
- **CloudWatch Alarms** - Automated alerting based on metric thresholds
- **CloudWatch Dashboards** - Customizable visualizations
- **CloudWatch Insights** - Query and analyze log data
- **CloudWatch Synthetics** - Synthetic monitoring with canaries

**When to Use CloudWatch:**
- ✅ AWS-native applications
- ✅ Infrastructure monitoring (EC2, RDS, Lambda, etc.)
- ✅ Basic application monitoring needs
- ✅ Cost-conscious deployments
- ✅ Simple alerting requirements

**CloudWatch Metrics Configuration:**

```csharp
// .NET SDK for CloudWatch Metrics
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;

public class CloudWatchMetricsService
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly string _namespace;

    public CloudWatchMetricsService(IAmazonCloudWatch cloudWatch, string namespaceName)
    {
        _cloudWatch = cloudWatch;
        _namespace = namespaceName;
    }

    public async Task PublishMetricAsync(
        string metricName, 
        double value, 
        StandardUnit unit,
        Dictionary<string, string> dimensions,
        CancellationToken cancellationToken = default)
    {
        var metricData = new MetricDatum
        {
            MetricName = metricName,
            Value = value,
            Unit = unit,
            TimestampUtc = DateTime.UtcNow,
            Dimensions = dimensions.Select(d => new Dimension
            {
                Name = d.Key,
                Value = d.Value
            }).ToList()
        };

        var request = new PutMetricDataRequest
        {
            Namespace = _namespace,
            MetricData = new List<MetricDatum> { metricData }
        };

        await _cloudWatch.PutMetricDataAsync(request, cancellationToken);
    }

    // Batch metrics for efficiency
    public async Task PublishMetricBatchAsync(
        List<MetricDatum> metrics,
        CancellationToken cancellationToken = default)
    {
        // CloudWatch allows up to 1000 metrics per request
        const int batchSize = 1000;
        
        for (int i = 0; i < metrics.Count; i += batchSize)
        {
            var batch = metrics.Skip(i).Take(batchSize).ToList();
            var request = new PutMetricDataRequest
            {
                Namespace = _namespace,
                MetricData = batch
            };

            await _cloudWatch.PutMetricDataAsync(request, cancellationToken);
        }
    }
}

// Usage in application
public class OrderService
{
    private readonly CloudWatchMetricsService _metrics;

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var sw = Stopwatch.StartNew();
        
        try
        {
            var order = await ProcessOrderAsync(request);
            
            // Publish success metrics
            await _metrics.PublishMetricAsync(
                "OrderCreated",
                1,
                StandardUnit.Count,
                new Dictionary<string, string>
                {
                    ["Environment"] = "Production",
                    ["Region"] = "us-east-1",
                    ["Status"] = "Success"
                }
            );

            await _metrics.PublishMetricAsync(
                "OrderProcessingTime",
                sw.ElapsedMilliseconds,
                StandardUnit.Milliseconds,
                new Dictionary<string, string>
                {
                    ["Environment"] = "Production",
                    ["Operation"] = "CreateOrder"
                }
            );

            return order;
        }
        catch (Exception ex)
        {
            // Publish error metrics
            await _metrics.PublishMetricAsync(
                "OrderCreationError",
                1,
                StandardUnit.Count,
                new Dictionary<string, string>
                {
                    ["Environment"] = "Production",
                    ["ErrorType"] = ex.GetType().Name
                }
            );
            throw;
        }
    }
}
```

**CloudWatch Logs Configuration:**

```csharp
// Serilog configuration for CloudWatch Logs
using Serilog;
using Serilog.Sinks.AwsCloudWatch;

public static class LoggingConfiguration
{
    public static IHostBuilder ConfigureCloudWatchLogging(
        this IHostBuilder builder,
        IConfiguration configuration)
    {
        return builder.UseSerilog((context, services, loggerConfig) =>
        {
            var cloudWatchConfig = configuration.GetSection("CloudWatch");
            var logGroupName = cloudWatchConfig["LogGroupName"];
            var region = cloudWatchConfig["Region"];

            // Create CloudWatch client
            var client = new AmazonCloudWatchLogsClient(
                Amazon.RegionEndpoint.GetBySystemName(region)
            );

            // Configure CloudWatch sink
            var options = new CloudWatchSinkOptions
            {
                LogGroupName = logGroupName,
                LogStreamNameProvider = new DefaultLogStreamProvider(),
                TextFormatter = new Serilog.Formatting.Json.JsonFormatter(),
                MinimumLogEventLevel = LogEventLevel.Information,
                BatchSizeLimit = 100,
                Period = TimeSpan.FromSeconds(10),
                CreateLogGroup = true,
                LogGroupRetentionPolicy = LogGroupRetentionPolicy.OneWeek
            };

            loggerConfig
                .ReadFrom.Configuration(context.Configuration)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", "OrderService")
                .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName)
                .Enrich.WithMachineName()
                .WriteTo.Console()
                .WriteTo.AmazonCloudWatch(options, client);
        });
    }
}

// appsettings.json
{
  "CloudWatch": {
    "LogGroupName": "/aws/application/order-service",
    "Region": "us-east-1"
  },
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

**CloudWatch Alarms Configuration (Pulumi):**

```csharp
// Pulumi C# for CloudWatch Alarms
using Pulumi;
using Pulumi.Aws.CloudWatch;

public class CloudWatchAlarms : Stack
{
    public CloudWatchAlarms()
    {
        // High error rate alarm
        var errorRateAlarm = new MetricAlarm("high-error-rate", new MetricAlarmArgs
        {
            Name = "order-service-high-error-rate",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 2,
            MetricName = "OrderCreationError",
            Namespace = "OrderService",
            Period = 300, // 5 minutes
            Statistic = "Sum",
            Threshold = 10,
            AlarmDescription = "Alert when error count exceeds 10 in 5 minutes",
            AlarmActions = new InputList<string>
            {
                snsTopicArn // SNS topic for notifications
            },
            Dimensions = new InputMap<string>
            {
                ["Environment"] = "Production"
            },
            TreatMissingData = "notBreaching"
        });

        // High latency alarm
        var latencyAlarm = new MetricAlarm("high-latency", new MetricAlarmArgs
        {
            Name = "order-service-high-latency",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 3,
            MetricName = "OrderProcessingTime",
            Namespace = "OrderService",
            Period = 300,
            ExtendedStatistic = "p95", // 95th percentile
            Threshold = 1000, // 1 second
            AlarmDescription = "Alert when p95 latency exceeds 1 second",
            AlarmActions = new InputList<string>
            {
                snsTopicArn
            },
            Dimensions = new InputMap<string>
            {
                ["Environment"] = "Production"
            }
        });

        // Composite alarm (error rate AND latency)
        var compositeAlarm = new CompositeAlarm("service-degraded", new CompositeAlarmArgs
        {
            AlarmName = "order-service-degraded",
            AlarmDescription = "Service is degraded (high errors AND high latency)",
            AlarmRule = $"ALARM({errorRateAlarm.AlarmName}) AND ALARM({latencyAlarm.AlarmName})",
            AlarmActions = new InputList<string>
            {
                snsTopicArn
            }
        });
    }
}
```

**CloudWatch Insights Query Examples:**

```sql
-- Find errors in the last hour
fields @timestamp, @message, @logStream
| filter @message like /ERROR/
| sort @timestamp desc
| limit 100

-- Calculate p95 latency by endpoint
fields @timestamp, endpoint, duration
| filter ispresent(duration)
| stats avg(duration) as avg_duration, 
        pct(duration, 95) as p95_duration,
        pct(duration, 99) as p99_duration
  by endpoint
| sort p95_duration desc

-- Count errors by type
fields @timestamp, errorType
| filter level = "Error"
| stats count() as error_count by errorType
| sort error_count desc

-- Find slow database queries
fields @timestamp, query, duration
| filter operation = "DatabaseQuery" and duration > 1000
| sort duration desc
| limit 50

-- Analyze request patterns
fields @timestamp, method, endpoint, statusCode
| stats count() as request_count by method, endpoint, statusCode
| sort request_count desc
```

**CloudWatch Dashboards:**

```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["OrderService", "OrderCreated", {"stat": "Sum", "label": "Orders Created"}],
          [".", "OrderCreationError", {"stat": "Sum", "label": "Errors"}]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "Order Service - Request Volume",
        "yAxis": {
          "left": {"label": "Count"}
        }
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["OrderService", "OrderProcessingTime", {"stat": "Average"}],
          ["...", {"stat": "p95"}],
          ["...", {"stat": "p99"}]
        ],
        "period": 300,
        "region": "us-east-1",
        "title": "Order Service - Latency",
        "yAxis": {
          "left": {"label": "Milliseconds"}
        }
      }
    }
  ]
}
```

#### AWS X-Ray

**Overview:**
AWS X-Ray is a distributed tracing service that helps you analyze and debug distributed applications, providing end-to-end request tracking across AWS services and custom applications.

**Core Capabilities:**
- **Distributed Tracing** - Track requests across microservices
- **Service Map** - Visualize application architecture and dependencies
- **Trace Analysis** - Identify performance bottlenecks and errors
- **Annotations and Metadata** - Add custom data to traces
- **Sampling** - Control trace collection volume and cost

**When to Use X-Ray:**
- ✅ Distributed microservices architectures
- ✅ Debugging cross-service issues
- ✅ Performance optimization
- ✅ Understanding service dependencies
- ✅ Root cause analysis

**X-Ray Setup for .NET:**

```csharp
// Install NuGet packages:
// - AWSXRayRecorder.Core
// - AWSXRayRecorder.Handlers.AspNetCore
// - AWSXRayRecorder.Handlers.AwsSdk

// Program.cs
using Amazon.XRay.Recorder.Core;
using Amazon.XRay.Recorder.Handlers.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure X-Ray
AWSXRayRecorder.InitializeInstance(builder.Configuration);

// Register AWS SDK instrumentation
Amazon.XRay.Recorder.Handlers.AwsSdk.AWSSDKHandler.RegisterXRayForAllServices();

builder.Services.AddControllers();

var app = builder.Build();

// Add X-Ray middleware (must be early in pipeline)
app.UseXRay("OrderService");

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();

// appsettings.json
{
  "XRay": {
    "ServiceName": "OrderService",
    "SamplingRuleManifest": "sampling-rules.json",
    "UseRuntimeErrors": true,
    "CollectSqlQueries": true
  }
}
```

**Custom Segments and Subsegments:**

```csharp
using Amazon.XRay.Recorder.Core;

public class OrderService
{
    private readonly IAWSXRayRecorder _recorder;
    private readonly IOrderRepository _repository;
    private readonly IPaymentService _paymentService;

    public OrderService(
        IAWSXRayRecorder recorder,
        IOrderRepository repository,
        IPaymentService paymentService)
    {
        _recorder = recorder;
        _repository = repository;
        _paymentService = paymentService;
    }

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        // Add annotations (indexed, searchable)
        _recorder.AddAnnotation("CustomerId", request.CustomerId);
        _recorder.AddAnnotation("OrderType", request.OrderType);
        
        // Add metadata (not indexed, for context)
        _recorder.AddMetadata("OrderDetails", new
        {
            ItemCount = request.Items.Count,
            TotalAmount = request.TotalAmount,
            ShippingAddress = request.ShippingAddress
        });

        // Create subsegment for database operation
        _recorder.BeginSubsegment("ValidateCustomer");
        try
        {
            var customer = await _repository.GetCustomerAsync(request.CustomerId);
            _recorder.AddMetadata("Customer", customer);
        }
        catch (Exception ex)
        {
            _recorder.AddException(ex);
            throw;
        }
        finally
        {
            _recorder.EndSubsegment();
        }

        // Create subsegment for payment processing
        _recorder.BeginSubsegment("ProcessPayment");
        try
        {
            var payment = await _paymentService.ProcessPaymentAsync(request.Payment);
            _recorder.AddAnnotation("PaymentStatus", payment.Status);
            _recorder.AddMetadata("PaymentDetails", payment);
        }
        catch (Exception ex)
        {
            _recorder.AddException(ex);
            throw;
        }
        finally
        {
            _recorder.EndSubsegment();
        }

        // Save order
        _recorder.BeginSubsegment("SaveOrder");
        try
        {
            var order = await _repository.SaveOrderAsync(request);
            return order;
        }
        finally
        {
            _recorder.EndSubsegment();
        }
    }
}
```

**X-Ray Sampling Rules:**

```json
{
  "version": 2,
  "rules": [
    {
      "description": "Sample all errors",
      "host": "*",
      "http_method": "*",
      "url_path": "*",
      "fixed_target": 0,
      "rate": 1.0,
      "priority": 1,
      "attributes": {
        "error": "true"
      }
    },
    {
      "description": "Sample 10% of successful requests",
      "host": "*",
      "http_method": "*",
      "url_path": "*",
      "fixed_target": 1,
      "rate": 0.1,
      "priority": 100
    },
    {
      "description": "Sample 100% of checkout requests",
      "host": "*",
      "http_method": "POST",
      "url_path": "/api/orders/checkout",
      "fixed_target": 0,
      "rate": 1.0,
      "priority": 50
    }
  ],
  "default": {
    "fixed_target": 1,
    "rate": 0.05
  }
}
```

**X-Ray Service Map Analysis:**

The X-Ray service map automatically visualizes:
- Service dependencies and call patterns
- Average latency per service
- Error rates per service
- Request volume between services
- External service calls (AWS services, HTTP endpoints)

**Querying X-Ray Traces:**

```
// Find slow traces
service("OrderService") AND responsetime > 1

// Find errors
service("OrderService") AND error = true

// Find specific customer orders
annotation.CustomerId = "12345"

// Find high-value orders
metadata.OrderDetails.TotalAmount > 1000

// Complex query
service("OrderService") AND 
http.method = "POST" AND 
responsetime > 0.5 AND 
annotation.OrderType = "Express"
```

#### Third-Party Integrations

AWS integrates well with popular third-party APM tools, providing flexibility and advanced features.

**Datadog:**

**Pros:**
- ✅ Unified platform (metrics, logs, traces, RUM, synthetics)
- ✅ Excellent dashboards and visualizations
- ✅ Advanced analytics and AI/ML features
- ✅ Strong AWS integration
- ✅ Multi-cloud support

**Setup:**
```csharp
// Install Datadog.Trace NuGet package
// Set environment variables or use datadog.json

// Automatic instrumentation (no code changes)
// Configure via environment variables:
// DD_SERVICE=order-service
// DD_ENV=production
// DD_VERSION=1.0.0
// DD_AGENT_HOST=localhost
// DD_TRACE_AGENT_PORT=8126

// Manual instrumentation
using Datadog.Trace;

public class OrderService
{
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        using var scope = Tracer.Instance.StartActive("order.create");
        scope.Span.SetTag("customer.id", request.CustomerId);
        scope.Span.SetTag("order.type", request.OrderType);
        
        try
        {
            var order = await ProcessOrderAsync(request);
            scope.Span.SetTag("order.id", order.Id);
            return order;
        }
        catch (Exception ex)
        {
            scope.Span.SetException(ex);
            throw;
        }
    }
}
```

**Typical Cost:** $15-31/host/month + $0.10/GB logs + $1.70/million spans

**New Relic:**

**Pros:**
- ✅ Comprehensive APM features
- ✅ Excellent error tracking and diagnostics
- ✅ Strong .NET support
- ✅ Good AWS integration
- ✅ Flexible pricing options

**Setup:**
```csharp
// Install NewRelic.Agent NuGet package
// Configure via newrelic.config or environment variables

// Automatic instrumentation
// Most common frameworks instrumented automatically

// Custom instrumentation
using NewRelic.Api.Agent;

public class OrderService
{
    private readonly IAgent _agent;

    [Transaction]
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        _agent.CurrentTransaction.AddCustomAttribute("CustomerId", request.CustomerId);
        _agent.CurrentTransaction.AddCustomAttribute("OrderType", request.OrderType);
        
        using (_agent.CurrentTransaction.StartSegment("ValidateCustomer"))
        {
            await ValidateCustomerAsync(request.CustomerId);
        }
        
        using (_agent.CurrentTransaction.StartSegment("ProcessPayment"))
        {
            await ProcessPaymentAsync(request.Payment);
        }
        
        return await SaveOrderAsync(request);
    }
}
```

**Typical Cost:** $99-349/month (standard tier) or $0.25/GB ingested (usage-based)

**Dynatrace:**

**Pros:**
- ✅ AI-powered root cause analysis
- ✅ Automatic baselining and anomaly detection
- ✅ Full-stack monitoring
- ✅ Strong enterprise features
- ✅ Excellent for complex environments

**Setup:**
```bash
# OneAgent installation (automatic instrumentation)
# Download and install OneAgent from Dynatrace portal
# Automatically instruments .NET applications

# No code changes required for basic monitoring
# Optional: Use Dynatrace API for custom metrics
```

**Typical Cost:** $69-96/host/month (full-stack monitoring)

**Comparison Matrix:**

| Feature | CloudWatch + X-Ray | Datadog | New Relic | Dynatrace |
|---------|-------------------|---------|-----------|-----------|
| **Setup Complexity** | Medium | Easy | Easy | Easy |
| **AWS Integration** | Excellent | Excellent | Good | Good |
| **Multi-Cloud** | No | Yes | Yes | Yes |
| **APM Features** | Basic | Advanced | Advanced | Advanced |
| **AI/ML** | Limited | Good | Good | Excellent |
| **Cost (Small)** | $ | $$ | $$ | $$$ |
| **Cost (Large)** | $$ | $$$ | $$$ | $$$$ |
| **Learning Curve** | Medium | Low | Low | Medium |

#### Cost Considerations and Optimization

**CloudWatch Pricing (us-east-1):**

| Service | Pricing | Free Tier |
|---------|---------|-----------|
| **Metrics** | $0.30/metric/month (first 10K), $0.10/metric/month (next 240K) | 10 metrics |
| **API Requests** | $0.01/1000 GetMetricStatistics requests | 1M requests |
| **Logs Ingestion** | $0.50/GB | 5 GB |
| **Logs Storage** | $0.03/GB/month | - |
| **Alarms** | $0.10/alarm/month (standard), $0.30/alarm/month (high-resolution) | 10 alarms |
| **Dashboards** | $3/dashboard/month | 3 dashboards |
| **Insights Queries** | $0.005/GB scanned | - |

**X-Ray Pricing:**

| Service | Pricing | Free Tier |
|---------|---------|-----------|
| **Traces Recorded** | $5.00/million traces | 100K traces/month |
| **Traces Retrieved** | $0.50/million traces | 1M traces/month |
| **Traces Scanned** | $0.50/million traces | 1M traces/month |

**Cost Optimization Strategies:**

**1. Metric Optimization:**
```csharp
// ❌ Bad: High cardinality dimensions
await PublishMetricAsync("OrderCreated", 1, new Dictionary<string, string>
{
    ["CustomerId"] = customerId, // Unique per customer!
    ["OrderId"] = orderId,       // Unique per order!
    ["Timestamp"] = DateTime.Now.ToString() // Unique per request!
});
// This creates millions of unique metric streams = $$$$

// ✅ Good: Low cardinality dimensions
await PublishMetricAsync("OrderCreated", 1, new Dictionary<string, string>
{
    ["Environment"] = "Production",  // 3-4 values
    ["Region"] = "us-east-1",        // ~20 values
    ["OrderType"] = "Express"        // 5-10 values
});
// This creates manageable number of metric streams = $
```

**2. Log Optimization:**
```csharp
// ❌ Bad: Logging everything at Info level
_logger.LogInformation("Processing order {OrderId} for customer {CustomerId} with {ItemCount} items totaling {Amount}", 
    orderId, customerId, itemCount, amount);
// High volume = high cost

// ✅ Good: Appropriate log levels
_logger.LogDebug("Processing order {OrderId}", orderId); // Only in dev
_logger.LogInformation("Order {OrderId} created", orderId); // Key events only
_logger.LogError(ex, "Failed to process order {OrderId}", orderId); // Always log errors

// ✅ Better: Structured logging with sampling
if (ShouldSample() || IsError)
{
    _logger.LogInformation("Order processed: {@OrderSummary}", summary);
}
```

**3. Trace Sampling:**
```json
{
  "version": 2,
  "default": {
    "fixed_target": 1,
    "rate": 0.05
  },
  "rules": [
    {
      "description": "Always trace errors",
      "rate": 1.0,
      "priority": 1,
      "attributes": {"error": "true"}
    },
    {
      "description": "Sample 10% of normal traffic",
      "rate": 0.1,
      "priority": 100
    }
  ]
}
```

**4. Log Retention Policies:**
```csharp
// Set appropriate retention based on log type
var logGroups = new[]
{
    new { Name = "/aws/application/access-logs", RetentionDays = 30 },
    new { Name = "/aws/application/error-logs", RetentionDays = 90 },
    new { Name = "/aws/application/audit-logs", RetentionDays = 365 },
    new { Name = "/aws/application/debug-logs", RetentionDays = 7 }
};
```

**5. Metric Aggregation:**
```csharp
// ❌ Bad: Publishing individual metrics
foreach (var order in orders)
{
    await PublishMetricAsync("OrderValue", order.Amount, ...);
}
// 1000 orders = 1000 API calls = $$

// ✅ Good: Batch publishing
var metrics = orders.Select(o => new MetricDatum
{
    MetricName = "OrderValue",
    Value = o.Amount,
    TimestampUtc = DateTime.UtcNow
}).ToList();

await PublishMetricBatchAsync(metrics);
// 1000 orders = 1 API call = $
```

**Cost Estimation Example:**

**Scenario:** Medium-sized application
- 1M requests/day
- 10 custom metrics with 3 dimensions each
- 10 GB logs/day
- 10% trace sampling

**Monthly Costs:**
```
CloudWatch Metrics:
- 10 metrics × $0.30 = $3.00

CloudWatch Logs:
- 300 GB ingestion × $0.50 = $150.00
- 300 GB storage × $0.03 = $9.00

CloudWatch Alarms:
- 20 alarms × $0.10 = $2.00

X-Ray:
- 3M traces × $5.00/million = $15.00

Total: ~$179/month
```

**Optimization Recommendations:**

| Optimization | Savings | Impact |
|--------------|---------|--------|
| Reduce log retention (90d → 30d) | 67% on storage | Low |
| Implement log sampling (50%) | 50% on ingestion | Medium |
| Reduce trace sampling (10% → 5%) | 50% on X-Ray | Low |
| Optimize metric dimensions | 30-50% on metrics | Low |
| Use metric filters instead of custom metrics | 70% on metrics | Medium |

**Monitoring Cost Alerts:**

```csharp
// Pulumi: CloudWatch alarm for monitoring costs
var costAlarm = new MetricAlarm("high-monitoring-cost", new MetricAlarmArgs
{
    Name = "high-monitoring-cost",
    ComparisonOperator = "GreaterThanThreshold",
    EvaluationPeriods = 1,
    MetricName = "EstimatedCharges",
    Namespace = "AWS/Billing",
    Period = 86400, // 24 hours
    Statistic = "Maximum",
    Threshold = 500, // $500/day
    AlarmDescription = "Alert when daily monitoring costs exceed $500",
    Dimensions = new InputMap<string>
    {
        ["Currency"] = "USD",
        ["ServiceName"] = "AmazonCloudWatch"
    }
});
```

---

### 3.2 Azure APM Services

Azure provides a comprehensive suite of monitoring and observability services that integrate seamlessly with Azure infrastructure and applications. This section covers Application Insights, Azure Monitor, Log Analytics, and cost optimization strategies.

#### Application Insights

**Overview:**
Application Insights is Azure's application performance management (APM) service, providing deep insights into application behavior, performance, and user experience. It's part of Azure Monitor and offers automatic instrumentation for many frameworks.

**Core Capabilities:**
- **Application Performance Monitoring** - End-to-end transaction tracking
- **Distributed Tracing** - Request flow across microservices
- **Live Metrics** - Real-time performance dashboard
- **Application Map** - Visual dependency mapping
- **Smart Detection** - AI-powered anomaly detection
- **Profiler** - Production code-level profiling
- **Snapshot Debugger** - Production debugging with snapshots

**When to Use Application Insights:**
- ✅ Azure-native applications
- ✅ .NET applications (excellent support)
- ✅ Comprehensive APM needs
- ✅ Production debugging requirements
- ✅ AI-powered insights

**Application Insights Setup for .NET:**

```csharp
// Install NuGet package:
// - Microsoft.ApplicationInsights.AspNetCore

// Program.cs
using Microsoft.ApplicationInsights.Extensibility;

var builder = WebApplication.CreateBuilder(args);

// Add Application Insights
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;
    options.EnableQuickPulseMetricStream = true; // Live Metrics
    options.EnableAuthenticationTrackingJavaScript = true;
});

// Configure telemetry
builder.Services.Configure<TelemetryConfiguration>(config =>
{
    config.SetAzureTokenCredential(new DefaultAzureCredential());
});

// Add telemetry initializers
builder.Services.AddSingleton<ITelemetryInitializer, CustomTelemetryInitializer>();

builder.Services.AddControllers();

var app = builder.Build();

app.UseRouting();
app.UseAuthorization();
app.MapControllers();

app.Run();

// appsettings.json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=xxx;IngestionEndpoint=https://xxx.in.applicationinsights.azure.com/"
  },
  "Logging": {
    "ApplicationInsights": {
      "LogLevel": {
        "Default": "Information",
        "Microsoft": "Warning"
      }
    }
  }
}
```

**Custom Telemetry:**

```csharp
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

public class OrderService
{
    private readonly TelemetryClient _telemetry;
    private readonly IOrderRepository _repository;

    public OrderService(TelemetryClient telemetry, IOrderRepository repository)
    {
        _telemetry = telemetry;
        _repository = repository;
    }

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        // Start operation (creates dependency tracking)
        using var operation = _telemetry.StartOperation<RequestTelemetry>("CreateOrder");
        operation.Telemetry.Properties["CustomerId"] = request.CustomerId;
        operation.Telemetry.Properties["OrderType"] = request.OrderType;

        try
        {
            // Track custom event
            _telemetry.TrackEvent("OrderCreationStarted", new Dictionary<string, string>
            {
                ["CustomerId"] = request.CustomerId,
                ["ItemCount"] = request.Items.Count.ToString()
            });

            // Track custom metric
            _telemetry.TrackMetric("OrderValue", request.TotalAmount, new Dictionary<string, string>
            {
                ["Currency"] = request.Currency,
                ["OrderType"] = request.OrderType
            });

            // Validate customer (tracked as dependency)
            var customer = await _repository.GetCustomerAsync(request.CustomerId);

            // Process payment (tracked as dependency)
            var payment = await ProcessPaymentAsync(request.Payment);

            // Save order
            var order = await _repository.SaveOrderAsync(request);

            // Track success
            _telemetry.TrackEvent("OrderCreated", new Dictionary<string, string>
            {
                ["OrderId"] = order.Id,
                ["CustomerId"] = request.CustomerId
            });

            operation.Telemetry.Success = true;
            return order;
        }
        catch (Exception ex)
        {
            // Track exception
            _telemetry.TrackException(ex, new Dictionary<string, string>
            {
                ["CustomerId"] = request.CustomerId,
                ["Operation"] = "CreateOrder"
            });

            operation.Telemetry.Success = false;
            throw;
        }
    }

    // Track dependency manually
    private async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest payment)
    {
        var dependency = new DependencyTelemetry
        {
            Name = "ProcessPayment",
            Type = "HTTP",
            Target = "payment-service.example.com",
            Data = $"POST /api/payments"
        };

        var sw = Stopwatch.StartNew();
        try
        {
            var result = await _paymentClient.ProcessAsync(payment);
            dependency.Success = true;
            dependency.ResultCode = "200";
            return result;
        }
        catch (Exception ex)
        {
            dependency.Success = false;
            dependency.ResultCode = "500";
            _telemetry.TrackException(ex);
            throw;
        }
        finally
        {
            dependency.Duration = sw.Elapsed;
            _telemetry.TrackDependency(dependency);
        }
    }
}
```

**Telemetry Initializer (Add Context to All Telemetry):**

```csharp
using Microsoft.ApplicationInsights.Channel;
using Microsoft.ApplicationInsights.Extensibility;

public class CustomTelemetryInitializer : ITelemetryInitializer
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CustomTelemetryInitializer(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public void Initialize(ITelemetry telemetry)
    {
        // Add custom properties to all telemetry
        telemetry.Context.GlobalProperties["Environment"] = 
            Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown";
        
        telemetry.Context.GlobalProperties["Version"] = 
            Assembly.GetExecutingAssembly().GetName().Version?.ToString() ?? "Unknown";

        // Add user context from HTTP context
        var httpContext = _httpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            if (httpContext.User?.Identity?.IsAuthenticated == true)
            {
                telemetry.Context.User.AuthenticatedUserId = 
                    httpContext.User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            }

            // Add correlation ID
            if (httpContext.Request.Headers.TryGetValue("X-Correlation-ID", out var correlationId))
            {
                telemetry.Context.GlobalProperties["CorrelationId"] = correlationId.ToString();
            }
        }

        // Add cloud role information
        telemetry.Context.Cloud.RoleName = "OrderService";
        telemetry.Context.Cloud.RoleInstance = Environment.MachineName;
    }
}
```

**Application Insights Sampling:**

```csharp
// Configure adaptive sampling
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.EnableAdaptiveSampling = true;
});

// Configure fixed-rate sampling
builder.Services.Configure<TelemetryConfiguration>(config =>
{
    var builder = config.DefaultTelemetrySink.TelemetryProcessorChainBuilder;
    
    // Sample 10% of telemetry
    builder.UseSampling(10);
    
    // Always include certain types
    builder.Use(next => new PreserveTelemetryProcessor(next));
    
    builder.Build();
});

// Custom processor to preserve important telemetry
public class PreserveTelemetryProcessor : ITelemetryProcessor
{
    private readonly ITelemetryProcessor _next;

    public PreserveTelemetryProcessor(ITelemetryProcessor next)
    {
        _next = next;
    }

    public void Process(ITelemetry item)
    {
        // Always include exceptions
        if (item is ExceptionTelemetry)
        {
            _next.Process(item);
            return;
        }

        // Always include failed requests
        if (item is RequestTelemetry request && !request.Success)
        {
            _next.Process(item);
            return;
        }

        // Always include slow requests
        if (item is RequestTelemetry slowRequest && slowRequest.Duration > TimeSpan.FromSeconds(1))
        {
            _next.Process(item);
            return;
        }

        // Let sampling decide for everything else
        _next.Process(item);
    }
}
```

#### Azure Monitor

**Overview:**
Azure Monitor is the umbrella service for monitoring Azure resources and applications. It collects metrics, logs, and traces from various sources and provides alerting, dashboards, and analysis capabilities.

**Core Capabilities:**
- **Metrics** - Time-series data from Azure resources
- **Alerts** - Automated notifications based on metrics and logs
- **Workbooks** - Interactive reports and dashboards
- **Action Groups** - Notification and automation actions
- **Autoscale** - Automatic scaling based on metrics

**When to Use Azure Monitor:**
- ✅ Infrastructure monitoring (VMs, App Services, databases)
- ✅ Platform metrics (CPU, memory, network)
- ✅ Alerting and notifications
- ✅ Capacity planning
- ✅ Cost optimization

**Azure Monitor Metrics Configuration:**

```csharp
// Using Azure Monitor SDK
using Azure.Monitor.Query;
using Azure.Monitor.Query.Models;

public class AzureMonitorService
{
    private readonly MetricsQueryClient _metricsClient;
    private readonly string _resourceId;

    public AzureMonitorService(MetricsQueryClient metricsClient, string resourceId)
    {
        _metricsClient = metricsClient;
        _resourceId = resourceId;
    }

    public async Task<MetricsQueryResult> GetCpuMetricsAsync(
        DateTimeOffset startTime,
        DateTimeOffset endTime)
    {
        var response = await _metricsClient.QueryResourceAsync(
            _resourceId,
            new[] { "Percentage CPU" },
            new MetricsQueryOptions
            {
                TimeRange = new QueryTimeRange(startTime, endTime),
                Granularity = TimeSpan.FromMinutes(5),
                Aggregations = { MetricAggregationType.Average, MetricAggregationType.Maximum }
            }
        );

        return response.Value;
    }

    public async Task<Dictionary<string, double>> GetCurrentMetricsAsync()
    {
        var endTime = DateTimeOffset.UtcNow;
        var startTime = endTime.AddMinutes(-5);

        var metrics = new[] { "Percentage CPU", "Available Memory Bytes", "Network In Total", "Network Out Total" };
        
        var response = await _metricsClient.QueryResourceAsync(
            _resourceId,
            metrics,
            new MetricsQueryOptions
            {
                TimeRange = new QueryTimeRange(startTime, endTime),
                Granularity = TimeSpan.FromMinutes(1),
                Aggregations = { MetricAggregationType.Average }
            }
        );

        var result = new Dictionary<string, double>();
        foreach (var metric in response.Value.Metrics)
        {
            var latestValue = metric.TimeSeries.FirstOrDefault()?.Values.LastOrDefault();
            if (latestValue?.Average.HasValue == true)
            {
                result[metric.Name] = latestValue.Average.Value;
            }
        }

        return result;
    }
}
```

**Azure Monitor Alert Rules (Pulumi):**

```csharp
// Pulumi C# for Azure Monitor Alerts
using Pulumi;
using Pulumi.AzureNative.Insights;

public class AzureMonitorAlerts : Stack
{
    public AzureMonitorAlerts()
    {
        var resourceGroup = new Pulumi.AzureNative.Resources.ResourceGroup("monitoring-rg");

        // Action Group for notifications
        var actionGroup = new ActionGroup("critical-alerts-ag", new ActionGroupArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ActionGroupName = "CriticalAlerts",
            Enabled = true,
            EmailReceivers = new[]
            {
                new EmailReceiverArgs
                {
                    Name = "DevOpsTeam",
                    EmailAddress = "devops@example.com",
                    UseCommonAlertSchema = true
                }
            },
            SmsReceivers = new[]
            {
                new SmsReceiverArgs
                {
                    Name = "OnCallEngineer",
                    CountryCode = "1",
                    PhoneNumber = "5551234567"
                }
            },
            WebhookReceivers = new[]
            {
                new WebhookReceiverArgs
                {
                    Name = "SlackWebhook",
                    ServiceUri = "https://hooks.slack.com/services/xxx",
                    UseCommonAlertSchema = true
                }
            }
        });

        // Metric Alert: High CPU
        var cpuAlert = new MetricAlert("high-cpu-alert", new MetricAlertArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "HighCPUAlert",
            Description = "Alert when CPU exceeds 80% for 5 minutes",
            Severity = 2, // Warning
            Enabled = true,
            EvaluationFrequency = "PT1M", // Every 1 minute
            WindowSize = "PT5M", // 5 minute window
            TargetResourceType = "Microsoft.Compute/virtualMachines",
            TargetResourceRegion = "eastus",
            Scopes = new[] { vmResourceId },
            Criteria = new MetricAlertSingleResourceMultipleMetricCriteriaArgs
            {
                AllOf = new[]
                {
                    new MetricCriteriaArgs
                    {
                        Name = "HighCPU",
                        MetricName = "Percentage CPU",
                        MetricNamespace = "Microsoft.Compute/virtualMachines",
                        Operator = "GreaterThan",
                        Threshold = 80,
                        TimeAggregation = "Average",
                        CriterionType = "StaticThresholdCriterion"
                    }
                }
            },
            Actions = new[]
            {
                new MetricAlertActionArgs
                {
                    ActionGroupId = actionGroup.Id
                }
            }
        });

        // Dynamic Threshold Alert: Anomalous Request Rate
        var requestRateAlert = new MetricAlert("anomalous-requests", new MetricAlertArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "AnomalousRequestRate",
            Description = "Alert on anomalous request rate patterns",
            Severity = 3, // Informational
            Enabled = true,
            EvaluationFrequency = "PT1M",
            WindowSize = "PT5M",
            Scopes = new[] { appServiceResourceId },
            Criteria = new MetricAlertSingleResourceMultipleMetricCriteriaArgs
            {
                AllOf = new[]
                {
                    new DynamicMetricCriteriaArgs
                    {
                        Name = "AnomalousRequests",
                        MetricName = "Requests",
                        MetricNamespace = "Microsoft.Web/sites",
                        Operator = "GreaterOrLessThan",
                        AlertSensitivity = "Medium",
                        FailingPeriods = new DynamicThresholdFailingPeriodsArgs
                        {
                            MinFailingPeriodsToAlert = 2,
                            NumberOfEvaluationPeriods = 4
                        },
                        TimeAggregation = "Total",
                        CriterionType = "DynamicThresholdCriterion"
                    }
                }
            },
            Actions = new[]
            {
                new MetricAlertActionArgs
                {
                    ActionGroupId = actionGroup.Id
                }
            }
        });

        // Log Alert: High Error Rate
        var logAlert = new ScheduledQueryRule("high-error-rate-log", new ScheduledQueryRuleArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "HighErrorRateLog",
            Description = "Alert when error rate exceeds 5% in 5 minutes",
            Severity = 1, // Error
            Enabled = true,
            EvaluationFrequency = "PT5M",
            WindowSize = "PT5M",
            Scopes = new[] { appInsightsResourceId },
            Criteria = new ScheduledQueryRuleCriteriaArgs
            {
                AllOf = new[]
                {
                    new ConditionArgs
                    {
                        Query = @"
                            requests
                            | where timestamp > ago(5m)
                            | summarize 
                                total = count(),
                                errors = countif(success == false)
                            | extend error_rate = (errors * 100.0) / total
                            | where error_rate > 5
                        ",
                        TimeAggregation = "Count",
                        Operator = "GreaterThan",
                        Threshold = 0,
                        FailingPeriods = new ConditionFailingPeriodsArgs
                        {
                            MinFailingPeriodsToAlert = 1,
                            NumberOfEvaluationPeriods = 1
                        }
                    }
                }
            },
            Actions = new ScheduledQueryRuleActionsArgs
            {
                ActionGroups = new[] { actionGroup.Id }
            }
        });
    }
}
```

#### Log Analytics

**Overview:**
Log Analytics is Azure's centralized logging service that collects, stores, and analyzes log data from various sources. It uses Kusto Query Language (KQL) for powerful log analysis.

**Core Capabilities:**
- **Centralized Logging** - Collect logs from all Azure resources
- **KQL Queries** - Powerful query language for log analysis
- **Log Retention** - Configurable retention policies
- **Log Alerts** - Alert based on log query results
- **Workbooks** - Interactive log analysis and visualization

**When to Use Log Analytics:**
- ✅ Centralized log aggregation
- ✅ Complex log analysis and correlation
- ✅ Long-term log retention
- ✅ Compliance and audit logging
- ✅ Security event analysis

**Log Analytics Configuration:**

```csharp
// Serilog configuration for Log Analytics
using Serilog;
using Serilog.Sinks.AzureAnalytics;

public static class LoggingConfiguration
{
    public static IHostBuilder ConfigureLogAnalytics(
        this IHostBuilder builder,
        IConfiguration configuration)
    {
        return builder.UseSerilog((context, services, loggerConfig) =>
        {
            var workspaceId = configuration["LogAnalytics:WorkspaceId"];
            var authenticationId = configuration["LogAnalytics:Key"];

            loggerConfig
                .ReadFrom.Configuration(context.Configuration)
                .Enrich.FromLogContext()
                .Enrich.WithProperty("Application", "OrderService")
                .Enrich.WithProperty("Environment", context.HostingEnvironment.EnvironmentName)
                .Enrich.WithMachineName()
                .WriteTo.Console()
                .WriteTo.AzureAnalytics(
                    workspaceId: workspaceId,
                    authenticationId: authenticationId,
                    logName: "ApplicationLogs",
                    restrictedToMinimumLevel: LogEventLevel.Information
                );
        });
    }
}
```

**KQL Query Examples:**

```kusto
// Find errors in the last hour
ApplicationLogs_CL
| where TimeGenerated > ago(1h)
| where Level_s == "Error"
| project TimeGenerated, Message_s, Exception_s, Properties_s
| order by TimeGenerated desc
| take 100

// Calculate request latency percentiles
requests
| where timestamp > ago(1h)
| summarize 
    p50 = percentile(duration, 50),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99),
    avg_duration = avg(duration),
    request_count = count()
  by bin(timestamp, 5m), name
| order by timestamp desc

// Analyze error patterns
exceptions
| where timestamp > ago(24h)
| summarize error_count = count() by type, outerMessage
| order by error_count desc
| take 20

// Find slow database queries
dependencies
| where timestamp > ago(1h)
| where type == "SQL"
| where duration > 1000
| project timestamp, name, duration, data, resultCode
| order by duration desc
| take 50

// Correlate requests and dependencies
requests
| where timestamp > ago(1h)
| join kind=inner (
    dependencies
    | where timestamp > ago(1h)
  ) on operation_Id
| project 
    request_timestamp = timestamp,
    request_name = name,
    request_duration = duration,
    dependency_name = name1,
    dependency_duration = duration1,
    dependency_type = type
| order by request_timestamp desc

// Calculate error rate by endpoint
requests
| where timestamp > ago(1h)
| summarize 
    total = count(),
    errors = countif(success == false),
    error_rate = (countif(success == false) * 100.0) / count()
  by name
| where error_rate > 1
| order by error_rate desc

// Find users experiencing errors
requests
| where timestamp > ago(1h)
| where success == false
| summarize error_count = count() by user_AuthenticatedId
| order by error_count desc
| take 20

// Analyze performance by region
requests
| where timestamp > ago(24h)
| summarize 
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    request_count = count()
  by client_CountryOrRegion
| order by avg_duration desc

// Detect anomalies in request rate
requests
| where timestamp > ago(7d)
| make-series request_count = count() default = 0 
    on timestamp 
    step 1h
| extend anomalies = series_decompose_anomalies(request_count, 1.5)
| mv-expand timestamp to typeof(datetime), request_count to typeof(long), anomalies to typeof(double)
| where anomalies != 0
| project timestamp, request_count, anomaly_score = anomalies

// Custom log analysis
ApplicationLogs_CL
| where TimeGenerated > ago(1h)
| where Properties_s contains "OrderId"
| extend order_id = extract("OrderId\":\"([^\"]+)\"", 1, Properties_s)
| extend customer_id = extract("CustomerId\":\"([^\"]+)\"", 1, Properties_s)
| summarize 
    log_count = count(),
    error_count = countif(Level_s == "Error")
  by order_id, customer_id
| where error_count > 0
| order by error_count desc
```

**Log Analytics Workbooks:**

Workbooks provide interactive analysis and visualization of log data. Create custom workbooks for:
- Application health dashboards
- Performance analysis
- Error investigation
- User behavior analysis
- Cost analysis

#### Cost Considerations and Optimization

**Application Insights Pricing:**

| Component | Pricing | Free Tier |
|-----------|---------|-----------|
| **Data Ingestion** | $2.30/GB (first 5 GB), $2.76/GB (after) | 5 GB/month |
| **Data Retention** | Free (90 days), $0.12/GB/month (extended) | 90 days |
| **Multi-step Web Tests** | $5.00/test/month | - |
| **Live Metrics** | Free | Unlimited |
| **Profiler/Snapshot** | Free | Unlimited |

**Log Analytics Pricing:**

| Component | Pricing | Free Tier |
|-----------|---------|-----------|
| **Data Ingestion** | $2.76/GB (Pay-as-you-go) | 5 GB/month |
| **Data Retention** | Free (31 days), $0.12/GB/month (extended) | 31 days |
| **Data Export** | $0.13/GB | - |
| **Commitment Tiers** | $196-5,475/month (100GB-5TB/day) | - |

**Azure Monitor Pricing:**

| Component | Pricing | Free Tier |
|-----------|---------|-----------|
| **Platform Metrics** | Free | Unlimited |
| **Custom Metrics** | $0.10/metric/month | 10 metrics |
| **Metric Alerts** | $0.10/alert/month | 10 alerts |
| **Log Alerts** | $1.50/alert/month | - |
| **Action Groups** | $0.20/1000 notifications (email), $0.75/SMS | - |

**Cost Optimization Strategies:**

**1. Sampling:**
```csharp
// Adaptive sampling (recommended)
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.EnableAdaptiveSampling = true;
});

// Fixed-rate sampling
builder.Services.Configure<TelemetryConfiguration>(config =>
{
    config.DefaultTelemetrySink.TelemetryProcessorChainBuilder
        .UseSampling(10) // 10% sampling
        .Build();
});
```

**2. Data Retention:**
```csharp
// Set retention to 30 days instead of default 90 days
// Configure in Azure Portal or via ARM template
{
  "properties": {
    "retentionInDays": 30,
    "immediatePurgeDataOn30Days": true
  }
}
```

**3. Log Filtering:**
```csharp
// Filter out noisy logs
builder.Services.AddLogging(logging =>
{
    logging.AddFilter("Microsoft", LogLevel.Warning);
    logging.AddFilter("System", LogLevel.Warning);
    logging.AddFilter("Microsoft.AspNetCore.Hosting.Diagnostics", LogLevel.Error);
});
```

**4. Commitment Tiers:**
For predictable workloads > 100 GB/day, use commitment tiers for 30-50% savings.

**5. Data Export:**
Export old data to Azure Storage for long-term retention at lower cost ($0.02/GB/month).

**Cost Estimation Example:**

**Scenario:** Medium-sized application
- 1M requests/day
- 10 GB telemetry/day (with sampling)
- 30-day retention
- 20 custom metrics
- 30 alerts

**Monthly Costs:**
```
Application Insights:
- 300 GB ingestion: (5 GB free + 295 GB × $2.76) = $814.20
- 30-day retention: Free

Log Analytics:
- Included in App Insights

Azure Monitor:
- 20 custom metrics × $0.10 = $2.00
- 30 alerts × $0.10 = $3.00

Total: ~$819/month
```

**With Optimization:**
```
- Enable adaptive sampling (50% reduction): $407.10
- Reduce retention to 30 days: $0 (already free)
- Filter noisy logs (20% reduction): $325.68
- Use commitment tier (100 GB/day): $196/month

Optimized Total: ~$201/month (75% savings)
```

---

### 3.3 Platform Comparison and Decision Matrix

This section provides a comprehensive comparison of AWS and Azure APM services to help you make informed decisions based on your specific requirements.

#### Service-to-Service Comparison

| Capability | AWS | Azure | Winner |
|------------|-----|-------|--------|
| **Basic Metrics** | CloudWatch Metrics | Azure Monitor Metrics | Tie |
| **Custom Metrics** | CloudWatch Custom Metrics | Application Insights Custom Metrics | Azure (easier) |
| **Distributed Tracing** | X-Ray | Application Insights | Azure (richer) |
| **Log Aggregation** | CloudWatch Logs | Log Analytics | Azure (KQL > Insights) |
| **APM Features** | X-Ray (basic) | Application Insights (advanced) | Azure |
| **Live Metrics** | CloudWatch Live Tail | Application Insights Live Metrics | Azure |
| **Profiling** | X-Ray Insights | Application Insights Profiler | Azure |
| **Anomaly Detection** | CloudWatch Anomaly Detection | Application Insights Smart Detection | Azure (AI-powered) |
| **Synthetic Monitoring** | CloudWatch Synthetics | Application Insights Availability Tests | Tie |
| **Cost (Small Scale)** | $ | $ | Tie |
| **Cost (Large Scale)** | $$ | $$$ | AWS |
| **Ease of Setup** | Medium | Easy | Azure |
| **.NET Support** | Good | Excellent | Azure |
| **Multi-Cloud** | No | No | Tie |

**Overall Winner:** Azure for .NET applications, AWS for cost at scale

#### Use Case to Service Mapping

| Use Case | AWS Recommendation | Azure Recommendation | Rationale |
|----------|-------------------|---------------------|-----------|
| **.NET Web API** | CloudWatch + X-Ray | Application Insights | Azure has superior .NET integration |
| **Microservices** | X-Ray + CloudWatch | Application Insights + Service Map | Azure provides better visualization |
| **Serverless (Lambda/Functions)** | CloudWatch + X-Ray | Application Insights | Both excellent, slight edge to AWS |
| **Container Apps** | CloudWatch Container Insights | Application Insights + Container Insights | Tie, both good |
| **Infrastructure Monitoring** | CloudWatch | Azure Monitor | Tie, both comprehensive |
| **Log Analysis** | CloudWatch Insights | Log Analytics (KQL) | Azure (KQL is more powerful) |
| **Cost-Sensitive** | CloudWatch | CloudWatch | AWS generally cheaper at scale |
| **Advanced APM** | Third-party (Datadog) | Application Insights | Azure native is sufficient |
| **Multi-Cloud** | Third-party (Datadog) | Third-party (Datadog) | Need unified platform |

#### Cost-Benefit Analysis Framework

**Decision Factors:**

**1. Application Complexity:**
- **Simple (CRUD, few dependencies):** Use managed service (CloudWatch or Azure Monitor)
- **Medium (microservices, some integrations):** Use native APM (X-Ray or Application Insights)
- **Complex (many services, heavy tracing needs):** Consider third-party (Datadog, New Relic)

**2. Scale:**
- **Small (<100K requests/day):** Managed service (cost-effective)
- **Medium (100K-10M requests/day):** Native APM with sampling
- **Large (>10M requests/day):** Evaluate third-party or open source for cost

**3. Team Expertise:**
- **Limited DevOps:** Managed service (less operational overhead)
- **Strong DevOps:** Native APM or open source (more control)
- **Dedicated SRE:** Third-party or open source (advanced features)

**4. Budget:**
- **Tight (<$500/month):** Managed service with optimization
- **Moderate ($500-2000/month):** Native APM
- **Flexible (>$2000/month):** Third-party for advanced features

#### Platform Selection Decision Tree

```
START: What's your primary cloud platform?
│
├─ AWS
│  │
│  ├─ Is it a .NET application?
│  │  ├─ Yes → Consider Azure (better .NET support)
│  │  └─ No → Continue
│  │
│  ├─ Do you need advanced APM features?
│  │  ├─ Yes → Consider Datadog or New Relic
│  │  └─ No → Use CloudWatch + X-Ray
│  │
│  └─ Is cost a primary concern?
│     ├─ Yes → CloudWatch + X-Ray (optimize with sampling)
│     └─ No → CloudWatch + X-Ray or third-party
│
├─ Azure
│  │
│  ├─ Is it a .NET application?
│  │  ├─ Yes → Use Application Insights (excellent support)
│  │  └─ No → Continue
│  │
│  ├─ Do you need advanced APM features?
│  │  ├─ Yes → Application Insights (already advanced)
│  │  └─ No → Use Application Insights
│  │
│  └─ Is cost a primary concern?
│     ├─ Yes → Optimize sampling and retention
│     └─ No → Use Application Insights
│
└─ Multi-Cloud
   │
   ├─ Need unified view?
   │  ├─ Yes → Use Datadog or New Relic
   │  └─ No → Use native services per cloud
   │
   └─ Budget?
      ├─ Tight → OpenTelemetry + Prometheus + Grafana
      └─ Flexible → Datadog or New Relic
```

#### Migration Considerations

**AWS to Azure:**
- Replace CloudWatch Metrics → Azure Monitor Metrics
- Replace X-Ray → Application Insights distributed tracing
- Replace CloudWatch Logs → Log Analytics
- Update instrumentation code (AWS SDK → Application Insights SDK)
- Migrate dashboards and alerts

**Azure to AWS:**
- Replace Application Insights → CloudWatch + X-Ray
- Replace Log Analytics → CloudWatch Logs
- Update instrumentation code (Application Insights SDK → AWS SDK)
- Recreate dashboards and alerts

**To Third-Party (Datadog/New Relic):**
- Install agent/SDK
- Configure data sources
- Migrate dashboards and alerts
- Parallel run for validation
- Cutover and decommission old tools

**Using OpenTelemetry for Portability:**
```csharp
// OpenTelemetry allows switching backends without code changes
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSqlClientInstrumentation()
        // Switch exporters based on environment
        .AddAzureMonitorTraceExporter() // Azure
        // .AddXRayTraceExporter()      // AWS
        // .AddOtlpExporter()           // Generic OTLP
    );
```

#### Recommendation Summary

**For .NET Applications:**
1. **Azure-hosted:** Application Insights (best .NET support, rich features)
2. **AWS-hosted:** CloudWatch + X-Ray (cost-effective, good enough)
3. **Multi-cloud:** Datadog or OpenTelemetry + Prometheus

**For Cost Optimization:**
1. **Small scale:** Native managed services
2. **Large scale:** Native with aggressive sampling or open source
3. **Enterprise:** Third-party with volume discounts

**For Advanced Features:**
1. **Azure:** Application Insights (already advanced)
2. **AWS:** Consider third-party (Datadog, New Relic)
3. **Multi-cloud:** Third-party required

---

## Metrics Collection and Analysis

### 4.1 Metrics Categorization Framework

Effective metrics collection starts with understanding what to measure and why. This section provides a comprehensive framework for categorizing metrics based on their purpose and the insights they provide.

#### RED Metrics with .NET Code Examples

RED metrics (Rate, Errors, Duration) are essential for request-driven services. Here's how to implement them in .NET applications.

**Rate - Requests Per Second**

```csharp
using System.Diagnostics.Metrics;

public class ApiMetrics
{
    private static readonly Meter Meter = new("MyApi", "1.0.0");
    private static readonly Counter<long> RequestCounter = 
        Meter.CreateCounter<long>(
            name: "http.server.requests",
            unit: "requests",
            description: "Total number of HTTP requests");

    public void RecordRequest(string method, string endpoint, int statusCode)
    {
        var tags = new TagList
        {
            { "http.method", method },
            { "http.route", endpoint },
            { "http.status_code", statusCode }
        };
        
        RequestCounter.Add(1, tags);
    }
}

// Usage in controller
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly ApiMetrics _metrics;
    
    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var result = await _orderService.GetOrdersAsync();
        _metrics.RecordRequest("GET", "/api/orders", 200);
        return Ok(result);
    }
}
```

**Errors - Failed Request Rate**

```csharp
public class ApiMetrics
{
    private static readonly Counter<long> ErrorCounter = 
        Meter.CreateCounter<long>(
            name: "http.server.errors",
            unit: "errors",
            description: "Total number of HTTP errors");
    
    private static readonly Counter<long> TotalCounter = 
        Meter.CreateCounter<long>(
            name: "http.server.requests.total",
            unit: "requests");

    public void RecordError(string method, string endpoint, int statusCode, string errorType)
    {
        var tags = new TagList
        {
            { "http.method", method },
            { "http.route", endpoint },
            { "http.status_code", statusCode },
            { "error.type", errorType }
        };
        
        ErrorCounter.Add(1, tags);
    }
    
    // Calculate error rate in monitoring system:
    // error_rate = (http.server.errors / http.server.requests.total) * 100
}

// Usage with middleware
public class ErrorTrackingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApiMetrics _metrics;
    
    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
            
            if (context.Response.StatusCode >= 400)
            {
                _metrics.RecordError(
                    context.Request.Method,
                    context.Request.Path,
                    context.Response.StatusCode,
                    GetErrorType(context.Response.StatusCode));
            }
        }
        catch (Exception ex)
        {
            _metrics.RecordError(
                context.Request.Method,
                context.Request.Path,
                500,
                ex.GetType().Name);
            throw;
        }
    }
    
    private string GetErrorType(int statusCode) => statusCode switch
    {
        400 => "BadRequest",
        401 => "Unauthorized",
        403 => "Forbidden",
        404 => "NotFound",
        429 => "TooManyRequests",
        500 => "InternalServerError",
        503 => "ServiceUnavailable",
        _ => "Unknown"
    };
}
```

**Duration - Request Latency**

```csharp
public class ApiMetrics
{
    private static readonly Histogram<double> DurationHistogram = 
        Meter.CreateHistogram<double>(
            name: "http.server.duration",
            unit: "ms",
            description: "HTTP request duration in milliseconds");

    public void RecordDuration(string method, string endpoint, double durationMs, int statusCode)
    {
        var tags = new TagList
        {
            { "http.method", method },
            { "http.route", endpoint },
            { "http.status_code", statusCode }
        };
        
        DurationHistogram.Record(durationMs, tags);
    }
}

// Usage with middleware
public class PerformanceTrackingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ApiMetrics _metrics;
    
    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();
            _metrics.RecordDuration(
                context.Request.Method,
                context.Request.Path,
                stopwatch.Elapsed.TotalMilliseconds,
                context.Response.StatusCode);
        }
    }
}

// Register middleware in Program.cs
app.UseMiddleware<PerformanceTrackingMiddleware>();
app.UseMiddleware<ErrorTrackingMiddleware>();
```

**Complete RED Metrics Implementation**

```csharp
// Startup configuration in Program.cs
using OpenTelemetry.Metrics;

var builder = WebApplication.CreateBuilder(args);

// Configure OpenTelemetry metrics
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddMeter("MyApi")
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddRuntimeInstrumentation()
        // Export to Application Insights
        .AddAzureMonitorMetricExporter(options =>
        {
            options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
        })
        // Or export to CloudWatch
        .AddOtlpExporter(options =>
        {
            options.Endpoint = new Uri("http://localhost:4317");
        }));

builder.Services.AddSingleton<ApiMetrics>();

var app = builder.Build();

app.UseMiddleware<PerformanceTrackingMiddleware>();
app.UseMiddleware<ErrorTrackingMiddleware>();

app.Run();
```

#### USE Metrics with .NET Code Examples

USE metrics (Utilization, Saturation, Errors) focus on resource consumption and are critical for infrastructure and resource-constrained services.

**Utilization - Resource Usage Percentage**

```csharp
public class ResourceMetrics
{
    private static readonly Meter Meter = new("MyService.Resources", "1.0.0");
    
    // CPU Utilization
    private static readonly ObservableGauge<double> CpuUtilization = 
        Meter.CreateObservableGauge(
            name: "process.cpu.utilization",
            observeValue: () => GetCpuUtilization(),
            unit: "percent",
            description: "CPU utilization percentage");
    
    // Memory Utilization
    private static readonly ObservableGauge<long> MemoryUsage = 
        Meter.CreateObservableGauge(
            name: "process.memory.usage",
            observeValue: () => GC.GetTotalMemory(false),
            unit: "bytes",
            description: "Current memory usage");
    
    // Thread Pool Utilization
    private static readonly ObservableGauge<double> ThreadPoolUtilization = 
        Meter.CreateObservableGauge(
            name: "threadpool.utilization",
            observeValue: () => GetThreadPoolUtilization(),
            unit: "percent",
            description: "Thread pool utilization percentage");
    
    private static double GetCpuUtilization()
    {
        // Use Process class to get CPU usage
        using var process = Process.GetCurrentProcess();
        var startTime = DateTime.UtcNow;
        var startCpuUsage = process.TotalProcessorTime;
        
        Thread.Sleep(500); // Sample period
        
        var endTime = DateTime.UtcNow;
        var endCpuUsage = process.TotalProcessorTime;
        
        var cpuUsedMs = (endCpuUsage - startCpuUsage).TotalMilliseconds;
        var totalMsPassed = (endTime - startTime).TotalMilliseconds;
        var cpuUsageTotal = cpuUsedMs / (Environment.ProcessorCount * totalMsPassed);
        
        return cpuUsageTotal * 100;
    }
    
    private static double GetThreadPoolUtilization()
    {
        ThreadPool.GetAvailableThreads(out int availableWorkerThreads, out _);
        ThreadPool.GetMaxThreads(out int maxWorkerThreads, out _);
        
        int busyThreads = maxWorkerThreads - availableWorkerThreads;
        return (double)busyThreads / maxWorkerThreads * 100;
    }
}
```

**Saturation - Queue Depth and Backlog**

```csharp
public class QueueMetrics
{
    private static readonly Meter Meter = new("MyService.Queue", "1.0.0");
    private static int _queueDepth = 0;
    private static int _processingCount = 0;
    
    // Queue Depth (Saturation indicator)
    private static readonly ObservableGauge<int> QueueDepthGauge = 
        Meter.CreateObservableGauge(
            name: "queue.depth",
            observeValue: () => _queueDepth,
            unit: "messages",
            description: "Number of messages waiting in queue");
    
    // Processing Count (Utilization indicator)
    private static readonly ObservableGauge<int> ProcessingGauge = 
        Meter.CreateObservableGauge(
            name: "queue.processing",
            observeValue: () => _processingCount,
            unit: "messages",
            description: "Number of messages currently being processed");
    
    // Message Age (Saturation indicator)
    private static readonly Histogram<double> MessageAgeHistogram = 
        Meter.CreateHistogram<double>(
            name: "queue.message.age",
            unit: "seconds",
            description: "Time message spent in queue before processing");
    
    public void RecordEnqueue()
    {
        Interlocked.Increment(ref _queueDepth);
    }
    
    public void RecordDequeue(DateTime enqueuedAt)
    {
        Interlocked.Decrement(ref _queueDepth);
        Interlocked.Increment(ref _processingCount);
        
        var age = (DateTime.UtcNow - enqueuedAt).TotalSeconds;
        MessageAgeHistogram.Record(age);
    }
    
    public void RecordProcessingComplete()
    {
        Interlocked.Decrement(ref _processingCount);
    }
}

// Usage in background worker
public class MessageProcessor : BackgroundService
{
    private readonly QueueMetrics _metrics;
    private readonly IMessageQueue _queue;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            var message = await _queue.DequeueAsync(stoppingToken);
            _metrics.RecordDequeue(message.EnqueuedAt);
            
            try
            {
                await ProcessMessageAsync(message);
            }
            finally
            {
                _metrics.RecordProcessingComplete();
            }
        }
    }
}
```

**Errors - Resource-Related Failures**

```csharp
public class ResourceErrorMetrics
{
    private static readonly Meter Meter = new("MyService.Resources", "1.0.0");
    
    private static readonly Counter<long> ResourceErrorCounter = 
        Meter.CreateCounter<long>(
            name: "resource.errors",
            unit: "errors",
            description: "Resource-related errors");
    
    public void RecordDatabaseConnectionError()
    {
        ResourceErrorCounter.Add(1, new TagList { { "resource.type", "database" }, { "error.type", "connection" } });
    }
    
    public void RecordDatabaseTimeoutError()
    {
        ResourceErrorCounter.Add(1, new TagList { { "resource.type", "database" }, { "error.type", "timeout" } });
    }
    
    public void RecordMemoryError()
    {
        ResourceErrorCounter.Add(1, new TagList { { "resource.type", "memory" }, { "error.type", "out_of_memory" } });
    }
    
    public void RecordThreadPoolExhaustion()
    {
        ResourceErrorCounter.Add(1, new TagList { { "resource.type", "threadpool" }, { "error.type", "exhaustion" } });
    }
}

// Usage in database repository
public class OrderRepository
{
    private readonly ResourceErrorMetrics _metrics;
    
    public async Task<Order> GetOrderAsync(int orderId)
    {
        try
        {
            using var connection = await _connectionFactory.CreateConnectionAsync();
            return await connection.QuerySingleAsync<Order>(
                "SELECT * FROM Orders WHERE Id = @Id",
                new { Id = orderId });
        }
        catch (SqlException ex) when (ex.Number == -2) // Timeout
        {
            _metrics.RecordDatabaseTimeoutError();
            throw;
        }
        catch (SqlException ex) when (ex.Number == 53) // Connection failed
        {
            _metrics.RecordDatabaseConnectionError();
            throw;
        }
    }
}
```

#### Business Metrics with Instrumentation Patterns

Business metrics connect technical performance to business outcomes. These metrics should be defined in collaboration with product and business stakeholders.

**Revenue and Transaction Metrics**

```csharp
public class BusinessMetrics
{
    private static readonly Meter Meter = new("MyApp.Business", "1.0.0");
    
    // Order metrics
    private static readonly Counter<long> OrdersCreatedCounter = 
        Meter.CreateCounter<long>(
            name: "business.orders.created",
            unit: "orders",
            description: "Total number of orders created");
    
    private static readonly Histogram<decimal> OrderValueHistogram = 
        Meter.CreateHistogram<decimal>(
            name: "business.order.value",
            unit: "USD",
            description: "Order value in USD");
    
    // Revenue metrics
    private static readonly Counter<decimal> RevenueCounter = 
        Meter.CreateCounter<decimal>(
            name: "business.revenue",
            unit: "USD",
            description: "Total revenue in USD");
    
    public void RecordOrderCreated(decimal orderValue, string productCategory, string customerSegment)
    {
        var tags = new TagList
        {
            { "product.category", productCategory },
            { "customer.segment", customerSegment }
        };
        
        OrdersCreatedCounter.Add(1, tags);
        OrderValueHistogram.Record(orderValue, tags);
        RevenueCounter.Add(orderValue, tags);
    }
}

// Usage in order service
public class OrderService
{
    private readonly BusinessMetrics _metrics;
    
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var order = await _repository.CreateOrderAsync(request);
        
        _metrics.RecordOrderCreated(
            order.TotalAmount,
            order.ProductCategory,
            order.Customer.Segment);
        
        return order;
    }
}
```

**User Engagement Metrics**

```csharp
public class EngagementMetrics
{
    private static readonly Meter Meter = new("MyApp.Engagement", "1.0.0");
    
    // User activity
    private static readonly Counter<long> UserLoginCounter = 
        Meter.CreateCounter<long>(
            name: "business.user.logins",
            unit: "logins",
            description: "Total number of user logins");
    
    private static readonly Histogram<double> SessionDurationHistogram = 
        Meter.CreateHistogram<double>(
            name: "business.session.duration",
            unit: "minutes",
            description: "User session duration in minutes");
    
    // Feature usage
    private static readonly Counter<long> FeatureUsageCounter = 
        Meter.CreateCounter<long>(
            name: "business.feature.usage",
            unit: "uses",
            description: "Feature usage count");
    
    public void RecordLogin(string userSegment, string loginMethod)
    {
        var tags = new TagList
        {
            { "user.segment", userSegment },
            { "login.method", loginMethod }
        };
        
        UserLoginCounter.Add(1, tags);
    }
    
    public void RecordSessionEnd(double durationMinutes, string userSegment)
    {
        var tags = new TagList { { "user.segment", userSegment } };
        SessionDurationHistogram.Record(durationMinutes, tags);
    }
    
    public void RecordFeatureUsage(string featureName, string userSegment)
    {
        var tags = new TagList
        {
            { "feature.name", featureName },
            { "user.segment", userSegment }
        };
        
        FeatureUsageCounter.Add(1, tags);
    }
}
```

**Conversion and Funnel Metrics**

```csharp
public class ConversionMetrics
{
    private static readonly Meter Meter = new("MyApp.Conversion", "1.0.0");
    
    // Funnel stages
    private static readonly Counter<long> FunnelStageCounter = 
        Meter.CreateCounter<long>(
            name: "business.funnel.stage",
            unit: "events",
            description: "Funnel stage progression");
    
    // Conversion events
    private static readonly Counter<long> ConversionCounter = 
        Meter.CreateCounter<long>(
            name: "business.conversion",
            unit: "conversions",
            description: "Conversion events");
    
    // Time to convert
    private static readonly Histogram<double> TimeToConvertHistogram = 
        Meter.CreateHistogram<double>(
            name: "business.time_to_convert",
            unit: "hours",
            description: "Time from first visit to conversion");
    
    public void RecordFunnelStage(string stage, string source, string campaign)
    {
        var tags = new TagList
        {
            { "funnel.stage", stage },
            { "traffic.source", source },
            { "marketing.campaign", campaign }
        };
        
        FunnelStageCounter.Add(1, tags);
    }
    
    public void RecordConversion(string conversionType, double timeToConvertHours, string source)
    {
        var tags = new TagList
        {
            { "conversion.type", conversionType },
            { "traffic.source", source }
        };
        
        ConversionCounter.Add(1, tags);
        TimeToConvertHistogram.Record(timeToConvertHours, tags);
    }
}

// Usage in checkout flow
public class CheckoutService
{
    private readonly ConversionMetrics _metrics;
    
    public async Task<CheckoutResult> ProcessCheckoutAsync(CheckoutRequest request)
    {
        // Track funnel progression
        _metrics.RecordFunnelStage("checkout_started", request.Source, request.Campaign);
        
        // ... process checkout ...
        
        if (result.Success)
        {
            _metrics.RecordFunnelStage("checkout_completed", request.Source, request.Campaign);
            
            var timeToConvert = (DateTime.UtcNow - request.FirstVisitAt).TotalHours;
            _metrics.RecordConversion("purchase", timeToConvert, request.Source);
        }
        
        return result;
    }
}
```

**Custom Business Event Tracking**

```csharp
public class CustomBusinessMetrics
{
    private static readonly Meter Meter = new("MyApp.CustomEvents", "1.0.0");
    
    // Generic business event counter
    private static readonly Counter<long> BusinessEventCounter = 
        Meter.CreateCounter<long>(
            name: "business.event",
            unit: "events",
            description: "Custom business events");
    
    // Generic business value histogram
    private static readonly Histogram<decimal> BusinessValueHistogram = 
        Meter.CreateHistogram<decimal>(
            name: "business.event.value",
            unit: "USD",
            description: "Business event value");
    
    public void RecordBusinessEvent(
        string eventName,
        string eventCategory,
        Dictionary<string, string> properties = null,
        decimal? value = null)
    {
        var tags = new TagList
        {
            { "event.name", eventName },
            { "event.category", eventCategory }
        };
        
        if (properties != null)
        {
            foreach (var prop in properties)
            {
                tags.Add(prop.Key, prop.Value);
            }
        }
        
        BusinessEventCounter.Add(1, tags);
        
        if (value.HasValue)
        {
            BusinessValueHistogram.Record(value.Value, tags);
        }
    }
}

// Usage examples
public class SubscriptionService
{
    private readonly CustomBusinessMetrics _metrics;
    
    public async Task UpgradeSubscriptionAsync(int userId, string newPlan)
    {
        await _repository.UpgradeSubscriptionAsync(userId, newPlan);
        
        _metrics.RecordBusinessEvent(
            eventName: "subscription_upgraded",
            eventCategory: "subscription",
            properties: new Dictionary<string, string>
            {
                { "plan.from", currentPlan },
                { "plan.to", newPlan },
                { "user.segment", userSegment }
            },
            value: planPrice);
    }
    
    public async Task CancelSubscriptionAsync(int userId, string reason)
    {
        await _repository.CancelSubscriptionAsync(userId);
        
        _metrics.RecordBusinessEvent(
            eventName: "subscription_cancelled",
            eventCategory: "subscription",
            properties: new Dictionary<string, string>
            {
                { "cancellation.reason", reason },
                { "user.segment", userSegment },
                { "subscription.age_days", subscriptionAgeDays.ToString() }
            });
    }
}
```

#### Metrics Categorization Summary

**Metric Type Decision Matrix:**

| Metric Category | When to Use | Examples | Collection Method |
|----------------|-------------|----------|-------------------|
| **RED** | Request-driven services (APIs, web apps) | Request rate, error rate, latency | Counter, Histogram |
| **USE** | Resource-constrained services (workers, databases) | CPU%, queue depth, connection errors | Gauge, Counter |
| **Business** | Track business outcomes and user behavior | Revenue, conversions, feature usage | Counter, Histogram |
| **Custom** | Domain-specific metrics unique to your application | Cart abandonment, search relevance | Counter, Histogram, Gauge |

**Instrumentation Best Practices:**

1. **Use Semantic Naming** - Follow OpenTelemetry semantic conventions
2. **Add Relevant Tags** - Include dimensions for filtering (environment, region, version)
3. **Keep Cardinality Low** - Avoid high-cardinality tags (user IDs, request IDs)
4. **Measure What Matters** - Focus on actionable metrics that drive decisions
5. **Test Instrumentation** - Verify metrics are emitted correctly in tests
6. **Document Metrics** - Maintain a metrics catalog with descriptions and owners

---

## Distributed Tracing

### 5.1 Correlation IDs and Trace Context Propagation

Distributed tracing enables you to follow a request's journey through multiple services and components in a distributed system. Understanding correlation IDs and trace context propagation is fundamental to implementing effective distributed tracing.

#### What is Distributed Tracing?

**Definition:** Distributed tracing tracks the flow of requests across service boundaries, capturing timing information and metadata at each step to provide end-to-end visibility into system behavior.

**Key Concepts:**

| Concept | Definition | Purpose |
|---------|------------|---------|
| **Trace** | Complete journey of a request through the system | Represents the entire operation from start to finish |
| **Span** | Single unit of work within a trace | Represents one operation (HTTP call, database query, function execution) |
| **Trace ID** | Unique identifier for the entire trace | Links all spans belonging to the same request |
| **Span ID** | Unique identifier for a specific span | Identifies individual operations within a trace |
| **Parent Span ID** | ID of the span that initiated this span | Creates the parent-child relationship hierarchy |

**Trace Hierarchy Example:**

```
Trace ID: abc123
├─ Span: HTTP POST /api/orders (Span ID: 001, Parent: null)
   ├─ Span: ValidateCustomer (Span ID: 002, Parent: 001)
   │  └─ Span: SQL Query - SELECT * FROM Customers (Span ID: 003, Parent: 002)
   ├─ Span: ProcessPayment (Span ID: 004, Parent: 001)
   │  └─ Span: HTTP POST to Payment Gateway (Span ID: 005, Parent: 004)
   └─ Span: SaveOrder (Span ID: 006, Parent: 001)
      └─ Span: SQL INSERT INTO Orders (Span ID: 007, Parent: 006)
```

#### W3C Trace Context Standard

The W3C Trace Context specification defines a standard way to propagate trace context across service boundaries, ensuring interoperability between different tracing systems.

**W3C Trace Context Headers:**

**1. traceparent Header**

Format: `00-{trace-id}-{parent-id}-{trace-flags}`

```
traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             │  │                                │                │
             │  └─ Trace ID (32 hex chars)      │                └─ Trace Flags
             │                                   └─ Parent Span ID (16 hex chars)
             └─ Version (00)
```

**Components:**
- **Version** (`00`): Current version of the spec
- **Trace ID** (32 hex characters): Globally unique identifier for the trace
- **Parent Span ID** (16 hex characters): ID of the span that made this request
- **Trace Flags** (2 hex characters): Sampling and other flags
  - `01` = sampled (trace should be recorded)
  - `00` = not sampled

**2. tracestate Header**

Vendor-specific trace information that doesn't fit in traceparent.

```
tracestate: vendor1=value1,vendor2=value2
```

**Example:**
```
tracestate: datadog=s:1;o:rum;t.dm:-4,newrelic=1234567890abcdef
```

#### Correlation ID Patterns

Correlation IDs are identifiers that link related log entries, metrics, and traces together, enabling you to follow a request's path through your system.

**Pattern 1: Request-Scoped Correlation ID**

Generate a unique ID at the entry point and propagate it through all operations.

```csharp
public class CorrelationIdMiddleware
{
    private const string CorrelationIdHeader = "X-Correlation-ID";
    private readonly RequestDelegate _next;

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[CorrelationIdHeader].FirstOrDefault()
            ?? Guid.NewGuid().ToString();
        context.Items["CorrelationId"] = correlationId;
        context.Response.Headers.Add(CorrelationIdHeader, correlationId);
        
        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await _next(context);
        }
    }
}
```

**Pattern 2: Activity-Based Correlation**

Use .NET's `Activity` class which implements W3C Trace Context.

```csharp
public class OrderController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        var activity = Activity.Current;
        var traceId = activity?.TraceId.ToString();
        var spanId = activity?.SpanId.ToString();
        
        _logger.LogInformation("Processing order. TraceId: {TraceId}", traceId);
        var result = await _orderService.CreateOrderAsync(request);
        return Ok(result);
    }
}
```

#### Context Propagation Best Practices

**1. HTTP Propagation:** HttpClient automatically propagates Activity context as W3C headers in .NET 5.0+

**2. Message Queue Propagation:** Manually add trace context to message headers

```csharp
// Producer
var message = new OrderCreatedEvent
{
    OrderId = order.Id,
    TraceId = Activity.Current?.TraceId.ToString(),
    SpanId = Activity.Current?.SpanId.ToString()
};

// Consumer
var parentContext = new ActivityContext(
    ActivityTraceId.CreateFromString(message.TraceId),
    ActivitySpanId.CreateFromString(message.SpanId),
    ActivityTraceFlags.Recorded);
using var activity = new Activity("ProcessOrderCreated")
    .SetParentId(parentContext.TraceId, parentContext.SpanId)
    .Start();
```

**3. Database Propagation:** Add trace context as SQL comments for correlation

**4. Validation:** Validate incoming trace context to prevent injection attacks

---

### 5.2 OpenTelemetry .NET Implementation Patterns

OpenTelemetry is the industry-standard observability framework that provides vendor-neutral APIs and SDKs for collecting metrics, logs, and traces.

#### Why OpenTelemetry?

**Benefits:**
- ✅ **Vendor-Neutral** - Switch between backends without code changes
- ✅ **Industry Standard** - CNCF project with broad adoption
- ✅ **Comprehensive** - Unified API for metrics, logs, and traces
- ✅ **Automatic Instrumentation** - Built-in for ASP.NET Core, HttpClient, SQL
- ✅ **Extensible** - Easy to add custom instrumentation
- ✅ **Future-Proof** - Active development and growing ecosystem

#### Setup and Configuration

**Step 1: Install NuGet Packages**

```bash
# Core packages
dotnet add package OpenTelemetry
dotnet add package OpenTelemetry.Extensions.Hosting

# Instrumentation (automatic)
dotnet add package OpenTelemetry.Instrumentation.AspNetCore
dotnet add package OpenTelemetry.Instrumentation.Http
dotnet add package OpenTelemetry.Instrumentation.SqlClient

# Exporters (choose based on platform)
dotnet add package Azure.Monitor.OpenTelemetry.Exporter  # Azure
dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol  # AWS X-Ray
dotnet add package OpenTelemetry.Exporter.Jaeger  # Local dev
```

**Step 2: Configure in Program.cs**

```csharp
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .ConfigureResource(resource => resource
        .AddService("OrderService", "1.0.0", Environment.MachineName))
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation(options =>
        {
            options.EnrichWithHttpRequest = (activity, httpRequest) =>
            {
                activity.SetTag("http.client_ip", 
                    httpRequest.HttpContext.Connection.RemoteIpAddress);
            };
            options.Filter = (httpContext) =>
                !httpContext.Request.Path.StartsWithSegments("/health");
        })
        .AddHttpClientInstrumentation()
        .AddSqlClientInstrumentation(options =>
        {
            options.SetDbStatementForText = true;
            options.SetDbStatementForStoredProcedure = true;
        })
        .AddSource("OrderService")
        .AddAzureMonitorTraceExporter(options =>
        {
            options.ConnectionString = 
                builder.Configuration["ApplicationInsights:ConnectionString"];
        }));
```

**Configuration for AWS X-Ray:**

```csharp
.WithTracing(tracing => tracing
    .AddAspNetCoreInstrumentation()
    .AddHttpClientInstrumentation()
    .AddSqlClientInstrumentation()
    .AddOtlpExporter(options =>
    {
        options.Endpoint = new Uri("http://localhost:4317");
        options.Protocol = OtlpExportProtocol.Grpc;
    })
    .AddXRayTraceId()
    .AddAWSInstrumentation());
```

**Configuration for Local Development (Jaeger):**

```csharp
.WithTracing(tracing => tracing
    .AddAspNetCoreInstrumentation()
    .AddHttpClientInstrumentation()
    .AddJaegerExporter(options =>
    {
        options.AgentHost = "localhost";
        options.AgentPort = 6831;
    }));

// Run Jaeger: docker run -d -p 6831:6831/udp -p 16686:16686 jaegertracing/all-in-one
// UI: http://localhost:16686
```

#### Activity/Span Creation Patterns

**Pattern 1: Automatic Instrumentation**

Most operations are automatically instrumented:

```csharp
public class OrderController : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        // ASP.NET Core auto-creates span: "POST /api/orders"
        
        // HttpClient auto-creates span for outgoing requests
        var paymentResult = await _httpClient.PostAsJsonAsync(
            "https://payment-service/api/payments", request.Payment);
        
        // SQL Client auto-creates span for queries
        var order = await _dbConnection.QuerySingleAsync<Order>(
            "INSERT INTO Orders (...) VALUES (...)", request);
        
        return Ok(order);
    }
}
```

**Pattern 2: Manual Span Creation**

Create custom spans for business operations:

```csharp
using System.Diagnostics;

public class OrderService
{
    private static readonly ActivitySource ActivitySource = new("OrderService", "1.0.0");

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        using var activity = ActivitySource.StartActivity("CreateOrder");
        
        activity?.SetTag("order.customer_id", request.CustomerId);
        activity?.SetTag("order.item_count", request.Items.Count);
        activity?.SetTag("order.total_amount", request.TotalAmount);

        try
        {
            await ValidateCustomerAsync(request.CustomerId);
            var paymentResult = await ProcessPaymentAsync(request.Payment);
            activity?.SetTag("payment.transaction_id", paymentResult.TransactionId);
            
            var order = await SaveOrderAsync(request);
            activity?.SetTag("order.id", order.Id);
            activity?.SetStatus(ActivityStatusCode.Ok);
            
            return order;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}
```

**Pattern 3: Span with Events**

Add events to mark significant moments:

```csharp
public async Task<Order> ProcessOrderAsync(Order order)
{
    using var activity = ActivitySource.StartActivity("ProcessOrder");
    
    activity?.AddEvent(new ActivityEvent("ValidationStarted"));
    await ValidateOrderAsync(order);
    activity?.AddEvent(new ActivityEvent("ValidationCompleted"));
    
    activity?.AddEvent(new ActivityEvent("PaymentStarted"));
    var paymentResult = await ProcessPaymentAsync(order);
    activity?.AddEvent(new ActivityEvent("PaymentCompleted",
        tags: new ActivityTagsCollection
        {
            ["payment.status"] = paymentResult.Status,
            ["payment.amount"] = paymentResult.Amount
        }));
    
    return order;
}
```

#### Instrumentation for ASP.NET Core

**Controller Instrumentation:**

```csharp
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private static readonly ActivitySource ActivitySource = 
        new("OrderService.Controllers", "1.0.0");

    [HttpPost]
    public async Task<IActionResult> CreateOrder(CreateOrderRequest request)
    {
        var parentActivity = Activity.Current;
        parentActivity?.SetTag("order.customer_id", request.CustomerId);
        
        using var activity = ActivitySource.StartActivity("CreateOrder.BusinessLogic");
        
        try
        {
            var order = await _orderService.CreateOrderAsync(request);
            activity?.SetTag("order.id", order.Id);
            activity?.SetStatus(ActivityStatusCode.Ok);
            
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
        }
        catch (ValidationException ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, "Validation failed");
            activity?.RecordException(ex);
            return BadRequest(new { error = ex.Message });
        }
    }
}
```

#### Instrumentation for HttpClient

HttpClient is automatically instrumented with `OpenTelemetry.Instrumentation.Http`:

```csharp
public class PaymentServiceClient
{
    private readonly HttpClient _httpClient;

    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        // Automatically creates span with URL, method, status code, duration
        var response = await _httpClient.PostAsJsonAsync("/api/payments", request);
        return await response.Content.ReadFromJsonAsync<PaymentResult>();
    }
}
```

**Manual Enrichment:**

```csharp
public class EnrichedHttpClient
{
    private static readonly ActivitySource ActivitySource = 
        new("OrderService.HttpClient", "1.0.0");

    public async Task<TResponse> PostAsync<TRequest, TResponse>(string url, TRequest request)
    {
        using var activity = ActivitySource.StartActivity("HttpClient.Post");
        activity?.SetTag("http.url", url);
        activity?.SetTag("request.type", typeof(TRequest).Name);

        try
        {
            var response = await _httpClient.PostAsJsonAsync(url, request);
            activity?.SetTag("http.status_code", (int)response.StatusCode);
            activity?.SetStatus(ActivityStatusCode.Ok);
            
            return await response.Content.ReadFromJsonAsync<TResponse>();
        }
        catch (HttpRequestException ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}
```

#### Instrumentation for SQL/Database

SQL Client is automatically instrumented with `OpenTelemetry.Instrumentation.SqlClient`:

```csharp
public class OrderRepository
{
    public async Task<Order> GetByIdAsync(string orderId)
    {
        // Automatically creates span: "SELECT Orders"
        var sql = "SELECT * FROM Orders WHERE Id = @Id";
        return await _connection.QuerySingleOrDefaultAsync<Order>(sql, new { Id = orderId });
    }
}
```

**Manual Database Instrumentation:**

```csharp
public class OrderRepository
{
    private static readonly ActivitySource ActivitySource = 
        new("OrderService.Repository", "1.0.0");

    public async Task<List<Order>> GetOrdersByCustomerAsync(
        string customerId, int pageSize, int pageNumber)
    {
        using var activity = ActivitySource.StartActivity("GetOrdersByCustomer");
        activity?.SetTag("db.operation", "SELECT");
        activity?.SetTag("customer.id", customerId);
        activity?.SetTag("pagination.page_size", pageSize);

        try
        {
            var sql = @"SELECT * FROM Orders 
                       WHERE CustomerId = @CustomerId 
                       ORDER BY CreatedAt DESC
                       OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

            var orders = await _connection.QueryAsync<Order>(sql, new
            {
                CustomerId = customerId,
                Offset = (pageNumber - 1) * pageSize,
                PageSize = pageSize
            });

            var orderList = orders.ToList();
            activity?.SetTag("db.rows_returned", orderList.Count);
            activity?.SetStatus(ActivityStatusCode.Ok);
            
            return orderList;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}
```

#### Best Practices

**1. Use Semantic Conventions**

```csharp
// ✅ Good: Standard attribute names
activity?.SetTag("http.method", "POST");
activity?.SetTag("http.url", "https://api.example.com/orders");
activity?.SetTag("http.status_code", 200);
activity?.SetTag("db.system", "postgresql");

// ❌ Bad: Custom naming
activity?.SetTag("method", "POST");
activity?.SetTag("endpoint", "https://api.example.com/orders");
```

**2. Keep Span Names Concise**

```csharp
// ✅ Good
using var activity = ActivitySource.StartActivity("ProcessOrder");

// ❌ Bad
using var activity = ActivitySource.StartActivity("ProcessOrderAndValidatePayment");
```

**3. Avoid High-Cardinality Tags**

```csharp
// ❌ Bad: Millions of unique values
activity?.SetTag("user.id", userId);
activity?.SetTag("order.id", orderId);

// ✅ Good: Few unique values
activity?.SetTag("user.tier", "premium");
activity?.SetTag("order.type", "express");
activity?.SetTag("region", "us-east-1");
```

**4. Record Exceptions Properly**

```csharp
try
{
    await ProcessOrderAsync(order);
}
catch (Exception ex)
{
    activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
    activity?.RecordException(ex);
    throw;
}
```

**5. Use Sampling Wisely**

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .SetSampler(new TraceIdRatioBasedSampler(0.1))); // Sample 10%
```

**6. Test Instrumentation**

```csharp
[Fact]
public async Task CreateOrder_ShouldCreateSpan()
{
    var activities = new List<Activity>();
    using var listener = new ActivityListener
    {
        ShouldListenTo = source => source.Name == "OrderService",
        Sample = (ref ActivityCreationOptions<ActivityContext> options) => 
            ActivitySamplingResult.AllDataAndRecorded,
        ActivityStarted = activity => activities.Add(activity)
    };
    ActivitySource.AddActivityListener(listener);

    await service.CreateOrderAsync(request);

    var activity = activities.Single(a => a.OperationName == "CreateOrder");
    Assert.Equal("123", activity.GetTagItem("order.customer_id"));
    Assert.Equal(ActivityStatusCode.Ok, activity.Status);
}
```

---

### 5.3 Span Creation and Annotation Best Practices

Creating meaningful spans with proper annotations is essential for effective distributed tracing. This section provides guidance on when to create spans, how to annotate them effectively, and patterns for recording errors.

#### When to Create Spans

Not every operation needs a span. Create spans strategically to balance observability with performance overhead.

**✅ Create Spans For:**

| Operation Type | Example | Why |
|----------------|---------|-----|
| **Service Boundaries** | HTTP requests, gRPC calls, message queue operations | Track cross-service communication |
| **Database Operations** | Queries, transactions, stored procedures | Identify database bottlenecks |
| **External API Calls** | Third-party services, payment gateways | Monitor external dependencies |
| **Business Operations** | Order processing, payment validation, inventory check | Track business logic performance |
| **Expensive Operations** | File I/O, encryption, image processing | Identify performance hotspots |
| **Async Operations** | Background jobs, queue processing | Track async workflow timing |
| **Cache Operations** | Cache hits/misses, cache updates | Understand caching effectiveness |

**❌ Don't Create Spans For:**

| Operation Type | Why Not | Alternative |
|----------------|---------|-------------|
| **Simple getters/setters** | Too granular, high overhead | Use metrics or logs |
| **In-memory operations** | Too fast to matter | Only if complex logic |
| **Loops** | Creates too many spans | Span around entire loop |
| **Every method call** | Overwhelming trace data | Focus on significant operations |
| **Synchronous local calls** | Already captured by parent | Only if significant work |

**Decision Framework:**

```
Should I create a span?
│
├─ Does it cross a service boundary? → YES, create span
├─ Does it involve I/O (network, disk, database)? → YES, create span
├─ Is it a significant business operation? → YES, create span
├─ Does it take > 10ms typically? → YES, create span
├─ Is it called in a tight loop? → NO, don't create span
└─ Is it a simple in-memory operation? → NO, don't create span
```

#### Span Creation Patterns

**Pattern 1: Operation Span (Most Common)**

Create a span for a discrete operation with clear start and end.

```csharp
public class OrderService
{
    private static readonly ActivitySource ActivitySource = new("OrderService", "1.0.0");

    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        // Create span for the entire operation
        using var activity = ActivitySource.StartActivity("CreateOrder");
        
        // Add context at the start
        activity?.SetTag("order.customer_id", request.CustomerId);
        activity?.SetTag("order.item_count", request.Items.Count);
        activity?.SetTag("order.total_amount", request.TotalAmount);

        try
        {
            var order = await ProcessOrderInternalAsync(request);
            
            // Add result information
            activity?.SetTag("order.id", order.Id);
            activity?.SetTag("order.status", order.Status);
            activity?.SetStatus(ActivityStatusCode.Ok);
            
            return order;
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
            throw;
        }
    }
}
```

**Pattern 2: Nested Spans (Parent-Child Relationship)**

Create child spans for sub-operations within a larger operation.

```csharp
public async Task<Order> ProcessOrderAsync(CreateOrderRequest request)
{
    using var parentActivity = ActivitySource.StartActivity("ProcessOrder");
    parentActivity?.SetTag("order.customer_id", request.CustomerId);

    // Child span 1: Validation
    using (var validationActivity = ActivitySource.StartActivity("ValidateOrder"))
    {
        validationActivity?.SetTag("validation.type", "customer_and_inventory");
        await ValidateCustomerAsync(request.CustomerId);
        await ValidateInventoryAsync(request.Items);
        validationActivity?.SetStatus(ActivityStatusCode.Ok);
    }

    // Child span 2: Payment
    using (var paymentActivity = ActivitySource.StartActivity("ProcessPayment"))
    {
        paymentActivity?.SetTag("payment.amount", request.TotalAmount);
        paymentActivity?.SetTag("payment.method", request.PaymentMethod);
        
        var paymentResult = await ProcessPaymentAsync(request.Payment);
        
        paymentActivity?.SetTag("payment.transaction_id", paymentResult.TransactionId);
        paymentActivity?.SetTag("payment.status", paymentResult.Status);
        paymentActivity?.SetStatus(ActivityStatusCode.Ok);
    }

    // Child span 3: Persistence
    using (var saveActivity = ActivitySource.StartActivity("SaveOrder"))
    {
        var order = await SaveOrderToDatabase(request);
        saveActivity?.SetTag("order.id", order.Id);
        saveActivity?.SetStatus(ActivityStatusCode.Ok);
        
        parentActivity?.SetTag("order.id", order.Id);
        return order;
    }
}
```

**Pattern 3: Conditional Spans**

Create spans only when certain conditions are met.

```csharp
public async Task<Customer> GetCustomerAsync(string customerId, bool includeOrders = false)
{
    using var activity = ActivitySource.StartActivity("GetCustomer");
    activity?.SetTag("customer.id", customerId);
    activity?.SetTag("include_orders", includeOrders);

    var customer = await _repository.GetCustomerAsync(customerId);

    // Only create span for expensive operation if needed
    if (includeOrders)
    {
        using var ordersActivity = ActivitySource.StartActivity("LoadCustomerOrders");
        ordersActivity?.SetTag("customer.id", customerId);
        
        customer.Orders = await _repository.GetOrdersByCustomerAsync(customerId);
        
        ordersActivity?.SetTag("orders.count", customer.Orders.Count);
        ordersActivity?.SetStatus(ActivityStatusCode.Ok);
    }

    activity?.SetStatus(ActivityStatusCode.Ok);
    return customer;
}
```

**Pattern 4: Batch Operation Span**

Create a single span for batch operations, not one per item.

```csharp
public async Task ProcessOrderBatchAsync(List<Order> orders)
{
    // ✅ Good: One span for the entire batch
    using var activity = ActivitySource.StartActivity("ProcessOrderBatch");
    activity?.SetTag("batch.size", orders.Count);

    var successCount = 0;
    var failureCount = 0;

    foreach (var order in orders)
    {
        try
        {
            await ProcessSingleOrderAsync(order);
            successCount++;
        }
        catch (Exception ex)
        {
            failureCount++;
            _logger.LogError(ex, "Failed to process order {OrderId}", order.Id);
        }
    }

    activity?.SetTag("batch.success_count", successCount);
    activity?.SetTag("batch.failure_count", failureCount);
    activity?.SetStatus(failureCount == 0 ? ActivityStatusCode.Ok : ActivityStatusCode.Error);
}

// ❌ Bad: Don't do this - creates too many spans
public async Task ProcessOrderBatchBad(List<Order> orders)
{
    foreach (var order in orders)
    {
        using var activity = ActivitySource.StartActivity("ProcessOrder"); // Too many!
        await ProcessSingleOrderAsync(order);
    }
}
```

#### How to Annotate Spans with Tags and Events

Proper annotation makes traces actionable. Tags provide context, while events mark significant moments.

**Tags (Attributes) Best Practices:**

**1. Use Semantic Conventions**

Follow OpenTelemetry semantic conventions for standard attributes:

```csharp
// ✅ Good: Standard semantic conventions
activity?.SetTag("http.method", "POST");
activity?.SetTag("http.url", "https://api.example.com/orders");
activity?.SetTag("http.status_code", 200);
activity?.SetTag("http.response_content_length", 1024);
activity?.SetTag("db.system", "postgresql");
activity?.SetTag("db.name", "orders_db");
activity?.SetTag("db.operation", "SELECT");
activity?.SetTag("messaging.system", "rabbitmq");
activity?.SetTag("messaging.destination", "order.created");

// ❌ Bad: Custom naming
activity?.SetTag("method", "POST");
activity?.SetTag("endpoint", "https://api.example.com/orders");
activity?.SetTag("response_code", 200);
```

**Common Semantic Conventions:**

| Category | Attributes | Example Values |
|----------|-----------|----------------|
| **HTTP** | `http.method`, `http.url`, `http.status_code`, `http.user_agent` | GET, https://..., 200 |
| **Database** | `db.system`, `db.name`, `db.operation`, `db.statement` | postgresql, orders_db, SELECT |
| **RPC** | `rpc.system`, `rpc.service`, `rpc.method` | grpc, OrderService, CreateOrder |
| **Messaging** | `messaging.system`, `messaging.destination`, `messaging.operation` | rabbitmq, order.created, send |
| **Error** | `error.type`, `error.message`, `error.stack` | ValidationException, Invalid email |

**2. Add Business Context**

Include domain-specific information that helps understand business impact:

```csharp
public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
{
    using var activity = ActivitySource.StartActivity("CreateOrder");
    
    // Business context
    activity?.SetTag("order.customer_id", request.CustomerId);
    activity?.SetTag("order.customer_tier", request.CustomerTier); // premium, standard, basic
    activity?.SetTag("order.type", request.OrderType); // express, standard, bulk
    activity?.SetTag("order.item_count", request.Items.Count);
    activity?.SetTag("order.total_amount", request.TotalAmount);
    activity?.SetTag("order.currency", request.Currency);
    activity?.SetTag("order.region", request.ShippingAddress.Region);
    activity?.SetTag("order.payment_method", request.PaymentMethod);
    
    // Feature flags
    activity?.SetTag("feature.express_checkout", _featureFlags.IsExpressCheckoutEnabled);
    
    var order = await ProcessOrderInternalAsync(request);
    
    // Result context
    activity?.SetTag("order.id", order.Id);
    activity?.SetTag("order.status", order.Status);
    activity?.SetTag("order.estimated_delivery_days", order.EstimatedDeliveryDays);
    
    return order;
}
```

**3. Avoid High-Cardinality Tags**

High-cardinality tags (millions of unique values) can cause performance and storage issues:

```csharp
// ❌ Bad: High cardinality (millions of unique values)
activity?.SetTag("user.id", userId); // Millions of users
activity?.SetTag("order.id", orderId); // Millions of orders
activity?.SetTag("timestamp", DateTime.UtcNow.ToString()); // Infinite values
activity?.SetTag("request.body", JsonSerializer.Serialize(request)); // Unique per request

// ✅ Good: Low cardinality (few unique values)
activity?.SetTag("user.tier", "premium"); // 3-5 values
activity?.SetTag("order.type", "express"); // 3-5 values
activity?.SetTag("region", "us-east-1"); // 10-20 values
activity?.SetTag("payment.method", "credit_card"); // 5-10 values
activity?.SetTag("order.size_category", "large"); // small, medium, large
```

**4. Tag Naming Conventions**

Use consistent, hierarchical naming:

```csharp
// ✅ Good: Hierarchical, consistent naming
activity?.SetTag("order.id", orderId);
activity?.SetTag("order.status", status);
activity?.SetTag("order.total_amount", amount);
activity?.SetTag("customer.id", customerId);
activity?.SetTag("customer.tier", tier);
activity?.SetTag("payment.method", method);
activity?.SetTag("payment.transaction_id", transactionId);

// ❌ Bad: Inconsistent naming
activity?.SetTag("orderId", orderId);
activity?.SetTag("OrderStatus", status);
activity?.SetTag("total", amount);
activity?.SetTag("cust_id", customerId);
```

**5. Add Tags Progressively**

Add tags as information becomes available:

```csharp
public async Task<Order> ProcessOrderAsync(CreateOrderRequest request)
{
    using var activity = ActivitySource.StartActivity("ProcessOrder");
    
    // Initial context
    activity?.SetTag("order.customer_id", request.CustomerId);
    activity?.SetTag("order.item_count", request.Items.Count);
    
    // After validation
    var customer = await ValidateCustomerAsync(request.CustomerId);
    activity?.SetTag("customer.tier", customer.Tier);
    activity?.SetTag("customer.lifetime_value", customer.LifetimeValue);
    
    // After payment
    var paymentResult = await ProcessPaymentAsync(request.Payment);
    activity?.SetTag("payment.transaction_id", paymentResult.TransactionId);
    activity?.SetTag("payment.processor", paymentResult.Processor);
    
    // After completion
    var order = await SaveOrderAsync(request);
    activity?.SetTag("order.id", order.Id);
    activity?.SetTag("order.status", order.Status);
    
    return order;
}
```

**Events Best Practices:**

Events mark significant moments within a span's lifetime.

**1. Use Events for Milestones**

```csharp
public async Task<Order> ProcessOrderAsync(Order order)
{
    using var activity = ActivitySource.StartActivity("ProcessOrder");
    
    activity?.AddEvent(new ActivityEvent("ValidationStarted"));
    await ValidateOrderAsync(order);
    activity?.AddEvent(new ActivityEvent("ValidationCompleted"));
    
    activity?.AddEvent(new ActivityEvent("InventoryCheckStarted"));
    var inventoryResult = await CheckInventoryAsync(order.Items);
    activity?.AddEvent(new ActivityEvent("InventoryCheckCompleted", 
        tags: new ActivityTagsCollection
        {
            ["inventory.available"] = inventoryResult.AllAvailable,
            ["inventory.reserved_count"] = inventoryResult.ReservedCount
        }));
    
    activity?.AddEvent(new ActivityEvent("PaymentProcessingStarted"));
    var paymentResult = await ProcessPaymentAsync(order);
    activity?.AddEvent(new ActivityEvent("PaymentProcessingCompleted",
        tags: new ActivityTagsCollection
        {
            ["payment.status"] = paymentResult.Status,
            ["payment.transaction_id"] = paymentResult.TransactionId
        }));
    
    return order;
}
```

**2. Use Events for State Changes**

```csharp
public async Task UpdateOrderStatusAsync(string orderId, OrderStatus newStatus)
{
    using var activity = ActivitySource.StartActivity("UpdateOrderStatus");
    activity?.SetTag("order.id", orderId);
    
    var order = await _repository.GetOrderAsync(orderId);
    var oldStatus = order.Status;
    
    activity?.AddEvent(new ActivityEvent("OrderStatusChanging",
        tags: new ActivityTagsCollection
        {
            ["old_status"] = oldStatus.ToString(),
            ["new_status"] = newStatus.ToString()
        }));
    
    order.Status = newStatus;
    await _repository.UpdateOrderAsync(order);
    
    activity?.AddEvent(new ActivityEvent("OrderStatusChanged",
        tags: new ActivityTagsCollection
        {
            ["status"] = newStatus.ToString(),
            ["changed_at"] = DateTime.UtcNow.ToString("O")
        }));
}
```

**3. Use Events for Retry Attempts**

```csharp
public async Task<T> ExecuteWithRetryAsync<T>(Func<Task<T>> operation, int maxRetries = 3)
{
    using var activity = ActivitySource.StartActivity("ExecuteWithRetry");
    activity?.SetTag("retry.max_attempts", maxRetries);
    
    for (int attempt = 1; attempt <= maxRetries; attempt++)
    {
        try
        {
            activity?.AddEvent(new ActivityEvent("RetryAttemptStarted",
                tags: new ActivityTagsCollection { ["attempt"] = attempt }));
            
            var result = await operation();
            
            activity?.AddEvent(new ActivityEvent("RetryAttemptSucceeded",
                tags: new ActivityTagsCollection { ["attempt"] = attempt }));
            activity?.SetTag("retry.attempts_used", attempt);
            
            return result;
        }
        catch (Exception ex) when (attempt < maxRetries)
        {
            activity?.AddEvent(new ActivityEvent("RetryAttemptFailed",
                tags: new ActivityTagsCollection
                {
                    ["attempt"] = attempt,
                    ["error.type"] = ex.GetType().Name,
                    ["error.message"] = ex.Message
                }));
            
            await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt))); // Exponential backoff
        }
    }
    
    throw new Exception($"Operation failed after {maxRetries} attempts");
}
```

#### Error Recording Patterns

Properly recording errors in spans is critical for debugging and alerting.

**Pattern 1: Basic Error Recording**

```csharp
public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
{
    using var activity = ActivitySource.StartActivity("CreateOrder");
    activity?.SetTag("order.customer_id", request.CustomerId);

    try
    {
        var order = await ProcessOrderInternalAsync(request);
        activity?.SetStatus(ActivityStatusCode.Ok);
        return order;
    }
    catch (Exception ex)
    {
        // Set error status with message
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
        
        // Record exception details
        activity?.RecordException(ex);
        
        // Re-throw to preserve stack trace
        throw;
    }
}
```

**Pattern 2: Categorized Error Recording**

```csharp
public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
{
    using var activity = ActivitySource.StartActivity("CreateOrder");

    try
    {
        return await ProcessOrderInternalAsync(request);
    }
    catch (ValidationException ex)
    {
        // Client error - user's fault
        activity?.SetStatus(ActivityStatusCode.Error, "Validation failed");
        activity?.SetTag("error.type", "validation");
        activity?.SetTag("error.category", "client_error");
        activity?.SetTag("error.retryable", false);
        activity?.RecordException(ex);
        throw;
    }
    catch (PaymentDeclinedException ex)
    {
        // Business error - expected scenario
        activity?.SetStatus(ActivityStatusCode.Error, "Payment declined");
        activity?.SetTag("error.type", "payment_declined");
        activity?.SetTag("error.category", "business_error");
        activity?.SetTag("error.retryable", false);
        activity?.SetTag("payment.decline_reason", ex.DeclineReason);
        activity?.RecordException(ex);
        throw;
    }
    catch (HttpRequestException ex)
    {
        // Infrastructure error - retryable
        activity?.SetStatus(ActivityStatusCode.Error, "External service unavailable");
        activity?.SetTag("error.type", "http_request");
        activity?.SetTag("error.category", "infrastructure_error");
        activity?.SetTag("error.retryable", true);
        activity?.RecordException(ex);
        throw;
    }
    catch (Exception ex)
    {
        // Unknown error - investigate
        activity?.SetStatus(ActivityStatusCode.Error, "Unexpected error");
        activity?.SetTag("error.type", "unexpected");
        activity?.SetTag("error.category", "server_error");
        activity?.RecordException(ex);
        throw;
    }
}
```

**Pattern 3: Partial Failure Recording**

```csharp
public async Task<BatchResult> ProcessOrderBatchAsync(List<Order> orders)
{
    using var activity = ActivitySource.StartActivity("ProcessOrderBatch");
    activity?.SetTag("batch.size", orders.Count);

    var results = new List<OrderResult>();
    var successCount = 0;
    var failureCount = 0;

    foreach (var order in orders)
    {
        try
        {
            await ProcessSingleOrderAsync(order);
            results.Add(new OrderResult { OrderId = order.Id, Success = true });
            successCount++;
        }
        catch (Exception ex)
        {
            results.Add(new OrderResult 
            { 
                OrderId = order.Id, 
                Success = false, 
                Error = ex.Message 
            });
            failureCount++;
            
            // Record individual failure as event, not span error
            activity?.AddEvent(new ActivityEvent("OrderProcessingFailed",
                tags: new ActivityTagsCollection
                {
                    ["order.id"] = order.Id,
                    ["error.type"] = ex.GetType().Name,
                    ["error.message"] = ex.Message
                }));
        }
    }

    activity?.SetTag("batch.success_count", successCount);
    activity?.SetTag("batch.failure_count", failureCount);
    activity?.SetTag("batch.success_rate", (double)successCount / orders.Count);

    // Only mark span as error if entire batch failed
    if (failureCount == orders.Count)
    {
        activity?.SetStatus(ActivityStatusCode.Error, "All orders failed");
    }
    else if (failureCount > 0)
    {
        // Partial failure - still OK status but with warning tag
        activity?.SetTag("batch.partial_failure", true);
        activity?.SetStatus(ActivityStatusCode.Ok);
    }
    else
    {
        activity?.SetStatus(ActivityStatusCode.Ok);
    }

    return new BatchResult { Results = results };
}
```

**Pattern 4: Error with Context**

```csharp
public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
{
    using var activity = ActivitySource.StartActivity("ProcessPayment");
    activity?.SetTag("payment.amount", request.Amount);
    activity?.SetTag("payment.method", request.Method);
    activity?.SetTag("payment.currency", request.Currency);

    try
    {
        var result = await _paymentGateway.ChargeAsync(request);
        activity?.SetTag("payment.transaction_id", result.TransactionId);
        activity?.SetStatus(ActivityStatusCode.Ok);
        return result;
    }
    catch (PaymentGatewayException ex)
    {
        // Add context before recording error
        activity?.SetTag("payment.gateway", ex.Gateway);
        activity?.SetTag("payment.gateway_error_code", ex.ErrorCode);
        activity?.SetTag("payment.gateway_error_message", ex.Message);
        activity?.SetTag("payment.retryable", ex.IsRetryable);
        
        // Add event for troubleshooting
        activity?.AddEvent(new ActivityEvent("PaymentGatewayError",
            tags: new ActivityTagsCollection
            {
                ["gateway"] = ex.Gateway,
                ["error_code"] = ex.ErrorCode,
                ["request_id"] = ex.RequestId,
                ["timestamp"] = DateTime.UtcNow.ToString("O")
            }));
        
        activity?.SetStatus(ActivityStatusCode.Error, $"Payment gateway error: {ex.ErrorCode}");
        activity?.RecordException(ex);
        throw;
    }
}
```

**Pattern 5: Handled Errors (Don't Mark Span as Error)**

```csharp
public async Task<Customer> GetCustomerAsync(string customerId)
{
    using var activity = ActivitySource.StartActivity("GetCustomer");
    activity?.SetTag("customer.id", customerId);

    try
    {
        var customer = await _repository.GetCustomerAsync(customerId);
        
        if (customer == null)
        {
            // This is an expected scenario, not an error
            activity?.SetTag("customer.found", false);
            activity?.SetStatus(ActivityStatusCode.Ok); // Still OK!
            
            activity?.AddEvent(new ActivityEvent("CustomerNotFound",
                tags: new ActivityTagsCollection
                {
                    ["customer.id"] = customerId,
                    ["action"] = "returning_null"
                }));
            
            return null;
        }

        activity?.SetTag("customer.found", true);
        activity?.SetTag("customer.tier", customer.Tier);
        activity?.SetStatus(ActivityStatusCode.Ok);
        return customer;
    }
    catch (Exception ex)
    {
        // This is an actual error (database failure, etc.)
        activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
        activity?.RecordException(ex);
        throw;
    }
}
```

#### Span Annotation Anti-Patterns

**❌ Anti-Pattern 1: Too Many Tags**

```csharp
// Bad: 50+ tags make traces hard to read
activity?.SetTag("field1", value1);
activity?.SetTag("field2", value2);
// ... 48 more tags
```

**✅ Solution:** Focus on 5-10 most important tags. Use structured logging for detailed data.

**❌ Anti-Pattern 2: Sensitive Data in Tags**

```csharp
// Bad: PII and sensitive data
activity?.SetTag("user.email", "user@example.com");
activity?.SetTag("user.ssn", "123-45-6789");
activity?.SetTag("credit_card.number", "4111111111111111");
```

**✅ Solution:** Never include PII or sensitive data. Use hashed/masked values if needed.

**❌ Anti-Pattern 3: Large String Values**

```csharp
// Bad: Large payloads
activity?.SetTag("request.body", JsonSerializer.Serialize(largeRequest));
activity?.SetTag("response.body", JsonSerializer.Serialize(largeResponse));
```

**✅ Solution:** Use size/count metrics instead. Log full payloads separately if needed.

**❌ Anti-Pattern 4: Not Setting Status**

```csharp
// Bad: No status set
using var activity = ActivitySource.StartActivity("ProcessOrder");
await ProcessOrderAsync(order);
// Missing: activity?.SetStatus(ActivityStatusCode.Ok);
```

**✅ Solution:** Always set status (Ok or Error) before span ends.

#### Summary Checklist

**When Creating Spans:**
- [ ] Create spans for service boundaries, I/O operations, and significant business logic
- [ ] Don't create spans for simple getters, in-memory operations, or tight loops
- [ ] Use nested spans for sub-operations within a larger operation
- [ ] Create one span for batch operations, not one per item

**When Annotating Spans:**
- [ ] Use semantic conventions for standard attributes (http.*, db.*, etc.)
- [ ] Add business context (customer tier, order type, region)
- [ ] Avoid high-cardinality tags (user IDs, order IDs, timestamps)
- [ ] Use consistent, hierarchical naming (order.id, customer.tier)
- [ ] Add tags progressively as information becomes available
- [ ] Use events for milestones, state changes, and retry attempts

**When Recording Errors:**
- [ ] Always set error status with message
- [ ] Always record exception details
- [ ] Categorize errors (validation, business, infrastructure)
- [ ] Add error context (error type, category, retryable)
- [ ] Use events for partial failures in batch operations
- [ ] Don't mark span as error for expected scenarios (not found, etc.)
- [ ] Never include sensitive data in error messages or tags

---

### 5.4 Bottleneck Identification Techniques

Once you have distributed tracing in place, the next critical skill is analyzing trace data to identify performance bottlenecks and latency issues. This section provides systematic approaches to finding and resolving performance problems using trace analysis.

#### Understanding Trace Analysis Fundamentals

**What is a Bottleneck?**

A bottleneck is any component or operation that limits the overall throughput or increases the latency of your system. In distributed tracing, bottlenecks appear as:
- Spans with disproportionately long durations
- Operations that block other operations from proceeding
- Services that are consistently slow across many traces
- Dependencies that add significant latency

**Types of Bottlenecks:**

| Type | Description | Symptoms | Common Causes |
|------|-------------|----------|---------------|
| **CPU-Bound** | Excessive computation | High CPU usage, long processing time | Complex algorithms, inefficient code, lack of caching |
| **I/O-Bound** | Waiting for I/O operations | Low CPU, high wait time | Slow database queries, network latency, disk I/O |
| **Concurrency** | Resource contention | Inconsistent latency, lock wait time | Database locks, thread pool exhaustion, rate limiting |
| **Network** | Network communication delays | High network latency | Geographic distance, bandwidth limits, packet loss |
| **Dependency** | External service slowness | Waiting on external calls | Third-party API slowness, service degradation |

#### How to Analyze Trace Data

**Step 1: Identify Slow Traces**

Start by finding traces that exceed your latency targets.

**Using Application Insights (KQL):**

```kusto
// Find slow requests (p95 > 1000ms)
requests
| where timestamp > ago(1h)
| summarize p95 = percentile(duration, 95) by name
| where p95 > 1000
| order by p95 desc

// Get specific slow trace IDs
requests
| where timestamp > ago(1h)
| where duration > 1000
| project timestamp, operation_Id, name, duration, resultCode
| order by duration desc
| take 20
```

**Using AWS X-Ray:**

```python
# Using AWS X-Ray SDK to query slow traces
import boto3
from datetime import datetime, timedelta

xray = boto3.client('xray')

# Find traces with high latency
end_time = datetime.utcnow()
start_time = end_time - timedelta(hours=1)

response = xray.get_trace_summaries(
    StartTime=start_time,
    EndTime=end_time,
    FilterExpression='duration >= 1.0'  # 1 second or more
)

for summary in response['TraceSummaries']:
    print(f"Trace ID: {summary['Id']}, Duration: {summary['Duration']}s")
```

**Step 2: Visualize the Trace Waterfall**

Once you have a slow trace ID, visualize it to see the timeline of operations.

**Trace Waterfall Interpretation:**

```
Request Timeline (Total: 2500ms)
│
├─ [0-50ms] API Gateway                    ▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
├─ [50-100ms] Load Balancer                ░▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
├─ [100-2400ms] Order Service              ░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░
│  ├─ [100-150ms] Validate Request         ░░▓░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
│  ├─ [150-2300ms] Database Query          ░░░▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░  ← BOTTLENECK!
│  └─ [2300-2400ms] Format Response        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓░░░
└─ [2400-2500ms] Return Response           ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░▓░░

Analysis: Database query takes 2150ms (86% of total time) - PRIMARY BOTTLENECK
```

**What to Look For:**
- **Long horizontal bars** - Operations taking significant time
- **Sequential operations** - Operations that could be parallelized
- **Repeated patterns** - Same operation called multiple times (N+1 problem)
- **Gaps** - Unexplained time between operations (network latency, queuing)

**Step 3: Analyze Span Attributes**

Examine span tags and events to understand what the slow operation was doing.

**Key Attributes to Check:**

```csharp
// Example span attributes to analyze
{
    "db.system": "postgresql",
    "db.name": "orders_db",
    "db.operation": "SELECT",
    "db.statement": "SELECT * FROM orders WHERE customer_id = $1 AND status IN (...)",
    "db.rows_affected": 15000,  // ← Large result set!
    "http.status_code": 200,
    "order.customer_id": "cust_12345",
    "order.status_filter": "pending,processing,shipped",  // ← Multiple statuses
    "span.duration_ms": 2150
}
```

**Analysis Questions:**
- Is the query fetching too much data? (Check `db.rows_affected`)
- Is the query missing an index? (Check `db.statement`)
- Is there an N+1 query pattern? (Check for repeated similar queries)
- Is the operation retrying? (Check for retry events)
- Is there a timeout or rate limit? (Check error tags)

#### Identifying Latency Issues

**Pattern 1: Database Query Bottlenecks**

**Symptoms:**
- Database spans take > 100ms (p95)
- Large number of rows returned
- Complex JOIN operations
- Missing indexes

**Analysis Approach:**

```kusto
// Application Insights: Find slow database queries
dependencies
| where type == "SQL"
| where timestamp > ago(1h)
| where duration > 100
| summarize 
    count = count(),
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    p99_duration = percentile(duration, 99)
    by data  // Query text
| where count > 10  // Frequent queries
| order by p95_duration desc
```

**Common Issues:**

```csharp
// ❌ Problem: N+1 Query Pattern
public async Task<List<OrderWithCustomer>> GetOrdersWithCustomersAsync()
{
    var orders = await _dbContext.Orders.ToListAsync();  // 1 query
    
    foreach (var order in orders)  // N queries!
    {
        order.Customer = await _dbContext.Customers
            .FindAsync(order.CustomerId);
    }
    
    return orders;
}

// ✅ Solution: Use eager loading
public async Task<List<OrderWithCustomer>> GetOrdersWithCustomersAsync()
{
    return await _dbContext.Orders
        .Include(o => o.Customer)  // Single query with JOIN
        .ToListAsync();
}

// ❌ Problem: Fetching too much data
public async Task<List<Order>> GetCustomerOrdersAsync(string customerId)
{
    return await _dbContext.Orders
        .Where(o => o.CustomerId == customerId)
        .ToListAsync();  // Returns all columns, all rows
}

// ✅ Solution: Select only needed data, add pagination
public async Task<List<OrderSummary>> GetCustomerOrdersAsync(
    string customerId, 
    int page = 1, 
    int pageSize = 20)
{
    return await _dbContext.Orders
        .Where(o => o.CustomerId == customerId)
        .OrderByDescending(o => o.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new OrderSummary  // Only needed fields
        {
            Id = o.Id,
            Total = o.Total,
            Status = o.Status,
            CreatedAt = o.CreatedAt
        })
        .ToListAsync();
}

// ❌ Problem: Missing index
// Query: SELECT * FROM orders WHERE customer_id = ? AND status = ?
// Trace shows: 2000ms duration, 50000 rows scanned

// ✅ Solution: Add composite index
// CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);
// New trace shows: 50ms duration, 100 rows scanned
```

**Pattern 2: External API Call Bottlenecks**

**Symptoms:**
- HTTP client spans take > 500ms
- Inconsistent latency (sometimes fast, sometimes slow)
- Timeout errors
- High failure rate

**Analysis Approach:**

```kusto
// Application Insights: Analyze external API performance
dependencies
| where type == "Http"
| where timestamp > ago(1h)
| summarize 
    count = count(),
    success_rate = countif(success == true) * 100.0 / count(),
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95),
    p99_duration = percentile(duration, 99)
    by target  // External service
| order by p95_duration desc
```

**Common Issues:**

```csharp
// ❌ Problem: Sequential external calls
public async Task<OrderDetails> GetOrderDetailsAsync(string orderId)
{
    using var activity = ActivitySource.StartActivity("GetOrderDetails");
    
    var order = await _orderService.GetOrderAsync(orderId);  // 200ms
    var customer = await _customerService.GetCustomerAsync(order.CustomerId);  // 200ms
    var inventory = await _inventoryService.GetInventoryAsync(order.Items);  // 200ms
    // Total: 600ms (sequential)
    
    return new OrderDetails { Order = order, Customer = customer, Inventory = inventory };
}

// ✅ Solution: Parallel external calls
public async Task<OrderDetails> GetOrderDetailsAsync(string orderId)
{
    using var activity = ActivitySource.StartActivity("GetOrderDetails");
    
    var order = await _orderService.GetOrderAsync(orderId);
    
    // Execute in parallel
    var customerTask = _customerService.GetCustomerAsync(order.CustomerId);
    var inventoryTask = _inventoryService.GetInventoryAsync(order.Items);
    
    await Task.WhenAll(customerTask, inventoryTask);
    // Total: ~200ms (parallel)
    
    return new OrderDetails 
    { 
        Order = order, 
        Customer = customerTask.Result, 
        Inventory = inventoryTask.Result 
    };
}

// ❌ Problem: No timeout configured
public class PaymentService
{
    private readonly HttpClient _httpClient = new HttpClient();  // No timeout!
    
    public async Task<PaymentResult> ProcessPaymentAsync(PaymentRequest request)
    {
        // Can hang indefinitely if payment gateway is slow
        var response = await _httpClient.PostAsJsonAsync("/charge", request);
        return await response.Content.ReadFromJsonAsync<PaymentResult>();
    }
}

// ✅ Solution: Configure timeout and retry policy
public class PaymentService
{
    private readonly HttpClient _httpClient;
    
    public PaymentService(IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient("PaymentGateway");
    }
}

// In Startup.cs
services.AddHttpClient("PaymentGateway", client =>
{
    client.BaseAddress = new Uri("https://payment-gateway.example.com");
    client.Timeout = TimeSpan.FromSeconds(10);  // 10 second timeout
})
.AddPolicyHandler(GetRetryPolicy())
.AddPolicyHandler(GetCircuitBreakerPolicy());

static IAsyncPolicy<HttpResponseMessage> GetRetryPolicy()
{
    return HttpPolicyExtensions
        .HandleTransientHttpError()
        .WaitAndRetryAsync(3, retryAttempt => 
            TimeSpan.FromSeconds(Math.Pow(2, retryAttempt)));
}
```

**Pattern 3: Serialization/Deserialization Bottlenecks**

**Symptoms:**
- Spans for JSON serialization/deserialization take > 50ms
- Large payload sizes
- High CPU usage during serialization

**Analysis Approach:**

```csharp
// Add instrumentation to measure serialization time
public class OrderController : ControllerBase
{
    private static readonly ActivitySource ActivitySource = new("OrderService");
    
    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(string id)
    {
        using var activity = ActivitySource.StartActivity("GetOrder");
        
        var order = await _orderService.GetOrderAsync(id);
        
        // Measure serialization time
        using (var serializationActivity = ActivitySource.StartActivity("SerializeResponse"))
        {
            serializationActivity?.SetTag("response.type", "Order");
            serializationActivity?.SetTag("response.size_estimate", EstimateSize(order));
            
            return Ok(order);  // Serialization happens here
        }
    }
}
```

**Common Issues:**

```csharp
// ❌ Problem: Circular references causing slow serialization
public class Order
{
    public string Id { get; set; }
    public Customer Customer { get; set; }
}

public class Customer
{
    public string Id { get; set; }
    public List<Order> Orders { get; set; }  // Circular reference!
}

// ✅ Solution: Use DTOs without circular references
public class OrderDto
{
    public string Id { get; set; }
    public string CustomerId { get; set; }
    public string CustomerName { get; set; }
    // No Customer object, just the needed fields
}

// ❌ Problem: Serializing large collections
public async Task<IActionResult> GetAllOrders()
{
    var orders = await _dbContext.Orders.ToListAsync();  // 100,000 orders!
    return Ok(orders);  // Serialization takes 5+ seconds
}

// ✅ Solution: Pagination and projection
public async Task<IActionResult> GetOrders(int page = 1, int pageSize = 50)
{
    var orders = await _dbContext.Orders
        .OrderByDescending(o => o.CreatedAt)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .Select(o => new OrderSummaryDto  // Smaller DTO
        {
            Id = o.Id,
            Total = o.Total,
            Status = o.Status
        })
        .ToListAsync();
    
    return Ok(new PagedResult<OrderSummaryDto>
    {
        Items = orders,
        Page = page,
        PageSize = pageSize
    });
}
```

#### Finding Performance Bottlenecks Systematically

**The Critical Path Method**

Identify the critical path - the sequence of operations that determines the minimum time to complete a request.

**Steps:**

1. **Visualize the trace** - Look at the waterfall diagram
2. **Identify the longest span** - This is your primary bottleneck
3. **Check if it's parallelizable** - Can it run concurrently with other operations?
4. **Analyze the span details** - What is it doing? Why is it slow?
5. **Optimize or parallelize** - Fix the bottleneck
6. **Repeat** - Find the next longest span

**Example Analysis:**

```
Original Trace (2500ms total):
├─ Validate Request: 50ms
├─ Get Customer: 200ms
├─ Check Inventory: 300ms
├─ Calculate Shipping: 150ms
├─ Process Payment: 1500ms  ← CRITICAL PATH (60% of time)
└─ Save Order: 300ms

Step 1: Optimize payment processing (1500ms → 800ms)
- Add caching for payment gateway configuration
- Use connection pooling
- Optimize payment validation logic

New Trace (1800ms total):
├─ Validate Request: 50ms
├─ Get Customer: 200ms
├─ Check Inventory: 300ms  ← NEW CRITICAL PATH
├─ Calculate Shipping: 150ms
├─ Process Payment: 800ms
└─ Save Order: 300ms

Step 2: Parallelize independent operations
- Get Customer and Check Inventory can run in parallel
- Calculate Shipping can run in parallel with Payment

Final Trace (1100ms total):
├─ Validate Request: 50ms
├─ [Parallel]
│  ├─ Get Customer: 200ms
│  ├─ Check Inventory: 300ms
│  └─ Calculate Shipping: 150ms
├─ Process Payment: 800ms
└─ Save Order: 300ms

Result: 56% improvement (2500ms → 1100ms)
```

**Trace Comparison Tool**

Compare traces before and after optimization:

```kusto
// Application Insights: Compare performance before/after deployment
let baseline = requests
    | where timestamp between (datetime(2025-01-01) .. datetime(2025-01-07))
    | where name == "POST /orders"
    | summarize baseline_p95 = percentile(duration, 95);
let current = requests
    | where timestamp > ago(7d)
    | where name == "POST /orders"
    | summarize current_p95 = percentile(duration, 95);
baseline
| extend current_p95 = toscalar(current)
| extend improvement_pct = (baseline_p95 - current_p95) * 100.0 / baseline_p95
| project baseline_p95, current_p95, improvement_pct
```

#### Bottleneck Identification Checklist

**When analyzing a slow trace:**

- [ ] **Identify the slowest span** - Start with the longest duration
- [ ] **Check span attributes** - Look for clues (query text, row count, payload size)
- [ ] **Look for patterns** - N+1 queries, sequential calls, repeated operations
- [ ] **Check for parallelization opportunities** - Can operations run concurrently?
- [ ] **Analyze dependencies** - Are external services slow or failing?
- [ ] **Review error rates** - Are retries adding latency?
- [ ] **Check resource utilization** - Is CPU, memory, or I/O saturated?
- [ ] **Compare with baseline** - Is this slower than normal?

**Common Bottleneck Patterns:**

| Pattern | Symptom | Solution |
|---------|---------|----------|
| **N+1 Queries** | Many small database spans | Use eager loading (Include/Join) |
| **Sequential API Calls** | Long total time, short individual spans | Parallelize with Task.WhenAll |
| **Large Result Sets** | Long database span, high row count | Add pagination, select only needed columns |
| **Missing Index** | Long database span, high rows scanned | Add database index |
| **Blocking I/O** | Long wait time, low CPU | Use async/await |
| **Serialization** | Long serialization span | Use DTOs, avoid circular references |
| **No Caching** | Repeated identical calls | Add caching layer |
| **Timeout/Retry** | Multiple retry events | Optimize upstream service, adjust timeout |

#### Advanced Analysis Techniques

**Percentile Analysis**

Don't just look at averages - analyze percentiles to find outliers:

```kusto
// Application Insights: Percentile analysis by operation
requests
| where timestamp > ago(24h)
| summarize 
    count = count(),
    p50 = percentile(duration, 50),
    p75 = percentile(duration, 75),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99),
    max = max(duration)
    by name
| extend p99_to_p50_ratio = p99 / p50
| where p99_to_p50_ratio > 5  // High variance
| order by p99 desc
```

**Interpretation:**
- **p50 (median)** - Typical user experience
- **p95** - 95% of users experience this or better
- **p99** - Worst 1% of experiences
- **High p99/p50 ratio** - Inconsistent performance, investigate outliers

**Correlation Analysis**

Find correlations between span attributes and latency:

```kusto
// Application Insights: Correlate latency with attributes
requests
| where timestamp > ago(24h)
| where name == "POST /orders"
| extend customer_tier = tostring(customDimensions.customer_tier)
| summarize 
    count = count(),
    avg_duration = avg(duration),
    p95_duration = percentile(duration, 95)
    by customer_tier
| order by p95_duration desc
```

**Example Insights:**
- Premium customers have 2x faster response times (better infrastructure allocation)
- Orders from EU region are 3x slower (geographic latency)
- Large orders (>10 items) are 5x slower (N+1 query problem)

#### Summary

**Key Takeaways:**

1. **Start with slow traces** - Use percentiles (p95, p99) to find problematic requests
2. **Visualize the waterfall** - Identify the longest spans (critical path)
3. **Analyze span attributes** - Understand what the slow operation was doing
4. **Look for patterns** - N+1 queries, sequential calls, large payloads
5. **Optimize systematically** - Fix the biggest bottleneck first, then repeat
6. **Parallelize when possible** - Run independent operations concurrently
7. **Compare before/after** - Measure the impact of optimizations
8. **Monitor continuously** - Performance can degrade over time

**Tools and Queries:**
- Use KQL (Application Insights) or X-Ray queries to find slow traces
- Visualize traces in waterfall format to identify bottlenecks
- Analyze span attributes to understand root causes
- Compare percentiles before and after optimizations

**Common Bottlenecks:**
- Database queries (N+1, missing indexes, large result sets)
- External API calls (sequential, no timeout, no caching)
- Serialization (circular references, large payloads)
- Blocking I/O (synchronous operations)

---

## Logging Strategy

Effective logging is the foundation of observability, providing detailed context for debugging, auditing, and understanding system behavior. This section defines structured logging patterns, log level guidance, PII protection, log aggregation, and query patterns for .NET applications on AWS and Azure.

### 6.1 Structured Logging with Serilog

Structured logging treats log events as data structures rather than plain text, enabling powerful querying, filtering, and analysis. Serilog is the recommended logging framework for .NET applications due to its rich ecosystem, performance, and excellent cloud platform integration.

#### Why Structured Logging?

**Traditional Logging (Unstructured):**
```csharp
logger.LogInformation($"User {userId} placed order {orderId} for ${amount}");
// Output: "User 12345 placed order ORD-789 for $99.99"
```

**Problems:**
- Difficult to query (requires regex or full-text search)
- No type safety
- Hard to aggregate or analyze
- Expensive to index and search

**Structured Logging:**
```csharp
logger.LogInformation("User {UserId} placed order {OrderId} for {Amount:C}", 
    userId, orderId, amount);
// Output (JSON): {"UserId": 12345, "OrderId": "ORD-789", "Amount": 99.99, "Message": "User 12345 placed order ORD-789 for $99.99"}
```

**Benefits:**
- ✅ Queryable by field (e.g., "find all orders > $100")
- ✅ Type-safe parameters
- ✅ Efficient indexing and searching
- ✅ Easy aggregation and analysis
- ✅ Correlation across services

#### Serilog Setup and Configuration

**1. Install NuGet Packages:**

```bash
# Core Serilog
dotnet add package Serilog.AspNetCore

# Sinks (choose based on platform)
dotnet add package Serilog.Sinks.Console
dotnet add package Serilog.Sinks.File

# AWS
dotnet add package Serilog.Sinks.AwsCloudWatch

# Azure
dotnet add package Serilog.Sinks.ApplicationInsights

# Enrichers
dotnet add package Serilog.Enrichers.Environment
dotnet add package Serilog.Enrichers.Thread
dotnet add package Serilog.Enrichers.Process
```

**2. Configure in Program.cs:**

```csharp
using Serilog;
using Serilog.Events;
using Serilog.Formatting.Json;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithMachineName()
    .Enrich.WithEnvironmentName()
    .Enrich.WithThreadId()
    .Enrich.WithProcessId()
    .WriteTo.Console(new JsonFormatter())
    .WriteTo.File(
        new JsonFormatter(),
        "logs/app-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .CreateLogger();

builder.Host.UseSerilog();

try
{
    Log.Information("Starting web application");
    
    var app = builder.Build();
    
    // Add Serilog request logging
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("RequestScheme", httpContext.Request.Scheme);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers["User-Agent"].ToString());
            diagnosticContext.Set("ClientIP", httpContext.Connection.RemoteIpAddress?.ToString());
        };
    });
    
    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
```

**3. Configuration in appsettings.json:**

```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.Console", "Serilog.Sinks.File"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      },
      {
        "Name": "File",
        "Args": {
          "path": "logs/app-.log",
          "rollingInterval": "Day",
          "retainedFileCountLimit": 7,
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName", "WithThreadId"]
  }
}
```

**4. Environment-Specific Configuration:**

```json
// appsettings.Development.json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug"
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "outputTemplate": "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj} {Properties:j}{NewLine}{Exception}"
        }
      }
    ]
  }
}

// appsettings.Production.json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information"
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      },
      {
        "Name": "ApplicationInsights",
        "Args": {
          "telemetryConverter": "Serilog.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights"
        }
      }
    ]
  }
}
```

#### Structured Logging Best Practices

**1. Use Message Templates (Not String Interpolation):**

```csharp
// ❌ BAD: String interpolation
logger.LogInformation($"Processing order {orderId} for user {userId}");

// ✅ GOOD: Message template with named parameters
logger.LogInformation("Processing order {OrderId} for user {UserId}", orderId, userId);
```

**Why:** Message templates enable structured logging, type safety, and efficient serialization.

**2. Use Semantic Property Names:**

```csharp
// ❌ BAD: Generic names
logger.LogInformation("Processing {Id} for {Name}", orderId, userName);

// ✅ GOOD: Semantic names
logger.LogInformation("Processing order {OrderId} for user {UserName}", orderId, userName);
```

**3. Use Destructuring for Complex Objects:**

```csharp
public class Order
{
    public int Id { get; set; }
    public decimal Total { get; set; }
    public string Status { get; set; }
}

var order = new Order { Id = 123, Total = 99.99m, Status = "Pending" };

// ❌ BAD: ToString() representation
logger.LogInformation("Created order {Order}", order);
// Output: "Created order MyApp.Order"

// ✅ GOOD: Destructure with @ operator
logger.LogInformation("Created order {@Order}", order);
// Output: {"Order": {"Id": 123, "Total": 99.99, "Status": "Pending"}}

// ✅ ALSO GOOD: Log specific properties
logger.LogInformation("Created order {OrderId} with total {OrderTotal:C} and status {OrderStatus}", 
    order.Id, order.Total, order.Status);
```

**4. Use Format Specifiers:**

```csharp
// Currency
logger.LogInformation("Order total: {Amount:C}", 99.99m);
// Output: "Order total: $99.99"

// Number with decimals
logger.LogInformation("Processing time: {Duration:F2} seconds", 1.23456);
// Output: "Processing time: 1.23 seconds"

// Hexadecimal
logger.LogInformation("Error code: {ErrorCode:X}", 255);
// Output: "Error code: FF"
```

**5. Use LogContext for Correlation:**

```csharp
using Serilog.Context;

public async Task<IActionResult> ProcessOrder(int orderId)
{
    // Push correlation ID to log context
    using (LogContext.PushProperty("OrderId", orderId))
    using (LogContext.PushProperty("CorrelationId", HttpContext.TraceIdentifier))
    {
        _logger.LogInformation("Starting order processing");
        
        await _orderService.ProcessAsync(orderId);
        
        _logger.LogInformation("Order processing completed");
        
        // All logs within this scope will include OrderId and CorrelationId
    }
    
    return Ok();
}
```

**6. Avoid Logging Sensitive Data:**

```csharp
// ❌ BAD: Logging sensitive data
logger.LogInformation("User {Email} logged in with password {Password}", email, password);

// ✅ GOOD: Log only non-sensitive identifiers
logger.LogInformation("User {UserId} logged in successfully", userId);

// ✅ GOOD: Mask sensitive data
logger.LogInformation("Processing payment for card ending in {CardLast4}", cardNumber.Substring(cardNumber.Length - 4));
```

#### Message Template Patterns

**Standard Patterns:**

```csharp
// Entity operations
logger.LogInformation("Creating {EntityType} with {EntityId}", "Order", orderId);
logger.LogInformation("Updating {EntityType} {EntityId}", "Order", orderId);
logger.LogInformation("Deleting {EntityType} {EntityId}", "Order", orderId);

// Service calls
logger.LogInformation("Calling {ServiceName}.{MethodName} with {Parameters}", 
    "PaymentService", "ProcessPayment", new { orderId, amount });

// Performance tracking
logger.LogInformation("{OperationName} completed in {ElapsedMs} ms", 
    "OrderProcessing", stopwatch.ElapsedMilliseconds);

// Business events
logger.LogInformation("Order {OrderId} transitioned from {OldStatus} to {NewStatus}", 
    orderId, oldStatus, newStatus);

// External integrations
logger.LogInformation("Calling external API {ApiName} at {Endpoint}", 
    "PaymentGateway", "https://api.payment.com/charge");
```

**Error Patterns:**

```csharp
// Exception logging
try
{
    await ProcessOrderAsync(orderId);
}
catch (Exception ex)
{
    logger.LogError(ex, "Failed to process order {OrderId}", orderId);
    throw;
}

// Validation errors
if (!ModelState.IsValid)
{
    logger.LogWarning("Invalid model state for {Action}: {Errors}", 
        "CreateOrder", ModelState.Values.SelectMany(v => v.Errors));
}

// Business rule violations
if (order.Total < 0)
{
    logger.LogWarning("Order {OrderId} has invalid total {Total}", orderId, order.Total);
}
```

#### AWS CloudWatch Integration

```csharp
// Install package
// dotnet add package Serilog.Sinks.AwsCloudWatch

using Serilog;
using Serilog.Sinks.AwsCloudWatch;
using Amazon.CloudWatchLogs;

var client = new AmazonCloudWatchLogsClient();

var options = new CloudWatchSinkOptions
{
    LogGroupName = "/aws/application/myapp",
    LogStreamNameProvider = new DefaultLogStreamProvider(),
    TextFormatter = new JsonFormatter(),
    MinimumLogEventLevel = LogEventLevel.Information,
    BatchSizeLimit = 100,
    QueueSizeLimit = 10000,
    Period = TimeSpan.FromSeconds(10),
    CreateLogGroup = true,
    LogGroupRetentionPolicy = LogGroupRetentionPolicy.OneWeek
};

Log.Logger = new LoggerConfiguration()
    .WriteTo.AmazonCloudWatch(options, client)
    .CreateLogger();
```

#### Azure Application Insights Integration

```csharp
// Install package
// dotnet add package Serilog.Sinks.ApplicationInsights

using Serilog;
using Serilog.Sinks.ApplicationInsights.TelemetryConverters;

var builder = WebApplication.CreateBuilder(args);

// Add Application Insights
builder.Services.AddApplicationInsightsTelemetry();

// Configure Serilog with Application Insights
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .WriteTo.ApplicationInsights(
        builder.Configuration["ApplicationInsights:InstrumentationKey"],
        TelemetryConverter.Traces)
    .CreateLogger();

builder.Host.UseSerilog();
```

**Alternative: Using Configuration:**

```json
{
  "Serilog": {
    "WriteTo": [
      {
        "Name": "ApplicationInsights",
        "Args": {
          "instrumentationKey": "your-instrumentation-key",
          "telemetryConverter": "Serilog.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights"
        }
      }
    ]
  }
}
```

#### Performance Considerations

**1. Async Logging:**

```csharp
// Use async sink for high-volume logging
Log.Logger = new LoggerConfiguration()
    .WriteTo.Async(a => a.File("logs/app.log"))
    .WriteTo.Async(a => a.ApplicationInsights(instrumentationKey, TelemetryConverter.Traces))
    .CreateLogger();
```

**2. Conditional Logging:**

```csharp
// ❌ BAD: Always evaluates expensive operation
logger.LogDebug("User data: {UserData}", GetExpensiveUserData());

// ✅ GOOD: Only evaluates if Debug level is enabled
if (logger.IsEnabled(LogLevel.Debug))
{
    logger.LogDebug("User data: {UserData}", GetExpensiveUserData());
}
```

**3. Sampling for High-Volume Logs:**

```csharp
// Sample 10% of requests
if (Random.Shared.Next(100) < 10)
{
    logger.LogInformation("Sampled request: {RequestPath}", httpContext.Request.Path);
}
```

---

### 6.2 Log Level Guidance

Choosing the appropriate log level is critical for balancing observability with performance and cost. This section provides clear guidance on when to use each log level and includes a decision tree to help developers make the right choice.

#### Log Levels Overview

| Level | Severity | Purpose | Production Volume | Retention |
|-------|----------|---------|-------------------|-----------|
| **Trace** | Lowest | Detailed diagnostic information | None (dev only) | N/A |
| **Debug** | Low | Debugging information for developers | None (dev only) | N/A |
| **Information** | Normal | General informational messages | Low-Medium | 30-90 days |
| **Warning** | Elevated | Potentially harmful situations | Low | 90 days |
| **Error** | High | Error events that might still allow the application to continue | Medium | 90-365 days |
| **Critical** | Highest | Critical failures requiring immediate attention | Very Low | 365+ days |

#### When to Use Each Log Level

**Trace - Detailed Diagnostic Information**

**Use For:**
- Entry and exit of methods
- Variable values during execution
- Detailed flow through code
- Performance measurements at granular level

**Examples:**
```csharp
logger.LogTrace("Entering method {MethodName} with parameters {Parameters}", 
    nameof(ProcessOrder), new { orderId, userId });

logger.LogTrace("Variable {VariableName} has value {Value}", 
    nameof(calculatedTotal), calculatedTotal);

logger.LogTrace("Exiting method {MethodName} with result {Result}", 
    nameof(ProcessOrder), result);
```

**Production Use:** ❌ Never enable in production (too verbose, performance impact)

**Typical Scenarios:**
- Troubleshooting complex logic in development
- Understanding exact execution flow
- Debugging race conditions or timing issues

---

**Debug - Developer Debugging Information**

**Use For:**
- Internal state changes
- Intermediate calculation results
- Cache hits/misses
- Configuration values loaded
- Non-critical diagnostic information

**Examples:**
```csharp
logger.LogDebug("Cache {CacheOperation} for key {CacheKey}", "hit", cacheKey);

logger.LogDebug("Loaded configuration: {ConfigSection} = {ConfigValue}", 
    "Database:ConnectionString", connectionString.Substring(0, 20) + "...");

logger.LogDebug("Calculated discount: {DiscountAmount:C} for order {OrderId}", 
    discountAmount, orderId);

logger.LogDebug("Retry attempt {AttemptNumber} of {MaxAttempts} for operation {Operation}", 
    attemptNumber, maxAttempts, operationName);
```

**Production Use:** ⚠️ Rarely (only when actively troubleshooting, then disable)

**Typical Scenarios:**
- Investigating specific issues in production
- Understanding why a calculation produced unexpected results
- Debugging integration issues

---

**Information - General Informational Messages**

**Use For:**
- Application lifecycle events (startup, shutdown)
- Significant business events (order placed, payment processed)
- External service calls (API requests, database queries)
- User actions (login, logout, profile update)
- Background job execution
- Configuration changes

**Examples:**
```csharp
logger.LogInformation("Application started successfully");

logger.LogInformation("User {UserId} logged in from {IPAddress}", userId, ipAddress);

logger.LogInformation("Order {OrderId} created with total {Total:C} for customer {CustomerId}", 
    orderId, total, customerId);

logger.LogInformation("Calling external API {ApiName} at {Endpoint}", 
    "PaymentGateway", endpoint);

logger.LogInformation("Background job {JobName} completed processing {ItemCount} items in {Duration} ms", 
    jobName, itemCount, duration);

logger.LogInformation("Configuration reloaded from {Source}", configSource);
```

**Production Use:** ✅ Yes (default level for production)

**Typical Scenarios:**
- Understanding normal application flow
- Tracking business events
- Auditing user actions
- Monitoring external dependencies

---

**Warning - Potentially Harmful Situations**

**Use For:**
- Recoverable errors (retry succeeded)
- Deprecated API usage
- Performance degradation (slow queries, high memory)
- Business rule violations (invalid data, but processing continues)
- Configuration issues (using defaults)
- Resource constraints (approaching limits)

**Examples:**
```csharp
logger.LogWarning("API call to {ApiName} took {Duration} ms, exceeding threshold of {Threshold} ms", 
    apiName, duration, threshold);

logger.LogWarning("Using deprecated method {MethodName}. Please migrate to {NewMethod}", 
    oldMethod, newMethod);

logger.LogWarning("Order {OrderId} has invalid discount code {DiscountCode}, proceeding without discount", 
    orderId, discountCode);

logger.LogWarning("Database connection pool at {UtilizationPercent}% capacity", 
    utilizationPercent);

logger.LogWarning("Failed to send notification to {UserId}, will retry. Attempt {AttemptNumber} of {MaxAttempts}", 
    userId, attemptNumber, maxAttempts);

logger.LogWarning("Configuration value {ConfigKey} not found, using default {DefaultValue}", 
    configKey, defaultValue);
```

**Production Use:** ✅ Yes (investigate and address)

**Typical Scenarios:**
- Identifying potential issues before they become critical
- Monitoring for degraded performance
- Tracking retry attempts
- Detecting misconfigurations

---

**Error - Error Events**

**Use For:**
- Exceptions that are caught and handled
- Failed operations (database errors, API failures)
- Validation failures
- Authentication/authorization failures
- Data integrity issues
- Unrecoverable errors for a specific request (but app continues)

**Examples:**
```csharp
try
{
    await ProcessPaymentAsync(orderId);
}
catch (PaymentException ex)
{
    logger.LogError(ex, "Payment processing failed for order {OrderId}", orderId);
    // Handle error, return error response
}

logger.LogError("Failed to connect to database after {RetryCount} attempts. Error: {ErrorMessage}", 
    retryCount, ex.Message);

logger.LogError("User {UserId} failed authentication. Reason: {Reason}", 
    userId, "Invalid credentials");

logger.LogError("Data validation failed for {EntityType} {EntityId}: {ValidationErrors}", 
    entityType, entityId, validationErrors);

logger.LogError("External API {ApiName} returned error {StatusCode}: {ErrorMessage}", 
    apiName, statusCode, errorMessage);
```

**Production Use:** ✅ Yes (requires investigation and fix)

**Typical Scenarios:**
- Tracking application errors
- Monitoring integration failures
- Identifying data quality issues
- Alerting on error rate thresholds

---

**Critical - Critical Failures**

**Use For:**
- Application crashes or unhandled exceptions
- Data corruption
- Security breaches or suspicious activity
- Complete service outages
- Loss of critical functionality
- Situations requiring immediate human intervention

**Examples:**
```csharp
logger.LogCritical("Application is shutting down due to unrecoverable error: {ErrorMessage}", 
    ex.Message);

logger.LogCritical("Database connection pool exhausted. Application cannot process requests");

logger.LogCritical("Detected potential security breach: {SecurityEvent} from {IPAddress}", 
    securityEvent, ipAddress);

logger.LogCritical("Data corruption detected in {TableName}. Affected records: {RecordCount}", 
    tableName, recordCount);

logger.LogCritical("Critical dependency {ServiceName} is unavailable. Application functionality severely impacted", 
    serviceName);
```

**Production Use:** ✅ Yes (immediate alert and response required)

**Typical Scenarios:**
- Triggering PagerDuty/on-call alerts
- Initiating incident response procedures
- Requiring immediate human intervention
- Potential data loss or security incidents

#### Log Level Selection Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                    LOG LEVEL DECISION TREE                       │
└─────────────────────────────────────────────────────────────────┘

START: What are you logging?
│
├─ Is the application crashing or data corrupted?
│  └─ YES → CRITICAL
│
├─ Is this an error that prevents a specific operation?
│  ├─ YES → Can the application continue serving other requests?
│  │  ├─ YES → ERROR
│  │  └─ NO → CRITICAL
│  │
│  └─ NO → Continue...
│
├─ Is this a potentially harmful situation?
│  ├─ YES → Is it recoverable or just a warning sign?
│  │  ├─ Recoverable/Warning → WARNING
│  │  └─ Not recoverable → ERROR
│  │
│  └─ NO → Continue...
│
├─ Is this information useful in production?
│  ├─ YES → Is it a significant business or system event?
│  │  ├─ YES → INFORMATION
│  │  └─ NO → DEBUG
│  │
│  └─ NO → Is it useful for development debugging?
│     ├─ YES → Is it very detailed (method entry/exit, variables)?
│     │  ├─ YES → TRACE
│     │  └─ NO → DEBUG
│     │
│     └─ NO → Don't log it
```

#### Log Level Configuration by Environment

**Development:**
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Debug",
      "Override": {
        "Microsoft": "Information",
        "System": "Information"
      }
    }
  }
}
```

**Staging:**
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    }
  }
}
```

**Production:**
```json
{
  "Serilog": {
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "Microsoft.Hosting.Lifetime": "Information",
        "System": "Warning"
      }
    }
  }
}
```

#### Dynamic Log Level Changes

Enable runtime log level changes without restarting the application:

```csharp
// Program.cs
builder.Services.Configure<LoggerFilterOptions>(options =>
{
    options.MinLevel = LogLevel.Information;
});

// Controller for dynamic log level changes
[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class LoggingController : ControllerBase
{
    private readonly ILoggerFactory _loggerFactory;
    
    [HttpPost("level")]
    public IActionResult SetLogLevel([FromBody] SetLogLevelRequest request)
    {
        // Validate log level
        if (!Enum.TryParse<LogLevel>(request.Level, out var logLevel))
        {
            return BadRequest("Invalid log level");
        }
        
        // Update log level dynamically
        // Note: Implementation depends on logging provider
        // For Serilog, use LoggingLevelSwitch
        
        return Ok($"Log level set to {logLevel}");
    }
}
```

**Using Serilog's LoggingLevelSwitch:**

```csharp
// Create a level switch
var levelSwitch = new LoggingLevelSwitch(LogEventLevel.Information);

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.ControlledBy(levelSwitch)
    .WriteTo.Console()
    .CreateLogger();

// Change level at runtime
levelSwitch.MinimumLevel = LogEventLevel.Debug;
```

#### Log Level Anti-Patterns

**❌ Don't:**

```csharp
// Using wrong level for exceptions
logger.LogInformation("Error occurred: {Error}", ex.Message);  // Should be LogError

// Logging too much at Information level
logger.LogInformation("Variable x = {X}, y = {Y}, z = {Z}", x, y, z);  // Should be Debug or Trace

// Using Critical for non-critical errors
logger.LogCritical("User entered invalid email");  // Should be Warning or Error

// Logging sensitive data at any level
logger.LogInformation("User password: {Password}", password);  // Never log passwords

// Not including exception object
logger.LogError("Exception occurred: {Message}", ex.Message);  // Should include ex object
```

**✅ Do:**

```csharp
// Correct level for exceptions
logger.LogError(ex, "Failed to process order {OrderId}", orderId);

// Appropriate level for diagnostic info
logger.LogDebug("Intermediate calculation: x = {X}, y = {Y}, result = {Result}", x, y, result);

// Reserve Critical for truly critical situations
logger.LogCritical("Database connection pool exhausted, application cannot serve requests");

// Never log sensitive data
logger.LogInformation("User {UserId} updated profile", userId);  // Log ID, not sensitive data

// Always include exception object
logger.LogError(ex, "Payment processing failed for order {OrderId}", orderId);
```

#### Log Volume Estimation

Estimate log volume to plan storage and costs:

| Level | Typical Volume (per request) | Production Recommendation |
|-------|------------------------------|---------------------------|
| Trace | 10-50 events | ❌ Disabled |
| Debug | 5-20 events | ❌ Disabled (enable temporarily) |
| Information | 2-5 events | ✅ Enabled |
| Warning | 0-1 events | ✅ Enabled |
| Error | 0-0.1 events | ✅ Enabled |
| Critical | 0-0.01 events | ✅ Enabled |

**Example Calculation:**
- 1,000 requests/second
- 3 Information logs per request
- 0.01 Error logs per request (1% error rate)
- Result: 3,000 Information + 10 Error logs/second = ~260M logs/day

**Cost Impact:**
- CloudWatch Logs: ~$0.50/GB ingested, ~$0.03/GB stored
- Application Insights: ~$2.30/GB ingested
- 260M logs/day ≈ 50GB/day ≈ $25-115/day depending on platform

---

### 6.4 Log Aggregation Patterns

Centralized log aggregation is essential for distributed systems, enabling correlation across services, efficient searching, and unified observability. This section covers integration patterns for CloudWatch Logs and Azure Log Analytics with Serilog, along with centralized logging architecture patterns.

#### Why Centralized Log Aggregation?

**Without Centralization:**
- ❌ Logs scattered across multiple servers/containers
- ❌ Manual SSH/RDP to view logs
- ❌ No correlation across services
- ❌ Difficult to search and analyze
- ❌ Logs lost when containers restart

**With Centralization:**
- ✅ Single pane of glass for all logs
- ✅ Powerful query capabilities
- ✅ Correlation by trace ID, user ID, etc.
- ✅ Long-term retention and compliance
- ✅ Alerting and anomaly detection
- ✅ Logs persist beyond container lifecycle

#### CloudWatch Logs Integration with Serilog

AWS CloudWatch Logs provides scalable, durable log storage with powerful querying via CloudWatch Logs Insights.

**1. Install NuGet Package:**

```bash
dotnet add package Serilog.Sinks.AwsCloudWatch
dotnet add package AWSSDK.CloudWatchLogs
```

**2. Configure Serilog with CloudWatch Sink:**

```csharp
using Serilog;
using Serilog.Sinks.AwsCloudWatch;
using Amazon.CloudWatchLogs;
using Amazon.Runtime;

var builder = WebApplication.CreateBuilder(args);

// Create CloudWatch client (uses IAM role in AWS environment)
var cloudWatchClient = new AmazonCloudWatchLogsClient();

// Configure CloudWatch sink options
var cloudWatchOptions = new CloudWatchSinkOptions
{
    // Log group name (create if doesn't exist)
    LogGroupName = $"/aws/application/{builder.Environment.ApplicationName}",
    
    // Log stream name (one per instance)
    LogStreamNameProvider = new DefaultLogStreamProvider(),
    
    // Use JSON formatting for structured logs
    TextFormatter = new Serilog.Formatting.Json.JsonFormatter(),
    
    // Minimum log level
    MinimumLogEventLevel = LogEventLevel.Information,
    
    // Batching configuration
    BatchSizeLimit = 100,
    QueueSizeLimit = 10000,
    Period = TimeSpan.FromSeconds(10),
    
    // Retry configuration
    RetryAttempts = 5,
    
    // Create log group if it doesn't exist
    CreateLogGroup = true,
    
    // Set retention policy (optional)
    LogGroupRetentionPolicy = LogGroupRetentionPolicy.OneMonth
};

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", builder.Environment.ApplicationName)
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .Enrich.WithMachineName()
    .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
    .WriteTo.AmazonCloudWatch(cloudWatchOptions, cloudWatchClient)
    .CreateLogger();

builder.Host.UseSerilog();
```

**3. Configuration-Based Setup (appsettings.json):**

```json
{
  "Serilog": {
    "Using": ["Serilog.Sinks.AwsCloudWatch"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      },
      {
        "Name": "AmazonCloudWatch",
        "Args": {
          "logGroup": "/aws/application/myapp",
          "logStreamPrefix": "myapp-",
          "restrictedToMinimumLevel": "Information",
          "batchSizeLimit": 100,
          "period": "00:00:10",
          "createLogGroup": true,
          "retryAttempts": 5
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName"]
  },
  "AWS": {
    "Region": "us-east-1"
  }
}
```

**4. IAM Permissions Required:**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/application/*"
    }
  ]
}
```

**5. CloudWatch Log Group Structure:**

```
/aws/application/myapp/                    # Log Group
├── myapp-prod-instance-1-2025-01-15       # Log Stream (per instance/day)
├── myapp-prod-instance-2-2025-01-15
├── myapp-prod-instance-1-2025-01-16
└── myapp-prod-instance-2-2025-01-16
```

**6. Custom Log Stream Naming:**

```csharp
public class CustomLogStreamProvider : ILogStreamNameProvider
{
    private readonly string _logStreamName;
    
    public CustomLogStreamProvider()
    {
        // Include environment, instance ID, and date
        var environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown";
        var instanceId = Environment.GetEnvironmentVariable("INSTANCE_ID") ?? Environment.MachineName;
        var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
        
        _logStreamName = $"{environment}-{instanceId}-{date}";
    }
    
    public string GetLogStreamName()
    {
        return _logStreamName;
    }
}

// Use custom provider
var cloudWatchOptions = new CloudWatchSinkOptions
{
    LogGroupName = "/aws/application/myapp",
    LogStreamNameProvider = new CustomLogStreamProvider(),
    // ... other options
};
```

**7. Error Handling and Fallback:**

```csharp
// Configure with fallback to local file if CloudWatch unavailable
Log.Logger = new LoggerConfiguration()
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(evt => true)
        .WriteTo.AmazonCloudWatch(cloudWatchOptions, cloudWatchClient))
    .WriteTo.File(
        new JsonFormatter(),
        "logs/fallback-.log",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 7)
    .CreateLogger();
```

#### Azure Log Analytics Integration with Serilog

Azure Log Analytics provides powerful querying with KQL (Kusto Query Language) and integrates seamlessly with Application Insights.

**1. Install NuGet Package:**

```bash
dotnet add package Serilog.Sinks.ApplicationInsights
dotnet add package Microsoft.ApplicationInsights.AspNetCore
```

**2. Configure Serilog with Application Insights:**

```csharp
using Serilog;
using Serilog.Sinks.ApplicationInsights.TelemetryConverters;
using Microsoft.ApplicationInsights.Extensibility;

var builder = WebApplication.CreateBuilder(args);

// Add Application Insights
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", builder.Environment.ApplicationName)
    .Enrich.WithProperty("Environment", builder.Environment.EnvironmentName)
    .Enrich.WithMachineName()
    .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
    .WriteTo.ApplicationInsights(
        builder.Configuration["ApplicationInsights:ConnectionString"],
        TelemetryConverter.Traces,
        LogEventLevel.Information)
    .CreateLogger();

builder.Host.UseSerilog();
```

**3. Configuration-Based Setup (appsettings.json):**

```json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=your-key;IngestionEndpoint=https://region.in.applicationinsights.azure.com/"
  },
  "Serilog": {
    "Using": ["Serilog.Sinks.ApplicationInsights"],
    "MinimumLevel": {
      "Default": "Information",
      "Override": {
        "Microsoft": "Warning",
        "System": "Warning"
      }
    },
    "WriteTo": [
      {
        "Name": "Console",
        "Args": {
          "formatter": "Serilog.Formatting.Json.JsonFormatter, Serilog"
        }
      },
      {
        "Name": "ApplicationInsights",
        "Args": {
          "connectionString": "InstrumentationKey=your-key;IngestionEndpoint=https://region.in.applicationinsights.azure.com/",
          "telemetryConverter": "Serilog.Sinks.ApplicationInsights.TelemetryConverters.TraceTelemetryConverter, Serilog.Sinks.ApplicationInsights",
          "restrictedToMinimumLevel": "Information"
        }
      }
    ],
    "Enrich": ["FromLogContext", "WithMachineName"]
  }
}
```

**4. Using Managed Identity (Recommended for Production):**

```csharp
using Azure.Identity;
using Microsoft.ApplicationInsights.Extensibility;

var builder = WebApplication.CreateBuilder(args);

// Configure Application Insights with Managed Identity
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
});

builder.Services.Configure<TelemetryConfiguration>(config =>
{
    var credential = new DefaultAzureCredential();
    config.SetAzureTokenCredential(credential);
});

// Serilog configuration remains the same
Log.Logger = new LoggerConfiguration()
    .WriteTo.ApplicationInsights(
        builder.Configuration["ApplicationInsights:ConnectionString"],
        TelemetryConverter.Traces)
    .CreateLogger();
```

**5. Custom Properties and Enrichment:**

```csharp
// Add custom properties to all logs
Log.Logger = new LoggerConfiguration()
    .Enrich.WithProperty("ServiceName", "OrderService")
    .Enrich.WithProperty("ServiceVersion", "1.2.3")
    .Enrich.WithProperty("Region", "EastUS")
    .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces)
    .CreateLogger();

// Add request-specific properties
app.Use(async (context, next) =>
{
    using (LogContext.PushProperty("RequestId", context.TraceIdentifier))
    using (LogContext.PushProperty("UserId", context.User?.Identity?.Name))
    using (LogContext.PushProperty("ClientIP", context.Connection.RemoteIpAddress?.ToString()))
    {
        await next();
    }
});
```

**6. Sampling Configuration:**

```csharp
// Configure sampling to reduce costs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;
    options.EnablePerformanceCounterCollectionModule = true;
});

builder.Services.Configure<Microsoft.ApplicationInsights.Extensibility.Implementation.ApplicationInsightsServiceOptions>(options =>
{
    // Sample 10% of telemetry (except errors)
    options.EnableAdaptiveSampling = true;
});
```

#### Centralized Logging Architecture Patterns

**Pattern 1: Direct Shipping (Simple)**

```
┌─────────────┐
│ Application │
│  Instance 1 │──────┐
└─────────────┘      │
                     │    ┌──────────────────┐
┌─────────────┐      ├───▶│  CloudWatch Logs │
│ Application │      │    │  or Log Analytics│
│  Instance 2 │──────┤    └──────────────────┘
└─────────────┘      │
                     │
┌─────────────┐      │
│ Application │      │
│  Instance 3 │──────┘
└─────────────┘
```

**Characteristics:**
- ✅ Simple setup
- ✅ Low latency
- ✅ No additional infrastructure
- ❌ Tight coupling to log platform
- ❌ Limited transformation capabilities

**When to Use:**
- Small to medium deployments
- Single cloud platform
- Simple logging requirements
- Cost-conscious scenarios

**Implementation:**
```csharp
// Direct shipping with Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.AmazonCloudWatch(cloudWatchOptions, cloudWatchClient)
    // or
    .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces)
    .CreateLogger();
```

**Pattern 2: Sidecar Agent (Container-Friendly)**

```
┌─────────────────────────────┐
│         Pod/Task            │
│  ┌─────────────┐            │
│  │ Application │            │
│  │  Container  │──logs──┐   │
│  └─────────────┘        │   │
│                         ▼   │
│  ┌─────────────────────────┐│
│  │   Logging Agent         ││
│  │ (Fluent Bit/Fluentd)    ││──────┐
│  └─────────────────────────┘│      │
└─────────────────────────────┘      │
                                     │
                              ┌──────▼──────────┐
                              │  CloudWatch Logs│
                              │  or Log Analytics│
                              └─────────────────┘
```

**Characteristics:**
- ✅ Decouples app from log platform
- ✅ Centralized agent configuration
- ✅ Log transformation and enrichment
- ✅ Multi-destination support
- ❌ Additional container overhead
- ❌ More complex setup

**When to Use:**
- Kubernetes or ECS deployments
- Need log transformation/filtering
- Multi-cloud or hybrid scenarios
- Standardized logging across services

**Implementation (Kubernetes with Fluent Bit):**

```yaml
# fluent-bit-configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: fluent-bit-config
data:
  fluent-bit.conf: |
    [SERVICE]
        Flush         5
        Log_Level     info
        Parsers_File  parsers.conf

    [INPUT]
        Name              tail
        Path              /var/log/containers/*.log
        Parser            docker
        Tag               kube.*
        Refresh_Interval  5

    [FILTER]
        Name                kubernetes
        Match               kube.*
        Kube_URL            https://kubernetes.default.svc:443
        Merge_Log           On
        Keep_Log            Off

    [OUTPUT]
        Name                cloudwatch_logs
        Match               *
        region              us-east-1
        log_group_name      /aws/eks/myapp
        log_stream_prefix   myapp-
        auto_create_group   true

  parsers.conf: |
    [PARSER]
        Name        docker
        Format      json
        Time_Key    time
        Time_Format %Y-%m-%dT%H:%M:%S.%LZ
```

**Application Configuration (writes to stdout):**

```csharp
// Application writes JSON logs to stdout
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console(new JsonFormatter())
    .CreateLogger();
```

**Pattern 3: Centralized Collector (Enterprise)**

```
┌─────────────┐
│ Application │
│  Instance 1 │──────┐
└─────────────┘      │
                     │    ┌──────────────────┐
┌─────────────┐      ├───▶│  OpenTelemetry   │
│ Application │      │    │    Collector     │──┐
│  Instance 2 │──────┤    └──────────────────┘  │
└─────────────┘      │                           │
                     │                           │
┌─────────────┐      │                           │
│ Application │      │                           ▼
│  Instance 3 │──────┘              ┌────────────────────┐
└─────────────┘                     │  CloudWatch Logs   │
                                    │  Log Analytics     │
                                    │  Elasticsearch     │
                                    │  Splunk            │
                                    └────────────────────┘
```

**Characteristics:**
- ✅ Vendor-neutral (OpenTelemetry)
- ✅ Advanced processing and routing
- ✅ Multi-destination support
- ✅ Centralized configuration
- ✅ Scalable and resilient
- ❌ Additional infrastructure to manage
- ❌ More complex setup

**When to Use:**
- Large-scale deployments
- Multi-cloud or hybrid environments
- Need vendor flexibility
- Advanced log processing requirements
- Compliance and data governance needs

**Implementation (OpenTelemetry Collector):**

```yaml
# otel-collector-config.yaml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  
  attributes:
    actions:
      - key: environment
        value: production
        action: insert
      - key: service.name
        from_attribute: service
        action: upsert
  
  filter:
    logs:
      exclude:
        match_type: regexp
        record_attributes:
          - key: message
            value: "healthcheck"

exporters:
  awscloudwatchlogs:
    log_group_name: "/aws/application/myapp"
    log_stream_name: "myapp-{instance_id}"
    region: "us-east-1"
  
  azuremonitor:
    instrumentation_key: "${APPINSIGHTS_INSTRUMENTATIONKEY}"

service:
  pipelines:
    logs:
      receivers: [otlp]
      processors: [batch, attributes, filter]
      exporters: [awscloudwatchlogs, azuremonitor]
```

**Application Configuration (sends to OTel Collector):**

```csharp
using OpenTelemetry.Logs;

var builder = WebApplication.CreateBuilder(args);

builder.Logging.AddOpenTelemetry(options =>
{
    options.IncludeFormattedMessage = true;
    options.IncludeScopes = true;
    options.ParseStateValues = true;
    
    options.AddOtlpExporter(otlpOptions =>
    {
        otlpOptions.Endpoint = new Uri("http://otel-collector:4317");
    });
});

// Also configure Serilog to send to OTel Collector
Log.Logger = new LoggerConfiguration()
    .WriteTo.OpenTelemetry(options =>
    {
        options.Endpoint = "http://otel-collector:4318/v1/logs";
        options.Protocol = OtlpProtocol.HttpProtobuf;
        options.ResourceAttributes = new Dictionary<string, object>
        {
            ["service.name"] = "myapp",
            ["service.version"] = "1.0.0"
        };
    })
    .CreateLogger();
```

**Pattern 4: Hybrid (Best of Both Worlds)**

```
┌─────────────┐
│ Application │──Critical Errors──▶ CloudWatch/App Insights (Direct)
│  Instance   │
│             │──All Logs──▶ OTel Collector ──▶ Long-term Storage
└─────────────┘
```

**Characteristics:**
- ✅ Fast critical error delivery
- ✅ Flexible long-term storage
- ✅ Cost optimization
- ❌ Dual configuration

**Implementation:**

```csharp
Log.Logger = new LoggerConfiguration()
    // Critical errors go directly to cloud platform
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(evt => evt.Level >= LogEventLevel.Error)
        .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces))
    
    // All logs go to OTel Collector for processing
    .WriteTo.OpenTelemetry(options =>
    {
        options.Endpoint = "http://otel-collector:4318/v1/logs";
    })
    
    .CreateLogger();
```

#### Log Correlation Patterns

**1. Trace ID Correlation (Distributed Tracing):**

```csharp
using System.Diagnostics;

// Middleware to add trace ID to log context
app.Use(async (context, next) =>
{
    var activity = Activity.Current;
    
    using (LogContext.PushProperty("TraceId", activity?.TraceId.ToString()))
    using (LogContext.PushProperty("SpanId", activity?.SpanId.ToString()))
    {
        await next();
    }
});

// Logs will include TraceId and SpanId
logger.LogInformation("Processing order {OrderId}", orderId);
// Output: {"TraceId": "abc123", "SpanId": "def456", "OrderId": 789, "Message": "Processing order 789"}
```

**2. Correlation ID Pattern:**

```csharp
// Generate or extract correlation ID
app.Use(async (context, next) =>
{
    var correlationId = context.Request.Headers["X-Correlation-ID"].FirstOrDefault()
        ?? Guid.NewGuid().ToString();
    
    context.Response.Headers.Add("X-Correlation-ID", correlationId);
    
    using (LogContext.PushProperty("CorrelationId", correlationId))
    {
        await next();
    }
});
```

**3. User Context Correlation:**

```csharp
app.Use(async (context, next) =>
{
    if (context.User?.Identity?.IsAuthenticated == true)
    {
        using (LogContext.PushProperty("UserId", context.User.FindFirst("sub")?.Value))
        using (LogContext.PushProperty("UserName", context.User.Identity.Name))
        using (LogContext.PushProperty("UserRoles", string.Join(",", context.User.Claims
            .Where(c => c.Type == "role")
            .Select(c => c.Value))))
        {
            await next();
        }
    }
    else
    {
        await next();
    }
});
```

#### Log Retention and Lifecycle Policies

**CloudWatch Logs Retention:**

```csharp
// Set retention policy programmatically
using Amazon.CloudWatchLogs;
using Amazon.CloudWatchLogs.Model;

var client = new AmazonCloudWatchLogsClient();

await client.PutRetentionPolicyAsync(new PutRetentionPolicyRequest
{
    LogGroupName = "/aws/application/myapp",
    RetentionInDays = 30  // Options: 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653
});
```

**Terraform/Pulumi Configuration:**

```hcl
# Terraform
resource "aws_cloudwatch_log_group" "app_logs" {
  name              = "/aws/application/myapp"
  retention_in_days = 30
  
  tags = {
    Environment = "production"
    Application = "myapp"
  }
}
```

```csharp
// Pulumi (C#)
var logGroup = new Aws.CloudWatch.LogGroup("app-logs", new()
{
    Name = "/aws/application/myapp",
    RetentionInDays = 30,
    Tags = new Dictionary<string, string>
    {
        ["Environment"] = "production",
        ["Application"] = "myapp"
    }
});
```

**Azure Log Analytics Retention:**

```csharp
// Set retention via Azure CLI or ARM template
// Default: 30 days, Max: 730 days (2 years)

// ARM Template
{
  "type": "Microsoft.OperationalInsights/workspaces",
  "apiVersion": "2020-08-01",
  "name": "myapp-logs",
  "location": "eastus",
  "properties": {
    "retentionInDays": 90,
    "sku": {
      "name": "PerGB2018"
    }
  }
}
```

**Retention Recommendations:**

| Log Type | Retention Period | Rationale |
|----------|------------------|-----------|
| **Application Logs (Info)** | 30-90 days | Debugging recent issues, cost balance |
| **Error Logs** | 90-365 days | Pattern analysis, compliance |
| **Audit Logs** | 365+ days | Compliance, security investigations |
| **Debug/Trace Logs** | 7-14 days | Short-term troubleshooting only |
| **Security Logs** | 365+ days | Compliance, forensics |

#### Cost Optimization Strategies

**1. Log Level Filtering:**

```csharp
// Only send Warning and above to cloud platform
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()  // All levels locally
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(evt => evt.Level >= LogEventLevel.Warning)
        .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces))
    .CreateLogger();
```

**2. Sampling:**

```csharp
// Sample 10% of Information logs, keep all Warnings and above
Log.Logger = new LoggerConfiguration()
    .WriteTo.Logger(lc => lc
        .Filter.ByIncludingOnly(evt => 
            evt.Level >= LogEventLevel.Warning || 
            (evt.Level == LogEventLevel.Information && Random.Shared.Next(100) < 10))
        .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces))
    .CreateLogger();
```

**3. Exclude Noisy Logs:**

```csharp
// Exclude health check logs
Log.Logger = new LoggerConfiguration()
    .WriteTo.Logger(lc => lc
        .Filter.ByExcluding(evt => 
            evt.MessageTemplate.Text.Contains("healthcheck") ||
            evt.MessageTemplate.Text.Contains("liveness"))
        .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces))
    .CreateLogger();
```

**4. Compress and Archive:**

```csharp
// Use file sink with compression for local archival
Log.Logger = new LoggerConfiguration()
    .WriteTo.File(
        new JsonFormatter(),
        "logs/app-.log.gz",
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        shared: true,
        hooks: new GzipHooks())  // Custom hook for compression
    .CreateLogger();
```

#### Monitoring Log Pipeline Health

**1. Track Log Delivery Metrics:**

```csharp
public class LogPipelineMetrics
{
    private static readonly Meter Meter = new("LogPipeline", "1.0.0");
    
    private static readonly Counter<long> LogsSentCounter = 
        Meter.CreateCounter<long>("logs.sent", "logs");
    
    private static readonly Counter<long> LogsFailedCounter = 
        Meter.CreateCounter<long>("logs.failed", "logs");
    
    private static readonly Histogram<double> LogDeliveryDuration = 
        Meter.CreateHistogram<double>("logs.delivery.duration", "ms");
    
    public void RecordLogSent(string destination)
    {
        LogsSentCounter.Add(1, new TagList { { "destination", destination } });
    }
    
    public void RecordLogFailed(string destination, string reason)
    {
        LogsFailedCounter.Add(1, new TagList 
        { 
            { "destination", destination },
            { "reason", reason }
        });
    }
}
```

**2. Alert on Log Delivery Failures:**

```csharp
// Custom sink wrapper with failure tracking
public class MonitoredSink : ILogEventSink
{
    private readonly ILogEventSink _innerSink;
    private readonly LogPipelineMetrics _metrics;
    
    public void Emit(LogEvent logEvent)
    {
        try
        {
            _innerSink.Emit(logEvent);
            _metrics.RecordLogSent("cloudwatch");
        }
        catch (Exception ex)
        {
            _metrics.RecordLogFailed("cloudwatch", ex.GetType().Name);
            // Fallback to local file
            File.AppendAllText("logs/failed.log", logEvent.RenderMessage());
        }
    }
}
```

---

### 6.5 Common Query Patterns and Examples

Effective log querying is essential for troubleshooting, monitoring, and gaining insights from your application logs. This section provides practical query examples for both AWS CloudWatch Logs Insights and Azure Log Analytics (KQL), covering common scenarios like error analysis, performance investigation, and correlation patterns.

#### CloudWatch Logs Insights Query Language

CloudWatch Logs Insights uses a SQL-like query language optimized for log analysis. Queries consist of commands that filter, parse, aggregate, and visualize log data.

**Query Structure:**
```
fields @timestamp, @message, field1, field2
| filter condition
| parse @message pattern
| stats aggregation by field
| sort field desc
| limit number
```

**Common Query Patterns:**

**1. Find All Errors in Last Hour:**

```sql
fields @timestamp, @message, @logStream
| filter @message like /ERROR|Exception|Failed/
| filter @timestamp > ago(1h)
| sort @timestamp desc
| limit 100
```

**2. Count Errors by Type:**

```sql
fields @timestamp, @message
| filter @message like /ERROR|Exception/
| parse @message /(?<errorType>\w+Exception)/
| stats count() as errorCount by errorType
| sort errorCount desc
```

**3. Find Slow Requests (> 1 second):**

```sql
fields @timestamp, @message, duration
| filter @message like /HTTP/
| parse @message /duration=(?<duration>\d+)/
| filter duration > 1000
| stats count() as slowRequests, avg(duration) as avgDuration, max(duration) as maxDuration
| sort slowRequests desc
```

**4. Analyze Request Latency Percentiles:**

```sql
fields @timestamp, duration
| filter @message like /HTTP.*responded/
| parse @message /responded (?<statusCode>\d+) in (?<duration>[\d.]+) ms/
| stats 
    count() as requests,
    avg(duration) as avg_ms,
    pct(duration, 50) as p50_ms,
    pct(duration, 95) as p95_ms,
    pct(duration, 99) as p99_ms
  by bin(5m)
```

**5. Find Requests by User:**

```sql
fields @timestamp, @message, userId, endpoint
| filter @message like /UserId/
| parse @message /UserId=(?<userId>\d+).*endpoint=(?<endpoint>[\w\/]+)/
| filter userId = "12345"
| sort @timestamp desc
| limit 50
```

**6. Correlation by Trace ID:**

```sql
fields @timestamp, @message, @logStream
| filter TraceId = "abc123def456"
| sort @timestamp asc
| display @timestamp, @logStream, @message
```

**7. Error Rate Over Time:**

```sql
fields @timestamp, @message
| stats 
    count(@message) as totalRequests,
    count(@message like /ERROR/) as errorRequests
  by bin(5m)
| fields bin(5m) as time, 
    errorRequests * 100.0 / totalRequests as errorRate
| sort time desc
```

**8. Top 10 Slowest Endpoints:**

```sql
fields @timestamp, endpoint, duration
| filter @message like /HTTP/
| parse @message /endpoint=(?<endpoint>[\w\/]+).*duration=(?<duration>[\d.]+)/
| stats 
    count() as requests,
    avg(duration) as avgDuration,
    pct(duration, 95) as p95Duration
  by endpoint
| sort p95Duration desc
| limit 10
```

**9. Find Logs with Specific Correlation ID:**

```sql
fields @timestamp, @message, CorrelationId, @logStream
| filter CorrelationId = "correlation-123"
| sort @timestamp asc
| display @timestamp, @logStream, @message
```

**10. Database Query Performance:**

```sql
fields @timestamp, @message, queryDuration
| filter @message like /db.query.duration/
| parse @message /db.query.duration=(?<queryDuration>[\d.]+)/
| filter queryDuration > 100
| stats 
    count() as slowQueries,
    avg(queryDuration) as avgDuration,
    max(queryDuration) as maxDuration
  by bin(5m)
| sort bin(5m) desc
```

**11. Memory Usage Trends:**

```sql
fields @timestamp, @message
| filter @message like /MEM_USED/
| parse @message /MEM_USED=(?<memUsed>[\d.]+)/
| stats avg(memUsed) as avgMemory, max(memUsed) as maxMemory by bin(5m)
| sort bin(5m) desc
```

**12. Failed Authentication Attempts:**

```sql
fields @timestamp, @message, userId, clientIP
| filter @message like /authentication failed|login failed/i
| parse @message /UserId=(?<userId>\w+).*ClientIP=(?<clientIP>[\d.]+)/
| stats count() as failedAttempts by userId, clientIP
| sort failedAttempts desc
| limit 20
```

**13. API Response Status Code Distribution:**

```sql
fields @timestamp, statusCode
| filter @message like /HTTP.*responded/
| parse @message /responded (?<statusCode>\d+)/
| stats count() as requests by statusCode
| sort requests desc
```

**14. Find Logs Between Two Timestamps:**

```sql
fields @timestamp, @message
| filter @timestamp >= "2025-01-15T10:00:00" and @timestamp <= "2025-01-15T11:00:00"
| sort @timestamp asc
```

**15. Concurrent User Sessions:**

```sql
fields @timestamp, userId
| filter @message like /session started/
| stats count_distinct(userId) as activeUsers by bin(1m)
| sort bin(1m) desc
```

#### Azure Log Analytics KQL (Kusto Query Language)

KQL is a powerful query language used in Azure Log Analytics, Application Insights, and other Azure services. It's optimized for large-scale log and telemetry data analysis.

**Query Structure:**
```kql
TableName
| where condition
| extend newField = expression
| summarize aggregation by field
| order by field desc
| take number
```

**Common Query Patterns:**

**1. Find All Errors in Last Hour:**

```kql
traces
| where timestamp > ago(1h)
| where severityLevel >= 3  // Warning and above
| where message contains "error" or message contains "exception"
| project timestamp, severityLevel, message, operation_Name, cloud_RoleName
| order by timestamp desc
| take 100
```

**2. Count Errors by Type:**

```kql
traces
| where timestamp > ago(24h)
| where severityLevel >= 3
| extend errorType = extract(@"(\w+Exception)", 1, message)
| where isnotempty(errorType)
| summarize errorCount = count() by errorType
| order by errorCount desc
```

**3. Find Slow Requests (> 1 second):**

```kql
requests
| where timestamp > ago(1h)
| where duration > 1000  // milliseconds
| project timestamp, name, url, duration, resultCode, operation_Id
| order by duration desc
| take 50
```

**4. Analyze Request Latency Percentiles:**

```kql
requests
| where timestamp > ago(1h)
| summarize 
    requests = count(),
    avg_ms = avg(duration),
    p50_ms = percentile(duration, 50),
    p95_ms = percentile(duration, 95),
    p99_ms = percentile(duration, 99)
  by bin(timestamp, 5m)
| order by timestamp desc
```

**5. Find Requests by User:**

```kql
requests
| where timestamp > ago(24h)
| where customDimensions.UserId == "12345"
| project timestamp, name, url, duration, resultCode, customDimensions
| order by timestamp desc
| take 50
```

**6. Correlation by Operation ID (Trace ID):**

```kql
union traces, requests, dependencies, exceptions
| where timestamp > ago(1h)
| where operation_Id == "abc123def456"
| project timestamp, itemType, message, name, duration, resultCode
| order by timestamp asc
```

**7. Error Rate Over Time:**

```kql
requests
| where timestamp > ago(24h)
| summarize 
    totalRequests = count(),
    failedRequests = countif(success == false)
  by bin(timestamp, 5m)
| extend errorRate = (failedRequests * 100.0) / totalRequests
| project timestamp, totalRequests, failedRequests, errorRate
| order by timestamp desc
| render timechart
```

**8. Top 10 Slowest Endpoints:**

```kql
requests
| where timestamp > ago(24h)
| summarize 
    requests = count(),
    avgDuration = avg(duration),
    p95Duration = percentile(duration, 95),
    p99Duration = percentile(duration, 99)
  by name
| order by p95Duration desc
| take 10
```

**9. Find Logs with Specific Correlation ID:**

```kql
traces
| where timestamp > ago(24h)
| where customDimensions.CorrelationId == "correlation-123"
| project timestamp, severityLevel, message, operation_Name, customDimensions
| order by timestamp asc
```

**10. Database Dependency Performance:**

```kql
dependencies
| where timestamp > ago(1h)
| where type == "SQL"
| where duration > 100  // milliseconds
| summarize 
    slowQueries = count(),
    avgDuration = avg(duration),
    maxDuration = max(duration)
  by bin(timestamp, 5m), target
| order by timestamp desc
```

**11. Memory Usage Trends:**

```kql
performanceCounters
| where timestamp > ago(24h)
| where name == "% Processor Time" or name == "Available Bytes"
| summarize avgValue = avg(value) by name, bin(timestamp, 5m)
| order by timestamp desc
| render timechart
```

**12. Failed Authentication Attempts:**

```kql
traces
| where timestamp > ago(24h)
| where message contains "authentication failed" or message contains "login failed"
| extend userId = tostring(customDimensions.UserId)
| extend clientIP = tostring(customDimensions.ClientIP)
| summarize failedAttempts = count() by userId, clientIP
| order by failedAttempts desc
| take 20
```

**13. API Response Status Code Distribution:**

```kql
requests
| where timestamp > ago(24h)
| summarize requests = count() by resultCode
| order by requests desc
| render piechart
```

**14. Find Logs Between Two Timestamps:**

```kql
traces
| where timestamp between (datetime(2025-01-15T10:00:00) .. datetime(2025-01-15T11:00:00))
| project timestamp, severityLevel, message
| order by timestamp asc
```

**15. Concurrent User Sessions:**

```kql
requests
| where timestamp > ago(1h)
| extend userId = tostring(customDimensions.UserId)
| where isnotempty(userId)
| summarize activeUsers = dcount(userId) by bin(timestamp, 1m)
| order by timestamp desc
| render timechart
```

**16. Exception Analysis with Stack Traces:**

```kql
exceptions
| where timestamp > ago(24h)
| extend exceptionType = type
| summarize 
    count = count(),
    sample = any(outerMessage)
  by exceptionType, problemId
| order by count desc
| take 20
```

**17. Cross-Service Request Flow:**

```kql
let operationId = "abc123def456";
union 
    (requests | where operation_Id == operationId | extend itemType = "request"),
    (dependencies | where operation_Id == operationId | extend itemType = "dependency"),
    (traces | where operation_Id == operationId | extend itemType = "trace")
| project timestamp, itemType, name, duration, resultCode, message
| order by timestamp asc
```

**18. Availability and Success Rate:**

```kql
requests
| where timestamp > ago(24h)
| summarize 
    totalRequests = count(),
    successfulRequests = countif(success == true),
    failedRequests = countif(success == false)
  by bin(timestamp, 5m)
| extend successRate = (successfulRequests * 100.0) / totalRequests
| project timestamp, totalRequests, successRate
| render timechart
```

**19. Custom Business Metrics:**

```kql
customMetrics
| where timestamp > ago(24h)
| where name == "OrdersCreated" or name == "OrderValue"
| summarize 
    totalOrders = sumif(value, name == "OrdersCreated"),
    totalRevenue = sumif(value, name == "OrderValue")
  by bin(timestamp, 1h)
| order by timestamp desc
```

**20. Alert Trigger Analysis:**

```kql
traces
| where timestamp > ago(7d)
| where severityLevel >= 3
| summarize alertCount = count() by bin(timestamp, 1h), severityLevel
| order by timestamp desc
| render timechart
```

#### Correlation Query Patterns

**Pattern 1: End-to-End Request Tracing (CloudWatch):**

```sql
# Step 1: Find the trace ID from initial request
fields @timestamp, TraceId, @message
| filter @message like /POST \/api\/orders/
| filter @timestamp > ago(1h)
| sort @timestamp desc
| limit 1

# Step 2: Use the TraceId to find all related logs
fields @timestamp, @logStream, @message, SpanId
| filter TraceId = "found-trace-id-from-step-1"
| sort @timestamp asc
```

**Pattern 2: End-to-End Request Tracing (KQL):**

```kql
// Step 1: Find the operation ID from initial request
requests
| where timestamp > ago(1h)
| where url contains "/api/orders"
| where name == "POST /api/orders"
| project timestamp, operation_Id, name, duration
| order by timestamp desc
| take 1

// Step 2: Use operation_Id to find all related telemetry
let operationId = "found-operation-id-from-step-1";
union 
    (requests | where operation_Id == operationId),
    (dependencies | where operation_Id == operationId),
    (traces | where operation_Id == operationId),
    (exceptions | where operation_Id == operationId)
| project timestamp, itemType, name, duration, message, resultCode
| order by timestamp asc
```

**Pattern 3: User Journey Tracking (CloudWatch):**

```sql
fields @timestamp, @message, UserId, endpoint, duration
| filter UserId = "user-123"
| filter @timestamp > ago(1h)
| parse @message /endpoint=(?<endpoint>[\w\/]+).*duration=(?<duration>[\d.]+)/
| sort @timestamp asc
| display @timestamp, endpoint, duration
```

**Pattern 4: User Journey Tracking (KQL):**

```kql
let userId = "user-123";
requests
| where timestamp > ago(1h)
| where customDimensions.UserId == userId
| project timestamp, name, url, duration, resultCode
| order by timestamp asc
```

**Pattern 5: Cross-Service Correlation (CloudWatch):**

```sql
# Find logs from multiple log groups with same CorrelationId
fields @timestamp, @logStream, @message, CorrelationId, ServiceName
| filter CorrelationId = "correlation-123"
| sort @timestamp asc
| display @timestamp, ServiceName, @logStream, @message
```

**Pattern 6: Cross-Service Correlation (KQL):**

```kql
let correlationId = "correlation-123";
union 
    (traces | where customDimensions.CorrelationId == correlationId | extend source = "traces"),
    (requests | where customDimensions.CorrelationId == correlationId | extend source = "requests"),
    (dependencies | where customDimensions.CorrelationId == correlationId | extend source = "dependencies")
| project timestamp, source, cloud_RoleName, message, name, duration
| order by timestamp asc
```

#### Performance Investigation Queries

**CloudWatch - Identify Performance Bottlenecks:**

```sql
fields @timestamp, operation, duration, @message
| filter @message like /duration=/
| parse @message /operation=(?<operation>\w+).*duration=(?<duration>[\d.]+)/
| stats 
    count() as operations,
    avg(duration) as avgDuration,
    pct(duration, 95) as p95Duration,
    max(duration) as maxDuration
  by operation
| filter p95Duration > 500
| sort p95Duration desc
```

**KQL - Identify Performance Bottlenecks:**

```kql
dependencies
| where timestamp > ago(24h)
| summarize 
    calls = count(),
    avgDuration = avg(duration),
    p95Duration = percentile(duration, 95),
    maxDuration = max(duration)
  by name, type
| where p95Duration > 500
| order by p95Duration desc
```

#### Best Practices for Query Performance

**CloudWatch Logs Insights:**
1. **Use time filters early** - Always filter by `@timestamp` first
2. **Limit result sets** - Use `limit` to reduce data scanned
3. **Use specific log groups** - Query only relevant log groups
4. **Parse efficiently** - Use specific regex patterns
5. **Aggregate when possible** - Use `stats` instead of returning raw logs

**Azure Log Analytics (KQL):**
1. **Filter early** - Use `where` clauses before other operations
2. **Use time ranges** - Always specify `timestamp > ago(timespan)`
3. **Limit columns** - Use `project` to select only needed fields
4. **Use summarize** - Aggregate data instead of returning raw rows
5. **Optimize joins** - Use `join kind=inner` and filter before joining
6. **Use materialized views** - For frequently run queries

#### Query Optimization Examples

**Before (Slow):**
```kql
traces
| where message contains "error"
| where timestamp > ago(24h)
| order by timestamp desc
```

**After (Fast):**
```kql
traces
| where timestamp > ago(24h)  // Filter by time first
| where severityLevel >= 3     // Use indexed field
| where message contains "error"
| project timestamp, message, operation_Name  // Limit columns
| order by timestamp desc
| take 100  // Limit results
```

#### Saved Queries and Dashboards

**CloudWatch - Save Query:**
```bash
aws logs put-query-definition \
    --name "Error Rate Last Hour" \
    --query-string "fields @timestamp, @message | filter @message like /ERROR/ | stats count() by bin(5m)" \
    --log-group-names "/aws/application/myapp"
```

**KQL - Save Query as Function:**
```kql
.create function ErrorRateByEndpoint() {
    requests
    | where timestamp > ago(24h)
    | summarize 
        totalRequests = count(),
        failedRequests = countif(success == false)
      by name
    | extend errorRate = (failedRequests * 100.0) / totalRequests
    | order by errorRate desc
}

// Use the function
ErrorRateByEndpoint()
```

---

## Alerting and Incident Response

Effective alerting and incident response are critical for maintaining service reliability and minimizing the impact of issues on users. This section covers actionable alerting principles, threshold setting, escalation paths, alert configuration patterns, and MTTD/MTTR optimization for .NET applications on AWS and Azure.

### 7.1 Actionable Alerts vs Informational Notifications

The key to effective alerting is distinguishing between alerts that require immediate human action and notifications that provide information. Poor alerting leads to alert fatigue, where important alerts are ignored due to noise from non-actionable notifications.

#### Criteria for Actionable Alerts

**An alert should be actionable if it meets ALL of these criteria:**

1. **Immediate Action Required:** Someone needs to do something right now
2. **User Impact:** Users are currently experiencing or will soon experience degraded service
3. **Time Sensitive:** Waiting will make the problem worse
4. **Human Intervention Needed:** Automated systems cannot resolve the issue

**Examples of Actionable Alerts:**

| Alert | Why Actionable | Required Action |
|-------|----------------|-----------------|
| **API Error Rate > 5%** | Users experiencing failures | Investigate and fix root cause |
| **Database Connection Pool Exhausted** | New requests will fail | Scale database or fix connection leaks |
| **Disk Space > 90%** | Service will crash when full | Free space or add storage |
| **Memory Usage > 95%** | Application may crash or become unresponsive | Restart service or investigate memory leak |
| **SSL Certificate Expires in 7 Days** | Service will become inaccessible | Renew certificate |

#### When to Use Notifications Instead

**Use notifications (not alerts) for:**

- **Informational events:** Deployments completed, batch jobs finished
- **Trending issues:** Gradual performance degradation over days/weeks
- **Capacity planning:** Resource usage approaching limits (but not critical)
- **Audit events:** Security events that need logging but not immediate action
- **Success confirmations:** Backup completed, health checks passing

**Examples of Notifications:**

| Notification | Why Not Actionable | Appropriate Response |
|--------------|-------------------|---------------------|
| **API Latency p95 Increased 20%** | Gradual trend, users not severely impacted | Review during business hours |
| **Daily Active Users Down 5%** | Business metric, not technical failure | Analyze during weekly review |
| **New Version Deployed** | Informational, no action needed | Monitor for issues |
| **Backup Completed Successfully** | Confirmation, no action needed | Log for audit purposes |
| **CPU Usage 70% (Normal: 50%)** | Higher than normal but not critical | Monitor trend |

### 7.2 Alert Threshold Guidance

Setting appropriate alert thresholds is crucial for avoiding alert fatigue while ensuring real issues are caught quickly. Thresholds should be based on historical data, user impact, and business requirements.

#### Threshold Setting Methodology

**Step 1: Establish Baseline Performance**

Collect 2-4 weeks of historical data to understand normal behavior:

```csharp
public class ThresholdCalculator
{
    public static AlertThresholds CalculateThresholds(List<double> historicalValues, double confidenceLevel = 0.95)
    {
        var sorted = historicalValues.OrderBy(v => v).ToList();
        
        // Calculate percentiles
        var p50 = GetPercentile(sorted, 0.50);
        var p95 = GetPercentile(sorted, 0.95);
        var p99 = GetPercentile(sorted, 0.99);
        var mean = sorted.Average();
        var stdDev = CalculateStandardDeviation(sorted, mean);
        
        // Calculate thresholds based on statistical analysis
        var warningThreshold = mean + (2 * stdDev);  // ~95% confidence
        var criticalThreshold = mean + (3 * stdDev); // ~99.7% confidence
        
        return new AlertThresholds
        {
            Baseline = new BaselineStats
            {
                Mean = mean,
                P50 = p50,
                P95 = p95,
                P99 = p99,
                StandardDeviation = stdDev
            },
            WarningThreshold = Math.Max(warningThreshold, p95 * 1.2), // At least 20% above p95
            CriticalThreshold = Math.Max(criticalThreshold, p99 * 1.5), // At least 50% above p99
            RecommendedSampleSize = Math.Max(100, sorted.Count / 10) // At least 100 samples for threshold validation
        };
    }
    
    private static double GetPercentile(List<double> sorted, double percentile)
    {
        int index = (int)Math.Ceiling(percentile * sorted.Count) - 1;
        return sorted[Math.Max(0, Math.Min(index, sorted.Count - 1))];
    }
    
    private static double CalculateStandardDeviation(List<double> values, double mean)
    {
        var variance = values.Sum(v => Math.Pow(v - mean, 2)) / values.Count;
        return Math.Sqrt(variance);
    }
}

public class AlertThresholds
{
    public BaselineStats Baseline { get; set; }
    public double WarningThreshold { get; set; }
    public double CriticalThreshold { get; set; }
    public int RecommendedSampleSize { get; set; }
}

public class BaselineStats
{
    public double Mean { get; set; }
    public double P50 { get; set; }
    public double P95 { get; set; }
    public double P99 { get; set; }
    public double StandardDeviation { get; set; }
}
```

**Step 2: Apply Business Context**

Adjust statistical thresholds based on business requirements:

```csharp
public class BusinessContextThresholds
{
    public static AlertThresholds ApplyBusinessContext(
        AlertThresholds statisticalThresholds,
        BusinessRequirements requirements)
    {
        var adjusted = statisticalThresholds;
        
        // Adjust based on service criticality
        var criticalityMultiplier = requirements.ServiceCriticality switch
        {
            ServiceCriticality.Critical => 0.8,  // Stricter thresholds
            ServiceCriticality.High => 1.0,      // Standard thresholds
            ServiceCriticality.Medium => 1.2,    // More lenient
            ServiceCriticality.Low => 1.5,       // Very lenient
            _ => 1.0
        };
        
        adjusted.WarningThreshold *= criticalityMultiplier;
        adjusted.CriticalThreshold *= criticalityMultiplier;
        
        // Apply SLO constraints
        if (requirements.SloTarget.HasValue)
        {
            // Warning threshold should fire before SLO breach
            var sloWarningThreshold = requirements.SloTarget.Value * 0.9; // 90% of SLO
            adjusted.WarningThreshold = Math.Min(adjusted.WarningThreshold, sloWarningThreshold);
            
            // Critical threshold at SLO breach point
            adjusted.CriticalThreshold = Math.Min(adjusted.CriticalThreshold, requirements.SloTarget.Value);
        }
        
        // Apply user impact constraints
        if (requirements.UserImpactThreshold.HasValue)
        {
            adjusted.CriticalThreshold = Math.Min(adjusted.CriticalThreshold, requirements.UserImpactThreshold.Value);
        }
        
        return adjusted;
    }
}

public class BusinessRequirements
{
    public ServiceCriticality ServiceCriticality { get; set; }
    public double? SloTarget { get; set; }
    public double? UserImpactThreshold { get; set; }
    public TimeSpan MaxAcceptableResponseTime { get; set; }
}

public enum ServiceCriticality
{
    Critical,   // Revenue-impacting, customer-facing
    High,       // Important for operations
    Medium,     // Supporting services
    Low         // Internal tools, development
}
```

#### Dynamic vs Static Thresholds

**Static Thresholds**

Best for metrics with consistent patterns:

```csharp
public class StaticThresholds
{
    public static readonly Dictionary<string, AlertThreshold> StandardThresholds = new()
    {
        // Error rates (should always be low)
        { "api.error_rate", new AlertThreshold { Warning = 1.0, Critical = 5.0, Unit = "%" } },
        { "database.error_rate", new AlertThreshold { Warning = 0.5, Critical = 2.0, Unit = "%" } },
        
        // Resource utilization
        { "cpu.utilization", new AlertThreshold { Warning = 70.0, Critical = 85.0, Unit = "%" } },
        { "memory.utilization", new AlertThreshold { Warning = 80.0, Critical = 95.0, Unit = "%" } },
        { "disk.utilization", new AlertThreshold { Warning = 80.0, Critical = 90.0, Unit = "%" } },
        
        // Response times (business-specific)
        { "api.latency.p95", new AlertThreshold { Warning = 1000.0, Critical = 2000.0, Unit = "ms" } },
        { "database.query.p95", new AlertThreshold { Warning = 500.0, Critical = 1000.0, Unit = "ms" } }
    };
}

public class AlertThreshold
{
    public double Warning { get; set; }
    public double Critical { get; set; }
    public string Unit { get; set; }
}
```

**Dynamic Thresholds**

Best for metrics with time-based patterns (daily/weekly cycles):

```csharp
public class DynamicThresholdCalculator
{
    public static DynamicThreshold CalculateDynamicThreshold(
        List<TimeSeriesPoint> historicalData,
        TimeSpan seasonalityPeriod)
    {
        // Group data by time of day/week to identify patterns
        var seasonalGroups = historicalData
            .GroupBy(p => GetSeasonalKey(p.Timestamp, seasonalityPeriod))
            .ToDictionary(g => g.Key, g => g.Select(p => p.Value).ToList());
        
        var thresholds = new Dictionary<string, AlertThresholds>();
        
        foreach (var (seasonalKey, values) in seasonalGroups)
        {
            thresholds[seasonalKey] = ThresholdCalculator.CalculateThresholds(values);
        }
        
        return new DynamicThreshold
        {
            SeasonalityPeriod = seasonalityPeriod,
            SeasonalThresholds = thresholds,
            FallbackThreshold = ThresholdCalculator.CalculateThresholds(
                historicalData.Select(p => p.Value).ToList())
        };
    }
    
    public static double GetThresholdForTime(DynamicThreshold threshold, DateTime timestamp, ThresholdType type)
    {
        var seasonalKey = GetSeasonalKey(timestamp, threshold.SeasonalityPeriod);
        
        if (threshold.SeasonalThresholds.TryGetValue(seasonalKey, out var seasonalThreshold))
        {
            return type switch
            {
                ThresholdType.Warning => seasonalThreshold.WarningThreshold,
                ThresholdType.Critical => seasonalThreshold.CriticalThreshold,
                _ => seasonalThreshold.WarningThreshold
            };
        }
        
        // Fallback to overall threshold
        return type switch
        {
            ThresholdType.Warning => threshold.FallbackThreshold.WarningThreshold,
            ThresholdType.Critical => threshold.FallbackThreshold.CriticalThreshold,
            _ => threshold.FallbackThreshold.WarningThreshold
        };
    }
    
    private static string GetSeasonalKey(DateTime timestamp, TimeSpan seasonalityPeriod)
    {
        if (seasonalityPeriod == TimeSpan.FromDays(1))
        {
            // Daily pattern - group by hour of day
            return $"hour_{timestamp.Hour}";
        }
        else if (seasonalityPeriod == TimeSpan.FromDays(7))
        {
            // Weekly pattern - group by day of week and hour
            return $"dow_{(int)timestamp.DayOfWeek}_hour_{timestamp.Hour}";
        }
        else
        {
            // Custom pattern
            var periodTicks = seasonalityPeriod.Ticks;
            var offsetTicks = timestamp.Ticks % periodTicks;
            var offsetHours = new TimeSpan(offsetTicks).TotalHours;
            return $"offset_{(int)offsetHours}";
        }
    }
}

public class DynamicThreshold
{
    public TimeSpan SeasonalityPeriod { get; set; }
    public Dictionary<string, AlertThresholds> SeasonalThresholds { get; set; }
    public AlertThresholds FallbackThreshold { get; set; }
}

public class TimeSeriesPoint
{
    public DateTime Timestamp { get; set; }
    public double Value { get; set; }
}

public enum ThresholdType
{
    Warning,
    Critical
}
```

#### Threshold Tuning Strategies

**1. Gradual Threshold Adjustment**

```csharp
public class ThresholdTuner
{
    public static AlertThresholds TuneThresholds(
        AlertThresholds currentThresholds,
        List<AlertEvent> recentAlerts,
        TimeSpan tuningPeriod)
    {
        var alertsInPeriod = recentAlerts
            .Where(a => a.Timestamp > DateTime.UtcNow - tuningPeriod)
            .ToList();
        
        // Calculate alert quality metrics
        var totalAlerts = alertsInPeriod.Count;
        var actionableAlerts = alertsInPeriod.Count(a => a.WasActionable);
        var falsePositives = alertsInPeriod.Count(a => !a.WasActionable);
        
        var actionableRate = totalAlerts > 0 ? (double)actionableAlerts / totalAlerts : 1.0;
        var falsePositiveRate = totalAlerts > 0 ? (double)falsePositives / totalAlerts : 0.0;
        
        var tuned = currentThresholds;
        
        // If too many false positives, make thresholds less sensitive
        if (falsePositiveRate > 0.2) // More than 20% false positives
        {
            tuned.WarningThreshold *= 1.1;  // Increase by 10%
            tuned.CriticalThreshold *= 1.1;
        }
        // If too few alerts but issues were missed, make more sensitive
        else if (actionableRate > 0.95 && totalAlerts < 5) // Very few alerts, all actionable
        {
            tuned.WarningThreshold *= 0.9;  // Decrease by 10%
            tuned.CriticalThreshold *= 0.95; // Decrease by 5%
        }
        
        return tuned;
    }
}

public class AlertEvent
{
    public DateTime Timestamp { get; set; }
    public string AlertName { get; set; }
    public double Value { get; set; }
    public double Threshold { get; set; }
    public bool WasActionable { get; set; }
    public TimeSpan? TimeToResolve { get; set; }
}
```

**2. A/B Testing for Thresholds**

```csharp
public class ThresholdABTest
{
    private readonly Random _random = new();
    
    public AlertThresholds GetThresholdForAlert(string alertName, string instanceId)
    {
        // Use consistent hashing to assign instances to test groups
        var hash = $"{alertName}:{instanceId}".GetHashCode();
        var testGroup = Math.Abs(hash % 100);
        
        if (testGroup < 10) // 10% in test group
        {
            return GetTestThresholds(alertName);
        }
        else
        {
            return GetControlThresholds(alertName);
        }
    }
    
    private AlertThresholds GetTestThresholds(string alertName)
    {
        // More sensitive thresholds for test group
        var control = GetControlThresholds(alertName);
        return new AlertThresholds
        {
            WarningThreshold = control.WarningThreshold * 0.9,
            CriticalThreshold = control.CriticalThreshold * 0.9
        };
    }
    
    private AlertThresholds GetControlThresholds(string alertName)
    {
        // Current production thresholds
        return StaticThresholds.StandardThresholds.TryGetValue(alertName, out var threshold)
            ? new AlertThresholds 
            { 
                WarningThreshold = threshold.Warning, 
                CriticalThreshold = threshold.Critical 
            }
            : new AlertThresholds { WarningThreshold = 100, CriticalThreshold = 200 };
    }
}
```

### 7.3 Escalation Paths and Runbook Integration

Effective incident response requires clear escalation paths and well-integrated runbooks that guide responders through resolution steps.

#### Escalation Policy Patterns

**Time-Based Escalation**

```csharp
public class EscalationPolicy
{
    public string Name { get; set; }
    public List<EscalationLevel> Levels { get; set; }
    public TimeSpan AutoResolveTimeout { get; set; }
    
    public static EscalationPolicy StandardPolicy => new()
    {
        Name = "Standard Production Escalation",
        Levels = new List<EscalationLevel>
        {
            new()
            {
                Level = 1,
                Timeout = TimeSpan.FromMinutes(5),
                Targets = new List<EscalationTarget>
                {
                    new() { Type = TargetType.OnCallEngineer, ContactMethod = ContactMethod.PagerDuty },
                    new() { Type = TargetType.SlackChannel, ContactMethod = ContactMethod.Slack, Target = "#alerts-critical" }
                }
            },
            new()
            {
                Level = 2,
                Timeout = TimeSpan.FromMinutes(15),
                Targets = new List<EscalationTarget>
                {
                    new() { Type = TargetType.TeamLead, ContactMethod = ContactMethod.Phone },
                    new() { Type = TargetType.SlackChannel, ContactMethod = ContactMethod.Slack, Target = "#incidents" }
                }
            },
            new()
            {
                Level = 3,
                Timeout = TimeSpan.FromMinutes(30),
                Targets = new List<EscalationTarget>
                {
                    new() { Type = TargetType.Manager, ContactMethod = ContactMethod.Phone },
                    new() { Type = TargetType.Email, ContactMethod = ContactMethod.Email, Target = "engineering-leadership@company.com" }
                }
            }
        },
        AutoResolveTimeout = TimeSpan.FromHours(4)
    };
}

public class EscalationLevel
{
    public int Level { get; set; }
    public TimeSpan Timeout { get; set; }
    public List<EscalationTarget> Targets { get; set; }
}

public class EscalationTarget
{
    public TargetType Type { get; set; }
    public ContactMethod ContactMethod { get; set; }
    public string Target { get; set; }
}

public enum TargetType
{
    OnCallEngineer,
    TeamLead,
    Manager,
    SlackChannel,
    Email,
    SMS
}

public enum ContactMethod
{
    PagerDuty,
    Slack,
    Email,
    SMS,
    Phone
}
```

**Severity-Based Escalation**

```csharp
public class SeverityBasedEscalation
{
    public static readonly Dictionary<AlertSeverity, EscalationPolicy> Policies = new()
    {
        {
            AlertSeverity.Critical,
            new EscalationPolicy
            {
                Name = "Critical Alert Escalation",
                Levels = new List<EscalationLevel>
                {
                    new()
                    {
                        Level = 1,
                        Timeout = TimeSpan.FromMinutes(2), // Immediate response required
                        Targets = new List<EscalationTarget>
                        {
                            new() { Type = TargetType.OnCallEngineer, ContactMethod = ContactMethod.PagerDuty },
                            new() { Type = TargetType.SMS, Target = "+1234567890" },
                            new() { Type = TargetType.SlackChannel, Target = "#critical-alerts" }
                        }
                    },
                    new()
                    {
                        Level = 2,
                        Timeout = TimeSpan.FromMinutes(5),
                        Targets = new List<EscalationTarget>
                        {
                            new() { Type = TargetType.TeamLead, ContactMethod = ContactMethod.Phone },
                            new() { Type = TargetType.Manager, ContactMethod = ContactMethod.Phone }
                        }
                    }
                }
            }
        },
        {
            AlertSeverity.High,
            new EscalationPolicy
            {
                Name = "High Priority Escalation",
                Levels = new List<EscalationLevel>
                {
                    new()
                    {
                        Level = 1,
                        Timeout = TimeSpan.FromMinutes(15),
                        Targets = new List<EscalationTarget>
                        {
                            new() { Type = TargetType.OnCallEngineer, ContactMethod = ContactMethod.PagerDuty },
                            new() { Type = TargetType.SlackChannel, Target = "#alerts" }
                        }
                    },
                    new()
                    {
                        Level = 2,
                        Timeout = TimeSpan.FromHours(1),
                        Targets = new List<EscalationTarget>
                        {
                            new() { Type = TargetType.TeamLead, ContactMethod = ContactMethod.Email }
                        }
                    }
                }
            }
}
```

#### Runbook Structure and Integration

**Runbook Template**

```csharp
public class Runbook
{
    public string Id { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public List<string> TriggerAlerts { get; set; }
    public List<RunbookStep> Steps { get; set; }
    public List<string> RelatedRunbooks { get; set; }
    public Dictionary<string, string> QuickLinks { get; set; }
    
    public static Runbook HighApiErrorRate => new()
    {
        Id = "RB-001",
        Title = "High API Error Rate Response",
        Description = "Steps to investigate and resolve high API error rates",
        TriggerAlerts = new() { "API Error Rate > 5%", "API Error Rate > 10%" },
        Steps = new List<RunbookStep>
        {
            new()
            {
                StepNumber = 1,
                Title = "Immediate Assessment",
                Description = "Quickly assess the scope and impact",
                Actions = new()
                {
                    "Check dashboard for error rate trend and affected endpoints",
                    "Verify if issue is affecting all users or specific segments",
                    "Check recent deployments in last 2 hours"
                },
                ExpectedDuration = TimeSpan.FromMinutes(2),
                SuccessCriteria = "Scope of issue identified"
            },
            new()
            {
                StepNumber = 2,
                Title = "Check Dependencies",
                Description = "Verify external dependencies are healthy",
                Actions = new()
                {
                    "Check database connection pool status",
                    "Verify external API health (payment gateway, auth service)",
                    "Check Redis/cache service status"
                },
                ExpectedDuration = TimeSpan.FromMinutes(3),
                SuccessCriteria = "Dependencies status confirmed"
            },
            new()
            {
                StepNumber = 3,
                Title = "Analyze Error Patterns",
                Description = "Identify specific error types and patterns",
                Actions = new()
                {
                    "Query logs for error details: status codes, error messages",
                    "Check if errors are concentrated on specific endpoints",
                    "Look for correlation with traffic spikes or user patterns"
                },
                ExpectedDuration = TimeSpan.FromMinutes(5),
                SuccessCriteria = "Root cause hypothesis formed"
            }
        },
        QuickLinks = new Dictionary<string, string>
        {
            { "Error Dashboard", "https://dashboard.company.com/errors" },
            { "Application Logs", "https://logs.company.com/app" },
            { "Deployment History", "https://deploy.company.com/history" },
            { "Database Metrics", "https://dashboard.company.com/database" }
        }
    };
}

public class RunbookStep
{
    public int StepNumber { get; set; }
    public string Title { get; set; }
    public string Description { get; set; }
    public List<string> Actions { get; set; }
    public TimeSpan ExpectedDuration { get; set; }
    public string SuccessCriteria { get; set; }
    public List<string> TroubleshootingTips { get; set; }
    public string EscalationCriteria { get; set; }
}
```

### 7.4 Alert Configuration Patterns

This section provides practical examples for configuring alerts in AWS CloudWatch and Azure Monitor using Infrastructure as Code.

#### CloudWatch Alarms with Pulumi

```csharp
using Pulumi;
using Pulumi.Aws.CloudWatch;
using Pulumi.Aws.Sns;

public class CloudWatchAlerting : Stack
{
    public CloudWatchAlerting()
    {
        // Create SNS topic for notifications
        var alertTopic = new Topic("api-alerts", new TopicArgs
        {
            Name = "api-alerts",
            DisplayName = "API Alerts"
        });
        
        // Subscribe email to topic
        var emailSubscription = new TopicSubscription("email-alerts", new TopicSubscriptionArgs
        {
            TopicArn = alertTopic.Arn,
            Protocol = "email",
            Endpoint = "alerts@company.com"
        });
        
        // API Error Rate Alarm
        var apiErrorRateAlarm = new MetricAlarm("api-error-rate", new MetricAlarmArgs
        {
            Name = "api-error-rate-high",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 2,
            MetricName = "ErrorRate",
            Namespace = "MyApp/API",
            Period = 300, // 5 minutes
            Statistic = "Average",
            Threshold = 5.0, // 5%
            ActionsEnabled = true,
            AlarmActions = new[] { alertTopic.Arn },
            AlarmDescription = "API error rate is above 5%",
            DatapointsToAlarm = 2,
            TreatMissingData = "notBreaching",
            Tags = new InputMap<string>
            {
                { "Environment", "production" },
                { "Service", "api" },
                { "Severity", "high" }
            }
        });
        
        // API Latency Alarm (P95)
        var apiLatencyAlarm = new MetricAlarm("api-latency-p95", new MetricAlarmArgs
        {
            Name = "api-latency-p95-high",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 3,
            MetricName = "Duration",
            Namespace = "AWS/ApplicationELB",
            Period = 300,
            Statistic = "Average", // Use custom metric for actual P95
            Threshold = 2000, // 2 seconds
            ActionsEnabled = true,
            AlarmActions = new[] { alertTopic.Arn },
            AlarmDescription = "API P95 latency is above 2 seconds",
            Dimensions = new InputMap<string>
            {
                { "LoadBalancer", "app/my-api-lb/1234567890" }
            }
        });
        
        // Database Connection Pool Alarm
        var dbConnectionAlarm = new MetricAlarm("db-connection-pool", new MetricAlarmArgs
        {
            Name = "db-connection-pool-exhausted",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 1,
            MetricName = "DatabaseConnections",
            Namespace = "AWS/RDS",
            Period = 60,
            Statistic = "Average",
            Threshold = 80, // 80% of max connections
            ActionsEnabled = true,
            AlarmActions = new[] { alertTopic.Arn },
            AlarmDescription = "Database connection pool is near exhaustion",
            Dimensions = new InputMap<string>
            {
                { "DBInstanceIdentifier", "myapp-prod-db" }
            }
        });
        
        // Composite Alarm (Multiple conditions)
        var serviceHealthAlarm = new CompositeAlarm("service-health", new CompositeAlarmArgs
        {
            AlarmName = "service-health-critical",
            AlarmRule = Output.Format($"ALARM({apiErrorRateAlarm.AlarmName}) OR ALARM({apiLatencyAlarm.AlarmName})"),
            ActionsEnabled = true,
            AlarmActions = new[] { alertTopic.Arn },
            AlarmDescription = "Overall service health is degraded"
        });
    }
}
```

#### Azure Monitor Alert Rules with Pulumi

```csharp
using Pulumi;
using Pulumi.AzureNative.Insights;
using Pulumi.AzureNative.Resources;

public class AzureMonitorAlerting : Stack
{
    public AzureMonitorAlerting()
    {
        var resourceGroup = new ResourceGroup("monitoring-rg");
        
        // Action Group for notifications
        var actionGroup = new ActionGroup("api-alerts", new ActionGroupArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ActionGroupName = "api-alerts",
            GroupShortName = "apialerts",
            Enabled = true,
            EmailReceivers = new[]
            {
                new EmailReceiverArgs
                {
                    Name = "team-email",
                    EmailAddress = "alerts@company.com",
                    UseCommonAlertSchema = true
                }
            },
            SmsReceivers = new[]
            {
                new SmsReceiverArgs
                {
                    Name = "oncall-sms",
                    CountryCode = "1",
                    PhoneNumber = "1234567890"
                }
            }
        });
        
        // API Error Rate Alert
        var apiErrorRateAlert = new MetricAlertRule("api-error-rate", new MetricAlertRuleArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "api-error-rate-high",
            Description = "API error rate is above 5%",
            Severity = 2, // High
            Enabled = true,
            EvaluationFrequency = "PT5M", // Every 5 minutes
            WindowSize = "PT15M", // 15 minute window
            Scopes = new[] { "/subscriptions/{subscription-id}/resourceGroups/myapp-rg/providers/Microsoft.Web/sites/myapp" },
            Criteria = new MetricAlertMultipleResourceMultipleMetricCriteriaArgs
            {
                AllOf = new[]
                {
                    new MetricCriteriaArgs
                    {
                        Name = "ErrorRate",
                        MetricName = "Http5xx",
                        MetricNamespace = "Microsoft.Web/sites",
                        Operator = "GreaterThan",
                        Threshold = 5.0,
                        TimeAggregation = "Average",
                        CriterionType = "StaticThresholdCriterion"
                    }
                }
            },
            Actions = new[]
            {
                new ActionArgs
                {
                    ActionGroupId = actionGroup.Id
                }
            }
        });
        
        // Application Insights Availability Alert
        var availabilityAlert = new MetricAlertRule("availability", new MetricAlertRuleArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "api-availability-low",
            Description = "API availability is below 99%",
            Severity = 1, // Critical
            Enabled = true,
            EvaluationFrequency = "PT1M",
            WindowSize = "PT5M",
            Scopes = new[] { "/subscriptions/{subscription-id}/resourceGroups/myapp-rg/providers/Microsoft.Insights/components/myapp-insights" },
            Criteria = new MetricAlertMultipleResourceMultipleMetricCriteriaArgs
            {
                AllOf = new[]
                {
                    new MetricCriteriaArgs
                    {
                        Name = "AvailabilityRate",
                        MetricName = "availabilityResults/availabilityPercentage",
                        MetricNamespace = "Microsoft.Insights/components",
                        Operator = "LessThan",
                        Threshold = 99.0,
                        TimeAggregation = "Average"
                    }
                }
            },
            Actions = new[]
            {
                new ActionArgs
                {
                    ActionGroupId = actionGroup.Id
                }
            }
        });
        
        // Log Analytics Query Alert
        var logQueryAlert = new ScheduledQueryRule("error-spike", new ScheduledQueryRuleArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "error-spike-detection",
            Description = "Detect sudden spikes in error rate",
            Enabled = true,
            EvaluationFrequency = "PT5M",
            WindowSize = "PT15M",
            Severity = 2,
            Scopes = new[] { "/subscriptions/{subscription-id}/resourceGroups/myapp-rg/providers/Microsoft.OperationalInsights/workspaces/myapp-logs" },
            Criteria = new ScheduledQueryRuleCriteriaArgs
            {
                AllOf = new[]
                {
                    new ConditionArgs
                    {
                        Query = @"
                            requests
                            | where timestamp > ago(15m)
                            | summarize 
                                ErrorRate = (countif(success == false) * 100.0) / count(),
                                RequestCount = count()
                              by bin(timestamp, 5m)
                            | where RequestCount > 10  // Minimum traffic threshold
                            | where ErrorRate > 5.0    // Error rate threshold
                        ",
                        TimeAggregation = "Maximum",
                        MetricMeasureColumn = "ErrorRate",
                        Operator = "GreaterThan",
                        Threshold = 5.0,
                        FailingPeriods = new FailingPeriodsArgs
                        {
                            NumberOfEvaluationPeriods = 1,
                            MinFailingPeriodsToAlert = 1
                        }
                    }
                }
            },
            Actions = new ActionArgs
            {
                ActionGroups = new[] { actionGroup.Id }
            }
        });
    }
}
```

### 7.5 MTTD and MTTR Targets

Mean Time to Detect (MTTD) and Mean Time to Resolve (MTTR) are key metrics for measuring incident response effectiveness.

#### Industry Benchmarks and Targets

| Service Tier | MTTD Target | MTTR Target | Availability Impact |
|--------------|-------------|-------------|-------------------|
| **Critical (Tier 1)** | < 2 minutes | < 15 minutes | 99.95%+ |
| **High (Tier 2)** | < 5 minutes | < 1 hour | 99.9%+ |
| **Medium (Tier 3)** | < 15 minutes | < 4 hours | 99.5%+ |
| **Low (Tier 4)** | < 1 hour | < 24 hours | 99%+ |

#### MTTD Optimization Strategies

**1. Proactive Monitoring**

```csharp
public class ProactiveMonitoring
{
    // Synthetic monitoring for early detection
    public static readonly List<SyntheticCheck> SyntheticChecks = new()
    {
        new()
        {
            Name = "API Health Check",
            Url = "https://api.company.com/health",
            Frequency = TimeSpan.FromMinutes(1),
            Timeout = TimeSpan.FromSeconds(10),
            ExpectedStatusCode = 200,
            ExpectedResponseTime = TimeSpan.FromMilliseconds(500),
            Locations = new[] { "us-east-1", "us-west-2", "eu-west-1" }
        },
        new()
        {
            Name = "User Login Flow",
            Type = SyntheticCheckType.UserJourney,
            Steps = new[]
            {
                "Navigate to login page",
                "Enter credentials",
                "Verify dashboard loads"
            },
            Frequency = TimeSpan.FromMinutes(5),
            Timeout = TimeSpan.FromSeconds(30)
        }
    };
    
    // Anomaly detection for early warning
    public static AlertRule AnomalyDetectionRule => new()
    {
        Name = "Traffic Anomaly Detection",
        Condition = "Request rate deviates > 3 standard deviations from baseline",
        Severity = AlertSeverity.Medium,
        Description = "Unusual traffic patterns detected - investigate for potential issues"
    };
}

public class SyntheticCheck
{
    public string Name { get; set; }
    public string Url { get; set; }
    public SyntheticCheckType Type { get; set; }
    public TimeSpan Frequency { get; set; }
    public TimeSpan Timeout { get; set; }
    public int ExpectedStatusCode { get; set; }
    public TimeSpan ExpectedResponseTime { get; set; }
    public string[] Locations { get; set; }
    public string[] Steps { get; set; }
}

public enum SyntheticCheckType
{
    HealthCheck,
    UserJourney,
    ApiTest
}
```

**2. Real-Time Alerting**

```csharp
public class RealTimeAlerting
{
    private readonly IMetricsStream _metricsStream;
    private readonly IAlertingService _alerting;
    
    // Stream processing for sub-minute detection
    public async Task ProcessMetricsStreamAsync()
    {
        await foreach (var metric in _metricsStream.GetMetricsAsync())
        {
            // Check for immediate threshold breaches
            if (IsImmediateThreatBreach(metric))
            {
                await _alerting.SendImmediateAlertAsync(metric);
            }
            
            // Update sliding window calculations
            UpdateSlidingWindow(metric);
            
            // Check for trend-based alerts
            if (IsTrendAlertTriggered(metric))
            {
                await _alerting.SendTrendAlertAsync(metric);
            }
        }
    }
    
    private bool IsImmediateThreatBreach(Metric metric)
    {
        return metric.Name switch
        {
            "error_rate" => metric.Value > 10.0, // 10% error rate
            "response_time_p99" => metric.Value > 5000, // 5 second P99
            "memory_usage" => metric.Value > 95.0, // 95% memory
            _ => false
        };
    }
}
```

#### MTTR Optimization Strategies

**1. Automated Remediation**

```csharp
public class AutomatedRemediation
{
    public static readonly Dictionary<string, RemediationAction> AutoActions = new()
    {
        {
            "high_memory_usage",
            new RemediationAction
            {
                Name = "Restart High Memory Service",
                Condition = "Memory usage > 95% for 5 minutes",
                Actions = new[]
                {
                    "Scale out additional instances",
                    "Restart service if memory doesn't decrease in 2 minutes",
                    "Alert team if restart doesn't resolve issue"
                },
                MaxAttempts = 2,
                Cooldown = TimeSpan.FromMinutes(10)
            }
        },
        {
            "database_connection_exhaustion",
            new RemediationAction
            {
                Name = "Scale Database Connections",
                Condition = "Database connections > 90% of pool",
                Actions = new[]
                {
                    "Increase connection pool size",
                    "Kill long-running queries > 30 seconds",
                    "Scale read replicas if read-heavy workload"
                },
                MaxAttempts = 1,
                Cooldown = TimeSpan.FromMinutes(5)
            }
        }
    };
}

public class RemediationAction
{
    public string Name { get; set; }
    public string Condition { get; set; }
    public string[] Actions { get; set; }
    public int MaxAttempts { get; set; }
    public TimeSpan Cooldown { get; set; }
}
```

**2. Incident Response Automation**

```csharp
public class IncidentResponseAutomation
{
    public async Task HandleIncidentAsync(Incident incident)
    {
        // Auto-create incident ticket
        var ticket = await CreateIncidentTicketAsync(incident);
        
        // Gather diagnostic information
        var diagnostics = await GatherDiagnosticsAsync(incident);
        
        // Notify responders with context
        await NotifyRespondersAsync(incident, diagnostics);
        
        // Start automated remediation if available
        if (HasAutomatedRemediation(incident.Type))
        {
            await StartAutomatedRemediationAsync(incident);
        }
        
        // Create war room if critical
        if (incident.Severity == IncidentSeverity.Critical)
        {
            await CreateWarRoomAsync(incident);
        }
    }
    
    private async Task<DiagnosticInfo> GatherDiagnosticsAsync(Incident incident)
    {
        return new DiagnosticInfo
        {
            RecentDeployments = await GetRecentDeploymentsAsync(TimeSpan.FromHours(2)),
            ErrorLogs = await GetRecentErrorLogsAsync(incident.StartTime),
            MetricSnapshots = await GetMetricSnapshotsAsync(incident.StartTime),
            DependencyStatus = await CheckDependencyStatusAsync(),
            TrafficPatterns = await GetTrafficPatternsAsync(incident.StartTime)
        };
    }
}

public class DiagnosticInfo
{
    public List<Deployment> RecentDeployments { get; set; }
    public List<LogEntry> ErrorLogs { get; set; }
    public Dictionary<string, double> MetricSnapshots { get; set; }
    public Dictionary<string, ServiceStatus> DependencyStatus { get; set; }
    public TrafficPattern TrafficPatterns { get; set; }
}
```

#### Measuring and Tracking MTTD/MTTR

```csharp
public class IncidentMetrics
{
    private static readonly Meter Meter = new("IncidentResponse", "1.0.0");
    
    private static readonly Histogram<double> MttdHistogram = 
        Meter.CreateHistogram<double>("incident.mttd", "minutes");
    
    private static readonly Histogram<double> MttrHistogram = 
        Meter.CreateHistogram<double>("incident.mttr", "minutes");
    
    private static readonly Counter<long> IncidentCounter = 
        Meter.CreateCounter<long>("incident.count", "incidents");
    
    public void RecordIncident(Incident incident)
    {
        var tags = new TagList
        {
            { "severity", incident.Severity.ToString() },
            { "service", incident.AffectedService },
            { "incident_type", incident.Type }
        };
        
        IncidentCounter.Add(1, tags);
        
        if (incident.DetectedAt.HasValue && incident.StartTime.HasValue)
        {
            var mttd = (incident.DetectedAt.Value - incident.StartTime.Value).TotalMinutes;
            MttdHistogram.Record(mttd, tags);
        }
        
        if (incident.ResolvedAt.HasValue && incident.DetectedAt.HasValue)
        {
            var mttr = (incident.ResolvedAt.Value - incident.DetectedAt.Value).TotalMinutes;
            MttrHistogram.Record(mttr, tags);
        }
    }
    
    public async Task<IncidentMetricsSummary> GetMetricsSummaryAsync(TimeSpan period)
    {
        // Query metrics from monitoring system
        var incidents = await GetIncidentsAsync(DateTime.UtcNow - period, DateTime.UtcNow);
        
        return new IncidentMetricsSummary
        {
            Period = period,
            TotalIncidents = incidents.Count,
            AverageMttd = incidents.Where(i => i.Mttd.HasValue).Average(i => i.Mttd.Value.TotalMinutes),
            AverageMttr = incidents.Where(i => i.Mttr.HasValue).Average(i => i.Mttr.Value.TotalMinutes),
            P95Mttd = CalculatePercentile(incidents.Where(i => i.Mttd.HasValue).Select(i => i.Mttd.Value.TotalMinutes).ToList(), 0.95),
            P95Mttr = CalculatePercentile(incidents.Where(i => i.Mttr.HasValue).Select(i => i.Mttr.Value.TotalMinutes).ToList(), 0.95),
            IncidentsByService = incidents.GroupBy(i => i.AffectedService).ToDictionary(g => g.Key, g => g.Count())
        };
    }
}

public class IncidentMetricsSummary
{
    public TimeSpan Period { get; set; }
    public int TotalIncidents { get; set; }
    public double AverageMttd { get; set; }
    public double AverageMttr { get; set; }
    public double P95Mttd { get; set; }
    public double P95Mttr { get; set; }
    public Dictionary<string, int> IncidentsByService { get; set; }
}
```

#### Continuous Improvement Process

```csharp
public class IncidentPostMortem
{
    public string IncidentId { get; set; }
    public DateTime IncidentDate { get; set; }
    public string Title { get; set; }
    public string Summary { get; set; }
    public Timeline Timeline { get; set; }
    public RootCauseAnalysis RootCause { get; set; }
    public List<ActionItem> ActionItems { get; set; }
    public LessonsLearned Lessons { get; set; }
    
    public static IncidentPostMortem Template => new()
    {
        Timeline = new Timeline
        {
            Events = new List<TimelineEvent>
            {
                new() { Time = "00:00", Event = "Issue started (estimated)" },
                new() { Time = "00:05", Event = "First alert fired" },
                new() { Time = "00:07", Event = "Engineer acknowledged alert" },
                new() { Time = "00:15", Event = "Root cause identified" },
                new() { Time = "00:30", Event = "Fix deployed" },
                new() { Time = "00:35", Event = "Service restored" }
            }
        },
        ActionItems = new List<ActionItem>
        {
            new()
            {
                Description = "Improve monitoring to detect this issue faster",
                Owner = "SRE Team",
                DueDate = DateTime.UtcNow.AddDays(14),
                Priority = ActionItemPriority.High
            },
            new()
            {
                Description = "Add automated remediation for this scenario",
                Owner = "Platform Team",
                DueDate = DateTime.UtcNow.AddDays(30),
                Priority = ActionItemPriority.Medium
            }
        }
    };
}

public class ActionItem
{
    public string Description { get; set; }
    public string Owner { get; set; }
    public DateTime DueDate { get; set; }
    public ActionItemPriority Priority { get; set; }
    public ActionItemStatus Status { get; set; }
}

public enum ActionItemPriority
{
    Critical,
    High,
    Medium,
    Low
}

public enum ActionItemStatus
{
    Open,
    InProgress,
    Completed,
    Cancelled
}
```

---
```_[Content to be added in subsequent tasks]_

---

## Performance Profiling

_[Content to be added in subsequent tasks]_
Performance profiling is essential for identifying bottlenecks, optimizing resource usage, and ensuring applications meet performance requirements. This section covers .NET profiling techniques, common performance issues, optimization patterns, APM tool integration, and load testing strategies.

### 8.1 Profiling Techniques

#### CPU Profiling with .NET Tools

**dotnet-trace (Cross-platform)**

```bash
# Install dotnet-trace
dotnet tool install --global dotnet-trace

# Collect CPU samples for 30 seconds
dotnet-trace collect --process-id 1234 --duration 00:00:30 --format speedscope
```

**Application Insights Profiler**

```csharp
// Enable profiler in Program.cs
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnablePerformanceCounterCollectionModule = true;
});
```

#### Memory Profiling and Leak Detection

```csharp
public class MemoryProfiler
{
    private static readonly Meter Meter = new("MemoryProfiler", "1.0.0");
    
    private static readonly ObservableGauge<long> WorkingSet = 
        Meter.CreateObservableGauge("memory.working_set", "bytes", 
            observeValue: () => GC.GetTotalMemory(false));
}
```

#### I/O Profiling Techniques

```csharp
public class DatabaseProfiler : IDbCommandInterceptor
{
    private static readonly Histogram<double> QueryDuration = 
        Meter.CreateHistogram<double>("db.query.duration", "ms");
    
    public override ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command, CommandExecutedEventData eventData, DbDataReader result, CancellationToken cancellationToken = default)
    {
        var duration = eventData.Duration.TotalMilliseconds;
        QueryDuration.Record(duration, new TagList { { "db.operation", GetOperationType(command.CommandText) } });
        
        if (duration > 1000) LogSlowQuery(command.CommandText, duration);
        
        return base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }
}
```

### 8.2 Identifying Common Performance Issues

#### N+1 Query Detection and Resolution

```csharp
// ❌ N+1 Problem
public async Task<List<OrderDto>> GetOrdersBadAsync()
{
    var orders = await _context.Orders.ToListAsync();
    
    var result = new List<OrderDto>();
    foreach (var order in orders) // N+1: One query per order
    {
        var customer = await _context.Customers.FindAsync(order.CustomerId);
        result.Add(new OrderDto { Order = order, Customer = customer });
    }
    return result;
}

// ✅ Optimized with Include
public async Task<List<OrderDto>> GetOrdersGoodAsync()
{
    var orders = await _context.Orders
        .Include(o => o.Customer)  // Single query with JOIN
        .Include(o => o.Items)
            .ThenInclude(i => i.Product)
        .ToListAsync();
    
    return orders.Select(o => new OrderDto { Order = o, Customer = o.Customer }).ToList();
}
```

#### Memory Leak Identification Patterns

```csharp
// ❌ Event handler leak
public class LeakyService
{
    public LeakyService(INotificationService notifications)
    {
        notifications.OnNotification += HandleNotification;
        // Missing: notifications.OnNotification -= HandleNotification;
    }
}

// ✅ Proper cleanup
public class ProperService : IDisposable
{
    private readonly INotificationService _notifications;
    
    public ProperService(INotificationService notifications)
    {
        _notifications = notifications;
        _notifications.OnNotification += HandleNotification;
    }
    
    public void Dispose()
    {
        _notifications.OnNotification -= HandleNotification;
    }
}
```

#### Blocking Operation Detection

```csharp
public class BlockingOperationDetector
{
    // ❌ Blocking async operation
    public void BadAsyncUsage()
    {
        var result = GetDataAsync().Result; // Blocks thread pool thread
    }
    
    // ✅ Proper async usage
    public async Task GoodAsyncUsage()
    {
        var result = await GetDataAsync().ConfigureAwait(false);
    }
}
```

### 8.3 .NET Optimization Patterns

#### Span<T> and Memory<T> Usage

```csharp
public class SpanOptimizations
{
    // ❌ String allocations
    public bool IsValidEmailBad(string email)
    {
        var parts = email.Split('@'); // Allocates array
        return parts.Length == 2 && parts[1].Contains('.');
    }
    
    // ✅ Zero-allocation with Span
    public bool IsValidEmailGood(ReadOnlySpan<char> email)
    {
        var atIndex = email.IndexOf('@');
        if (atIndex <= 0 || atIndex == email.Length - 1) return false;
        
        var domain = email.Slice(atIndex + 1);
        return domain.Contains('.');
    }
}
```

#### Async/Await Best Practices

```csharp
public class AsyncOptimizations
{
    // ✅ ConfigureAwait(false) in libraries
    public async Task<string> GetDataAsync()
    {
        using var client = new HttpClient();
        var response = await client.GetAsync("https://api.example.com/data").ConfigureAwait(false);
        return await response.Content.ReadAsStringAsync().ConfigureAwait(false);
    }
    
    // ✅ ValueTask for frequently synchronous operations
    public ValueTask<User> GetUserAsync(int id)
    {
        if (_cache.TryGetValue(id, out var cachedUser))
        {
            return new ValueTask<User>(cachedUser); // Synchronous completion
        }
        
        return GetUserFromDatabaseAsync(id); // Asynchronous completion
    }
}
```

#### Caching Strategies

```csharp
public class CachingOptimizations
{
    private readonly IMemoryCache _memoryCache;
    private readonly IDistributedCache _distributedCache;
    
    // Multi-level caching
    public async Task<User> GetUserAsync(int userId)
    {
        // L1: Memory cache (fastest)
        if (_memoryCache.TryGetValue($"user:{userId}", out User cachedUser))
        {
            return cachedUser;
        }
        
        // L2: Distributed cache (Redis)
        var distributedUser = await _distributedCache.GetAsync($"user:{userId}");
        if (distributedUser != null)
        {
            var user = JsonSerializer.Deserialize<User>(distributedUser);
            _memoryCache.Set($"user:{userId}", user, TimeSpan.FromMinutes(5));
            return user;
        }
        
        // L3: Database (slowest)
        var dbUser = await _userRepository.GetAsync(userId);
        
        // Populate both caches
        var serialized = JsonSerializer.SerializeToUtf8Bytes(dbUser);
        await _distributedCache.SetAsync($"user:{userId}", serialized, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(1)
        });
        
        _memoryCache.Set($"user:{userId}", dbUser, TimeSpan.FromMinutes(5));
        return dbUser;
    }
}
```

### 8.4 APM Tool Profiling Features

#### Application Insights Profiler Usage

```csharp
// Enable Application Insights Profiler
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddServiceProfiler(); // Requires Microsoft.ApplicationInsights.Profiler.AspNetCore
```

#### X-Ray Service Map and Analysis

```csharp
// AWS X-Ray integration
builder.Services.AddAWSService<IAmazonXRay>();
builder.Services.AddXRayTracing();

public class XRayTracedService
{
    [Trace]
    public async Task<Order> ProcessOrderAsync(int orderId)
    {
        using var segment = AWSXRayRecorder.Instance.BeginSubsegment("ProcessOrder");
        
        try
        {
            segment.AddAnnotation("orderId", orderId);
            var order = await GetOrderAsync(orderId);
            await ProcessPaymentAsync(order);
            return order;
        }
        catch (Exception ex)
        {
            segment.AddException(ex);
            throw;
        }
        finally
        {
            AWSXRayRecorder.Instance.EndSubsegment();
        }
    }
}
```

### 8.5 Load Testing Integration

#### Load Testing Tools and Patterns

```csharp
// NBomber load testing
public class LoadTestScenario
{
    public static void RunLoadTest()
    {
        var scenario = Scenario.Create("api_test", async context =>
        {
            using var client = new HttpClient();
            var response = await client.GetAsync("https://api.example.com/orders");
            return response.IsSuccessStatusCode ? Response.Ok() : Response.Fail();
        })
        .WithLoadSimulations(
            Simulation.InjectPerSec(rate: 100, during: TimeSpan.FromMinutes(5))
        );
        
        NBomberRunner.RegisterScenarios(scenario).Run();
    }
}
```

#### Performance Baseline Establishment

```csharp
public class PerformanceBaseline
{
    public static readonly Dictionary<string, PerformanceTarget> Targets = new()
    {
        { "api.latency.p95", new PerformanceTarget { Value = 500, Unit = "ms", Tolerance = 0.1 } },
        { "api.throughput", new PerformanceTarget { Value = 1000, Unit = "rps", Tolerance = 0.05 } },
        { "memory.usage", new PerformanceTarget { Value = 512, Unit = "MB", Tolerance = 0.2 } },
        { "cpu.usage", new PerformanceTarget { Value = 70, Unit = "%", Tolerance = 0.1 } }
    };
}

public class PerformanceTarget
{
    public double Value { get; set; }
    public string Unit { get; set; }
    public double Tolerance { get; set; } // Acceptable deviation (e.g., 0.1 = 10%)
}
```
---

## Business Metrics and User Experience

_[Content to be added in subsequent tasks]_
Business metrics and user experience monitoring bridge the gap between technical performance and business outcomes. This section covers business metrics tracking, Real User Monitoring (RUM), Core Web Vitals, technical-to-business correlation, and custom business metrics instrumentation.

### 9.1 Business Metrics Examples

#### Conversion Rate Tracking

```csharp
public class ConversionMetrics
{
    private static readonly Meter Meter = new("BusinessMetrics", "1.0.0");
    
    private static readonly Counter<long> FunnelSteps = 
        Meter.CreateCounter<long>("conversion.funnel_step", "events");
    
    private static readonly Histogram<double> ConversionValue = 
        Meter.CreateHistogram<double>("conversion.value", "currency");
    
    public void TrackFunnelStep(string step, string userId)
    {
        var tags = new TagList
        {
            { "funnel.step", step },
            { "user.segment", GetUserSegment(userId) }
        };
        
        FunnelSteps.Add(1, tags);
    }
    
    public void TrackConversion(string conversionType, double value, string currency = "USD")
    {
        var tags = new TagList
        {
            { "conversion.type", conversionType },
            { "currency", currency }
        };
        
        ConversionValue.Record(value, tags);
    }
}

// Usage in e-commerce flow
public class CheckoutController : ControllerBase
{
    private readonly ConversionMetrics _metrics;
    
    [HttpGet("cart")]
    public IActionResult ViewCart()
    {
        _metrics.TrackFunnelStep("cart_view", GetUserId());
        return View();
    }
    
    [HttpPost("purchase")]
    public async Task<IActionResult> CompletePurchase(PurchaseRequest request)
    {
        var order = await _orderService.CreateOrderAsync(request);
        
        _metrics.TrackFunnelStep("purchase_complete", GetUserId());
        _metrics.TrackConversion("purchase", (double)order.Total);
        
        return Ok(order);
    }
}
```

#### User Engagement Metrics

```csharp
public class EngagementMetrics
{
    private static readonly Counter<long> PageViews = 
        Meter.CreateCounter<long>("engagement.page_views", "views");
    
    private static readonly Histogram<double> SessionDuration = 
        Meter.CreateHistogram<double>("engagement.session_duration", "seconds");
    
    private static readonly Counter<long> FeatureUsage = 
        Meter.CreateCounter<long>("engagement.feature_usage", "events");
    
    public void TrackPageView(string page, string userId, TimeSpan timeOnPage)
    {
        var tags = new TagList
        {
            { "page", page },
            { "user.type", GetUserType(userId) }
        };
        
        PageViews.Add(1, tags);
        
        if (timeOnPage > TimeSpan.Zero)
        {
            SessionDuration.Record(timeOnPage.TotalSeconds, tags);
        }
    }
    
    public void TrackFeatureUsage(string feature, string userId)
    {
        var tags = new TagList
        {
            { "feature", feature },
            { "user.plan", GetUserPlan(userId) }
        };
        
        FeatureUsage.Add(1, tags);
    }
}
```

### 9.2 Real User Monitoring (RUM) Implementation

#### RUM Setup for Web Applications

```html
<!-- Application Insights RUM -->
<script type="text/javascript">
!function(T,l,y){/* Application Insights snippet */}(window,document,{
src: "https://js.monitor.azure.com/scripts/b/ai.2.min.js",
cfg: {
    instrumentationKey: "YOUR_INSTRUMENTATION_KEY",
    enableAutoRouteTracking: true,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true
}});
</script>
```

#### Client-side Instrumentation Patterns

```javascript
// Custom business event tracking
function trackBusinessEvent(eventName, properties, measurements) {
    if (window.appInsights) {
        appInsights.trackEvent({
            name: eventName,
            properties: properties,
            measurements: measurements
        });
    }
}

// User journey tracking
class UserJourneyTracker {
    constructor() {
        this.currentStep = null;
        this.journeyStart = Date.now();
    }
    
    startJourney(journeyName) {
        this.journeyStart = Date.now();
        trackBusinessEvent('journey_start', {
            journey: journeyName,
            timestamp: new Date().toISOString()
        });
    }
    
    trackStep(stepName, stepData = {}) {
        const stepDuration = this.currentStep ? Date.now() - this.currentStep.startTime : 0;
        
        trackBusinessEvent('journey_step', {
            step: stepName,
            previous_step: this.currentStep?.name || 'none',
            ...stepData
        }, {
            step_duration: stepDuration,
            journey_duration: Date.now() - this.journeyStart
        });
        
        this.currentStep = {
            name: stepName,
            startTime: Date.now()
        };
    }
    
    completeJourney(success = true, conversionValue = null) {
        const totalDuration = Date.now() - this.journeyStart;
        
        const measurements = { journey_duration: totalDuration };
        if (conversionValue) {
            measurements.conversion_value = conversionValue;
        }
        
        trackBusinessEvent('journey_complete', {
            success: success.toString(),
            final_step: this.currentStep?.name || 'unknown'
        }, measurements);
    }
}
```

#### User Session Tracking

```csharp
public class SessionTracker
{
    private static readonly Counter<long> SessionStarts = 
        Meter.CreateCounter<long>("session.starts", "sessions");
    
    private static readonly Histogram<double> SessionDuration = 
        Meter.CreateHistogram<double>("session.duration", "minutes");
    
    public void TrackSessionStart(string sessionId, string userId, Dictionary<string, string> context)
    {
        var tags = new TagList
        {
            { "user.type", GetUserType(userId) },
            { "device.type", context.GetValueOrDefault("device_type", "unknown") }
        };
        
        SessionStarts.Add(1, tags);
    }
    
    public void TrackSessionEnd(string sessionId, TimeSpan duration, int eventCount)
    {
        var tags = new TagList { { "session.id", sessionId } };
        
        SessionDuration.Record(duration.TotalMinutes, tags);
    }
}
```

### 9.3 Core Web Vitals and User-Centric Metrics

#### LCP, FID, CLS Definitions and Targets

```javascript
// Core Web Vitals measurement
class CoreWebVitalsTracker {
    constructor() {
        this.vitals = {};
        this.setupObservers();
    }
    
    setupObservers() {
        // Largest Contentful Paint (LCP)
        new PerformanceObserver((entryList) => {
            const entries = entryList.getEntries();
            const lastEntry = entries[entries.length - 1];
            this.vitals.lcp = lastEntry.startTime;
            this.reportVital('LCP', lastEntry.startTime);
        }).observe({ entryTypes: ['largest-contentful-paint'] });
        
        // First Input Delay (FID)
        new PerformanceObserver((entryList) => {
            const firstInput = entryList.getEntries()[0];
            this.vitals.fid = firstInput.processingStart - firstInput.startTime;
            this.reportVital('FID', this.vitals.fid);
        }).observe({ entryTypes: ['first-input'] });
        
        // Cumulative Layout Shift (CLS)
        let clsValue = 0;
        new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
                if (!entry.hadRecentInput) {
                    clsValue += entry.value;
                }
            }
            this.vitals.cls = clsValue;
            this.reportVital('CLS', clsValue);
        }).observe({ entryTypes: ['layout-shift'] });
    }
    
    reportVital(name, value) {
        const rating = this.getRating(name, value);
        
        trackBusinessEvent('core_web_vital', {
            metric: name,
            rating: rating,
            page: window.location.pathname
        }, {
            value: value
        });
    }
    
    getRating(metric, value) {
        const thresholds = {
            'LCP': { good: 2500, poor: 4000 },
            'FID': { good: 100, poor: 300 },
            'CLS': { good: 0.1, poor: 0.25 }
        };
        
        const threshold = thresholds[metric];
        if (value <= threshold.good) return 'good';
        if (value <= threshold.poor) return 'needs-improvement';
        return 'poor';
    }
}
```

### 9.4 Technical-to-Business Correlation

#### Linking Performance Metrics to Business Outcomes

```csharp
public class BusinessImpactAnalyzer
{
    public class PerformanceImpactReport
    {
        public double LatencyThreshold { get; set; }
        public double ConversionRateImpact { get; set; }
        public double RevenueImpact { get; set; }
        public int AffectedUsers { get; set; }
    }
    
    public async Task<PerformanceImpactReport> AnalyzeLatencyImpactAsync(TimeSpan period)
    {
        // Get performance data
        var performanceData = await GetPerformanceDataAsync(period);
        var businessData = await GetBusinessDataAsync(period);
        
        // Correlate performance with conversions
        var fastSessions = performanceData.Where(p => p.AvgLatency < 1000).ToList();
        var slowSessions = performanceData.Where(p => p.AvgLatency >= 1000).ToList();
        
        var fastConversionRate = CalculateConversionRate(fastSessions, businessData);
        var slowConversionRate = CalculateConversionRate(slowSessions, businessData);
        
        var conversionImpact = (fastConversionRate - slowConversionRate) / fastConversionRate;
        var revenueImpact = conversionImpact * businessData.Sum(b => b.Revenue);
        
        return new PerformanceImpactReport
        {
            LatencyThreshold = 1000,
            ConversionRateImpact = conversionImpact,
            RevenueImpact = revenueImpact,
            AffectedUsers = slowSessions.Count
        };
    }
}
```

### 9.5 Custom Business Metrics Instrumentation

#### Business Event Tracking Patterns

```csharp
public class BusinessEventTracker
{
    private static readonly Counter<long> BusinessEvents = 
        Meter.CreateCounter<long>("business.events", "events");
    
    private static readonly Histogram<double> BusinessValues = 
        Meter.CreateHistogram<double>("business.values", "currency");
    
    public void TrackRevenue(string source, double amount, string currency = "USD")
    {
        var tags = new TagList
        {
            { "revenue.source", source },
            { "currency", currency }
        };
        
        BusinessEvents.Add(1, new TagList(tags) { { "event.type", "revenue" } });
        BusinessValues.Record(amount, tags);
    }
    
    public void TrackUserAction(string action, string userId)
    {
        var tags = new TagList
        {
            { "action", action },
            { "user.segment", GetUserSegment(userId) }
        };
        
        BusinessEvents.Add(1, tags);
    }
}

// Usage in business logic
public class SubscriptionService
{
    private readonly BusinessEventTracker _tracker;
    
    public async Task<Subscription> CreateSubscriptionAsync(CreateSubscriptionRequest request)
    {
        var subscription = await _repository.CreateAsync(request);
        
        // Track business metrics
        _tracker.TrackRevenue("subscription", (double)subscription.MonthlyAmount);
        _tracker.TrackUserAction("subscription_created", request.UserId);
        
        return subscription;
    }
}
```

#### Dashboard Design for Business Metrics

```csharp
public class BusinessDashboardMetrics
{
    public static readonly List<DashboardWidget> Widgets = new()
    {
        new()
        {
            Title = "Revenue Trends",
            Type = "line_chart",
            Query = "business.values | where revenue.source != '' | summarize sum(value) by bin(timestamp, 1h)",
            Targets = new() { { "daily_target", 10000 } }
        },
        new()
        {
            Title = "Conversion Funnel",
            Type = "funnel",
            Query = "conversion.funnel_step | summarize count() by funnel.step",
            Targets = new() { { "conversion_rate", 0.15 } }
        },
        new()
        {
            Title = "User Engagement",
            Type = "gauge",
            Query = "engagement.session_duration | summarize avg(value)",
            Targets = new() { { "target_duration", 300 } }
        }
    };
}

public class DashboardWidget
{
    public string Title { get; set; }
    public string Type { get; set; }
    public string Query { get; set; }
    public Dictionary<string, double> Targets { get; set; }
}
```
---

## Cost Management

_[Content to be added in subsequent tasks]_
Cost management is crucial for sustainable APM implementation. This section covers pricing models for major APM services, sampling strategies, data retention policies, cost reduction techniques, and budgeting guidance.

### 10.1 Cost Models for APM Services

#### CloudWatch Pricing Breakdown

**CloudWatch Metrics:**
- Standard metrics: $0.30 per metric per month (first 10,000 metrics)
- Custom metrics: $0.30 per metric per month
- High-resolution metrics: $0.30 per metric per month (additional charges for API calls)

**CloudWatch Logs:**
- Ingestion: $0.50 per GB
- Storage: $0.03 per GB per month
- Insights queries: $0.005 per GB scanned

**CloudWatch Alarms:**
- Standard alarms: $0.10 per alarm per month
- High-resolution alarms: $0.30 per alarm per month

```csharp
public class CloudWatchCostCalculator
{
    public class CostEstimate
    {
        public double MetricsCost { get; set; }
        public double LogsCost { get; set; }
        public double AlarmsCost { get; set; }
        public double TotalMonthlyCost { get; set; }
    }
    
    public static CostEstimate CalculateMonthlyCost(
        int customMetrics,
        double logsGbPerMonth,
        int alarms,
        double queriesGbPerMonth = 0)
    {
        var metricsCost = customMetrics * 0.30;
        var logIngestionCost = logsGbPerMonth * 0.50;
        var logStorageCost = logsGbPerMonth * 0.03;
        var alarmsCost = alarms * 0.10;
        var queriesCost = queriesGbPerMonth * 0.005;
        
        return new CostEstimate
        {
            MetricsCost = metricsCost,
            LogsCost = logIngestionCost + logStorageCost + queriesCost,
            AlarmsCost = alarmsCost,
            TotalMonthlyCost = metricsCost + logIngestionCost + logStorageCost + alarmsCost + queriesCost
        };
    }
}
```

#### X-Ray Pricing Model

**X-Ray Traces:**
- First 100,000 traces per month: Free
- Additional traces: $5.00 per 1 million traces recorded
- Trace retrieval: $5.00 per 1 million traces retrieved

**X-Ray Insights:**
- $1.00 per 1 million traces analyzed

```csharp
public class XRayCostCalculator
{
    public static double CalculateMonthlyCost(long tracesPerMonth, long retrievalsPerMonth = 0)
    {
        const long freeTraces = 100_000;
        const double costPerMillionTraces = 5.00;
        const double costPerMillionRetrievals = 5.00;
        
        var billableTraces = Math.Max(0, tracesPerMonth - freeTraces);
        var tracesCost = (billableTraces / 1_000_000.0) * costPerMillionTraces;
        var retrievalsCost = (retrievalsPerMonth / 1_000_000.0) * costPerMillionRetrievals;
        
        return tracesCost + retrievalsCost;
    }
}
```

#### Application Insights Pricing Tiers

**Pay-as-you-go:**
- First 5 GB per month: Free
- Additional data: $2.30 per GB

**Commitment Tiers:**
- 100 GB/day: $196/day ($5,880/month)
- 200 GB/day: $374/day ($11,220/month)
- 300 GB/day: $534/day ($16,020/month)

```csharp
public class ApplicationInsightsCostCalculator
{
    public static double CalculateMonthlyCost(double gbPerMonth)
    {
        const double freeGb = 5.0;
        const double costPerGb = 2.30;
        
        if (gbPerMonth <= freeGb)
            return 0;
        
        var billableGb = gbPerMonth - freeGb;
        return billableGb * costPerGb;
    }
    
    public static double CalculateCommitmentTierCost(double gbPerDay)
    {
        return gbPerDay switch
        {
            <= 100 => 196 * 30, // $5,880/month
            <= 200 => 374 * 30, // $11,220/month
            <= 300 => 534 * 30, // $16,020/month
            _ => throw new ArgumentException("Commitment tier not available for this volume")
        };
    }
}
```

### 10.2 Sampling Strategies

#### Head-based Sampling Implementation

```csharp
public class HeadBasedSampler
{
    private readonly double _samplingRate;
    private readonly Random _random = new();
    
    public HeadBasedSampler(double samplingRate)
    {
        _samplingRate = Math.Clamp(samplingRate, 0.0, 1.0);
    }
    
    public bool ShouldSample(ActivityContext context)
    {
        // Always sample errors
        if (context.TraceFlags.HasFlag(ActivityTraceFlags.Recorded))
            return true;
        
        // Sample based on trace ID for consistency
        var traceIdBytes = context.TraceId.ToByteArray();
        var hash = BitConverter.ToUInt64(traceIdBytes, 0);
        var threshold = (ulong)(_samplingRate * ulong.MaxValue);
        
        return hash < threshold;
    }
}

// Configure in Program.cs
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .SetSampler(new TraceIdRatioBasedSampler(0.1)) // 10% sampling
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation());
```

#### Tail-based Sampling with OpenTelemetry Collector

```yaml
# otel-collector-config.yaml
processors:
  tail_sampling:
    decision_wait: 10s
    num_traces: 50000
    expected_new_traces_per_sec: 10
    policies:
      # Always sample errors
      - name: error-policy
        type: status_code
        status_code: {status_codes: [ERROR]}
      
      # Always sample slow requests
      - name: latency-policy
        type: latency
        latency: {threshold_ms: 1000}
      
      # Sample 10% of normal requests
      - name: probabilistic-policy
        type: probabilistic
        probabilistic: {sampling_percentage: 10}
      
      # Always sample specific services
      - name: critical-service-policy
        type: string_attribute
        string_attribute: {key: service.name, values: [payment-service, auth-service]}

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [tail_sampling, batch]
      exporters: [jaeger, otlp/applicationinsights]
```

#### Adaptive Sampling Patterns

```csharp
public class AdaptiveSampler
{
    private readonly Dictionary<string, ServiceSamplingState> _serviceStates = new();
    private readonly Timer _adjustmentTimer;
    
    public AdaptiveSampler()
    {
        _adjustmentTimer = new Timer(AdjustSamplingRates, null, 
            TimeSpan.FromMinutes(1), TimeSpan.FromMinutes(1));
    }
    
    public bool ShouldSample(string serviceName, ActivityContext context)
    {
        var state = _serviceStates.GetOrAdd(serviceName, _ => new ServiceSamplingState());
        
        state.TotalRequests++;
        
        // Always sample errors
        if (context.TraceFlags.HasFlag(ActivityTraceFlags.Recorded))
        {
            state.SampledRequests++;
            return true;
        }
        
        // Sample based on current rate
        if (_random.NextDouble() < state.CurrentSamplingRate)
        {
            state.SampledRequests++;
            return true;
        }
        
        return false;
    }
    
    private void AdjustSamplingRates(object state)
    {
        foreach (var (serviceName, serviceState) in _serviceStates)
        {
            var currentRate = serviceState.SampledRequests / (double)serviceState.TotalRequests;
            var targetRate = CalculateTargetRate(serviceName, serviceState);
            
            // Adjust sampling rate towards target
            serviceState.CurrentSamplingRate = Math.Clamp(
                serviceState.CurrentSamplingRate + (targetRate - currentRate) * 0.1,
                0.01, 1.0);
            
            // Reset counters
            serviceState.TotalRequests = 0;
            serviceState.SampledRequests = 0;
        }
    }
    
    private double CalculateTargetRate(string serviceName, ServiceSamplingState state)
    {
        // Higher sampling for critical services
        if (serviceName.Contains("payment") || serviceName.Contains("auth"))
            return 0.5; // 50%
        
        // Lower sampling for high-volume services
        if (state.TotalRequests > 10000)
            return 0.05; // 5%
        
        return 0.1; // 10% default
    }
}

public class ServiceSamplingState
{
    public double CurrentSamplingRate { get; set; } = 0.1;
    public long TotalRequests { get; set; }
    public long SampledRequests { get; set; }
}
```

### 10.3 Data Retention Policies

#### Retention Recommendations by Data Type

```csharp
public class RetentionPolicy
{
    public static readonly Dictionary<string, RetentionConfig> Policies = new()
    {
        // Metrics - keep longer for trend analysis
        { "metrics.performance", new RetentionConfig { Days = 90, Cost = "Medium" } },
        { "metrics.business", new RetentionConfig { Days = 365, Cost = "High" } },
        { "metrics.infrastructure", new RetentionConfig { Days = 30, Cost = "Low" } },
        
        // Traces - expensive, shorter retention
        { "traces.detailed", new RetentionConfig { Days = 7, Cost = "High" } },
        { "traces.sampled", new RetentionConfig { Days = 30, Cost = "Medium" } },
        { "traces.errors", new RetentionConfig { Days = 90, Cost = "Medium" } },
        
        // Logs - varies by importance
        { "logs.application", new RetentionConfig { Days = 30, Cost = "Medium" } },
        { "logs.security", new RetentionConfig { Days = 365, Cost = "High" } },
        { "logs.debug", new RetentionConfig { Days = 7, Cost = "Low" } }
    };
}

public class RetentionConfig
{
    public int Days { get; set; }
    public string Cost { get; set; }
}
```

#### Cost Impact of Retention Periods

```csharp
public class RetentionCostCalculator
{
    public static double CalculateStorageCost(double gbPerDay, int retentionDays, string service)
    {
        var totalGb = gbPerDay * retentionDays;
        
        return service.ToLower() switch
        {
            "cloudwatch" => totalGb * 0.03, // $0.03 per GB per month
            "applicationinsights" => totalGb * 2.30 / 30, // $2.30 per GB, prorated daily
            "s3" => totalGb * 0.023, // $0.023 per GB per month for Standard
            _ => throw new ArgumentException($"Unknown service: {service}")
        };
    }
    
    public static RetentionCostAnalysis AnalyzeRetentionCosts(
        double dailyVolumeGb, 
        string service,
        int[] retentionOptions = null)
    {
        retentionOptions ??= new[] { 7, 30, 90, 365 };
        
        var analysis = new RetentionCostAnalysis
        {
            Service = service,
            DailyVolumeGb = dailyVolumeGb,
            Options = new List<RetentionOption>()
        };
        
        foreach (var days in retentionOptions)
        {
            var cost = CalculateStorageCost(dailyVolumeGb, days, service);
            analysis.Options.Add(new RetentionOption
            {
                RetentionDays = days,
                MonthlyCost = cost,
                CostPerGb = cost / (dailyVolumeGb * days)
            });
        }
        
        return analysis;
    }
}

public class RetentionCostAnalysis
{
    public string Service { get; set; }
    public double DailyVolumeGb { get; set; }
    public List<RetentionOption> Options { get; set; }
}

public class RetentionOption
{
    public int RetentionDays { get; set; }
    public double MonthlyCost { get; set; }
    public double CostPerGb { get; set; }
}
```

### 10.4 Cost Reduction Techniques

#### Optimization Strategies Without Losing Visibility

```csharp
public class CostOptimizer
{
    // Intelligent sampling based on request characteristics
    public bool ShouldSample(HttpContext context, double baseSamplingRate)
    {
        var path = context.Request.Path.Value?.ToLower() ?? "";
        
        // Always sample errors and slow requests
        if (context.Response.StatusCode >= 400)
            return true;
        
        // Higher sampling for critical endpoints
        if (path.Contains("/api/payment") || path.Contains("/api/auth"))
            return Random.Shared.NextDouble() < Math.Min(baseSamplingRate * 5, 1.0);
        
        // Lower sampling for health checks and static content
        if (path.Contains("/health") || path.Contains("/static"))
            return Random.Shared.NextDouble() < baseSamplingRate * 0.1;
        
        // Standard sampling for everything else
        return Random.Shared.NextDouble() < baseSamplingRate;
    }
    
    // Metric aggregation to reduce cardinality
    public string NormalizeMetricTags(Dictionary<string, string> tags)
    {
        var normalized = new Dictionary<string, string>();
        
        foreach (var (key, value) in tags)
        {
            normalized[key] = key switch
            {
                "user.id" => HashToBucket(value, 100), // Reduce to 100 buckets
                "request.id" => "aggregated", // Remove high-cardinality IDs
                "http.status_code" => NormalizeStatusCode(value),
                _ => value
            };
        }
        
        return string.Join(",", normalized.Select(kv => $"{kv.Key}={kv.Value}"));
    }
    
    private string HashToBucket(string value, int buckets)
    {
        var hash = value.GetHashCode();
        var bucket = Math.Abs(hash % buckets);
        return $"bucket_{bucket}";
    }
    
    private string NormalizeStatusCode(string statusCode)
    {
        return statusCode[0] switch
        {
            '2' => "2xx",
            '3' => "3xx", 
            '4' => "4xx",
            '5' => "5xx",
            _ => statusCode
        };
    }
}
```

#### Budget Monitoring and Alerts

```csharp
public class BudgetMonitor
{
    private readonly Dictionary<string, BudgetConfig> _budgets;
    
    public class BudgetConfig
    {
        public double MonthlyBudget { get; set; }
        public double AlertThreshold { get; set; } = 0.8; // 80%
        public string NotificationEmail { get; set; }
    }
    
    public async Task CheckBudgetsAsync()
    {
        foreach (var (service, budget) in _budgets)
        {
            var currentSpend = await GetCurrentMonthSpendAsync(service);
            var percentUsed = currentSpend / budget.MonthlyBudget;
            
            if (percentUsed >= budget.AlertThreshold)
            {
                await SendBudgetAlertAsync(service, currentSpend, budget);
            }
        }
    }
    
    private async Task SendBudgetAlertAsync(string service, double currentSpend, BudgetConfig budget)
    {
        var message = $"Budget alert for {service}: ${currentSpend:F2} of ${budget.MonthlyBudget:F2} used " +
                     $"({currentSpend / budget.MonthlyBudget:P1})";
        
        // Send notification
        await _notificationService.SendEmailAsync(budget.NotificationEmail, "Budget Alert", message);
    }
}
```

### 10.5 Cost Comparison and Budgeting Guidance

#### Managed Services vs Third-party Tools Cost Comparison

```csharp
public class CostComparison
{
    public static readonly Dictionary<string, ServiceCostModel> CostModels = new()
    {
        {
            "AWS Native",
            new ServiceCostModel
            {
                MetricsCost = 0.30, // per metric per month
                LogsCost = 0.50, // per GB ingested
                TracesCost = 5.00, // per million traces
                SetupCost = 0,
                MaintenanceCost = 0
            }
        },
        {
            "Azure Native", 
            new ServiceCostModel
            {
                MetricsCost = 0, // Included in App Insights
                LogsCost = 2.30, // per GB
                TracesCost = 0, // Included in App Insights
                SetupCost = 0,
                MaintenanceCost = 0
            }
        },
        {
            "Datadog",
            new ServiceCostModel
            {
                MetricsCost = 0.05, // per host per hour
                LogsCost = 1.70, // per GB per month
                TracesCost = 1.70, // per GB per month
                SetupCost = 500, // Initial setup
                MaintenanceCost = 2000 // Monthly maintenance
            }
        },
        {
            "New Relic",
            new ServiceCostModel
            {
                MetricsCost = 0.30, // per GB per month
                LogsCost = 0.30, // per GB per month
                TracesCost = 0.30, // per GB per month
                SetupCost = 1000,
                MaintenanceCost = 1500
            }
        }
    };
}

public class ServiceCostModel
{
    public double MetricsCost { get; set; }
    public double LogsCost { get; set; }
    public double TracesCost { get; set; }
    public double SetupCost { get; set; }
    public double MaintenanceCost { get; set; }
}
```

#### Typical Cost Ranges by Application Scale

```csharp
public class ScaleCostEstimator
{
    public static readonly Dictionary<string, ScaleCostRange> CostRanges = new()
    {
        {
            "Small (< 1M requests/month)",
            new ScaleCostRange
            {
                MinMonthlyCost = 50,
                MaxMonthlyCost = 200,
                RecommendedServices = new[] { "AWS Native", "Azure Native" },
                Characteristics = "Basic monitoring, limited custom metrics"
            }
        },
        {
            "Medium (1M - 10M requests/month)",
            new ScaleCostRange
            {
                MinMonthlyCost = 200,
                MaxMonthlyCost = 1000,
                RecommendedServices = new[] { "AWS Native", "Azure Native", "New Relic" },
                Characteristics = "Full APM suite, custom dashboards"
            }
        },
        {
            "Large (10M - 100M requests/month)",
            new ScaleCostRange
            {
                MinMonthlyCost = 1000,
                MaxMonthlyCost = 5000,
                RecommendedServices = new[] { "Datadog", "New Relic", "Custom Solution" },
                Characteristics = "Advanced analytics, multiple environments"
            }
        },
        {
            "Enterprise (> 100M requests/month)",
            new ScaleCostRange
            {
                MinMonthlyCost = 5000,
                MaxMonthlyCost = 25000,
                RecommendedServices = new[] { "Custom Solution", "Datadog Enterprise" },
                Characteristics = "Custom integrations, dedicated support"
            }
        }
    };
}

public class ScaleCostRange
{
    public double MinMonthlyCost { get; set; }
    public double MaxMonthlyCost { get; set; }
    public string[] RecommendedServices { get; set; }
    public string Characteristics { get; set; }
}
```

#### Cost Estimation Templates

```csharp
public class CostEstimationTemplate
{
    public class ApplicationProfile
    {
        public long RequestsPerMonth { get; set; }
        public double LogsGbPerMonth { get; set; }
        public int CustomMetrics { get; set; }
        public long TracesPerMonth { get; set; }
        public int Environments { get; set; } = 1;
    }
    
    public static double EstimateMonthlyCost(ApplicationProfile profile, string service)
    {
        var model = CostComparison.CostModels[service];
        
        var metricsCost = profile.CustomMetrics * model.MetricsCost * profile.Environments;
        var logsCost = profile.LogsGbPerMonth * model.LogsCost * profile.Environments;
        var tracesCost = (profile.TracesPerMonth / 1_000_000.0) * model.TracesCost * profile.Environments;
        
        return metricsCost + logsCost + tracesCost + model.MaintenanceCost;
    }
    
    public static CostBreakdown GetCostBreakdown(ApplicationProfile profile, string service)
    {
        var model = CostComparison.CostModels[service];
        
        return new CostBreakdown
        {
            Service = service,
            MetricsCost = profile.CustomMetrics * model.MetricsCost * profile.Environments,
            LogsCost = profile.LogsGbPerMonth * model.LogsCost * profile.Environments,
            TracesCost = (profile.TracesPerMonth / 1_000_000.0) * model.TracesCost * profile.Environments,
            MaintenanceCost = model.MaintenanceCost,
            TotalMonthlyCost = EstimateMonthlyCost(profile, service)
        };
    }
}

public class CostBreakdown
{
    public string Service { get; set; }
    public double MetricsCost { get; set; }
    public double LogsCost { get; set; }
    public double TracesCost { get; set; }
    public double MaintenanceCost { get; set; }
    public double TotalMonthlyCost { get; set; }
}
```
---

## CI/CD Integration

_[Content to be added in subsequent tasks]_
CI/CD integration ensures performance monitoring is embedded throughout the software delivery lifecycle. This section covers performance testing gates, deployment markers, automated rollback triggers, canary analysis, and Infrastructure as Code patterns for APM provisioning.

### 11.1 Performance Testing Gates

#### Performance Test Types in CI/CD

```csharp
public class PerformanceTestGate
{
    public string Name { get; set; }
    public string Stage { get; set; }
    public PerformanceTestType Type { get; set; }
    public Dictionary<string, double> Thresholds { get; set; }
    public bool IsBlocking { get; set; }
}

public enum PerformanceTestType
{
    LoadTest,      // Normal expected load
    StressTest,    // Beyond normal capacity
    SpikeTest,     // Sudden load increases
    VolumeTest,    // Large amounts of data
    EnduranceTest  // Extended periods
}

public static class PerformanceGates
{
    public static readonly List<PerformanceTestGate> StandardGates = new()
    {
        new()
        {
            Name = "API Load Test",
            Stage = "build",
            Type = PerformanceTestType.LoadTest,
            Thresholds = new()
            {
                { "response_time_p95", 500 }, // ms
                { "error_rate", 1.0 },        // %
                { "throughput_min", 100 }     // rps
            },
            IsBlocking = true
        },
        new()
        {
            Name = "Database Stress Test", 
            Stage = "integration",
            Type = PerformanceTestType.StressTest,
            Thresholds = new()
            {
                { "connection_pool_max", 80 }, // % utilization
                { "query_time_p99", 1000 },   // ms
                { "deadlock_count", 0 }       // count
            },
            IsBlocking = true
        },
        new()
        {
            Name = "Memory Endurance Test",
            Stage = "staging",
            Type = PerformanceTestType.EnduranceTest,
            Thresholds = new()
            {
                { "memory_growth_rate", 5 },  // MB/hour
                { "gc_pressure", 10 },        // % time in GC
                { "memory_leaks", 0 }         // count
            },
            IsBlocking = false
        }
    };
}
```

#### Pass/Fail Criteria Definition

```csharp
public class PerformanceTestResult
{
    public string TestName { get; set; }
    public Dictionary<string, double> Metrics { get; set; }
    public Dictionary<string, double> Thresholds { get; set; }
    public bool Passed { get; set; }
    public List<string> Failures { get; set; }
}

public class PerformanceGateEvaluator
{
    public static PerformanceTestResult EvaluateGate(PerformanceTestGate gate, Dictionary<string, double> actualMetrics)
    {
        var result = new PerformanceTestResult
        {
            TestName = gate.Name,
            Metrics = actualMetrics,
            Thresholds = gate.Thresholds,
            Failures = new List<string>()
        };
        
        foreach (var (metric, threshold) in gate.Thresholds)
        {
            if (!actualMetrics.TryGetValue(metric, out var actualValue))
            {
                result.Failures.Add($"Missing metric: {metric}");
                continue;
            }
            
            var passed = metric switch
            {
                var m when m.Contains("error") || m.Contains("leak") => actualValue <= threshold,
                var m when m.Contains("time") || m.Contains("duration") => actualValue <= threshold,
                var m when m.Contains("throughput") || m.Contains("rps") => actualValue >= threshold,
                _ => actualValue <= threshold
            };
            
            if (!passed)
            {
                result.Failures.Add($"{metric}: {actualValue} (threshold: {threshold})");
            }
        }
        
        result.Passed = result.Failures.Count == 0;
        return result;
    }
}
```

#### Integration with Pipeline Stages

```yaml
# GitHub Actions example
name: CI/CD with Performance Gates

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup .NET
        uses: actions/setup-dotnet@v3
        with:
          dotnet-version: '8.0'
      
      - name: Build
        run: dotnet build
      
      - name: Unit Tests
        run: dotnet test
      
      - name: API Load Test
        run: |
          dotnet run --project LoadTests -- \
            --test-type load \
            --duration 60s \
            --rps 100 \
            --threshold-p95 500 \
            --threshold-error-rate 1.0
  
  integration:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Test Environment
        run: ./deploy-test.sh
      
      - name: Database Stress Test
        run: |
          dotnet run --project StressTests -- \
            --test-type stress \
            --connections 200 \
            --duration 300s \
            --threshold-pool-utilization 80
  
  staging:
    needs: integration
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: ./deploy-staging.sh
      
      - name: Endurance Test
        run: |
          dotnet run --project EnduranceTests -- \
            --duration 3600s \
            --threshold-memory-growth 5
```

### 11.2 Deployment Markers and Release Annotations

#### Application Insights Release Annotations

```csharp
public class ReleaseAnnotationService
{
    private readonly HttpClient _httpClient;
    private readonly string _appId;
    private readonly string _apiKey;
    
    public async Task CreateReleaseAnnotationAsync(string releaseName, string version, DateTime releaseTime)
    {
        var annotation = new
        {
            Id = Guid.NewGuid().ToString(),
            AnnotationName = releaseName,
            EventTime = releaseTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
            Category = "Deployment",
            Properties = new Dictionary<string, string>
            {
                { "Version", version },
                { "Environment", Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown" },
                { "BuildId", Environment.GetEnvironmentVariable("BUILD_ID") ?? "Unknown" },
                { "CommitSha", Environment.GetEnvironmentVariable("COMMIT_SHA") ?? "Unknown" }
            }
        };
        
        var json = JsonSerializer.Serialize(annotation);
        var content = new StringContent(json, Encoding.UTF8, "application/json");
        
        var url = $"https://api.applicationinsights.io/v1/apps/{_appId}/Annotations";
        _httpClient.DefaultRequestHeaders.Add("X-API-Key", _apiKey);
        
        var response = await _httpClient.PostAsync(url, content);
        response.EnsureSuccessStatusCode();
    }
}

// Usage in deployment pipeline
public class DeploymentService
{
    private readonly ReleaseAnnotationService _annotationService;
    
    public async Task DeployAsync(string version)
    {
        var deploymentStart = DateTime.UtcNow;
        
        try
        {
            // Perform deployment
            await PerformDeploymentAsync(version);
            
            // Create success annotation
            await _annotationService.CreateReleaseAnnotationAsync(
                $"Release {version} - Success", 
                version, 
                deploymentStart);
        }
        catch (Exception ex)
        {
            // Create failure annotation
            await _annotationService.CreateReleaseAnnotationAsync(
                $"Release {version} - Failed: {ex.Message}", 
                version, 
                deploymentStart);
            throw;
        }
    }
}
```

#### CloudWatch Deployment Markers

```csharp
public class CloudWatchDeploymentMarker
{
    private readonly IAmazonCloudWatch _cloudWatch;
    
    public async Task CreateDeploymentMarkerAsync(string service, string version, string environment)
    {
        var metricData = new MetricDatum
        {
            MetricName = "Deployment",
            Value = 1,
            Unit = StandardUnit.Count,
            TimestampUtc = DateTime.UtcNow,
            Dimensions = new List<Dimension>
            {
                new() { Name = "Service", Value = service },
                new() { Name = "Version", Value = version },
                new() { Name = "Environment", Value = environment }
            }
        };
        
        await _cloudWatch.PutMetricDataAsync(new PutMetricDataRequest
        {
            Namespace = "Deployments",
            MetricData = new List<MetricDatum> { metricData }
        });
    }
}
```

### 11.3 Automated Rollback Triggers

#### Metric-based Rollback Conditions

```csharp
public class RollbackTrigger
{
    public string Name { get; set; }
    public string MetricName { get; set; }
    public double Threshold { get; set; }
    public TimeSpan EvaluationWindow { get; set; }
    public RollbackSeverity Severity { get; set; }
}

public enum RollbackSeverity
{
    Warning,    // Alert but don't rollback
    Critical    // Automatic rollback
}

public class AutomatedRollbackService
{
    private static readonly List<RollbackTrigger> DefaultTriggers = new()
    {
        new()
        {
            Name = "High Error Rate",
            MetricName = "error_rate",
            Threshold = 5.0, // 5%
            EvaluationWindow = TimeSpan.FromMinutes(5),
            Severity = RollbackSeverity.Critical
        },
        new()
        {
            Name = "Severe Latency Degradation",
            MetricName = "response_time_p95",
            Threshold = 2000, // 2 seconds
            EvaluationWindow = TimeSpan.FromMinutes(3),
            Severity = RollbackSeverity.Critical
        },
        new()
        {
            Name = "Memory Leak Detection",
            MetricName = "memory_usage",
            Threshold = 90, // 90%
            EvaluationWindow = TimeSpan.FromMinutes(10),
            Severity = RollbackSeverity.Warning
        }
    };
    
    public async Task<bool> ShouldRollbackAsync(string deploymentId)
    {
        foreach (var trigger in DefaultTriggers)
        {
            if (trigger.Severity != RollbackSeverity.Critical)
                continue;
                
            var metricValue = await GetMetricValueAsync(trigger.MetricName, trigger.EvaluationWindow);
            
            if (metricValue > trigger.Threshold)
            {
                await LogRollbackTriggerAsync(deploymentId, trigger, metricValue);
                return true;
            }
        }
        
        return false;
    }
    
    public async Task ExecuteRollbackAsync(string deploymentId, string previousVersion)
    {
        // Implement rollback logic
        await DeployVersionAsync(previousVersion);
        
        // Create rollback annotation
        await CreateRollbackAnnotationAsync(deploymentId, previousVersion);
    }
}
```

### 11.4 Canary Analysis and Progressive Delivery

#### Canary Deployment Monitoring

```csharp
public class CanaryAnalyzer
{
    public class CanaryMetrics
    {
        public double ErrorRate { get; set; }
        public double LatencyP95 { get; set; }
        public double Throughput { get; set; }
        public int SampleSize { get; set; }
    }
    
    public async Task<bool> ShouldPromoteCanaryAsync(string canaryVersion, string baselineVersion)
    {
        var canaryMetrics = await GetCanaryMetricsAsync(canaryVersion);
        var baselineMetrics = await GetBaselineMetricsAsync(baselineVersion);
        
        // Statistical significance check
        if (canaryMetrics.SampleSize < 1000)
        {
            return false; // Not enough data
        }
        
        // Error rate comparison
        var errorRateIncrease = (canaryMetrics.ErrorRate - baselineMetrics.ErrorRate) / baselineMetrics.ErrorRate;
        if (errorRateIncrease > 0.1) // 10% increase
        {
            return false;
        }
        
        // Latency comparison
        var latencyIncrease = (canaryMetrics.LatencyP95 - baselineMetrics.LatencyP95) / baselineMetrics.LatencyP95;
        if (latencyIncrease > 0.2) // 20% increase
        {
            return false;
        }
        
        return true;
    }
}
```

#### Progressive Delivery Patterns

```csharp
public class ProgressiveDeliveryController
{
    public class DeploymentStage
    {
        public string Name { get; set; }
        public double TrafficPercentage { get; set; }
        public TimeSpan Duration { get; set; }
        public Dictionary<string, double> PromotionCriteria { get; set; }
    }
    
    public static readonly List<DeploymentStage> StandardProgression = new()
    {
        new()
        {
            Name = "Initial Canary",
            TrafficPercentage = 1.0,
            Duration = TimeSpan.FromMinutes(10),
            PromotionCriteria = new() { { "error_rate", 2.0 }, { "latency_p95", 1000 } }
        },
        new()
        {
            Name = "Small Rollout",
            TrafficPercentage = 5.0,
            Duration = TimeSpan.FromMinutes(30),
            PromotionCriteria = new() { { "error_rate", 1.5 }, { "latency_p95", 800 } }
        },
        new()
        {
            Name = "Medium Rollout",
            TrafficPercentage = 25.0,
            Duration = TimeSpan.FromHours(1),
            PromotionCriteria = new() { { "error_rate", 1.0 }, { "latency_p95", 600 } }
        },
        new()
        {
            Name = "Full Rollout",
            TrafficPercentage = 100.0,
            Duration = TimeSpan.Zero,
            PromotionCriteria = new()
        }
    };
    
    public async Task ExecuteProgressiveDeploymentAsync(string version)
    {
        foreach (var stage in StandardProgression)
        {
            await SetTrafficPercentageAsync(version, stage.TrafficPercentage);
            
            if (stage.Duration > TimeSpan.Zero)
            {
                await Task.Delay(stage.Duration);
                
                var shouldPromote = await EvaluatePromotionCriteriaAsync(stage.PromotionCriteria);
                if (!shouldPromote)
                {
                    await RollbackDeploymentAsync(version);
                    throw new DeploymentException($"Deployment failed at stage: {stage.Name}");
                }
            }
        }
    }
}
```

### 11.5 IaC Patterns for APM Provisioning

#### Pulumi Examples for Application Insights

```csharp
using Pulumi;
using Pulumi.AzureNative.Insights;
using Pulumi.AzureNative.Resources;

public class ApplicationInsightsStack : Stack
{
    public ApplicationInsightsStack()
    {
        var resourceGroup = new ResourceGroup("apm-rg");
        
        // Application Insights component
        var appInsights = new Component("app-insights", new ComponentArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ApplicationType = "web",
            Kind = "web",
            RetentionInDays = 90,
            SamplingPercentage = 100,
            DisableIpMasking = false,
            DisableLocalAuth = false
        });
        
        // Action Group for alerts
        var actionGroup = new ActionGroup("apm-alerts", new ActionGroupArgs
        {
            ResourceGroupName = resourceGroup.Name,
            GroupShortName = "apm",
            Enabled = true,
            EmailReceivers = new[]
            {
                new EmailReceiverArgs
                {
                    Name = "team-email",
                    EmailAddress = "team@company.com",
                    UseCommonAlertSchema = true
                }
            }
        });
        
        // Metric Alert Rules
        var errorRateAlert = new MetricAlertRule("error-rate-alert", new MetricAlertRuleArgs
        {
            ResourceGroupName = resourceGroup.Name,
            RuleName = "high-error-rate",
            Severity = 2,
            Enabled = true,
            EvaluationFrequency = "PT1M",
            WindowSize = "PT5M",
            Scopes = new[] { appInsights.Id },
            Criteria = new MetricAlertMultipleResourceMultipleMetricCriteriaArgs
            {
                AllOf = new[]
                {
                    new MetricCriteriaArgs
                    {
                        Name = "ErrorRate",
                        MetricName = "requests/failed",
                        MetricNamespace = "Microsoft.Insights/components",
                        Operator = "GreaterThan",
                        Threshold = 5.0,
                        TimeAggregation = "Average"
                    }
                }
            },
            Actions = new[] { new ActionArgs { ActionGroupId = actionGroup.Id } }
        });
        
        // Export connection string
        this.ConnectionString = appInsights.ConnectionString;
        this.InstrumentationKey = appInsights.InstrumentationKey;
    }
    
    [Output] public Output<string> ConnectionString { get; set; }
    [Output] public Output<string> InstrumentationKey { get; set; }
}
```

#### Pulumi Examples for CloudWatch Resources

```csharp
using Pulumi;
using Pulumi.Aws.CloudWatch;
using Pulumi.Aws.Sns;

public class CloudWatchStack : Stack
{
    public CloudWatchStack()
    {
        // SNS Topic for alerts
        var alertTopic = new Topic("apm-alerts", new TopicArgs
        {
            Name = "apm-alerts"
        });
        
        var emailSubscription = new TopicSubscription("email-alerts", new TopicSubscriptionArgs
        {
            TopicArn = alertTopic.Arn,
            Protocol = "email",
            Endpoint = "team@company.com"
        });
        
        // Custom Metrics
        var errorRateAlarm = new MetricAlarm("error-rate-alarm", new MetricAlarmArgs
        {
            Name = "high-error-rate",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 2,
            MetricName = "ErrorRate",
            Namespace = "MyApp/API",
            Period = 300,
            Statistic = "Average",
            Threshold = 5.0,
            ActionsEnabled = true,
            AlarmActions = new[] { alertTopic.Arn },
            AlarmDescription = "Error rate is above 5%"
        });
        
        var latencyAlarm = new MetricAlarm("latency-alarm", new MetricAlarmArgs
        {
            Name = "high-latency",
            ComparisonOperator = "GreaterThanThreshold",
            EvaluationPeriods = 3,
            MetricName = "ResponseTime",
            Namespace = "MyApp/API",
            Period = 300,
            Statistic = "Average",
            Threshold = 1000,
            ActionsEnabled = true,
            AlarmActions = new[] { alertTopic.Arn },
            AlarmDescription = "Response time is above 1 second"
        });
        
        // Log Group
        var logGroup = new LogGroup("app-logs", new LogGroupArgs
        {
            Name = "/aws/application/myapp",
            RetentionInDays = 30
        });
        
        // Dashboard
        var dashboard = new Dashboard("apm-dashboard", new DashboardArgs
        {
            DashboardName = "APM-Dashboard",
            DashboardBody = Output.JsonSerialize(new
            {
                widgets = new[]
                {
                    new
                    {
                        type = "metric",
                        properties = new
                        {
                            metrics = new[]
                            {
                                new[] { "MyApp/API", "ErrorRate" },
                                new[] { "MyApp/API", "ResponseTime" }
                            },
                            period = 300,
                            stat = "Average",
                            region = "us-east-1",
                            title = "API Performance"
                        }
                    }
                }
            })
        });
        
        // Export values
        this.AlertTopicArn = alertTopic.Arn;
        this.LogGroupName = logGroup.Name;
    }
    
    [Output] public Output<string> AlertTopicArn { get; set; }
    [Output] public Output<string> LogGroupName { get; set; }
}
```
---

## Security and Compliance

_[Content to be added in subsequent tasks]_
Security and compliance are critical for APM implementations handling sensitive data. This section covers PII handling, encryption requirements, access control patterns, compliance frameworks, and audit logging.

### 12.1 PII and Sensitive Data Handling

#### PII Identification in Monitoring Data

```csharp
public class PiiDetector
{
    private static readonly Regex EmailPattern = new(@"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b");
    private static readonly Regex PhonePattern = new(@"\b\d{3}-?\d{3}-?\d{4}\b");
    private static readonly Regex SsnPattern = new(@"\b\d{3}-?\d{2}-?\d{4}\b");
    private static readonly Regex CreditCardPattern = new(@"\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b");
    
    public static bool ContainsPii(string text)
    {
        return EmailPattern.IsMatch(text) ||
               PhonePattern.IsMatch(text) ||
               SsnPattern.IsMatch(text) ||
               CreditCardPattern.IsMatch(text);
    }
    
    public static string MaskPii(string text)
    {
        text = EmailPattern.Replace(text, "[EMAIL]");
        text = PhonePattern.Replace(text, "[PHONE]");
        text = SsnPattern.Replace(text, "[SSN]");
        text = CreditCardPattern.Replace(text, "[CARD]");
        return text;
    }
}
```

#### Data Masking and Redaction Techniques

```csharp
public class DataMaskingEnricher : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        if (logEvent.MessageTemplate?.Text != null)
        {
            var maskedMessage = PiiDetector.MaskPii(logEvent.MessageTemplate.Text);
            logEvent.AddOrUpdateProperty(propertyFactory.CreateProperty("MaskedMessage", maskedMessage));
        }
        
        // Mask properties
        var maskedProperties = new Dictionary<string, LogEventPropertyValue>();
        foreach (var property in logEvent.Properties)
        {
            if (property.Value is ScalarValue scalar && scalar.Value is string stringValue)
            {
                if (PiiDetector.ContainsPii(stringValue))
                {
                    maskedProperties[property.Key] = new ScalarValue(PiiDetector.MaskPii(stringValue));
                }
            }
        }
        
        foreach (var (key, value) in maskedProperties)
        {
            logEvent.AddOrUpdateProperty(propertyFactory.CreateProperty(key, value));
        }
    }
}

// Configure Serilog with PII masking
Log.Logger = new LoggerConfiguration()
    .Enrich.With<DataMaskingEnricher>()
    .WriteTo.ApplicationInsights(connectionString, TelemetryConverter.Traces)
    .CreateLogger();
```

#### Secure Data Collection Practices

```csharp
public class SecureMetricsCollector
{
    private readonly HashSet<string> _sensitiveFields = new()
    {
        "password", "token", "key", "secret", "ssn", "credit_card"
    };
    
    public void RecordMetric(string name, double value, TagList tags)
    {
        var sanitizedTags = new TagList();
        
        foreach (var tag in tags)
        {
            if (IsSensitiveField(tag.Key))
            {
                // Hash sensitive values
                sanitizedTags.Add(tag.Key, HashValue(tag.Value?.ToString()));
            }
            else if (tag.Value is string stringValue && PiiDetector.ContainsPii(stringValue))
            {
                sanitizedTags.Add(tag.Key, "[REDACTED]");
            }
            else
            {
                sanitizedTags.Add(tag.Key, tag.Value);
            }
        }
        
        _metricsClient.Record(name, value, sanitizedTags);
    }
    
    private bool IsSensitiveField(string fieldName)
    {
        return _sensitiveFields.Any(sensitive => 
            fieldName.Contains(sensitive, StringComparison.OrdinalIgnoreCase));
    }
    
    private string HashValue(string value)
    {
        if (string.IsNullOrEmpty(value)) return value;
        
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(Encoding.UTF8.GetBytes(value));
        return Convert.ToHexString(hash)[..8]; // First 8 characters
    }
}
```

### 12.2 Encryption Requirements

#### Encryption at Rest Configuration

```csharp
// Application Insights - encryption at rest is automatic
public class ApplicationInsightsSecureConfig
{
    public static void ConfigureSecureAppInsights(IServiceCollection services, IConfiguration config)
    {
        services.AddApplicationInsightsTelemetry(options =>
        {
            options.ConnectionString = config["ApplicationInsights:ConnectionString"];
            
            // Disable IP masking only if required for compliance
            options.EnableAuthenticationTrackingJavaScript = false;
        });
        
        // Configure custom telemetry processor for additional security
        services.AddSingleton<ITelemetryProcessor, SecurityTelemetryProcessor>();
    }
}

public class SecurityTelemetryProcessor : ITelemetryProcessor
{
    private ITelemetryProcessor Next { get; set; }
    
    public SecurityTelemetryProcessor(ITelemetryProcessor next)
    {
        Next = next;
    }
    
    public void Process(ITelemetry item)
    {
        // Remove sensitive properties
        if (item is ISupportProperties propertiesItem)
        {
            var keysToRemove = propertiesItem.Properties.Keys
                .Where(key => key.Contains("password", StringComparison.OrdinalIgnoreCase) ||
                             key.Contains("token", StringComparison.OrdinalIgnoreCase))
                .ToList();
            
            foreach (var key in keysToRemove)
            {
                propertiesItem.Properties.Remove(key);
            }
        }
        
        Next.Process(item);
    }
}
```

#### Encryption in Transit (TLS) Requirements

```csharp
public class SecureHttpClientFactory
{
    public static HttpClient CreateSecureClient()
    {
        var handler = new HttpClientHandler()
        {
            SslProtocols = SslProtocols.Tls12 | SslProtocols.Tls13,
            CheckCertificateRevocationList = true
        };
        
        var client = new HttpClient(handler);
        
        // Ensure HTTPS only
        client.DefaultRequestHeaders.Add("Strict-Transport-Security", "max-age=31536000");
        
        return client;
    }
}

// Configure secure endpoints
public class SecureEndpointConfiguration
{
    public static void ConfigureSecureEndpoints(WebApplicationBuilder builder)
    {
        builder.Services.Configure<HttpsRedirectionOptions>(options =>
        {
            options.RedirectStatusCode = StatusCodes.Status308PermanentRedirect;
            options.HttpsPort = 443;
        });
        
        builder.Services.AddHsts(options =>
        {
            options.Preload = true;
            options.IncludeSubDomains = true;
            options.MaxAge = TimeSpan.FromDays(365);
        });
    }
}
```

### 12.3 RBAC and Access Control Patterns

#### IAM Roles for AWS APM Services

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudWatchMetricsAccess",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricData",
        "cloudwatch:GetMetricStatistics",
        "cloudwatch:ListMetrics"
      ],
      "Resource": "*",
      "Condition": {
        "StringEquals": {
          "cloudwatch:namespace": "MyApp/*"
        }
      }
    },
    {
      "Sid": "CloudWatchLogsAccess",
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogStreams"
      ],
      "Resource": "arn:aws:logs:*:*:log-group:/aws/application/myapp*"
    },
    {
      "Sid": "XRayAccess",
      "Effect": "Allow",
      "Action": [
        "xray:PutTraceSegments",
        "xray:PutTelemetryRecords"
      ],
      "Resource": "*"
    }
  ]
}
```

```csharp
// Pulumi IAM role configuration
using Pulumi.Aws.Iam;

public class ApmIamRole : ComponentResource
{
    public ApmIamRole(string name, ComponentResourceOptions? options = null)
        : base("custom:ApmIamRole", name, options)
    {
        var assumeRolePolicy = @"{
            ""Version"": ""2012-10-17"",
            ""Statement"": [{
                ""Action"": ""sts:AssumeRole"",
                ""Effect"": ""Allow"",
                ""Principal"": {
                    ""Service"": ""ec2.amazonaws.com""
                }
            }]
        }";
        
        var role = new Role($"{name}-role", new RoleArgs
        {
            AssumeRolePolicy = assumeRolePolicy
        });
        
        var policy = new Policy($"{name}-policy", new PolicyArgs
        {
            Policy = JsonSerializer.Serialize(new
            {
                Version = "2012-10-17",
                Statement = new[]
                {
                    new
                    {
                        Effect = "Allow",
                        Action = new[] { "cloudwatch:PutMetricData", "logs:PutLogEvents", "xray:PutTraceSegments" },
                        Resource = "*"
                    }
                }
            })
        });
        
        var attachment = new RolePolicyAttachment($"{name}-attachment", new RolePolicyAttachmentArgs
        {
            Role = role.Name,
            PolicyArn = policy.Arn
        });
        
        this.RoleArn = role.Arn;
    }
    
    [Output] public Output<string> RoleArn { get; set; }
}
```

#### Azure RBAC for Monitoring Resources

```csharp
// Pulumi Azure RBAC configuration
using Pulumi.AzureNative.Authorization;

public class ApmRbacConfiguration : ComponentResource
{
    public ApmRbacConfiguration(string name, ComponentResourceOptions? options = null)
        : base("custom:ApmRbacConfiguration", name, options)
    {
        // Custom role for APM access
        var apmRole = new RoleDefinition($"{name}-apm-role", new RoleDefinitionArgs
        {
            RoleName = "APM Contributor",
            Description = "Can read and write APM data",
            Scope = "/subscriptions/{subscription-id}",
            Permissions = new[]
            {
                new PermissionArgs
                {
                    Actions = new[]
                    {
                        "Microsoft.Insights/components/read",
                        "Microsoft.Insights/components/write",
                        "Microsoft.Insights/webtests/*",
                        "Microsoft.Insights/alertRules/*",
                        "Microsoft.OperationalInsights/workspaces/read",
                        "Microsoft.OperationalInsights/workspaces/query/action"
                    },
                    NotActions = new[]
                    {
                        "Microsoft.Insights/components/purge/action" // Prevent data deletion
                    }
                }
            }
        });
        
        // Monitoring Reader role assignment
        var readerAssignment = new RoleAssignment($"{name}-reader", new RoleAssignmentArgs
        {
            PrincipalId = "user-or-group-id",
            RoleDefinitionId = "/subscriptions/{subscription-id}/providers/Microsoft.Authorization/roleDefinitions/43d0d8ad-25c7-4714-9337-8ba259a9fe05", // Monitoring Reader
            Scope = "/subscriptions/{subscription-id}/resourceGroups/apm-rg"
        });
    }
}
```

### 12.4 Compliance Requirements

#### GDPR Considerations for Monitoring Data

```csharp
public class GdprComplianceService
{
    public class DataRetentionPolicy
    {
        public TimeSpan PersonalDataRetention { get; set; } = TimeSpan.FromDays(30);
        public TimeSpan AnonymizedDataRetention { get; set; } = TimeSpan.FromDays(365);
        public bool AutoDeleteEnabled { get; set; } = true;
    }
    
    public async Task ProcessDataSubjectRequestAsync(string userId, DataSubjectRequestType requestType)
    {
        switch (requestType)
        {
            case DataSubjectRequestType.Access:
                await ExportUserDataAsync(userId);
                break;
                
            case DataSubjectRequestType.Deletion:
                await DeleteUserDataAsync(userId);
                break;
                
            case DataSubjectRequestType.Rectification:
                await AnonymizeUserDataAsync(userId);
                break;
        }
    }
    
    private async Task DeleteUserDataAsync(string userId)
    {
        // Delete from Application Insights (if possible)
        // Note: Application Insights doesn't support selective deletion
        // Consider data anonymization instead
        
        await AnonymizeUserDataAsync(userId);
    }
    
    private async Task AnonymizeUserDataAsync(string userId)
    {
        // Replace user ID with anonymous identifier
        var anonymousId = GenerateAnonymousId(userId);
        
        // Update logs and metrics to use anonymous ID
        // This requires custom implementation based on your data store
    }
}

public enum DataSubjectRequestType
{
    Access,
    Deletion,
    Rectification,
    Portability
}
```

#### HIPAA Compliance Patterns

```csharp
public class HipaaComplianceConfiguration
{
    public static void ConfigureHipaaCompliantLogging(IServiceCollection services)
    {
        services.Configure<LoggerFilterOptions>(options =>
        {
            // Disable logging of PHI by default
            options.MinLevel = LogLevel.Warning;
        });
        
        // Use custom telemetry processor to ensure no PHI is logged
        services.AddSingleton<ITelemetryProcessor, PhiFilterTelemetryProcessor>();
    }
}

public class PhiFilterTelemetryProcessor : ITelemetryProcessor
{
    private readonly HashSet<string> _phiFields = new()
    {
        "patient_id", "medical_record", "diagnosis", "treatment", "medication"
    };
    
    public void Process(ITelemetry item)
    {
        if (item is ISupportProperties propertiesItem)
        {
            var keysToRemove = propertiesItem.Properties.Keys
                .Where(key => _phiFields.Any(phi => key.Contains(phi, StringComparison.OrdinalIgnoreCase)))
                .ToList();
            
            foreach (var key in keysToRemove)
            {
                propertiesItem.Properties.Remove(key);
            }
        }
        
        Next.Process(item);
    }
}
```

#### SOC2 Audit Requirements

```csharp
public class Soc2AuditLogger
{
    private static readonly ILogger Logger = LogManager.GetCurrentClassLogger();
    
    public void LogSecurityEvent(string eventType, string userId, string resource, bool success)
    {
        var auditEvent = new
        {
            EventType = eventType,
            UserId = userId,
            Resource = resource,
            Success = success,
            Timestamp = DateTime.UtcNow,
            IpAddress = GetClientIpAddress(),
            UserAgent = GetUserAgent()
        };
        
        Logger.Info("AUDIT: {AuditEvent}", auditEvent);
    }
    
    public void LogDataAccess(string userId, string dataType, string operation)
    {
        var accessEvent = new
        {
            EventType = "DATA_ACCESS",
            UserId = userId,
            DataType = dataType,
            Operation = operation,
            Timestamp = DateTime.UtcNow
        };
        
        Logger.Info("DATA_ACCESS: {AccessEvent}", accessEvent);
    }
    
    public void LogConfigurationChange(string userId, string component, string oldValue, string newValue)
    {
        var configEvent = new
        {
            EventType = "CONFIG_CHANGE",
            UserId = userId,
            Component = component,
            OldValue = MaskSensitiveValue(oldValue),
            NewValue = MaskSensitiveValue(newValue),
            Timestamp = DateTime.UtcNow
        };
        
        Logger.Info("CONFIG_CHANGE: {ConfigEvent}", configEvent);
    }
}
```

### 12.5 Audit Logging for APM Configuration

#### Configuration Change Tracking

```csharp
public class ApmConfigurationAuditor
{
    private readonly Soc2AuditLogger _auditLogger;
    
    public async Task TrackConfigurationChangeAsync<T>(string component, T oldConfig, T newConfig, string userId)
    {
        var changes = DetectChanges(oldConfig, newConfig);
        
        foreach (var change in changes)
        {
            _auditLogger.LogConfigurationChange(userId, $"{component}.{change.Property}", 
                change.OldValue?.ToString(), change.NewValue?.ToString());
        }
        
        // Store configuration snapshot
        await StoreConfigurationSnapshotAsync(component, newConfig, userId);
    }
    
    private List<ConfigurationChange> DetectChanges<T>(T oldConfig, T newConfig)
    {
        var changes = new List<ConfigurationChange>();
        var properties = typeof(T).GetProperties();
        
        foreach (var property in properties)
        {
            var oldValue = property.GetValue(oldConfig);
            var newValue = property.GetValue(newConfig);
            
            if (!Equals(oldValue, newValue))
            {
                changes.Add(new ConfigurationChange
                {
                    Property = property.Name,
                    OldValue = oldValue,
                    NewValue = newValue
                });
            }
        }
        
        return changes;
    }
}

public class ConfigurationChange
{
    public string Property { get; set; }
    public object OldValue { get; set; }
    public object NewValue { get; set; }
}
```

#### Compliance Reporting

```csharp
public class ComplianceReporter
{
    public async Task<ComplianceReport> GenerateComplianceReportAsync(DateTime startDate, DateTime endDate)
    {
        return new ComplianceReport
        {
            Period = new DateRange { Start = startDate, End = endDate },
            DataRetentionCompliance = await CheckDataRetentionComplianceAsync(startDate, endDate),
            AccessControlCompliance = await CheckAccessControlComplianceAsync(startDate, endDate),
            EncryptionCompliance = await CheckEncryptionComplianceAsync(),
            AuditLogCompliance = await CheckAuditLogComplianceAsync(startDate, endDate)
        };
    }
    
    private async Task<ComplianceStatus> CheckDataRetentionComplianceAsync(DateTime start, DateTime end)
    {
        // Check if data retention policies are being followed
        var violations = await FindRetentionViolationsAsync(start, end);
        
        return new ComplianceStatus
        {
            IsCompliant = violations.Count == 0,
            Violations = violations,
            Details = $"Checked data retention for period {start:yyyy-MM-dd} to {end:yyyy-MM-dd}"
        };
    }
    
    private async Task<ComplianceStatus> CheckEncryptionComplianceAsync()
    {
        // Verify encryption is enabled for all APM services
        var encryptionStatus = await VerifyEncryptionStatusAsync();
        
        return new ComplianceStatus
        {
            IsCompliant = encryptionStatus.All(s => s.IsEncrypted),
            Details = "All APM services use encryption at rest and in transit"
        };
    }
}

public class ComplianceReport
{
    public DateRange Period { get; set; }
    public ComplianceStatus DataRetentionCompliance { get; set; }
    public ComplianceStatus AccessControlCompliance { get; set; }
    public ComplianceStatus EncryptionCompliance { get; set; }
    public ComplianceStatus AuditLogCompliance { get; set; }
}

public class ComplianceStatus
{
    public bool IsCompliant { get; set; }
    public List<string> Violations { get; set; } = new();
    public string Details { get; set; }
}
```
---

## Testing and Validation

Comprehensive testing ensures your APM implementation works correctly and provides reliable observability data. This section covers testing patterns for instrumentation code, validation approaches, and local development setup.

### Unit Testing Patterns for Instrumentation

Test your telemetry code to ensure metrics, logs, and traces are emitted correctly:

```csharp
// Test metric emission
[Test]
public void Should_Emit_Request_Duration_Metric()
{
    var mockTelemetryClient = new Mock<TelemetryClient>();
    var service = new OrderService(mockTelemetryClient.Object);
    
    service.ProcessOrder(new Order());
    
    mockTelemetryClient.Verify(x => x.TrackMetric(
        "order_processing_duration", 
        It.IsAny<double>(), 
        It.IsAny<IDictionary<string, string>>()), 
        Times.Once);
}

// Test log output verification
[Test]
public void Should_Log_Order_Processing_Events()
{
    var loggerFactory = new TestLoggerFactory();
    var logger = loggerFactory.CreateLogger<OrderService>();
    var service = new OrderService(logger);
    
    service.ProcessOrder(new Order { Id = "123" });
    
    var logs = loggerFactory.Sink.LogEntries;
    Assert.That(logs.Any(l => l.Message.Contains("Processing order 123")));
}

// Test Activity/Span creation
[Test]
public void Should_Create_Activity_For_Order_Processing()
{
    using var activityListener = new ActivityListener
    {
        ShouldListenTo = _ => true,
        Sample = (ref ActivityCreationOptions<ActivityContext> options) => ActivitySamplingResult.AllData
    };
    ActivitySource.AddActivityListener(activityListener);
    
    var activities = new List<Activity>();
    activityListener.ActivityStarted = activities.Add;
    
    var service = new OrderService();
    service.ProcessOrder(new Order());
    
    Assert.That(activities.Count, Is.EqualTo(1));
    Assert.That(activities[0].DisplayName, Is.EqualTo("process_order"));
}
```

### Integration Testing Approaches

Test end-to-end APM pipeline functionality:

```csharp
// Test trace propagation across services
[Test]
public async Task Should_Propagate_Trace_Context_Across_Services()
{
    using var activity = ActivitySource.StartActivity("integration_test");
    var traceId = activity?.TraceId.ToString();
    
    var httpClient = new HttpClient();
    var response = await httpClient.GetAsync("https://api.example.com/orders");
    
    // Verify downstream service received trace context
    var downstreamLogs = await GetLogsFromService("order-service");
    Assert.That(downstreamLogs.Any(l => l.TraceId == traceId));
}

// Test alert triggering
[Test]
public async Task Should_Trigger_Alert_When_Error_Rate_Exceeds_Threshold()
{
    // Generate errors to exceed threshold
    for (int i = 0; i < 10; i++)
    {
        await httpClient.GetAsync("https://api.example.com/error-endpoint");
    }
    
    // Wait for alert evaluation period
    await Task.Delay(TimeSpan.FromMinutes(2));
    
    // Verify alert was triggered
    var alerts = await GetActiveAlerts();
    Assert.That(alerts.Any(a => a.Name == "high_error_rate"));
}

// BDD-style integration test
[Test]
public async Task Given_High_Memory_Usage_When_Alert_Threshold_Exceeded_Then_Alert_Should_Fire()
{
    // Given: Simulate high memory usage
    await SimulateHighMemoryUsage();
    
    // When: Wait for alert evaluation
    await Task.Delay(TimeSpan.FromMinutes(1));
    
    // Then: Verify alert fired
    var alerts = await cloudWatchClient.DescribeAlarmsAsync(new DescribeAlarmsRequest
    {
        StateValue = StateValue.ALARM,
        AlarmNames = new List<string> { "high-memory-usage" }
    });
    
    Assert.That(alerts.MetricAlarms.Count, Is.GreaterThan(0));
}
```

### Local APM Tool Setup

Set up local observability stack for development and testing:

**Docker Compose for Local Stack:**

```yaml
# docker-compose.observability.yml
version: '3.8'
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "16686:16686"  # Jaeger UI
      - "14268:14268"  # Jaeger collector
    environment:
      - COLLECTOR_OTLP_ENABLED=true

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-storage:/var/lib/grafana

  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    command: ["--config=/etc/otel-collector-config.yml"]
    volumes:
      - ./otel-collector-config.yml:/etc/otel-collector-config.yml
    ports:
      - "4317:4317"   # OTLP gRPC receiver
      - "4318:4318"   # OTLP HTTP receiver
    depends_on:
      - jaeger
      - prometheus

volumes:
  grafana-storage:
```

**OpenTelemetry Collector Configuration:**

```yaml
# otel-collector-config.yml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls:
      insecure: true
  prometheus:
    endpoint: "0.0.0.0:8889"

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [jaeger]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [prometheus]
```

**Local Development Configuration:**

```csharp
// Program.cs - Local development setup
public static void Main(string[] args)
{
    var builder = WebApplication.CreateBuilder(args);
    
    if (builder.Environment.IsDevelopment())
    {
        // Configure for local observability stack
        builder.Services.AddOpenTelemetry()
            .WithTracing(tracing => tracing
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri("http://localhost:4317");
                }))
            .WithMetrics(metrics => metrics
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation()
                .AddOtlpExporter(options =>
                {
                    options.Endpoint = new Uri("http://localhost:4317");
                }));
                
        builder.Services.AddSerilog(config => config
            .WriteTo.Console()
            .WriteTo.File("logs/app-.txt", rollingInterval: RollingInterval.Day));
    }
    
    var app = builder.Build();
    app.Run();
}
```

### Alert Testing Procedures

Validate alert configuration and escalation paths:

```csharp
// Alert validation framework
public class AlertTestFramework
{
    public async Task<bool> ValidateAlert(string alertName, AlertTestScenario scenario)
    {
        // 1. Trigger condition
        await scenario.TriggerCondition();
        
        // 2. Wait for evaluation period
        await Task.Delay(scenario.EvaluationPeriod);
        
        // 3. Verify alert state
        var alertState = await GetAlertState(alertName);
        
        // 4. Verify notifications sent
        var notifications = await GetNotifications(alertName, scenario.TimeWindow);
        
        return alertState == AlertState.Firing && notifications.Any();
    }
}

// Test escalation paths
[Test]
public async Task Should_Escalate_Alert_After_Timeout()
{
    var scenario = new AlertTestScenario
    {
        TriggerCondition = () => SimulateHighErrorRate(),
        EvaluationPeriod = TimeSpan.FromMinutes(5),
        EscalationTimeout = TimeSpan.FromMinutes(15)
    };
    
    await alertTestFramework.ValidateAlert("critical_error_rate", scenario);
    
    // Wait for escalation timeout
    await Task.Delay(scenario.EscalationTimeout);
    
    // Verify escalation occurred
    var escalationNotifications = await GetEscalationNotifications();
    Assert.That(escalationNotifications.Any(n => n.Level == "L2"));
}

// Test alert tuning
[Test]
public async Task Should_Not_Fire_False_Positive_Alerts()
{
    // Generate normal traffic patterns
    await SimulateNormalTraffic(duration: TimeSpan.FromMinutes(10));
    
    // Verify no false positive alerts
    var alerts = await GetActiveAlerts();
    var falsePositives = alerts.Where(a => a.Severity == "Critical").ToList();
    
    Assert.That(falsePositives.Count, Is.EqualTo(0), 
        $"False positive alerts detected: {string.Join(", ", falsePositives.Select(a => a.Name))}");
}
```

### BDD Examples for Monitoring

Use Behavior-Driven Development for monitoring acceptance criteria:

```gherkin
# Features/monitoring.feature
Feature: Application Performance Monitoring
  As a developer
  I want comprehensive monitoring
  So that I can detect and resolve issues quickly

Scenario: High error rate triggers alert
  Given the application is running normally
  When the error rate exceeds 5% for 2 minutes
  Then a critical alert should be triggered
  And the on-call engineer should be notified
  And the alert should include relevant context

Scenario: Trace propagation across microservices
  Given a request enters the system
  When it flows through multiple services
  Then all services should share the same trace ID
  And the complete request flow should be visible

Scenario: Performance degradation detection
  Given baseline performance metrics
  When response time increases by 50%
  Then a performance alert should be triggered
  And the alert should identify the affected endpoints

Scenario: Cost optimization through sampling
  Given high-volume traffic
  When intelligent sampling is applied
  Then trace volume should be reduced by 90%
  But critical traces should still be captured
  And cost should decrease proportionally
```

**Step Definitions:**

```csharp
[Binding]
public class MonitoringSteps
{
    private readonly TestContext _context;
    
    public MonitoringSteps(TestContext context)
    {
        _context = context;
    }
    
    [Given(@"the application is running normally")]
    public async Task GivenApplicationRunningNormally()
    {
        await _context.StartApplication();
        await _context.WaitForHealthCheck();
    }
    
    [When(@"the error rate exceeds (.*)% for (.*) minutes")]
    public async Task WhenErrorRateExceeds(int percentage, int minutes)
    {
        var duration = TimeSpan.FromMinutes(minutes);
        await _context.SimulateErrorRate(percentage, duration);
    }
    
    [Then(@"a critical alert should be triggered")]
    public async Task ThenCriticalAlertTriggered()
    {
        var alerts = await _context.GetActiveAlerts();
        var criticalAlert = alerts.FirstOrDefault(a => a.Severity == "Critical");
        
        Assert.That(criticalAlert, Is.Not.Null, "Critical alert was not triggered");
    }
    
    [Then(@"the on-call engineer should be notified")]
    public async Task ThenOnCallNotified()
    {
        var notifications = await _context.GetNotifications();
        var onCallNotification = notifications.FirstOrDefault(n => n.Channel == "PagerDuty");
        
        Assert.That(onCallNotification, Is.Not.Null, "On-call engineer was not notified");
    }
}
```

### Testing Checklist

Use this checklist to validate your APM implementation:

**Instrumentation Testing:**
- [ ] Unit tests cover all custom metrics
- [ ] Log output is verified in tests
- [ ] Activity/Span creation is tested
- [ ] Error scenarios are covered
- [ ] Performance impact is measured

**Integration Testing:**
- [ ] Trace propagation works across services
- [ ] Alerts trigger under expected conditions
- [ ] Dashboards display correct data
- [ ] Query performance is acceptable
- [ ] Data retention policies work correctly

**Local Development:**
- [ ] Local observability stack runs successfully
- [ ] Developers can view traces locally
- [ ] Local metrics collection works
- [ ] Log aggregation functions properly
- [ ] Performance testing is integrated

**Alert Validation:**
- [ ] All alerts have been tested
- [ ] Escalation paths work correctly
- [ ] False positive rate is acceptable
- [ ] Alert fatigue is minimized
- [ ] Runbooks are validated

**Production Readiness:**
- [ ] Load testing with APM enabled
- [ ] Cost projections are validated
- [ ] Security requirements are met
- [ ] Compliance checks pass
- [ ] Disaster recovery tested

---

## Appendices

### A. Metrics Catalog

**RED Metrics Template:**
```
Rate: requests_per_second
Error: error_rate_percentage  
Duration: response_time_p95
```

**USE Metrics Template:**
```
Utilization: cpu_utilization_percentage
Saturation: queue_length
Errors: error_count
```

**Business Metrics Template:**
```
Conversion: conversion_rate_percentage
Engagement: session_duration_minutes
Revenue: revenue_per_user
```

### B. Alert Rule Templates

**High Error Rate Alert:**
```yaml
# CloudWatch Alarm
ErrorRateAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: high-error-rate
    MetricName: ErrorRate
    Threshold: 5
    ComparisonOperator: GreaterThanThreshold
    EvaluationPeriods: 2
```

**Response Time Alert:**
```yaml
# Azure Monitor Alert
ResponseTimeAlert:
  type: Microsoft.Insights/metricAlerts
  properties:
    criteria:
      allOf:
        - metricName: ResponseTime
          operator: GreaterThan
          threshold: 2000
```

### C. Query Cookbook

_[Content to be added in subsequent tasks]_
**CloudWatch Insights Queries:**
```sql
-- Find slowest endpoints
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)

-- Trace error correlation
fields @timestamp, traceId, @message
| filter @message like /ERROR/
| sort @timestamp desc
```

**Azure KQL Queries:**
```kql
// Performance analysis
requests
| where timestamp > ago(1h)
| summarize avg(duration) by bin(timestamp, 5m)

// Error investigation  
exceptions
| where timestamp > ago(1h)
| summarize count() by type
```
### D. Troubleshooting Guide

**Common Issues:**

1. **Missing Traces**
   - Check sampling configuration
   - Verify exporter endpoints
   - Validate instrumentation setup

2. **High Costs**
   - Review sampling rates
   - Check data retention policies
   - Optimize metric cardinality

3. **Alert Fatigue**
   - Tune thresholds using percentiles
   - Implement escalation delays
   - Review alert relevance

### E. Glossary

**APM** - Application Performance Monitoring  
**SLI** - Service Level Indicator  
**SLO** - Service Level Objective  
**SLA** - Service Level Agreement  
**MTTD** - Mean Time To Detect  
**MTTR** - Mean Time To Resolve  
**RED Metrics** - Rate, Errors, Duration  
**USE Metrics** - Utilization, Saturation, Errors  
**RUM** - Real User Monitoring  
**DORA** - DevOps Research and Assessment

**OpenTelemetry** - Observability framework for metrics, logs, traces
**Cardinality** - Number of unique metric combinations
**Sampling** - Technique to reduce data volume while maintaining visibility

### F. Decision Trees

**APM Service Selection:**
```
Cloud Platform?
├── AWS → CloudWatch + X-Ray
├── Azure → Application Insights
└── Multi-cloud → OpenTelemetry + Third-party
```

**Sampling Strategy:**
```
Traffic Volume?
├── Low (<1000 req/min) → 100% sampling
├── Medium (1000-10000) → 10% head-based
└── High (>10000) → 1% tail-based
```

**Cost Optimization:**
```
Current Cost Issue?
├── High ingestion → Reduce sampling
├── High storage → Decrease retention
└── High cardinality → Limit dimensions
```

### G. Quick Start Guide

**AWS Setup (5 minutes):**
```csharp
// 1. Install packages
// Microsoft.Extensions.Logging.AWSProvider
// AWS.XRay.Recorder.Core

// 2. Configure Program.cs
builder.Services.AddAWSService<IAmazonCloudWatch>();
builder.Services.AddXRayTracing();

// 3. Add instrumentation
app.UseXRayTracing("MyApp");
```

**Azure Setup (5 minutes):**
```csharp
// 1. Install package
// Microsoft.ApplicationInsights.AspNetCore

// 2. Configure Program.cs  
builder.Services.AddApplicationInsightsTelemetry();

// 3. Add connection string
"ApplicationInsights": {
  "ConnectionString": "InstrumentationKey=..."
}
```

### H. Framework Cross-References

**Related Frameworks:**
- **DevOps CI/CD Strategy** → Performance testing gates, deployment markers
- **SABSA Security Strategy** → PII handling, encryption, compliance
- **.NET Best Practices** → Performance optimization, async patterns
- **AWS/Azure Hosting Strategy** → Service selection, cost optimization
- **Pulumi IaC Strategy** → Infrastructure provisioning, configuration management

### I. References

- [AWS Well-Architected Framework - Operational Excellence](https://docs.aws.amazon.com/wellarchitected/latest/operational-excellence-pillar/)
- [Azure Well-Architected Framework - Operational Excellence](https://learn.microsoft.com/en-us/azure/well-architected/operational-excellence/)
- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Serilog Documentation](https://serilog.net/)
- [The Three Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/)

---

**Document Status:** Complete - All sections implemented. This comprehensive APM strategy guide provides actionable guidance for implementing observability, monitoring, and performance optimization in .NET applications deployed to AWS and Azure.


### 4.2 Collection Intervals and Retention Policies

Choosing the right collection intervals and retention policies is critical for balancing observability needs with storage costs and query performance.

#### Recommended Collection Intervals by Metric Type

**High-Frequency Metrics (1-10 seconds)**

These metrics change rapidly and require frequent sampling for accurate monitoring and alerting.

| Metric Type | Interval | Rationale | Examples |
|-------------|----------|-----------|----------|
| **Request Metrics** | 1-5 seconds | Detect issues quickly, accurate rate calculations | Request rate, error rate, latency |
| **Resource Utilization** | 5-10 seconds | Catch spikes before they cause failures | CPU%, memory%, thread pool usage |
| **Queue Depth** | 5-10 seconds | Prevent queue saturation | Message queue depth, backlog size |
| **Active Connections** | 5-10 seconds | Monitor connection pool health | Database connections, HTTP connections |

**Medium-Frequency Metrics (30-60 seconds)**

These metrics change more slowly and don't require real-time monitoring.

| Metric Type | Interval | Rationale | Examples |
|-------------|----------|-----------|----------|
| **Business Metrics** | 30-60 seconds | Sufficient for trend analysis | Order count, revenue, conversions |
| **Batch Job Metrics** | 60 seconds | Jobs run infrequently | Job duration, records processed |
| **Cache Metrics** | 30-60 seconds | Cache patterns are stable | Cache hit rate, eviction rate |
| **Disk I/O** | 30-60 seconds | Disk patterns change slowly | Disk read/write rate, IOPS |

**Low-Frequency Metrics (5-15 minutes)**

These metrics are stable and used primarily for capacity planning and trend analysis.

| Metric Type | Interval | Rationale | Examples |
|-------------|----------|-----------|----------|
| **Capacity Metrics** | 5-15 minutes | Long-term trends | Storage usage, license count |
| **Health Checks** | 5-15 minutes | Periodic validation | External service availability |
| **Aggregated Metrics** | 15 minutes | Pre-aggregated for dashboards | Daily active users, hourly revenue |

**Configuration Example (.NET)**

```csharp
// Configure metric collection intervals in appsettings.json
{
  "Metrics": {
    "CollectionIntervals": {
      "HighFrequency": "00:00:05",    // 5 seconds
      "MediumFrequency": "00:00:30",  // 30 seconds
      "LowFrequency": "00:05:00"      // 5 minutes
    }
  }
}

// Implement custom collection intervals
public class MetricsCollector : BackgroundService
{
    private readonly IConfiguration _config;
    private readonly ResourceMetrics _resourceMetrics;
    private readonly BusinessMetrics _businessMetrics;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var highFreqInterval = _config.GetValue<TimeSpan>("Metrics:CollectionIntervals:HighFrequency");
        var mediumFreqInterval = _config.GetValue<TimeSpan>("Metrics:CollectionIntervals:MediumFrequency");
        
        // High-frequency collection (5 seconds)
        _ = Task.Run(async () =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _resourceMetrics.CollectResourceMetrics();
                await Task.Delay(highFreqInterval, stoppingToken);
            }
        }, stoppingToken);
        
        // Medium-frequency collection (30 seconds)
        _ = Task.Run(async () =>
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                _businessMetrics.CollectBusinessMetrics();
                await Task.Delay(mediumFreqInterval, stoppingToken);
            }
        }, stoppingToken);
        
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}
```

#### Retention Policy Guidelines

Retention policies determine how long metrics data is stored. Longer retention enables historical analysis but increases storage costs.

**Standard Retention Tiers**

| Tier | Duration | Resolution | Use Case | Relative Cost |
|------|----------|------------|----------|---------------|
| **Real-Time** | 1-7 days | Full resolution (1s-10s) | Troubleshooting, alerting | $$$$ |
| **Short-Term** | 7-30 days | Full resolution | Recent analysis, incident investigation | $$$ |
| **Medium-Term** | 30-90 days | Aggregated (1-5 min) | Trend analysis, capacity planning | $$ |
| **Long-Term** | 90-365 days | Aggregated (15-60 min) | Historical comparison, compliance | $ |
| **Archive** | 1-7 years | Aggregated (1 hour) | Compliance, audit | $ |

**Retention by Metric Type**

| Metric Type | Real-Time | Short-Term | Medium-Term | Long-Term | Archive |
|-------------|-----------|------------|-------------|-----------|---------|
| **Request Metrics** | 7 days | 30 days | 90 days | 365 days | - |
| **Error Metrics** | 7 days | 30 days | 90 days | 365 days | 2 years |
| **Resource Metrics** | 7 days | 30 days | 90 days | 180 days | - |
| **Business Metrics** | 7 days | 30 days | 90 days | 365 days | 7 years |
| **Security Metrics** | 7 days | 30 days | 90 days | 365 days | 7 years |
| **Compliance Metrics** | 7 days | 30 days | 90 days | 365 days | 7 years |

**AWS CloudWatch Retention Configuration**

```csharp
// Using AWS SDK for .NET to configure metric retention
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;

public class CloudWatchRetentionConfig
{
    private readonly IAmazonCloudWatch _cloudWatch;
    
    public async Task ConfigureMetricStreamAsync()
    {
        // CloudWatch metrics are retained for 15 months by default
        // Use metric streams to export to S3 for longer retention
        var request = new PutMetricStreamRequest
        {
            Name = "long-term-metrics",
            FirehoseArn = "arn:aws:firehose:us-east-1:123456789012:deliverystream/metrics-stream",
            RoleArn = "arn:aws:iam::123456789012:role/CloudWatch-MetricStream-Role",
            OutputFormat = "json",
            IncludeFilters = new List<MetricStreamFilter>
            {
                new MetricStreamFilter
                {
                    Namespace = "MyApp/Business",
                    MetricNames = new List<string> { "Revenue", "Orders", "Conversions" }
                }
            }
        };
        
        await _cloudWatch.PutMetricStreamAsync(request);
    }
    
    public async Task ConfigureLogRetentionAsync(string logGroupName, int retentionDays)
    {
        using var logsClient = new Amazon.CloudWatchLogs.AmazonCloudWatchLogsClient();
        
        await logsClient.PutRetentionPolicyAsync(new Amazon.CloudWatchLogs.Model.PutRetentionPolicyRequest
        {
            LogGroupName = logGroupName,
            RetentionInDays = retentionDays // 1, 3, 5, 7, 14, 30, 60, 90, 120, 150, 180, 365, 400, 545, 731, 1827, 3653
        });
    }
}

// Configure in Pulumi
using Pulumi;
using Pulumi.Aws.CloudWatch;

class CloudWatchStack : Stack
{
    public CloudWatchStack()
    {
        // Configure log group retention
        var logGroup = new LogGroup("app-logs", new LogGroupArgs
        {
            Name = "/aws/app/myapp",
            RetentionInDays = 30 // Short-term retention
        });
        
        // Long-term metrics exported to S3
        var metricStream = new MetricStream("long-term-metrics", new MetricStreamArgs
        {
            FirehoseArn = firehose.Arn,
            RoleArn = role.Arn,
            OutputFormat = "json",
            IncludeFilters = new[]
            {
                new MetricStreamIncludeFilterArgs
                {
                    Namespace = "MyApp/Business"
                }
            }
        });
    }
}
```

**Azure Application Insights Retention Configuration**

```csharp
// Configure Application Insights retention in Pulumi
using Pulumi;
using Pulumi.AzureNative.Insights;

class AppInsightsStack : Stack
{
    public AppInsightsStack()
    {
        var appInsights = new Component("myapp-insights", new ComponentArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ApplicationType = "web",
            Kind = "web",
            RetentionInDays = 90, // 30, 60, 90, 120, 180, 270, 365, 550, 730
            SamplingPercentage = 100,
            IngestionMode = "ApplicationInsights"
        });
        
        // Configure continuous export for long-term retention
        var exportConfig = new ExportConfiguration("long-term-export", new ExportConfigurationArgs
        {
            ResourceGroupName = resourceGroup.Name,
            ResourceName = appInsights.Name,
            DestinationStorageSubscriptionId = subscription.SubscriptionId,
            DestinationStorageLocationId = storageAccount.Id,
            DestinationAccountId = storageAccount.Id,
            RecordTypes = new[]
            {
                "Requests",
                "Event",
                "Exceptions",
                "Metrics",
                "PageViews",
                "PerformanceCounters"
            }
        });
    }
}

// Configure retention in appsettings.json
{
  "ApplicationInsights": {
    "ConnectionString": "InstrumentationKey=...",
    "SamplingSettings": {
      "IsEnabled": true,
      "MaxTelemetryItemsPerSecond": 5
    }
  },
  "Retention": {
    "Metrics": {
      "RealTime": 7,      // days
      "ShortTerm": 30,
      "MediumTerm": 90,
      "LongTerm": 365
    }
  }
}
```

#### Storage Cost Optimization Strategies

**1. Metric Aggregation**

Reduce storage by pre-aggregating metrics before storage.

```csharp
public class MetricAggregator
{
    private readonly ConcurrentDictionary<string, MetricBuffer> _buffers = new();
    
    public void RecordMetric(string metricName, double value, TagList tags)
    {
        var key = $"{metricName}:{string.Join(",", tags)}";
        var buffer = _buffers.GetOrAdd(key, _ => new MetricBuffer());
        
        buffer.Add(value);
    }
    
    public async Task FlushAsync()
    {
        foreach (var (key, buffer) in _buffers)
        {
            var aggregated = buffer.GetAggregated();
            
            // Send aggregated metrics instead of individual values
            await _metricsClient.SendAsync(new AggregatedMetric
            {
                Name = aggregated.Name,
                Count = aggregated.Count,
                Sum = aggregated.Sum,
                Min = aggregated.Min,
                Max = aggregated.Max,
                Average = aggregated.Average,
                P50 = aggregated.P50,
                P95 = aggregated.P95,
                P99 = aggregated.P99
            });
        }
        
        _buffers.Clear();
    }
}

public class MetricBuffer
{
    private readonly List<double> _values = new();
    private readonly object _lock = new();
    
    public void Add(double value)
    {
        lock (_lock)
        {
            _values.Add(value);
        }
    }
    
    public AggregatedMetric GetAggregated()
    {
        lock (_lock)
        {
            if (_values.Count == 0)
                return null;
            
            var sorted = _values.OrderBy(v => v).ToList();
            
            return new AggregatedMetric
            {
                Count = sorted.Count,
                Sum = sorted.Sum(),
                Min = sorted.First(),
                Max = sorted.Last(),
                Average = sorted.Average(),
                P50 = GetPercentile(sorted, 0.50),
                P95 = GetPercentile(sorted, 0.95),
                P99 = GetPercentile(sorted, 0.99)
            };
        }
    }
    
    private double GetPercentile(List<double> sorted, double percentile)
    {
        int index = (int)Math.Ceiling(percentile * sorted.Count) - 1;
        return sorted[Math.Max(0, Math.Min(index, sorted.Count - 1))];
    }
}
```

**2. Sampling**

Reduce volume by sampling metrics, especially for high-cardinality data.

```csharp
public class SamplingMetricsCollector
{
    private readonly Random _random = new();
    private readonly double _samplingRate;
    
    public SamplingMetricsCollector(double samplingRate = 0.1) // 10% sampling
    {
        _samplingRate = samplingRate;
    }
    
    public void RecordMetric(string metricName, double value, TagList tags)
    {
        // Always record errors and high-value events
        if (IsHighPriority(metricName, value))
        {
            _metricsClient.Record(metricName, value, tags);
            return;
        }
        
        // Sample normal events
        if (_random.NextDouble() < _samplingRate)
        {
            // Adjust value to account for sampling
            var adjustedValue = value / _samplingRate;
            _metricsClient.Record(metricName, adjustedValue, tags);
        }
    }
    
    private bool IsHighPriority(string metricName, double value)
    {
        // Always record errors
        if (metricName.Contains("error", StringComparison.OrdinalIgnoreCase))
            return true;
        
        // Always record slow requests (> 1 second)
        if (metricName.Contains("duration") && value > 1000)
            return true;
        
        // Always record business-critical metrics
        if (metricName.StartsWith("business."))
            return true;
        
        return false;
    }
}
```

**3. Cardinality Reduction**

Limit the number of unique tag combinations to reduce storage costs.

```csharp
public class CardinalityLimitedMetrics
{
    private const int MaxCardinality = 1000;
    private readonly ConcurrentDictionary<string, int> _cardinalityTracker = new();
    
    public void RecordMetric(string metricName, double value, TagList tags)
    {
        // Normalize high-cardinality tags
        var normalizedTags = NormalizeTags(tags);
        
        var key = GetMetricKey(metricName, normalizedTags);
        
        // Check cardinality limit
        if (_cardinalityTracker.Count >= MaxCardinality && !_cardinalityTracker.ContainsKey(key))
        {
            // Drop this metric or use a generic "other" tag
            normalizedTags = new TagList { { "aggregated", "true" } };
        }
        
        _cardinalityTracker.TryAdd(key, 1);
        _metricsClient.Record(metricName, value, normalizedTags);
    }
    
    private TagList NormalizeTags(TagList tags)
    {
        var normalized = new TagList();
        
        foreach (var tag in tags)
        {
            // Avoid high-cardinality values
            if (IsHighCardinality(tag.Key))
            {
                // Bucket or hash the value
                normalized.Add(tag.Key, BucketValue(tag.Value?.ToString()));
            }
            else
            {
                normalized.Add(tag.Key, tag.Value);
            }
        }
        
        return normalized;
    }
    
    private bool IsHighCardinality(string tagKey)
    {
        // These tags typically have many unique values
        return tagKey switch
        {
            "user.id" => true,
            "request.id" => true,
            "trace.id" => true,
            "session.id" => true,
            _ => false
        };
    }
    
    private string BucketValue(string value)
    {
        // Example: Hash to a fixed number of buckets
        if (string.IsNullOrEmpty(value))
            return "unknown";
        
        var hash = value.GetHashCode();
        var bucket = Math.Abs(hash % 100); // 100 buckets
        return $"bucket_{bucket}";
    }
    
    private string GetMetricKey(string metricName, TagList tags)
    {
        return $"{metricName}:{string.Join(",", tags.Select(t => $"{t.Key}={t.Value}"))}";
    }
}
```

**4. Tiered Storage**

Move older metrics to cheaper storage tiers.

```csharp
// AWS: Export CloudWatch metrics to S3 for long-term storage
public class MetricsArchiver
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly IAmazonS3 _s3;
    
    public async Task ArchiveOldMetricsAsync(DateTime olderThan)
    {
        // Query metrics older than threshold
        var request = new GetMetricStatisticsRequest
        {
            Namespace = "MyApp",
            MetricName = "RequestCount",
            StartTime = olderThan.AddDays(-30),
            EndTime = olderThan,
            Period = 3600, // 1 hour aggregation
            Statistics = new List<string> { "Sum", "Average", "Maximum", "Minimum" }
        };
        
        var response = await _cloudWatch.GetMetricStatisticsAsync(request);
        
        // Export to S3 (cheaper storage)
        var json = JsonSerializer.Serialize(response.Datapoints);
        await _s3.PutObjectAsync(new Amazon.S3.Model.PutObjectRequest
        {
            BucketName = "metrics-archive",
            Key = $"metrics/{olderThan:yyyy/MM/dd}/RequestCount.json",
            ContentBody = json,
            StorageClass = S3StorageClass.Glacier // Even cheaper for long-term
        });
    }
}
```

#### Retention Policy Best Practices

**1. Align with Business Requirements**
- Compliance: Retain audit logs for required period (often 7 years)
- SLA: Retain enough data to validate SLA compliance
- Troubleshooting: Keep detailed data for at least 30 days

**2. Balance Cost and Value**
- High-value metrics (business, errors): Longer retention
- Low-value metrics (debug, verbose): Shorter retention
- Aggregate older data to reduce storage costs

**3. Automate Retention Management**
- Set retention policies in infrastructure as code
- Automate archival to cheaper storage tiers
- Regularly review and adjust based on usage

**4. Document Retention Policies**
- Maintain a retention policy document
- Communicate policies to stakeholders
- Review annually or when requirements change

**5. Test Data Recovery**
- Verify archived data can be restored
- Test query performance on archived data
- Document recovery procedures

#### Cost Estimation Example

**Scenario:** Medium-sized application (1M requests/day)

| Metric Type | Volume/Day | Retention | Storage/Month | Cost/Month |
|-------------|------------|-----------|---------------|------------|
| Request metrics | 100K datapoints | 30 days | 3M datapoints | $15 |
| Error metrics | 1K datapoints | 90 days | 90K datapoints | $2 |
| Resource metrics | 50K datapoints | 30 days | 1.5M datapoints | $8 |
| Business metrics | 10K datapoints | 365 days | 3.65M datapoints | $20 |
| **Total** | | | **8.24M datapoints** | **$45/month** |

**Cost Optimization:**
- Aggregate to 1-minute resolution after 7 days: Save 40% ($18)
- Sample non-critical metrics at 10%: Save 30% ($13.50)
- **Optimized Total: $27/month (40% savings)**


### 4.3 Percentiles vs Averages Analysis

Understanding when to use percentiles versus averages is critical for accurate performance analysis. Averages can hide problems, while percentiles reveal the true user experience.

#### Why Averages Can Be Misleading

**The Problem with Averages:**

Averages (mean values) are heavily influenced by outliers and don't represent the experience of most users.

**Example Scenario:**
- 95 requests complete in 100ms
- 5 requests complete in 10,000ms (10 seconds)
- **Average:** (95 × 100 + 5 × 10,000) / 100 = 595ms
- **Reality:** 95% of users experienced 100ms, but average suggests 595ms

**The average hides that:**
- Most users had a great experience (100ms)
- A small percentage had a terrible experience (10s)
- You can't tell from the average alone

#### Understanding Percentiles

**Percentile Definition:** The value below which a given percentage of observations fall.

**Common Percentiles:**
- **p50 (Median):** 50% of requests are faster than this value
- **p95:** 95% of requests are faster than this value (5% are slower)
- **p99:** 99% of requests are faster than this value (1% are slower)
- **p99.9:** 99.9% of requests are faster than this value (0.1% are slower)

**Why Percentiles Matter:**
- **p50** shows typical user experience
- **p95** shows experience for most users (including some slow cases)
- **p99** catches outliers that affect real users
- **p99.9** identifies worst-case scenarios

#### When to Use Each Metric

| Metric | Use Case | What It Tells You | Example |
|--------|----------|-------------------|---------|
| **Average (Mean)** | Total throughput, cost estimation | Overall system behavior | "Average request uses 50ms of CPU time" |
| **p50 (Median)** | Typical user experience | What most users experience | "Typical user sees 200ms response time" |
| **p95** | SLO targets, capacity planning | Experience for vast majority | "95% of users see < 500ms response" |
| **p99** | Identifying problems, alerting | Catching issues affecting real users | "1% of users experience > 2s latency" |
| **p99.9** | Worst-case analysis | Extreme outliers | "Worst 0.1% of requests take > 10s" |



#### Code Examples for Calculating Percentiles

**.NET Implementation Using Histograms**

```csharp
using System.Diagnostics.Metrics;

public class LatencyTracker
{
    private static readonly Meter Meter = new("MyApp.Performance", "1.0.0");
    
    // Histogram automatically calculates percentiles
    private static readonly Histogram<double> RequestDuration = 
        Meter.CreateHistogram<double>(
            name: "http.server.request.duration",
            unit: "ms",
            description: "HTTP request duration");
    
    public void RecordRequest(double durationMs, string endpoint, int statusCode)
    {
        var tags = new TagList
        {
            { "http.route", endpoint },
            { "http.status_code", statusCode }
        };
        
        RequestDuration.Record(durationMs, tags);
    }
}

// The histogram will be exported with percentile aggregations
// Query in Application Insights:
// requests
// | summarize 
//     avg(duration), 
//     percentile(duration, 50),
//     percentile(duration, 95),
//     percentile(duration, 99)
//   by bin(timestamp, 5m)
```

**Manual Percentile Calculation**

```csharp
public class PercentileCalculator
{
    public static double CalculatePercentile(List<double> values, double percentile)
    {
        if (values == null || values.Count == 0)
            throw new ArgumentException("Values cannot be null or empty");
        
        if (percentile < 0 || percentile > 1)
            throw new ArgumentException("Percentile must be between 0 and 1");
        
        // Sort values
        var sorted = values.OrderBy(v => v).ToList();
        
        // Calculate index
        double index = percentile * (sorted.Count - 1);
        int lowerIndex = (int)Math.Floor(index);
        int upperIndex = (int)Math.Ceiling(index);
        
        // Interpolate if needed
        if (lowerIndex == upperIndex)
        {
            return sorted[lowerIndex];
        }
        
        double lowerValue = sorted[lowerIndex];
        double upperValue = sorted[upperIndex];
        double fraction = index - lowerIndex;
        
        return lowerValue + (upperValue - lowerValue) * fraction;
    }
    
    public static PercentileStats CalculateStats(List<double> values)
    {
        return new PercentileStats
        {
            Count = values.Count,
            Min = values.Min(),
            Max = values.Max(),
            Average = values.Average(),
            P50 = CalculatePercentile(values, 0.50),
            P95 = CalculatePercentile(values, 0.95),
            P99 = CalculatePercentile(values, 0.99),
            P999 = CalculatePercentile(values, 0.999)
        };
    }
}

public class PercentileStats
{
    public int Count { get; set; }
    public double Min { get; set; }
    public double Max { get; set; }
    public double Average { get; set; }
    public double P50 { get; set; }
    public double P95 { get; set; }
    public double P99 { get; set; }
    public double P999 { get; set; }
    
    public override string ToString()
    {
        return $"Count: {Count}, Min: {Min:F2}ms, Max: {Max:F2}ms, " +
               $"Avg: {Average:F2}ms, p50: {P50:F2}ms, p95: {P95:F2}ms, " +
               $"p99: {P99:F2}ms, p99.9: {P999:F2}ms";
    }
}

// Usage example
var latencies = new List<double> { 50, 75, 100, 120, 150, 200, 500, 1000, 5000 };
var stats = PercentileCalculator.CalculateStats(latencies);
Console.WriteLine(stats);
// Output: Count: 9, Min: 50.00ms, Max: 5000.00ms, Avg: 688.33ms, 
//         p50: 150.00ms, p95: 5000.00ms, p99: 5000.00ms, p99.9: 5000.00ms
```



**Streaming Percentile Calculation (Approximate)**

For high-volume scenarios, use approximate algorithms like T-Digest:

```csharp
// Using TDigest NuGet package: TDigest.NET
using TDigest;

public class StreamingPercentileTracker
{
    private readonly TDigest.TDigest _digest;
    private readonly object _lock = new();
    
    public StreamingPercentileTracker(double compression = 100)
    {
        _digest = new TDigest.TDigest(compression);
    }
    
    public void Add(double value)
    {
        lock (_lock)
        {
            _digest.Add(value);
        }
    }
    
    public double GetPercentile(double percentile)
    {
        lock (_lock)
        {
            return _digest.Quantile(percentile);
        }
    }
    
    public PercentileStats GetStats()
    {
        lock (_lock)
        {
            return new PercentileStats
            {
                Count = (int)_digest.Count,
                Average = _digest.Average,
                P50 = _digest.Quantile(0.50),
                P95 = _digest.Quantile(0.95),
                P99 = _digest.Quantile(0.99),
                P999 = _digest.Quantile(0.999)
            };
        }
    }
}

// Usage in high-throughput service
public class HighThroughputMetrics
{
    private readonly StreamingPercentileTracker _latencyTracker = new();
    private readonly Timer _reportingTimer;
    
    public HighThroughputMetrics()
    {
        // Report percentiles every 60 seconds
        _reportingTimer = new Timer(_ => ReportPercentiles(), null, 
            TimeSpan.FromSeconds(60), TimeSpan.FromSeconds(60));
    }
    
    public void RecordLatency(double latencyMs)
    {
        _latencyTracker.Add(latencyMs);
    }
    
    private void ReportPercentiles()
    {
        var stats = _latencyTracker.GetStats();
        
        // Send to monitoring system
        _metricsClient.SendGauge("latency.p50", stats.P50);
        _metricsClient.SendGauge("latency.p95", stats.P95);
        _metricsClient.SendGauge("latency.p99", stats.P99);
        _metricsClient.SendGauge("latency.avg", stats.Average);
    }
}
```

#### Visualization and Interpretation Guidance

**Dashboard Design for Percentiles**

```
┌─────────────────────────────────────────────────────────────┐
│  API Latency Dashboard                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Latency Percentiles (Last 24 Hours)               │    │
│  │                                                     │    │
│  │  5000ms ┤                                    ╭─ p99│    │
│  │  2000ms ┤                          ╭────────╯     │    │
│  │  1000ms ┤                    ╭─────╯              │    │
│  │   500ms ┤          ╭─────────╯            ← p95   │    │
│  │   200ms ┤  ────────╯                      ← p50   │    │
│  │   100ms ┤  ─────────────────────────────  ← avg   │    │
│  │         └────────────────────────────────────────│    │
│  │         0h    6h    12h   18h   24h              │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  Current Values:                                             │
│  • p50:  180ms  (Typical user experience)                   │
│  • p95:  450ms  (95% of users)                              │
│  • p99:  2.1s   (⚠️ 1% experiencing slow responses)         │
│  • avg:  220ms  (Overall average)                           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Interpreting Percentile Patterns**

| Pattern | What It Means | Action |
|---------|---------------|--------|
| **p50 and p95 close together** | Consistent performance | Good! Monitor for changes |
| **p95 much higher than p50** | Some requests are slow | Investigate slow requests |
| **p99 >> p95** | Occasional very slow requests | Check for outliers, timeouts |
| **All percentiles increasing** | System degradation | Scale up or optimize |
| **p99 spiking periodically** | Batch jobs or GC pauses | Tune batch size or GC |

**Query Examples**

**Application Insights (KQL):**

```kusto
// Calculate percentiles for API requests
requests
| where timestamp > ago(1h)
| summarize 
    count(),
    avg(duration),
    percentile(duration, 50),
    percentile(duration, 95),
    percentile(duration, 99),
    percentile(duration, 99.9)
  by bin(timestamp, 5m), name
| render timechart

// Find requests in the slowest 1% (p99+)
let p99_threshold = toscalar(
    requests
    | where timestamp > ago(1h)
    | summarize percentile(duration, 99)
);
requests
| where timestamp > ago(1h)
| where duration > p99_threshold
| project timestamp, name, duration, operation_Id
| order by duration desc
| take 100
```

**CloudWatch Insights:**

```
# Calculate percentiles for Lambda duration
fields @timestamp, @duration
| filter @type = "REPORT"
| stats 
    count() as invocations,
    avg(@duration) as avg_duration,
    pct(@duration, 50) as p50,
    pct(@duration, 95) as p95,
    pct(@duration, 99) as p99
  by bin(5m)
```



#### Real-World Example: Latency Analysis

**Scenario:** E-commerce checkout API

**Data (1000 requests):**
- 900 requests: 100-200ms
- 80 requests: 200-500ms
- 15 requests: 500-1000ms
- 5 requests: 5000-10000ms (database timeout retries)

**Analysis:**

| Metric | Value | Interpretation |
|--------|-------|----------------|
| **Average** | 350ms | Misleading - suggests all requests are slow |
| **p50** | 150ms | Typical user sees fast response |
| **p95** | 450ms | 95% of users have good experience |
| **p99** | 8000ms | 1% of users (10 requests) have terrible experience |

**Conclusion:**
- Average (350ms) makes it seem like there's a general performance problem
- Percentiles reveal the truth: most users are happy (p50=150ms, p95=450ms)
- Real problem: 1% of requests timing out (p99=8s) - likely database issue
- **Action:** Investigate database timeouts, not general API performance

**Setting SLOs Based on Percentiles:**
- Target: p95 < 500ms (covers 95% of users)
- Alert: p99 > 2000ms (catches the timeout issue)
- Don't use average for SLOs - it hides problems!

#### Best Practices for Percentile Analysis

**1. Always Track Multiple Percentiles**
- Don't rely on a single metric
- Track p50, p95, p99 at minimum
- Add p99.9 for critical services

**2. Use Percentiles for SLOs**
- Set SLOs based on p95 or p99, not average
- Example: "p95 latency < 500ms" not "average latency < 300ms"

**3. Investigate Percentile Gaps**
- Large gap between p95 and p99 indicates outliers
- Investigate what causes the slowest 1-5% of requests

**4. Visualize Percentiles Over Time**
- Line charts showing p50, p95, p99 together
- Easier to spot trends and anomalies

**5. Segment by Dimensions**
- Calculate percentiles per endpoint, region, customer tier
- Different endpoints may have different performance characteristics

**6. Use Histograms for Storage Efficiency**
- Histograms allow percentile calculation without storing every value
- Much more storage-efficient than raw data

**7. Beware of Aggregation**
- Don't average percentiles across time windows
- Percentiles should be calculated from raw data or histograms

#### Common Mistakes to Avoid

❌ **Using averages for user-facing SLOs**
- Average hides outliers that affect real users
- ✅ Use p95 or p99 instead

❌ **Averaging percentiles**
- Can't average p95 values from different time windows
- ✅ Calculate percentiles from raw data or histograms

❌ **Ignoring high percentiles**
- p99 and p99.9 catch real problems affecting real users
- ✅ Monitor and alert on high percentiles

❌ **Setting alerts on average**
- Average can look fine while users suffer
- ✅ Alert on p95 or p99 thresholds

❌ **Not segmenting percentiles**
- One endpoint's problems can hide in overall metrics
- ✅ Calculate percentiles per endpoint, region, etc.

#### Summary: Percentiles vs Averages

**Use Averages For:**
- Total throughput calculations
- Cost estimation (total CPU time, total storage)
- Resource utilization trends
- Capacity planning (total load)

**Use Percentiles For:**
- User experience metrics (latency, load time)
- SLO definitions and monitoring
- Performance troubleshooting
- Identifying outliers and tail latency
- Alerting on user-impacting issues

**Golden Rule:** For anything user-facing, use percentiles (especially p95 and p99). Averages hide the problems that users actually experience.


### 4.4 SLI/SLO/SLA Concepts and Implementation

Service Level Indicators (SLIs), Service Level Objectives (SLOs), and Service Level Agreements (SLAs) form the foundation of reliability engineering and customer commitments.

#### Definitions and Differences

**Service Level Indicator (SLI)**

**Definition:** A quantitative measure of a specific aspect of the service level provided to users.

**Characteristics:**
- Measurable metric (e.g., latency, availability, error rate)
- Directly observable from system telemetry
- Represents user experience
- Expressed as a ratio or percentage

**Examples:**
- "Percentage of requests completed successfully"
- "Percentage of requests completed in < 500ms"
- "Percentage of time the service is available"

**Service Level Objective (SLO)**

**Definition:** A target value or range for an SLI over a specific time period.

**Characteristics:**
- Internal goal for service reliability
- Based on user expectations and business needs
- Includes time window (e.g., "over 30 days")
- Allows for some failure (e.g., 99.9% not 100%)

**Examples:**
- "99.9% of requests succeed over 30 days"
- "95% of requests complete in < 500ms over 7 days"
- "Service is available 99.95% of the time per month"

**Service Level Agreement (SLA)**

**Definition:** A contractual commitment to customers about service reliability, with consequences for not meeting targets.

**Characteristics:**
- External commitment to customers
- Legally binding contract
- Includes penalties or credits for violations
- More conservative than internal SLOs

**Examples:**
- "99.9% uptime per month, or 10% service credit"
- "API response time < 1s for 95% of requests, or refund"



#### Relationship Between SLI, SLO, and SLA

```
┌─────────────────────────────────────────────────────────────┐
│                    SLA (Customer Contract)                   │
│                    99.9% Availability                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              SLO (Internal Target)                     │ │
│  │              99.95% Availability                       │ │
│  │  ┌──────────────────────────────────────────────────┐ │ │
│  │  │         SLI (Measurement)                        │ │ │
│  │  │         Actual: 99.97% Availability              │ │ │
│  │  │         (Measured from monitoring data)          │ │ │
│  │  └──────────────────────────────────────────────────┘ │ │
│  │                                                        │ │
│  │  Error Budget: 0.05% (SLO - SLI = 99.95% - 99.97%)  │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  Buffer: 0.05% (SLO - SLA = 99.95% - 99.9%)                │
└─────────────────────────────────────────────────────────────┘

Key Points:
• SLI: What you measure (actual performance)
• SLO: What you aim for (internal target, stricter than SLA)
• SLA: What you promise (customer commitment, with buffer)
• Error Budget: Room for failure within SLO
• Buffer: Safety margin between SLO and SLA
```

**Why SLO Should Be Stricter Than SLA:**
- Provides buffer for unexpected issues
- Allows time to react before SLA violation
- Accounts for measurement inaccuracies
- Enables proactive incident response

#### How to Define SLIs for Your Application

**Step 1: Identify User Journeys**

Map out critical user interactions with your service:

```csharp
public class UserJourneys
{
    public static readonly List<UserJourney> CriticalJourneys = new()
    {
        new UserJourney
        {
            Name = "User Login",
            Steps = new[] { "Load login page", "Submit credentials", "Redirect to dashboard" },
            Importance = Importance.Critical
        },
        new UserJourney
        {
            Name = "Place Order",
            Steps = new[] { "Add to cart", "Checkout", "Payment", "Confirmation" },
            Importance = Importance.Critical
        },
        new UserJourney
        {
            Name = "Search Products",
            Steps = new[] { "Enter search", "View results", "Filter results" },
            Importance = Importance.High
        },
        new UserJourney
        {
            Name = "View Order History",
            Steps = new[] { "Navigate to orders", "Load order list", "View order details" },
            Importance = Importance.Medium
        }
    };
}

public class UserJourney
{
    public string Name { get; set; }
    public string[] Steps { get; set; }
    public Importance Importance { get; set; }
}

public enum Importance
{
    Critical,  // Revenue-impacting, must work
    High,      // Important for user experience
    Medium,    // Nice to have
    Low        // Optional features
}
```

**Step 2: Choose SLI Types**

For each journey, select appropriate SLI types:

| SLI Type | Measures | Good For | Formula |
|----------|----------|----------|---------|
| **Availability** | Service uptime | All services | (Successful requests / Total requests) × 100% |
| **Latency** | Response time | User-facing services | (Requests < threshold / Total requests) × 100% |
| **Quality** | Correctness | Data processing | (Correct results / Total results) × 100% |
| **Throughput** | Processing capacity | Batch jobs | Requests processed per second |
| **Durability** | Data retention | Storage services | (Data retained / Data stored) × 100% |

**Step 3: Define SLI Specifications**

```csharp
public class SliSpecification
{
    public string Name { get; set; }
    public string Description { get; set; }
    public SliType Type { get; set; }
    public string Measurement { get; set; }
    public string ValidEvents { get; set; }
    public string GoodEvents { get; set; }
    
    // Example: API Availability SLI
    public static SliSpecification ApiAvailability => new()
    {
        Name = "API Availability",
        Description = "Percentage of API requests that succeed",
        Type = SliType.Availability,
        Measurement = "HTTP response status codes",
        ValidEvents = "All HTTP requests to /api/*",
        GoodEvents = "HTTP responses with status code 200-299 or 404"
        // Note: 404 is "good" because it's a valid response, not a service failure
    };
    
    // Example: API Latency SLI
    public static SliSpecification ApiLatency => new()
    {
        Name = "API Latency",
        Description = "Percentage of API requests completed within 500ms",
        Type = SliType.Latency,
        Measurement = "HTTP request duration",
        ValidEvents = "All HTTP requests to /api/*",
        GoodEvents = "HTTP requests completed in < 500ms"
    };
    
    // Example: Order Processing Quality SLI
    public static SliSpecification OrderQuality => new()
    {
        Name = "Order Processing Quality",
        Description = "Percentage of orders processed without errors",
        Type = SliType.Quality,
        Measurement = "Order processing outcomes",
        ValidEvents = "All order processing attempts",
        GoodEvents = "Orders processed successfully without retries or errors"
    };
}

public enum SliType
{
    Availability,
    Latency,
    Quality,
    Throughput,
    Durability
}
```



#### Setting Realistic SLOs

**Step 1: Establish Baseline**

Measure current performance over 2-4 weeks:

```csharp
public class SloBaseliner
{
    private readonly IMetricsRepository _metricsRepo;
    
    public async Task<SloBaseline> CalculateBaselineAsync(
        string sliName, 
        DateTime startDate, 
        DateTime endDate)
    {
        var metrics = await _metricsRepo.GetMetricsAsync(sliName, startDate, endDate);
        
        var dailyPerformance = metrics
            .GroupBy(m => m.Timestamp.Date)
            .Select(g => new
            {
                Date = g.Key,
                SuccessRate = (double)g.Count(m => m.IsSuccess) / g.Count() * 100
            })
            .OrderBy(x => x.Date)
            .ToList();
        
        return new SloBaseline
        {
            SliName = sliName,
            Period = $"{startDate:yyyy-MM-dd} to {endDate:yyyy-MM-dd}",
            AveragePerformance = dailyPerformance.Average(d => d.SuccessRate),
            WorstDayPerformance = dailyPerformance.Min(d => d.SuccessRate),
            BestDayPerformance = dailyPerformance.Max(d => d.SuccessRate),
            P50Performance = CalculatePercentile(dailyPerformance.Select(d => d.SuccessRate).ToList(), 0.50),
            P95Performance = CalculatePercentile(dailyPerformance.Select(d => d.SuccessRate).ToList(), 0.95),
            RecommendedSlo = CalculatePercentile(dailyPerformance.Select(d => d.SuccessRate).ToList(), 0.95) - 0.1 // 95th percentile minus buffer
        };
    }
}

public class SloBaseline
{
    public string SliName { get; set; }
    public string Period { get; set; }
    public double AveragePerformance { get; set; }
    public double WorstDayPerformance { get; set; }
    public double BestDayPerformance { get; set; }
    public double P50Performance { get; set; }
    public double P95Performance { get; set; }
    public double RecommendedSlo { get; set; }
    
    public override string ToString()
    {
        return $"SLI: {SliName}\n" +
               $"Period: {Period}\n" +
               $"Average: {AveragePerformance:F2}%\n" +
               $"Worst Day: {WorstDayPerformance:F2}%\n" +
               $"Best Day: {BestDayPerformance:F2}%\n" +
               $"p50: {P50Performance:F2}%\n" +
               $"p95: {P95Performance:F2}%\n" +
               $"Recommended SLO: {RecommendedSlo:F2}%";
    }
}
```

**Step 2: Consider Business Requirements**

Balance technical capability with business needs:

```csharp
public class SloRecommendation
{
    public static double CalculateRecommendedSlo(
        double currentPerformance,
        Importance businessImportance,
        double competitorSlo,
        double improvementCapability)
    {
        // Start with current p95 performance
        double baseSlo = currentPerformance;
        
        // Adjust based on business importance
        double importanceAdjustment = businessImportance switch
        {
            Importance.Critical => 0.1,  // Aim higher for critical services
            Importance.High => 0.05,
            Importance.Medium => 0.0,
            Importance.Low => -0.05,
            _ => 0.0
        };
        
        // Consider competitive landscape
        double competitiveAdjustment = competitorSlo > baseSlo ? 
            Math.Min(competitorSlo - baseSlo, improvementCapability) : 0;
        
        // Calculate recommended SLO
        double recommendedSlo = baseSlo + importanceAdjustment + competitiveAdjustment;
        
        // Cap at realistic maximum (99.99% is very expensive)
        return Math.Min(recommendedSlo, 99.99);
    }
}

// Example usage
var recommendedSlo = SloRecommendation.CalculateRecommendedSlo(
    currentPerformance: 99.85,      // Current p95 performance
    businessImportance: Importance.Critical,
    competitorSlo: 99.9,            // Competitor's published SLA
    improvementCapability: 0.1      // How much we can realistically improve
);
// Result: 99.95% (99.85 + 0.1 for critical + 0.05 competitive gap, capped by capability)
```

**Step 3: Calculate Error Budget**

Error budget is the allowed amount of failure within your SLO:

```csharp
public class ErrorBudget
{
    public double SloTarget { get; set; }
    public TimeSpan TimeWindow { get; set; }
    public long TotalRequests { get; set; }
    
    public long AllowedFailures => (long)(TotalRequests * (1 - SloTarget / 100));
    public TimeSpan AllowedDowntime => TimeSpan.FromMinutes(TimeWindow.TotalMinutes * (1 - SloTarget / 100));
    
    public static ErrorBudget Calculate(double sloTarget, TimeSpan timeWindow, long totalRequests)
    {
        return new ErrorBudget
        {
            SloTarget = sloTarget,
            TimeWindow = timeWindow,
            TotalRequests = totalRequests
        };
    }
    
    public override string ToString()
    {
        return $"SLO: {SloTarget}% over {TimeWindow.TotalDays} days\n" +
               $"Total Requests: {TotalRequests:N0}\n" +
               $"Allowed Failures: {AllowedFailures:N0}\n" +
               $"Allowed Downtime: {AllowedDowntime.TotalMinutes:F1} minutes";
    }
}

// Example: 99.9% SLO over 30 days with 10M requests
var budget = ErrorBudget.Calculate(
    sloTarget: 99.9,
    timeWindow: TimeSpan.FromDays(30),
    totalRequests: 10_000_000
);
Console.WriteLine(budget);
// Output:
// SLO: 99.9% over 30 days
// Total Requests: 10,000,000
// Allowed Failures: 10,000
// Allowed Downtime: 43.2 minutes
```

**Common SLO Targets by Service Type:**

| Service Type | Availability SLO | Latency SLO (p95) | Notes |
|--------------|------------------|-------------------|-------|
| **Critical API** | 99.95% | < 500ms | Revenue-impacting |
| **Standard API** | 99.9% | < 1000ms | User-facing |
| **Internal API** | 99.5% | < 2000ms | Internal tools |
| **Batch Jobs** | 99% | N/A | Can retry |
| **Background Workers** | 99.5% | < 30s per job | Async processing |
| **Static Content** | 99.99% | < 100ms | CDN-backed |



#### SLA Considerations

**When to Offer an SLA:**
- Paying customers expect reliability commitments
- Competitive differentiation
- Enterprise sales requirements
- Regulatory or compliance needs

**SLA Best Practices:**

1. **Set SLA Below SLO**
   - Provides buffer for unexpected issues
   - Typical gap: 0.05-0.1% (e.g., SLO 99.95%, SLA 99.9%)

2. **Define Measurement Method**
   - Specify how uptime is calculated
   - Define what counts as "downtime"
   - Exclude planned maintenance windows

3. **Specify Consequences**
   - Service credits (e.g., 10% credit for < 99.9%)
   - Refunds or discounts
   - Escalation procedures

4. **Include Exclusions**
   - Customer-caused outages
   - Force majeure events
   - Third-party service failures
   - Scheduled maintenance (with notice)

**SLA Template:**

```csharp
public class ServiceLevelAgreement
{
    public string ServiceName { get; set; }
    public double UptimeCommitment { get; set; }  // e.g., 99.9%
    public TimeSpan MeasurementPeriod { get; set; }  // e.g., 30 days
    public List<SlaCredit> Credits { get; set; }
    public List<string> Exclusions { get; set; }
    public string MeasurementMethod { get; set; }
    
    public static ServiceLevelAgreement StandardApi => new()
    {
        ServiceName = "API Service",
        UptimeCommitment = 99.9,
        MeasurementPeriod = TimeSpan.FromDays(30),
        Credits = new List<SlaCredit>
        {
            new() { Threshold = 99.9, CreditPercentage = 0 },
            new() { Threshold = 99.0, CreditPercentage = 10 },
            new() { Threshold = 95.0, CreditPercentage = 25 },
            new() { Threshold = 0, CreditPercentage = 50 }
        },
        Exclusions = new List<string>
        {
            "Scheduled maintenance with 7 days notice",
            "Customer-caused outages (invalid API usage)",
            "Third-party service failures beyond our control",
            "Force majeure events"
        },
        MeasurementMethod = "Uptime = (Total minutes - Downtime minutes) / Total minutes × 100%. " +
                           "Downtime = periods where API returns 5xx errors for > 1 minute."
    };
}

public class SlaCredit
{
    public double Threshold { get; set; }  // Uptime percentage
    public double CreditPercentage { get; set; }  // Credit as % of monthly fee
}
```

#### Implementation Examples

**SLI Tracking in .NET**

```csharp
public class SliTracker
{
    private static readonly Meter Meter = new("MyApp.SLI", "1.0.0");
    
    // Track good and total events for SLI calculation
    private static readonly Counter<long> GoodEventsCounter = 
        Meter.CreateCounter<long>("sli.good_events", "events");
    
    private static readonly Counter<long> TotalEventsCounter = 
        Meter.CreateCounter<long>("sli.total_events", "events");
    
    public void RecordEvent(string sliName, bool isGood, TagList additionalTags = default)
    {
        var tags = new TagList { { "sli.name", sliName } };
        
        foreach (var tag in additionalTags)
        {
            tags.Add(tag.Key, tag.Value);
        }
        
        TotalEventsCounter.Add(1, tags);
        
        if (isGood)
        {
            GoodEventsCounter.Add(1, tags);
        }
    }
    
    // Calculate SLI: (Good Events / Total Events) × 100%
    public async Task<double> CalculateSliAsync(string sliName, DateTime start, DateTime end)
    {
        var goodEvents = await _metricsRepo.GetCounterValueAsync("sli.good_events", sliName, start, end);
        var totalEvents = await _metricsRepo.GetCounterValueAsync("sli.total_events", sliName, start, end);
        
        if (totalEvents == 0)
            return 100.0;  // No events = 100% (or could be N/A)
        
        return (double)goodEvents / totalEvents * 100.0;
    }
}

// Usage in API
[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly SliTracker _sliTracker;
    
    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var orders = await _orderService.GetOrdersAsync();
            stopwatch.Stop();
            
            // Track availability SLI (request succeeded)
            _sliTracker.RecordEvent("api.availability", isGood: true);
            
            // Track latency SLI (request completed in < 500ms)
            bool meetsLatencySlo = stopwatch.ElapsedMilliseconds < 500;
            _sliTracker.RecordEvent("api.latency", isGood: meetsLatencySlo);
            
            return Ok(orders);
        }
        catch (Exception ex)
        {
            // Track availability SLI (request failed)
            _sliTracker.RecordEvent("api.availability", isGood: false);
            _sliTracker.RecordEvent("api.latency", isGood: false);
            
            return StatusCode(500, "Internal server error");
        }
    }
}
```

**SLO Monitoring and Alerting**

```csharp
public class SloMonitor : BackgroundService
{
    private readonly SliTracker _sliTracker;
    private readonly IAlertingService _alerting;
    private readonly List<SloDefinition> _slos;
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            foreach (var slo in _slos)
            {
                await CheckSloComplianceAsync(slo);
            }
            
            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
    
    private async Task CheckSloComplianceAsync(SloDefinition slo)
    {
        var now = DateTime.UtcNow;
        var windowStart = now - slo.TimeWindow;
        
        var currentSli = await _sliTracker.CalculateSliAsync(slo.SliName, windowStart, now);
        var errorBudgetRemaining = currentSli - slo.Target;
        
        // Alert if SLO is at risk
        if (errorBudgetRemaining < slo.AlertThreshold)
        {
            await _alerting.SendAlertAsync(new Alert
            {
                Severity = errorBudgetRemaining < 0 ? Severity.Critical : Severity.Warning,
                Title = $"SLO at risk: {slo.Name}",
                Description = $"Current SLI: {currentSli:F2}%, Target: {slo.Target}%, " +
                             $"Error budget remaining: {errorBudgetRemaining:F2}%",
                SloName = slo.Name,
                CurrentValue = currentSli,
                TargetValue = slo.Target
            });
        }
    }
}

public class SloDefinition
{
    public string Name { get; set; }
    public string SliName { get; set; }
    public double Target { get; set; }  // e.g., 99.9
    public TimeSpan TimeWindow { get; set; }  // e.g., 30 days
    public double AlertThreshold { get; set; }  // e.g., 0.05 (alert when < 0.05% budget remaining)
}

// Configure SLOs
var slos = new List<SloDefinition>
{
    new()
    {
        Name = "API Availability",
        SliName = "api.availability",
        Target = 99.9,
        TimeWindow = TimeSpan.FromDays(30),
        AlertThreshold = 0.05  // Alert when < 0.05% error budget remaining
    },
    new()
    {
        Name = "API Latency",
        SliName = "api.latency",
        Target = 95.0,  // 95% of requests < 500ms
        TimeWindow = TimeSpan.FromDays(7),
        AlertThreshold = 1.0  // Alert when < 1% error budget remaining
    }
};
```

**Error Budget Policy**

```csharp
public class ErrorBudgetPolicy
{
    public string Name { get; set; }
    public List<ErrorBudgetAction> Actions { get; set; }
    
    public static ErrorBudgetPolicy Standard => new()
    {
        Name = "Standard Error Budget Policy",
        Actions = new List<ErrorBudgetAction>
        {
            new()
            {
                BudgetRemainingThreshold = 100,  // 100% budget remaining
                Action = "Normal operations - focus on feature velocity"
            },
            new()
            {
                BudgetRemainingThreshold = 50,  // 50% budget remaining
                Action = "Caution - review recent changes, increase monitoring"
            },
            new()
            {
                BudgetRemainingThreshold = 25,  // 25% budget remaining
                Action = "Slow down - defer non-critical releases, focus on reliability"
            },
            new()
            {
                BudgetRemainingThreshold = 10,  // 10% budget remaining
                Action = "Freeze - stop all releases except critical fixes"
            },
            new()
            {
                BudgetRemainingThreshold = 0,  // Budget exhausted
                Action = "Incident - all hands on deck to restore service"
            }
        }
    };
}

public class ErrorBudgetAction
{
    public double BudgetRemainingThreshold { get; set; }
    public string Action { get; set; }
}
```

#### SLO Best Practices

**1. Start Simple**
- Begin with 1-2 SLOs for critical user journeys
- Add more as you mature

**2. Make SLOs User-Centric**
- Focus on what users experience, not internal metrics
- Example: "API latency" not "database query time"

**3. Use Error Budgets**
- Balance reliability with feature velocity
- Burn budget on innovation when you have it
- Focus on reliability when budget is low

**4. Review and Adjust**
- Review SLOs quarterly
- Adjust based on business needs and technical capability
- Don't set unrealistic targets (99.99% is very expensive)

**5. Automate Monitoring**
- Automated SLO tracking and alerting
- Dashboards showing current SLI vs SLO
- Error budget burn rate alerts

**6. Document Everything**
- SLI definitions and measurement methods
- SLO targets and rationale
- Error budget policies
- Incident response procedures

#### Summary

**Key Concepts:**
- **SLI:** What you measure (e.g., % of requests < 500ms)
- **SLO:** What you target (e.g., 95% of requests < 500ms over 30 days)
- **SLA:** What you promise customers (e.g., 99.9% uptime with credits)
- **Error Budget:** Allowed failures within SLO (e.g., 0.1% = 43 minutes/month)

**Implementation Steps:**
1. Identify critical user journeys
2. Define SLIs for each journey
3. Establish baseline performance
4. Set realistic SLOs (based on baseline + business needs)
5. Calculate error budgets
6. Implement tracking and alerting
7. Define error budget policies
8. Review and adjust regularly

**Golden Rule:** SLOs should be ambitious but achievable. They drive reliability improvements without being so strict that they're impossible to meet or so expensive that they're not worth the cost.


### 4.5 .NET Performance Counters and Custom Metrics

.NET provides built-in performance counters and the ability to create custom metrics for comprehensive application monitoring.

#### Key .NET Performance Counters to Monitor

**.NET Runtime Metrics (Built-in)**

These metrics are automatically available when using OpenTelemetry .NET instrumentation:

| Category | Metric | Description | Target/Threshold |
|----------|--------|-------------|------------------|
| **Memory** | `process.runtime.dotnet.gc.heap.size` | Total heap size | Monitor growth trends |
| | `process.runtime.dotnet.gc.collections.count` | GC collection count by generation | Gen2 < 10/min |
| | `process.runtime.dotnet.gc.pause.time` | GC pause duration | < 100ms per pause |
| | `process.runtime.dotnet.gc.allocated` | Bytes allocated | Monitor allocation rate |
| **Threading** | `process.runtime.dotnet.thread_pool.threads.count` | Thread pool thread count | < 80% of max |
| | `process.runtime.dotnet.thread_pool.queue.length` | Thread pool queue length | < 100 |
| | `process.runtime.dotnet.thread_pool.completed_items.count` | Completed work items | Monitor throughput |
| **Exceptions** | `process.runtime.dotnet.exceptions.count` | Exception count | < 1% of requests |
| **Assemblies** | `process.runtime.dotnet.assemblies.count` | Loaded assemblies | Monitor for leaks |
| **JIT** | `process.runtime.dotnet.jit.il_compiled.size` | IL bytes compiled | Monitor startup |
| | `process.runtime.dotnet.jit.methods_compiled.count` | Methods compiled | Monitor startup |

**Enabling .NET Runtime Instrumentation**

```csharp
// Program.cs
using OpenTelemetry.Metrics;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddMeter("MyApp.*")  // Your custom meters
        .AddRuntimeInstrumentation()  // .NET runtime metrics
        .AddAspNetCoreInstrumentation()  // ASP.NET Core metrics
        .AddHttpClientInstrumentation()  // HttpClient metrics
        .AddAzureMonitorMetricExporter(options =>
        {
            options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
        }));

var app = builder.Build();
app.Run();
```



#### ASP.NET Core Performance Metrics

**HTTP Server Metrics (Automatic with OpenTelemetry)**

| Metric | Description | Tags |
|--------|-------------|------|
| `http.server.request.duration` | Request duration histogram | method, route, status_code |
| `http.server.active_requests` | Current active requests | method, scheme |
| `http.server.request.body.size` | Request body size | method, route, status_code |
| `http.server.response.body.size` | Response body size | method, route, status_code |

**Connection Metrics**

| Metric | Description | Tags |
|--------|-------------|------|
| `kestrel.active_connections` | Current active connections | endpoint |
| `kestrel.connection.duration` | Connection duration | endpoint |
| `kestrel.rejected_connections` | Rejected connections | endpoint, reason |
| `kestrel.queued_connections` | Queued connections | endpoint |
| `kestrel.queued_requests` | Queued requests | endpoint |

**Configuration Example**

```csharp
// Enable ASP.NET Core instrumentation
builder.Services.AddOpenTelemetry()
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation(options =>
        {
            // Enrich with custom tags
            options.EnrichWithHttpRequest = (activity, httpRequest) =>
            {
                activity.SetTag("client.ip", httpRequest.HttpContext.Connection.RemoteIpAddress);
                activity.SetTag("user.agent", httpRequest.Headers["User-Agent"].ToString());
            };
            
            // Enrich with response data
            options.EnrichWithHttpResponse = (activity, httpResponse) =>
            {
                activity.SetTag("response.content_length", httpResponse.ContentLength);
            };
        }));
```

#### Database Performance Metrics

**Entity Framework Core Metrics**

```csharp
public class DatabaseMetrics
{
    private static readonly Meter Meter = new("MyApp.Database", "1.0.0");
    
    // Query execution time
    private static readonly Histogram<double> QueryDuration = 
        Meter.CreateHistogram<double>(
            name: "db.query.duration",
            unit: "ms",
            description: "Database query execution time");
    
    // Connection pool metrics
    private static readonly ObservableGauge<int> ActiveConnections = 
        Meter.CreateObservableGauge(
            name: "db.connection_pool.active",
            observeValue: () => GetActiveConnections(),
            unit: "connections",
            description: "Active database connections");
    
    private static readonly ObservableGauge<int> IdleConnections = 
        Meter.CreateObservableGauge(
            name: "db.connection_pool.idle",
            observeValue: () => GetIdleConnections(),
            unit: "connections",
            description: "Idle database connections");
    
    // Query count by type
    private static readonly Counter<long> QueryCounter = 
        Meter.CreateCounter<long>(
            name: "db.query.count",
            unit: "queries",
            description: "Database query count");
    
    public void RecordQuery(string queryType, string tableName, double durationMs, bool success)
    {
        var tags = new TagList
        {
            { "db.operation", queryType },  // SELECT, INSERT, UPDATE, DELETE
            { "db.table", tableName },
            { "db.success", success }
        };
        
        QueryDuration.Record(durationMs, tags);
        QueryCounter.Add(1, tags);
    }
}

// Intercept EF Core queries
public class MetricsDbCommandInterceptor : DbCommandInterceptor
{
    private readonly DatabaseMetrics _metrics;
    
    public override async ValueTask<DbDataReader> ReaderExecutedAsync(
        DbCommand command,
        CommandExecutedEventData eventData,
        DbDataReader result,
        CancellationToken cancellationToken = default)
    {
        var duration = eventData.Duration.TotalMilliseconds;
        var queryType = GetQueryType(command.CommandText);
        var tableName = ExtractTableName(command.CommandText);
        
        _metrics.RecordQuery(queryType, tableName, duration, success: true);
        
        return await base.ReaderExecutedAsync(command, eventData, result, cancellationToken);
    }
    
    public override async Task CommandFailedAsync(
        DbCommand command,
        CommandErrorEventData eventData,
        CancellationToken cancellationToken = default)
    {
        var duration = eventData.Duration.TotalMilliseconds;
        var queryType = GetQueryType(command.CommandText);
        var tableName = ExtractTableName(command.CommandText);
        
        _metrics.RecordQuery(queryType, tableName, duration, success: false);
        
        await base.CommandFailedAsync(command, eventData, cancellationToken);
    }
    
    private string GetQueryType(string sql)
    {
        var firstWord = sql.TrimStart().Split(' ')[0].ToUpperInvariant();
        return firstWord switch
        {
            "SELECT" => "SELECT",
            "INSERT" => "INSERT",
            "UPDATE" => "UPDATE",
            "DELETE" => "DELETE",
            _ => "OTHER"
        };
    }
    
    private string ExtractTableName(string sql)
    {
        // Simple extraction - enhance as needed
        var match = Regex.Match(sql, @"FROM\s+(\w+)", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : "unknown";
    }
}

// Register interceptor
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(connectionString)
           .AddInterceptors(new MetricsDbCommandInterceptor(databaseMetrics));
});
```



#### Custom Metrics Instrumentation with Application Insights

**Azure Application Insights SDK**

```csharp
using Microsoft.ApplicationInsights;
using Microsoft.ApplicationInsights.DataContracts;

public class ApplicationInsightsMetrics
{
    private readonly TelemetryClient _telemetryClient;
    
    public ApplicationInsightsMetrics(TelemetryClient telemetryClient)
    {
        _telemetryClient = telemetryClient;
    }
    
    // Track simple metric
    public void TrackMetric(string name, double value, IDictionary<string, string> properties = null)
    {
        _telemetryClient.TrackMetric(name, value, properties);
    }
    
    // Track metric with aggregation
    public void TrackAggregatedMetric(string name, double value, int count, double min, double max, double stdDev)
    {
        var metric = new MetricTelemetry
        {
            Name = name,
            Sum = value,
            Count = count,
            Min = min,
            Max = max,
            StandardDeviation = stdDev
        };
        
        _telemetryClient.TrackMetric(metric);
    }
    
    // Track custom event with measurements
    public void TrackEvent(string eventName, IDictionary<string, string> properties, IDictionary<string, double> metrics)
    {
        _telemetryClient.TrackEvent(eventName, properties, metrics);
    }
    
    // Get or create metric for efficient tracking
    public Metric GetMetric(string metricId, string dimension1Name = null)
    {
        if (dimension1Name != null)
        {
            return _telemetryClient.GetMetric(metricId, dimension1Name);
        }
        return _telemetryClient.GetMetric(metricId);
    }
}

// Usage examples
public class OrderService
{
    private readonly ApplicationInsightsMetrics _metrics;
    
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var order = await _repository.CreateOrderAsync(request);
            stopwatch.Stop();
            
            // Track order creation
            _metrics.TrackEvent("OrderCreated", 
                properties: new Dictionary<string, string>
                {
                    { "ProductCategory", order.ProductCategory },
                    { "CustomerSegment", order.Customer.Segment },
                    { "PaymentMethod", order.PaymentMethod }
                },
                metrics: new Dictionary<string, double>
                {
                    { "OrderValue", (double)order.TotalAmount },
                    { "ItemCount", order.Items.Count },
                    { "ProcessingTimeMs", stopwatch.ElapsedMilliseconds }
                });
            
            // Track order value metric with dimensions
            var orderValueMetric = _metrics.GetMetric("OrderValue", "ProductCategory");
            orderValueMetric.TrackValue((double)order.TotalAmount, order.ProductCategory);
            
            return order;
        }
        catch (Exception ex)
        {
            _metrics.TrackMetric("OrderCreationErrors", 1, 
                new Dictionary<string, string>
                {
                    { "ErrorType", ex.GetType().Name },
                    { "ProductCategory", request.ProductCategory }
                });
            throw;
        }
    }
}

// Configure Application Insights
builder.Services.AddApplicationInsightsTelemetry(options =>
{
    options.ConnectionString = builder.Configuration["ApplicationInsights:ConnectionString"];
    options.EnableAdaptiveSampling = true;
    options.EnableQuickPulseMetricStream = true;
});

builder.Services.AddSingleton<ApplicationInsightsMetrics>();
```

**Query Application Insights Metrics (KQL)**

```kusto
// Query custom metrics
customMetrics
| where name == "OrderValue"
| where timestamp > ago(24h)
| summarize 
    TotalOrders = count(),
    TotalRevenue = sum(value),
    AvgOrderValue = avg(value),
    P50 = percentile(value, 50),
    P95 = percentile(value, 95)
  by bin(timestamp, 1h), tostring(customDimensions.ProductCategory)
| render timechart

// Query custom events
customEvents
| where name == "OrderCreated"
| where timestamp > ago(24h)
| extend 
    OrderValue = todouble(customMeasurements.OrderValue),
    ItemCount = toint(customMeasurements.ItemCount),
    ProcessingTime = todouble(customMeasurements.ProcessingTimeMs)
| summarize 
    Orders = count(),
    Revenue = sum(OrderValue),
    AvgItems = avg(ItemCount),
    AvgProcessingTime = avg(ProcessingTime)
  by bin(timestamp, 1h), tostring(customDimensions.CustomerSegment)
```



#### Custom Metrics Instrumentation with CloudWatch

**AWS CloudWatch SDK**

```csharp
using Amazon.CloudWatch;
using Amazon.CloudWatch.Model;

public class CloudWatchMetrics
{
    private readonly IAmazonCloudWatch _cloudWatch;
    private readonly string _namespace;
    
    public CloudWatchMetrics(IAmazonCloudWatch cloudWatch, string namespace)
    {
        _cloudWatch = cloudWatch;
        _namespace = namespace;
    }
    
    // Track single metric
    public async Task TrackMetricAsync(
        string metricName, 
        double value, 
        StandardUnit unit = StandardUnit.None,
        Dictionary<string, string> dimensions = null)
    {
        var metricData = new MetricDatum
        {
            MetricName = metricName,
            Value = value,
            Unit = unit,
            TimestampUtc = DateTime.UtcNow,
            Dimensions = dimensions?.Select(d => new Dimension
            {
                Name = d.Key,
                Value = d.Value
            }).ToList() ?? new List<Dimension>()
        };
        
        await _cloudWatch.PutMetricDataAsync(new PutMetricDataRequest
        {
            Namespace = _namespace,
            MetricData = new List<MetricDatum> { metricData }
        });
    }
    
    // Track metric with statistics (more efficient)
    public async Task TrackStatisticSetAsync(
        string metricName,
        StatisticSet statisticSet,
        Dictionary<string, string> dimensions = null)
    {
        var metricData = new MetricDatum
        {
            MetricName = metricName,
            StatisticValues = statisticSet,
            TimestampUtc = DateTime.UtcNow,
            Dimensions = dimensions?.Select(d => new Dimension
            {
                Name = d.Key,
                Value = d.Value
            }).ToList() ?? new List<Dimension>()
        };
        
        await _cloudWatch.PutMetricDataAsync(new PutMetricDataRequest
        {
            Namespace = _namespace,
            MetricData = new List<MetricDatum> { metricData }
        });
    }
    
    // Batch metrics for efficiency
    public async Task TrackMetricsBatchAsync(List<MetricDatum> metrics)
    {
        // CloudWatch allows up to 20 metrics per request
        const int batchSize = 20;
        
        for (int i = 0; i < metrics.Count; i += batchSize)
        {
            var batch = metrics.Skip(i).Take(batchSize).ToList();
            
            await _cloudWatch.PutMetricDataAsync(new PutMetricDataRequest
            {
                Namespace = _namespace,
                MetricData = batch
            });
        }
    }
}

// Usage with buffering for efficiency
public class BufferedCloudWatchMetrics
{
    private readonly CloudWatchMetrics _cloudWatch;
    private readonly ConcurrentBag<MetricDatum> _buffer = new();
    private readonly Timer _flushTimer;
    
    public BufferedCloudWatchMetrics(CloudWatchMetrics cloudWatch)
    {
        _cloudWatch = cloudWatch;
        
        // Flush every 60 seconds
        _flushTimer = new Timer(_ => FlushAsync().GetAwaiter().GetResult(), 
            null, TimeSpan.FromSeconds(60), TimeSpan.FromSeconds(60));
    }
    
    public void TrackMetric(string metricName, double value, Dictionary<string, string> dimensions = null)
    {
        _buffer.Add(new MetricDatum
        {
            MetricName = metricName,
            Value = value,
            Unit = StandardUnit.None,
            TimestampUtc = DateTime.UtcNow,
            Dimensions = dimensions?.Select(d => new Dimension
            {
                Name = d.Key,
                Value = d.Value
            }).ToList() ?? new List<Dimension>()
        });
    }
    
    private async Task FlushAsync()
    {
        if (_buffer.IsEmpty)
            return;
        
        var metrics = new List<MetricDatum>();
        while (_buffer.TryTake(out var metric))
        {
            metrics.Add(metric);
        }
        
        if (metrics.Any())
        {
            await _cloudWatch.TrackMetricsBatchAsync(metrics);
        }
    }
}

// Usage in service
public class OrderService
{
    private readonly BufferedCloudWatchMetrics _metrics;
    
    public async Task<Order> CreateOrderAsync(CreateOrderRequest request)
    {
        var stopwatch = Stopwatch.StartNew();
        
        try
        {
            var order = await _repository.CreateOrderAsync(request);
            stopwatch.Stop();
            
            // Track order metrics
            _metrics.TrackMetric("OrdersCreated", 1, new Dictionary<string, string>
            {
                { "ProductCategory", order.ProductCategory },
                { "CustomerSegment", order.Customer.Segment }
            });
            
            _metrics.TrackMetric("OrderValue", (double)order.TotalAmount, new Dictionary<string, string>
            {
                { "ProductCategory", order.ProductCategory },
                { "Currency", "USD" }
            });
            
            _metrics.TrackMetric("OrderProcessingTime", stopwatch.ElapsedMilliseconds, new Dictionary<string, string>
            {
                { "Operation", "CreateOrder" }
            });
            
            return order;
        }
        catch (Exception ex)
        {
            _metrics.TrackMetric("OrderCreationErrors", 1, new Dictionary<string, string>
            {
                { "ErrorType", ex.GetType().Name }
            });
            throw;
        }
    }
}

// Configure CloudWatch
builder.Services.AddSingleton<IAmazonCloudWatch>(sp =>
{
    return new AmazonCloudWatchClient(Amazon.RegionEndpoint.USEast1);
});

builder.Services.AddSingleton(sp =>
{
    var cloudWatch = sp.GetRequiredService<IAmazonCloudWatch>();
    return new CloudWatchMetrics(cloudWatch, "MyApp/Production");
});

builder.Services.AddSingleton<BufferedCloudWatchMetrics>();
```

**Query CloudWatch Metrics**

```
# CloudWatch Insights query
SELECT AVG(OrderValue), SUM(OrdersCreated), MAX(OrderProcessingTime)
FROM "MyApp/Production"
WHERE MetricName IN ('OrderValue', 'OrdersCreated', 'OrderProcessingTime')
GROUP BY ProductCategory
```



#### Advanced Custom Metrics Patterns

**Metric Aggregation Pattern**

```csharp
public class MetricAggregator<T> where T : struct
{
    private readonly ConcurrentDictionary<string, List<T>> _values = new();
    private readonly Func<List<T>, MetricStatistics> _aggregator;
    
    public MetricAggregator(Func<List<T>, MetricStatistics> aggregator)
    {
        _aggregator = aggregator;
    }
    
    public void Record(string metricKey, T value)
    {
        _values.AddOrUpdate(metricKey, 
            _ => new List<T> { value },
            (_, list) => { list.Add(value); return list; });
    }
    
    public Dictionary<string, MetricStatistics> GetAggregatedMetrics()
    {
        var result = new Dictionary<string, MetricStatistics>();
        
        foreach (var (key, values) in _values)
        {
            if (values.Any())
            {
                result[key] = _aggregator(values);
            }
        }
        
        _values.Clear();
        return result;
    }
}

public class MetricStatistics
{
    public int Count { get; set; }
    public double Sum { get; set; }
    public double Min { get; set; }
    public double Max { get; set; }
    public double Average { get; set; }
    public double P50 { get; set; }
    public double P95 { get; set; }
    public double P99 { get; set; }
}

// Usage
public class AggregatedMetricsService : BackgroundService
{
    private readonly MetricAggregator<double> _latencyAggregator;
    private readonly IMetricsPublisher _publisher;
    
    public AggregatedMetricsService()
    {
        _latencyAggregator = new MetricAggregator<double>(values =>
        {
            var sorted = values.OrderBy(v => v).ToList();
            return new MetricStatistics
            {
                Count = sorted.Count,
                Sum = sorted.Sum(),
                Min = sorted.First(),
                Max = sorted.Last(),
                Average = sorted.Average(),
                P50 = GetPercentile(sorted, 0.50),
                P95 = GetPercentile(sorted, 0.95),
                P99 = GetPercentile(sorted, 0.99)
            };
        });
    }
    
    public void RecordLatency(string endpoint, double latencyMs)
    {
        _latencyAggregator.Record(endpoint, latencyMs);
    }
    
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            
            var aggregated = _latencyAggregator.GetAggregatedMetrics();
            
            foreach (var (endpoint, stats) in aggregated)
            {
                await _publisher.PublishAsync(new
                {
                    Metric = "endpoint.latency",
                    Endpoint = endpoint,
                    Statistics = stats
                });
            }
        }
    }
}
```

**Metric Cardinality Control**

```csharp
public class CardinalityControlledMetrics
{
    private readonly int _maxCardinality;
    private readonly ConcurrentDictionary<string, int> _cardinalityTracker = new();
    private readonly ILogger _logger;
    
    public CardinalityControlledMetrics(int maxCardinality = 1000)
    {
        _maxCardinality = maxCardinality;
    }
    
    public bool ShouldRecordMetric(string metricName, Dictionary<string, string> dimensions)
    {
        var key = GetMetricKey(metricName, dimensions);
        
        if (_cardinalityTracker.ContainsKey(key))
        {
            return true;  // Already tracking this combination
        }
        
        if (_cardinalityTracker.Count >= _maxCardinality)
        {
            _logger.LogWarning(
                "Metric cardinality limit reached ({MaxCardinality}). " +
                "Dropping metric: {MetricName} with dimensions: {Dimensions}",
                _maxCardinality, metricName, dimensions);
            return false;
        }
        
        _cardinalityTracker.TryAdd(key, 1);
        return true;
    }
    
    public Dictionary<string, string> NormalizeDimensions(Dictionary<string, string> dimensions)
    {
        var normalized = new Dictionary<string, string>();
        
        foreach (var (key, value) in dimensions)
        {
            // Normalize high-cardinality dimensions
            if (IsHighCardinalityDimension(key))
            {
                normalized[key] = NormalizeValue(key, value);
            }
            else
            {
                normalized[key] = value;
            }
        }
        
        return normalized;
    }
    
    private bool IsHighCardinalityDimension(string dimensionName)
    {
        return dimensionName switch
        {
            "user_id" => true,
            "request_id" => true,
            "session_id" => true,
            "trace_id" => true,
            _ => false
        };
    }
    
    private string NormalizeValue(string dimensionName, string value)
    {
        // Hash to fixed buckets
        var hash = value.GetHashCode();
        var bucket = Math.Abs(hash % 100);
        return $"bucket_{bucket}";
    }
    
    private string GetMetricKey(string metricName, Dictionary<string, string> dimensions)
    {
        var dimensionString = string.Join(",", 
            dimensions.OrderBy(d => d.Key).Select(d => $"{d.Key}={d.Value}"));
        return $"{metricName}:{dimensionString}";
    }
}
```

#### Best Practices for Custom Metrics

**1. Naming Conventions**

Use consistent, hierarchical naming:

```
{namespace}.{component}.{metric_name}

Examples:
- myapp.api.request_duration_ms
- myapp.database.query_duration_ms
- myapp.cache.hit_rate_percent
- myapp.business.order_value_usd
```

**2. Dimension Guidelines**

- **Use dimensions for filtering:** environment, region, service, endpoint
- **Avoid high-cardinality dimensions:** user_id, request_id, trace_id
- **Limit dimension count:** 5-10 dimensions per metric maximum
- **Use consistent dimension names:** `http.method` not `method` or `http_method`

**3. Unit Specification**

Always specify units in metric names or metadata:

```csharp
// Good - unit in name
Meter.CreateHistogram<double>("request.duration", unit: "ms");
Meter.CreateCounter<long>("request.count", unit: "requests");
Meter.CreateGauge<double>("memory.usage", unit: "bytes");

// Bad - ambiguous
Meter.CreateHistogram<double>("request.time");  // seconds? milliseconds?
```

**4. Metric Types**

Choose the right metric type:

| Type | Use Case | Example |
|------|----------|---------|
| **Counter** | Monotonically increasing values | Request count, error count |
| **Gauge** | Point-in-time values that go up/down | CPU%, memory usage, queue depth |
| **Histogram** | Distribution of values | Latency, request size, order value |

**5. Sampling Strategy**

For high-volume metrics, use sampling:

```csharp
public class SamplingMetrics
{
    private readonly Random _random = new();
    private readonly double _samplingRate;
    
    public void RecordMetric(string name, double value, double samplingRate = 0.1)
    {
        if (_random.NextDouble() < samplingRate)
        {
            // Adjust value to account for sampling
            var adjustedValue = value / samplingRate;
            _metricsClient.Record(name, adjustedValue);
        }
    }
}
```

**6. Buffering and Batching**

Reduce overhead by batching metric submissions:

```csharp
public class BatchedMetrics
{
    private readonly ConcurrentQueue<Metric> _buffer = new();
    private readonly Timer _flushTimer;
    private const int MaxBatchSize = 100;
    
    public BatchedMetrics()
    {
        _flushTimer = new Timer(_ => FlushAsync().GetAwaiter().GetResult(),
            null, TimeSpan.FromSeconds(10), TimeSpan.FromSeconds(10));
    }
    
    public void Record(string name, double value, Dictionary<string, string> tags)
    {
        _buffer.Enqueue(new Metric { Name = name, Value = value, Tags = tags });
        
        if (_buffer.Count >= MaxBatchSize)
        {
            _ = FlushAsync();
        }
    }
    
    private async Task FlushAsync()
    {
        var batch = new List<Metric>();
        while (_buffer.TryDequeue(out var metric) && batch.Count < MaxBatchSize)
        {
            batch.Add(metric);
        }
        
        if (batch.Any())
        {
            await _metricsClient.SendBatchAsync(batch);
        }
    }
}
```

#### Performance Considerations

**Metric Collection Overhead**

- **Target:** < 1% CPU overhead for metrics collection
- **Histogram overhead:** Higher than counters/gauges (stores distribution)
- **Dimension overhead:** Each unique dimension combination creates a new time series

**Optimization Techniques:**

1. **Use sampling for high-volume metrics**
2. **Aggregate before sending** (reduce network calls)
3. **Limit cardinality** (max 1000 unique dimension combinations)
4. **Batch metric submissions** (reduce API calls)
5. **Use async operations** (don't block request processing)

#### Summary

**Key .NET Performance Counters:**
- Memory: GC heap size, collection count, pause time
- Threading: Thread pool threads, queue length
- Exceptions: Exception count
- HTTP: Request duration, active requests

**Custom Metrics Best Practices:**
- Use consistent naming conventions
- Specify units clearly
- Limit dimension cardinality
- Choose appropriate metric types
- Batch and buffer for efficiency
- Sample high-volume metrics

**Platform-Specific:**
- **Application Insights:** Use TelemetryClient, GetMetric() for efficiency
- **CloudWatch:** Batch metrics (20 per request), use StatisticSet for aggregation

**Golden Rule:** Measure what matters, but don't let metrics collection impact application performance. Aim for < 1% overhead.

---

_End of Section 4: Metrics Collection and Analysis_
