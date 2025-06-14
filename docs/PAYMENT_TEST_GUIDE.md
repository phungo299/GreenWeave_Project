# 🧪 Hướng Dẫn Test Thanh Toán PayOS - 1000đ

## Tổng Quan
Trang test thanh toán được tạo để kiểm thử tích hợp PayOS với số tiền nhỏ (1000đ) trong môi trường an toàn.

## ✅ Fixes Applied
- **Fixed ObjectId validation error**: Tạo endpoint `/api/orders/create-test` riêng cho test
- **No product validation**: Test orders không cần validate với products thật trong database
- **Fake ObjectIds**: Tự động generate fake ObjectIds cho test products
- **Complete flow**: Test cả PayOS và COD flows

## Truy Cập Trang Test
- **URL**: `/payment-test`
- **Yêu cầu**: Phải đăng nhập
- **Mục đích**: Test cả PayOS và COD flow

## API Endpoints

### Test Order Creation
```
POST /api/orders/create-test
Content-Type: application/json

{
  "userId": "user-id-or-fake",
  "items": [
    {
      "productId": "test-product-1",
      "quantity": 1,
      "price": 1000,
      "name": "Sản phẩm test PayOS"
    }
  ],
  "totalAmount": 1000,
  "shippingCost": 0,
  "paymentMethod": "PAYOS"
}
```

### PayOS Payment Link
```
POST /api/payos/create-payment-link
Content-Type: application/json

{
  "orderId": "generated-order-id",
  "amount": 1000,
  "description": "Test PayOS - Order #...",
  "returnUrl": "http://localhost:3000/payment/success",
  "cancelUrl": "http://localhost:3000/payment/cancel"
}
```

## Quick Backend Test

Chạy test script để verify backend:

```bash
cd backend
node test-payos.js
```

Expected output:
```
🚀 Starting PayOS Integration Tests...

🧪 Testing createTestOrder endpoint...
✅ Test Order Created Successfully:
Order ID: 67xxx...
Order Code: xxx...
Total Amount: 1000
Status: pending

💳 Testing createPaymentLink endpoint...
✅ Payment Link Created Successfully:
Checkout URL: https://pay.payos.vn/web/...
Order Code: xxx...

🎉 All tests passed! PayOS integration is working.
```

## Tính Năng Test

### 1. PayOS Test (1000đ)
- ✅ Tạo đơn hàng test trong database (không validate products)
- ✅ Generate fake ObjectIds cho test products
- ✅ Tạo payment link PayOS
- ✅ Chuyển hướng đến PayOS checkout
- ✅ Xử lý webhook khi thanh toán thành công
- ✅ Cập nhật status đơn hàng

### 2. COD Test
- ✅ Tạo đơn hàng COD trong database
- ✅ Chuyển hướng đến success page
- ✅ Hiển thị thông tin đơn hàng

## Quy Trình Test

### Bước 1: Chuẩn Bị
1. Đảm bảo backend đang chạy
2. Đảm bảo PayOS credentials đã được cấu hình
3. Đăng nhập vào hệ thống

### Bước 2: Test Backend (Optional)
```bash
cd backend
node test-payos.js
```

### Bước 3: Truy Cập Test Page
```
http://localhost:3000/payment-test
```

### Bước 4: Test PayOS Flow
1. Chọn "PayOS Test"
2. Nhấn "Test PayOS 1000đ"
3. Hệ thống sẽ:
   - Tạo order trong database với status "pending" (sử dụng `/api/orders/create-test`)
   - Generate fake ObjectIds cho test products
   - Tạo payment link PayOS
   - Chuyển hướng đến PayOS checkout
4. Tại PayOS:
   - Quét QR code hoặc nhập thông tin test
   - Hoàn tất thanh toán
5. Webhook sẽ:
   - Cập nhật order status thành "confirmed"
   - Cập nhật payment status thành "completed"
6. Chuyển hướng về success page

### Bước 5: Test COD Flow
1. Chọn "COD Test"
2. Nhấn "Test COD"
3. Hệ thống sẽ:
   - Tạo order trong database với status "pending" (sử dụng `/api/orders/create-test`)
   - Chuyển hướng đến success page
4. Kiểm tra thông tin đơn hàng

## Kiểm Tra Database

### Orders Collection
```javascript
// Tìm test orders (có shippingAddress chứa "Test Address")
db.orders.find({ 
  shippingAddress: /Test Address/i 
}).sort({ createdAt: -1 })

// Hoặc tìm theo paymentMethod
db.orders.find({ 
  paymentMethod: "PAYOS",
  totalAmount: 1000 
}).sort({ createdAt: -1 })
```

### Payments Collection
```javascript
// Tìm payments test
db.payments.find({ 
  paymentMethod: "PAYOS",
  amount: 1000 
}).sort({ createdAt: -1 })
```

## Test Cases

### ✅ Test Case 1: PayOS Success Flow
- **Input**: User đăng nhập, chọn PayOS, thanh toán thành công
- **Expected**: Test order created → Payment link → PayOS checkout → Webhook → Order confirmed
- **Verify**: Database có order với status "confirmed" và payment "completed"

### ✅ Test Case 2: PayOS Cancel Flow
- **Input**: User đăng nhập, chọn PayOS, hủy thanh toán
- **Expected**: Test order created → Payment link → PayOS checkout → Cancel → Cancel page
- **Verify**: Database có order với status "pending", không có payment completed

### ✅ Test Case 3: COD Success Flow
- **Input**: User đăng nhập, chọn COD
- **Expected**: Test order created → Success page
- **Verify**: Database có order với status "pending", paymentMethod "COD"

### ❌ Test Case 4: Unauthenticated Access
- **Input**: User chưa đăng nhập truy cập `/payment-test`
- **Expected**: Hiển thị login prompt
- **Verify**: Không tạo order, redirect về login

### ✅ Test Case 5: Backend API Test
- **Input**: Chạy `node test-payos.js`
- **Expected**: Tạo test order và payment link thành công
- **Verify**: Console output hiển thị success messages

## Troubleshooting

### Lỗi "Cast to ObjectId failed"
- ✅ **Fixed**: Sử dụng endpoint `/api/orders/create-test` thay vì `/api/orders/create`
- ✅ **Fixed**: Generate fake ObjectIds cho test products

### Lỗi "Không thể tạo đơn hàng test"
- Kiểm tra backend có chạy không
- Kiểm tra API endpoint `/api/orders/create-test`
- Kiểm tra user authentication

### Lỗi "Không thể tạo link thanh toán test"
- Kiểm tra PayOS credentials
- Kiểm tra API endpoint `/api/payos/create-payment-link`
- Kiểm tra network connectivity

### Webhook không hoạt động
- Kiểm tra PayOS webhook URL configuration
- Kiểm tra endpoint `/api/payos/webhook`
- Kiểm tra signature verification

## Monitoring & Logs

### Frontend Console
```javascript
// Bật debug mode
localStorage.setItem('debug', 'payos:*')
```

### Backend Logs
```bash
# Theo dõi logs
tail -f logs/payos.log
```

### Database Monitoring
```javascript
// Watch test orders
db.orders.watch([
  { $match: { "fullDocument.shippingAddress": /Test Address/i } }
])
```

## Security Notes

⚠️ **Quan trọng**: Đây là môi trường test
- Số tiền 1000đ sẽ được hoàn trả (nếu sử dụng PayOS test mode)
- Không sử dụng thông tin thật trong test
- Chỉ test với tài khoản development
- Test orders có shippingAddress = "Test Address - PayOS Integration Test"

## Kết Quả Mong Đợi

### Thành Công
- ✅ Test order được tạo trong database (không validate products)
- ✅ Payment link hoạt động
- ✅ Webhook xử lý chính xác
- ✅ Status updates đúng
- ✅ Success page hiển thị thông tin chính xác
- ✅ Backend test script chạy thành công

### Metrics
- **Response Time**: < 2s cho test order creation
- **Payment Link**: < 3s cho PayOS link generation
- **Webhook**: < 1s cho status update
- **Success Rate**: 100% cho test cases

## Next Steps

Sau khi test thành công:
1. Test với số tiền lớn hơn
2. Test với multiple items
3. Test error scenarios
4. Load testing
5. Production deployment

---

**Tạo bởi**: AI Assistant  
**Ngày**: 2024-01-XX  
**Version**: 2.0 - Fixed ObjectId validation issues 