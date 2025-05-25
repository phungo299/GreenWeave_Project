import React, { useState, useRef } from 'react';
import { FaCheck, FaSpinner, FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
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
    isValid = null,
    disabled = false,
    maxLength,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef(null);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleFocus = (e) => {
        setIsFocused(true);
        if (props.onFocus) props.onFocus(e);
    };

    const handleBlur = (e) => {
        setIsFocused(false);
        if (props.onBlur) props.onBlur(e);
    };

    const handleInputChange = (e) => {
        if (onChange) onChange(e);
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

    // Tính toán classes động
    const containerClasses = [
        'input-field-container',
        isFocused && 'focused',
        error && 'has-error',
        isValid === true && 'is-valid',
        isValid === false && 'is-invalid',
        isChecking && 'is-checking',
        disabled && 'is-disabled'
    ].filter(Boolean).join(' ');

    const inputClasses = [
        'input-field',
        error && 'input-error',
        icon && 'has-icon',
        isValid === true && 'input-valid',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={containerClasses}>
            {/* Static Label */}
            {label && (
                <label 
                    className={`static-label ${labelClassName}`}
                    htmlFor={name}
                >
                    {label}
                    {required && <span className="required-asterisk">*</span>}
                </label>
            )}

            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                
                <input
                    ref={inputRef}
                    id={name}
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    className={inputClasses}
                    required={required}
                    autoComplete={autoComplete}
                    disabled={disabled}
                    maxLength={maxLength}
                    {...props}
                />

                {/* Status Icon */}
                {renderStatusIcon()}

                {/* Password Toggle */}
                {type === 'password' && showTogglePassword && (
                    <button 
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        disabled={disabled}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                )}
            </div>

            {/* Message container với fixed height để tránh layout shift */}
            <div className="message-container">
                {error && (
                    <div className="input-error-message">
                        <FaTimes className="error-icon" />
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default InputField; 