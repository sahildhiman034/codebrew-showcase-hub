# 🚀 Vercel Deployment Guide for CodeBrew Showcase Hub

## 📋 Prerequisites
- GitHub account
- Vercel account (free)
- Your project code

## 🔧 Step 1: Prepare Your Project

### 1.1 Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit for Vercel deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### 1.2 Verify Build Works
```bash
npm run build
```
✅ Build should complete successfully and create a `dist` folder.

## 🌐 Step 2: Deploy to Vercel

### 2.1 Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 2.2 Import Your Project
1. Click "New Project"
2. Select "Import Git Repository"
3. Find and select your repository
4. Click "Import"

### 2.3 Configure Project Settings
- **Framework Preset**: Vite
- **Root Directory**: `./` (leave empty)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### 2.4 Add Environment Variables
Click "Environment Variables" and add these:

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

### 2.5 Deploy
1. Click "Deploy"
2. Wait for build to complete (2-3 minutes)
3. Your app will be live at: `https://your-project-name.vercel.app`

## 🔗 Step 3: Custom Domain (Optional)

### 3.1 Add Custom Domain
1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Add your domain (e.g., `yourdomain.com`)
4. Follow DNS configuration instructions

### 3.2 Configure DNS
Add these records to your domain provider:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

## ✅ Step 4: Verify Deployment

### 4.1 Test Your App
- Visit your deployed URL
- Test all features:
  - ✅ Live Client Status Monitor
  - ✅ Real-time website checking
  - ✅ Edit/Delete functionality
  - ✅ Integration status

### 4.2 Check Console for Errors
- Open browser developer tools
- Check for any console errors
- Verify environment variables are loaded

## 🔄 Step 5: Automatic Deployments

### 5.1 Future Updates
- Push changes to GitHub `main` branch
- Vercel automatically deploys
- Preview deployments for pull requests

### 5.2 Environment Variable Updates
- Go to Vercel dashboard
- Settings → Environment Variables
- Update values as needed
- Redeploy if necessary

## 🛠️ Troubleshooting

### Build Errors
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

### Environment Variables
- Ensure all `VITE_` prefixed variables are set
- Check for typos in variable names
- Redeploy after adding new variables

### CORS Issues
- Your app uses real website checking (no CORS issues)
- Supabase is configured for production

## 📊 Monitoring

### Vercel Analytics
- Built-in performance monitoring
- Real-time analytics
- Error tracking

### Custom Monitoring
- Your app has built-in status monitoring
- Real-time website checking
- Integration status display

## 🎉 Success!

Your CodeBrew Showcase Hub is now live on Vercel with:
- ✅ Real-time website monitoring
- ✅ Supabase integration
- ✅ Edit/Delete functionality
- ✅ Automatic deployments
- ✅ Custom domain support
- ✅ SSL/HTTPS enabled

## 📞 Support

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test locally first
4. Check browser console for errors

---

**Your app URL**: `https://your-project-name.vercel.app`
**Vercel Dashboard**: [vercel.com/dashboard](https://vercel.com/dashboard)
