# 🚀 **DEPLOY NOW - Quick Steps**

## ✅ **Step 1: Create GitHub Repository**

1. **Go to GitHub**: [github.com](https://github.com)
2. **Click "New repository"** (green button)
3. **Repository name**: `codebrew-showcase-hub`
4. **Make it PUBLIC** (important for free Vercel)
5. **DO NOT** initialize with README (we already have files)
6. **Click "Create repository"**

## 🔗 **Step 2: Connect to GitHub**

**Copy and paste this command in your terminal:**

```bash
git remote add origin https://github.com/YOUR_USERNAME/codebrew-showcase-hub.git
```

**Replace `YOUR_USERNAME` with your actual GitHub username**

**Then run:**
```bash
git push -u origin main
```

## 🌐 **Step 3: Deploy to Vercel**

1. **Go to Vercel**: [vercel.com](https://vercel.com)
2. **Sign up with GitHub** (if not already signed up)
3. **Click "New Project"**
4. **Import your repository**: `codebrew-showcase-hub`
5. **Click "Import"**

## ⚙️ **Step 4: Configure Vercel**

### Project Settings (should auto-detect):
- **Framework Preset**: Vite ✅
- **Root Directory**: `./` ✅
- **Build Command**: `npm run build` ✅
- **Output Directory**: `dist` ✅

### Environment Variables (IMPORTANT):
Click "Environment Variables" and add these **EXACTLY**:

```
VITE_SUPABASE_URL=https://mscltrtuhipjdelehbre.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY2x0cnR1aGlwamRlbGVoYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Mjg2OTUsImV4cCI6MjA3MTUwNDY5NX0.Fmv1atNhxk9NBV9hwwRGgoHdE6ocE5y0vh4AxJhR_aI
VITE_N8N_BASE_URL=https://sahilcodebrew.app.n8n.cloud
VITE_N8N_WEBHOOK_URL=https://sahilcodebrew.app.n8n.cloud/webhook/
VITE_N8N_API_KEY=your_n8n_api_key_here
VITE_UPTIME_ROBOT_API_KEY=u3082695-73d55d9d7467225204cca42d
VITE_UPTIME_ROBOT_READONLY_API_KEY=ur3082695-f018f801bde4714f3e186494
VITE_UPTIME_ROBOT_BASE_URL=https://api.uptimerobot.com/v2
VITE_APP_NAME=CodeBrew Showcase Hub
VITE_APP_VERSION=1.0.0
```

## 🚀 **Step 5: Deploy**

1. **Click "Deploy"**
2. **Wait 2-3 minutes** for build to complete
3. **Your app will be live!** 🎉

## 🔗 **Your App URL**
After deployment, your app will be available at:
`https://codebrew-showcase-hub.vercel.app`

## ✅ **What to Test**
- ✅ Live Client Status Monitor
- ✅ Real-time website checking
- ✅ Edit/Delete functionality
- ✅ Integration status
- ✅ All features working

## 🆘 **Need Help?**
If you get stuck at any step, just let me know which step you're on and I'll help you!

---

**🎯 Ready to start? Begin with Step 1 (Create GitHub Repository)!**
