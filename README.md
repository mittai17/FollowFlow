# FollowFlow — Autonomous Commitment Network

> **Keep your promises. Let AI handle the follow-through.**  
> *The autonomous AI employee that remembers what you promised, monitors deadlines, verifies evidence across industry apps, and drives follow-through without human nagging.*

[![AWS Strands](https://img.shields.io/badge/AWS-Strands%20Agents%20SDK%20v1.55.1-FF9900.svg?logo=amazon-aws&logoColor=white)](https://strandsagents.com/docs/user-guide/quickstart/overview/)
[![Bedrock](https://img.shields.io/badge/Amazon%20Bedrock-AgentCore%20Ready-232F3E.svg?logo=amazon-aws&logoColor=white)](https://aws.amazon.com/bedrock/)
[![AWS Builder](https://img.shields.io/badge/AWS%20Builder%20Center-Profile%20Verified-0052CC.svg)](https://builder.aws.com/profile?tab=badges)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.3%20Standalone-000000.svg?logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase%20RLS-336791.svg?logo=postgresql&logoColor=white)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-10B981.svg)](LICENSE)

---

## 🎯 The Core Problem

People make commitments every day:
- *"I'll publish the revised API spec tomorrow."*
- *"I'll send the SOC-2 compliance checklist by Friday."*
- *"I'll complete the AWS infrastructure migration by Monday morning."*

Most commitments disappear after the conversation. The bottleneck isn't making promises — it is **remembering them, structuring milestones, tracking deadlines across disconnected tools, verifying completion with immutable proof, and chasing deliverables**.

> **FollowFlow is the autonomous AI agent that detects promises, turns them into structured multi-team workflows, monitors progress in the background, verifies deliverables directly against industry tools (GitHub, Slack, Notion, Jira, AWS), and interrupts humans only when a decision is required.**

---

## 🌟 What Makes FollowFlow Industrial-Grade

### 1. Unique Username Culture (`@username`)
Every collaborator has a unique, verifiable username handle stored in the PostgreSQL database:
- **Zero Dummy Data**: No hardcoded mock users in UI components. Every persona (`@rahulk`, `@sarahc`, `@alexr`, `@priyap`, `@mittai`) is resolved natively through `/api/users`.
- **Dynamic Identity**: Profiles, team memberships, SLA compliance, and cryptographic badges are bound to real DB records.
- **Persona Switcher**: Switch active handles seamlessly across the app to test multi-user workflows.

### 2. AWS Strands Agents SDK (v1.55.1) Core
Built strictly on the **AWS Strands Agents SDK**:
- **Tool Calling**: Registered `@tool` decorators for `lookup_industry_integration`, `calculate_commitment_horizon`, and `verify_sla_compliance`.
- **Synchronous-to-Async Bridge**: Non-blocking execution wrapped in `run_in_executor` to seamlessly interface with FastAPI's asynchronous event loop.
- **Inline Strands AI Copilot UX**: Rather than bouncing users to a separate screen, an inline toggle `[✨ Strands AI Copilot: ON/OFF]` sits right inside the commitment dialog, autocompleting fields in real-time.

### 3. Industry Apps Integration Matrix
Commitments connect directly to industry platforms for evidence collection and automated verification:

| Industry App | Provider Key | Evidence Collected & Verified |
|---|---|---|
| **GitHub** | `github` | Commits, PR merge state, git tree hash, repo accessibility |
| **Slack / Stack** | `slack` | Message permalinks, emoji sign-offs, channel confirmation |
| **Notion** | `notion` | Page status property, edit timestamps, content hash |
| **LinkedIn** | `linkedin` | Post publication URL, author URN verification |
| **Jira / Linear** | `jira_linear` | Ticket status (`Done`/`Closed`), resolution timestamp |
| **AWS Cloud** | `aws` | CloudFormation stack state, S3 receipts, CloudTrail events |
| **Google Docs** | `google_docs` | Document revision ID, sharing status, comment approvals |

### 4. Multi-Organization & Multi-Team Governance
Enterprise-grade multi-tenancy:
- **Hierarchical Scoping**: Organizations (`FollowFlow Labs`, `Acme Systems`, `Starlight AI`) host scoped teams (`Core Platform`, `AI Research & Agents`, `Infrastructure & Cloud SRE`).
- **Configurable SLA Policies**: Custom target fulfillment rates (e.g. 95%) and automated grace periods (24h–72h).
- **Interactive Management**: Create and manage organizations and teams on the fly with live API persistence.

### 5. AWS Builder Center Badges & Cryptographic Trust Layer
Inspired by **[AWS Builder Center Badges](https://builder.aws.com/profile?tab=badges)**:
- **Cryptographic Evidence Modals**: Every earned badge and fulfilled commitment contains an immutable audit payload (SHA-256 evidence digest, issuer verification, validation ID `FF-AWS-2026-XXXXX`).
- **Earned Badges**: *Cloud Practitioner*, *Autonomous Agent Specialist*, *Generative AI Builder*, *Solutions Architect*, and *Zero-Failure Finisher*.

### 6. Enterprise Production Suite
A full suite of production-ready pages designed with a clean, quiet Linear/Vercel aesthetic:
- **`404` (`/not-found.tsx`)**: Enterprise recovery page with incident status link.
- **`500` (`/error.tsx`)**: Error boundary capturing exceptions with unique trace IDs.
- **Terms of Service (`/terms`)**: SLA commitments, acceptable use, subscription plans.
- **Privacy Policy (`/privacy`)**: SOC-2 Type II posture, GDPR compliance, zero-retention token handling.
- **AI Transparency Disclaimer (`/disclaimer`)**: Ambiguity Stop Rule and human override guarantees.
- **Security Whitepaper (`/security`)**: AWS Bedrock Guardrails, TLS 1.3, encrypted vault.
- **Real-Time System Status (`/status`)**: Component uptime (99.99%), latency telemetry, 45-day history.
- **Enterprise Support Desk (`/support`)**: Dedicated Slack Connect, P1-P3 SLA escalation matrix.

---

## 🏗️ System Architecture

```text
                                  USER / CLIENT
                                        │
                                        ▼
                         ┌─────────────────────────────┐
                         │   Next.js 15 Web App        │
                         │   (Standalone Container)    │
                         └──────────────┬──────────────┘
                                        │  HTTP / REST
                                        ▼
                         ┌─────────────────────────────┐
                         │   FastAPI Backend API       │
                         │   (Python 3.12 + Uvicorn)   │
                         └──────────────┬──────────────┘
                                        │
                 ┌──────────────────────┼──────────────────────┐
                 ▼                      ▼                      ▼
    ┌─────────────────────────┐  ┌──────────────┐  ┌─────────────────────────┐
    │  AWS Strands Agent      │  │  Evidence    │  │  Amazon Bedrock         │
    │  (v1.55.1 SDK + Tools)  │  │  Engine      │  │  AgentCore Runtime      │
    └────────────┬────────────┘  └──────┬───────┘  │  (/ping + /invocations) │
                 │                      │          └─────────────────────────┘
                 ▼                      ▼
    ┌─────────────────────────┐  ┌───────────────────────────────────────────┐
    │  Supabase PostgreSQL    │  │  Industry Connectors                      │
    │  - users (@username)    │  │  - GitHub API (Commits, Tree Hash)        │
    │  - organizations & teams│  │  - Slack / Notion / Jira / AWS / Docs     │
    │  - commitments (RLS)    │  │  - Mailpit / Amazon SES (SMTP Follow-up)  │
    └─────────────────────────┘  └───────────────────────────────────────────┘
```

---

## 🤖 The Autonomous Agent Execution Loop

```text
1. Commitment Detected / Captured
       ↓
2. Strands Agent Architect Structures Workflow
       (Who [@username], What, When, Evidence Provider, Scope)
       ↓
3. Organization SLA Compliance Checked
       (Target fulfillment rate, grace period window)
       ↓
4. Autonomous Background Monitoring
       (Time-to-deadline triggers, risk tier calculation)
       ↓
5. Multi-Platform Evidence Inspection
       (GitHub SHA check, Notion block check, Jira ticket state)
       ↓
6. Contextual Follow-Up Dispatched
       (Non-nagging, actionable email via Amazon SES / Mailpit)
       ↓
7. Ambiguity Stop Rule (Human-in-the-Loop)
       (If conflicting evidence or low confidence: pause, recommend, await decision)
       ↓
8. Cryptographic Proof Generated
       (SHA-256 evidence digest + AWS Builder Center Badge update)
       ↓
9. Reliability Score & Org Metrics Updated
```

---

## 📡 Core API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/commitments` | Query commitments filtered by `username`, `organization_name`, `team_name` |
| `POST` | `/api/commitments` | Create structured commitment bound to `@username` and industry provider |
| `POST` | `/api/commitments/ai/guide` | Consult AWS Strands Agent Architect with prompt |
| `GET` | `/api/organizations` | List all tenant organizations and SLA policies |
| `POST` | `/api/organizations` | Create tenant organization with default platform team |
| `GET` | `/api/teams` | Query teams with optional `?organization_id=` filter |
| `POST` | `/api/teams` | Create new team with designated lead handle |
| `GET` | `/api/users` | Autocomplete user handles across the company |
| `GET` | `/api/users/{username}` | Fetch user profile, bio, title, and reliability score |
| `GET` | `/api/integrations` | Returns industry app integration catalog & capabilities |
| `POST` | `/api/integrations/connect` | Live-validate and connect user accounts for industry apps |
| `GET` | `/api/profile/{username}` | Returns AWS Builder Center profile with cryptographic badge verification |
| `GET` | `/ping` | Amazon Bedrock AgentCore health check endpoint |
| `POST` | `/invocations` | Amazon Bedrock AgentCore invocation contract |

---

## 🚀 Getting Started (Local Development)

### 1. Prerequisites
- Node.js 20+
- Python 3.12+
- Docker (for Mailpit email simulator)
- Ollama with `qwen2.5:1.5b` (or Amazon Bedrock credentials)

### 2. Clone & Environment Setup
```bash
git clone https://github.com/mittai17/followflow.git
cd followflow
cp .env.example .env
```

### 3. Start Local Services
```bash
# Start Mailpit (Local SMTP simulator)
docker run -d --name mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit:latest

# Ensure Ollama has the base model
ollama run qwen2.5:1.5b
```

### 4. Start Backend (Port 8000)
```bash
cd apps/agent
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Start Frontend (Port 3000)
```bash
cd apps/web
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** to explore FollowFlow.

---

## ☁️ Live Production Deployment on AWS

FollowFlow is hosted live on **Amazon ECS Fargate** with **Amazon ECR** and **Amazon Bedrock**:

- **Production Web Application**: **[http://13.217.58.190:3000](http://13.217.58.190:3000)**
- **Production Agent API**: **[http://13.217.58.190:8000/health](http://13.217.58.190:8000/health)**
- **AWS Region**: `us-east-1`
- **AWS Account ID**: `798404182134`
- **ECS Cluster**: `arn:aws:ecs:us-east-1:798404182134:cluster/followflow-production`
- **ECS Service**: `followflow-service` (Launch Type: Fargate, Status: ACTIVE)
- **Task Definition**: `arn:aws:ecs:us-east-1:798404182134:task-definition/followflow-production-task:1`
- **ECR Web Image**: `798404182134.dkr.ecr.us-east-1.amazonaws.com/followflow-web:latest`
- **ECR Agent Image**: `798404182134.dkr.ecr.us-east-1.amazonaws.com/followflow-agent:latest`

### Automated Deployment Script
Deploy updates to production with a single command:
```bash
./scripts/deploy_aws.sh
```

---

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.
