# Hướng dẫn Test Backend

## Cấu trúc thư mục test

```
backend/tests/
├── unit/                     # Unit tests (mocking dependencies)
│   ├── authController.test.ts   # Test Auth Controller
│   └── productController.test.ts # Test Product Controller
├── integration/              # Integration tests
│   └── basic.test.ts         # Test basic API endpoints
├── auth.test.ts              # Test auth API
├── product.test.ts           # Test product API
├── order.test.ts             # Test order API (đang bị lỗi)
└── README.md                 # Tài liệu hướng dẫn (file này)
```

## Công nghệ sử dụng

- **Jest**: Framework test
- **Supertest**: Thư viện để test HTTP API
- **mongodb-memory-server**: Database MongoDB trong bộ nhớ cho unit test

## Các loại test

### 1. Unit Tests

Unit tests tập trung vào việc kiểm tra từng đơn vị code riêng lẻ (thường là các hàm, phương thức) bằng cách mock (giả lập) tất cả các dependencies bên ngoài.

- **Ví dụ**: Test các controllers bằng cách mock các models, utils, services,...
- **Ưu điểm**: Chạy nhanh, cô lập lỗi chính xác
- **Nhược điểm**: Không kiểm tra tích hợp giữa các thành phần

### 2. Integration Tests

Integration tests kiểm tra sự tích hợp giữa các thành phần khác nhau trong hệ thống.

- **Ví dụ**: Test API endpoints với DB trong bộ nhớ (mongodb-memory-server)
- **Ưu điểm**: Phát hiện lỗi khi các thành phần tương tác với nhau
- **Nhược điểm**: Chậm hơn unit tests, khó debug hơn

## Cách chạy test

### Chạy tất cả test

```bash
npm test
```

### Chạy unit tests

```bash
npm run test:unit
```

### Chạy integration tests (basic API)

```bash
npm run test:integration
```

### Chạy auth tests

```bash
npm run test:auth
```

### Chạy test với báo cáo độ phủ (coverage)

```bash
npm run test:coverage
```

## Các vấn đề thường gặp và cách giải quyết

### 1. Lỗi OverwriteModelError

**Nguyên nhân**: Cố gắng định nghĩa lại Mongoose model trong các test khác nhau.

**Giải pháp**:
- Sử dụng mongoose-memory-server và connect/disconnect trước và sau mỗi test
- Tránh định nghĩa model trực tiếp trong tests, thay vào đó mock chúng:

```typescript
jest.mock('../../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));
```

### 2. Lỗi JWT Authentication

**Nguyên nhân**: Token không hợp lệ hoặc hết hạn trong các test API.

**Giải pháp**:
- Mock middleware xác thực trong các unit test
- Trong integration test, tạo token hợp lệ:

```typescript
// Mock JWT middleware
jest.mock('../../src/middleware/auth', () => ({
  authMiddleware: (req, res, next) => {
    req.user = { _id: 'user123', role: 'user' };
    next();
  }
}));
```

### 3. Test API trả về khác với mong đợi

**Nguyên nhân**: Cấu trúc response trong test không khớp với API thực tế.

**Giải pháp**:
- Kiểm tra cấu trúc API thực tế (thông qua console.log hoặc swagger)
- Cập nhật các assertions trong test để match với API thực tế

## Các best practices

1. **Sử dụng đúng loại test**:
   - Unit test cho các hàm và phương thức
   - Integration test cho API endpoints
   - E2E tests cho luồng nghiệp vụ hoàn chỉnh

2. **Sử dụng mocks hợp lý**:
   - Mock các dependencies bên ngoài (DB, APIs, services) trong unit tests
   - Tránh mock quá nhiều trong integration tests

3. **Theo nguyên tắc AAA (Arrange-Act-Assert)**:
   - Arrange: Chuẩn bị dữ liệu test, mock dependencies
   - Act: Gọi hàm/phương thức cần test
   - Assert: Kiểm tra kết quả

4. **Tạo test data độc lập**:
   - Mỗi test case nên có data riêng
   - Sử dụng beforeEach để tạo data mới cho mỗi test

5. **Đặt tên test rõ ràng**:
   - Mô tả chính xác hành vi cần test
   - Follow pattern "should [expected behavior] when [condition]" 