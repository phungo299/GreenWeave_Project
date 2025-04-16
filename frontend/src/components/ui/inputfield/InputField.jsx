import React, { useState } from 'react';
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
    autoComplete = 'on',
    error = '',
    showTogglePassword = false,
    icon = null
}) => {
    const [showPassword, setShowPassword] = useState(false);
  
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };
  
    const inputType = type === 'password' && showPassword ? 'text' : type;

    return (
        <div className="input-field-container">
            {label && <label className="input-label">{label}</label>}
            <div className="input-wrapper">
                {icon && <span className="input-icon">{icon}</span>}
                <input
                    type={inputType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className={`input-field ${error ? 'input-error' : ''} ${icon ? 'has-icon' : ''} ${className}`}
                    required={required}
                    autoComplete={autoComplete}
                />

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