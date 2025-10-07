---
inclusion: always
category: Monitoring Strategy
framework: Application Performance Monitoring (APM)
description: Comprehensive APM strategy with metrics, logs, traces, alerting, and cost optimization for .NET applications
tags: [monitoring, observability, metrics, logging, tracing, alerting]
---

# Application Performance Monitoring (APM) Strategy

## Purpose
Comprehensive observability strategy for .NET applications with metrics collection, distributed tracing, logging, alerting, and performance optimization across AWS and Azure platforms.

## Core APM Concepts

### The Three Pillars of Observability
- **Metrics**: Quantitative measurements (response time, throughput, error rate)
- **Logs**: Discrete event records with contextual information
- **Traces**: Request flow tracking across distributed systems

### Key Performance Indicators
| Metric | Target | Critical Threshold | Business Impact |
|--------|--------|-------------------|-----------------|
| **Response Time** | <200ms | >1s | User experience |
| **Throughput** | >1000 req/s | <100 req/s | System capacity |
| **Error Rate** | <0.1% | >1% | Service reliability |
| **Availability** | >99.9% | <99% | Business continuity |

## Cloud Platform APM Services

### AWS Monitoring Stack
```yaml
# Primary Services
- CloudWatch: Metrics, logs, alarms
- X-Ray: Distributed tracing
- Application Insights: .NET APM (via partner)

# Supporting Services
- CloudTrail: API audit logging
- GuardDuty: Security monitoring
- Config: Configuration compliance
```

### Azure Monitoring Stack
```yaml
# Primary Services
- Application Insights: Full APM suite
- Azure Monitor: Metrics and logs
- Log Analytics: Query and analysis

# Supporting Services
- Azure Sentinel: Security monitoring
- Service Map: Dependency visualization
- Availability Tests: Synthetic monitoring
```

## Implementation Quick Start

### 1. .NET Application Setup
```csharp
// Program.cs - Essential APM configuration
builder.Services.AddApplicationInsightsTelemetry();
builder.Services.AddLogging(logging => {
    logging.AddConsole();
    logging.AddApplicationInsights();
});

// Add custom metrics
builder.Services.AddSingleton<IMetrics, MetricsService>();
```

### 2. Structured Logging
```csharp
// Use structured logging with Serilog
Log.Information("User {UserId} completed order {OrderId} for {Amount:C}", 
    userId, orderId, amount);

// Include correlation IDs
using (LogContext.PushProperty("CorrelationId", correlationId))
{
    Log.Information("Processing payment for order {OrderId}", orderId);
}
```

### 3. Custom Metrics Collection
```csharp
// Business metrics
_metrics.Counter("orders.completed").Increment();
_metrics.Histogram("order.processing.duration").Record(duration);
_metrics.Gauge("active.users").Set(activeUserCount);
```

## Alerting Strategy

### Critical Alerts (Immediate Response)
- **Error Rate >1%**: Page on-call engineer
- **Response Time >5s**: Page on-call engineer  
- **Service Down**: Page on-call engineer
- **Security Breach**: Page security team

### Warning Alerts (Business Hours)
- **Error Rate >0.5%**: Slack notification
- **Response Time >2s**: Slack notification
- **High Memory Usage >80%**: Email notification

### Alert Configuration Example
```yaml
# CloudWatch Alarm
ErrorRateAlarm:
  MetricName: ErrorRate
  Threshold: 1.0
  ComparisonOperator: GreaterThanThreshold
  EvaluationPeriods: 2
  Actions:
    - SNS Topic (PagerDuty)
    - Slack Webhook
```

## Distributed Tracing

### Trace Implementation
```csharp
// Automatic instrumentation
services.AddOpenTelemetry()
    .WithTracing(builder => builder
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddSqlClientInstrumentation()
        .AddJaegerExporter());

// Custom spans
using var activity = ActivitySource.StartActivity("ProcessOrder");
activity?.SetTag("order.id", orderId);
activity?.SetTag("user.id", userId);
```

### Trace Correlation
```csharp
// Propagate correlation across services
services.AddHttpClient<PaymentService>(client => {
    client.DefaultRequestHeaders.Add("X-Correlation-ID", 
        Activity.Current?.Id ?? Guid.NewGuid().ToString());
});
```

## Performance Profiling

### Application Profiling
- **CPU Profiling**: Identify hot paths and bottlenecks
- **Memory Profiling**: Detect memory leaks and optimization opportunities
- **Database Profiling**: Optimize queries and connection usage

### Profiling Tools
| Tool | Platform | Use Case | Cost |
|------|----------|----------|------|
| **Application Insights Profiler** | Azure | Production profiling | Included |
| **AWS X-Ray** | AWS | Request tracing | Pay-per-use |
| **dotTrace** | Cross-platform | Development profiling | Licensed |
| **PerfView** | Windows | Memory analysis | Free |

## Cost Optimization

### Monitoring Cost Management
```yaml
# Cost optimization strategies
Data Retention:
  - Metrics: 15 months (AWS), 93 days (Azure)
  - Logs: 30 days (hot), 1 year (cold)
  - Traces: 7 days (detailed), 30 days (sampled)

Sampling Rates:
  - Production: 1% for normal traffic, 100% for errors
  - Staging: 10% sampling rate
  - Development: 100% sampling rate
```

### Budget Alerts
```json
{
  "monthlyBudget": 500,
  "alerts": [
    {"threshold": 80, "action": "email"},
    {"threshold": 95, "action": "slack"},
    {"threshold": 100, "action": "page"}
  ]
}
```

## CI/CD Integration

### Pipeline Monitoring
```yaml
# GitHub Actions - APM validation
- name: Validate APM Configuration
  run: |
    # Check Application Insights connection
    dotnet test --filter Category=APM
    
    # Validate log output format
    dotnet run --verify-logging
    
    # Test custom metrics
    dotnet test --filter Category=Metrics
```

### Deployment Monitoring
```yaml
# Post-deployment validation
- name: Health Check with APM
  run: |
    # Wait for metrics to appear
    sleep 30
    
    # Validate service health
    curl -f ${{ env.HEALTH_ENDPOINT }}
    
    # Check error rates
    az monitor metrics list --resource ${{ env.APP_INSIGHTS_RESOURCE }}
```

## Security and Compliance

### Data Privacy
- **PII Scrubbing**: Remove sensitive data from logs and traces
- **Data Encryption**: Encrypt telemetry data in transit and at rest
- **Access Control**: Role-based access to monitoring data

### Compliance Requirements
```yaml
HIPAA Compliance:
  - Audit all access to monitoring data
  - Encrypt all telemetry data
  - Implement data retention policies
  - Regular security assessments

GDPR Compliance:
  - Data anonymization in logs
  - Right to erasure implementation
  - Data processing agreements
  - Privacy impact assessments
```

## Best Practices

### Monitoring Design Principles
1. **Monitor what matters**: Focus on user-impacting metrics
2. **Fail fast, recover faster**: Quick detection and automated recovery
3. **Observability by design**: Build monitoring into the application
4. **Cost-conscious monitoring**: Balance visibility with cost

### Common Anti-Patterns to Avoid
- **Log everything**: Creates noise and increases costs
- **Alert fatigue**: Too many non-actionable alerts
- **Monitoring silos**: Disconnected monitoring tools
- **Reactive monitoring**: Only monitoring after problems occur

## Integration with Other Strategies

### DevOps Integration
- **CI/CD Pipelines**: Automated monitoring validation
- **Infrastructure as Code**: Monitoring resources as code
- **Deployment Strategies**: Blue-green with monitoring validation

### Security Integration
- **Security Monitoring**: Integration with SIEM systems
- **Threat Detection**: Behavioral analysis and anomaly detection
- **Incident Response**: Automated security incident workflows

## Quick Reference

### Essential Metrics to Track
```yaml
Application Metrics:
  - Request rate (req/s)
  - Response time (ms)
  - Error rate (%)
  - Concurrent users

Infrastructure Metrics:
  - CPU utilization (%)
  - Memory usage (%)
  - Disk I/O (IOPS)
  - Network throughput (Mbps)

Business Metrics:
  - Conversion rate (%)
  - Revenue per user ($)
  - Feature adoption (%)
  - User satisfaction score
```

### Troubleshooting Checklist
1. **Check service health endpoints**
2. **Review error logs for patterns**
3. **Analyze performance metrics trends**
4. **Examine distributed traces for bottlenecks**
5. **Validate infrastructure resource usage**
6. **Check external dependency status**

### Key Tools and Resources
- **Application Insights SDK**: .NET telemetry collection
- **OpenTelemetry**: Vendor-neutral observability framework
- **Serilog**: Structured logging for .NET
- **Grafana**: Metrics visualization and dashboards
- **PagerDuty**: Incident management and alerting
