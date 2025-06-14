import React, { Component } from 'react';
import './CartErrorBoundary.css';

/**
 * Error Boundary Component for Cart Operations
 * Catches and handles errors in cart-related components with retry functionality
 */
class CartErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: 0
        };
    }

    static getDerivedStateFromError(error) {
        // Update state to show error UI
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Log error details
        console.error('Cart Error Boundary caught an error:', error, errorInfo);
        
        this.setState({
            error: error,
            errorInfo: errorInfo
        });

        // Report to error tracking service (if available)
        if (window.reportError) {
            window.reportError(error, {
                component: 'CartErrorBoundary',
                errorInfo,
                retryCount: this.state.retryCount
            });
        }
    }

    handleRetry = () => {
        this.setState(prevState => ({
            hasError: false,
            error: null,
            errorInfo: null,
            retryCount: prevState.retryCount + 1
        }));
    };

    handleRefresh = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            const { retryCount } = this.state;
            const maxRetries = 3;
            
            return (
                <div className="cart-error-boundary">
                    <div className="cart-error-content">
                        <div className="cart-error-icon">⚠️</div>
                        <h2 className="cart-error-title">Oops! Có lỗi xảy ra với giỏ hàng</h2>
                        <p className="cart-error-message">
                            Xin lỗi, đã có lỗi không mong muốn xảy ra. Giỏ hàng của bạn vẫn được lưu trữ an toàn.
                        </p>
                        
                        <div className="cart-error-actions">
                            {retryCount < maxRetries ? (
                                <button 
                                    className="cart-error-btn primary"
                                    onClick={this.handleRetry}
                                >
                                    Thử lại ({maxRetries - retryCount} lần còn lại)
                                </button>
                            ) : (
                                <button 
                                    className="cart-error-btn primary"
                                    onClick={this.handleRefresh}
                                >
                                    Tải lại trang
                                </button>
                            )}
                            
                            <button 
                                className="cart-error-btn secondary"
                                onClick={() => window.history.back()}
                            >
                                Quay lại
                            </button>
                        </div>

                        {process.env.NODE_ENV === 'development' && (
                            <details className="cart-error-details">
                                <summary>Chi tiết lỗi (Development)</summary>
                                <pre className="cart-error-stack">
                                    {this.state.error && this.state.error.toString()}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

/**
 * Higher-Order Component for wrapping components with Cart Error Boundary
 */
export const withCartErrorBoundary = (WrappedComponent) => {
    return function CartErrorBoundaryWrapper(props) {
        return (
            <CartErrorBoundary>
                <WrappedComponent {...props} />
            </CartErrorBoundary>
        );
    };
};

export default CartErrorBoundary; 