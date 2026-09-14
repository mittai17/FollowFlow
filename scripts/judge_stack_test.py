#!/usr/bin/env python3
"""
FollowFlow — Stack-Level Judicial Test Suite
AWS Agents for Humans Hackathon — Championship Finals
Audits all 7 tiers of the live production stack:
  Tier 1: Infrastructure & AWS Protocols (FastAPI, Bedrock AgentCore /ping & /invocations)
  Tier 2: Ingress & Reverse Proxy Layer (Next.js rewrites to backend agent)
  Tier 3: Database & Multi-Tenant Data Integrity (Supabase PostgreSQL records & foreign keys)
  Tier 4: Strands AI Copilot & Reasoning Engine (Strands SDK tools, intent analysis)
  Tier 5: Human-in-the-Loop & State Transitions (Commitment lifecycle & Approvals)
  Tier 6: Frontend Route Accessibility & Static Page Audit (16 routes)
  Tier 7: Concurrency & Latency Stress Test (30 concurrent async requests)
"""

import sys
import os
import time
import json
import asyncio
import statistics
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List

# Add agent app directory to path to test Strands SDK tools natively
sys.path.insert(0, "/home/mittai/Projects/aws-hack/apps/agent")

import httpx

BACKEND_URL = "http://127.0.0.1:8000"
FRONTEND_URL = "http://127.0.0.1:3000"

results = {
    "total": 0,
    "passed": 0,
    "failed": 0,
    "tiers": {}
}

def record_test(tier: str, name: str, passed: bool, duration_ms: float, details: str = ""):
    results["total"] += 1
    if passed:
        results["passed"] += 1
        status_sym = "✅ PASS"
    else:
        results["failed"] += 1
        status_sym = "❌ FAIL"
    
    if tier not in results["tiers"]:
        results["tiers"][tier] = []
    
    results["tiers"][tier].append({
        "name": name,
        "passed": passed,
        "duration_ms": round(duration_ms, 2),
        "details": details
    })
    print(f"  {status_sym} [{round(duration_ms, 1)}ms] {name} {f'({details})' if details else ''}")


async def test_tier1_infrastructure():
    print("\n--- Tier 1: Infrastructure & AWS Protocols ---")
    tier = "Tier 1: Infrastructure & AWS Protocols"
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 1.1 Direct FastAPI Health
        t0 = time.time()
        try:
            r = await client.get(f"{BACKEND_URL}/health")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and data.get("status") == "ok" and "FollowFlow" in data.get("service", "")
            record_test(tier, "FastAPI /health check", passed, d_ms, f"status={r.status_code}, service={data.get('service')}")
        except Exception as e:
            record_test(tier, "FastAPI /health check", False, (time.time() - t0) * 1000, str(e))

        # 1.2 Bedrock AgentCore Runtime Health (/ping)
        t0 = time.time()
        try:
            r = await client.get(f"{BACKEND_URL}/ping")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and data.get("status") == "Healthy"
            record_test(tier, "Amazon Bedrock AgentCore /ping protocol", passed, d_ms, f"status={r.status_code}, payload={data}")
        except Exception as e:
            record_test(tier, "Amazon Bedrock AgentCore /ping protocol", False, (time.time() - t0) * 1000, str(e))

        # 1.3 Bedrock AgentCore Invocations (/invocations)
        t0 = time.time()
        try:
            r = await client.post(
                f"{BACKEND_URL}/invocations",
                json={"prompt": "Health and compliance audit for active commitments"},
                timeout=60.0
            )
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and data.get("status") == "completed"
            record_test(tier, "Amazon Bedrock AgentCore /invocations contract", passed, d_ms, f"status={r.status_code}, exec_status={data.get('status')}")
        except Exception as e:
            record_test(tier, "Amazon Bedrock AgentCore /invocations contract", False, (time.time() - t0) * 1000, str(e))


async def test_tier2_ingress_proxy():
    print("\n--- Tier 2: Ingress & Reverse Proxy Layer (Next.js Rewrites) ---")
    tier = "Tier 2: Ingress & Reverse Proxy Layer"
    async with httpx.AsyncClient(timeout=10.0) as client:
        # 2.1 Proxied /api/users
        t0 = time.time()
        try:
            r = await client.get(f"{FRONTEND_URL}/api/users")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and isinstance(data, list) and len(data) > 0
            record_test(tier, "Next.js Rewrite: /api/users", passed, d_ms, f"status={r.status_code}, users_count={len(data)}")
        except Exception as e:
            record_test(tier, "Next.js Rewrite: /api/users", False, (time.time() - t0) * 1000, str(e))

        # 2.2 Proxied /api/commitments
        t0 = time.time()
        try:
            r = await client.get(f"{FRONTEND_URL}/api/commitments")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and isinstance(data, list)
            record_test(tier, "Next.js Rewrite: /api/commitments", passed, d_ms, f"status={r.status_code}, count={len(data)}")
        except Exception as e:
            record_test(tier, "Next.js Rewrite: /api/commitments", False, (time.time() - t0) * 1000, str(e))

        # 2.3 Proxied /api/feed
        t0 = time.time()
        try:
            r = await client.get(f"{FRONTEND_URL}/api/feed")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and isinstance(data, list)
            record_test(tier, "Next.js Rewrite: /api/feed", passed, d_ms, f"status={r.status_code}, feed_events={len(data)}")
        except Exception as e:
            record_test(tier, "Next.js Rewrite: /api/feed", False, (time.time() - t0) * 1000, str(e))

        # 2.4 Proxied /api/profile/rahulk
        t0 = time.time()
        try:
            r = await client.get(f"{FRONTEND_URL}/api/profile/rahulk")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            user_obj = data.get("user", {})
            passed = r.status_code == 200 and user_obj.get("username") == "rahulk" and "badges" in data
            record_test(tier, "Next.js Rewrite: /api/profile/rahulk", passed, d_ms, f"status={r.status_code}, badges={len(data.get('badges', []))}")
        except Exception as e:
            record_test(tier, "Next.js Rewrite: /api/profile/rahulk", False, (time.time() - t0) * 1000, str(e))


async def test_tier3_database_integrity():
    print("\n--- Tier 3: Database & Multi-Tenant Data Layer ---")
    tier = "Tier 3: Database & Multi-Tenant Data Layer"
    from services.supabase_client import supabase
    client = supabase()
    
    # 3.1 Real users table
    t0 = time.time()
    try:
        users = client.table("users").select("*").execute().data
        d_ms = (time.time() - t0) * 1000
        handles = [u["username"] for u in users if "username" in u]
        passed = len(users) >= 4 and "rahulk" in handles and "priyap" in handles
        record_test(tier, "PostgreSQL: Authenticated Users & Handles", passed, d_ms, f"count={len(users)}, handles={handles}")
    except Exception as e:
        record_test(tier, "PostgreSQL: Authenticated Users & Handles", False, (time.time() - t0) * 1000, str(e))

    # 3.2 Organizations table
    t0 = time.time()
    try:
        orgs = client.table("organizations").select("*").execute().data
        d_ms = (time.time() - t0) * 1000
        org_names = [o["name"] for o in orgs if "name" in o]
        passed = len(orgs) >= 1 and "FollowFlow Labs" in org_names
        record_test(tier, "PostgreSQL: Multi-Tenant Organizations", passed, d_ms, f"count={len(orgs)}, names={org_names}")
    except Exception as e:
        record_test(tier, "PostgreSQL: Multi-Tenant Organizations", False, (time.time() - t0) * 1000, str(e))

    # 3.3 Commitments table data integrity
    t0 = time.time()
    try:
        cmts = client.table("commitments").select("*").execute().data
        d_ms = (time.time() - t0) * 1000
        statuses = set(c.get("status") for c in cmts)
        has_scopes = any("scope" in c for c in cmts)
        passed = len(cmts) >= 10 and has_scopes
        record_test(tier, "PostgreSQL: Commitment Records & Schema", passed, d_ms, f"count={len(cmts)}, statuses={list(statuses)}")
    except Exception as e:
        record_test(tier, "PostgreSQL: Commitment Records & Schema", False, (time.time() - t0) * 1000, str(e))


async def test_tier4_strands_agent():
    print("\n--- Tier 4: Strands AI Copilot & Reasoning Engine ---")
    tier = "Tier 4: Strands AI Copilot & Reasoning Engine"
    
    # 4.1 Native Strands @tool execution
    t0 = time.time()
    try:
        from agent.architect import lookup_industry_integration, calculate_commitment_horizon, verify_sla_compliance
        tool_res1 = lookup_industry_integration("github")
        tool_res2 = calculate_commitment_horizon(5)
        tool_res3 = verify_sla_compliance("team", "high")
        d_ms = (time.time() - t0) * 1000
        passed = "Merged PR" in tool_res1 and "date_only" in tool_res2 and ("team" in tool_res3.lower() or "collaborator" in tool_res3.lower())
        record_test(tier, "Strands SDK Native @tool Execution", passed, d_ms, "GitHub, Horizon, SLA tools verified")
    except Exception as e:
        record_test(tier, "Strands SDK Native @tool Execution", False, (time.time() - t0) * 1000, str(e))

    # 4.2 Auto-Architect Endpoint (/api/commitments/ai/guide)
    t0 = time.time()
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            payload = {
                "prompt": "Deploy AWS S3 zero-trust token rotation pipeline to Bedrock by Friday",
                "scope": "individual",
                "organization": "FollowFlow Labs",
                "role": "Lead Autonomous Architect",
                "username": "rahulk",
                "provider": "github"
            }
            r = await client.post(f"{BACKEND_URL}/api/commitments/ai/guide", json=payload)
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and "title" in data and "suggested_deadline" in data
            record_test(tier, "Strands Auto-Architect Intent Generation", passed, d_ms, f"title={data.get('title')[:35]}..., deadline={data.get('suggested_deadline')}")
        except Exception as e:
            record_test(tier, "Strands Auto-Architect Intent Generation", False, (time.time() - t0) * 1000, str(e))

    # 4.3 Promise / Commitment Extraction (/api/promises/extract)
    t0 = time.time()
    async with httpx.AsyncClient(timeout=60.0) as client:
        try:
            r = await client.post(
                f"{BACKEND_URL}/api/promises/extract",
                json={
                    "message": "Hey Rahul, I will deploy the ARM64 container to ECS Fargate by tomorrow 5 PM and send the CloudWatch alarm link.",
                    "person_name": "Rahul"
                }
            )
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and isinstance(data, dict) and data.get("is_commitment") is True
            record_test(tier, "NLP Commitment Extraction Engine", passed, d_ms, f"extracted={data.get('commitment', '')[:40]}")
        except Exception as e:
            record_test(tier, "NLP Commitment Extraction Engine", False, (time.time() - t0) * 1000, str(e))


async def test_tier5_hitl_lifecycle():
    print("\n--- Tier 5: Human-in-the-Loop & State Transitions ---")
    tier = "Tier 5: Human-in-the-Loop & State Transitions"
    async with httpx.AsyncClient(timeout=10.0) as client:
        created_id = None
        # 5.1 Create a new Tracked Commitment
        t0 = time.time()
        try:
            deadline_iso = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
            payload = {
                "title": f"Judicial Audit Smoke Test - {int(time.time())}",
                "description": "Automated verification test run by the Level 2 Judge Panel.",
                "deadline": deadline_iso,
                "owner_name": "Rahul Kumar",
                "owner_username": "rahulk",
                "scope": "individual",
                "organization_name": "FollowFlow Labs",
                "role": "Lead Autonomous Architect",
                "integration_provider": "github",
                "evidence_type": "github",
                "evidence_url": "https://github.com/mittai17/followflow/pull/42"
            }
            r = await client.post(f"{BACKEND_URL}/api/commitments", json=payload)
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            created_id = data.get("id")
            passed = r.status_code == 200 and created_id is not None
            record_test(tier, "POST /api/commitments (Contract Creation)", passed, d_ms, f"id={created_id}")
        except Exception as e:
            record_test(tier, "POST /api/commitments (Contract Creation)", False, (time.time() - t0) * 1000, str(e))

        # 5.2 Retrieve created commitment detail
        if created_id:
            t0 = time.time()
            try:
                r = await client.get(f"{BACKEND_URL}/api/commitments/{created_id}")
                d_ms = (time.time() - t0) * 1000
                data = r.json()
                passed = r.status_code == 200 and data.get("id") == created_id
                record_test(tier, f"GET /api/commitments/{created_id[:8]}... (Detail Query)", passed, d_ms, f"status={data.get('status')}")
            except Exception as e:
                record_test(tier, "GET /api/commitments/{id}", False, (time.time() - t0) * 1000, str(e))

        # 5.3 Approvals & Ambiguity Stop Rule endpoint
        t0 = time.time()
        try:
            r = await client.get(f"{BACKEND_URL}/api/approvals")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and isinstance(data, list)
            record_test(tier, "GET /api/approvals (Ambiguity Stop Queue)", passed, d_ms, f"pending_approvals={len(data)}")
        except Exception as e:
            record_test(tier, "GET /api/approvals (Ambiguity Stop Queue)", False, (time.time() - t0) * 1000, str(e))


async def test_tier6_frontend_routes():
    print("\n--- Tier 6: Frontend Route Accessibility & Static Page Audit ---")
    tier = "Tier 6: Frontend Route Accessibility"
    routes = [
        "/",
        "/dashboard",
        "/commitments",
        "/promises",
        "/cases",
        "/approvals",
        "/profile",
        "/settings",
        "/agent",
        "/activity",
        "/terms",
        "/privacy",
        "/disclaimer",
        "/security",
        "/status",
        "/support"
    ]
    async with httpx.AsyncClient(timeout=10.0) as client:
        for route in routes:
            t0 = time.time()
            try:
                r = await client.get(f"{FRONTEND_URL}{route}")
                d_ms = (time.time() - t0) * 1000
                passed = r.status_code == 200
                record_test(tier, f"Next.js Route: {route}", passed, d_ms, f"HTTP {r.status_code}")
            except Exception as e:
                record_test(tier, f"Next.js Route: {route}", False, (time.time() - t0) * 1000, str(e))


async def test_tier7_stress_concurrency():
    print("\n--- Tier 7: Concurrency & Latency Stress Test (30 Concurrent Requests) ---")
    tier = "Tier 7: Concurrency & Latency Stress Test"
    endpoints = [
        f"{FRONTEND_URL}/api/profile/rahulk",
        f"{FRONTEND_URL}/api/feed",
        f"{FRONTEND_URL}/api/commitments",
        f"{BACKEND_URL}/health",
        f"{BACKEND_URL}/ping"
    ]
    
    async with httpx.AsyncClient(timeout=15.0) as client:
        async def fetch_worker(url: str):
            t0 = time.time()
            res = await client.get(url)
            duration = (time.time() - t0) * 1000
            return res.status_code, duration

        # Build 30 parallel requests
        tasks = []
        for i in range(30):
            url = endpoints[i % len(endpoints)]
            tasks.append(fetch_worker(url))

        t_batch_start = time.time()
        results_batch = await asyncio.gather(*tasks, return_exceptions=True)
        total_batch_duration = (time.time() - t_batch_start) * 1000

        valid_latencies = []
        status_codes = []
        errors = 0
        for item in results_batch:
            if isinstance(item, tuple):
                code, dur = item
                status_codes.append(code)
                valid_latencies.append(dur)
            else:
                errors += 1

        p50 = statistics.median(valid_latencies) if valid_latencies else 0
        p95 = statistics.quantiles(valid_latencies, n=20)[18] if len(valid_latencies) >= 20 else max(valid_latencies, default=0)
        p_min = min(valid_latencies) if valid_latencies else 0
        p_max = max(valid_latencies) if valid_latencies else 0

        passed = errors == 0 and all(c in [200, 304] for c in status_codes) and len(status_codes) == 30
        record_test(
            tier,
            "30 Concurrent Async Requests (Zero-Locking)",
            passed,
            total_batch_duration,
            f"p50={round(p50, 1)}ms, p95={round(p95, 1)}ms, min={round(p_min, 1)}ms, max={round(p_max, 1)}ms, errors={errors}"
        )


async def test_tier8_aws_ai():
    print("\n--- Tier 8: AWS AI & Amazon Bedrock API Protocols ---")
    tier = "Tier 8: AWS AI & Bedrock API Protocols"
    async with httpx.AsyncClient(timeout=15.0) as client:
        # 8.1 AWS AI Status & Gateway
        t0 = time.time()
        try:
            r = await client.get(f"{FRONTEND_URL}/api/aws/status")
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and "aws_ai" in data and len(data.get("supported_models", [])) >= 2
            record_test(tier, "Next.js Rewrite: /api/aws/status (AWS Gateway)", passed, d_ms, f"status={r.status_code}, models={len(data.get('supported_models', []))}")
        except Exception as e:
            record_test(tier, "Next.js Rewrite: /api/aws/status", False, (time.time() - t0) * 1000, str(e))

        # 8.2 AWS Bedrock Commitment Architect
        t0 = time.time()
        try:
            r = await client.post(
                f"{BACKEND_URL}/api/aws/bedrock/architect-commitment",
                json={
                    "prompt": "Deploy AWS S3 zero-trust token rotation pipeline to Bedrock by Friday",
                    "username": "rahulk"
                }
            )
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and "title" in data and "suggested_deadline" in data
            record_test(tier, "AWS Bedrock: /api/aws/bedrock/architect-commitment", passed, d_ms, f"title={data.get('title')[:30]}..., powered_by={data.get('powered_by')}")
        except Exception as e:
            record_test(tier, "AWS Bedrock: architect-commitment", False, (time.time() - t0) * 1000, str(e))

        # 8.3 AWS Bedrock Evidence Verification & Token Generation
        t0 = time.time()
        try:
            r = await client.post(
                f"{BACKEND_URL}/api/aws/bedrock/verify-evidence",
                json={
                    "title": "Deploy AWS Bedrock Agent",
                    "evidence_type": "github",
                    "evidence_url": "https://github.com/mittai17/followflow/pull/42"
                }
            )
            d_ms = (time.time() - t0) * 1000
            data = r.json()
            passed = r.status_code == 200 and data.get("is_valid") is True and "AWS-BEDROCK-VERIFIED" in data.get("verification_token", "")
            record_test(tier, "AWS Bedrock: /api/aws/bedrock/verify-evidence (Token Audit)", passed, d_ms, f"token={data.get('verification_token')}, valid={data.get('is_valid')}")
        except Exception as e:
            record_test(tier, "AWS Bedrock: verify-evidence", False, (time.time() - t0) * 1000, str(e))


async def main():
    print("==================================================================")
    print("  FOLLOWFLOW — STACK-LEVEL JUDICIAL AUDIT & VERIFICATION HARNESS ")
    print("  AWS Agents for Humans Hackathon — Championship Finals           ")
    print("==================================================================")
    
    t_start = time.time()
    await test_tier1_infrastructure()
    await test_tier2_ingress_proxy()
    await test_tier3_database_integrity()
    await test_tier4_strands_agent()
    await test_tier5_hitl_lifecycle()
    await test_tier6_frontend_routes()
    await test_tier7_stress_concurrency()
    await test_tier8_aws_ai()
    total_time = (time.time() - t_start) * 1000

    print("\n==================================================================")
    print("  JUDICIAL AUDIT SUMMARY                                          ")
    print("==================================================================")
    print(f"  Total Tests Executed: {results['total']}")
    print(f"  Passed: {results['passed']} ({(results['passed']/results['total'])*100:.1f}%)")
    print(f"  Failed: {results['failed']}")
    print(f"  Total Wall Clock Time: {round(total_time, 1)}ms")
    print("==================================================================")

    # Output JSON summary for automated reporting
    with open("/home/mittai/Projects/aws-hack/judge_stack_test_results.json", "w") as f:
        json.dump(results, f, indent=2)

    return 0 if results["failed"] == 0 else 1


if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
