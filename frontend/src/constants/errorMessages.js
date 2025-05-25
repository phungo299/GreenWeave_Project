// Error Messages Constants
// Đồng bộ tất cả error messages trong ứng dụng

export const ERROR_MESSAGES = {
    // Required fields
    REQUIRED_USERNAME: 'Vui lòng nhập tên đăng nhập',
    REQUIRED_EMAIL: 'Vui lòng nhập email',
    REQUIRED_PASSWORD: 'Vui lòng nhập mật khẩu',
    REQUIRED_CONFIRM_PASSWORD: 'Vui lòng xác nhận mật khẩu',
    REQUIRED_LOGIN: 'Vui lòng nhập email hoặc tên đăng nhập',

    // Format validation
    INVALID_EMAIL: 'Email không hợp lệ',
    INVALID_USERNAME_LENGTH: 'Tên đăng nhập phải có độ dài từ 8 đến 30 ký tự',
    INVALID_USERNAME_CHARS: 'Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới',
    INVALID_PASSWORD: 'Mật khẩu phải chứa chữ thường, in hoa, số, ký tự đặc biệt và từ 6 đến 30 ký tự',
    PASSWORD_MISMATCH: 'Mật khẩu xác nhận không khớp',

    // Existence validation
    USERNAME_TAKEN: 'Tên đăng nhập này đã được sử dụng',
    EMAIL_TAKEN: 'Email này đã được sử dụng',
    USERNAME_NOT_REGISTERED: 'Tên đăng nhập này chưa được đăng ký',
    EMAIL_NOT_REGISTERED: 'Email này chưa được đăng ký',

    // Authentication errors
    ACCOUNT_NOT_FOUND: 'Tài khoản không tồn tại',
    ACCOUNT_DISABLED: 'Tài khoản của bạn đã bị khóa! Vui lòng liên hệ quản trị viên để được hỗ trợ',
    ACCOUNT_NOT_VERIFIED: 'Tài khoản chưa được xác thực! Vui lòng kiểm tra email và xác thực tài khoản',
    WRONG_CREDENTIALS: 'Thông tin đăng nhập sai, vui lòng thử lại!',

    // Generic errors
    FILL_ALL_FIELDS: 'Vui lòng điền đầy đủ các trường!',
    UNKNOWN_ERROR: 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.',
    CONNECTION_ERROR: 'Đã xảy ra lỗi kết nối. Vui lòng thử lại.',
    SERVER_ERROR: 'Đã xảy ra lỗi server'
};

// Validation functions
export const VALIDATION_REGEX = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    USERNAME: /^[a-zA-Z0-9_]{8,30}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,30}$/
};

// Helper functions for validation
export const validateUsername = (value) => {
    if (!value) return ERROR_MESSAGES.REQUIRED_USERNAME;
    if (value.length < 8 || value.length > 30) return ERROR_MESSAGES.INVALID_USERNAME_LENGTH;
    if (!VALIDATION_REGEX.USERNAME.test(value)) return ERROR_MESSAGES.INVALID_USERNAME_CHARS;
    return '';
};

export const validateEmail = (value) => {
    if (!value) return ERROR_MESSAGES.REQUIRED_EMAIL;
    if (!VALIDATION_REGEX.EMAIL.test(value)) return ERROR_MESSAGES.INVALID_EMAIL;
    return '';
};

export const validatePassword = (value) => {
    if (!value) return ERROR_MESSAGES.REQUIRED_PASSWORD;
    if (!VALIDATION_REGEX.PASSWORD.test(value)) return ERROR_MESSAGES.INVALID_PASSWORD;
    return '';
};

export const validateLoginField = (value) => {
    if (!value) return ERROR_MESSAGES.REQUIRED_LOGIN;
    
    if (VALIDATION_REGEX.EMAIL.test(value)) {
        // Valid email format
        return '';
    } else if (VALIDATION_REGEX.USERNAME.test(value)) {
        // Valid username format
        return '';
    } else {
        // Check what type of error to show
        if (value.includes('@')) {
            return ERROR_MESSAGES.INVALID_EMAIL;
        } else if (value.length < 8 || value.length > 30) {
            return ERROR_MESSAGES.INVALID_USERNAME_LENGTH;
        } else {
            return ERROR_MESSAGES.INVALID_USERNAME_CHARS;
        }
    }
}; 