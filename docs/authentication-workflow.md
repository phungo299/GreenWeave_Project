# Quy trình xác thực người dùng - GreenWeave

## 1. Quy trình đăng ký tài khoản

### Bước 1: Người dùng điền thông tin đăng ký
- Người dùng truy cập trang đăng ký
- Điền thông tin yêu cầu:
  - Tên đăng nhập (8-30 ký tự, chỉ gồm chữ cái, số và dấu gạch dưới)
  - Email (định dạng email hợp lệ)
  - Mật khẩu (6-30 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt)
  - Xác nhận mật khẩu

### Bước 2: Gửi yêu cầu đăng ký
- Hệ thống kiểm tra hợp lệ dữ liệu đầu vào
- Gửi yêu cầu đăng ký đến API: `POST /api/auth/register`
- Backend kiểm tra:
  - Tên đăng nhập đã tồn tại hay chưa
  - Email đã được sử dụng hay chưa
  - Mật khẩu có đủ mạnh không

### Bước 3: Xác thực email
- Hệ thống tạo mã xác thực ngẫu nhiên 6 chữ số
- Gửi email xác thực đến địa chỉ email đăng ký
- Hiển thị form nhập mã xác thực
- Người dùng nhập mã xác thực nhận được qua email
- Gửi yêu cầu xác thực: `POST /api/auth/verify-email`
- Nếu mã xác thực đúng, tài khoản được kích hoạt

### Bước 4: Hoàn tất đăng ký
- Hệ thống hiển thị thông báo đăng ký thành công
- Chuyển hướng người dùng đến trang đăng nhập
- Hiển thị thông báo thành công, yêu cầu đăng nhập

## 2. Quy trình đăng nhập

### Bước 1: Người dùng điền thông tin đăng nhập
- Người dùng truy cập trang đăng nhập
- Điền thông tin:
  - Tên đăng nhập hoặc email
  - Mật khẩu
  - Tùy chọn "Lưu đăng nhập"

### Bước 2: Xác thực đăng nhập
- Gửi yêu cầu đăng nhập đến API: `POST /api/auth/login`
- Backend kiểm tra:
  - Tài khoản tồn tại hay không
  - Mật khẩu có đúng không
  - Tài khoản có bị khóa không

### Bước 3: Hoàn tất đăng nhập
- Nếu đăng nhập thành công:
  - Hệ thống trả về token xác thực JWT
  - Lưu token vào localStorage
  - Lưu thông tin người dùng vào localStorage
  - Cập nhật trạng thái đăng nhập trong context
  - Chuyển hướng đến trang đích
- Nếu đăng nhập thất bại:
  - Hiển thị thông báo lỗi
  - Cho phép người dùng thử lại

## 3. Quên mật khẩu

### Bước 1: Yêu cầu đặt lại mật khẩu
- Người dùng truy cập trang quên mật khẩu
- Nhập email đã đăng ký
- Gửi yêu cầu: `POST /api/auth/forgot-password`

### Bước 2: Xác thực email
- Hệ thống tạo mã xác thực
- Gửi email chứa mã xác thực đến địa chỉ email
- Chuyển hướng đến trang nhập mã xác thực

### Bước 3: Đặt lại mật khẩu
- Người dùng nhập mã xác thực và mật khẩu mới
- Gửi yêu cầu: `POST /api/auth/reset-password`
- Nếu mã xác thực đúng, cập nhật mật khẩu mới
- Chuyển hướng đến trang đăng nhập

## 4. Đăng xuất

### Bước 1: Yêu cầu đăng xuất
- Người dùng nhấn nút đăng xuất
- Gửi yêu cầu: `POST /api/auth/logout`

### Bước 2: Xử lý đăng xuất
- Xóa token khỏi localStorage
- Xóa thông tin người dùng khỏi localStorage
- Cập nhật trạng thái đăng nhập trong context
- Chuyển hướng đến trang đăng nhập

## 5. Bảo mật

### Token JWT
- Token có thời hạn giới hạn (24 giờ)
- Chứa thông tin: ID người dùng, tên đăng nhập, email, vai trò
- Được gửi trong header: `Authorization: Bearer {token}`

### Bảo mật mật khẩu
- Mật khẩu được mã hóa bằng bcrypt trước khi lưu vào cơ sở dữ liệu
- Yêu cầu mật khẩu mạnh với chữ thường, chữ hoa, số và ký tự đặc biệt

### Xác thực API
- Tất cả API riêng tư đều yêu cầu token JWT
- Middleware kiểm tra token trước khi cho phép truy cập 