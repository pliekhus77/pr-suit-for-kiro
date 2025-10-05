---
inclusion: always
---

# Security Strategy Guide (SABSA-Based)

## Purpose
Define security strategy and practices for building secure systems. Based on SABSA (Sherwood Applied Business Security Architecture) framework principles.

## Core Principles

**Business-Driven Security:**
- Security enables business, not just protects
- Start with business requirements
- Traceability from business needs to implementation
- Risk-driven decisions

**Defense in Depth:**
- Multiple layers of security controls
- No single point of failure
- Assume breach mentality

**Least Privilege:**
- Minimum access required for function
- Just-in-time access
- Regular access reviews

**Zero Trust:**
- Never trust, always verify
- Verify explicitly
- Assume breach

## Security by Design (Shift Left)

**Integrate security at every phase:**

| Phase | Security Activities | Deliverables |
|-------|---------------------|--------------|
| **Define** | Threat modeling, security requirements, compliance needs | Security requirements, threat model |
| **Design** | Security architecture, data classification, access control design | Security architecture, ADRs |
| **Develop** | Secure coding, SAST, dependency scanning, code review | Secure code, scan results |
| **Deploy** | DAST, penetration testing, security configuration | Security tests passed, hardened config |
| **Operate** | Monitoring, incident response, vulnerability management | Security metrics, incident reports |

## Threat Modeling (STRIDE)

**Perform during Define/Design phases:**

| Threat | Description | Mitigation |
|--------|-------------|------------|
| **Spoofing** | Impersonating user/system | Authentication (MFA, certificates) |
| **Tampering** | Modifying data/code | Integrity checks, signing, immutable infrastructure |
| **Repudiation** | Denying actions | Audit logging, non-repudiation |
| **Information Disclosure** | Exposing sensitive data | Encryption, access control, data classification |
| **Denial of Service** | Making system unavailable | Rate limiting, auto-scaling, DDoS protection |
| **Elevation of Privilege** | Gaining unauthorized access | Least privilege, RBAC, input validation |

**Process:**
1. Identify assets (data, systems, services)
2. Identify threats using STRIDE
3. Assess risk (likelihood × impact)
4. Define mitigations
5. Document in threat model

## Security Requirements (Every Feature)

**Authentication:** How users/services authenticate, MFA for privileged access, credential policies, session management  
**Authorization:** RBAC/ABAC, least privilege enforced  
**Data Protection:** Classification (public/internal/confidential/restricted), encryption at rest (AES-256) and transit (TLS 1.2+), key management  
**Audit & Logging:** Events logged, retention period, log protection (immutable, encrypted), monitoring/alerting  
**Compliance:** Regulatory (GDPR, HIPAA, SOC2, PCI-DSS), industry standards (ISO 27001), data residency

## Secure Coding

**Input Validation:** Whitelist approach, sanitize outputs (XSS), parameterized queries (SQL injection), validate file uploads  
**Auth:** Never trust client-side, validate server-side, use framework features, proper session management  
**Secrets:** Never hardcode, use Key Vault/Secrets Manager, rotate regularly, use managed identities  
**Error Handling:** Generic messages to users, detailed logs secured, don't expose sensitive info  
**Dependencies:** Keep updated, scan vulnerabilities, trusted sources, pin versions

## Security Testing

| Type | When | Checks |
|------|------|--------|
| **SAST** | Build (CI) | Code vulnerabilities, insecure patterns, hardcoded secrets |
| **DAST** | After deploy to test | Runtime vulnerabilities, config issues, injection flaws |
| **Dependency Scan** | Build (CI) | Known vulnerabilities in dependencies |
| **Container Scan** | Build (pre-push) | Base image vulnerabilities, misconfigurations |
| **Infrastructure Scan** | IaC deployment | Misconfigurations, insecure defaults, compliance |
| **Penetration Test** | Pre-production, annually | Full application and infrastructure (external firm) |

## Security Controls by Layer

**Application:** Input validation, output encoding, auth/authz, session management, error handling, secure config  
**API:** OAuth 2.0/API keys, rate limiting, input validation, CORS, versioning, request/response logging  
**Data:** Encryption at rest/transit, classification, RBAC, masking/tokenization, backup encryption  
**Infrastructure:** Network segmentation, firewalls (NSGs, WAF), DDoS protection, private endpoints, bastion hosts, IaC  
**Identity:** Azure AD/Entra ID, MFA, conditional access, PIM, service principals (least privilege), access reviews

## Secrets Management

**Never:** Hardcode, commit to source control, store in config files, share via email/chat, reuse across environments  
**Always:** Use Key Vault/Secrets Manager, managed identities (no credentials in code), rotate (90 days max), audit access, encrypt at rest/transit  
**Pattern:** Application → Managed Identity → Key Vault → Secret

## Data Classification & Compliance

| Level | Examples | Controls |
|-------|----------|----------|
| **Public** | Marketing materials | Basic access control |
| **Internal** | Internal docs | Authentication required |
| **Confidential** | Customer data, financials | Encryption, RBAC, audit |
| **Restricted** | PII, PHI, payment data | Strong encryption, MFA, strict access |

**GDPR:** Access/rectification/erasure rights, data portability, consent, breach notification (72h)  
**HIPAA:** PHI protection, access controls, audit trails, encryption  
**PCI-DSS:** Cardholder data protection, network segmentation, access control, testing  
**SOC 2:** Security, availability, confidentiality, processing integrity, privacy

## Incident Response

**Preparation:** Plan documented, roles defined, contact lists, runbooks, regular drills  
**Detection:** SIEM, anomaly detection, threat intelligence, user behavior analytics, automated alerting  
**Process:** Identify → Contain → Eradicate → Recover → Learn  
**Communication:** Internal stakeholders, customers (breach), regulators (required), law enforcement (criminal)

## Security Monitoring

**Monitor:** Failed auth, privilege escalation, unusual access, config changes, control failures, vulnerability scans, compliance violations  
**Metrics:** MTTD, MTTR, incident count, vulnerability remediation time, test coverage, compliance score  
**Tools:** SIEM (Sentinel/Security Hub), logging (Monitor/CloudWatch), threat detection (Defender/GuardDuty), APM (App Insights)

## Pre-Production Checklist

- [ ] **Auth/Authz:** MFA enabled, managed identities, least privilege, no default credentials
- [ ] **Data:** Encryption at rest/transit (TLS 1.2+), secrets in Key Vault, classification applied
- [ ] **Network:** Segmentation, private endpoints, NSGs/firewalls, DDoS protection
- [ ] **Monitoring:** Audit logging, security alerts, retention policy, SIEM integration
- [ ] **Compliance:** Regulatory requirements met, policies documented, incident response plan, backup/DR tested
- [ ] **Testing:** SAST/DAST passed (no critical/high), dependency scan passed, penetration test completed

## Security Anti-Patterns

❌ Security as afterthought → ✅ Security by design  
❌ Hardcoded secrets → ✅ Key Vault + managed identities  
❌ No input validation → ✅ Validate all inputs  
❌ Overly permissive access → ✅ Least privilege  
❌ No monitoring → ✅ Comprehensive logging and alerting  
❌ Ignoring vulnerabilities → ✅ Regular scanning and patching  
❌ Single layer of defense → ✅ Defense in depth  
❌ No incident response plan → ✅ Documented and tested plan

## Summary

**Security Principles:**
- Business-driven (enable, not just protect)
- Defense in depth (multiple layers)
- Least privilege (minimum access)
- Zero trust (never trust, always verify)
- Shift left (security from start)

**Key Activities:**
- Threat modeling (STRIDE)
- Security requirements (every feature)
- Secure coding practices
- Security testing (SAST, DAST, scanning)
- Secrets management (Key Vault, managed identities)
- Monitoring and incident response

**Compliance:**
- Data classification
- Regulatory requirements (GDPR, HIPAA, PCI-DSS, SOC2)
- Regular audits and reviews

**Pre-Production Checklist:**
- Authentication, authorization, data protection
- Network security, monitoring, compliance
- All security tests passed

**Golden Rule:** Security is everyone's responsibility. Build it in from the start, not bolt it on at the end.
