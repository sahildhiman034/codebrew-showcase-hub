# Integration Setup Guide

This guide will help you set up and configure the Supabase, N8N, and Uptime Robot integrations for the CodeBrew Showcase Hub.

## Prerequisites

- Node.js 18+ and npm/yarn/bun
- Supabase account and project
- N8N instance (local or cloud)
- Uptime Robot account and API key

## 1. Supabase Setup

### 1.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new account or sign in
2. Create a new project
3. Note down your project URL and anon key from the API settings

### 1.2 Database Schema

Run the following SQL in your Supabase SQL editor to create the required tables:

```sql
-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Demo projects table
CREATE TABLE demo_projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  demo_videos TEXT[],
  demo_panel_url VARCHAR(500),
  demo_credentials JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Live clients table
CREATE TABLE live_clients (
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
  website_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status monitors table
CREATE TABLE status_monitors (
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

-- Monitoring alerts table
CREATE TABLE monitoring_alerts (
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

-- Automated workflows table
CREATE TABLE automated_workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger VARCHAR(50) CHECK (trigger IN ('uptime_alert', 'status_change', 'manual', 'scheduled')),
  n8n_workflow_id VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_monitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automated_workflows ENABLE ROW LEVEL SECURITY;

-- Create policies (adjust based on your authentication needs)
CREATE POLICY "Allow public read access" ON categories FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON demo_projects FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON live_clients FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON status_monitors FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON monitoring_alerts FOR SELECT USING (true);
CREATE POLICY "Allow public read access" ON automated_workflows FOR SELECT USING (true);
```

## 2. N8N Setup

### 2.1 Install N8N

#### Option A: Local Installation
```bash
# Install N8N globally
npm install -g n8n

# Start N8N
n8n start
```

#### Option B: Docker Installation
```bash
# Create docker-compose.yml
version: '3.8'
services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your_password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:

# Start with Docker Compose
docker-compose up -d
```

### 2.2 Configure N8N

1. Access N8N at `http://localhost:5678`
2. Create an account and log in
3. Go to Settings > API Keys
4. Create a new API key for your application
5. Note down the API key

### 2.3 Create Sample Workflows

#### Uptime Alert Workflow
1. Create a new workflow in N8N
2. Add a "Webhook" trigger node
3. Add an "HTTP Request" node to send notifications
4. Configure the workflow to handle uptime alerts
5. Activate the workflow and note the webhook URL

## 3. Uptime Robot Setup

### 3.1 Create Account

1. Go to [uptimerobot.com](https://uptimerobot.com) and create an account
2. Verify your email address

### 3.2 Get API Key

1. Log in to Uptime Robot
2. Go to My Settings > API Configuration
3. Generate a new API key
4. Note down the API key

### 3.3 Create Monitors

1. Go to Add New Monitor
2. Choose monitor type (HTTP(s) for websites)
3. Enter the URL to monitor
4. Set monitoring interval (recommended: 5 minutes)
5. Save the monitor

## 4. Environment Configuration

### 4.1 Create Environment File

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# N8N Configuration
VITE_N8N_BASE_URL=http://localhost:5678
VITE_N8N_WEBHOOK_URL=http://localhost:5678/webhook/
VITE_N8N_API_KEY=your_n8n_api_key

# Uptime Robot Configuration
VITE_UPTIME_ROBOT_API_KEY=your_uptime_robot_api_key
VITE_UPTIME_ROBOT_BASE_URL=https://api.uptimerobot.com/v2

# Application Configuration
VITE_APP_NAME=CodeBrew Showcase Hub
VITE_APP_VERSION=1.0.0
```

### 4.2 Install Dependencies

```bash
npm install
# or
yarn install
# or
bun install
```

## 5. Testing the Integrations

### 5.1 Start the Development Server

```bash
npm run dev
# or
yarn dev
# or
bun dev
```

### 5.2 Test Connections

1. Navigate to the Status Monitor page
2. Check the integration status indicators
3. Use the Integration Configuration page to test individual connections

### 5.3 Verify Data Flow

1. Create a test monitor in Uptime Robot
2. Check if it appears in the Status Monitor
3. Test N8N webhook triggers
4. Verify data is stored in Supabase

## 6. Production Deployment

### 6.1 Environment Variables

For production, set the environment variables in your hosting platform:

- **Vercel**: Add to Project Settings > Environment Variables
- **Netlify**: Add to Site Settings > Environment Variables
- **Railway**: Add to Variables section

### 6.2 N8N Production Setup

For production N8N deployment:

1. Use a cloud provider (Railway, Render, DigitalOcean)
2. Set up proper authentication
3. Configure webhook URLs for your domain
4. Set up SSL certificates

### 6.3 Uptime Robot Production

1. Use the production API endpoints
2. Set up proper alert contacts
3. Configure monitoring intervals
4. Set up maintenance windows

## 7. Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Supabase project allows your domain
2. **API Key Issues**: Verify API keys are correct and have proper permissions
3. **Webhook Failures**: Check N8N webhook URLs and authentication
4. **Monitor Not Appearing**: Verify Uptime Robot API key and monitor configuration

### Debug Mode

Enable debug logging by setting:

```env
VITE_DEBUG=true
```

### Support

For issues with:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **N8N**: Check [N8N Documentation](https://docs.n8n.io)
- **Uptime Robot**: Check [Uptime Robot API Documentation](https://uptimerobot.com/api)

## 8. Security Considerations

1. **API Keys**: Never commit API keys to version control
2. **Environment Variables**: Use environment variables for all sensitive data
3. **CORS**: Configure CORS properly for your domains
4. **Authentication**: Implement proper authentication for admin features
5. **Rate Limiting**: Be aware of API rate limits for all services

## 9. Monitoring and Maintenance

### Regular Tasks

1. **Weekly**: Check integration status and logs
2. **Monthly**: Review and update API keys
3. **Quarterly**: Audit monitoring configurations
4. **Annually**: Review security settings and access permissions

### Backup Strategy

1. **Database**: Use Supabase's built-in backup features
2. **Workflows**: Export N8N workflows regularly
3. **Configuration**: Document all configuration settings
4. **API Keys**: Store API keys securely and rotate regularly

This setup guide should get you started with all three integrations. The system is designed to be modular, so you can enable/disable individual services as needed. 