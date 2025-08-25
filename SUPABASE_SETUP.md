# 🔧 **Fix Supabase Authentication Redirect Issue**

## 🚨 **Problem**
Your authentication is trying to redirect to `localhost:59447` which causes the "ERR_CONNECTION_REFUSED" error. This happens because Supabase is configured for local development.

## ✅ **Solution: Update Supabase Configuration**

### **Step 1: Go to Supabase Dashboard**
1. Visit [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project: `mscltrtuhipjdelehbre`

### **Step 2: Update Authentication Settings**
1. Go to **Authentication** → **URL Configuration**
2. Update these URLs:

#### **Site URL:**
```
https://codebrew-showcase-hub.vercel.app
```

#### **Redirect URLs:**
Add these redirect URLs:
```
https://codebrew-showcase-hub.vercel.app/auth/callback
https://codebrew-showcase-hub.vercel.app/auth/confirm
https://codebrew-showcase-hub.vercel.app/auth/reset-password
https://codebrew-showcase-hub.vercel.app/auth/verify
```

#### **Remove Localhost URLs:**
Remove any URLs that contain:
- `localhost`
- `127.0.0.1`
- `localhost:59447`
- `localhost:5173`
- `localhost:3000`

### **Step 3: Save Changes**
1. Click **Save** to apply the changes
2. Wait a few minutes for changes to propagate

## 🔄 **Alternative: Disable OAuth Redirects**

Since your app uses custom authentication (not Supabase OAuth), you can also:

### **Option 1: Disable OAuth Providers**
1. Go to **Authentication** → **Providers**
2. Disable any OAuth providers you're not using (Google, GitHub, etc.)
3. This will prevent any OAuth redirect attempts

### **Option 2: Use Custom Auth Only**
Your app already uses custom authentication, so OAuth redirects shouldn't be needed.

## 🧪 **Test the Fix**

After updating the Supabase configuration:

1. **Deploy to Vercel** (if not already deployed)
2. **Test authentication** on the live site
3. **Check browser console** for any remaining redirect errors

## 📝 **Environment Variables**

Make sure these are set in Vercel:
```
VITE_SUPABASE_URL=https://mscltrtuhipjdelehbre.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1zY2x0cnR1aGlwamRlbGVoYnJlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU5Mjg2OTUsImV4cCI6MjA3MTUwNDY5NX0.Fmv1atNhxk9NBV9hwwRGgoHdE6ocE5y0vh4AxJhR_aI
```

## 🎯 **Expected Result**

After fixing the Supabase configuration:
- ✅ No more localhost redirect errors
- ✅ Authentication works on production
- ✅ No "ERR_CONNECTION_REFUSED" errors
- ✅ Smooth login/logout experience

---

**🚀 After updating Supabase, redeploy your Vercel app and test authentication again!**
