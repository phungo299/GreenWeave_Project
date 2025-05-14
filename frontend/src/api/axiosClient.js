import axios from 'axios';

// Create an instance of axios
const axiosClient = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // Timeout after 10 seconds
    withCredentials: true, // Allow sending cookies across different domains
});

// Interceptor for request (eg: attach token)
axiosClient.interceptors.request.use(
    (config) => {
        // Get token from localStorage if available
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject({
        status: 0,
        message: 'Lỗi khi gửi yêu cầu',
        data: null,
        originalError: error
    })
);

// Response interceptor
axiosClient.interceptors.response.use(
    (response) => response.data,  // Return data directly
    (error) => {
        // Handle common errors
        if (error.response) {
            const { status, data } = error.response;
            
            // Client Errors (4xx)
            switch (status) {
                case 400:
                    // Bad Request
                    console.error('Yêu cầu không hợp lệ:', data.message || 'Thông số không hợp lệ');
                    break;
                case 401:
                    // Unauthorized
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('user');
                    console.error('Chưa xác thực: Vui lòng đăng nhập để tiếp tục');
                    // Only redirect if not on login or registration page
                    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register')) {
                        window.location.href = '/login';
                    }
                    break;
                case 403:
                    // Forbidden
                    console.error('Truy cập bị từ chối:', data.message || 'Bạn không có quyền truy cập vào tài nguyên này');
                    break;
                case 404:
                    // Not Found
                    console.error('Không tìm thấy:', data.message || 'Không tìm thấy tài nguyên yêu cầu');
                    break;
                case 409:
                    // Conflict
                    console.error('Xung đột:', data.message || 'Có xung đột với trạng thái hiện tại của tài nguyên');
                    break;
                case 422:
                    // Unprocessable Entity
                    console.error('Dữ liệu không hợp lệ:', data.message || 'Yêu cầu đúng định dạng nhưng có lỗi về ngữ nghĩa');
                    break;
                case 429:
                    // Too Many Requests
                    console.error('Quá nhiều yêu cầu:', data.message || 'Đã gửi quá nhiều yêu cầu trong một khoảng thời gian nhất định');
                    break;
                // Server Errors (5xx)
                case 500:
                    // Internal Server Error
                    console.error('Lỗi máy chủ:', data.message || 'Đã xảy ra lỗi không mong muốn trên máy chủ');
                    break;
                case 502:
                    // Bad Gateway
                    console.error('Lỗi cổng:', data.message || 'Máy chủ nhận được phản hồi không hợp lệ từ máy chủ upstream');
                    break;
                case 503:
                    // Service Unavailable
                    console.error('Dịch vụ không khả dụng:', data.message || 'Máy chủ tạm thời không thể xử lý yêu cầu');
                    break;
                case 504:
                    // Gateway Timeout
                    console.error('Timeout:', data.message || 'Máy chủ upstream không gửi yêu cầu trong thời gian cho phép');
                    break;
                default:
                    console.error('Đã xảy ra lỗi:', data.message || 'Lỗi không xác định');
            }

            // Return a standardized error object
            return Promise.reject({
                status: error.response.status,
                message: data.message || 'Đã xảy ra lỗi',
                data: data
            });
        }

        // Handle network errors
        if (error.request) {
            console.error('Lỗi kết nối mạng:', 'Không nhận được phản hồi từ máy chủ');
            
            // Kiểm tra lỗi CORS
            if (error.message && error.message.includes('Network Error')) {
                return Promise.reject({
                    status: 0,
                    message: 'Lỗi CORS: Không thể kết nối đến máy chủ. Vui lòng kiểm tra xem máy chủ đã hoạt động và cấu hình CORS đúng chưa.',
                    data: null
                });
            }
            
            return Promise.reject({
                status: 0,
                message: 'Lỗi kết nối: Không nhận được phản hồi từ máy chủ',
                data: null
            });
        }

        // Handle other errors
        console.error('Lỗi:', error.message);
        return Promise.reject({
            status: 0,
            message: error.message ? `Lỗi: ${error.message}` : 'Đã xảy ra lỗi không mong muốn',
            data: null
        });
    }
);
export default axiosClient;