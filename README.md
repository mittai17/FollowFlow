# FollowFlow

> **The AI employee that makes sure work never gets stuck.**

[![AWS](https://img.shields.io/badge/AWS-Strands%20Agents-orange)](https://github.com/aws/strands-agents)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)
[![Hackathon](https://img.shields.io/badge/Hackathon-Agents%20for%20Humans-green)](https://agentsforhumans.devpost.com/)

FollowFlow is an autonomous AI operations agent that tracks commitments, chases missing documents, verifies evidence, monitors deadlines and dependencies, and keeps professional workflows moving — while bringing humans in only when a real decision is required.

**Built for:** [AWS Agents for Humans Hackathon](https://agentsforhumans.devpost.com/) | **Track:** Professional Agents

---

## 🎯 The Problem

Businesses lose thousands of hours because work gets stuck:

- Someone promised to send a document — and everyone forgot
- A vendor hasn't replied in days
- An approval is waiting on a missing signature
- A deadline is approaching but nobody knows the status
- A document arrived but nobody checked if it's valid

**People shouldn't have to remember to follow up. FollowFlow remembers, acts, verifies and escalates.**

---

## 🤖 How FollowFlow Works

```
Observe → Reason → Act → Wait → Re-evaluate → Escalate → Complete
```

1. **Detect** — Agent monitors messages, emails, and case status
2. **Understand** — AI extracts commitments and promises from natural language
3. **Plan** — Agent calculates risk, identifies blockers, determines next action
4. **Act** — Sends follow-ups, verifies documents, updates records
5. **Wait** — Schedules automated checks at deadlines
6. **Re-evaluate** — Monitors progress continuously
7. **Escalate** — Requests human decision only when genuinely needed
8. **Complete** — Closes case when all evidence is verified

---

## 🏗️ Architecture

```
followflow/
├── apps/
│   ├── web/          # Next.js 15 frontend (TypeScript, Tailwind, Framer Motion)
│   └── agent/        # FastAPI + Strands Agents SDK backend
├── supabase/
│   └── migrations/   # PostgreSQL schema with RLS
├── docs/
│   ├── HACKATHON_STRATEGY.md
│   └── architecture.md
└── docker-compose.yml
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Lucide |
| Backend | Python 3.12, FastAPI, Strands Agents SDK v1.55.1 |
| Database | Supabase (PostgreSQL + RLS) |
| LLM | Ollama (local) / Amazon Bedrock (production) |
| Email | Mailpit (dev) / SMTP (prod) |
| Agent Framework | **AWS Strands Agents SDK** |

---

## 🔑 Signature Features

### 1. Commitment Engine
Detects promises from natural language using AI:
```
"I'll send the bank statement tomorrow"
→ { person: "Rahul", commitment: "Send bank statement", deadline: "2026-09-14", confidence: 0.94 }
```

### 2. Promise Verification
Never marks complete without evidence. Agent inspects each document.

### 3. Dependency Engine
Understands that Bank Details → Finance Verification → Final Approval.

### 4. Human-in-the-Loop
Agent pauses and requests human decision for ambiguous/high-risk situations.

### 5. Demo Simulator
One-click 14-step demo that executes the real workflow — nothing is faked.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+, Python 3.12+
- Ollama with `qwen2.5:1.5b` model
- Mailpit (optional, for email demo)

### 1. Clone & Setup

```bash
git clone https://github.com/yourusername/followflow
cd followflow
cp .env.example .env  # fill in Supabase credentials
```

### 2. Start Backend

```bash
cd apps/agent
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

### 4. Start Mailpit (email simulator)

```bash
docker run -p 8025:8025 -p 1025:1025 axllent/mailpit
```

### 5. Or use Docker Compose

```bash
docker compose up
```

---

## 🔧 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# LLM
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5:1.5b
STRANDS_MODEL_PROVIDER=ollama   # or "bedrock" for AWS

# Email
SMTP_HOST=localhost
SMTP_PORT=1025

# Agent
AGENT_SECRET=your-secret
```

---

## 🎬 Running the Demo

1. Open `http://localhost:3000/demo`
2. Click **"Start Vendor Onboarding Demo"**
3. Watch the agent execute 14 steps autonomously:
   - Creates vendor case
   - Detects vendor promise from message
   - Schedules deadline check
   - Sends follow-up email (visible in Mailpit at `:8025`)
   - Receives documents → verifies each one
   - Detects conflict → requests human decision
   - Human approves → agent resumes
   - Case completed

---

## 🤖 Strands Agent Tools

The agent uses 18 real tool calls:

| Tool | Purpose |
|------|---------|
| `get_case` / `update_case` | Read and update case state |
| `extract_commitment` | AI promise detection from text |
| `create_promise` / `update_promise` | Track commitments |
| `verify_document` | AI document validation |
| `send_email` | Real SMTP email sending |
| `schedule_followup` | Queue future checks |
| `check_deadlines` | Calculate deadline risk |
| `request_human_approval` | Pause for human decision |
| `resume_case` | Resume after human decides |
| `log_activity` | Event timeline logging |
| `complete_case` | Verify and close case |

---

## 🔒 Security

- Supabase Row Level Security on all tables
- Organization isolation — users only see their data
- Service role key never exposed to frontend
- All agent actions logged for audit

---

## 🗺️ Roadmap

- [ ] Amazon Bedrock AgentCore deployment
- [ ] Multi-channel monitoring (email, Slack, Teams)
- [ ] PDF/OCR document verification
- [ ] SLA tracking and analytics
- [ ] Mobile app

---

## 📄 License

MIT — see [LICENSE](LICENSE)

---

## 🏆 Hackathon

Built for the **[AWS Agents for Humans Hackathon](https://agentsforhumans.devpost.com/)** — Professional Agents track.

*FollowFlow demonstrates the complete autonomous agent loop: Observe → Reason → Act → Wait → Re-evaluate → Escalate → Complete, using the AWS Strands Agents SDK.*
