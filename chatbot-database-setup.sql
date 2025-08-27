-- Chatbot Database Setup for Supabase
-- This script creates all necessary tables and functions for the chatbot system

-- Enable necessary extensions
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

-- Function to get or create chat session
CREATE OR REPLACE FUNCTION get_or_create_chat_session(p_visitor_id TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    session_id UUID;
BEGIN
    -- Try to find existing active session
    SELECT id INTO session_id
    FROM chatbot_sessions
    WHERE visitor_id = p_visitor_id AND status = 'active'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no active session found, create new one
    IF session_id IS NULL THEN
        INSERT INTO chatbot_sessions (visitor_id, status)
        VALUES (p_visitor_id, 'active')
        RETURNING id INTO session_id;
    END IF;
    
    RETURN session_id;
END;
$$;

-- Function to increment a value (for message count)
CREATE OR REPLACE FUNCTION increment(x INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN x + 1;
END;
$$;

-- Function to update session message count
CREATE OR REPLACE FUNCTION update_session_message_count(p_session_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE chatbot_sessions
    SET 
        total_messages = (
            SELECT COUNT(*) 
            FROM chatbot_messages 
            WHERE session_id = p_session_id
        ),
        updated_at = NOW()
    WHERE id = p_session_id;
END;
$$;

-- Function to generate daily analytics
CREATE OR REPLACE FUNCTION generate_daily_analytics(p_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    analytics_record chatbot_analytics%ROWTYPE;
BEGIN
    -- Calculate analytics for the given date
    SELECT 
        p_date as date,
        COUNT(DISTINCT cs.id) as total_sessions,
        COUNT(cm.id) as total_messages,
        COUNT(DISTINCT cs.visitor_id) as unique_visitors,
        COALESCE(AVG(cm.response_time_ms), 0) as avg_response_time_ms,
        NULL as satisfaction_score,
        jsonb_build_object(
            'questions', (
                SELECT jsonb_agg(jsonb_build_object('question', content, 'count', count))
                FROM (
                    SELECT content, COUNT(*) as count
                    FROM chatbot_messages
                    WHERE DATE(created_at) = p_date 
                    AND sender_type = 'user'
                    GROUP BY content
                    ORDER BY count DESC
                    LIMIT 10
                ) q
            )
        ) as most_common_questions
    INTO analytics_record
    FROM chatbot_sessions cs
    LEFT JOIN chatbot_messages cm ON cs.id = cm.session_id AND DATE(cm.created_at) = p_date
    WHERE DATE(cs.created_at) = p_date;
    
    -- Insert or update analytics record
    INSERT INTO chatbot_analytics (
        date, total_sessions, total_messages, unique_visitors, 
        avg_response_time_ms, satisfaction_score, most_common_questions
    ) VALUES (
        analytics_record.date, analytics_record.total_sessions, analytics_record.total_messages,
        analytics_record.unique_visitors, analytics_record.avg_response_time_ms,
        analytics_record.satisfaction_score, analytics_record.most_common_questions
    )
    ON CONFLICT (date) DO UPDATE SET
        total_sessions = EXCLUDED.total_sessions,
        total_messages = EXCLUDED.total_messages,
        unique_visitors = EXCLUDED.unique_visitors,
        avg_response_time_ms = EXCLUDED.avg_response_time_ms,
        satisfaction_score = EXCLUDED.satisfaction_score,
        most_common_questions = EXCLUDED.most_common_questions,
        created_at = NOW();
END;
$$;

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

-- Insert sample FAQ entries
INSERT INTO chatbot_faq (question, answer, category, keywords, priority, is_active) VALUES
('What services do you offer?', 'We offer comprehensive web development, mobile app development, and consulting services. Our expertise includes React, Node.js, Python, and cloud solutions.', 'General', ARRAY['services', 'offer', 'what', 'do'], 1, true),
('How much does a website cost?', 'Website costs vary based on complexity and requirements. Basic websites start at $500, while complex applications can range from $2000 to $10000+. Contact us for a detailed quote.', 'Pricing', ARRAY['cost', 'price', 'how much', 'website'], 2, true),
('Do you provide maintenance services?', 'Yes, we offer ongoing maintenance and support services for all our projects. This includes updates, security patches, and technical support.', 'Services', ARRAY['maintenance', 'support', 'updates'], 3, true),
('What technologies do you use?', 'We use modern technologies including React, Next.js, Node.js, Python, PostgreSQL, and cloud platforms like AWS and Vercel.', 'Technical', ARRAY['technologies', 'tech', 'stack', 'what'], 4, true),
('How long does development take?', 'Development time varies by project complexity. Simple websites take 1-2 weeks, while complex applications can take 2-6 months. We''ll provide a detailed timeline during planning.', 'Timeline', ARRAY['time', 'duration', 'how long', 'development'], 5, true)
ON CONFLICT DO NOTHING;

-- Enable Row Level Security (RLS)
ALTER TABLE chatbot_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_faq ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chatbot_sessions
CREATE POLICY "Allow public read access to sessions" ON chatbot_sessions
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert sessions" ON chatbot_sessions
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to update sessions" ON chatbot_sessions
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete sessions" ON chatbot_sessions
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for chatbot_messages
CREATE POLICY "Allow public read access to messages" ON chatbot_messages
    FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to insert messages" ON chatbot_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to update messages" ON chatbot_messages
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin users to delete messages" ON chatbot_messages
    FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for chatbot_faq
CREATE POLICY "Allow public read access to FAQ" ON chatbot_faq
    FOR SELECT USING (is_active = true);

CREATE POLICY "Allow admin users to manage FAQ" ON chatbot_faq
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for chatbot_settings
CREATE POLICY "Allow public read access to public settings" ON chatbot_settings
    FOR SELECT USING (is_public = true);

CREATE POLICY "Allow admin users to manage settings" ON chatbot_settings
    FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for chatbot_analytics
CREATE POLICY "Allow admin users to manage analytics" ON chatbot_analytics
    FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chatbot_sessions_updated_at BEFORE UPDATE ON chatbot_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_faq_updated_at BEFORE UPDATE ON chatbot_faq
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_chatbot_settings_updated_at BEFORE UPDATE ON chatbot_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to update session message count
CREATE OR REPLACE FUNCTION trigger_update_session_message_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM update_session_message_count(NEW.session_id);
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM update_session_message_count(OLD.session_id);
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_session_message_count_trigger
    AFTER INSERT OR DELETE ON chatbot_messages
    FOR EACH ROW EXECUTE FUNCTION trigger_update_session_message_count();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
