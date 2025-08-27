# Chatbot Management System Setup Guide

## 🚀 **Complete Chatbot Management System**

Your Code Brew Labs application now includes a comprehensive chatbot management system with unique visitor tracking, chat history management, FAQ management, and admin controls.

## 📋 **Features Implemented**

### ✅ **Visitor Tracking & Unique IDs**
- **Unique Visitor IDs**: Each visitor gets a unique identifier (e.g., `VIS_20241201_abc12345`)
- **Session Management**: Automatic session creation and management
- **Chat History**: Complete conversation history stored in Supabase
- **Visitor Analytics**: Track visitor behavior and engagement

### ✅ **Admin Panel Management**
- **Chat Sessions**: View all chat sessions with filtering and search
- **Message History**: View complete conversation history for each session
- **Session Management**: End, delete, or archive chat sessions
- **FAQ Management**: Add, edit, delete, and organize FAQ entries
- **Settings Management**: Configure chatbot behavior and responses
- **Analytics Dashboard**: View chatbot usage statistics

### ✅ **Enhanced Chatbot Features**
- **Database Integration**: All messages stored in Supabase
- **FAQ Integration**: Automatic FAQ matching and responses
- **Settings Control**: Dynamic configuration through admin panel
- **Visitor ID Display**: Shows unique ID in chatbot interface
- **Session Persistence**: Maintains conversation context across sessions

## 🗄️ **Database Setup**

### **Step 1: Run Database Migration**

1. **Open your Supabase dashboard**
2. **Go to SQL Editor**
3. **Run the chatbot database setup script:**

```sql
-- Copy and paste the contents of chatbot-database-setup.sql
-- This will create all necessary tables and functions
```

### **Step 2: Verify Tables Created**

The following tables will be created:
- `chatbot_sessions` - Stores chat sessions with visitor IDs
- `chatbot_messages` - Stores all chat messages
- `chatbot_faq` - Stores FAQ entries for the chatbot
- `chatbot_settings` - Stores chatbot configuration
- `chatbot_analytics` - Stores analytics data

## 🔧 **Configuration**

### **Environment Variables**

Add these to your `.env` file if not already present:

```env
# AI Chatbot Configuration
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_AI_MODEL=gemini-1.5-flash
VITE_AI_MAX_TOKENS=500
VITE_AI_TEMPERATURE=0.7

# Supabase Configuration (should already be configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 🎯 **How to Use**

### **For Visitors (End Users)**

1. **Chat Interface**: The chatbot appears as a floating button on your website
2. **Unique ID**: Each visitor automatically gets a unique identifier
3. **Conversation History**: Chat history is maintained across sessions
4. **AI Responses**: Powered by Google Gemini AI with fallback responses

### **For Admins**

1. **Access Admin Panel**: Navigate to `/admin/chatbot` in your application
2. **Manage Chat Sessions**:
   - View all active and ended chat sessions
   - Search by visitor ID
   - Filter by session status
   - View complete conversation history
   - End or delete sessions

3. **Manage FAQ**:
   - Add new FAQ entries with categories and keywords
   - Edit existing FAQ entries
   - Set priority levels
   - Track usage statistics
   - Enable/disable FAQ entries

4. **Configure Settings**:
   - Welcome message customization
   - Session timeout settings
   - AI model configuration
   - Web search settings
   - Chatbot status (active/inactive)

5. **View Analytics**:
   - Total sessions count
   - Active sessions
   - FAQ usage statistics
   - Response time metrics

## 📊 **Admin Panel Features**

### **Chat Sessions Tab**
- **Session List**: View all chat sessions with visitor IDs
- **Search & Filter**: Find specific sessions by ID or status
- **Session Actions**: View messages, end sessions, delete sessions
- **Session Details**: Start time, message count, status

### **FAQ Management Tab**
- **FAQ List**: View all FAQ entries with categories
- **Add FAQ**: Create new FAQ entries with rich text
- **Edit FAQ**: Modify existing entries
- **Delete FAQ**: Remove unwanted entries
- **Usage Tracking**: See how often each FAQ is used

### **Settings Tab**
- **Welcome Message**: Customize the initial greeting
- **Session Timeout**: Set automatic session expiration
- **AI Configuration**: Model, tokens, temperature settings
- **Web Search**: Enable/disable web search functionality
- **Chatbot Status**: Activate/deactivate the chatbot

### **Analytics Tab**
- **Session Statistics**: Total and active session counts
- **FAQ Statistics**: Number of FAQ entries and usage
- **Performance Metrics**: Response times and engagement

## 🔒 **Security & Privacy**

### **Data Protection**
- **Row Level Security (RLS)**: Database-level access control
- **Visitor Anonymity**: No personal information required
- **Session Isolation**: Each visitor's data is isolated
- **Admin Access**: Only authenticated admins can access management features

### **Privacy Features**
- **Visitor ID Generation**: Anonymous unique identifiers
- **Data Retention**: Configurable data retention policies
- **GDPR Compliance**: Easy data deletion and export

## 🚀 **Getting Started**

### **1. Database Setup**
```bash
# Run the database setup script in Supabase SQL Editor
# Copy contents from chatbot-database-setup.sql
```

### **2. Restart Application**
```bash
npm run dev
```

### **3. Access Admin Panel**
- Navigate to `/admin/chatbot`
- Start managing your chatbot

### **4. Test Chatbot**
- Open your website
- Click the chatbot button
- Start a conversation
- Check the admin panel to see the session

## 📈 **Analytics & Insights**

### **What You Can Track**
- **Visitor Engagement**: How many visitors use the chatbot
- **Session Duration**: How long conversations last
- **Popular Questions**: Most frequently asked questions
- **Response Quality**: AI response accuracy and satisfaction
- **FAQ Effectiveness**: Which FAQ entries are most useful

### **Business Intelligence**
- **Customer Support**: Reduce support tickets with automated responses
- **Lead Generation**: Capture visitor information and interests
- **Service Optimization**: Identify common questions and improve services
- **User Experience**: Improve website engagement and satisfaction

## 🔧 **Customization Options**

### **Chatbot Appearance**
- **Position**: Bottom-right or bottom-left
- **Theme**: Light or dark mode
- **Branding**: Custom colors and logos
- **Welcome Message**: Personalized greeting

### **AI Behavior**
- **Response Style**: Formal, casual, or technical
- **Response Length**: Short, medium, or detailed
- **Web Search**: Enable real-time information lookup
- **Context Memory**: Conversation history retention

### **FAQ Management**
- **Categories**: Organize FAQ by topics
- **Keywords**: Improve question matching
- **Priority**: Control which answers appear first
- **Multilingual**: Support for multiple languages

## 🆘 **Troubleshooting**

### **Common Issues**

1. **Chatbot Not Appearing**
   - Check chatbot status in admin panel
   - Verify Supabase connection
   - Check browser console for errors

2. **Messages Not Storing**
   - Verify database tables are created
   - Check Supabase RLS policies
   - Ensure proper authentication

3. **AI Not Responding**
   - Verify Gemini API key is configured
   - Check API quota and limits
   - Review error logs in browser console

4. **Admin Panel Access Issues**
   - Ensure user has admin role
   - Check authentication status
   - Verify route permissions

### **Support**
- Check the browser console for error messages
- Verify all environment variables are set
- Ensure Supabase connection is working
- Review the database setup script

## 🎉 **Success Metrics**

### **Key Performance Indicators**
- **Chatbot Usage**: Number of active sessions
- **Response Time**: Average AI response time
- **FAQ Effectiveness**: Usage of FAQ entries
- **Visitor Satisfaction**: Session completion rates
- **Support Reduction**: Decrease in manual support requests

### **Business Impact**
- **24/7 Support**: Automated customer service
- **Lead Qualification**: Automated visitor engagement
- **Service Improvement**: Data-driven service optimization
- **Cost Reduction**: Reduced manual support costs

---

**🎯 Ready to transform your customer support with AI-powered chatbot management!**

This comprehensive system provides everything you need to manage, monitor, and optimize your chatbot for maximum business impact.
