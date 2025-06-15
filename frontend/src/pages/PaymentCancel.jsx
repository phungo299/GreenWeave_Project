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
            <div className="status-content error modern-cancel">
              {/* Modern Status Icon */}
              <div className="status-icon-wrapper modern">
                <div className="status-icon cancel-icon modern-icon">
                  <div className="icon-circle">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="15" y1="9" x2="9" y2="15"/>
                      <line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Modern Status Content */}
              <div className="status-text modern">
                <h1 className="status-title modern">Thanh toán đã bị hủy</h1>
                <p className="status-description modern">
                  Giao dịch của bạn đã bị hủy. Đừng lo lắng, bạn có thể thử lại 
                  hoặc chọn phương thức thanh toán khác.
                </p>
              </div>

              {/* Modern Order Details */}
              {orderCode && (
                <div className="order-details-card modern">
                  <div className="card-header">
                    <h3>Thông tin giao dịch</h3>
                    <span className="status-badge cancelled">Đã hủy</span>
                  </div>
                  <div className="card-content">
                    <div className="detail-row">
                      <span className="detail-label">Mã đơn hàng</span>
                      <span className="detail-value">{orderCode}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Thời gian</span>
                      <span className="detail-value">{new Date().toLocaleString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Modern Action Buttons */}
              <div className="status-actions modern">
                <button 
                  onClick={() => navigate('/cart')} 
                  className="btn-primary modern"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6"/>
                  </svg>
                  Quay lại giỏ hàng
                </button>
                <button 
                  onClick={() => navigate('/payment')} 
                  className="btn-secondary modern"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  Thử lại thanh toán
                </button>
              </div>

              {/* Complete Help Section */}
              <div className="help-section modern">
                <h3>Cần hỗ trợ?</h3>
                <div className="help-options modern expanded">
                  <div className="help-item modern">
                    <div className="help-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                    </div>
                    <div className="help-content">
                      <h4>Chat trực tuyến</h4>
                      <p>Hỗ trợ 24/7</p>
                    </div>
                  </div>
                  <div className="help-item modern">
                    <div className="help-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/>
                      </svg>
                    </div>
                    <div className="help-content">
                      <h4>Hotline</h4>
                      <p>097 610 6769</p>
                    </div>
                  </div>
                  <div className="help-item modern">
                    <div className="help-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                        <circle cx="12" cy="10" r="3"/>
                      </svg>
                    </div>
                    <div className="help-content">
                      <h4>Địa chỉ</h4>
                      <p>Quy Nhơn, Bình Định</p>
                    </div>
                  </div>
                  <div className="help-item modern">
                    <div className="help-icon">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </div>
                    <div className="help-content">
                      <h4>Email</h4>
                      <p>info.greenweave@gmail.com</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Simplified Common Issues */}
              <div className="common-issues modern">
                <h3>Nguyên nhân thường gặp</h3>
                <div className="issues-grid">
                  <div className="issue-item modern">
                    <div className="issue-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                        <line x1="1" y1="10" x2="23" y2="10"/>
                      </svg>
                    </div>
                    <span>Thẻ không đủ số dư</span>
                  </div>
                  <div className="issue-item modern">
                    <div className="issue-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="6" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                    </div>
                    <span>Kết nối mạng không ổn định</span>
                  </div>
                  <div className="issue-item modern">
                    <div className="issue-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12,6 12,12 16,14"/>
                      </svg>
                    </div>
                    <span>Phiên giao dịch hết hạn</span>
                  </div>
                  <div className="issue-item modern">
                    <div className="issue-icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <circle cx="12" cy="16" r="1"/>
                        <path d="M7 11V7a5 5 0 0110 0v4"/>
                      </svg>
                    </div>
                    <span>Ngân hàng từ chối giao dịch</span>
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