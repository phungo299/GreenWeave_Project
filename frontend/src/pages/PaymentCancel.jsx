import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Header from "../components/layout/header/Header";
import Footer from "../components/layout/footer/Footer";
import "../assets/css/PaymentPage.css";

const PaymentCancel = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderCode = params.get("orderCode");

  return (
    <>
      <Header />
      <div className="payment-page">
        <div className="payment-status-section">
          <div className="container">
            <div className="status-content error">
              {/* Status Icon */}
              <div className="status-icon-wrapper">
                <div className="status-icon cancel-icon">
                  <div className="icon-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Status Content */}
              <div className="status-text">
                <h1 className="status-title">Thanh toán bị hủy 😔</h1>
                <p className="status-description">
                  Giao dịch của bạn đã bị hủy hoặc có lỗi xảy ra trong quá trình thanh toán. 
                  Đừng lo lắng, bạn có thể thử lại hoặc chọn phương thức thanh toán khác.
                </p>
              </div>

              {/* Order Details */}
              {orderCode && (
                <div className="order-details-card">
                  <h3>Thông tin giao dịch</h3>
                  <div className="detail-row">
                    <span className="detail-label">Mã đơn hàng:</span>
                    <span className="detail-value">{orderCode}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className="detail-value status-cancelled">Đã hủy</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Thời gian:</span>
                    <span className="detail-value">{new Date().toLocaleString('vi-VN')}</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="status-actions">
                <button 
                  onClick={() => navigate('/payment')} 
                  className="btn-primary btn-large"
                >
                  Thử lại thanh toán
                </button>
                <button 
                  onClick={() => navigate('/cart')} 
                  className="btn-secondary btn-large"
                >
                  Quay lại giỏ hàng
                </button>
              </div>

              {/* Help Section */}
              <div className="help-section">
                <h3>Cần hỗ trợ?</h3>
                <div className="help-options">
                  <div className="help-item">
                    <span className="help-icon">💬</span>
                    <div className="help-content">
                      <h4>Chat trực tuyến</h4>
                      <p>Hỗ trợ 24/7 qua chat</p>
                    </div>
                  </div>
                  <div className="help-item">
                    <span className="help-icon">📞</span>
                    <div className="help-content">
                      <h4>Hotline</h4>
                      <p>1900-xxxx (8:00 - 22:00)</p>
                    </div>
                  </div>
                  <div className="help-item">
                    <span className="help-icon">📧</span>
                    <div className="help-content">
                      <h4>Email</h4>
                      <p>support@greenweave.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Common Issues */}
              <div className="common-issues">
                <h3>Nguyên nhân thường gặp</h3>
                <div className="issues-list">
                  <div className="issue-item">
                    <span className="issue-icon">💳</span>
                    <span>Thẻ không đủ số dư hoặc bị khóa</span>
                  </div>
                  <div className="issue-item">
                    <span className="issue-icon">🌐</span>
                    <span>Kết nối mạng không ổn định</span>
                  </div>
                  <div className="issue-item">
                    <span className="issue-icon">⏰</span>
                    <span>Phiên giao dịch đã hết hạn</span>
                  </div>
                  <div className="issue-item">
                    <span className="issue-icon">🔒</span>
                    <span>Ngân hàng từ chối giao dịch</span>
                  </div>
                </div>
              </div>

              {/* Alternative Payment */}
              <div className="alternative-payment">
                <h3>Phương thức thanh toán khác</h3>
                <p>Bạn có thể thử thanh toán bằng:</p>
                <div className="payment-alternatives">
                  <div className="alt-payment-item">
                    <span className="alt-icon">💵</span>
                    <span>Thanh toán khi nhận hàng (COD)</span>
                  </div>
                  <div className="alt-payment-item">
                    <span className="alt-icon">🏦</span>
                    <span>Chuyển khoản ngân hàng</span>
                  </div>
                  <div className="alt-payment-item">
                    <span className="alt-icon">💳</span>
                    <span>Thẻ tín dụng/ghi nợ khác</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentCancel; 