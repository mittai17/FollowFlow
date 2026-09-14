-- FollowFlow Seed Data (Demo)
-- Creates a realistic demo organization with vendor onboarding case

-- Insert demo organization
INSERT INTO organizations (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Acme Corp (Demo)')
ON CONFLICT DO NOTHING;

-- Note: Users are created via auth.users through Supabase Auth
-- The seed below assumes a demo user is created first via the app

-- Insert demo people (external contacts)
INSERT INTO people (id, organization_id, name, email, company, role) VALUES
  ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Rahul Sharma', 'rahul@acmesupplies.com', 'Acme Supplies', 'Vendor Contact'),
  ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Priya Singh', 'priya@techdist.com', 'Tech Distributors', 'Accounts Manager'),
  ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'James Wilson', 'james@globalparts.io', 'Global Parts Inc', 'Director')
ON CONFLICT DO NOTHING;
