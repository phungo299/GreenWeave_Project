# GreenWeave E-Commerce API

API backend cho ứng dụng GreenWeave E-Commerce được xây dựng với Node.js, Express, TypeScript và MongoDB.

## Tính năng

- **Quản lý người dùng**: Đăng ký, đăng nhập, quản lý thông tin cá nhân
- **Quản lý sản phẩm**: CRUD và tìm kiếm nâng cao sản phẩm
- **Giỏ hàng & Wishlist**: Quản lý giỏ hàng và danh sách yêu thích
- **Đơn hàng & Thanh toán**: Xử lý đơn hàng và thanh toán
- **Đánh giá sản phẩm**: Hệ thống đánh giá và bình luận
- **Khuyến mãi**: Quản lý mã giảm giá
- **Thông báo**: Hệ thống thông báo cho người dùng
- **Liên hệ**: Form liên hệ

## Yêu cầu

- Node.js (v14+)
- MongoDB (local hoặc Atlas)
- npm hoặc yarn

## Cài đặt

1. Clone repository:
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. Cài đặt các dependencies:
   ```bash
   npm install
   # hoặc
   yarn install
   ```

3. Tạo file `.env` dựa trên `.env.example` và cấu hình các biến môi trường:
   ```
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster>/<database>
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRES_IN=7d
   ...
   ```

4. Khởi chạy ứng dụng ở chế độ development:
   ```bash
   npm run dev
   # hoặc
   yarn dev
   ```

5. Build ứng dụng cho production:
   ```bash
   npm run build
   # hoặc
   yarn build
   ```

6. Khởi chạy ứng dụng ở chế độ production:
   ```bash
   npm start
   # hoặc
   yarn start
   ```

## Cấu trúc dự án

```
backend/
├── dist/                  # Thư mục build (tạo sau khi build)
├── src/                   # Mã nguồn của ứng dụng
│   ├── controllers/       # Xử lý logic của các route
│   ├── middleware/        # Middleware (xác thực, xử lý lỗi...)
│   ├── models/            # Schema và model MongoDB
│   ├── routes/            # Định nghĩa API routes
│   ├── services/          # Business logic
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Các tiện ích
│   ├── index.ts           # Entry point
│   └── swagger.yaml       # API documentation
├── .env                   # Biến môi trường (cần tạo)
├── .env.example           # Mẫu biến môi trường
├── .gitignore             # Git ignore file
├── package.json           # Cấu hình npm
├── tsconfig.json          # Cấu hình TypeScript
└── README.md              # Tài liệu
```

## API Endpoints

### Xác thực
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/refresh-token` - Làm mới token

### Người dùng
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `DELETE /api/users/:id` - Xóa người dùng

### Danh mục
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/:id` - Lấy chi tiết danh mục
- `POST /api/categories` - Tạo danh mục mới
- `PUT /api/categories/:id` - Cập nhật danh mục
- `DELETE /api/categories/:id` - Xóa danh mục

### Sản phẩm
- `GET /api/products` - Lấy tất cả sản phẩm
- `GET /api/products/search` - Tìm kiếm sản phẩm
- `GET /api/products/featured` - Lấy sản phẩm nổi bật
- `GET /api/products/:id` - Lấy chi tiết sản phẩm
- `POST /api/products` - Tạo sản phẩm mới
- `PUT /api/products/:id` - Cập nhật sản phẩm
- `DELETE /api/products/:id` - Xóa sản phẩm

### Giỏ hàng
- `GET /api/carts/:userId` - Lấy giỏ hàng
- `POST /api/carts/:userId/items` - Thêm sản phẩm vào giỏ hàng
- `PUT /api/carts/:userId/items/:itemId` - Cập nhật sản phẩm trong giỏ hàng
- `DELETE /api/carts/:userId/items/:itemId` - Xóa sản phẩm khỏi giỏ hàng
- `DELETE /api/carts/:userId` - Xóa giỏ hàng

### Wishlist
- `GET /api/wishlists/:userId` - Lấy danh sách yêu thích
- `GET /api/wishlists/:userId/check/:productId` - Kiểm tra sản phẩm trong danh sách
- `POST /api/wishlists/:userId` - Thêm sản phẩm vào danh sách yêu thích
- `DELETE /api/wishlists/:userId/:itemId` - Xóa sản phẩm khỏi danh sách yêu thích
- `DELETE /api/wishlists/:userId` - Xóa danh sách yêu thích

### Đơn hàng
- `GET /api/orders` - Lấy tất cả đơn hàng (admin)
- `GET /api/orders/user/:userId` - Lấy đơn hàng của người dùng
- `GET /api/orders/:id` - Lấy chi tiết đơn hàng
- `POST /api/orders/user/:userId` - Tạo đơn hàng mới
- `PUT /api/orders/:id/status` - Cập nhật trạng thái đơn hàng

### Thanh toán
- `GET /api/payments` - Lấy tất cả thanh toán (admin)
- `GET /api/payments/:id` - Lấy chi tiết thanh toán
- `POST /api/payments` - Tạo thanh toán mới
- `PUT /api/payments/:id/status` - Cập nhật trạng thái thanh toán

### Đánh giá
- `GET /api/reviews/product/:productId` - Lấy đánh giá của sản phẩm
- `GET /api/reviews/user/:userId` - Lấy đánh giá của người dùng
- `POST /api/reviews` - Tạo đánh giá mới
- `PUT /api/reviews/:id` - Cập nhật đánh giá
- `DELETE /api/reviews/:id` - Xóa đánh giá

### Khuyến mãi
- `GET /api/promotions` - Lấy tất cả khuyến mãi
- `GET /api/promotions/active` - Lấy khuyến mãi đang hoạt động
- `GET /api/promotions/code/:code` - Lấy chi tiết khuyến mãi theo mã
- `POST /api/promotions/validate` - Kiểm tra mã khuyến mãi
- `POST /api/promotions` - Tạo khuyến mãi mới
- `PUT /api/promotions/:id` - Cập nhật khuyến mãi
- `DELETE /api/promotions/:id` - Xóa khuyến mãi

### Thông báo
- `GET /api/notifications/user/:userId` - Lấy thông báo của người dùng
- `PUT /api/notifications/:id/read` - Đánh dấu thông báo đã đọc
- `PUT /api/notifications/user/:userId/read-all` - Đánh dấu tất cả thông báo đã đọc
- `POST /api/notifications` - Tạo thông báo mới
- `DELETE /api/notifications/:id` - Xóa thông báo

### Liên hệ
- `GET /api/messages` - Lấy tất cả tin nhắn (admin)
- `GET /api/messages/:id` - Lấy chi tiết tin nhắn
- `POST /api/messages` - Tạo tin nhắn mới
- `DELETE /api/messages/:id` - Xóa tin nhắn

## Tài liệu API

Tài liệu API được tạo tự động bằng Swagger và có thể truy cập tại:
```
http://localhost:5000/api-docs
```

## Tác giả

GreenWeave Team

## Giấy phép

MIT
