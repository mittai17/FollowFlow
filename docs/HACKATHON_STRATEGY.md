# 🏆 Hackathon Strategy — Agents for Humans
> FollowFlow submission plan for winning the **Professional Agents** track

---

## Hackathon Facts

| Field | Value |
|-------|-------|
| **Name** | Agents for Humans Hackathon |
| **Host** | AWS / Devpost |
| **Started** | Aug 10, 2026 |
| **Deadline** | **Sep 14, 2026 at 8:00 PM EDT** ⚠️ |
| **Total prizes** | $40,000 cash |
| **AWS credits** | $50 per team |
| **Bonus** | Publish on builder.aws.com for extra points |

---

## Prize Breakdown

| Prize | Track | Amount |
|-------|-------|--------|
| 🥇 Grand Prize | Best overall | **$10,000** |
| 🥇 Golden Agent | Professional Agents | **$5,000** |
| 🥈 Silver Agent | Professional Agents | $3,000 |
| 🥉 Bronze Agent | Professional Agents | $2,000 |
| 🥇 Golden Agent | Everyday Agents | $5,000 |
| 🥇 Golden Agent | Good Neighbor Agents | $5,000 |

**Our target: Professional Agents Golden Agent ($5,000) + Grand Prize ($10,000)**

---

## Judging Criteria (ranked by importance)

### 1. Technological Implementation (HIGHEST WEIGHT)
> How thoroughly does the project use **Strands Agents**?  
> Does the code reflect genuine effort and a working, non-trivial implementation?  
> **A live demo and/or Amazon Bedrock AgentCore deployment will strengthen this score.**

✅ **FollowFlow must:**
- Use Strands Agents SDK as the core agent loop (NOT simulated)
- Show real tool calling: extract_commitment, verify_document, schedule_followup, etc.
- Deploy to **Amazon Bedrock AgentCore** for maximum points
- Have a working live demo that judges can watch/run

### 2. Design
> Complete, coherent product experience — not just a technical proof of concept.

✅ **FollowFlow must:**
- Have beautiful bento dashboard (not a CRUD app)
- All pages working end-to-end
- Polished UX across all flows

### 3. Potential Impact
> Credible, specific case for solving a real problem for a real audience.

✅ **FollowFlow's case:**
- Problem: Work gets stuck. Promises are forgotten. Deadlines slip.
- Audience: Operations teams, procurement, vendor management
- Solution: Autonomous agent that never forgets, always follows up

### 4. Creativity & Originality
> Non-obvious use of Strands Agents.

✅ **FollowFlow's differentiator:**
- Commitment/Promise Engine — AI detects promises in natural language
- Evidence verification (not just task completion)
- Human-in-the-loop with confidence scoring
- Dependency chain tracking

### 5. Presentation
> Video clearly demonstrates working end-to-end.  
> Communicates: what problem, who it's for, why it matters.

✅ **FollowFlow must have:**
- 3-5 min demo video showing the full workflow
- Clear narration: the 5-scene demo script
- Demo simulator that judges can try live

---

## Critical Technical Requirements

### MUST USE (for judging score)
- [x] **Strands Agents SDK** — core agent loop
- [ ] **Amazon Bedrock AgentCore** — deployment target (BIG BONUS POINTS)
- [x] **AWS credentials** — profile `mittai17`, account `798404182134`
- [x] **AWS MCP Server** — for AWS interactions

### Strands Agents SDK Quick Reference
```python
from strands import Agent, tool
from strands.models import BedrockModel

# Or with Ollama locally:
from strands.models.ollama import OllamaModel

@tool
def extract_commitment(message: str) -> dict:
    """Extract a promise/commitment from a message"""
    ...

agent = Agent(
    model=BedrockModel(model_id="us.amazon.nova-pro-v1:0"),
    tools=[extract_commitment, verify_document, send_email, ...]
)
```

### Amazon Bedrock AgentCore
- Deploy the agent to AgentCore for production + bonus judging points
- Use AWS profile `mittai17` in region `ap-northeast-1`
- AgentCore handles the agent loop, tool routing, and observability

---

## Submission Checklist

- [ ] Working demo video (3-5 min)
- [ ] GitHub repo public with MIT license
- [ ] README with: problem, solution, architecture, AWS usage, demo instructions
- [ ] Strands Agents SDK used (not simulated)
- [ ] All 5 requirements demo'd: detect → understand → plan → act → wait → re-evaluate → escalate → complete
- [ ] Human-in-the-loop clearly shown
- [ ] Bonus: publish on builder.aws.com
- [ ] Bonus: AgentCore deployment

---

## Deadline Warning ⚠️

**Submission closes: September 14, 2026 at 8:00 PM EDT**
**Current time: September 13, 2026 at ~11:30 PM IST = Sep 13 at ~6:00 PM EDT**

**~26 hours remaining.**

### Priority order for remaining build time:
1. **P0**: Working Strands agent with real tool calls
2. **P0**: Demo simulator that actually executes
3. **P0**: AgentCore deployment (big judging bonus)
4. **P1**: Beautiful frontend dashboard
5. **P1**: Demo video
6. **P2**: builder.aws.com post

---

## Three Tracks Explained

| Track | Theme | FollowFlow fit |
|-------|-------|----------------|
| **Professional Agents** | Work, business processes | ✅ **Perfect fit** — vendor onboarding, compliance tracking |
| Everyday Agents | Personal life tasks | 🟡 Partial fit |
| Good Neighbor Agents | Community/civic | ❌ Not our target |

---

## Judges to Impress

- Debjyoti Paul (Applied Scientist, Spectrum AWS)
- Elizabeth Fuentes Leone (Developer Advocate, GenAI AWS)
- Rohini Gaonkar (Sr. Developer Advocate, AWS)
- Ian Holtz (Sr. GTM Specialist, **Agentic Coding** at AWS) ← Key judge for our track
- Rohan Patil (Sr. Applied Scientist)

**What impresses AWS judges:**
- Real Strands SDK usage (they built it, they'll know fake from real)
- AgentCore deployment
- Structured outputs validated with Pydantic
- Clean agent loop: Observe → Reason → Act → Wait → Re-evaluate

---

## FollowFlow = Perfect Match

The hackathon description says:
> *"the agent runs autonomously and only surfaces when there's a real decision to make"*

That is **exactly** what FollowFlow does. Human-in-the-loop is our core UX.
