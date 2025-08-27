# Code Brew Labs - AI Chatbot Showcase Hub

A fully functional AI chatbot with real-time messaging, admin panel, and REST API for portfolio and client management.

## 🚀 Features

- **AI-Powered Chatbot** with real-time messaging
- **Admin Dashboard** with live analytics and session management
- **REST API** for chatbot integration
- **Real-time Updates** using Supabase subscriptions
- **FAQ Management** system
- **Analytics Dashboard** with charts and insights
- **Multi-user Authentication** with role-based access
- **Responsive Design** for all devices

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time)
- **AI Service**: OpenAI GPT-4 / Google Gemini
- **Styling**: Tailwind CSS + Shadcn/ui
- **Deployment**: Vercel/Netlify
- **Database**: PostgreSQL (Supabase)

## 📋 Prerequisites

- Node.js 18+ 
- Supabase account
- OpenAI API key or Google Gemini API key
- GitHub account

## 🚀 Quick Setup

### 1. Clone and Install

```bash
git clone https://github.com/yourusername/codebrew-showcase-hub.git
cd codebrew-showcase-hub
npm install
```

### 2. Environment Setup

Create `.env` file:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Service Configuration
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_GEMINI_API_KEY=your_gemini_api_key

# Optional: Web Search API
VITE_SERPER_API_KEY=your_serper_api_key
```

### 3. Database Setup

Run the SQL script in your Supabase SQL Editor:

```sql
-- Copy and paste the contents of quick-chatbot-setup.sql
```

### 4. Start Development

```bash
npm run dev
```

Visit `http://localhost:5173`

## 🔧 API Documentation

### Chatbot API Endpoints

#### 1. Send Message
```http
POST /api/chatbot/message
Content-Type: application/json

{
  "message": "Hello, how can you help me?",
  "visitor_id": "optional_visitor_id"
}
```

Response:
```json
{
  "success": true,
  "message": "Hello! I'm here to help you with any questions about our services...",
  "session_id": "uuid",
  "response_time": 1200
}
```

#### 2. Get Chat History
```http
GET /api/chatbot/history?visitor_id=VIS_20241226_abc123&limit=50
```

#### 3. Create Session
```http
POST /api/chatbot/session
Content-Type: application/json

{
  "visitor_id": "VIS_20241226_abc123"
}
```

#### 4. Get FAQ
```http
GET /api/chatbot/faq?category=general
```

### Admin API Endpoints

#### 1. Get All Sessions
```http
GET /api/admin/sessions?limit=100&status=active
Authorization: Bearer your_admin_token
```

#### 2. Get Session Messages
```http
GET /api/admin/sessions/{session_id}/messages
Authorization: Bearer your_admin_token
```

#### 3. Add FAQ Entry
```http
POST /api/admin/faq
Authorization: Bearer your_admin_token
Content-Type: application/json

{
  "question": "What services do you offer?",
  "answer": "We offer web development, mobile apps, and consulting services.",
  "category": "general",
  "priority": 1
}
```

## 🌐 Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Connect to Vercel**
- Go to [vercel.com](https://vercel.com)
- Import your GitHub repository
- Add environment variables
- Deploy

### Deploy to Netlify

1. **Build the project**
```bash
npm run build
```

2. **Deploy**
- Go to [netlify.com](https://netlify.com)
- Drag and drop the `dist` folder
- Or connect your GitHub repository

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | ✅ |
| `VITE_OPENAI_API_KEY` | OpenAI API key | ✅ |
| `VITE_GEMINI_API_KEY` | Google Gemini API key | ✅ |
| `VITE_SERPER_API_KEY` | Serper API key for web search | ❌ |

## 📊 Database Schema

### Tables
- `chatbot_sessions` - Chat sessions
- `chatbot_messages` - Individual messages
- `chatbot_faq` - FAQ entries
- `chatbot_settings` - Bot configuration
- `chatbot_analytics` - Analytics data

## 🎯 Usage Examples

### JavaScript/Node.js
```javascript
// Send a message
const response = await fetch('/api/chatbot/message', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What services do you offer?',
    visitor_id: 'VIS_20241226_abc123'
  })
});

const data = await response.json();
console.log(data.message);
```

### Python
```python
import requests

# Send a message
response = requests.post('/api/chatbot/message', json={
    'message': 'What services do you offer?',
    'visitor_id': 'VIS_20241226_abc123'
})

data = response.json()
print(data['message'])
```

### cURL
```bash
curl -X POST /api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello!", "visitor_id": "VIS_20241226_abc123"}'
```

## 🔒 Security

- All API endpoints are protected with CORS
- Admin endpoints require authentication
- Rate limiting implemented
- Input validation and sanitization
- SQL injection protection via Supabase

## 📈 Analytics

The system tracks:
- Total sessions and messages
- Response times
- User engagement
- FAQ usage
- Real-time statistics

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript check
```

### Project Structure

```
src/
├── components/      # React components
├── pages/          # Page components
├── lib/            # Services and utilities
├── contexts/       # React contexts
├── hooks/          # Custom hooks
└── assets/         # Static assets
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/yourusername/codebrew-showcase-hub/wiki)
- **Issues**: [GitHub Issues](https://github.com/yourusername/codebrew-showcase-hub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/codebrew-showcase-hub/discussions)

## 🎉 Demo Credentials

- **Email**: sahilcodebrew77@gmail.com
- **Password**: Qwerty#125656

---

Built with ❤️ by Code Brew Labs
# Test deployment
