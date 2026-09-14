# FollowFlow — 2-Minute Video Pitch Script
**AWS Agents for Humans Hackathon · Professional Agents Track**  
*Target Duration: 2 Minutes (120 Seconds) | Word Count: ~280 words (~140 wpm)*

---

## ⏱️ Video Breakdown & Second-by-Second Guide

```
┌─────────────────┬──────────────────────────────────┬──────────────────────────────────────────┐
│ Time Window     │ On-Screen Visual                 │ What You Say (Voiceover)                 │
├─────────────────┼──────────────────────────────────┼──────────────────────────────────────────┤
│ 0:00 – 0:25     │ Slide 1 & 2 (Title & Problem)    │ Hook: The 60% promise drop-off & nagging │
│ 0:25 – 0:45     │ Slide 4 (Architecture Diagram)   │ Solution: Strands SDK + Bedrock + Fargate│
│ 0:45 – 1:35     │ Live Browser (followflow.duckdns)│ Live Demo: Login, Copilot, HITL, Proof   │
│ 1:35 – 2:00     │ Slide 7 & Dashboard Overview     │ Why It Matters & Call to Action          │
└─────────────────┴──────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 🎙️ Word-for-Word Voiceover Script

### [0:00 – 0:25] THE HOOK & THE PROBLEM (Show Slide 1, then Slide 2)
> *"Hi everyone, this is **FollowFlow**, built for the AWS Agents for Humans Hackathon in the Professional Agents track.*
>
> *Every single day, professionals make commitments: 'I’ll send the SOC-2 draft by Friday,' or 'I’ll review that architecture PR tomorrow.'*
> 
> *Yet over **60% of informal commitments disappear**. Tools like Jira and Linear are completely passive, forcing managers to waste 4 to 6 hours every week nagging people with check-in messages just to ask: 'Is this done yet?'"*

---

### [0:25 – 0:45] THE SOLUTION & AWS ARCHITECTURE (Show Slide 4: Architecture Diagram)
> *"We built **FollowFlow** — an autonomous operations employee that remembers what you promised, monitors deadlines in the background, and verifies proof without nagging.*
> 
> *FollowFlow is built with the **AWS Strands Agents SDK v1.55.1** using custom `@tool` functions for SLA tracking and evidence collection. It’s packaged with **Amazon Bedrock AgentCore** runtime endpoints, containerized on **Amazon ECR**, and running live in production on **Amazon ECS Fargate** behind an Application Load Balancer."*

---

### [0:45 – 1:35] LIVE DEMO (Switch to Browser at http://followflow.duckdns.org)

#### 1. Login & Command Center (0:45 – 1:00)
*(Screen: At `http://followflow.duckdns.org/login`, click 'Test & Evaluation Accounts' → select 'Devon Clarke' → Dashboard loads)*
> *"Let's see it live on our public domain at **followflow.duckdns.org**. Our enterprise Sign-In Wall secures all workspace data. We'll sign in as Devon Clarke, Director of InfoSec. Instantly, our Command Center displays active commitments, upcoming deadlines, and the autonomous agent loop running in the background."*

#### 2. AI Copilot Commitment Creation (1:00 – 1:18)
*(Screen: Click 'Make a Commitment' → type: `Deliver SOC2 audit draft with GitHub PR evidence by Friday`)*
> *"When making a promise, our **inline Strands AI Copilot** automatically extracts the deliverable, calculates deadline horizons, assigns the GitHub evidence provider, and binds it to our team's 95% SLA policy. Zero manual ticket overhead."*

#### 3. Human-in-the-Loop & Proof (1:18 – 1:35)
*(Screen: Click '/approvals' → show decision card → Click '/profile' → show SHA-256 badge)*
> *"FollowFlow never claims work is done without objective proof. It actively inspects GitHub PRs, Slack confirmations, and AWS S3 deliverables. If evidence is ambiguous, our **Ambiguity Stop Rule** pauses and presents a clear recommendation for one-click human approval. Every completed promise generates an immutable **SHA-256 cryptographic proof** inspired by AWS Builder Center Badges."*

---

### [1:35 – 2:00] WHY IT MATTERS & CLOSING (Show Slide 7)
> *"Why does this matter? FollowFlow gives engineering teams and creators their time back — replacing broken promises and endless status meetings with continuous, autonomous follow-through.*
> 
> *Our full codebase is open-source under the MIT license on GitHub, and our live deployment is available right now at **followflow.duckdns.org**.*
> 
> *Thank you, and we invite you to try FollowFlow!"*

---

## 💡 Quick Tips for Recording

1. **Resolution**: Record at **1080p (1920x1080)** at 30 or 60 fps.
2. **Browser Prep**:
   - Open Tab 1: Slide deck at `file:///home/mittai/Projects/aws-hack/presentation/index.html` (press `F11` for full screen).
   - Open Tab 2: Live app at `http://followflow.duckdns.org/login`.
3. **No Camera Needed**: Hackathon rules explicitly state: *"Slides, screen recordings, and voiceover are all fine. No need to appear on camera."*
4. **Pacing**: Speak calmly and confidently. 280 words at natural conversational pace takes exactly 1 minute and 55 seconds.
