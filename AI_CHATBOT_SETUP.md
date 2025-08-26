# AI Chatbot Setup Guide

## 🤖 **AI-Powered Chatbot Configuration**

Your Code Brew Labs application now includes an intelligent AI chatbot that can answer questions about your services, portfolio, and company information using Google's Gemini AI.

## 📋 **Features**

- ✅ **AI-Powered Responses** - Uses Google Gemini for intelligent conversations
- ✅ **Fallback Mode** - Works without API key using local responses
- ✅ **Conversation History** - Maintains context across messages
- ✅ **Professional Branding** - Matches your Code Brew Labs design
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Configuration Panel** - Easy setup and monitoring

## 🔑 **API Key Setup**

### **Step 1: Get Gemini API Key**

1. **Visit [Google AI Studio](https://makersuite.google.com/app/apikey)**
2. **Sign in with your Google account**
3. **Click "Create API Key"**
4. **Copy the API key** (starts with `AIza`)

### **Step 2: Configure Environment Variables**

1. **Create or edit** your `.env` file in the project root
2. **Add the following variables:**

```env
# AI Chatbot Configuration (Gemini API)
VITE_GEMINI_API_KEY=AIza-your-actual-api-key-here
VITE_AI_MODEL=gemini-1.5-flash
VITE_AI_MAX_TOKENS=500
VITE_AI_TEMPERATURE=0.7
```

### **Step 3: Restart Development Server**

```bash
npm run dev
```

## ⚙️ **Configuration Options**

### **AI Model Options:**
- `gemini-1.5-flash` - Fast, cost-effective (recommended)
- `gemini-1.5-pro` - More advanced, higher cost
- `gemini-1.0-pro` - Legacy model, still effective

### **Response Settings:**
- `VITE_AI_MAX_TOKENS` - Maximum response length (100-1000)
- `VITE_AI_TEMPERATURE` - Creativity level (0.0-1.0)
  - `0.0` - Very focused, consistent responses
  - `0.7` - Balanced creativity (recommended)
  - `1.0` - Very creative, varied responses

## 🎯 **How It Works**

### **With API Key (AI Powered):**
- ✅ **Intelligent responses** using Google Gemini
- ✅ **Context awareness** from conversation history
- ✅ **Professional tone** matching your brand
- ✅ **Dynamic responses** based on user questions

### **Without API Key (Local Mode):**
- ✅ **Pre-programmed responses** for common questions
- ✅ **Instant responses** (no API calls)
- ✅ **No costs** associated
- ✅ **Reliable fallback** when API is unavailable

## 💰 **Cost Considerations**

### **Gemini API Pricing (as of 2024):**
- **Gemini 1.5 Flash**: ~$0.000075 per 1K input tokens, ~$0.0003 per 1K output tokens
- **Gemini 1.5 Pro**: ~$0.00375 per 1K input tokens, ~$0.015 per 1K output tokens
- **Typical conversation**: 50-200 tokens per response

### **Cost Example:**
- 100 conversations per day
- Average 150 tokens per response
- Monthly cost: ~$2-5 with Gemini 1.5 Flash (much cheaper than OpenAI)

## 🔧 **Customization**

### **System Prompt:**
The AI is configured with a system prompt that includes:
- Company information about Code Brew Labs
- Service offerings and portfolio details
- Professional tone and response guidelines
- Contact information and next steps

### **Response Categories:**
The AI can handle questions about:
- **Services** - Web development, mobile apps, etc.
- **Portfolio** - Project showcase and examples
- **Company** - About Code Brew Labs
- **Contact** - How to reach the team
- **Pricing** - Cost information
- **Technology** - Tech stack and frameworks
- **Process** - Development methodology

## 🚀 **Deployment**

### **Vercel Deployment:**
1. **Add environment variables** in Vercel dashboard
2. **Set the same variables** as in your `.env` file
3. **Deploy** - The chatbot will work in production

### **Security Notes:**
- ✅ **API key is client-side** (Vite environment variables)
- ✅ **No server-side storage** of API keys
- ✅ **Rate limiting** handled by Google AI
- ✅ **Error handling** for API failures

## 🎨 **UI Features**

### **Chat Interface:**
- **Green chat button** with pulsing animation
- **Professional chat window** with your branding
- **Message bubbles** with user/bot avatars
- **Typing indicators** when AI is processing
- **Auto-scroll** to latest messages

### **Configuration Panel:**
- **Settings button** in chat header
- **API status indicator** (green/yellow dot)
- **Model information** display
- **Configuration status** and instructions

### **Additional Features:**
- **Clear chat** button to reset conversation
- **Enter key** to send messages
- **Mobile responsive** design
- **Smooth animations** and transitions

## 🐛 **Troubleshooting**

### **Common Issues:**

1. **"Not Configured" Status:**
   - Check if `VITE_GEMINI_API_KEY` is set correctly
   - Ensure the API key starts with `AIza`
   - Restart the development server

2. **API Errors:**
   - Verify your Google AI Studio account has credits
   - Check API key permissions
   - Review console for specific error messages

3. **Slow Responses:**
   - Consider using `gemini-1.5-flash` instead of `gemini-1.5-pro`
   - Reduce `VITE_AI_MAX_TOKENS` value
   - Check your internet connection

### **Fallback Mode:**
If the API is unavailable, the chatbot automatically switches to local mode with pre-programmed responses for common questions.

## 📞 **Support**

For technical support or customization requests:
- **Email:** info@codebrewlabs.com
- **Documentation:** Check the console for detailed error messages
- **Google AI Support:** Visit [Google AI Studio Help](https://ai.google.dev/docs)

---

**Your AI chatbot is now ready to provide intelligent, professional responses to your visitors using Google's Gemini AI!** 🎉
