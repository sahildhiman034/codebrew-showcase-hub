#!/usr/bin/env node

/**
 * CodeBrew Showcase Hub - Integration Setup Script
 * This script helps you set up and test all integrations
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 CodeBrew Showcase Hub - Integration Setup');
console.log('============================================\n');

// Configuration details
const config = {
  supabase: {
    url: 'https://mscltrtuhipjdelehbre.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY2x0cnR1aGlwamRlbGVoYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Mjg2OTUsImV4cCI6MjA3MTUwNDY5NX0.Fmv1atNhxk9NBV9hwwRGgoHdE6ocE5y0vh4AxJhR_aI'
  },
  n8n: {
    baseUrl: 'https://sahilcodebrew.app.n8n.cloud',
    webhookUrl: 'https://sahilcodebrew.app.n8n.cloud/webhook/',
    apiKey: 'YOUR_N8N_API_KEY' // You'll need to get this from your N8N instance
  },
  uptimeRobot: {
    apiKey: 'u3082695-73d55d9d7467225204cca42d',
    baseUrl: 'https://api.uptimerobot.com/v2'
  }
};

// Create .env file
function createEnvFile() {
  const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=${config.supabase.url}
VITE_SUPABASE_ANON_KEY=${config.supabase.anonKey}

# N8N Configuration
VITE_N8N_BASE_URL=${config.n8n.baseUrl}
VITE_N8N_WEBHOOK_URL=${config.n8n.webhookUrl}
VITE_N8N_API_KEY=${config.n8n.apiKey}

# Uptime Robot Configuration
VITE_UPTIME_ROBOT_API_KEY=${config.uptimeRobot.apiKey}
VITE_UPTIME_ROBOT_BASE_URL=${config.uptimeRobot.baseUrl}

# Application Configuration
VITE_APP_NAME=CodeBrew Showcase Hub
VITE_APP_VERSION=1.0.0
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Created .env file with your configuration');
}

// Test Supabase connection
async function testSupabase() {
  console.log('\n🔍 Testing Supabase connection...');
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(config.supabase.url, config.supabase.anonKey);
    
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    
    if (error) {
      console.log('❌ Supabase connection failed:', error.message);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.log('❌ Supabase connection failed:', error.message);
    return false;
  }
}

// Test Uptime Robot connection
async function testUptimeRobot() {
  console.log('\n🔍 Testing Uptime Robot connection...');
  
  try {
    const response = await fetch(config.uptimeRobot.baseUrl + '/getAccountDetails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({
        api_key: config.uptimeRobot.apiKey
      })
    });

    const result = await response.json();
    
    if (result.stat === 'fail') {
      console.log('❌ Uptime Robot connection failed:', result.error?.type);
      return false;
    }
    
    console.log('✅ Uptime Robot connection successful');
    console.log(`   Account: ${result.account?.email}`);
    console.log(`   Monitors: ${result.account?.monitor_limit}`);
    return true;
  } catch (error) {
    console.log('❌ Uptime Robot connection failed:', error.message);
    return false;
  }
}

// Test N8N connection
async function testN8N() {
  console.log('\n🔍 Testing N8N connection...');
  
  try {
    const response = await fetch(config.n8n.baseUrl + '/api/v1/system/status');
    
    if (!response.ok) {
      console.log('❌ N8N connection failed: HTTP ' + response.status);
      return false;
    }
    
    const result = await response.json();
    console.log('✅ N8N connection successful');
    console.log(`   Version: ${result.version}`);
    return true;
  } catch (error) {
    console.log('❌ N8N connection failed:', error.message);
    return false;
  }
}

// Main setup function
async function setup() {
  console.log('📝 Creating environment file...');
  createEnvFile();
  
  console.log('\n🧪 Testing integrations...');
  
  const results = {
    supabase: await testSupabase(),
    uptimeRobot: await testUptimeRobot(),
    n8n: await testN8N()
  };
  
  console.log('\n📊 Integration Test Results:');
  console.log('==========================');
  console.log(`Supabase: ${results.supabase ? '✅ Connected' : '❌ Failed'}`);
  console.log(`Uptime Robot: ${results.uptimeRobot ? '✅ Connected' : '❌ Failed'}`);
  console.log(`N8N: ${results.n8n ? '✅ Connected' : '❌ Failed'}`);
  
  console.log('\n📋 Next Steps:');
  console.log('==============');
  
  if (!results.n8n) {
    console.log('1. 🔑 Get your N8N API key:');
    console.log('   - Go to your N8N instance: https://sahilcodebrew.app.n8n.cloud');
    console.log('   - Navigate to Settings > API Keys');
    console.log('   - Create a new API key and update it in .env file');
  }
  
  console.log('\n2. 🗄️  Set up your database:');
  console.log('   - Run the SQL from database-setup.sql in your Supabase SQL editor');
  console.log('   - This will create all necessary tables and sample data');
  
  console.log('\n3. 🚀 Start the development server:');
  console.log('   npm run dev');
  console.log('   # or');
  console.log('   yarn dev');
  console.log('   # or');
  console.log('   bun dev');
  
  console.log('\n4. 🌐 Access your application:');
  console.log('   - Dashboard: http://localhost:5173/dashboard');
  console.log('   - Status Monitor: http://localhost:5173/status');
  console.log('   - Integration Config: http://localhost:5173/integrations');
  
  console.log('\n🎉 Setup complete! Your integrations are ready to use.');
}

// Run setup
setup().catch(console.error); 