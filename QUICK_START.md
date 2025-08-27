# 🚀 Quick Start - AI Chatbot Deployment

Get your AI chatbot deployed in 5 minutes!

## ⚡ Super Quick Setup

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "AI Chatbot with API"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/codebrew-showcase-hub.git
git push -u origin main
```

### 2. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your repository
5. Add environment variables (see below)
6. Click "Deploy"

### 3. Environment Variables
Add these to Vercel:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_key
VITE_GEMINI_API_KEY=your_gemini_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🎯 Your API Endpoints

Once deployed, your API will be available at:
- `https://your-project.vercel.app/api/chatbot/message` (POST)
- `https://your-project.vercel.app/api/chatbot/history` (GET)
- `https://your-project.vercel.app/api/chatbot/faq` (GET)

## 🧪 Test Your API

```bash
# Send a message
curl -X POST https://your-project.vercel.app/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "visitor_id": "test123"}'

# Get FAQ
curl https://your-project.vercel.app/api/chatbot/faq
```

## 🎉 Done!

Your AI chatbot is now live with:
- ✅ Real-time messaging
- ✅ Admin dashboard
- ✅ REST API
- ✅ Analytics
- ✅ FAQ management

For detailed setup, see `DEPLOYMENT_GUIDE.md`
