# Product API Update - GreenWeave

## Tổng quan cập nhật

Đã cập nhật toàn bộ hệ thống Product và Category API với các tính năng mới và cải thiện hiệu suất.

## Các thay đổi chính

### 1. Product Model - Các trường mới
```typescript
interface IProduct {
  // Trường cũ
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  variants: IVariant[];
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  priceHistory: IPriceHistory[];
  
  // Trường mới được thêm
  title: string;              // Tiêu đề sản phẩm
  stock: string;              // Trạng thái kho (thay đổi từ number sang string)
  quantity: number;           // Số lượng trong kho
  category: string;           // Tên danh mục
  slug: string;               // URL thân thiện (unique)
  productCode: string;        // Mã sản phẩm (unique)
  images: string[];           // Mảng URL hình ảnh
  selectedColor: string;      // Màu được chọn
  selectedSize: string;       // Size được chọn
}
```

### 2. Category API - CRUD đầy đủ
- ✅ GET `/api/categories` - Lấy tất cả danh mục (có phân trang, tìm kiếm)
- ✅ GET `/api/categories/search` - Tìm kiếm danh mục nâng cao
- ✅ GET `/api/categories/:id` - Lấy chi tiết danh mục
- ✅ GET `/api/categories/:id/products` - Lấy sản phẩm theo danh mục
- ✅ POST `/api/categories` - Tạo danh mục mới (Admin)
- ✅ PUT `/api/categories/:id` - Cập nhật danh mục (Admin)
- ✅ DELETE `/api/categories/:id` - Xóa danh mục (Admin)

### 3. Product API - Cập nhật và mở rộng
- ✅ GET `/api/products` - Lấy tất cả sản phẩm (cải thiện filter)
- ✅ GET `/api/products/search` - Tìm kiếm nâng cao (hỗ trợ thêm trường)
- ✅ GET `/api/products/featured` - Sản phẩm nổi bật
- ✅ GET `/api/products/slug/:slug` - Lấy sản phẩm theo slug (MỚI)
- ✅ GET `/api/products/:id` - Lấy chi tiết sản phẩm
- ✅ POST `/api/products` - Tạo sản phẩm (cập nhật với trường mới)
- ✅ PUT `/api/products/:id` - Cập nhật sản phẩm (cập nhật với trường mới)
- ✅ DELETE `/api/products/:id` - Xóa sản phẩm

### 4. Swagger Documentation
- ✅ Cập nhật đầy đủ Product schema với tất cả trường mới
- ✅ Thêm Category schema và endpoints
- ✅ Cập nhật request/response examples
- ✅ Thêm authentication requirements

## Cách sử dụng

### 1. Migration Database
Trước khi sử dụng, chạy migration script để cập nhật dữ liệu hiện có:

```bash
cd backend
node migration-script.js
```

### 2. Tạo sản phẩm mới
```javascript
const newProduct = {
  name: "Áo thun cotton nam",
  title: "Áo thun cotton cao cấp dành cho nam",
  description: "Áo thun được làm từ 100% cotton tự nhiên",
  price: 299000,
  stock: "Còn hàng",
  quantity: 100,
  category: "Áo thun",
  slug: "ao-thun-cotton-nam-cao-cap",
  productCode: "AT001",
  images: ["image1.jpg", "image2.jpg"],
  selectedColor: "Đỏ",
  selectedSize: "M",
  categoryId: "categoryId",
  variants: [
    {
      variantId: "AT001-RED-M",
      color: "Đỏ",
      imageUrl: "red-variant.jpg",
      stock: 50
    }
  ],
  isFeatured: true
};
```

### 3. Tìm kiếm nâng cao
```javascript
// Tìm kiếm sản phẩm
GET /api/products/search?q=áo thun&categoryId=123&minPrice=100000&maxPrice=500000&color=đỏ&sortBy=price_asc

// Tìm kiếm danh mục
GET /api/categories/search?q=áo&sortBy=name&sortOrder=asc
```

## Tính năng mới

### 1. SEO-Friendly URLs
- Sản phẩm có thể truy cập qua slug: `/api/products/slug/ao-thun-cotton-nam`
- Slug tự động tạo từ tên sản phẩm và đảm bảo unique

### 2. Advanced Search & Filter
- Tìm kiếm theo nhiều trường: name, title, description, category, productCode
- Filter theo: categoryId, price range, rating, color, featured status
- Sort theo: price, rating, popularity, newest

### 3. Stock Management
- Trạng thái kho dạng text: "Còn hàng", "Hết hàng", "Sắp hết"
- Số lượng cụ thể trong trường quantity
- Quản lý stock cho từng variant

### 4. Price History
- Tự động lưu lịch sử thay đổi giá
- Hỗ trợ phân tích xu hướng giá

### 5. Enhanced Product Variants
- Quản lý biến thể theo màu sắc, kích thước
- Mỗi variant có stock riêng
- Hình ảnh riêng cho từng variant

## Security & Validation

### 1. Authentication
- Tất cả endpoints CREATE, UPDATE, DELETE yêu cầu JWT token
- Chỉ admin mới có quyền quản lý sản phẩm và danh mục

### 2. Data Validation
- Slug và productCode phải unique
- CategoryId phải tồn tại
- Price phải là số dương
- Validation đầy đủ cho tất cả trường

### 3. Error Handling
- Response format thống nhất
- Error messages rõ ràng bằng tiếng Việt
- HTTP status codes chuẩn

## Performance Improvements

### 1. Database Indexes
```javascript
// Indexes được tạo tự động
productSchema.index({ categoryId: 1 });
productSchema.index({ name: "text", description: "text", title: "text" });
productSchema.index({ slug: 1 });
productSchema.index({ productCode: 1 });
```

### 2. Pagination
- Tất cả list endpoints đều hỗ trợ phân trang
- Default: page=1, limit=10
- Response bao gồm thông tin pagination

### 3. Population
- Tự động populate categoryId với tên danh mục
- Tối ưu query để giảm số lần truy vấn database

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Thành công",
  "data": { ... }
}
```

### List Response with Pagination
```json
{
  "success": true,
  "products": [...],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Thông báo lỗi cụ thể"
}
```

## Testing

Sử dụng file `test-api.md` để test tất cả endpoints với Postman hoặc curl.

## Deployment Notes

1. Chạy migration script trước khi deploy
2. Cập nhật environment variables nếu cần
3. Restart server để áp dụng thay đổi
4. Kiểm tra Swagger UI tại `/api-docs`

## Backward Compatibility

- Tất cả API cũ vẫn hoạt động bình thường
- Các trường mới có giá trị mặc định
- Migration script đảm bảo dữ liệu cũ được cập nhật

## Next Steps

1. Cập nhật frontend để sử dụng các trường mới
2. Implement caching cho các endpoint thường xuyên truy cập
3. Thêm analytics cho product views
4. Implement product recommendations 