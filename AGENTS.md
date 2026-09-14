# FollowFlow — Agent Instructions

This is the FollowFlow project: an autonomous AI operations agent web app built for the AWS Agents for Humans Hackathon.

## Project Structure

```
/home/mittai/Projects/aws-hack/
├── apps/web/          # Next.js 15 + TypeScript + Tailwind frontend
├── apps/agent/        # Python FastAPI + Strands Agents backend
├── supabase/          # Supabase migrations and seed data
└── docs/              # Architecture and demo documentation
```

## AWS Configuration

- **Profile**: `mittai17`
- **Account**: `798404182134`
- **Region**: `ap-northeast-1` (Tokyo)
- **Agent Toolkit region**: always `us-east-1`

Always use `--profile mittai17` for all AWS CLI commands.

---

<!-- BEGIN AWS Agent Toolkit rules -->
# AWS Guidance

- Where these AWS rules conflict with the project's own instructions, the
  project's instructions take precedence.
- Prefer the AWS MCP Server for AWS interactions — it provides sandboxed
  execution, observability, and audit logging. If unavailable, use the
  AWS CLI directly.
- Before starting a task, check whether a relevant AWS skill is available.
  Load the skill with `retrieve_skill` and prefer its guidance over
  general knowledge.
- When uncertain about specific AWS details (API parameters, permissions,
  limits, error codes), verify against documentation rather than guessing.
  State uncertainty explicitly if you cannot confirm.
- When creating infrastructure, prefer infrastructure-as-code (AWS CDK or
  CloudFormation) over direct CLI commands.
<!-- END AWS Agent Toolkit rules -->
