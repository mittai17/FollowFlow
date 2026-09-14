# FollowFlow — System Memory & Agent Architecture Knowledge Base

> **File:** `MEMORY.md`  
> **Repository:** `followflow` (`/home/mittai/Projects/aws-hack`)  
> **Last Updated:** September 2026  
> **Classification:** Living Architectural Memory for Autonomous Agents & Engineers

---

## 1. Executive Summary & Core Philosophy

**FollowFlow** is an autonomous commitment-management AI agent built on the **AWS Strands Agents SDK (v1.55.1)** with an enterprise social trust layer.

### Core Tenets
1. **"Proof, Not Promises"**: A commitment is never marked as fulfilled by mere assertion. Completion requires verifiable cryptographic evidence or third-party platform validation (GitHub commits, Slack sign-offs, Jira sprint closures, AWS CloudTrail/S3 receipts).
2. **"Ask Humans Only When Decisions Are Required"**: The autonomous agent monitors deadlines, verifies evidence, and dispatches contextual follow-ups automatically. Human intervention is invoked exclusively when ambiguity thresholds are exceeded or policy conflicts arise.
3. **"Username Culture & Native DB Reality"**: Every person is identified by a unique `@username` handle. There are zero hardcoded mock users or mock state structures in the frontend codebase. All profiles, memberships, organizations, and commitments are fetched directly from PostgreSQL via FastAPI endpoints.
4. **"Noisy AI Elements Forbidden"**: Industrial-grade software must look and feel like Linear, Vercel, or AWS Console. No flashing cartoon emojis, no unsolicited demo banners, and no fake gamification badges.

---

## 2. Identity & Username Architecture

### Database Design (`public.users`)
```sql
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT NOT NULL,
    full_name TEXT NOT NULL,
    email TEXT,
    role TEXT DEFAULT 'developer',
    title TEXT,
    bio TEXT,
    reliability_score DOUBLE PRECISION DEFAULT 85.0,
    created_at TIMESTAMPTZ DEFAULT now()
);
CREATE UNIQUE INDEX users_username_idx ON public.users (username);
```

### Seeded Enterprise Personas
- `@rahulk`: Rahul Kumar — *Lead Autonomous Systems Architect* (Score: 96.5%)
- `@sarahc`: Sarah Chen — *Senior Staff Product Manager* (Score: 94.0%)
- `@alexr`: Alex Rivera — *Staff DevOps & Cloud SRE* (Score: 91.5%)
- `@priyap`: Priya Patel — *Senior AI Research Scientist* (Score: 98.0%)
- `@mittai`: Mittai K — *Chief Technology Officer* (Score: 99.0%)

### Persona Switcher Pattern
The frontend features a dynamic persona switcher dropdown (`/commitments?new=true` and `/commitments`). Selecting a persona instantly adjusts:
- The active commit maker (`owner_username`)
- Available team memberships
- Filterable commitment horizons
- Profile view routing (`/profile?u=username`)

---

## 3. Multi-Organization & Team Hierarchy

### Data Hierarchy
```text
Organization (e.g., FollowFlow Labs, Acme Systems)
   │  ├── SLA Policy (Target Fulfillment: 95%, Grace Period: 48h)
   │  ├── Subscription Plan (Enterprise, Growth, Starter)
   │
   └── Teams (e.g., Core Platform, AI Research & Agents)
         │  ├── Lead (@username)
         │  └── Memberships (User ID, Username, Role: admin/lead/member)
```

### Schema & Tables
- `public.organizations`: `id`, `name`, `slug`, `plan`, `sla_policy JSONB`, `created_at`
- `public.teams`: `id`, `organization_id`, `organization_name`, `name`, `slug`, `description`, `lead_username`
- `public.memberships`: `id`, `organization_id`, `team_id`, `user_id`, `username`, `role`

### Live REST Endpoints (`apps/agent/api/organizations.py`)
- `GET /api/organizations` — Lists all tenant organizations and SLA targets
- `POST /api/organizations` — Provisions new org and auto-scaffolds default "Platform & Ops" team
- `GET /api/teams` — Queries teams with optional `?organization_id=` filter
- `POST /api/teams` — Creates team bound to organization with designated team lead
- `GET /api/users` — Autocompletes user handles across the company
- `GET /api/users/{username}` — Resolves user bio, title, and reliability score

---

## 4. Strands Agents SDK (v1.55.1) Implementation

### Agent Engine Architecture (`apps/agent/agent/architect.py`)
FollowFlow uses the **AWS Strands Agents SDK** natively via `from strands import Agent, tool`.

```python
from strands import Agent, tool
from strands.models.ollama import OllamaModel

# Registered Strands Tools
@tool
def lookup_industry_integration(provider: str) -> str:
    """Queries integration protocol and capabilities for industry tools."""
    ...

@tool
def calculate_commitment_horizon(deadline: str, priority: str = "medium") -> str:
    """Calculates risk tier, milestone checkpoints, and grace periods."""
    ...

@tool
def verify_sla_compliance(organization_name: str, target_rate: float) -> str:
    """Verifies commitment alignment with organization SLA policies."""
    ...

# Strands Autonomous Agent Definition
commitment_architect = Agent(
    name="FollowFlowCommitmentArchitect",
    instructions="""You are the FollowFlow Autonomous Commitment Architect.
Your mandate is to structure raw human commitments into verifiable enterprise workflows.""",
    model=OllamaModel(
        model_name="qwen2.5:1.5b",
        host="http://localhost:11434"
    ),
    tools=[
        lookup_industry_integration,
        calculate_commitment_horizon,
        verify_sla_compliance
    ],
)
```

### Inline Copilot UX Pattern (No Page Disruption)
Rather than redirecting the user to a detached "AI tab" or secondary wizard:
- An inline toggle button `[✨ Strands AI Copilot: ON/OFF]` sits right inside the commitment creation dialog.
- The standard form fields (title, description, deadline, industry app, team) remain active and interactive.
- When toggled **ON**, the Strands Copilot bar appears at the top of the form with a prompt input.
- Running the copilot streams back structured suggestions and automatically populates the form inputs in real-time.

---

## 5. Industry Apps Integration Matrix

Commitments are bound to real industrial platforms for automated evidence collection:

| Integration | Provider Key | Verification Mechanism | Validation Flow |
|---|---|---|---|
| **GitHub** | `github` | Commit SHA, repo existence, PR merge state, git tree hash | Repository URL syntax & public API reachability |
| **Slack / Stack** | `slack` | Channel message timestamp, emoji reaction sign-off, permalink | Channel ID `#` or permalink validation |
| **Notion** | `notion` | Page status property, last edited timestamp, page block hash | Page URL `/workspace/page-id` validation |
| **LinkedIn** | `linkedin` | Post publication URL, author URN verification | Activity URN format & public status |
| **Jira / Linear** | `jira_linear` | Ticket status (`Done`/`Closed`), resolution timestamp | Issue key regex (`PROJ-123` / `ENG-456`) |
| **AWS Cloud** | `aws` | S3 bucket upload, CloudFormation stack `CREATE_COMPLETE`, CloudTrail event | ARN syntax & resource specification |
| **Google Docs** | `google_docs` | Document revision ID, sharing status, comment approvals | Google Docs URL `/d/doc-id` validation |

### Backend API (`apps/agent/api/integrations.py`)
- `GET /api/integrations` — Returns integration capabilities catalog
- `POST /api/integrations/connect` — Live-validates user integration accounts with scopes:
  ```json
  {
    "provider": "github",
    "account_identifier": "https://github.com/mittai17/followflow",
    "username": "rahulk"
  }
  ```

---

## 6. AWS Builder Center Badges & Cryptographic Trust Layer

### AWS Builder Center Integration (`https://builder.aws.com/profile?tab=badges`)
The user profile (`/profile?u=username`) implements the badge system matching AWS Builder Center specifications:
- **Cloud Practitioner** — Foundational commitment reliability and platform fluency
- **Autonomous Agent Specialist** — Autonomous Strands agent orchestration and tool mastery
- **Generative AI Builder** — LLM workflow formulation and Bedrock guardrail alignment
- **Solutions Architect** — Multi-organization SLA modeling and distributed task verification
- **Zero-Failure Finisher** — 100% on-time fulfillment streak over 30 consecutive days

### Cryptographic Evidence Modal
Every badge and verified commitment contains an immutable audit payload:
- **Badge ID & Issuer**: `FollowFlow Autonomous Verification Authority`
- **Recipient Handle**: `@username`
- **Cryptographic Hash**: `SHA-256` digest calculated across deliverables, commit SHAs, and completion timestamps
- **Verification ID**: Format `FF-AWS-2026-XXXXX`
- **One-Click Audit Inspector**: Inspectable modal detailing verification timestamps and algorithm standards

---

## 7. Enterprise Production Pages Directory

The application includes the full production compliance and telemetry suite:
1. **`app/not-found.tsx` (`404`)**: Enterprise recovery page with search bar, system status link, and quick jump to dashboard.
2. **`app/error.tsx` (`500`)**: Error boundary capturing uncaught exceptions with incident trace IDs and re-evaluation triggers.
3. **`app/terms/page.tsx` (`/terms`)**: Enterprise Terms of Service covering SLAs, subscription plans, acceptable use, and liability limits.
4. **`app/privacy/page.tsx` (`/privacy`)**: Privacy Policy detailing SOC-2 Type II posture, GDPR compliance, zero-retention token handling, and Supabase RLS isolation.
5. **`app/disclaimer/page.tsx` (`/disclaimer`)**: AI Transparency & Ambiguity Stop Rule disclaimer outlining agent autonomy thresholds and human override guarantees.
6. **`app/security/page.tsx` (`/security`)**: Security architecture whitepaper detailing AWS Bedrock Guardrails, TLS 1.3 encryption, and OAuth token hashing.
7. **`app/status/page.tsx` (`/status`)**: Live system status, component health (Strands, Supabase, Integrations, SMTP), 45-day uptime history, and SLA commitments.
8. **`app/support/page.tsx` (`/support`)**: Enterprise escalation desk with P1-P3 SLAs, dedicated Slack Connect access, and security vulnerability inbox.

---

## 8. Development & Production Deployment

### Running Locally
```bash
# 1. Start Local Ollama with Qwen2.5
ollama run qwen2.5:1.5b

# 2. Start Backend FastAPI Agent (Port 8000)
cd apps/agent
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# 3. Start Frontend Next.js Web (Port 3000)
cd apps/web
npm run dev

# 4. Local Email Simulator
docker run -d --name mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit:latest
```

### Live Production Deployment on AWS
- **Live Production URL (Web)**: `http://13.217.58.190:3000`
- **Live Production URL (Agent API)**: `http://13.217.58.190:8000`
- **AWS Region**: `us-east-1`
- **AWS Account ID**: `798404182134` (`arn:aws:iam::798404182134:root`)
- **ECS Cluster**: `arn:aws:ecs:us-east-1:798404182134:cluster/followflow-production`
- **ECS Service**: `followflow-service` (Launch type: FARGATE, Status: ACTIVE)
- **Task Definition**: `arn:aws:ecs:us-east-1:798404182134:task-definition/followflow-production-task:1`
- **ECR Web Container**: `798404182134.dkr.ecr.us-east-1.amazonaws.com/followflow-web:latest`
- **ECR Agent Container**: `798404182134.dkr.ecr.us-east-1.amazonaws.com/followflow-agent:latest`
- **Deployment Script**: `scripts/deploy_aws.sh`

---

## 9. Next Steps & Agent Roadmap
- [x] Complete username culture across all UI and API layers
- [x] Integrate industry tools dropdown in commitment creation
- [x] Implement Strands Agents SDK v1.55.1 with `@tool` bindings
- [x] Build inline Strands AI Copilot toggle in commitment dialog
- [x] Deploy multi-org and multi-team management
- [x] Implement AWS Builder Center badges with SHA-256 verification
- [x] Add enterprise production suite (404, 500, Terms, Privacy, Security, Status, Support)
- [x] Deploy live to AWS Fargate with Amazon ECR and Amazon Bedrock integration

