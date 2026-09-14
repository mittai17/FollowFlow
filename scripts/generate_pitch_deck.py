import os
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE

def create_presentation():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)

    blank_layout = prs.slide_layouts[6] # completely blank layout

    # Colors
    BG_DARK = RGBColor(11, 15, 25)       # #0B0F19
    CARD_BG = RGBColor(30, 41, 59)       # #1E293B
    TEXT_WHITE = RGBColor(248, 250, 252) # #F8FAFC
    TEXT_MUTED = RGBColor(148, 163, 184) # #94A3B8
    AWS_ORANGE = RGBColor(255, 153, 0)   # #FF9900
    INDIGO = RGBColor(99, 102, 241)      # #6366F1
    EMERALD = RGBColor(16, 185, 129)     # #10B981

    def add_bg(slide):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = BG_DARK
        bg.line.color.rgb = BG_DARK
        return bg

    def add_header(slide, tag, title, subtitle):
        # Tag / Track
        tb_tag = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(11.7), Inches(0.4))
        p_tag = tb_tag.text_frame.paragraphs[0]
        p_tag.text = tag.upper()
        p_tag.font.size = Pt(11)
        p_tag.font.bold = True
        p_tag.font.color.rgb = AWS_ORANGE

        # Title
        tb_title = slide.shapes.add_textbox(Inches(0.8), Inches(0.7), Inches(11.7), Inches(0.7))
        p_title = tb_title.text_frame.paragraphs[0]
        p_title.text = title
        p_title.font.size = Pt(26)
        p_title.font.bold = True
        p_title.font.color.rgb = TEXT_WHITE

        # Subtitle
        if subtitle:
            tb_sub = slide.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.7), Inches(0.4))
            p_sub = tb_sub.text_frame.paragraphs[0]
            p_sub.text = subtitle
            p_sub.font.size = Pt(13)
            p_sub.font.color.rgb = TEXT_MUTED

    def add_card(slide, left, top, width, height, border_color=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = CARD_BG
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1.5)
        else:
            card.line.color.rgb = RGBColor(51, 65, 85)
            card.line.width = Pt(1)
        return card

    # =========================================================================
    # SLIDE 1: Title Slide (Cover)
    # =========================================================================
    slide1 = prs.slides.add_slide(blank_layout)
    add_bg(slide1)

    # Hackathon Banner Tag
    tag1 = slide1.shapes.add_textbox(Inches(1.2), Inches(1.3), Inches(10.9), Inches(0.5))
    pt = tag1.text_frame.paragraphs[0]
    pt.text = "AWS AGENTS FOR HUMANS HACKATHON · PROFESSIONAL AGENTS TRACK"
    pt.font.size = Pt(12)
    pt.font.bold = True
    pt.font.color.rgb = AWS_ORANGE

    # Main Headline
    t1 = slide1.shapes.add_textbox(Inches(1.2), Inches(1.7), Inches(10.9), Inches(1.8))
    p1 = t1.text_frame.paragraphs[0]
    p1.text = "FollowFlow"
    p1.font.size = Pt(56)
    p1.font.bold = True
    p1.font.color.rgb = TEXT_WHITE

    p1_sub = t1.text_frame.add_paragraph()
    p1_sub.text = "Autonomous Commitment Network"
    p1_sub.font.size = Pt(32)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = INDIGO

    # Tagline
    t1_tag = slide1.shapes.add_textbox(Inches(1.2), Inches(3.7), Inches(10.9), Inches(0.8))
    ptag = t1_tag.text_frame.paragraphs[0]
    ptag.text = "Keep your promises. Let AI handle the follow-through."
    ptag.font.size = Pt(20)
    ptag.font.bold = True
    ptag.font.color.rgb = TEXT_WHITE

    ptag2 = t1_tag.text_frame.add_paragraph()
    ptag2.text = "The autonomous operations agent that detects commitments, monitors deadlines in the background, collects objective evidence, and verifies completion without human nagging."
    ptag2.font.size = Pt(14)
    ptag2.font.color.rgb = TEXT_MUTED

    # 3 Tech Badges at Bottom
    badge_data = [
        ("AWS Strands Agents SDK", "v1.55.1 Custom Tool Calling & Extraction", INDIGO),
        ("Amazon Bedrock AgentCore", "Native /ping & /invocations Contract Ready", AWS_ORANGE),
        ("Amazon ECS Fargate", "Multi-AZ Rolling Deployment + ALB Live on Port 80", EMERALD)
    ]
    for i, (b_title, b_desc, b_col) in enumerate(badge_data):
        c = add_card(slide1, Inches(1.2 + i * 3.8), Inches(5.1), Inches(3.5), Inches(1.5), b_col)
        tb = slide1.shapes.add_textbox(Inches(1.4 + i * 3.8), Inches(5.3), Inches(3.1), Inches(1.1))
        p = tb.text_frame.paragraphs[0]
        p.text = b_title
        p.font.size = Pt(14)
        p.font.bold = True
        p.font.color.rgb = b_col
        p2 = tb.text_frame.add_paragraph()
        p2.text = b_desc
        p2.font.size = Pt(11)
        p2.font.color.rgb = TEXT_MUTED

    # =========================================================================
    # SLIDE 2: The Problem
    # =========================================================================
    slide2 = prs.slides.add_slide(blank_layout)
    add_bg(slide2)
    add_header(slide2, "The Problem", "Work Shouldn't Get Stuck in Broken Promises", 
               "Every day, professionals make commitments across Slack, emails, PRs, and meetings. Then they disappear.")

    prob_cards = [
        ("1. The 60% Promise Drop-off",
         "Informal commitments ('I'll finish the spec tomorrow', 'I'll send the SOC2 checklist by Friday') slip through the cracks because they aren't tracked anywhere until someone gets angry.",
         INDIGO),
        ("2. The Nagging Tax",
         "Managers and project leads spend 20%+ of their week 'checking in', sending follow-up DMs, and scheduling status meetings just to ask: 'Is this done yet?'",
         AWS_ORANGE),
        ("3. The Tool Disconnect",
         "Jira and Linear require manual ticket creation and manual status updates. They record intent, but do zero continuous background follow-through or objective evidence validation.",
         EMERALD)
    ]
    for i, (title, body, col) in enumerate(prob_cards):
        add_card(slide2, Inches(0.8 + i * 3.95), Inches(2.0), Inches(3.75), Inches(4.7), col)
        tb = slide2.shapes.add_textbox(Inches(1.0 + i * 3.95), Inches(2.3), Inches(3.35), Inches(4.1))
        p = tb.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(18)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tb.text_frame.add_paragraph()
        p2.text = body
        p2.font.size = Pt(13)
        p2.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 3: The Solution
    # =========================================================================
    slide3 = prs.slides.add_slide(blank_layout)
    add_bg(slide3)
    add_header(slide3, "The Solution", "FollowFlow: The Autonomous AI Employee for Commitments",
               "Instead of another dashboard to update, FollowFlow runs autonomously in the background and only surfaces when there's a real decision to make.")

    sol_cards = [
        ("✦ Zero-Overhead Capture",
         "Inline Strands AI Copilot extracts promises directly from natural language conversation: who (@username), what, when, deliverable criteria, and team scope.",
         INDIGO),
        ("⚙ Autonomous Background Loop",
         "Continuous 5-step agent loop: Observe → Reason → Act → Wait → Verify. Monitors deadlines, calculates risk tiers (Active, Due Soon, Critical), and dispatches gentle check-ins via Amazon SES.",
         AWS_ORANGE),
        ("🔍 Objective Evidence Verification",
         "Validates actual deliverables directly against external APIs: merged GitHub PRs, Slack #Done confirmations, Notion PRD statuses, and AWS S3/CloudWatch states.",
         EMERALD),
        ("🛡 Ambiguity Stop Rule (HITL)",
         "Human-in-the-loop safety: When confidence is high, it acts autonomously. When evidence is ambiguous, it halts, explains why it stopped, and provides a 1-click decision.",
         RGBColor(245, 158, 11))
    ]
    for i, (title, body, col) in enumerate(sol_cards):
        row = i // 2
        col_idx = i % 2
        add_card(slide3, Inches(0.8 + col_idx * 5.95), Inches(2.0 + row * 2.5), Inches(5.75), Inches(2.25), col)
        tb = slide3.shapes.add_textbox(Inches(1.0 + col_idx * 5.95), Inches(2.2 + row * 2.5), Inches(5.35), Inches(1.85))
        p = tb.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tb.text_frame.add_paragraph()
        p2.text = body
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 4: Architecture Diagram Slide
    # =========================================================================
    slide4 = prs.slides.add_slide(blank_layout)
    add_bg(slide4)
    add_header(slide4, "Architecture", "Cloud Architecture & Strands Agents Runtime",
               "High-throughput multi-tier architecture built with AWS Strands Agents SDK, Amazon Bedrock AgentCore, and Amazon ECS Fargate.")

    # Embed the high-resolution architecture diagram
    arch_img_path = "/home/mittai/Projects/aws-hack/docs/architecture_diagram.png"
    if os.path.exists(arch_img_path):
        slide4.shapes.add_picture(arch_img_path, Inches(0.8), Inches(1.8), Inches(11.733), Inches(5.2))

    # =========================================================================
    # SLIDE 5: The Autonomous Agent Loop & Strands SDK
    # =========================================================================
    slide5 = prs.slides.add_slide(blank_layout)
    add_bg(slide5)
    add_header(slide5, "Technical Implementation", "AWS Strands Agents SDK v1.55.1 Deep Dive",
               "Autonomous agent orchestration built on AWS Strands tool calling and asynchronous event loops.")

    sdk_features = [
        ("Custom @tool Decorators",
         "1. lookup_industry_integration(): Inspects GitHub, Slack, Notion, AWS endpoints\n"
         "2. calculate_commitment_horizon(): Computes dynamic risk tiers from hours to deadline\n"
         "3. verify_sla_compliance(): Checks team target fulfillment rate against 95% SLA policy",
         INDIGO),
        ("Amazon Bedrock AgentCore Contract",
         "• GET /ping: Automated container liveness and health telemetry\n"
         "• POST /invocations: Bedrock-standard agent invocation payload routing\n"
         "• Plug-and-play ready for Amazon Bedrock managed AgentCore Harness",
         AWS_ORANGE),
        ("Concurrency & Caching",
         "• Non-blocking asyncio.to_thread bridges for CPU-bound agent operations\n"
         "• Dual-tier memory + sessionStorage caching for sub-millisecond page transitions\n"
         "• Real-time SSE streaming for live autonomous agent execution telemetry",
         EMERALD)
    ]
    for i, (title, body, col) in enumerate(sdk_features):
        add_card(slide5, Inches(0.8 + i * 3.95), Inches(2.0), Inches(3.75), Inches(4.7), col)
        tb = slide5.shapes.add_textbox(Inches(1.0 + i * 3.95), Inches(2.2), Inches(3.35), Inches(4.2))
        p = tb.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(16)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tb.text_frame.add_paragraph()
        p2.text = body
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 6: Enterprise Governance & Production Polish
    # =========================================================================
    slide6 = prs.slides.add_slide(blank_layout)
    add_bg(slide6)
    add_header(slide6, "Enterprise Ready", "Enterprise Directory, Governance & Proof",
               "Built with zero mock data, real PostgreSQL multi-tenancy, and cryptographic reliability ratings.")

    ent_features = [
        ("🔒 Enterprise Sign-In Wall",
         "Protected route guards on all workspace pages. Public visitors can only access landing & compliance docs. Authentic login card with Google SSO, AWS Identity Center, and password toggles.",
         INDIGO),
        ("👥 36 Real Database Personas",
         "Every collaborator (@rahulk, @devon_c, @sarah_c) is a real record in PostgreSQL with historical reliability scores, titles, and team memberships. Zero hardcoded mock users.",
         AWS_ORANGE),
        ("🏢 Multi-Org & Team Governance",
         "Organizations host scoped teams with independent 95% target fulfillment SLA policies and automated grace period buffers (24h–72h).",
         EMERALD),
        ("🏅 Cryptographic Proof Ledger",
         "Inspired by AWS Builder Center Badges: every fulfilled commitment generates an immutable SHA-256 evidence digest (e.g. FF-AWS-2026-BEDROCK) for verifiable compliance audits.",
         RGBColor(245, 158, 11))
    ]
    for i, (title, body, col) in enumerate(ent_features):
        row = i // 2
        col_idx = i % 2
        add_card(slide6, Inches(0.8 + col_idx * 5.95), Inches(2.0 + row * 2.5), Inches(5.75), Inches(2.25), col)
        tb = slide6.shapes.add_textbox(Inches(1.0 + col_idx * 5.95), Inches(2.2 + row * 2.5), Inches(5.35), Inches(1.85))
        p = tb.text_frame.paragraphs[0]
        p.text = title
        p.font.size = Pt(17)
        p.font.bold = True
        p.font.color.rgb = col
        p2 = tb.text_frame.add_paragraph()
        p2.text = body
        p2.font.size = Pt(12)
        p2.font.color.rgb = TEXT_WHITE

    # =========================================================================
    # SLIDE 7: Live Cloud Deployment & Why We Win
    # =========================================================================
    slide7 = prs.slides.add_slide(blank_layout)
    add_bg(slide7)
    add_header(slide7, "Conclusion", "Live Production Cloud & Hackathon Summary",
               "Tested, verified, containerized, and deployed live to the public internet on Amazon Web Services.")

    # Left Card: Live Deployment Details
    add_card(slide7, Inches(0.8), Inches(2.0), Inches(5.75), Inches(4.7), AWS_ORANGE)
    tb_left = slide7.shapes.add_textbox(Inches(1.1), Inches(2.3), Inches(5.15), Inches(4.1))
    p = tb_left.text_frame.paragraphs[0]
    p.text = "🌐 Live Production Endpoints"
    p.font.size = Pt(20)
    p.font.bold = True
    p.font.color.rgb = AWS_ORANGE

    details = [
        ("Global Domain:", "http://followflow.duckdns.org"),
        ("Sign-In Wall:", "http://followflow.duckdns.org/login"),
        ("AWS ALB DNS:", "followflow-alb-2061937775.us-east-1.elb.amazonaws.com"),
        ("Open Source Repo:", "https://github.com/mittai17/FollowFlow"),
        ("License:", "MIT Open Source (Full rights)"),
        ("Infrastructure:", "Amazon ECS Fargate (multi-AZ) + AWS ALB + ECR")
    ]
    for k, v in details:
        p_item = tb_left.text_frame.add_paragraph()
        p_item.text = f"• {k} {v}"
        p_item.font.size = Pt(12)
        p_item.font.color.rgb = TEXT_WHITE

    # Right Card: Judging Score Alignment
    add_card(slide7, Inches(6.75), Inches(2.0), Inches(5.75), Inches(4.7), EMERALD)
    tb_right = slide7.shapes.add_textbox(Inches(7.05), Inches(2.3), Inches(5.15), Inches(4.1))
    p_r = tb_right.text_frame.paragraphs[0]
    p_r.text = "🏆 Judging Criteria Alignment"
    p_r.font.size = Pt(20)
    p_r.font.bold = True
    p_r.font.color.rgb = EMERALD

    criteria = [
        ("Technological Implementation:", "Deep AWS Strands Agents SDK custom @tool usage + Bedrock AgentCore /ping & /invocations + ECS Fargate deployment."),
        ("Design Quality:", "Clean Linear/Vercel design system, Inter font, custom Bento grid metrics, zero dummy data."),
        ("Potential Impact:", "Solves the 60% promise drop-off; recovers 4-6 hrs/week of status meetings for engineering teams."),
        ("Creativity & Originality:", "Moves from subjective manual Jira checkboxes to objective, multi-app cryptographic proof."),
        ("Presentation & Demo:", "5-minute comprehensive walkthrough, live URL, and full documentation suite.")
    ]
    for k, v in criteria:
        p_item = tb_right.text_frame.add_paragraph()
        p_item.text = f"✓ {k} {v}"
        p_item.font.size = Pt(11)
        p_item.font.color.rgb = TEXT_WHITE

    output_path = "/home/mittai/Projects/aws-hack/presentation/FollowFlow_AWS_Hackathon_Pitch.pptx"
    prs.save(output_path)
    print(f"Presentation saved successfully to: {output_path}")

if __name__ == "__main__":
    create_presentation()
