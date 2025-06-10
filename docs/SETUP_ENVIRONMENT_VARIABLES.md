# Environment Variables Setup Guide

## 🔧 **Frontend Environment Variables**

### 1. Tạo file `.env` trong thư mục `frontend/`

```bash
cd frontend/
cp env.example .env
```

### 2. Cập nhật các giá trị sau trong `.env`:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Cloudinary Configuration (REQUIRED for image uploads)
REACT_APP_CLOUDINARY_URL=cloudinary://854987676692876:zzXF-ylEXajO58grOUhyEogDd4M@dgsq5oma3

# Environment
NODE_ENV=development
```

## ⚙️ **Backend Environment Variables**

Backend cần file `.env` trong thư mục `backend/` với:

```env
# Cloudinary Configuration (REQUIRED)
CLOUDINARY_URL=cloudinary://854987676692876:zzXF-ylEXajO58grOUhyEogDd4M@dgsq5oma3

# Database
MONGO_URI=your_mongodb_connection_string

# JWT
JWT_SECRET=your_jwt_secret

# API
PORT=5000
API_URL=http://localhost:5000
```

## 🚨 **Important Notes**

### Cloudinary URL Format
```
cloudinary://api_key:api_secret@cloud_name
```

**Từ CLOUDINARY_URL được cung cấp:**
- **Cloud Name**: `dgsq5oma3`
- **API Key**: `854987676692876`
- **API Secret**: `zzXF-ylEXajO58grOUhyEogDd4M`

### File Structure
```
GreenWeave_Project/
├── frontend/
│   ├── .env                 # ← Frontend env file
│   └── env.example
├── backend/
│   ├── .env                 # ← Backend env file
│   └── src/
└── docs/
```

## ✅ **Verification Steps**

### 1. Check Frontend Config
```bash
cd frontend/
npm start
# Console should NOT show: "REACT_APP_CLOUDINARY_URL not found"
```

### 2. Check Backend Config
```bash
cd backend/
npm run dev
# Console should NOT show: "Cloudinary configuration incomplete"
```

### 3. Test Upload
1. Start both frontend và backend
2. Vào Admin → Products → Add Product
3. Upload image - should work without 404 errors

## 🔧 **Troubleshooting**

### Error: "404 /api/api/upload/image"
- **Solution**: Đảm bảo frontend `.env` có đúng REACT_APP_API_URL

### Error: "Cloudinary 400/401"
- **Solution**: Kiểm tra CLOUDINARY_URL trong cả frontend và backend

### Error: "413 Payload Too Large"
- **Solution**: Backend đã được update với 50MB limit

### Error: "CORS Error"
- **Solution**: Restart cả frontend và backend

## 🎯 **Final Checklist**

- [ ] Frontend `.env` file exists với REACT_APP_CLOUDINARY_URL
- [ ] Backend `.env` file exists với CLOUDINARY_URL
- [ ] Both services restart sau khi thêm .env
- [ ] Upload test successful
- [ ] No console errors về missing environment variables 