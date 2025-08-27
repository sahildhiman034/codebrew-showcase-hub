# 🚀 Deployment Guide - AI Chatbot

Complete guide to deploy your AI chatbot to GitHub and make it fully functional with API.

## 📋 Prerequisites

1. **GitHub Account** - [Create one here](https://github.com)
2. **Supabase Account** - [Sign up here](https://supabase.com)
3. **Vercel Account** - [Sign up here](https://vercel.com)
4. **OpenAI API Key** - [Get one here](https://platform.openai.com)
5. **Google Gemini API Key** - [Get one here](https://makersuite.google.com/app/apikey)

## 🎯 Step-by-Step Deployment

### Step 1: Prepare Your Repository

1. **Create a new GitHub repository**
   ```bash
   # Go to GitHub and create a new repository
   # Name it: codebrew-showcase-hub
   ```

2. **Initialize your local repository**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: AI Chatbot with API"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/codebrew-showcase-hub.git
   git push -u origin main
   ```

### Step 2: Set Up Supabase

1. **Create a new Supabase project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose your organization
   - Enter project name: `codebrew-chatbot`
   - Set database password
   - Choose region closest to you

2. **Run the database setup**
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the contents of `quick-chatbot-setup.sql`
   - Click "Run" to execute the script

3. **Get your Supabase credentials**
   - Go to Settings > API
   - Copy your Project URL and anon/public key
   - Go to Settings > API > Project API keys
   - Copy your service_role key (keep this secret!)

### Step 3: Configure Environment Variables

1. **Create `.env` file locally**
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_OPENAI_API_KEY=your_openai_api_key
   VITE_GEMINI_API_KEY=your_gemini_api_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

2. **Add environment variables to GitHub Secrets**
   - Go to your GitHub repository
   - Settings > Secrets and variables > Actions
   - Add the following secrets:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_OPENAI_API_KEY`
     - `VITE_GEMINI_API_KEY`
     - `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Deploy to Vercel

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Vercel project**
   - Framework Preset: `Vite`
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add environment variables to Vercel**
   - Go to Project Settings > Environment Variables
   - Add all the environment variables from your `.env` file

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Step 5: Test Your API

1. **Test the chatbot API**
   ```bash
   curl -X POST https://your-project.vercel.app/api/chatbot/message \
     -H "Content-Type: application/json" \
     -d '{"message": "Hello!", "visitor_id": "test123"}'
   ```

2. **Test FAQ API**
   ```bash
   curl https://your-project.vercel.app/api/chatbot/faq
   ```

3. **Test chat history API**
   ```bash
   curl "https://your-project.vercel.app/api/chatbot/history?visitor_id=test123"
   ```

## 🔧 API Integration Examples

### JavaScript/Node.js
```javascript
// Send a message to the chatbot
async function sendMessage(message, visitorId) {
  const response = await fetch('https://your-project.vercel.app/api/chatbot/message', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, visitor_id: visitorId })
  });
  
  const data = await response.json();
  return data;
}

// Get chat history
async function getChatHistory(visitorId) {
  const response = await fetch(`https://your-project.vercel.app/api/chatbot/history?visitor_id=${visitorId}`);
  const data = await response.json();
  return data.messages;
}
```

### Python
```python
import requests

def send_message(message, visitor_id):
    response = requests.post('https://your-project.vercel.app/api/chatbot/message', json={
        'message': message,
        'visitor_id': visitor_id
    })
    return response.json()

def get_chat_history(visitor_id):
    response = requests.get(f'https://your-project.vercel.app/api/chatbot/history?visitor_id={visitor_id}')
    return response.json()['messages']
```

### React Component
```jsx
import { useState } from 'react';

function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const visitorId = 'user123';

  const sendMessage = async () => {
    if (!input.trim()) return;

    const response = await fetch('/api/chatbot/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, visitor_id: visitorId })
    });

    const data = await response.json();
    
    setMessages(prev => [...prev, 
      { type: 'user', content: input },
      { type: 'bot', content: data.message }
    ]);
    setInput('');
  };

  return (
    <div className="chatbot-widget">
      <div className="messages">
        {messages.map((msg, i) => (
          <div key={i} className={`message ${msg.type}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className="input-area">
        <input 
          value={input} 
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type your message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
```

## 🔒 Security Considerations

1. **API Rate Limiting**
   - Consider implementing rate limiting for your API endpoints
   - Use Vercel's built-in rate limiting or implement custom logic

2. **CORS Configuration**
   - Configure CORS headers for your API endpoints
   - Only allow trusted domains to access your API

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storing in database

4. **Environment Variables**
   - Never commit sensitive keys to your repository
   - Use GitHub Secrets and Vercel environment variables

## 📊 Monitoring and Analytics

1. **Vercel Analytics**
   - Enable Vercel Analytics for performance monitoring
   - Track API usage and response times

2. **Supabase Dashboard**
   - Monitor database performance
   - Check real-time subscriptions
   - View query performance

3. **Custom Analytics**
   - Use the built-in analytics in the admin panel
   - Track user engagement and chatbot usage

## 🚀 Production Checklist

- [ ] Environment variables configured
- [ ] Database schema created
- [ ] API endpoints tested
- [ ] CORS configured
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Monitoring set up
- [ ] SSL certificate active
- [ ] Domain configured (optional)
- [ ] Backup strategy in place

## 🆘 Troubleshooting

### Common Issues

1. **Build fails on Vercel**
   - Check environment variables are set correctly
   - Ensure all dependencies are in package.json
   - Check build logs for specific errors

2. **API returns 500 errors**
   - Verify Supabase credentials
   - Check database connection
   - Review server logs in Vercel dashboard

3. **Real-time updates not working**
   - Ensure Supabase real-time is enabled
   - Check RLS policies are configured correctly
   - Verify client-side subscriptions

### Getting Help

- **GitHub Issues**: Create an issue in your repository
- **Vercel Support**: Use Vercel's support chat
- **Supabase Support**: Check Supabase documentation and community

## 🎉 Congratulations!

Your AI chatbot is now deployed and fully functional! You can:

- ✅ Chat with the AI bot
- ✅ Access the admin panel
- ✅ Use the REST API
- ✅ View real-time analytics
- ✅ Manage FAQ entries

The system is production-ready and can handle real users. Remember to monitor usage and scale as needed!
