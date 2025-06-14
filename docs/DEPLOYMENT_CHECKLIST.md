# 🚀 GreenWeave Production Deployment Checklist

## 📋 **Pre-Deployment Requirements**

### **Environment Variables Setup**

#### **Frontend (.env file required)**
```env
# API Configuration (REQUIRED for production)
REACT_APP_API_URL=https://your-production-api.com/api

# Cloudinary (REQUIRED for image uploads)
REACT_APP_CLOUDINARY_URL=cloudinary://854987676692876:zzXF-ylEXajO58grOUhyEogDd4M@dgsq5oma3

# Stripe (REQUIRED for payments)
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key

# Environment
NODE_ENV=production
```

#### **Backend (.env file required)**
```env
# Database (REQUIRED)
MONGO_URI=mongodb://your-production-mongodb-uri

# JWT (REQUIRED)
JWT_SECRET=your-strong-jwt-secret

# API Configuration (REQUIRED)
PORT=5000
API_URL=https://your-production-api.com

# Cloudinary (REQUIRED)
CLOUDINARY_URL=cloudinary://854987676692876:zzXF-ylEXajO58grOUhyEogDd4M@dgsq5oma3

# Email (REQUIRED for auth)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Stripe (REQUIRED for payments)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

## ✅ **Production Readiness Checklist**

### **1. Environment Configuration**
- [ ] Frontend `.env` file configured with production API URL
- [ ] Backend `.env` file configured with production database
- [ ] No hardcoded localhost URLs remain
- [ ] All secrets properly configured
- [ ] CORS settings updated for production domain

### **2. Database Setup**
- [ ] MongoDB production instance created
- [ ] Database connection tested
- [ ] Required collections and indexes created
- [ ] Data migration completed (if applicable)

### **3. Security**
- [ ] JWT secrets are strong and unique
- [ ] HTTPS configured for production
- [ ] Environment variables secured (not in code)
- [ ] CORS origins properly restricted
- [ ] Rate limiting configured

### **4. Third-Party Services**
- [ ] Cloudinary account configured
- [ ] Stripe account in live mode
- [ ] Email service configured
- [ ] DNS settings updated

### **5. Build & Deploy**
- [ ] Frontend production build successful (`npm run build`)
- [ ] Backend production ready
- [ ] Static files served properly
- [ ] API endpoints responding correctly

### **6. Testing**
- [ ] User registration/login working
- [ ] Image uploads working (Cloudinary)
- [ ] Payment processing working (Stripe)
- [ ] Email notifications working
- [ ] All main user flows tested

## 🔧 **Build Commands**

### **Frontend**
```bash
cd frontend/
npm install
npm run build
```

### **Backend**
```bash
cd backend/
npm install
npm run build  # if using TypeScript
npm start
```

## 🚨 **Common Production Issues & Solutions**

### **CORS Errors**
- Update `CORS_ORIGIN` in backend to include production frontend URL
- Ensure credentials are properly configured

### **Environment Variables Not Found**
- Verify `.env` files exist and are properly formatted
- Check if hosting platform loads environment variables correctly

### **Image Upload Fails**
- Verify Cloudinary URL is correctly configured
- Check network connectivity and API limits

### **Payment Processing Fails**
- Ensure Stripe is in live mode
- Verify webhook endpoints are configured
- Check API keys and secrets

## 📊 **Monitoring & Maintenance**

### **Performance Monitoring**
- [ ] API response times monitored
- [ ] Database performance tracked
- [ ] Error logging configured
- [ ] User analytics implemented

### **Backup Strategy**
- [ ] Database backup schedule configured
- [ ] Static assets backup plan
- [ ] Environment variables backup secured

## 🎯 **Post-Deployment Verification**

1. **Frontend Health Check**
   - [ ] Website loads correctly
   - [ ] All pages accessible
   - [ ] Images display properly
   - [ ] Responsive design working

2. **Backend Health Check**
   - [ ] API endpoints responding
   - [ ] Database connections stable
   - [ ] Authentication working
   - [ ] File uploads functioning

3. **Integration Testing**
   - [ ] Complete user journey (registration → purchase)
   - [ ] Payment flow end-to-end
   - [ ] Email notifications
   - [ ] Admin panel functionality

## 📞 **Support & Troubleshooting**

### **Quick Debugging Commands**
```bash
# Check environment variables
node -e "console.log(process.env.REACT_APP_API_URL)"

# Test API connectivity
curl https://your-production-api.com/api/health

# Check build output
ls -la build/  # frontend
ls -la dist/   # backend (if using TypeScript)
```

### **Log Locations**
- Frontend: Browser console and network tab
- Backend: Server logs and error tracking service
- Database: MongoDB logs
- CDN: Cloudinary dashboard

---

**⚠️ CRITICAL:** Never commit `.env` files to version control. Use proper secrets management in production environment. 