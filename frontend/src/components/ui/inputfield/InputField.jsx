import React, { useState } from 'react';
import { FaCheck, FaSpinner, FaTimes } from 'react-icons/fa';
import './InputField.css';

const InputField = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    placeholder,
    required = false,
    className = '',
    labelClassName = '',
    autoComplete = 'on',
    error = '',
    showTogglePassword = false,
    icon = null,
    isChecking = false,
    isValid = null
}) => {
    const [showPassword, setShowPassword] = useState(false);
  
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
  
    const inputType = type === 'password' && showPassword ? 'text' : type;

    // Hiển thị icon trạng thái
    const renderStatusIcon = () => {
        if (isChecking) {
            return <FaSpinner className="status-icon checking" />;
        } else if (isValid === true) {
            return <FaCheck className="status-icon valid" />;
        } else if (isValid === false) {
            return <FaTimes className="status-icon invalid" />;
        }
        return null;
    };

    return (
        <div className="input-field-container">
            {label && <label className={`input-label ${labelClassName}`}>{label}</label>}
            <div className={`input-wrapper ${isChecking ? 'is-checking' : ''}`}>
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`input-field ${error ? 'input-error' : ''} ${icon ? 'has-icon' : ''} ${isValid === true ? 'input-valid' : ''} ${className}`}
                    required={required}
                    autoComplete={autoComplete}
                />

                {renderStatusIcon()}

                {type === 'password' && showTogglePassword && (
                    <button 
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                        {showPassword ? 'Ẩn' : 'Hiện'}
                    </button>
                )}
            </div>
            {error && <div className="input-error-message">{error}</div>}
        </div>
    );
};
export default InputField; 