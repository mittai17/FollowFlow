import os
import uuid
from supabase import create_client

url = "https://aepvoyytbfbghigajecz.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFlcHZveXl0YmZiZ2hpZ2FqZWN6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDY0NDYyMiwiZXhwIjoyMTAwMjIwNjIyfQ.EsKD9tVIH3UvI1KdbMXxmCwC9tC4be7eq4sQ6MwzExY"
sb = create_client(url, key)

ORG_FOLLOWFLOW = "00000000-0000-0000-0000-000000000001"
ORG_ACME = "00000000-0000-0000-0000-000000000002"
ORG_STARLIGHT = "00000000-0000-0000-0000-000000000003"

demo_users = [
    {
        "name": "Elena Rostova",
        "username": "elena_v",
        "email": "elena.rostova@followflow.ai",
        "role": "lead",
        "title": "Principal Distributed Systems Architect",
        "bio": "Designing low-latency event-driven architecture and consensus protocols across AWS Bedrock AgentCore.",
        "reliability_score": 99.4,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Marcus Vance",
        "username": "marcus_v",
        "email": "marcus.vance@followflow.ai",
        "role": "engineer",
        "title": "Staff Full-Stack & UI Engineer",
        "bio": "Crafting fluid reactive interfaces in Next.js 15 and Tailwind CSS with sub-10ms perceived latency.",
        "reliability_score": 97.8,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Chloe Tanaka",
        "username": "chloe_t",
        "email": "chloe.tanaka@followflow.ai",
        "role": "product",
        "title": "Head of Product Design & UX",
        "bio": "Specializing in autonomous human-in-the-loop decision ergonomics and zero-subjectivity workflows.",
        "reliability_score": 98.7,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Kenji Sato",
        "username": "kenji_s",
        "email": "kenji.sato@followflow.ai",
        "role": "engineer",
        "title": "Senior Cloud Reliability SRE",
        "bio": "Maintaining multi-region ECS Fargate clusters, CloudWatch synthetic canaries, and 99.99% service uptime.",
        "reliability_score": 99.2,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Fatima Al-Mansoor",
        "username": "fatima_ai",
        "email": "fatima.mansoor@followflow.ai",
        "role": "researcher",
        "title": "Staff AI Alignment Researcher",
        "bio": "Evaluating LLM calibration, Claude 3.5 Sonnet verification boundaries, and hallucination guardrails.",
        "reliability_score": 96.9,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Devon Clarke",
        "username": "devon_c",
        "email": "devon.clarke@followflow.ai",
        "role": "security",
        "title": "Director of Information Security & SOC2",
        "bio": "Enforcing cryptographic Ed25519 commit signing, zero-trust IAM boundaries, and audit logging.",
        "reliability_score": 99.6,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Maya Lin",
        "username": "maya_l",
        "email": "maya.lin@followflow.ai",
        "role": "engineer",
        "title": "Senior Backend & Python Engineer",
        "bio": "Building FastAPI streaming backends, asynchronous queues, and Strands Agent loop orchestrations.",
        "reliability_score": 95.8,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Lucas Silva",
        "username": "lucas_s",
        "email": "lucas.silva@followflow.ai",
        "role": "engineer",
        "title": "DevOps & CI/CD Pipeline Architect",
        "bio": "Automating GitHub Actions, Amazon ECR immutable container scanning, and canary rollouts.",
        "reliability_score": 94.7,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Ananya Roy",
        "username": "ananya_r",
        "email": "ananya.roy@followflow.ai",
        "role": "product",
        "title": "Staff Technical Product Manager",
        "bio": "Defining enterprise SLA contracts, grace-period algorithms, and automated evidence ingestion.",
        "reliability_score": 97.4,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "David Becker",
        "username": "david_b",
        "email": "david.becker@followflow.ai",
        "role": "engineer",
        "title": "Lead Database & Telemetry Engineer",
        "bio": "Optimizing PostgreSQL connection pooling, Supabase real-time subscriptions, and Redis caching tiers.",
        "reliability_score": 98.1,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Zoe Kravitz-Lee",
        "username": "zoe_kl",
        "email": "zoe.lee@followflow.ai",
        "role": "engineer",
        "title": "Senior Frontend Systems Engineer",
        "bio": "Accessible component design, client-side caching, and keyboard-first developer workflows.",
        "reliability_score": 96.2,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Tariq Owens",
        "username": "tariq_o",
        "email": "tariq.owens@followflow.ai",
        "role": "researcher",
        "title": "AI Agent Evaluation Scientist",
        "bio": "Benchmarking autonomous reasoning accuracy, multi-step tool calling, and Strands Agents SDK loops.",
        "reliability_score": 93.5,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Sofia Rossi",
        "username": "sofia_r",
        "email": "sofia.rossi@followflow.ai",
        "role": "lead",
        "title": "VP of Customer Solutions & Trust",
        "bio": "Partnering with Fortune 500 engineering orgs to automate commitment fulfillment and SLA governance.",
        "reliability_score": 98.9,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "James Thornton",
        "username": "james_t",
        "email": "james.thornton@followflow.ai",
        "role": "engineer",
        "title": "Staff Platform Security Specialist",
        "bio": "Auditing API authorization, OAuth 2.0 PKCE flows, and AWS KMS envelope encryption.",
        "reliability_score": 97.9,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Hana Kim",
        "username": "hana_k",
        "email": "hana.kim@followflow.ai",
        "role": "engineer",
        "title": "Machine Learning Engineer (RAG & Embeddings)",
        "bio": "Developing contextual document retrievers and vector search embeddings for commitment evidence verification.",
        "reliability_score": 95.1,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Liam Gallagher",
        "username": "liam_g",
        "email": "liam.gallagher@followflow.ai",
        "role": "engineer",
        "title": "Lead Quality Assurance & Test Automation",
        "bio": "Authoring end-to-end synthetic suites, regression harnesses, and chaos engineering experiments.",
        "reliability_score": 98.5,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Amina Diop",
        "username": "amina_d",
        "email": "amina.diop@followflow.ai",
        "role": "engineer",
        "title": "Data Platform & Streaming Engineer",
        "bio": "Processing real-time commitment telemetry streams with Apache Kafka and AWS Kinesis.",
        "reliability_score": 94.9,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Oliver Quinn",
        "username": "oliver_q",
        "email": "oliver.quinn@followflow.ai",
        "role": "engineer",
        "title": "Senior Integrations Engineer",
        "bio": "Building robust webhook adapters for GitHub, Jira, Linear, Slack, and Notion APIs.",
        "reliability_score": 96.7,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Isabella Gomez",
        "username": "isabella_g",
        "email": "isabella.gomez@followflow.ai",
        "role": "product",
        "title": "Developer Experience Product Lead",
        "bio": "Championing developer ergonomics, CLI usability, and self-serve onboarding journeys.",
        "reliability_score": 97.2,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Nathan Drake",
        "username": "nathan_d",
        "email": "nathan.drake@followflow.ai",
        "role": "security",
        "title": "Compliance & Regulatory Legal Counsel",
        "bio": "Ensuring GDPR, HIPAA, and SOC2 Type II adherence across autonomous evidence verification logs.",
        "reliability_score": 99.1,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Yuki Takahashi",
        "username": "yuki_t",
        "email": "yuki.takahashi@acmesystems.io",
        "role": "engineer",
        "title": "Principal Enterprise Infrastructure Lead",
        "bio": "Directing multi-cloud hybrid migrations and enterprise Kubernetes clusters at Acme Systems.",
        "reliability_score": 98.3,
        "organization_id": ORG_ACME,
    },
    {
        "name": "Benjamin Ward",
        "username": "ben_w",
        "email": "ben.ward@acmesystems.io",
        "role": "lead",
        "title": "Director of Engineering Operations",
        "bio": "Managing 12 engineering pods, sprint commitment burn-downs, and cross-team SLA metrics.",
        "reliability_score": 96.0,
        "organization_id": ORG_ACME,
    },
    {
        "name": "Camila Morales",
        "username": "camila_m",
        "email": "camila.morales@acmesystems.io",
        "role": "engineer",
        "title": "Senior Site Reliability Engineer",
        "bio": "Incident command, PagerDuty on-call routing, and post-mortem accountability tracking.",
        "reliability_score": 95.6,
        "organization_id": ORG_ACME,
    },
    {
        "name": "Siddharth Verma",
        "username": "sid_v",
        "email": "sid.verma@starlight.ai",
        "role": "researcher",
        "title": "Chief Scientist & Founder, Starlight AI",
        "bio": "Pioneering foundational reinforcement learning with verifiable human-in-the-loop rewards.",
        "reliability_score": 99.5,
        "organization_id": ORG_STARLIGHT,
    },
    {
        "name": "Grace Hopper-Lin",
        "username": "grace_hl",
        "email": "grace.hopper@starlight.ai",
        "role": "lead",
        "title": "Head of Applied AI Research",
        "bio": "Scaling distributed inference engines and AWS Trainium model serving clusters.",
        "reliability_score": 97.7,
        "organization_id": ORG_STARLIGHT,
    },
    {
        "name": "Kofi Mensah",
        "username": "kofi_m",
        "email": "kofi.mensah@followflow.ai",
        "role": "engineer",
        "title": "Staff Reliability & Observability Lead",
        "bio": "Observability dashboards, OpenTelemetry distributed tracing, and Prometheus metrics.",
        "reliability_score": 96.4,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Freja Lindqvist",
        "username": "freja_l",
        "email": "freja.lindqvist@followflow.ai",
        "role": "product",
        "title": "Senior UX Researcher & Human Factors",
        "bio": "Conducting user trust interviews, cognitive load analysis, and autonomous alert fatigue mitigation.",
        "reliability_score": 97.0,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Arjun Singhania",
        "username": "arjun_s",
        "email": "arjun.singhania@followflow.ai",
        "role": "engineer",
        "title": "Senior Core Systems Engineer",
        "bio": "High-throughput message brokers, Redis distributed locking, and event idempotency.",
        "reliability_score": 95.4,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Roxanne 'Rox' Miller",
        "username": "rox_m",
        "email": "rox.miller@followflow.ai",
        "role": "security",
        "title": "Senior Penetration Tester & Red Teamer",
        "bio": "Stress testing agent tool-call boundaries, prompt injection defense, and cryptographic replay protection.",
        "reliability_score": 98.8,
        "organization_id": ORG_FOLLOWFLOW,
    },
    {
        "name": "Liam O'Connor",
        "username": "liam_oc",
        "email": "liam.oconnor@followflow.ai",
        "role": "engineer",
        "title": "Staff Documentation & Developer Advocate",
        "bio": "Writing interactive SDK walkthroughs, AWS Bedrock reference architectures, and developer tutorials.",
        "reliability_score": 96.1,
        "organization_id": ORG_FOLLOWFLOW,
    },
]

def seed():
    print(f"Checking existing users in database...")
    existing = sb.table("users").select("username, email").execute().data or []
    existing_usernames = {u["username"] for u in existing if u.get("username")}
    existing_emails = {u["email"] for u in existing if u.get("email")}
    
    print(f"Found {len(existing)} existing users. Inserting 30 demo users...")
    
    inserted = 0
    updated = 0
    for u in demo_users:
        if u["username"] in existing_usernames or u["email"] in existing_emails:
            # Update user
            sb.table("users").update({
                "name": u["name"],
                "title": u["title"],
                "bio": u["bio"],
                "role": u["role"],
                "reliability_score": u["reliability_score"],
                "organization_id": u["organization_id"],
            }).eq("username", u["username"]).execute()
            updated += 1
        else:
            payload = {
                "id": str(uuid.uuid4()),
                "name": u["name"],
                "username": u["username"],
                "email": u["email"],
                "role": u["role"],
                "title": u["title"],
                "bio": u["bio"],
                "reliability_score": u["reliability_score"],
                "organization_id": u["organization_id"],
            }
            sb.table("users").insert(payload).execute()
            inserted += 1

    total = len(sb.table("users").select("id").execute().data or [])
    print(f"Seeding completed successfully! Inserted: {inserted}, Updated: {updated}. Total users now in database: {total}")

if __name__ == "__main__":
    seed()
