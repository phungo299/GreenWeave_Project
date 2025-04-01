# GreenWeave Backend API

Backend API cho dự án GreenWeave - Nền tảng thời trang bền vững.

## Cài đặt

```bash
# Cài đặt dependencies
npm install

# Chạy ở môi trường development
npm run dev

# Build cho production
npm run build

# Chạy ở môi trường production
npm start
```

## Cấu hình môi trường

Tạo file `.env` với các biến môi trường sau:

```env
PORT=5000
MONGO_URI=your_mongodb_uri
SECRET_KEY=your_jwt_secret_key

# Server URLs
API_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
ADMIN_URL=http://localhost:5174
```

## Cấu trúc Project

```
src/
├── controllers/     # Xử lý logic nghiệp vụ
├── middleware/      # Middleware (auth, validation, etc.)
├── models/         # MongoDB models
├── routes/         # API routes
├── services/       # Business services
├── utils/          # Utility functions
└── index.ts        # Entry point
```

## API Documentation

API documentation có sẵn tại: `http://localhost:5000/api-docs`

### Authentication

#### Register User
```http
POST /api/auth/register
```
Body:
```json
{
  "username": "user123",
  "email": "user@example.com",
  "password": "Test@123"
}
```
Validation:
- Username: 8-30 ký tự, chỉ chứa chữ, số và dấu gạch dưới
- Email: Phải đúng định dạng email
- Password: Phải có chữ hoa, chữ thường, số, ký tự đặc biệt, 6-30 ký tự

#### Login
```http
POST /api/auth/login
```
Body:
```json
{
  "email": "user@example.com",
  "password": "Test@123"
}
```

### Users API

#### Get All Users
```http
GET /api/users
```
Headers:
```
Authorization: Bearer {token}
```

### Customers API

#### Get All Customers
```http
GET /api/customers
```
Headers:
```
Authorization: Bearer {token}
```

#### Get Customer by Phone
```http
GET /api/customers/phone
```
Body:
```json
{
  "phoneNumber": "0123456789"
}
```

#### Update Customer Profile
```http
PUT /api/customers/:customerId
```
Body:
```json
{
  "fullName": "Nguyễn Văn A",
  "gender": "nam",
  "city": "Hà Nội",
  "district": "Cầu Giấy",
  "ward": "Dịch Vọng",
  "detailAddress": "Số 1 Đường ABC"
}
```

## Phân quyền và Bảo mật

### Role System

Hệ thống có 3 role chính:

#### 1. Admin
- Quyền cao nhất trong hệ thống
- Có thể truy cập tất cả các API endpoints
- Quản lý users, customers và các tài nguyên khác
- Có thể vô hiệu hóa tài khoản người dùng
- Xem thống kê và báo cáo

#### 2. User (Customer)
- Người dùng đã đăng ký và xác thực
- Có thể cập nhật thông tin cá nhân
- Truy cập các tính năng dành cho người dùng đã đăng ký
- Không thể truy cập các API quản trị

#### 3. Guest
- Người dùng chưa đăng ký hoặc chưa đăng nhập
- Chỉ có thể truy cập các API công khai
- Có thể đăng ký, đăng nhập
- Xem thông tin sản phẩm công khai

### Middleware Authentication & Authorization

1. **verifyToken**
   - Kiểm tra JWT token
   - Xác thực người dùng
   - Kiểm tra tài khoản có bị khóa không

2. **verifyAdmin**
   - Yêu cầu role "admin"
   - Sử dụng cho các API quản trị

3. **verifyUser**
   - Yêu cầu role "user" hoặc "admin"
   - Sử dụng cho các API yêu cầu đăng nhập

4. **verifyGuest**
   - Cho phép tất cả các role truy cập
   - Sử dụng cho các API công khai

### Security Implementation

1. **JWT Authentication**
   ```typescript
   Authorization: Bearer <token>
   ```

2. **Password Security**
   - Sử dụng bcrypt để hash password
   - Không lưu trữ plain text password
   - Yêu cầu password mạnh khi đăng ký

3. **API Security**
   - Rate limiting để chống DDoS
   - CORS protection
   - Input validation
   - Error handling chuẩn

## Error Handling

API trả về các mã lỗi HTTP tiêu chuẩn:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Response format khi có lỗi:
```json
{
  "message": "Thông báo lỗi",
  "errors": {
    "field": "Chi tiết lỗi cho trường cụ thể"
  }
}
```

## Dependencies chính

- Express: Web framework
- Mongoose: MongoDB ODM
- JWT: Authentication
- bcrypt: Password hashing
- cors: CORS middleware
- dotenv: Environment variables
- swagger-ui-express: API documentation

## Scripts

- `npm run dev`: Chạy development server với nodemon
- `npm run build`: Build TypeScript
- `npm start`: Chạy production server
- `npm test`: Chạy tests

## Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## License

MIT
