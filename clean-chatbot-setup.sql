-- Clean Chatbot Setup for Supabase (No Mock Data)
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Chatbot Sessions Table
CREATE TABLE IF NOT EXISTS chatbot_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    visitor_id TEXT NOT NULL,
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    total_messages INTEGER DEFAULT 0,
    visitor_info JSONB,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'ended', 'archived')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Messages Table
CREATE TABLE IF NOT EXISTS chatbot_messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID REFERENCES chatbot_sessions(id) ON DELETE CASCADE,
    visitor_id TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'bot', 'admin')),
    content TEXT NOT NULL,
    metadata JSONB,
    response_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot FAQ Table
CREATE TABLE IF NOT EXISTS chatbot_faq (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    keywords TEXT[],
    priority INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Settings Table
CREATE TABLE IF NOT EXISTS chatbot_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value TEXT,
    setting_type TEXT DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbot Analytics Table
CREATE TABLE IF NOT EXISTS chatbot_analytics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    date DATE NOT NULL,
    total_sessions INTEGER DEFAULT 0,
    total_messages INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    avg_response_time_ms INTEGER DEFAULT 0,
    satisfaction_score DECIMAL(3,2),
    most_common_questions JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(date)
);

-- Insert only essential default settings (no mock data)
INSERT INTO chatbot_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('chatbot_status', 'active', 'string', 'Chatbot status (active/inactive)', true),
('auto_response', 'true', 'boolean', 'Enable automatic responses', true),
('response_timeout', '30', 'number', 'Response timeout in seconds', true),
('welcome_message', 'Hello! I''m here to help you with any questions about our services. How can I assist you today?', 'string', 'Welcome message for new visitors', true),
('max_messages_per_session', '50', 'number', 'Maximum messages per chat session', false),
('enable_analytics', 'true', 'boolean', 'Enable analytics tracking', false),
('session_timeout_minutes', '30', 'number', 'Session timeout in minutes', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Enable RLS
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Allow public read access to sessions" ON chatbot_sessions FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert sessions" ON chatbot_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update sessions" ON chatbot_sessions FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete sessions" ON chatbot_sessions FOR DELETE USING (true);

CREATE POLICY "Allow public read access to messages" ON chatbot_messages FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to insert messages" ON chatbot_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated users to update messages" ON chatbot_messages FOR UPDATE USING (true);
CREATE POLICY "Allow authenticated users to delete messages" ON chatbot_messages FOR DELETE USING (true);

CREATE POLICY "Allow public read access to FAQ" ON chatbot_faq FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage FAQ" ON chatbot_faq FOR ALL USING (true);

CREATE POLICY "Allow public read access to settings" ON chatbot_settings FOR SELECT USING (true);
CREATE POLICY "Allow authenticated users to manage settings" ON chatbot_settings FOR ALL USING (true);

CREATE POLICY "Allow authenticated users to manage analytics" ON chatbot_analytics FOR ALL USING (true);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_visitor_id ON chatbot_sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_status ON chatbot_sessions(status);
CREATE INDEX IF NOT EXISTS idx_chatbot_sessions_created_at ON chatbot_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_session_id ON chatbot_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_visitor_id ON chatbot_messages(visitor_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_messages_created_at ON chatbot_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chatbot_faq_category ON chatbot_faq(category);
CREATE INDEX IF NOT EXISTS idx_chatbot_faq_is_active ON chatbot_faq(is_active);
CREATE INDEX IF NOT EXISTS idx_chatbot_analytics_date ON chatbot_analytics(date);
