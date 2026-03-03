-- ==============================================
-- KANBAN DASHBOARD - DEVELOPER SUB-PORTAL SCHEMA
-- ==============================================

-- 1. Create the Developers table
CREATE TABLE IF NOT EXISTS developers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    passcode TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create the Developer Logs (Reports) table
CREATE TABLE IF NOT EXISTS developer_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    developer_name TEXT NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logout_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    tasks_completed JSONB DEFAULT '[]'::jsonb
);

-- 3. (Optional) Insert a default test developer
INSERT INTO developers (name, passcode) 
VALUES ('John Doe', '1234')
ON CONFLICT DO NOTHING;

-- 4. Set up Row Level Security (RLS) allowing anonymous access for demo purposes
-- Make sure to adjust these policies in a real production environment!
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for developers" ON developers FOR ALL USING (true);

ALTER TABLE developer_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable all operations for logs" ON developer_logs FOR ALL USING (true);
