"""
LLM abstraction layer — supports Ollama and Bedrock (Claude)
"""
from __future__ import annotations
import json
import re
import httpx
from typing import Optional
from config import get_settings
import structlog

log = structlog.get_logger()
settings = get_settings()


async def call_llm(prompt: str, system: str = "", json_mode: bool = False) -> str:
    """Call LLM with the configured provider (Ollama or Bedrock)."""
    provider = settings.strands_model_provider.lower()
    if provider in ("ollama", "local"):
        return await _call_ollama(prompt, system, json_mode)
    elif provider in ("bedrock", "aws"):
        return await _call_bedrock(prompt, system, json_mode)
    else:
        return await _call_ollama(prompt, system, json_mode)


async def _call_ollama(prompt: str, system: str = "", json_mode: bool = False) -> str:
    """Call local Ollama instance."""
    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    payload = {
        "model": settings.ollama_model,
        "messages": messages,
        "stream": False,
        "options": {"temperature": 0.1},
    }
    if json_mode:
        payload["format"] = "json"

    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            resp = await client.post(
                f"{settings.ollama_base_url}/api/chat",
                json=payload,
            )
            resp.raise_for_status()
            data = resp.json()
            return data["message"]["content"]
    except Exception as e:
        log.error("ollama_call_failed", error=str(e))
        # Fallback: return a safe default
        if json_mode:
            return '{"is_commitment": false, "confidence": 0.0}'
        return "Unable to process at this time."


async def _call_bedrock(prompt: str, system: str = "", json_mode: bool = False) -> str:
    """Call Amazon Bedrock via boto3."""
    try:
        import boto3
        import json as _json

        session = boto3.Session(profile_name=settings.aws_profile)
        client = session.client("bedrock-runtime", region_name="us-east-1")

        messages = [{"role": "user", "content": [{"text": prompt}]}]
        system_list = [{"text": system}] if system else []

        response = client.converse(
            modelId="us.amazon.nova-lite-v1:0",
            messages=messages,
            system=system_list if system_list else [],
            inferenceConfig={"temperature": 0.1, "maxTokens": 1024},
        )
        return response["output"]["message"]["content"][0]["text"]
    except Exception as e:
        log.error("bedrock_call_failed", error=str(e))
        return await _call_ollama(prompt, system, json_mode)


def extract_json(text: str) -> Optional[dict]:
    """Extract JSON from LLM response text."""
    # Try direct parse
    try:
        return json.loads(text.strip())
    except Exception:
        pass
    # Try extracting from code block
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        try:
            return json.loads(match.group(1).strip())
        except Exception:
            pass
    # Try finding raw JSON object
    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        try:
            return json.loads(match.group(0))
        except Exception:
            pass
    return None
