## Inspiration

In modern engineering and professional knowledge work, informal commitments run the company:
* *"I'll have the SOC 2 compliance draft ready by Friday afternoon."*
* *"I'll review your CloudFormation PR before the standup tomorrow."*
* *"I'll upload the security audit logs to S3 by end of day."*

Yet research shows over **60% of informal professional commitments vanish into thin air**. Traditional project management tools like Jira, Asana, and Linear are completely **passive databases**: they wait for humans to manually update status tickets. When things stall, managers are forced to spend **4 to 6 hours every single week** playing human router—nagging colleagues over Slack and email just to ask: *"Is this done yet?"*

We asked ourselves: **What if teams had an autonomous digital operations employee that quietly tracks promises, proactively monitors deadlines, gathers verifiable proof from integrated tools, and enforces SLAs without annoying or nagging anyone?**

That vision is **FollowFlow**.

---

## What it does

FollowFlow transforms passive ticket tracking into an active, autonomous commitment lifecycle:

1. **Inline Strands AI Copilot:** When creating commitments, the agent parses natural language, identifies deliverables, calculates SLA horizons, and binds the task to an evidence source (GitHub PR, AWS S3 bucket, Slack confirmation, or Jira ticket).
2. **Autonomous Multi-Cadence Follow-Through:** Instead of spamming users, FollowFlow uses an exponential backoff follow-through schedule. If a deadline approaches without verified proof, the agent sends gentle, context-aware nudges.
3. **Multi-Source Evidence Gathering:** FollowFlow connects to enterprise tools to inspect concrete artifacts (e.g., whether a pull request was merged, a file was uploaded to AWS S3, or a signed document was registered).
4. **Human-in-the-Loop (HITL) with Ambiguity Stop Rule:** If external evidence is ambiguous or incomplete, the agent stops autonomously, formulates a confidence-scored recommendation, and escalates to a human manager for a 1-click decision.
5. **Cryptographic Proof & Reputation Badges:** When a promise is fulfilled, FollowFlow computes an immutable SHA-256 cryptographic digest inspired by AWS Builder Center Badges (`AWS-FF-XXXX-BEDROCK`), awarding verifiable reputation to professionals.
6. **Enterprise Governance & Multi-Tenant Policies:** Teams configure custom SLA fulfillment targets ($95\%+$), grace periods, and escalation tiers across departments.

### Mathematical SLA & Reliability Model

FollowFlow calculates individual and team fulfillment reliability $R_{\text{team}}$ using a weighted deliverable formula:

$$R_{\text{team}} = \frac{\sum_{i=1}^{n} w_i \cdot \mathbb{I}(\text{verified}_i \land t_{\text{completion}} \le t_{\text{deadline}} + \Delta t_{\text{grace}})}{\sum_{i=1}^{n} w_i} \times 100\%$$

Where:
- $w_i \in [1.0, 3.0]$ represents business criticality weight (Low, Medium, High, Critical).
- $\mathbb{I}(\dots)$ is the indicator function confirming cryptographic evidence validation.
- $\Delta t_{\text{grace}}$ is the organization's SLA grace window.

---

## How we built it

FollowFlow was engineered from the ground up to take full advantage of the AWS Agentic ecosystem:

* **Agent Framework — AWS Strands Agents SDK v1.55.1:** Custom Python `@tool` definitions implement SLA calculations, evidence harvesting, and commitment extraction.
* **Agent Runtime — Amazon Bedrock AgentCore:** Implements compliant `/ping` health checks and `/invocations` agent runtime endpoints for production Amazon Bedrock compatibility.
* **Compute & Orchestration — Amazon ECS Fargate:** The entire stack runs as multi-container microservices on serverless AWS Fargate, automatically scaling without EC2 instance management.
* **Traffic Routing & Load Balancing — AWS ALB:** AWS Application Load Balancer with target group health checks, path-based routing, and DNS mapping to DuckDNS (`followflow.duckdns.org`).
* **Container Registry — Amazon ECR:** Automated Docker build and release pipeline targeting `linux/amd64` architecture.
* **Frontend & UX:** Next.js 14 App Router, TypeScript, Tailwind CSS, Framer Motion, and Lucide icons following Linear/Vercel enterprise aesthetic standards.
* **Database & Security:** PostgreSQL with Supabase, client-session state management, and strict Sign-In Wall route interceptors.

---

## Challenges we ran into

1. **Designing Non-Annoying Autonomous Follow-Through:** The biggest risk with autonomous agents is alert fatigue. We tackled this by building an exponential backoff pacing algorithm that suppresses notifications if team activity is already high, escalating only when an SLA is genuinely at risk.
2. **Deterministic Evidence vs. Probabilistic LLMs:** LLMs can hallucinate whether an objective was achieved. We solved this by using AWS Strands SDK tools to inspect concrete external state (GitHub commit hashes, file checksums, HTTP status codes) before allowing the agent to mark any commitment as verified.
3. **AWS Fargate Dynamic IP Networking:** In ECS Fargate rolling updates, tasks receive dynamic private IP addresses upon replacement. We automated target group IP registration and health-check synchronization directly inside our deployment pipeline.
4. **Balancing Autonomous Power with Enterprise Security:** We introduced an enterprise Sign-In Wall that prevents unauthorized workspace inspection while maintaining quick-access evaluator personas for hackathon judges.

---

## Accomplishments that we're proud of

* **Fully Deployed on AWS in Production:** FollowFlow is not a local mockup or `localhost` demo. It is live right now on AWS ECS Fargate behind an Application Load Balancer at [followflow.duckdns.org](http://followflow.duckdns.org).
* **100% Real Agentic Pipeline:** Powered by AWS Strands Agents SDK v1.55.1 with 18 specialized operational tools and Bedrock AgentCore endpoints.
* **Zero AI Fluff & Authentic UX:** Clean, minimalist UI inspired by Linear, with high contrast, dark mode accents, keyboard ergonomics, and real-time Server-Sent Events (SSE).
* **Cryptographic Trust Proofs:** Inspired by AWS Builder Center Badges, every completed commitment outputs a verifiable SHA-256 hash.

---

## What we learned

* How to structure multi-tool agent architectures using the AWS Strands Agents SDK so models select the right tool with minimal prompt overhead.
* How Amazon Bedrock AgentCore runtime specifications (`/ping` and `/invocations`) streamline deploying custom agents to AWS cloud infrastructure.
* The critical role of **Human-in-the-Loop (HITL) guardrails**: agents become dramatically more trusted by enterprise teams when they clearly declare *why* they paused and ask for confirmation on ambiguous decisions.

---

## What's next for  FollowFlow — Autonomous Enterprise Commitment Network)

* **Native Slack & Teams Bots:** Allow employees to make commitments by simply tagging `@FollowFlow` inside Slack channels or meeting threads.
* **Bedrock Guardrails & Automated Auditing:** Integrate Bedrock PII filters and compliance audit logging for HIPAA and SOC 2 enterprise customers.
* **Multi-Agent Negotiation:** Enable FollowFlow agents across different partner organizations to autonomously negotiate deadlines and dependency handoffs.
