-- Quick Chatbot Setup for Supabase
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

-- Insert sample data for immediate testing
INSERT INTO chatbot_sessions (visitor_id, status, total_messages) VALUES
('VIS_20241226_abc123', 'active', 15),
('VIS_20241226_def456', 'ended', 8),
('VIS_20241226_ghi789', 'active', 23),
('VIS_20241226_jkl012', 'ended', 12),
('VIS_20241226_mno345', 'archived', 5)
ON CONFLICT DO NOTHING;

-- Insert sample FAQ entries
INSERT INTO chatbot_faq (question, answer, category, keywords, priority, is_active, usage_count) VALUES
('What services do you offer?', 'We offer comprehensive web development, mobile app development, and consulting services. Our expertise includes React, Node.js, Python, and cloud solutions.', 'General', ARRAY['services', 'offer', 'what', 'do'], 1, true, 25),
('How much does a website cost?', 'Website costs vary based on complexity and requirements. Basic websites start at $500, while complex applications can range from $2000 to $10000+. Contact us for a detailed quote.', 'Pricing', ARRAY['cost', 'price', 'how much', 'website'], 2, true, 18),
('Do you provide maintenance services?', 'Yes, we offer ongoing maintenance and support services for all our projects. This includes updates, security patches, and technical support.', 'Services', ARRAY['maintenance', 'support', 'updates'], 3, true, 12),
('What technologies do you use?', 'We use modern technologies including React, Next.js, Node.js, Python, PostgreSQL, and cloud platforms like AWS and Vercel.', 'Technical', ARRAY['technologies', 'tech', 'stack', 'what'], 4, true, 8),
('How long does development take?', 'Development time varies by project complexity. Simple websites take 1-2 weeks, while complex applications can take 2-6 months. We''ll provide a detailed timeline during planning.', 'Timeline', ARRAY['time', 'duration', 'how long', 'development'], 5, true, 15)
ON CONFLICT DO NOTHING;

-- Insert default settings
INSERT INTO chatbot_settings (setting_key, setting_value, setting_type, description, is_public) VALUES
('chatbot_status', 'active', 'string', 'Chatbot status (active/inactive)', true),
('auto_response', 'true', 'boolean', 'Enable automatic responses', true),
('response_timeout', '30', 'number', 'Response timeout in seconds', true),
('welcome_message', 'Hello! I''m here to help you with any questions about our services. How can I assist you today?', 'string', 'Welcome message for new visitors', true),
('max_messages_per_session', '50', 'number', 'Maximum messages per chat session', false),
('enable_analytics', 'true', 'boolean', 'Enable analytics tracking', false),
('session_timeout_minutes', '30', 'number', 'Session timeout in minutes', false)
ON CONFLICT (setting_key) DO NOTHING;

-- Insert sample analytics data for the last 7 days
INSERT INTO chatbot_analytics (date, total_sessions, total_messages, unique_visitors, avg_response_time_ms) VALUES
(CURRENT_DATE - INTERVAL '6 days', 5, 45, 3, 1200),
(CURRENT_DATE - INTERVAL '5 days', 8, 67, 5, 1100),
(CURRENT_DATE - INTERVAL '4 days', 12, 89, 8, 950),
(CURRENT_DATE - INTERVAL '3 days', 15, 123, 10, 900),
(CURRENT_DATE - INTERVAL '2 days', 18, 156, 12, 850),
(CURRENT_DATE - INTERVAL '1 day', 22, 189, 15, 800),
(CURRENT_DATE, 25, 234, 18, 750)
ON CONFLICT (date) DO NOTHING;

-- Insert sample messages for the sessions
INSERT INTO chatbot_messages (session_id, visitor_id, sender_type, content, response_time_ms)
SELECT 
    cs.id,
    cs.visitor_id,
    CASE WHEN RANDOM() > 0.5 THEN 'user' ELSE 'bot' END,
    CASE 
        WHEN RANDOM() > 0.5 THEN 'Hello, I need help with my project'
        ELSE 'I can help you with that! What specific assistance do you need?'
    END,
    CASE WHEN RANDOM() > 0.5 THEN 800 + (RANDOM() * 400)::INTEGER ELSE NULL END
FROM chatbot_sessions cs
WHERE cs.status = 'active'
ON CONFLICT DO NOTHING;

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
