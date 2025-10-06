# Design Document: Application Performance Monitoring (APM) Strategy

**Created:** 2025-10-06 | **Updated:** 2025-10-06 | **Status:** Draft

## Overview

This design defines the structure and content for a comprehensive APM strategy guide that will be added to the Pragmatic Rhino SUIT toolkit. The guide will provide developers with actionable guidance on implementing observability, monitoring, and performance optimization for .NET applications deployed to AWS and Azure cloud platforms.

The APM strategy document will complement existing framework documentation (DevOps, security, cloud hosting) by focusing specifically on application-level performance monitoring, distributed tracing, and operational excellence.

## Architecture

### Document Structure

The APM strategy guide will be implemented as a markdown document following the established framework pattern used in the `frameworks/` directory. The document will be structured to support both learning (sequential reading) and reference (quick lookup) use cases.

```
frameworks/
├── apm-strategy.md              # Main APM strategy document
└── INVENTORY.md                 # Updated to include APM strategy
```

### Content Organization Pattern

The document will follow a layered approach from foundational concepts to implementation details:

1. **Conceptual Layer** - Core APM concepts and principles
2. **Strategic Layer** - Platform-specific services and decision frameworks
3. **Tactical Layer** - Implementation patterns and code examples
4. **Operational Layer** - Monitoring, alerting, and optimization practices

### Integration Points

The APM strategy will integrate with existing framework documentation:

- **DevOps Framework** - CI/CD integration, deployment monitoring, performance gates
- **Security Framework (SABSA)** - Security monitoring, compliance logging, audit requirements
- **.NET Best Practices** - Performance optimization patterns, instrumentation code
- **Cloud Hosting Strategies** - Platform-specific APM service selection (AWS/Azure)
- **IaC Strategy (Pulumi)** - Infrastructure provisioning for APM resources

## Components and Interfaces

### 1. Core APM Concepts Section

**Purpose:** Establish foundational understanding of observability and monitoring

**Content Components:**
- Three Pillars of Observability (Metrics, Logs, Traces)
- Performance metrics definitions and standards
- Monitoring tool selection criteria
- Synthetic vs Real User Monitoring (RUM)
- Instrumentation levels (application, infrastructure, business)

**Design Decision:** Start with vendor-agnostic concepts before platform-specific implementations to ensure transferable knowledge.

### 2. Cloud Platform APM Services Section

**Purpose:** Guide platform-specific service selection

**Content Components:**

#### AWS Services Subsection
- CloudWatch (metrics, logs, alarms)
- X-Ray (distributed tracing)
- Third-party integrations (Datadog, New Relic, Dynatrace)
- Configuration patterns and code examples
- Cost considerations and optimization

#### Azure Services Subsection
- Application Insights (APM, tracing, analytics)
- Azure Monitor (metrics, alerts, workbooks)
- Log Analytics (centralized logging, KQL queries)
- Configuration patterns and code examples
- Cost considerations and optimization

#### Decision Matrix
- Comparison table for service selection
- Use case to service mapping
- Cost-benefit analysis framework

**Design Decision:** Provide parallel AWS/Azure sections with consistent structure to enable easy comparison and platform switching.

### 3. Metrics Collection and Analysis Section

**Purpose:** Define what to measure and how to analyze

**Content Components:**
- Metrics categorization framework:
  - RED metrics (Rate, Errors, Duration)
  - USE metrics (Utilization, Saturation, Errors)
  - Business metrics (conversion, engagement, revenue)
- Collection intervals and retention policies
- Percentiles vs averages (p50, p95, p99)
- SLI/SLO/SLA definitions and implementation
- .NET-specific performance counters
- Custom metrics instrumentation patterns

**Code Examples:**
```csharp
// Custom metrics with Application Insights
telemetryClient.TrackMetric("OrderProcessingTime", duration);

// CloudWatch custom metrics
await cloudWatch.PutMetricDataAsync(new PutMetricDataRequest
{
    Namespace = "MyApp/Orders",
    MetricData = new List<MetricDatum>
    {
        new MetricDatum
        {
            MetricName = "ProcessingTime",
            Value = duration,
            Unit = StandardUnit.Milliseconds
        }
    }
});
```

### 4. Distributed Tracing Section

**Purpose:** Enable cross-service debugging and performance analysis

**Content Components:**
- Correlation IDs and trace context propagation
- OpenTelemetry implementation for .NET
- Span creation and annotation best practices
- Bottleneck identification techniques
- AWS X-Ray integration patterns
- Azure Application Insights tracing patterns

**Code Examples:**
```csharp
// OpenTelemetry instrumentation
using var activity = activitySource.StartActivity("ProcessOrder");
activity?.SetTag("order.id", orderId);
activity?.SetTag("customer.id", customerId);

try
{
    // Business logic
    await ProcessOrderAsync(orderId);
    activity?.SetStatus(ActivityStatusCode.Ok);
}
catch (Exception ex)
{
    activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
    activity?.RecordException(ex);
    throw;
}
```

### 5. Logging Strategy Section

**Purpose:** Establish structured logging practices

**Content Components:**
- Structured logging with Serilog
- Log level guidance (Trace, Debug, Info, Warning, Error, Critical)
- PII protection and data sanitization
- Log aggregation patterns (CloudWatch Logs, Log Analytics)
- Common query patterns and examples

**Code Examples:**
```csharp
// Structured logging with Serilog
Log.Information("Order {OrderId} processed for customer {CustomerId} in {Duration}ms",
    orderId, customerId, duration);

// Log Analytics KQL query example
AppTraces
| where TimeGenerated > ago(1h)
| where SeverityLevel >= 3
| summarize count() by Message
| order by count_ desc
```

### 6. Alerting and Incident Response Section

**Purpose:** Define proactive monitoring and response procedures

**Content Components:**
- Actionable alerts vs informational notifications
- Alert threshold guidance and alert fatigue prevention
- Escalation paths and runbook integration
- CloudWatch Alarms configuration patterns
- Azure Monitor Alert Rules patterns
- MTTD and MTTR targets

**Configuration Examples:**
```yaml
# CloudWatch Alarm (CloudFormation)
HighErrorRateAlarm:
  Type: AWS::CloudWatch::Alarm
  Properties:
    AlarmName: HighErrorRate
    MetricName: Errors
    Namespace: AWS/Lambda
    Statistic: Sum
    Period: 300
    EvaluationPeriods: 2
    Threshold: 10
    ComparisonOperator: GreaterThanThreshold
```

### 7. Performance Profiling Section

**Purpose:** Guide performance optimization efforts

**Content Components:**
- CPU, memory, and I/O profiling techniques
- Common performance issues (N+1 queries, memory leaks, blocking)
- .NET optimization patterns (Span<T>, async/await, caching)
- APM tool profiling features
- Load testing integration

**Code Examples:**
```csharp
// Performance optimization with Span<T>
public static int ParseInt(ReadOnlySpan<char> input)
{
    // Zero-allocation parsing
    return int.Parse(input);
}

// Async/await best practices
public async Task<Order> GetOrderAsync(int orderId, CancellationToken ct)
{
    return await dbContext.Orders
        .AsNoTracking()
        .FirstOrDefaultAsync(o => o.Id == orderId, ct);
}
```

### 8. Business Metrics Section

**Purpose:** Connect technical metrics to business outcomes

**Content Components:**
- Business metrics examples (conversion rate, engagement, feature usage)
- Real User Monitoring (RUM) implementation
- Core Web Vitals and user-centric metrics
- Technical-to-business correlation patterns
- Custom business metrics instrumentation

### 9. Cost Management Section

**Purpose:** Balance observability needs with budget constraints

**Content Components:**
- Cost models for CloudWatch, X-Ray, Application Insights, Log Analytics
- Sampling strategies (head-based, tail-based, adaptive)
- Data retention policies
- Cost reduction techniques
- Cost comparison: managed services vs third-party tools
- Typical cost ranges by application scale

**Decision Tables:**
```markdown
| Scale | AWS Monthly | Azure Monthly | Notes |
|-------|-------------|---------------|-------|
| Small (<10K req/day) | $50-100 | $50-100 | Basic monitoring |
| Medium (100K req/day) | $200-500 | $200-500 | Full tracing |
| Large (1M+ req/day) | $1K-3K | $1K-3K | Sampling required |
```

### 10. CI/CD Integration Section

**Purpose:** Shift-left performance monitoring

**Content Components:**
- Performance testing gates in pipelines
- Deployment markers and release annotations
- Automated rollback triggers based on metrics
- Canary analysis and progressive delivery monitoring
- Pulumi/Terraform patterns for APM provisioning

**IaC Examples:**
```csharp
// Pulumi: Application Insights provisioning
var appInsights = new ApplicationInsights("myapp-insights", new()
{
    ResourceGroupName = resourceGroup.Name,
    ApplicationType = "web",
    RetentionInDays = 90,
    SamplingPercentage = 100
});

// Export instrumentation key
return new Dictionary<string, object?>
{
    ["instrumentationKey"] = appInsights.InstrumentationKey
};
```

### 11. Security and Compliance Section

**Purpose:** Ensure monitoring doesn't introduce vulnerabilities

**Content Components:**
- PII and sensitive data handling requirements
- Encryption at rest and in transit
- RBAC and access control patterns
- Compliance requirements (GDPR, HIPAA, SOC2)
- Audit logging for APM configuration changes

**Security Patterns:**
```csharp
// PII sanitization in logs
public class PiiSanitizingEnricher : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory factory)
    {
        // Mask email addresses, credit cards, etc.
        foreach (var property in logEvent.Properties)
        {
            if (property.Value is ScalarValue scalar && 
                scalar.Value is string str)
            {
                var sanitized = SanitizePii(str);
                logEvent.AddOrUpdateProperty(
                    factory.CreateProperty(property.Key, sanitized));
            }
        }
    }
}
```

### 12. Testing and Validation Section

**Purpose:** Ensure APM implementation works before production

**Content Components:**
- Unit testing patterns for instrumentation code
- Integration testing for metrics and traces
- Local APM tool setup (Jaeger, Prometheus, Grafana)
- Alert testing and validation procedures
- BDD examples for monitoring scenarios

**Test Examples:**
```csharp
[Fact]
public async Task ProcessOrder_ShouldEmitMetrics()
{
    // Arrange
    var mockTelemetry = new Mock<ITelemetryClient>();
    var service = new OrderService(mockTelemetry.Object);
    
    // Act
    await service.ProcessOrderAsync(orderId);
    
    // Assert
    mockTelemetry.Verify(t => 
        t.TrackMetric("OrderProcessingTime", It.IsAny<double>()), 
        Times.Once);
}
```

## Data Models

### APM Configuration Model

```csharp
public class ApmConfiguration
{
    public string Provider { get; set; } // "ApplicationInsights" | "CloudWatch"
    public string InstrumentationKey { get; set; }
    public bool EnableDistributedTracing { get; set; }
    public double SamplingPercentage { get; set; }
    public LogLevel MinimumLogLevel { get; set; }
    public RetentionPolicy RetentionPolicy { get; set; }
    public Dictionary<string, string> CustomProperties { get; set; }
}

public class RetentionPolicy
{
    public int MetricsRetentionDays { get; set; }
    public int LogsRetentionDays { get; set; }
    public int TracesRetentionDays { get; set; }
}
```

### Metrics Model

```csharp
public class MetricDefinition
{
    public string Name { get; set; }
    public MetricType Type { get; set; } // Counter, Gauge, Histogram
    public string Unit { get; set; }
    public Dictionary<string, string> Tags { get; set; }
    public double? Threshold { get; set; }
    public string Description { get; set; }
}

public enum MetricType
{
    Counter,    // Monotonically increasing (requests, errors)
    Gauge,      // Point-in-time value (CPU, memory)
    Histogram   // Distribution (latency percentiles)
}
```

## Error Handling

### Instrumentation Error Handling

**Principle:** APM instrumentation must never break application functionality

**Pattern:**
```csharp
public async Task<T> ExecuteWithTelemetry<T>(
    Func<Task<T>> operation, 
    string operationName)
{
    Activity? activity = null;
    try
    {
        activity = activitySource.StartActivity(operationName);
        var result = await operation();
        activity?.SetStatus(ActivityStatusCode.Ok);
        return result;
    }
    catch (Exception ex)
    {
        // Log telemetry error but don't throw
        try
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            activity?.RecordException(ex);
        }
        catch (Exception telemetryEx)
        {
            // Swallow telemetry errors
            Debug.WriteLine($"Telemetry error: {telemetryEx.Message}");
        }
        throw; // Re-throw original exception
    }
    finally
    {
        activity?.Dispose();
    }
}
```

### Graceful Degradation

- APM failures should not impact application availability
- Use circuit breakers for APM service calls
- Implement local buffering for metrics/logs
- Provide fallback to console logging

## Testing Strategy

### Unit Tests

**Scope:** Instrumentation code, metric calculation, log formatting

**Approach:**
- Mock telemetry clients
- Verify correct metrics emitted
- Validate log structure and content
- Test PII sanitization

### Integration Tests

**Scope:** End-to-end APM pipeline

**Approach:**
- Deploy to test environment with real APM services
- Generate test traffic
- Verify metrics appear in dashboards
- Validate trace propagation across services
- Test alert triggering

### BDD Scenarios

```gherkin
Feature: Application Performance Monitoring

Scenario: Successful order processing emits metrics
  Given an order service with APM enabled
  When an order is processed successfully
  Then a "OrderProcessingTime" metric should be emitted
  And the metric should include order ID and customer ID tags
  And a distributed trace should be created

Scenario: Failed operation records error metrics
  Given an order service with APM enabled
  When an order processing fails with an exception
  Then an "OrderProcessingError" metric should be emitted
  And the error should be recorded in the trace
  And an error log should be written
```

## Implementation Considerations

### .NET Integration

**Recommended Libraries:**
- OpenTelemetry.Extensions.Hosting
- OpenTelemetry.Instrumentation.AspNetCore
- OpenTelemetry.Instrumentation.Http
- OpenTelemetry.Instrumentation.SqlClient
- Serilog.AspNetCore
- Serilog.Sinks.ApplicationInsights (Azure)
- AWS.Logger.Serilog (AWS)

### Startup Configuration

```csharp
// Program.cs
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSqlClientInstrumentation()
        .AddAzureMonitorTraceExporter()) // or AddXRayTraceExporter()
    .WithMetrics(metrics => metrics
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddAzureMonitorMetricExporter()); // or AddCloudWatchMetricExporter()

builder.Host.UseSerilog((context, config) =>
{
    config
        .ReadFrom.Configuration(context.Configuration)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console()
        .WriteTo.ApplicationInsights(
            context.Configuration["ApplicationInsights:InstrumentationKey"],
            TelemetryConverter.Traces);
});
```

### Performance Impact

**Overhead Targets:**
- Metrics collection: <1% CPU overhead
- Distributed tracing (100% sampling): <5% latency overhead
- Distributed tracing (10% sampling): <1% latency overhead
- Structured logging: <2% CPU overhead

**Mitigation Strategies:**
- Use sampling for high-volume traces
- Async logging to avoid blocking
- Batch metric submissions
- Local aggregation before export

## Deployment Considerations

### Infrastructure Requirements

**AWS:**
- CloudWatch Logs log groups (per service)
- X-Ray service configuration
- IAM roles for CloudWatch/X-Ray access
- VPC endpoints for private connectivity (optional)

**Azure:**
- Application Insights resource
- Log Analytics workspace
- Managed Identity for authentication
- Private endpoints for secure connectivity (optional)

### Configuration Management

**Environment-Specific Settings:**
```json
{
  "Apm": {
    "Provider": "ApplicationInsights",
    "InstrumentationKey": "${APPINSIGHTS_INSTRUMENTATIONKEY}",
    "SamplingPercentage": 100,
    "EnableDistributedTracing": true,
    "MinimumLogLevel": "Information"
  }
}
```

**Production Overrides:**
```json
{
  "Apm": {
    "SamplingPercentage": 10,
    "MinimumLogLevel": "Warning"
  }
}
```

## Documentation Structure

### Quick Start Guide

1. Choose your platform (AWS/Azure)
2. Install required NuGet packages
3. Configure APM in Program.cs
4. Add instrumentation to critical paths
5. Deploy and verify metrics

### Reference Sections

- Metrics catalog (all available metrics)
- Log event templates
- Alert rule examples
- Query cookbook (KQL/CloudWatch Insights)
- Troubleshooting guide

### Decision Trees

- Which APM service should I use?
- What sampling rate is appropriate?
- When should I create custom metrics?
- How do I optimize APM costs?

## Success Criteria

### Adoption Metrics

- 80% of new .NET projects use the APM strategy
- Average time to implement APM: <4 hours
- Developer satisfaction score: >4/5

### Quality Metrics

- APM-related incidents: <5% of total incidents
- Mean time to detect (MTTD): <5 minutes
- Mean time to resolve (MTTR): <30 minutes

### Cost Metrics

- APM costs: <2% of infrastructure costs
- Cost per million requests: <$5

## Architecture Decision Records

### ADR-001: OpenTelemetry as Standard

**Status:** Proposed

**Context:** Need vendor-neutral instrumentation that works across AWS and Azure

**Decision:** Standardize on OpenTelemetry for all instrumentation

**Consequences:**
- ✅ Vendor portability
- ✅ Rich ecosystem and community support
- ✅ Future-proof (CNCF standard)
- ⚠️ Learning curve for teams unfamiliar with OpenTelemetry
- ⚠️ Some platform-specific features require custom exporters

### ADR-002: Structured Logging with Serilog

**Status:** Proposed

**Context:** Need consistent, searchable logging across all services

**Decision:** Use Serilog with structured logging for all .NET applications

**Consequences:**
- ✅ Rich structured data for analysis
- ✅ Multiple sink support (Console, CloudWatch, Application Insights)
- ✅ Mature ecosystem with many enrichers
- ⚠️ Requires discipline to use structured parameters correctly

### ADR-003: Sampling Strategy

**Status:** Proposed

**Context:** 100% trace sampling is cost-prohibitive at scale

**Decision:** 
- Dev/Test: 100% sampling
- Production: 10% head-based sampling for normal traffic
- Production: 100% sampling for errors and slow requests (tail-based)

**Consequences:**
- ✅ 90% cost reduction for tracing
- ✅ All errors and performance issues captured
- ⚠️ May miss some edge cases in successful requests
- ⚠️ Requires tail-based sampling support (OpenTelemetry Collector)

## Appendices

### A. Metrics Catalog Template

```markdown
| Metric Name | Type | Unit | Description | Tags | Threshold |
|-------------|------|------|-------------|------|-----------|
| http.server.duration | Histogram | ms | HTTP request duration | method, status, route | p95 < 500ms |
| http.server.requests | Counter | count | Total HTTP requests | method, status, route | - |
| db.query.duration | Histogram | ms | Database query duration | operation, table | p95 < 100ms |
```

### B. Alert Rule Templates

```yaml
# High Error Rate Alert
- name: HighErrorRate
  condition: error_rate > 5%
  window: 5 minutes
  severity: critical
  action: page_oncall
  
# Slow Response Time Alert
- name: SlowResponseTime
  condition: p95_latency > 1000ms
  window: 10 minutes
  severity: warning
  action: notify_team
```

### C. Query Cookbook

**CloudWatch Insights:**
```
fields @timestamp, @message
| filter @message like /ERROR/
| stats count() by bin(5m)
```

**Log Analytics KQL:**
```kusto
requests
| where timestamp > ago(1h)
| summarize 
    p50 = percentile(duration, 50),
    p95 = percentile(duration, 95),
    p99 = percentile(duration, 99)
  by bin(timestamp, 5m)
| render timechart
```

## Next Steps

1. Review and approve this design document
2. Create tasks.md with implementation steps
3. Begin content creation for each section
4. Develop code examples and test them
5. Create diagrams and decision trees
6. Peer review with DevOps and platform teams
7. Publish to frameworks/ directory
8. Update INVENTORY.md
9. Announce to development teams
