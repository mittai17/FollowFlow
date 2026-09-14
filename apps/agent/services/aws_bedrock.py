"""
FollowFlow AWS AI Bedrock Service
Enterprise Generative AI via Amazon Bedrock Converse API
Compliant with AWS Strands Agents SDK & Amazon Bedrock AgentCore
"""
from __future__ import annotations
import json
import re
import os
from typing import Optional, Dict, Any, List
import boto3
from botocore.config import Config
from botocore.exceptions import ClientError, NoCredentialsError
from config import get_settings
import structlog

log = structlog.get_logger()
settings = get_settings()

# Default recommended Bedrock models
CLAUDE_3_HAIKU = "anthropic.claude-3-haiku-20240307-v1:0"
NOVA_LITE = "us.amazon.nova-lite-v1:0"
TITAN_TEXT = "amazon.titan-text-express-v1"


def get_bedrock_runtime_client(region: Optional[str] = None):
    """
    Construct a boto3 bedrock-runtime client.
    Prefers IAM Task Role (ECS Fargate) or environment credentials,
    falling back to named AWS profile.
    """
    reg = region or settings.aws_default_region or "us-east-1"
    boto_config = Config(
        retries={"max_attempts": 3, "mode": "standard"},
        connect_timeout=10,
        read_timeout=30,
    )
    
    # Try default credential chain (ECS Task Role, AWS_CONTAINER_CREDENTIALS_RELATIVE_URI, Env Vars)
    try:
        session = boto3.Session()
        client = session.client("bedrock-runtime", region_name=reg, config=boto_config)
        return client
    except Exception as e:
        log.warning("default_session_failed_trying_profile", error=str(e))
        try:
            session = boto3.Session(profile_name=settings.aws_profile)
            return session.client("bedrock-runtime", region_name=reg, config=boto_config)
        except Exception as e2:
            log.error("all_bedrock_session_inits_failed", error=str(e2))
            raise e2


def check_aws_ai_connection() -> Dict[str, Any]:
    """Check AWS STS caller identity and Bedrock service readiness."""
    reg = settings.aws_default_region or "us-east-1"
    try:
        sts = boto3.client("sts", region_name=reg)
        identity = sts.get_caller_identity()
        return {
            "status": "connected",
            "account": identity.get("Account"),
            "arn": identity.get("Arn"),
            "region": reg,
            "bedrock_model": settings.bedrock_model_id,
            "provider": "AWS Bedrock",
        }
    except Exception as e:
        err_msg = str(e)
        status = "session_expired" if "expired" in err_msg.lower() or "token" in err_msg.lower() else "unauthenticated"
        return {
            "status": status,
            "error": err_msg,
            "region": reg,
            "bedrock_model": settings.bedrock_model_id,
            "provider": "AWS Bedrock",
            "remediation": "Authenticate via 'aws login' locally or attach FollowFlowEcsTaskExecutionRole on Amazon ECS",
        }


async def invoke_bedrock_converse(
    prompt: str,
    system: Optional[str] = None,
    model_id: Optional[str] = None,
    max_tokens: int = 1024,
    temperature: float = 0.1,
) -> Dict[str, Any]:
    """
    Invoke Amazon Bedrock Converse API with explicit maxTokens (preventing quota throttling).
    Returns structured output containing response text, token usage, and latency.
    """
    target_model = model_id or settings.bedrock_model_id or CLAUDE_3_HAIKU
    messages = [{"role": "user", "content": [{"text": prompt}]}]
    system_list = [{"text": system}] if system else []

    try:
        import time
        import asyncio
        client = get_bedrock_runtime_client()

        def _call():
            t0 = time.time()
            resp = client.converse(
                modelId=target_model,
                messages=messages,
                system=system_list,
                inferenceConfig={"maxTokens": max_tokens, "temperature": temperature},
            )
            dur_ms = (time.time() - t0) * 1000
            content = resp["output"]["message"]["content"][0]["text"]
            usage = resp.get("usage", {})
            return {
                "success": True,
                "text": content,
                "model_id": target_model,
                "duration_ms": round(dur_ms, 2),
                "input_tokens": usage.get("inputTokens", 0),
                "output_tokens": usage.get("outputTokens", 0),
                "total_tokens": usage.get("totalTokens", 0),
            }

        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, _call)

    except (ClientError, NoCredentialsError, Exception) as e:
        log.error("bedrock_converse_error", model=target_model, error=str(e))
        return {
            "success": False,
            "error": str(e),
            "model_id": target_model,
            "fallback_available": True,
        }


def parse_llm_json(text: str) -> Optional[dict]:
    """Safely extract JSON from model output."""
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except Exception:
            pass
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return None
