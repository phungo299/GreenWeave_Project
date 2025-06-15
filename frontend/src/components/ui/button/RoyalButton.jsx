import React, { useState, useRef, useEffect } from 'react';
import './RoyalButton.css';

const RoyalButton = ({
    children,
    onClick,
    type = 'button',
    variant = 'primary', // primary, secondary, success, danger, outline
    size = 'medium', // small, medium, large
    disabled = false,
    loading = false,
    icon = null,
    iconPosition = 'left', // left, right
    fullWidth = false,
    className = '',
    ...props
}) => {
    const [isPressed, setIsPressed] = useState(false);
    const [ripples, setRipples] = useState([]);
    const buttonRef = useRef(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const handleMouseDown = (e) => {
        if (disabled || loading) return;
        
        setIsPressed(true);
        
        // Create ripple effect
        const button = buttonRef.current;
        const rect = button.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const newRipple = {
            x,
            y,
            id: Date.now()
        };
        
        setRipples(prev => [...prev, newRipple]);
        
        // Remove ripple after animation
        setTimeout(() => {
            if (isMountedRef.current) {
                setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
            }
        }, 600);
    };

    const handleMouseUp = () => {
        setIsPressed(false);
    };

    const handleClick = (e) => {
        if (disabled || loading) return;
        if (onClick) onClick(e);
    };

    // Generate dynamic classes
    const buttonClasses = [
        'royal-button',
        `royal-button--${variant}`,
        `royal-button--${size}`,
        isPressed && 'royal-button--pressed',
        disabled && 'royal-button--disabled',
        loading && 'royal-button--loading',
        fullWidth && 'royal-button--full-width',
        className
    ].filter(Boolean).join(' ');

    const renderIcon = () => {
        if (loading) {
            return <div className="royal-button__spinner" />;
        }
        return icon;
    };

    const renderContent = () => {
        if (loading) {
            return (
                <>
                    <div className="royal-button__spinner" />
                    <span className="royal-button__text">Đang xử lý...</span>
                </>
            );
        }

        return (
            <>
                {icon && iconPosition === 'left' && (
                    <span className="royal-button__icon royal-button__icon--left">
                        {renderIcon()}
                    </span>
                )}
                <span className="royal-button__text">{children}</span>
                {icon && iconPosition === 'right' && (
                    <span className="royal-button__icon royal-button__icon--right">
                        {renderIcon()}
                    </span>
                )}
            </>
        );
    };

    return (
        <button
            ref={buttonRef}
            type={type}
            className={buttonClasses}
            onClick={handleClick}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            disabled={disabled || loading}
            {...props}
        >
            {/* Glass shine effect */}
            <div className="royal-button__shine" />
            
            {/* Gradient overlay */}
            <div className="royal-button__gradient" />
            
            {/* Content */}
            <div className="royal-button__content">
                {renderContent()}
            </div>
            
            {/* Ripple effects */}
            {ripples.map(ripple => (
                <div
                    key={ripple.id}
                    className="royal-button__ripple"
                    style={{
                        left: ripple.x,
                        top: ripple.y
                    }}
                />
            ))}
            
            {/* Border glow */}
            <div className="royal-button__border-glow" />
        </button>
    );
};

export default RoyalButton; 