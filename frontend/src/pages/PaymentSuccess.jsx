import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/header/Header";
import Footer from "../components/layout/footer/Footer";
import payosService from "../services/payosService";
import { useToast } from "../components/common/Toast";
import "../assets/css/PaymentPage.css";

const PaymentSuccess = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();
  const [loading, setLoading] = useState(true);
  const [paymentData, setPaymentData] = useState(null);
  const toastShown = useRef(false); // Track if toast has been shown

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      try {
        const orderCode = params.get("orderCode");
        const method = params.get("method");
        const orderId = params.get("orderId");
        const isTest = params.get("test") === "true";
        
        if (method === "cod") {
          // COD flow - no need to fetch PayOS info
          setPaymentData({
            method: "COD",
            orderId: orderId,
            status: "confirmed",
            message: "Đơn hàng COD đã được tạo thành công!"
          });
          setLoading(false);
          return;
        }

        if (method === "payos" && isTest) {
          // PayOS Test mode - simulate success
          setPaymentData({
            method: "PayOS (Test)",
            orderCode: orderCode,
            orderId: orderId,
            status: "PAID",
            amount: 1000,
            description: "Test PayOS Payment",
            message: "🧪 Test mode: Thanh toán PayOS giả lập thành công!",
            isTestMode: true
          });
          setLoading(false);
          return;
        }

        if (orderCode) {
          // PayOS flow - fetch payment info
          const res = await payosService.getPaymentInfo(orderCode);
          if (res?.success && res?.data) {
            const paymentStatus = res.data.status;
            setPaymentData({
              method: "PayOS",
              orderCode: orderCode,
              status: paymentStatus,
              amount: res.data.amount,
              description: res.data.description,
              message: paymentStatus === "PAID" 
                ? "Thanh toán PayOS thành công!" 
                : "Đang xử lý thanh toán..."
            });
          } else {
            throw new Error("Không thể lấy thông tin thanh toán");
          }
        } else {
          // No orderCode or method - generic success
          setPaymentData({
            method: "Unknown",
            status: "success",
            message: "Đơn hàng đã được xử lý thành công!"
          });
        }
      } catch (error) {
        console.error("Error fetching payment info:", error);
        setPaymentData({
          method: "Error",
          status: "error",
          message: "Có lỗi xảy ra khi kiểm tra thông tin thanh toán"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentInfo();
  }, [params]); // Only depend on params

  // Show toast only once when paymentData is set
  useEffect(() => {
    if (paymentData && !loading && !toastShown.current) {
      toastShown.current = true; // Mark toast as shown
      
      if (paymentData.method === "COD" && paymentData.status === "confirmed") {
        showSuccess("Đặt hàng COD thành công!");
      } else if (paymentData.method === "PayOS (Test)" && paymentData.status === "PAID") {
        showSuccess("Test PayOS thành công!");
      } else if (paymentData.status === "PAID") {
        showSuccess("Thanh toán thành công!");
      } else if (paymentData.status === "success") {
        showSuccess("Đơn hàng thành công!");
      } else if (paymentData.status === "error") {
        showError("Lỗi kiểm tra thanh toán");
      }
    }
  }, [paymentData, loading, showSuccess, showError]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="payment-page-compact">
          <div className="payment-status-section">
            <div className="container">
              <div className="status-content loading">
                <div className="loading-spinner-large"></div>
                <h2>Đang kiểm tra thông tin thanh toán...</h2>
                <p>Vui lòng chờ trong giây lát</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isSuccess = paymentData?.status === "PAID" || 
                   paymentData?.status === "confirmed" || 
                   paymentData?.status === "success";

  return (
    <>
      <Header />
      <div className="payment-page-compact">
        <div className="payment-status-section">
          <div className="container">
            <div className={`status-content ${isSuccess ? 'success' : 'warning'}`}>
              {/* Status Icon */}
              <div className="status-icon-wrapper">
                <div className={`status-icon ${isSuccess ? 'success-icon' : 'warning-icon'}`}>
                  <div className="icon-circle">
                    {isSuccess ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 12l2 2 4-4" />
                        <circle cx="12" cy="12" r="10" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Status Content */}
              <div className="status-text">
                <h1 className="status-title">
                  {isSuccess ? "Thành công!" : "Đang xử lý"}
                </h1>
                <p className="status-message">
                  {paymentData?.message || "Đơn hàng của bạn đã được xử lý"}
                </p>
              </div>

              {/* Payment Details */}
              {paymentData && (
                <div className="payment-details-success">
                  <div className="detail-row">
                    <span className="detail-label">Phương thức:</span>
                    <span className="detail-value">
                      {paymentData.method === "COD" ? "💵 Thanh toán khi nhận hàng" : 
                       paymentData.method === "PayOS (Test)" ? "🧪 PayOS (Test Mode)" : "💳 PayOS"}
                      {paymentData.isTestMode && (
                        <span className="test-mode-badge">TEST</span>
                      )}
                    </span>
                  </div>
                  
                  {paymentData.orderCode && (
                    <div className="detail-row">
                      <span className="detail-label">Mã giao dịch:</span>
                      <span className="detail-value">#{paymentData.orderCode}</span>
                    </div>
                  )}
                  
                  {paymentData.orderId && (
                    <div className="detail-row">
                      <span className="detail-label">Mã đơn hàng:</span>
                      <span className="detail-value">#{paymentData.orderId}</span>
                    </div>
                  )}
                  
                  {paymentData.amount && (
                    <div className="detail-row">
                      <span className="detail-label">Số tiền:</span>
                      <span className="detail-value">{paymentData.amount.toLocaleString()} đ</span>
                    </div>
                  )}
                  
                  <div className="detail-row">
                    <span className="detail-label">Trạng thái:</span>
                    <span className={`detail-value status-badge ${isSuccess ? 'success' : 'warning'}`}>
                      {isSuccess ? "✅ Hoàn thành" : "⏳ Đang xử lý"}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="status-actions">
                <button 
                  onClick={() => navigate('/products')} 
                  className="btn-primary btn-large"
                >
                  Tiếp tục mua sắm
                </button>
                <button 
                  onClick={() => navigate('/orders')} 
                  className="btn-secondary btn-large"
                >
                  Xem đơn hàng
                </button>
              </div>

              {/* Additional Info */}
              <div className="additional-info">
                {paymentData?.method === "COD" ? (
                  <div className="info-card">
                    <h4>📦 Thông tin giao hàng</h4>
                    <p>Đơn hàng sẽ được giao trong 2-3 ngày làm việc. Bạn có thể thanh toán bằng tiền mặt khi nhận hàng.</p>
                  </div>
                ) : (
                  <div className="info-card">
                    <h4>💳 Thông tin thanh toán</h4>
                    <p>Giao dịch đã được xử lý an toàn qua PayOS. Đơn hàng sẽ được chuẩn bị và giao trong thời gian sớm nhất.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PaymentSuccess; 