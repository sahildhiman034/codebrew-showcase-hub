# AI Chatbot Setup Guide

## 🤖 **AI-Powered Chatbot Configuration**

Your Code Brew Labs application now includes an intelligent AI chatbot that can answer questions about your services, portfolio, and company information.

## 📋 **Features**

- ✅ **AI-Powered Responses** - Uses OpenAI GPT for intelligent conversations
- ✅ **Fallback Mode** - Works without API key using local responses
- ✅ **Conversation History** - Maintains context across messages
- ✅ **Professional Branding** - Matches your Code Brew Labs design
- ✅ **Mobile Responsive** - Works on all devices
- ✅ **Configuration Panel** - Easy setup and monitoring

## 🔑 **API Key Setup**

### **Step 1: Get OpenAI API Key**

1. **Visit [OpenAI Platform](https://platform.openai.com/)**
2. **Sign up or log in** to your account
3. **Go to API Keys section**
4. **Create a new API key**
5. **Copy the API key** (starts with `sk-`)

### **Step 2: Configure Environment Variables**

1. **Create or edit** your `.env` file in the project root
2. **Add the following variables:**

```env
# AI Chatbot Configuration
VITE_OPENAI_API_KEY=sk-your-actual-api-key-here
VITE_AI_MODEL=gpt-3.5-turbo
VITE_AI_MAX_TOKENS=500
VITE_AI_TEMPERATURE=0.7
```

### **Step 3: Restart Development Server**

```bash
npm run dev
```

## ⚙️ **Configuration Options**

### **AI Model Options:**
- `gpt-3.5-turbo` - Fast, cost-effective (recommended)
- `gpt-4` - More advanced, higher cost
- `gpt-4-turbo` - Latest model, best performance

### **Response Settings:**
- `VITE_AI_MAX_TOKENS` - Maximum response length (100-1000)
- `VITE_AI_TEMPERATURE` - Creativity level (0.0-1.0)
  - `0.0` - Very focused, consistent responses
  - `0.7` - Balanced creativity (recommended)
  - `1.0` - Very creative, varied responses

## 🎯 **How It Works**

### **With API Key (AI Powered):**
- ✅ **Intelligent responses** using OpenAI GPT
- ✅ **Context awareness** from conversation history
- ✅ **Professional tone** matching your brand
- ✅ **Dynamic responses** based on user questions

### **Without API Key (Local Mode):**
- ✅ **Pre-programmed responses** for common questions
- ✅ **Instant responses** (no API calls)
- ✅ **No costs** associated
- ✅ **Reliable fallback** when API is unavailable

## 💰 **Cost Considerations**

### **OpenAI Pricing (as of 2024):**
- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **GPT-4**: ~$0.03 per 1K tokens
- **Typical conversation**: 50-200 tokens per response

### **Cost Example:**
- 100 conversations per day
- Average 150 tokens per response
- Monthly cost: ~$9-15 with GPT-3.5-turbo

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
- ✅ **Rate limiting** handled by OpenAI
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
   - Check if `VITE_OPENAI_API_KEY` is set correctly
   - Ensure the API key starts with `sk-`
   - Restart the development server

2. **API Errors:**
   - Verify your OpenAI account has credits
   - Check API key permissions
   - Review console for specific error messages

3. **Slow Responses:**
   - Consider using `gpt-3.5-turbo` instead of `gpt-4`
   - Reduce `VITE_AI_MAX_TOKENS` value
   - Check your internet connection

### **Fallback Mode:**
If the API is unavailable, the chatbot automatically switches to local mode with pre-programmed responses for common questions.

## 📞 **Support**

For technical support or customization requests:
- **Email:** info@codebrewlabs.com
- **Documentation:** Check the console for detailed error messages
- **OpenAI Support:** Visit [OpenAI Help Center](https://help.openai.com/)

---

**Your AI chatbot is now ready to provide intelligent, professional responses to your visitors!** 🎉
