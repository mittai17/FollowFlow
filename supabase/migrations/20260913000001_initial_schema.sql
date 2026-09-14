-- FollowFlow Database Schema
-- Supabase PostgreSQL with Row Level Security

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ──────────────────────────────────────────────
-- ORGANIZATIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- USERS (extends auth.users)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member', 'viewer')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- PEOPLE (external contacts)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS people (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- CASES
-- ──────────────────────────────────────────────
CREATE SEQUENCE IF NOT EXISTS case_number_seq START 1000;

CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id),
  case_number TEXT UNIQUE DEFAULT ('#' || nextval('case_number_seq')::TEXT),
  title TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','waiting','at_risk','blocked','completed','cancelled')),
  risk TEXT NOT NULL DEFAULT 'low' CHECK (risk IN ('low','medium','high','critical')),
  deadline TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_cases_updated_at ON cases;
CREATE TRIGGER update_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- REQUIREMENTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','waiting','received','verified','rejected')),
  required_evidence TEXT,
  document_id UUID,
  sort_order INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- DOCUMENTS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  requirement_id UUID REFERENCES requirements(id),
  name TEXT NOT NULL,
  document_type TEXT,
  storage_path TEXT,
  file_size INTEGER,
  mime_type TEXT,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected','expired')),
  verification_notes TEXT,
  expiration_date DATE,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  verified_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'
);

-- ──────────────────────────────────────────────
-- PROMISES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS promises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  person_id UUID REFERENCES people(id),
  person_name TEXT,
  commitment TEXT NOT NULL,
  original_message TEXT,
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','fulfilled','broken','updated','cancelled')),
  evidence_required TEXT,
  evidence_document_id UUID REFERENCES documents(id),
  confidence FLOAT DEFAULT 0.9,
  follow_up_count INTEGER DEFAULT 0,
  last_follow_up_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TRIGGER IF EXISTS update_promises_updated_at ON promises;
CREATE TRIGGER update_promises_updated_at
  BEFORE UPDATE ON promises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ──────────────────────────────────────────────
-- DEPENDENCIES
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dependencies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  source_requirement_id UUID REFERENCES requirements(id),
  target_requirement_id UUID REFERENCES requirements(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','unblocked','completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- EVENTS (Activity Log)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  actor TEXT NOT NULL DEFAULT 'agent',
  actor_type TEXT NOT NULL DEFAULT 'agent' CHECK (actor_type IN ('agent','user','system')),
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- APPROVALS (Human-in-the-Loop)
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  recommendation TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','escalated')),
  confidence FLOAT DEFAULT 0.9,
  decision TEXT,
  decided_by UUID REFERENCES users(id),
  context_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- ──────────────────────────────────────────────
-- SCHEDULED ACTIONS
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scheduled_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','running','done','failed','cancelled')),
  payload JSONB DEFAULT '{}',
  result JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  executed_at TIMESTAMPTZ
);

-- ──────────────────────────────────────────────
-- EMAIL LOG
-- ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id),
  direction TEXT NOT NULL CHECK (direction IN ('sent','received')),
  from_address TEXT NOT NULL,
  to_address TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT,
  raw_content TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ──────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_cases_org ON cases(organization_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_requirements_case ON requirements(case_id);
CREATE INDEX IF NOT EXISTS idx_promises_case ON promises(case_id);
CREATE INDEX IF NOT EXISTS idx_promises_status ON promises(status);
CREATE INDEX IF NOT EXISTS idx_promises_deadline ON promises(deadline);
CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_events_case ON events(case_id);
CREATE INDEX IF NOT EXISTS idx_events_created ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_status ON scheduled_actions(status);

-- ──────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE people ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE promises ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_log ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM users WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations
DROP POLICY IF EXISTS "org_select" ON organizations;
CREATE POLICY "org_select" ON organizations FOR SELECT USING (id = get_user_org_id());

-- Users
DROP POLICY IF EXISTS "users_select" ON users;
CREATE POLICY "users_select" ON users FOR SELECT USING (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "users_update_own" ON users;
CREATE POLICY "users_update_own" ON users FOR UPDATE USING (id = auth.uid());
DROP POLICY IF EXISTS "users_insert_own" ON users;
CREATE POLICY "users_insert_own" ON users FOR INSERT WITH CHECK (id = auth.uid());

-- Cases
DROP POLICY IF EXISTS "cases_select" ON cases;
CREATE POLICY "cases_select" ON cases FOR SELECT USING (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "cases_insert" ON cases;
CREATE POLICY "cases_insert" ON cases FOR INSERT WITH CHECK (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "cases_update" ON cases;
CREATE POLICY "cases_update" ON cases FOR UPDATE USING (organization_id = get_user_org_id());
DROP POLICY IF EXISTS "cases_delete" ON cases;
CREATE POLICY "cases_delete" ON cases FOR DELETE USING (organization_id = get_user_org_id());

-- Requirements
DROP POLICY IF EXISTS "req_all" ON requirements;
CREATE POLICY "req_all" ON requirements FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- People
DROP POLICY IF EXISTS "people_all" ON people;
CREATE POLICY "people_all" ON people FOR ALL USING (organization_id = get_user_org_id());

-- Documents
DROP POLICY IF EXISTS "docs_all" ON documents;
CREATE POLICY "docs_all" ON documents FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- Promises
DROP POLICY IF EXISTS "promises_all" ON promises;
CREATE POLICY "promises_all" ON promises FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- Dependencies
DROP POLICY IF EXISTS "deps_all" ON dependencies;
CREATE POLICY "deps_all" ON dependencies FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- Events
DROP POLICY IF EXISTS "events_select" ON events;
CREATE POLICY "events_select" ON events FOR SELECT USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);
DROP POLICY IF EXISTS "events_insert" ON events;
CREATE POLICY "events_insert" ON events FOR INSERT WITH CHECK (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- Approvals
DROP POLICY IF EXISTS "approvals_all" ON approvals;
CREATE POLICY "approvals_all" ON approvals FOR ALL USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- Scheduled actions
DROP POLICY IF EXISTS "sched_select" ON scheduled_actions;
CREATE POLICY "sched_select" ON scheduled_actions FOR SELECT USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);

-- Email log
DROP POLICY IF EXISTS "email_select" ON email_log;
CREATE POLICY "email_select" ON email_log FOR SELECT USING (
  case_id IN (SELECT id FROM cases WHERE organization_id = get_user_org_id())
);
