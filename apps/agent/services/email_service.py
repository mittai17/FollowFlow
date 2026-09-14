"""
Email service using aiosmtplib (Mailpit for dev / SMTP for prod)
"""
from __future__ import annotations
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from config import get_settings
from services.supabase_client import supabase
import structlog

log = structlog.get_logger()
settings = get_settings()

FROM_ADDRESS = "followflow@example.com"
FROM_NAME = "FollowFlow Agent"


async def send_email(
    to: str,
    subject: str,
    body: str,
    case_id: str | None = None,
    html: str | None = None,
) -> bool:
    """Send an email via SMTP and log it to the database."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_ADDRESS}>"
    msg["To"] = to

    msg.attach(MIMEText(body, "plain"))
    if html:
        msg.attach(MIMEText(html, "html"))

    try:
        await aiosmtplib.send(
            msg,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user or None,
            password=settings.smtp_password or None,
            start_tls=False,
            use_tls=False,
        )
        log.info("email_sent", to=to, subject=subject)

        # Log to DB
        if case_id:
            try:
                supabase().table("email_log").insert({
                    "case_id": case_id,
                    "direction": "sent",
                    "from_address": FROM_ADDRESS,
                    "to_address": to,
                    "subject": subject,
                    "body": body,
                }).execute()
            except Exception as e:
                log.warning("email_log_failed", error=str(e))

        return True
    except Exception as e:
        log.error("email_send_failed", error=str(e), to=to)
        return False


async def send_followup_email(
    to: str,
    person_name: str,
    case_title: str,
    commitment: str,
    original_deadline: str,
    case_id: str | None = None,
) -> bool:
    """Send a contextual follow-up email for a missed commitment."""
    subject = f"Following up: {commitment} — {case_title}"
    body = f"""Hi {person_name},

I'm following up on your commitment to: {commitment}

This was expected by {original_deadline}, and we haven't received it yet.

Could you please provide an update or let me know when we can expect this?

If there's anything blocking you, please let me know so we can help resolve it.

Best regards,
FollowFlow Agent
(automated follow-up on behalf of your team)

---
Case: {case_title}
Commitment: {commitment}
Originally due: {original_deadline}
"""
    html = f"""
<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: #4F46E5; padding: 20px; border-radius: 8px 8px 0 0;">
    <h2 style="color: white; margin: 0;">FollowFlow</h2>
    <p style="color: #C7D2FE; margin: 4px 0 0;">Automated follow-up</p>
  </div>
  <div style="background: white; padding: 24px; border: 1px solid #E4E7EC; border-top: none; border-radius: 0 0 8px 8px;">
    <p>Hi <strong>{person_name}</strong>,</p>
    <p>I'm following up on your commitment:</p>
    <div style="background: #F7F8FA; border-left: 4px solid #4F46E5; padding: 16px; border-radius: 4px; margin: 16px 0;">
      <strong>{commitment}</strong><br>
      <span style="color: #667085;">Originally due: {original_deadline}</span>
    </div>
    <p>Could you please provide an update or let us know when we can expect this?</p>
    <p style="color: #667085; font-size: 14px;">This is an automated follow-up on behalf of your team.</p>
  </div>
</div>
"""
    return await send_email(to, subject, body, case_id=case_id, html=html)
