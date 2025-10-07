---
inclusion: always
category: Testing Strategy
framework: JMeter Performance Testing
description: Apache JMeter performance testing strategy with load testing, CI/CD integration, and distributed testing guidance
tags: [performance-testing, load-testing, jmeter, automation, ci-cd]
---

# JMeter Performance Testing Strategy

## Purpose
Standardized approach for implementing performance testing using Apache JMeter, including test design, execution, analysis, and CI/CD integration.

## When to Use JMeter
- **Load Testing**: Web applications, APIs, databases
- **Stress Testing**: Finding system breaking points
- **Endurance Testing**: Long-running stability validation
- **Distributed Testing**: High-load scenarios across multiple machines

## Core Test Types

| Test Type | Load Level | Duration | Purpose |
|-----------|------------|----------|---------|
| **Load** | Expected peak (100%) | 30-60 min | Validate normal performance |
| **Stress** | 150-200% peak | 15-30 min | Find breaking points |
| **Spike** | 300-500% instant | 5-15 min | Test sudden load changes |
| **Endurance** | 70-80% peak | 8-24 hours | Long-term stability |

## Quick Start

### 1. Basic Test Structure
```
performance-tests/
├── test-plans/          # JMeter .jmx files
├── test-data/          # CSV data files
├── config/             # Environment properties
├── results/            # Test results
└── scripts/            # Automation scripts
```

### 2. Essential Commands
```bash
# Run load test
jmeter -n -t test-plan.jmx -l results.jtl -e -o report/

# With environment config
jmeter -n -t test-plan.jmx -q config/staging.properties -l results.jtl

# Distributed testing
jmeter -n -t test-plan.jmx -r -l distributed-results.jtl
```

### 3. Key Configuration
```xml
<!-- Thread Group -->
<ThreadGroup testname="100 Users - Load Test">
  <stringProp name="ThreadGroup.num_threads">100</stringProp>
  <stringProp name="ThreadGroup.ramp_time">300</stringProp>
  <stringProp name="ThreadGroup.duration">1800</stringProp>
</ThreadGroup>

<!-- CSV Data -->
<CSVDataSet testname="User Data">
  <stringProp name="filename">test-data/users.csv</stringProp>
  <stringProp name="variableNames">username,password,email</stringProp>
</CSVDataSet>
```

## Performance Targets

| Metric | Web Apps | APIs | Databases |
|--------|----------|------|-----------|
| **Response Time** | <2s | <500ms | <100ms |
| **95th Percentile** | <3s | <1s | <200ms |
| **Throughput** | 100+ req/s | 1000+ req/s | 10k+ TPS |
| **Error Rate** | <1% | <0.1% | <0.01% |

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Performance Tests
  run: |
    jmeter -n -t performance-tests/load-test.jmx \
      -q config/staging.properties \
      -l results/performance-results.jtl \
      -e -o results/html-report
```

### Quality Gates
```json
{
  "thresholds": {
    "response_time_avg": 2000,
    "response_time_p95": 3000,
    "throughput_min": 50,
    "error_rate_max": 1.0
  }
}
```

## Best Practices

### Test Design
- Use realistic user scenarios based on analytics
- Implement proper correlation (extract tokens, IDs)
- Add appropriate think times (2-30 seconds)
- Use CSV data sets for parameterization

### Execution
- Always run in non-GUI mode (`jmeter -n`)
- Use distributed testing for >500 concurrent users
- Monitor system resources during tests
- Validate test environment matches production

### Analysis
- Focus on percentiles, not just averages
- Establish performance baselines
- Identify bottlenecks systematically
- Compare results against requirements

## Common Anti-Patterns to Avoid
- Using GUI mode for load testing
- Hardcoded test data
- No think time between requests
- Ignoring ramp-up time
- Testing only happy path scenarios
- Not monitoring target system resources

## Integration Points

### With Other Strategies
- **TDD/BDD**: Derive performance scenarios from functional tests
- **Security**: Validate security controls under load
- **DevOps**: Integrate into CI/CD pipelines
- **IaC**: Provision test infrastructure as code

### Project Files
- **testing-plan.md**: Add performance scenarios and acceptance criteria
- **tasks.md**: Include performance testing tasks with estimates
- **CI/CD pipelines**: Add automated performance validation

## Distributed Testing Setup

### Master-Slave Configuration
```bash
# Master node
jmeter -n -t test-plan.jmx -r -l distributed-results.jtl

# Slave nodes (start JMeter server)
jmeter-server -Djava.rmi.server.hostname=$(hostname -I | awk '{print $1}')
```

### Infrastructure Sizing
```
Concurrent Users = (Peak Hourly Users × Session Duration) ÷ 3600
Required Cores = (Target Users ÷ 75) × 1.5 safety factor
```

## Monitoring Integration

### Real-time Metrics
```xml
<!-- InfluxDB Backend Listener -->
<BackendListener testname="InfluxDB Metrics">
  <stringProp name="influxdbUrl">http://localhost:8086/write?db=jmeter</stringProp>
  <stringProp name="application">MyApp</stringProp>
</BackendListener>
```

### Grafana Dashboard
- Response time trends
- Throughput over time
- Error rate monitoring
- Resource utilization

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| High response times | Resource bottleneck | Check CPU, memory, database |
| Connection errors | Network/firewall | Verify connectivity, ports |
| Memory errors | Large result sets | Reduce listeners, increase JVM heap |
| Inconsistent results | Environment variance | Standardize test environment |

## Quick Reference

**Load Calculation:**
- Ramp-up time = Users × 1-2 seconds
- Think time = (Session duration - Request time) ÷ Requests

**File Locations:**
- Strategy guide: `frameworks/jmeter.md`
- Test plans: `performance-tests/test-plans/`
- Results: `performance-tests/results/`

**Key Plugins:**
- JMeter Plugins Manager
- PerfMon (server monitoring)
- Ultimate Thread Group
- Backend Listener (InfluxDB)
