# Pulumi - Modern Infrastructure as Code

## Overview

Pulumi is a modern, open-source infrastructure as code (IaC) platform that allows you to define, deploy, and manage cloud infrastructure using familiar programming languages instead of domain-specific languages (DSLs).

**Founded:** 2017
**Founders:** Joe Duffy and Eric Rudder (former Microsoft employees)
**Headquarters:** Seattle, Washington
**License:** Apache 2.0 (Open Source)

**Key Differentiator:** Use real programming languages (TypeScript, Python, Go, C#, Java) instead of YAML or HCL.

---

## Core Concept

### Traditional IaC (Terraform, CloudFormation)
```hcl
# HCL (HashiCorp Configuration Language)
resource "aws_instance" "web" {
  ami           = "ami-0319ef1a70c93d5c8"
  instance_type = "t2.micro"
}
```

### Pulumi IaC
```typescript
// Real TypeScript code
const server = new aws.ec2.Instance("web-server", {
    ami: "ami-0319ef1a70c93d5c8",
    instanceType: "t2.micro"
});
```

**Advantage:** Full power of programming languages - loops, conditionals, functions, classes, packages, testing, IDEs, etc.

---

## Supported Languages

### General-Purpose Languages

**TypeScript / JavaScript (Node.js)**
- Most popular choice
- Full type safety with TypeScript
- Rich ecosystem (npm packages)
- Excellent IDE support

**Python**
- Great for data engineers and ML teams
- Familiar to many ops teams
- pip package ecosystem
- Type hints support

**Go**
- High performance
- Strong typing
- Popular for infrastructure tools
- Compiled binaries

**C# / F# / VB (.NET)**
- Enterprise-friendly
- Visual Studio integration
- NuGet packages
- Strong typing

**Java**
- Enterprise standard
- Maven/Gradle integration
- Strong typing
- Mature ecosystem

### Markup Language

**YAML**
- For those who prefer declarative
- Simpler syntax
- Limited logic capabilities
- Bridge from traditional IaC

---

## Pulumi Components

### 1. Pulumi CLI

**Command-Line Interface for managing infrastructure**

**Key Commands:**
```bash
# Initialize new project
pulumi new aws-typescript

# Preview changes
pulumi preview

# Deploy infrastructure
pulumi up

# Destroy infrastructure
pulumi destroy

# View stack outputs
pulumi stack output

# Manage configuration
pulumi config set aws:region us-west-2

# View state
pulumi stack

# Export/import state
pulumi stack export
pulumi stack import
```

### 2. Pulumi SDK

**Language-specific libraries for each cloud provider**

**Features:**
- Type-safe resource definitions
- IntelliSense/autocomplete support
- Compile-time error checking
- Resource property validation
- Dependency management

**Example Providers:**
- `@pulumi/aws` - Amazon Web Services
- `@pulumi/azure` - Microsoft Azure
- `@pulumi/gcp` - Google Cloud Platform
- `@pulumi/kubernetes` - Kubernetes
- `@pulumi/docker` - Docker
- 120+ total providers

### 3. Deployment Engine

**Orchestrates infrastructure changes**

**Responsibilities:**
- Compute required operations
- Determine resource dependencies
- Maximize parallelism
- Handle failures and rollbacks
- Track state changes
- Generate previews

**Process:**
1. Analyze current state
2. Compare with desired state
3. Calculate diff
4. Plan operations (create, update, delete)
5. Execute in correct order
6. Update state

### 4. Pulumi Cloud (Optional)

**Managed service for teams**

**Features:**
- State management (hosted backend)
- Secrets encryption
- Team collaboration
- Audit logs
- CI/CD integration
- Policy as code
- RBAC (Role-Based Access Control)
- Stack insights and analytics

**Alternatives:**
- Self-hosted backend
- Local file system
- AWS S3
- Azure Blob Storage
- Google Cloud Storage

---

## Core Concepts

### Projects

**Definition:** Directory containing source code and metadata for infrastructure

**Structure:**
```
my-project/
├── Pulumi.yaml          # Project metadata
├── Pulumi.dev.yaml      # Stack configuration (dev)
├── Pulumi.prod.yaml     # Stack configuration (prod)
├── index.ts             # Main program
├── package.json         # Dependencies (Node.js)
└── node_modules/        # Installed packages
```

**Pulumi.yaml:**
```yaml
name: my-infrastructure
runtime: nodejs
description: My cloud infrastructure
```

### Stacks

**Definition:** Isolated, independently configurable instance of a Pulumi program

**Use Cases:**
- **Development** - Personal dev environment
- **Staging** - Pre-production testing
- **Production** - Live environment
- **Feature branches** - Temporary environments
- **Regions** - us-west-2, eu-central-1

**Benefits:**
- Same code, different configurations
- Isolated state
- Independent deployments
- Environment parity

**Example:**
```bash
# Create stacks
pulumi stack init dev
pulumi stack init staging
pulumi stack init prod

# Switch between stacks
pulumi stack select dev
pulumi up

pulumi stack select prod
pulumi up
```

### Resources

**Definition:** Cloud infrastructure components (VMs, databases, networks, etc.)

**Types:**

**1. Custom Resources**
- Managed by cloud provider
- Have physical representation
- Examples: EC2 instances, S3 buckets, VPCs

**2. Component Resources**
- Logical grouping of resources
- Reusable abstractions
- No direct cloud representation
- Examples: VPC with subnets, EKS cluster with node groups

**Example:**
```typescript
// Custom resource
const bucket = new aws.s3.Bucket("my-bucket", {
    acl: "private",
    versioning: { enabled: true }
});

// Component resource
class WebServer extends pulumi.ComponentResource {
    public readonly url: pulumi.Output<string>;
    
    constructor(name: string, args: WebServerArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:WebServer", name, {}, opts);
        
        const securityGroup = new aws.ec2.SecurityGroup(/*...*/);
        const instance = new aws.ec2.Instance(/*...*/);
        const eip = new aws.ec2.Eip(/*...*/);
        
        this.url = pulumi.interpolate`http://${eip.publicIp}`;
    }
}
```

### Inputs and Outputs

**Problem:** Resources are created asynchronously, values not known until deployment

**Solution:** Pulumi's Input/Output system

**Inputs:** Values passed to resources (can be concrete or Output)

**Outputs:** Asynchronous values from resources

**Example:**
```typescript
// Output from one resource
const bucket = new aws.s3.Bucket("my-bucket");
const bucketName = bucket.id; // Output<string>

// Used as input to another resource
const bucketObject = new aws.s3.BucketObject("index.html", {
    bucket: bucketName,  // Output used as Input
    content: "<h1>Hello</h1>"
});

// Transform outputs
const url = bucketName.apply(name => `https://${name}.s3.amazonaws.com`);

// Combine outputs
const combined = pulumi.all([bucket.id, bucketObject.key])
    .apply(([bucketId, key]) => `${bucketId}/${key}`);

// Export outputs
export const websiteUrl = url;
```

### Configuration

**Purpose:** Parameterize stacks for different environments

**Setting Configuration:**
```bash
# Set configuration values
pulumi config set aws:region us-west-2
pulumi config set instanceType t2.micro
pulumi config set dbPassword mySecret --secret

# View configuration
pulumi config
```

**Using Configuration:**
```typescript
import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const instanceType = config.require("instanceType");
const dbPassword = config.requireSecret("dbPassword");

const server = new aws.ec2.Instance("web", {
    instanceType: instanceType,
    // ...
});
```

### Secrets

**Purpose:** Securely store sensitive data (passwords, API keys, certificates)

**Features:**
- Encrypted at rest
- Encrypted in transit
- Never shown in plaintext in CLI output
- Marked with `[secret]` in previews

**Usage:**
```bash
# Set secret
pulumi config set dbPassword myP@ssw0rd --secret

# Use in code
const config = new pulumi.Config();
const dbPassword = config.requireSecret("dbPassword");

// Secret outputs
export const connectionString = pulumi.secret(
    pulumi.interpolate`Server=${db.endpoint};Password=${dbPassword}`
);
```

### State and Backends

**State:** Current state of infrastructure

**Backends:**

**1. Pulumi Cloud (Default)**
- Managed service
- Team collaboration
- Audit logs
- Free tier available

**2. Self-Managed**
```bash
# Local file system
pulumi login file://~/.pulumi

# AWS S3
pulumi login s3://my-pulumi-state-bucket

# Azure Blob Storage
pulumi login azblob://my-container

# Google Cloud Storage
pulumi login gs://my-pulumi-state-bucket
```

---

## Example: Complete AWS Infrastructure

```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

// Configuration
const config = new pulumi.Config();
const instanceType = config.get("instanceType") || "t2.micro";

// VPC
const vpc = new aws.ec2.Vpc("my-vpc", {
    cidrBlock: "10.0.0.0/16",
    enableDnsHostnames: true,
    tags: { Name: "my-vpc" }
});

// Subnet
const subnet = new aws.ec2.Subnet("my-subnet", {
    vpcId: vpc.id,
    cidrBlock: "10.0.1.0/24",
    availabilityZone: "us-west-2a",
    mapPublicIpOnLaunch: true
});

// Internet Gateway
const igw = new aws.ec2.InternetGateway("my-igw", {
    vpcId: vpc.id
});

// Route Table
const routeTable = new aws.ec2.RouteTable("my-rt", {
    vpcId: vpc.id,
    routes: [{
        cidrBlock: "0.0.0.0/0",
        gatewayId: igw.id
    }]
});

// Route Table Association
const rtAssoc = new aws.ec2.RouteTableAssociation("my-rta", {
    subnetId: subnet.id,
    routeTableId: routeTable.id
});

// Security Group
const securityGroup = new aws.ec2.SecurityGroup("web-sg", {
    vpcId: vpc.id,
    description: "Allow HTTP and SSH",
    ingress: [
        { protocol: "tcp", fromPort: 80, toPort: 80, cidrBlocks: ["0.0.0.0/0"] },
        { protocol: "tcp", fromPort: 22, toPort: 22, cidrBlocks: ["0.0.0.0/0"] }
    ],
    egress: [
        { protocol: "-1", fromPort: 0, toPort: 0, cidrBlocks: ["0.0.0.0/0"] }
    ]
});

// EC2 Instance
const server = new aws.ec2.Instance("web-server", {
    ami: "ami-0319ef1a70c93d5c8",
    instanceType: instanceType,
    subnetId: subnet.id,
    vpcSecurityGroupIds: [securityGroup.id],
    userData: `#!/bin/bash
        yum update -y
        yum install -y httpd
        systemctl start httpd
        systemctl enable httpd
        echo "<h1>Hello from Pulumi!</h1>" > /var/www/html/index.html
    `,
    tags: { Name: "web-server" }
});

// Outputs
export const vpcId = vpc.id;
export const publicIp = server.publicIp;
export const publicDns = server.publicDns;
export const url = pulumi.interpolate`http://${server.publicDns}`;
```

---

## Advanced Features

### Automation API

**Purpose:** Programmatically manage Pulumi operations

**Use Cases:**
- Custom CLIs
- Self-service portals
- CI/CD pipelines
- Multi-stack workflows
- Drift detection

**Example:**
```typescript
import * as automation from "@pulumi/pulumi/automation";

async function deployStack() {
    const stack = await automation.LocalWorkspace.createOrSelectStack({
        stackName: "dev",
        projectName: "my-project",
        program: async () => {
            const bucket = new aws.s3.Bucket("my-bucket");
            return { bucketName: bucket.id };
        }
    });
    
    await stack.setConfig("aws:region", { value: "us-west-2" });
    
    const upResult = await stack.up();
    console.log(`Bucket: ${upResult.outputs.bucketName.value}`);
}
```

### Policy as Code (CrossGuard)

**Purpose:** Enforce compliance and best practices

**Example:**
```typescript
import * as policy from "@pulumi/policy";

new policy.PolicyPack("aws-policies", {
    policies: [
        {
            name: "s3-no-public-read",
            description: "S3 buckets must not allow public read access",
            enforcementLevel: "mandatory",
            validateResource: policy.validateResourceOfType(aws.s3.Bucket, (bucket, args, reportViolation) => {
                if (bucket.acl === "public-read") {
                    reportViolation("S3 bucket must not have public-read ACL");
                }
            })
        },
        {
            name: "required-tags",
            description: "Resources must have required tags",
            enforcementLevel: "advisory",
            validateResource: (args, reportViolation) => {
                if (!args.props.tags || !args.props.tags["Environment"]) {
                    reportViolation("Resource must have 'Environment' tag");
                }
            }
        }
    ]
});
```

### Component Resources

**Purpose:** Create reusable infrastructure abstractions

**Example:**
```typescript
export class StaticWebsite extends pulumi.ComponentResource {
    public readonly bucketName: pulumi.Output<string>;
    public readonly websiteUrl: pulumi.Output<string>;
    
    constructor(name: string, args: StaticWebsiteArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:StaticWebsite", name, {}, opts);
        
        // S3 Bucket
        const bucket = new aws.s3.Bucket(`${name}-bucket`, {
            website: {
                indexDocument: "index.html",
                errorDocument: "error.html"
            }
        }, { parent: this });
        
        // Bucket Policy
        const bucketPolicy = new aws.s3.BucketPolicy(`${name}-policy`, {
            bucket: bucket.id,
            policy: bucket.arn.apply(arn => JSON.stringify({
                Version: "2012-10-17",
                Statement: [{
                    Effect: "Allow",
                    Principal: "*",
                    Action: "s3:GetObject",
                    Resource: `${arn}/*`
                }]
            }))
        }, { parent: this });
        
        // Upload files
        for (const file of args.files) {
            new aws.s3.BucketObject(`${name}-${file}`, {
                bucket: bucket.id,
                source: new pulumi.asset.FileAsset(file),
                contentType: "text/html"
            }, { parent: this });
        }
        
        this.bucketName = bucket.id;
        this.websiteUrl = bucket.websiteEndpoint;
        
        this.registerOutputs({
            bucketName: this.bucketName,
            websiteUrl: this.websiteUrl
        });
    }
}

// Usage
const website = new StaticWebsite("my-site", {
    files: ["index.html", "about.html"]
});

export const url = website.websiteUrl;
```

### Testing

**Unit Testing:**
```typescript
import * as pulumi from "@pulumi/pulumi";
import "mocha";

pulumi.runtime.setMocks({
    newResource: (args: pulumi.runtime.MockResourceArgs) => {
        return {
            id: args.name + "_id",
            state: args.inputs
        };
    },
    call: (args: pulumi.runtime.MockCallArgs) => {
        return args.inputs;
    }
});

describe("Infrastructure", () => {
    it("creates a bucket with correct name", async () => {
        const infra = await import("./index");
        const bucketName = await infra.bucketName;
        assert.equal(bucketName, "my-bucket_id");
    });
});
```

---

## Pulumi Products

### Pulumi IaC
- Core infrastructure as code platform
- Multi-language support
- Multi-cloud support

### Pulumi ESC (Environments, Secrets, Configuration)
- Centralized secrets management
- Environment configuration
- Dynamic credentials
- Integration with vaults

### Pulumi Insights
- Asset management
- Compliance remediation
- AI-powered insights
- Search and analytics

### Pulumi IDP (Internal Developer Platform)
- Self-service infrastructure
- Developer workflows
- Guardrails and policies
- Templates and blueprints

---

## Pulumi vs Other IaC Tools

### Pulumi vs Terraform

| Aspect | Pulumi | Terraform |
|--------|--------|-----------|
| **Language** | Real programming languages | HCL (DSL) |
| **State** | Managed or self-hosted | Self-managed (or Terraform Cloud) |
| **Testing** | Standard testing frameworks | Terratest (Go) |
| **Loops** | Native language loops | `count`, `for_each` |
| **Conditionals** | Native if/else | `count = condition ? 1 : 0` |
| **Functions** | Native functions | Limited built-in functions |
| **IDE Support** | Full IntelliSense | Limited |
| **Type Safety** | Compile-time checking | Runtime checking |
| **Modules** | Language packages | HCL modules |
| **Learning Curve** | Use existing language knowledge | Learn HCL |

### Pulumi vs CloudFormation

| Aspect | Pulumi | CloudFormation |
|--------|--------|----------------|
| **Cloud** | Multi-cloud | AWS only |
| **Language** | Multiple languages | JSON/YAML |
| **Preview** | Yes | Change sets |
| **State** | Explicit | Implicit (AWS managed) |
| **Rollback** | Manual | Automatic |
| **Drift Detection** | Yes | Yes |

### Pulumi vs ARM Templates

| Aspect | Pulumi | ARM Templates |
|--------|--------|---------------|
| **Cloud** | Multi-cloud | Azure only |
| **Language** | Multiple languages | JSON |
| **Modularity** | Native | Linked templates |
| **Testing** | Standard frameworks | Limited |

---

## Best Practices

### Project Organization

```
infrastructure/
├── index.ts              # Main entry point
├── vpc.ts                # VPC resources
├── compute.ts            # EC2/ECS resources
├── database.ts           # RDS resources
├── components/           # Reusable components
│   ├── staticWebsite.ts
│   └── apiGateway.ts
├── config/               # Configuration files
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
└── tests/                # Unit tests
    └── index.test.ts
```

### Use Configuration

```typescript
const config = new pulumi.Config();
const environment = pulumi.getStack();

// Environment-specific values
const instanceType = config.get("instanceType") || "t2.micro";
const dbSize = config.getNumber("dbSize") || 20;
```

### Tag Everything

```typescript
const commonTags = {
    Environment: pulumi.getStack(),
    Project: pulumi.getProject(),
    ManagedBy: "Pulumi"
};

const server = new aws.ec2.Instance("web", {
    // ...
    tags: { ...commonTags, Name: "web-server" }
});
```

### Use Outputs for Dependencies

```typescript
// Good - Pulumi handles dependencies
const bucket = new aws.s3.Bucket("my-bucket");
const object = new aws.s3.BucketObject("file", {
    bucket: bucket.id,  // Output
    // ...
});

// Bad - Manual dependency management
const object = new aws.s3.BucketObject("file", {
    bucket: "hardcoded-bucket-name",
    // ...
}, { dependsOn: [bucket] });
```

---

## Key Takeaways

1. **Real Programming Languages** - Use TypeScript, Python, Go, C#, Java, or YAML
2. **Multi-Cloud** - AWS, Azure, GCP, Kubernetes, 120+ providers
3. **Full Language Power** - Loops, conditionals, functions, classes, packages
4. **Type Safety** - Compile-time checking and IntelliSense
5. **State Management** - Managed or self-hosted backends
6. **Stacks** - Multiple environments from same code
7. **Outputs** - Handle async resource creation
8. **Component Resources** - Reusable abstractions
9. **Testing** - Standard testing frameworks
10. **Automation API** - Programmatic infrastructure management
11. **Policy as Code** - Enforce compliance
12. **Open Source** - Apache 2.0 license

---

## Resources

### Official Resources
- **Website:** https://www.pulumi.com
- **Documentation:** https://www.pulumi.com/docs
- **GitHub:** https://github.com/pulumi/pulumi
- **Examples:** https://github.com/pulumi/examples

### Community
- **Slack:** Pulumi Community Slack
- **Blog:** https://www.pulumi.com/blog
- **YouTube:** PulumiTV

### Learning
- **Getting Started:** https://www.pulumi.com/docs/get-started
- **Tutorials:** https://www.pulumi.com/tutorials
- **Registry:** https://www.pulumi.com/registry

---

## Conclusion

Pulumi represents a modern approach to infrastructure as code by leveraging real programming languages instead of domain-specific languages. This allows developers to use familiar tools, IDEs, testing frameworks, and language features while managing cloud infrastructure.

The ability to use loops, conditionals, functions, and classes makes Pulumi code more maintainable and reusable than traditional IaC tools. Type safety and compile-time checking catch errors before deployment. The multi-cloud support and extensive provider ecosystem make it suitable for complex, heterogeneous environments.

While there's a learning curve for teams used to declarative tools like Terraform or CloudFormation, the investment pays off in developer productivity, code reusability, and the ability to apply software engineering best practices to infrastructure management.

Pulumi is particularly well-suited for teams that value developer experience, want to use existing programming skills for infrastructure, and need the flexibility and power of real programming languages for complex infrastructure scenarios.

---

## Enterprise Features

### Pulumi Cloud Enterprise

**Advanced Team Management**
- Single Sign-On (SSO) integration
- SAML 2.0 and OpenID Connect support
- Role-based access control (RBAC)
- Team and organization management
- Audit logging and compliance reporting

**Advanced Security**
- Secrets encryption with customer-managed keys
- VPC/Private networking support
- IP allowlisting
- Advanced threat detection
- SOC 2 Type II compliance

**Governance and Compliance**
- Policy as Code enforcement
- Compliance frameworks (SOX, HIPAA, PCI DSS)
- Resource tagging policies
- Cost management and budgeting
- Drift detection and remediation

### Self-Hosted Pulumi Cloud

**On-Premises Deployment**
- Air-gapped environments
- Custom authentication providers
- Database encryption at rest
- High availability configuration
- Disaster recovery capabilities

**Integration Capabilities**
- CI/CD pipeline integration
- Monitoring and alerting systems
- Ticketing system integration
- Custom webhooks and APIs
- Third-party security tools

---

## Deployment Patterns

### GitOps with Pulumi

**Pull-Based Deployment**
```yaml
# .github/workflows/pulumi.yml
name: Pulumi GitOps
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  preview:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - uses: pulumi/actions@v4
        with:
          command: preview
          stack-name: dev
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}

  deploy:
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - uses: pulumi/actions@v4
        with:
          command: up
          stack-name: prod
        env:
          PULUMI_ACCESS_TOKEN: ${{ secrets.PULUMI_ACCESS_TOKEN }}
```

### Multi-Stack Orchestration

**Environment Promotion Pipeline**
```typescript
// orchestrator.ts
import * as automation from "@pulumi/pulumi/automation";

class EnvironmentOrchestrator {
    async promoteToProduction(devStackName: string) {
        // 1. Run tests on dev stack
        const devStack = await automation.LocalWorkspace.selectStack({
            stackName: devStackName,
            projectName: "my-app"
        });
        
        const devOutputs = await devStack.outputs();
        await this.runIntegrationTests(devOutputs.apiUrl.value);
        
        // 2. Deploy to staging
        const stagingStack = await automation.LocalWorkspace.selectStack({
            stackName: "staging",
            projectName: "my-app"
        });
        
        await stagingStack.up();
        
        // 3. Run staging tests
        const stagingOutputs = await stagingStack.outputs();
        await this.runSmokeTests(stagingOutputs.apiUrl.value);
        
        // 4. Deploy to production with approval
        const approved = await this.requestApproval();
        if (approved) {
            const prodStack = await automation.LocalWorkspace.selectStack({
                stackName: "production",
                projectName: "my-app"
            });
            
            await prodStack.up();
        }
    }
}
```

### Blue-Green Deployments

**Zero-Downtime Deployment Pattern**
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

class BlueGreenDeployment extends pulumi.ComponentResource {
    public readonly activeEndpoint: pulumi.Output<string>;
    
    constructor(name: string, args: BlueGreenArgs, opts?: pulumi.ComponentResourceOptions) {
        super("custom:BlueGreenDeployment", name, {}, opts);
        
        // Application Load Balancer
        const alb = new aws.lb.LoadBalancer(`${name}-alb`, {
            loadBalancerType: "application",
            subnets: args.subnetIds,
            securityGroups: [args.securityGroupId]
        }, { parent: this });
        
        // Blue environment (current)
        const blueTargetGroup = new aws.lb.TargetGroup(`${name}-blue-tg`, {
            port: 80,
            protocol: "HTTP",
            vpcId: args.vpcId,
            healthCheck: {
                path: "/health",
                healthyThreshold: 2,
                unhealthyThreshold: 10
            }
        }, { parent: this });
        
        // Green environment (new)
        const greenTargetGroup = new aws.lb.TargetGroup(`${name}-green-tg`, {
            port: 80,
            protocol: "HTTP",
            vpcId: args.vpcId,
            healthCheck: {
                path: "/health",
                healthyThreshold: 2,
                unhealthyThreshold: 10
            }
        }, { parent: this });
        
        // Listener with weighted routing
        const listener = new aws.lb.Listener(`${name}-listener`, {
            loadBalancerArn: alb.arn,
            port: "80",
            protocol: "HTTP",
            defaultActions: [{
                type: "forward",
                forward: {
                    targetGroups: [
                        {
                            arn: blueTargetGroup.arn,
                            weight: args.blueWeight || 100
                        },
                        {
                            arn: greenTargetGroup.arn,
                            weight: args.greenWeight || 0
                        }
                    ]
                }
            }]
        }, { parent: this });
        
        this.activeEndpoint = alb.dnsName;
    }
}
```

---

## Performance and Optimization

### Resource Parallelization

**Pulumi automatically parallelizes resource creation based on dependencies:**

```typescript
// These resources will be created in parallel
const vpc = new aws.ec2.Vpc("vpc", { cidrBlock: "10.0.0.0/16" });
const s3Bucket = new aws.s3.Bucket("bucket");
const iamRole = new aws.iam.Role("role", { assumeRolePolicy: "..." });

// These depend on VPC and will be created after VPC but in parallel to each other
const subnet1 = new aws.ec2.Subnet("subnet1", { 
    vpcId: vpc.id, 
    cidrBlock: "10.0.1.0/24" 
});
const subnet2 = new aws.ec2.Subnet("subnet2", { 
    vpcId: vpc.id, 
    cidrBlock: "10.0.2.0/24" 
});
```

### State Management Optimization

**Large State Files**
```bash
# Use remote backends for large infrastructures
pulumi login s3://my-state-bucket

# Enable state compression
export PULUMI_ENABLE_LEGACY_DIFF=false

# Parallel refresh for faster state updates
pulumi refresh --parallel 10
```

**State Splitting Strategies**
```typescript
// Split large monolithic stacks into smaller, focused stacks
// Network stack
export const vpcId = vpc.id;
export const subnetIds = [subnet1.id, subnet2.id];

// Application stack (imports network outputs)
const networkStack = new pulumi.StackReference("network-stack");
const vpcId = networkStack.getOutput("vpcId");
const subnetIds = networkStack.getOutput("subnetIds");
```

### Resource Lifecycle Management

**Protect Critical Resources**
```typescript
const database = new aws.rds.Instance("prod-db", {
    // ... configuration
}, { 
    protect: true,  // Prevent accidental deletion
    retainOnDelete: true  // Keep resource if stack is deleted
});
```

**Custom Timeouts**
```typescript
const cluster = new aws.ecs.Cluster("app-cluster", {
    // ... configuration
}, {
    customTimeouts: {
        create: "20m",
        update: "20m",
        delete: "10m"
    }
});
```

---

## Industry Adoption and Use Cases

### Enterprise Adoption

**Fortune 500 Companies Using Pulumi:**
- **Mercedes-Benz** - Multi-cloud infrastructure automation
- **Snowflake** - Data platform infrastructure
- **Tableau** - Analytics platform deployment
- **Cockroach Labs** - Database infrastructure management
- **Sourcegraph** - Developer platform infrastructure

### Common Use Cases

**1. Multi-Cloud Strategy**
```typescript
// Deploy same application to multiple clouds
const awsApp = new AwsApplication("aws-app", {
    region: "us-west-2",
    instanceType: "t3.medium"
});

const azureApp = new AzureApplication("azure-app", {
    region: "West US 2",
    vmSize: "Standard_B2s"
});

const gcpApp = new GcpApplication("gcp-app", {
    region: "us-west1",
    machineType: "e2-medium"
});
```

**2. Kubernetes Platform Engineering**
```typescript
// Platform team creates reusable components
export class KubernetesCluster extends pulumi.ComponentResource {
    public readonly kubeconfig: pulumi.Output<string>;
    public readonly clusterEndpoint: pulumi.Output<string>;
    
    constructor(name: string, args: ClusterArgs, opts?: pulumi.ComponentResourceOptions) {
        super("platform:KubernetesCluster", name, {}, opts);
        
        // EKS cluster with best practices
        const cluster = new aws.eks.Cluster(`${name}-cluster`, {
            version: args.kubernetesVersion || "1.28",
            subnetIds: args.subnetIds,
            instanceTypes: args.instanceTypes || ["t3.medium"],
            desiredCapacity: args.desiredCapacity || 3,
            minSize: args.minSize || 1,
            maxSize: args.maxSize || 10,
            
            // Security best practices
            endpointPrivateAccess: true,
            endpointPublicAccess: false,
            publicAccessCidrs: args.allowedCidrs || ["10.0.0.0/8"],
            
            // Logging
            enabledClusterLogTypes: [
                "api", "audit", "authenticator", "controllerManager", "scheduler"
            ]
        }, { parent: this });
        
        // Install essential addons
        const awsLoadBalancerController = new k8s.helm.v3.Chart(`${name}-aws-lb-controller`, {
            chart: "aws-load-balancer-controller",
            repository: "https://aws.github.io/eks-charts",
            namespace: "kube-system",
            values: {
                clusterName: cluster.name,
                serviceAccount: {
                    create: false,
                    name: "aws-load-balancer-controller"
                }
            }
        }, { parent: this, provider: cluster.provider });
        
        this.kubeconfig = cluster.kubeconfig;
        this.clusterEndpoint = cluster.endpoint;
    }
}
```

**3. Data Platform Infrastructure**
```typescript
// Data engineering teams use Pulumi for data pipelines
class DataPlatform extends pulumi.ComponentResource {
    constructor(name: string, args: DataPlatformArgs, opts?: pulumi.ComponentResourceOptions) {
        super("platform:DataPlatform", name, {}, opts);
        
        // Data Lake (S3)
        const dataLake = new aws.s3.Bucket(`${name}-datalake`, {
            versioning: { enabled: true },
            serverSideEncryptionConfiguration: {
                rule: {
                    applyServerSideEncryptionByDefault: {
                        sseAlgorithm: "AES256"
                    }
                }
            }
        }, { parent: this });
        
        // Data Warehouse (Redshift)
        const dataWarehouse = new aws.redshift.Cluster(`${name}-warehouse`, {
            clusterIdentifier: `${name}-warehouse`,
            databaseName: "analytics",
            masterUsername: "admin",
            masterPassword: args.dbPassword,
            nodeType: "dc2.large",
            numberOfNodes: 2,
            encrypted: true
        }, { parent: this });
        
        // ETL Pipeline (Glue)
        const etlJob = new aws.glue.Job(`${name}-etl`, {
            name: `${name}-etl-job`,
            roleArn: args.glueRoleArn,
            command: {
                scriptLocation: `s3://${args.scriptsBucket}/etl-script.py`,
                pythonVersion: "3"
            },
            defaultArguments: {
                "--job-language": "python",
                "--source-bucket": dataLake.bucket,
                "--target-cluster": dataWarehouse.clusterIdentifier
            }
        }, { parent: this });
    }
}
```

### Migration Patterns

**From Terraform to Pulumi**
```bash
# Convert existing Terraform to Pulumi
pulumi convert --from terraform --language typescript --out ./pulumi-project

# Import existing resources
pulumi import aws:s3/bucket:Bucket my-bucket my-existing-bucket-name
```

**From CloudFormation to Pulumi**
```bash
# Convert CloudFormation templates
pulumi convert --from cloudformation --language python --out ./pulumi-project template.yaml

# Import entire CloudFormation stack
pulumi import aws:cloudformation/stack:Stack my-stack my-existing-stack-name
```

---

## Security and Compliance

### Secrets Management Integration

**HashiCorp Vault Integration**
```typescript
import * as vault from "@pulumi/vault";

const config = new pulumi.Config();
const vaultProvider = new vault.Provider("vault", {
    address: config.require("vaultAddress"),
    token: config.requireSecret("vaultToken")
});

const dbPassword = vault.generic.getSecret({
    path: "secret/database/password"
}, { provider: vaultProvider });

const database = new aws.rds.Instance("db", {
    password: dbPassword.then(secret => secret.data["password"]),
    // ... other config
});
```

**AWS Secrets Manager Integration**
```typescript
const dbSecret = new aws.secretsmanager.Secret("db-password", {
    description: "Database password",
    generateSecretString: {
        length: 32,
        excludeCharacters: "\"@/\\"
    }
});

const database = new aws.rds.Instance("db", {
    password: dbSecret.secretString,
    // ... other config
});
```

### Compliance Frameworks

**SOC 2 Compliance**
```typescript
// Policy to ensure encryption at rest
new policy.PolicyPack("soc2-compliance", {
    policies: [
        {
            name: "encryption-at-rest",
            description: "All storage must be encrypted at rest",
            enforcementLevel: "mandatory",
            validateResource: (args, reportViolation) => {
                if (args.type === "aws:s3/bucket:Bucket") {
                    if (!args.props.serverSideEncryptionConfiguration) {
                        reportViolation("S3 buckets must have encryption enabled");
                    }
                }
                if (args.type === "aws:rds/instance:Instance") {
                    if (!args.props.storageEncrypted) {
                        reportViolation("RDS instances must have storage encryption enabled");
                    }
                }
            }
        }
    ]
});
```

---

## Current Statistics and Ecosystem

### GitHub Repository Stats
- **Stars:** 23,896+ (as of October 2024)
- **Forks:** 1,242+
- **Latest Version:** v3.200.0 (October 2024)
- **Primary Language:** Go
- **Active Providers:** 63+ official providers

### Provider Ecosystem

**Major Cloud Providers**
- AWS (400+ resources)
- Azure (1,000+ resources)  
- Google Cloud (300+ resources)
- Kubernetes (200+ resources)

**Popular Third-Party Providers**
- Docker
- GitHub
- Datadog
- New Relic
- PagerDuty
- Auth0
- Cloudflare
- MongoDB Atlas
- Snowflake

### Community Metrics
- **Slack Community:** 10,000+ members
- **Monthly Downloads:** 2M+ CLI downloads
- **Registry Packages:** 1,000+ community packages
- **GitHub Examples:** 500+ example projects

---

## Updated Resources

### Official Resources
- **Website:** https://www.pulumi.com
- **Documentation:** https://www.pulumi.com/docs
- **GitHub:** https://github.com/pulumi/pulumi
- **Examples:** https://github.com/pulumi/examples
- **Registry:** https://www.pulumi.com/registry

### Community
- **Slack:** Pulumi Community Slack
- **Blog:** https://www.pulumi.com/blog
- **YouTube:** PulumiTV
- **Twitter:** @PulumiCorp

### Learning
- **Getting Started:** https://www.pulumi.com/docs/get-started
- **Tutorials:** https://www.pulumi.com/tutorials
- **Workshops:** https://www.pulumi.com/workshops
- **Certification:** Pulumi Infrastructure as Code Certification

### Enterprise Support
- **Professional Services:** Architecture consulting and migration assistance
- **Training:** Custom team training programs
- **Support Tiers:** Community, Team, Enterprise, Business Critical

---

## Updated Conclusion

Pulumi represents a modern approach to infrastructure as code by leveraging real programming languages instead of domain-specific languages. This allows developers to use familiar tools, IDEs, testing frameworks, and language features while managing cloud infrastructure.

The ability to use loops, conditionals, functions, and classes makes Pulumi code more maintainable and reusable than traditional IaC tools. Type safety and compile-time checking catch errors before deployment. The multi-cloud support and extensive provider ecosystem make it suitable for complex, heterogeneous environments.

With growing enterprise adoption, strong community support, and continuous innovation in areas like policy as code, automation APIs, and platform engineering, Pulumi has established itself as a leading choice for organizations seeking developer-friendly infrastructure automation.

The platform is particularly well-suited for teams that value developer experience, want to use existing programming skills for infrastructure, need multi-cloud capabilities, and require the flexibility and power of real programming languages for complex infrastructure scenarios. As cloud-native architectures continue to evolve, Pulumi's approach of treating infrastructure as software becomes increasingly valuable for modern development teams.
