# Quick Setup Guide

Since Node.js is not installed, follow these manual steps:

## 1. Create Environment File

Copy the contents from `environment.env` and create a new file called `.env` in your project root:

```bash
# Copy the contents from environment.env to .env
```

## 2. Set Up Database

1. Go to your Supabase project: https://mscltrtuhipjdelehbre.supabase.co
2. Navigate to SQL Editor
3. Copy and paste the entire contents of `database-setup.sql`
4. Click "Run" to execute the SQL

## 3. Get N8N API Key

1. Go to your N8N instance: https://sahilcodebrew.app.n8n.cloud
2. Log in to your account
3. Go to Settings > API Keys
4. Create a new API key
5. Copy the API key and replace `your_n8n_api_key_here` in your `.env` file

## 4. Install Dependencies

Since you don't have Node.js, you'll need to install it first:

### Option A: Install Node.js
1. Go to https://nodejs.org/
2. Download and install Node.js LTS version
3. Restart your terminal/PowerShell
4. Run: `npm install`

### Option B: Use Bun (if available)
```bash
bun install
```

### Option C: Use Yarn (if available)
```bash
yarn install
```

## 5. Start Development Server

After installing dependencies:

```bash
npm run dev
# or
bun dev
# or
yarn dev
```

## 6. Access Your Application

- **Dashboard**: http://localhost:5173/dashboard
- **Status Monitor**: http://localhost:5173/status
- **Integration Config**: http://localhost:5173/integrations

## 7. Test Integrations

1. Go to the Integration Config page
2. Test each service connection
3. Verify that all services are connected

## Troubleshooting

### If you can't install Node.js:
- Use an online code editor like CodeSandbox or StackBlitz
- Use a cloud development environment
- Ask for help with Node.js installation

### Database Issues:
- Make sure you're logged into Supabase
- Check that the SQL executed successfully
- Verify table creation in the Table Editor

### API Key Issues:
- Double-check your API keys
- Ensure they have the correct permissions
- Test connections individually

## Current Configuration Status

✅ **Supabase**: Configured and ready
✅ **Uptime Robot**: Configured and ready  
⏳ **N8N**: Needs API key from your instance

Once you complete these steps, your dashboard will show real data from all integrations! 