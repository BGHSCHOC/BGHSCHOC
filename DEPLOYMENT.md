# Deployment Guide - Render

This guide walks you through deploying the CHOC Meeting Sign-In Portal to Render.

## 📋 Pre-Deployment Checklist

### 1. Code Preparation
- [ ] All debug code removed from production files
- [ ] Access codes updated (change from defaults)
- [ ] Test all features locally
- [ ] Commit all changes to Git

### 2. GitHub Setup
- [ ] Create a GitHub repository
- [ ] Push all code to the repository
- [ ] Ensure `main` branch is up to date

## 🚀 Render Deployment Steps

### Step 1: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your GitHub repository
3. Select the CHOC meeting sign-in repository

### Step 3: Configure Service
**Basic Settings:**
- **Name**: `choc-meeting-signin` (or your preferred name)
- **Environment**: `Node`
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy:**
- **Build Command**: `npm install`
- **Start Command**: `npm start`

**Advanced Settings:**
- **Auto-Deploy**: `Yes` (deploys on every push to main)
- **Health Check Path**: `/`

### Step 4: Environment Variables
Set these in the Render dashboard:
- `NODE_ENV`: `production`
- `PORT`: (Leave empty - Render sets this automatically)

### Step 5: Deploy
1. Click "Create Web Service"
2. Render will automatically build and deploy
3. Wait for deployment to complete (usually 2-5 minutes)

## 🔧 Post-Deployment Setup

### 1. Test the Application
1. Open the provided Render URL
2. Test basic functionality:
   - [ ] Main page loads
   - [ ] WebSocket connection works
   - [ ] Staff access works
   - [ ] Sign-in forms work

### 2. Update Access Codes
1. Access the admin panel with default codes
2. Change both officer and admin passwords
3. Test new passwords work

### 3. Configure Settings
1. Set up geofencing if needed
2. Configure sign-in time windows
3. Test location services on mobile

## 📱 Mobile Testing

Test on actual mobile devices:
- [ ] Location services work
- [ ] Forms are mobile-friendly
- [ ] WebSocket stays connected
- [ ] All buttons work properly

## 🔄 Updating the Application

### Automatic Updates
- Push changes to the `main` branch
- Render automatically rebuilds and deploys
- Zero-downtime deployment

### Manual Deployment
If needed, you can manually trigger deployment:
1. Go to Render dashboard
2. Select your service
3. Click "Manual Deploy" → "Deploy latest commit"

## 🐛 Troubleshooting

### Common Issues

**Build Fails:**
- Check Node.js version compatibility
- Verify all dependencies are in package.json
- Check build logs in Render dashboard

**App Won't Start:**
- Verify start command is correct (`npm start`)
- Check server logs for errors
- Ensure PORT environment variable handling

**WebSocket Issues:**
- Verify WebSocket support is enabled
- Check for CORS issues
- Test with different browsers

**Location Services:**
- Ensure HTTPS is enabled (Render provides this automatically)
- Test on different devices and browsers
- Check browser location permissions

### Getting Help
1. Check Render documentation
2. Review server logs in Render dashboard
3. Test locally to isolate issues
4. Check browser console for client-side errors

## 📊 Monitoring

### Render Dashboard
- Monitor deployment status
- View application logs
- Check resource usage
- Monitor uptime

### Application Health
- Test WebSocket connectivity regularly
- Monitor sign-in success rates
- Check mobile compatibility
- Verify geofencing accuracy

## 🔒 Security Considerations

### Production Security
- [ ] Change default access codes immediately
- [ ] Use HTTPS (automatically provided by Render)
- [ ] Monitor for suspicious activity
- [ ] Regular security updates

### Data Protection
- [ ] Understand data is stored in memory (resets on restart)
- [ ] Regular data exports for backup
- [ ] Monitor access logs
- [ ] Implement proper user training

---

**Need Help?** Check the main README.md for additional configuration options and troubleshooting tips.