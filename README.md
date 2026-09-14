# FollowFlow — Autonomous Commitment Network

> **Keep your promises. Let AI handle the follow-through.**  
> *The AI that remembers what you promised.*

[![AWS Strands](https://img.shields.io/badge/AWS-Strands%20Agents%20SDK-orange.svg)](https://github.com/aws/strands-agents)
[![Bedrock](https://img.shields.io/badge/Amazon%20Bedrock-AgentCore%20Ready-blue.svg)](https://aws.amazon.com/bedrock/)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.3-black.svg)](https://nextjs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hackathon-AWS%20Agents%20for%20Humans-purple.svg)](https://agentsforhumans.devpost.com/)

**FollowFlow** is an autonomous commitment-management AI agent with an optional social trust layer. It detects promises made in conversations, turns them into structured workflows, monitors deadlines, chases missing evidence, follows up automatically, verifies completion, and asks for human intervention only when necessary.

**Target:** [AWS Agents for Humans Hackathon](https://agentsforhumans.devpost.com/) · **Track:** Professional Agents

---

## 🎯 The Core Problem

People make commitments every day:
- *"I'll submit the project proposal tomorrow."*
- *"I'll send the document by Friday."*
- *"I'll complete 30 days of coding with verifiable commits."*

Most commitments disappear after the conversation. The problem is not making promises — it is **remembering them, tracking deadlines, following up, collecting evidence, and verifying completion**.

> **FollowFlow remembers what you promised, follows up when you forget, verifies when you finish, and only interrupts you when a decision is required.**

---

## 🤖 The Autonomous Agent Loop

```text
Commitment detected
       ↓
Understand commitment (Who, What, When, Evidence, Visibility)
       ↓
Create structured workflow
       ↓
Set deadline & calculate risk
       ↓
Monitor automatically in background
       ↓
Check for evidence
       ↓
Follow up contextually (Email / Notification)
       ↓
Re-evaluate & handle dependencies
       ↓
Verify completion with Evidence Engine
       ↓
Ask human only when a decision is required
       ↓
Update transparent Commitment Reliability Score
       ↓
Complete & broadcast to trust network
```

---

## 💎 Signature Features

### 1. AI Commitment Detection Engine
Extracts structured commitments directly from natural language:
```text
"I'll publish my project by Friday and send the GitHub link to my mentor."
→ Commitment A: Publish project (Due Friday, Evidence: GitHub repository)
→ Commitment B: Send link to mentor (Due Friday)
→ Dependency: A blocks B
```

### 2. Evidence Engine (Proof, Not Promises)
A commitment cannot be marked as fulfilled by mere assertion. FollowFlow inspects:
- **GitHub Repositories**: Validates repository existence, public visibility, commit timestamps, and README documentation.
- **Documents & Deliverables**: Validates PDF certificates, signed agreements, and timestamps.
- **Endpoints & URLs**: Probes live HTTP status and health contracts.

### 3. Smart Contextual Follow-up
No generic nagging. The agent uses full context:
> *"You mentioned you'd publish the AI project by Friday. I haven't found the repository yet. Any blockers or would you like to reschedule?"*

### 4. Transparent Reliability Score
Never an opaque AI guess. Calculated using documented rules:
- **Verified on-time**: `+1.0 point`
- **Verified late**: `+0.5 points`
- **Rescheduled before deadline**: `+0.5 points / Neutral` (proactive reschedules are never penalized)
- **Missed without explanation**: `0 points`
- **Repeated unexplained misses**: `-1.0 point penalty`

### 5. Social Trust Layer (Accountability Without the Noise)
Not an algorithmic entertainment feed:
- **Commitment Feed**: High-signal stream of public commitments and verified deliverables.
- **Support**: Community members can support and cheer commitments.
- **30-Day Builder Challenge**: Sprints with daily proof tracking and streak leaderboards.
- **Public Reliability Profile**: Displays verified rate, streaks, and earned trust badges (*Verified Builder*, *Consistent*, *Long Streak*, *Trusted Finisher*).

### 6. Human-in-the-Loop Safeguards
When confidence is low or ambiguous conflicts arise (e.g. conflicting bank documents or deliverable versions), the agent pauses and presents:
- **Why I stopped**
- **My recommendation**
- **Decision options**
Once a human selects a choice, the agent resumes execution autonomously.

---

## 🏗️ Architecture

```text
                        USER / BROWSER
                              │
                              ▼
                       ┌──────────────┐
                       │   Next.js    │
                       │   Web App    │
                       └──────┬───────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   FastAPI    │
                       │ REST Backend │
                       └──────┬───────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │   STRANDS AGENT   │
                    │    Core Brain     │
                    └─────────┬─────────┘
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     Commitment Tools  Evidence Tools    Promise Tools
            │                 │                 │
            └─────────────────┼─────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
          Supabase         Mailpit         Bedrock
          Postgres       Local Email      AgentCore
            (RLS)          (SMTP)         (Runtime)
```

---

## 🔧 Tech Stack

| Layer | Technology |
|---|---|
| **Agent Framework** | **AWS Strands Agents SDK v1.55.1** |
| **Cloud Deployment** | **Amazon Bedrock AgentCore Runtime** (`/ping` + `/invocations` contract) |
| **Backend** | Python 3.12, FastAPI, Pydantic v2 |
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, Lucide Icons |
| **Database** | Supabase PostgreSQL with Row Level Security (RLS) |
| **Local LLM Dev** | Ollama (`qwen2.5:1.5b`) |
| **Production LLM** | Amazon Bedrock (`us.amazon.nova-lite-v1:0` / Claude 3.5 Sonnet) |
| **Email Service** | aiosmtplib + Mailpit |

---

## 🚀 Quick Start

### 1. Clone & Setup
```bash
git clone https://github.com/mittai17/followflow.git
cd followflow
cp .env.example .env
```

### 2. Start Backend Agent
```bash
cd apps/agent
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend Web App
```bash
cd apps/web
npm install
npm run dev
```

### 4. Start Local Email Simulator (Mailpit)
```bash
docker run -d --name mailpit -p 8025:8025 -p 1025:1025 axllent/mailpit:latest
```

---

## 🎬 Running the 15-Step Autonomous Demo

1. Open **[http://localhost:3000/demo](http://localhost:3000/demo)**.
2. Select speed: **Instant Demo** (for quick judging review) or **Normal** (for step-by-step observation).
3. Click **"Run Autonomous Commitment Demo"**:
   - **Step 1**: Public commitment created: *"Publish open-source AI agent by Friday"*
   - **Step 2**: Evidence requirements identified (GitHub repo, README, timestamp)
   - **Step 3**: Background verification check scheduled
   - **Step 4**: Deadline approaches (T-24h warning)
   - **Step 5**: Evidence check fails (repository not found)
   - **Step 6**: Autonomous follow-up email dispatched via SMTP (visible at [http://localhost:8025](http://localhost:8025))
   - **Step 7**: User replies: *"Polishing docs, will publish tomorrow"*
   - **Step 8**: Proactive deadline reschedule approved without penalty
   - **Step 9**: Evidence submitted (GitHub repository URL)
   - **Step 10**: Evidence Engine validates repository (checks 5/5 pass)
   - **Step 11**: Commitment status transitions to **VERIFIED**
   - **Step 12**: Reliability score incremented by `+1.0 points`
   - **Step 13**: Achievement broadcasted to community feed
   - **Step 14**: Public profile updated (+1 verified, streak incremented)
   - **Step 15**: Full audit trail committed to database

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
