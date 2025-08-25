-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demo_projects table
CREATE TABLE IF NOT EXISTS demo_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_panel_url VARCHAR(500),
  admin_credentials JSONB,
  dispatcher_panel_url VARCHAR(500),
  dispatcher_credentials JSONB,
  android_user_app VARCHAR(500),
  android_driver_app VARCHAR(500),
  ios_user_app VARCHAR(500),
  ios_driver_app VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create live_clients table
CREATE TABLE IF NOT EXISTS live_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  admin_panel_url VARCHAR(500),
  dispatcher_panel_url VARCHAR(500),
  android_user_app VARCHAR(500),
  android_driver_app VARCHAR(500),
  ios_user_app VARCHAR(500),
  ios_driver_app VARCHAR(500),
  website_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create demo_videos table
CREATE TABLE IF NOT EXISTS demo_videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  youtube_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create status_monitors table (updated for Uptime Robot integration)
CREATE TABLE IF NOT EXISTS status_monitors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES live_clients(id) ON DELETE CASCADE,
  uptime_robot_id VARCHAR(255),
  url VARCHAR(500) NOT NULL,
  status VARCHAR(50) DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_checked TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  response_time INTEGER,
  uptime_ratio DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create monitoring_alerts table
CREATE TABLE IF NOT EXISTS monitoring_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES live_clients(id) ON DELETE CASCADE,
  monitor_id VARCHAR(255),
  status VARCHAR(50) CHECK (status IN ('up', 'down', 'warning')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create automated_workflows table
CREATE TABLE IF NOT EXISTS automated_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger VARCHAR(50) CHECK (trigger IN ('uptime_alert', 'status_change', 'manual', 'scheduled')),
  n8n_workflow_id VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for role-based access control
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('admin', 'user', 'vendor')),
  is_email_verified BOOLEAN DEFAULT FALSE,
  is_phone_verified BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  is_vendor_created BOOLEAN DEFAULT FALSE,
  email_verification_token VARCHAR(255),
  phone_verification_otp VARCHAR(6),
  phone_verification_expires TIMESTAMP WITH TIME ZONE,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO categories (name, description, icon) VALUES
('Food & Restaurant', 'Restaurant management and food delivery applications', 'pizza'),
('Grocery & Market', 'Grocery store and marketplace applications', 'shopping-cart'),
('Transportation', 'Ride sharing and transportation management', 'car'),
('Real Estate', 'Property management and real estate platforms', 'home'),
('Healthcare', 'Medical and healthcare management systems', 'stethoscope'),
('Education', 'Educational platforms and e-learning systems', 'graduation-cap'),
('Fitness & Wellness', 'Fitness tracking and wellness applications', 'dumbbell'),
('Beauty & Salon', 'Beauty services and salon management', 'palette'),
('Fashion & Retail', 'Fashion e-commerce and retail management', 'shirt'),
('Photography', 'Photography services and portfolio platforms', 'camera'),
('Entertainment', 'Entertainment and media platforms', 'music'),
('Travel & Tourism', 'Travel booking and tourism management', 'plane'),
('Local Services', 'Local service provider platforms', 'map-pin'),
('E-commerce', 'General e-commerce and online shopping', 'shopping-bag'),
('Finance', 'Financial services and fintech applications', 'credit-card');

-- Insert sample demo projects
INSERT INTO demo_projects (category_id, name, description, admin_panel_url, admin_credentials, dispatcher_panel_url, dispatcher_credentials, android_user_app, android_driver_app, ios_user_app, ios_driver_app) VALUES
(
  (SELECT id FROM categories WHERE name = 'Food & Restaurant' LIMIT 1),
  'RestaurantPro Demo',
  'Full-featured restaurant management system with multi-location support, online ordering, and delivery management',
  'https://restaurant-demo.codebrewlabs.com',
  '{"username": "demo", "password": "demo123"}',
  'https://restaurant-demo.codebrewlabs.com',
  '{"username": "admin", "password": "admin123"}',
  'https://play.google.com/store/apps/details?id=com.tom.user',
  'https://play.google.com/store/apps/details?id=com.tom.driver',
  'https://apps.apple.com/app/tom-user/id123',
  'https://apps.apple.com/app/tom-driver/id124'
),
(
  (SELECT id FROM categories WHERE name = 'Food & Restaurant' LIMIT 1),
  'QuickBite Demo',
  'Fast-food focused solution with quick order processing and real-time delivery tracking',
  'https://quickbite-demo.codebrewlabs.com',
  '{"username": "admin", "password": "admin123"}',
  'https://quickbite-demo.codebrewlabs.com',
  '{"username": "dispatcher", "password": "dispatch123"}',
  'https://play.google.com/store/apps/details?id=com.cityride.user',
  'https://play.google.com/store/apps/details?id=com.cityride.driver',
  'https://apps.apple.com/app/cityride-user/id456',
  'https://apps.apple.com/app/cityride-driver/id457'
),
(
  (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1),
  'RideShare Demo',
  'Complete ride-sharing platform with driver and passenger apps',
  'https://rideshare-demo.codebrewlabs.com',
  '{"username": "demo", "password": "demo123"}',
  'https://rideshare-demo.codebrewlabs.com',
  '{"username": "dispatcher", "password": "dispatch123"}',
  'https://play.google.com/store/apps/details?id=com.techmart.user',
  NULL,
  'https://apps.apple.com/app/techmart-user/id789',
  NULL
),
(
  (SELECT id FROM categories WHERE name = 'E-commerce' LIMIT 1),
  'ShopHub Demo',
  'Multi-vendor e-commerce platform with advanced inventory management',
  'https://shophub-demo.codebrewlabs.com',
  '{"username": "admin", "password": "admin123"}',
  NULL,
  NULL,
  'https://play.google.com/store/apps/details?id=com.techmart.user',
  NULL,
  'https://apps.apple.com/app/techmart-user/id789',
  NULL
);

-- Insert sample live clients
INSERT INTO live_clients (category_id, name, description, admin_panel_url, dispatcher_panel_url, android_user_app, android_driver_app, ios_user_app, ios_driver_app, website_url, status) VALUES
(
  (SELECT id FROM categories WHERE name = 'Food & Restaurant' LIMIT 1),
  'Taste of Mumbai',
  'Premium Indian restaurant with 3 locations across the city',
  'https://admin.tasteofmumbai.com',
  'https://dispatch.tasteofmumbai.com',
  'https://play.google.com/store/apps/details?id=com.tom.user',
  'https://play.google.com/store/apps/details?id=com.tom.driver',
  'https://apps.apple.com/app/tom-user/id123',
  'https://apps.apple.com/app/tom-driver/id124',
  'https://tasteofmumbai.com',
  'active'
),
(
  (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1),
  'CityRide Express',
  'Urban transportation service with electric vehicle fleet',
  'https://admin.cityride.com',
  'https://dispatch.cityride.com',
  'https://play.google.com/store/apps/details?id=com.cityride.user',
  'https://play.google.com/store/apps/details?id=com.cityride.driver',
  'https://apps.apple.com/app/cityride-user/id456',
  'https://apps.apple.com/app/cityride-driver/id457',
  'https://cityride.com',
  'active'
),
(
  (SELECT id FROM categories WHERE name = 'E-commerce' LIMIT 1),
  'TechMart Online',
  'Electronics and gadgets e-commerce platform',
  'https://admin.techmart.com',
  NULL,
  'https://play.google.com/store/apps/details?id=com.techmart.user',
  NULL,
  'https://apps.apple.com/app/techmart-user/id789',
  NULL,
  'https://techmart.com',
  'active'
);

-- Insert sample demo videos
INSERT INTO demo_videos (category_id, title, description, youtube_url, thumbnail_url) VALUES
(
  (SELECT id FROM categories WHERE name = 'Food & Restaurant' LIMIT 1),
  'RestaurantPro Complete Walkthrough',
  'Complete demonstration of RestaurantPro admin panel and mobile applications',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
),
(
  (SELECT id FROM categories WHERE name = 'Food & Restaurant' LIMIT 1),
  'QuickBite Order Processing Demo',
  'Real-time order processing and delivery management demonstration',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
),
(
  (SELECT id FROM categories WHERE name = 'Transportation' LIMIT 1),
  'RideShare Driver App Demo',
  'Complete walkthrough of the driver application features',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
),
(
  (SELECT id FROM categories WHERE name = 'E-commerce' LIMIT 1),
  'ShopHub Multi-Vendor Platform',
  'Multi-vendor e-commerce platform demonstration with inventory management',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Enable read access for authenticated users" ON categories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON categories
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON demo_projects
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON demo_projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON live_clients
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON live_clients
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON status_monitors
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON status_monitors
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON monitoring_alerts
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON monitoring_alerts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable read access for authenticated users" ON automated_workflows
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for authenticated users" ON automated_workflows
  FOR ALL USING (auth.role() = 'authenticated');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_demo_projects_category_id ON demo_projects(category_id);
CREATE INDEX IF NOT EXISTS idx_live_clients_category_id ON live_clients(category_id);
CREATE INDEX IF NOT EXISTS idx_live_clients_status ON live_clients(status);
CREATE INDEX IF NOT EXISTS idx_status_monitors_client_id ON status_monitors(client_id);
CREATE INDEX IF NOT EXISTS idx_status_monitors_status ON status_monitors(status);
CREATE INDEX IF NOT EXISTS idx_status_monitors_uptime_robot_id ON status_monitors(uptime_robot_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_client_id ON monitoring_alerts(client_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_alerts_resolved ON monitoring_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_automated_workflows_active ON automated_workflows(active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_demo_projects_updated_at BEFORE UPDATE ON demo_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_live_clients_updated_at BEFORE UPDATE ON live_clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_status_monitors_updated_at BEFORE UPDATE ON status_monitors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automated_workflows_updated_at BEFORE UPDATE ON automated_workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: Qwerty#125656)
INSERT INTO users (email, password_hash, full_name, role, is_verified, is_active) VALUES
('sahilcodebrew77@gmail.com', 'UXdlcnR5IzEyNTY1NnNhbHQ=', 'Sahil Code Brew', 'admin', TRUE, TRUE);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Enable read access for authenticated users" ON users
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all access for admin users" ON users
  FOR ALL USING (auth.role() = 'authenticated' AND EXISTS (
    SELECT 1 FROM users WHERE email = auth.email() AND role = 'admin'
  ));

-- Create trigger for users table
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();