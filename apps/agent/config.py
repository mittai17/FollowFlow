from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    supabase_url: str
    supabase_service_role_key: str
    supabase_anon_key: str = ""

    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:1.5b"
    strands_model_provider: str = "ollama"

    smtp_host: str = "localhost"
    smtp_port: int = 1025
    smtp_user: str = ""
    smtp_password: str = ""

    agent_secret: str = "followflow-secret"
    cors_origins: str = "http://localhost:3000"

    aws_profile: str = "mittai17"
    aws_default_region: str = "ap-northeast-1"

    demo_org_id: str = "00000000-0000-0000-0000-000000000001"
    demo_user_id: str = "00000000-0000-0000-0000-000000000099"

    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()
