import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/layout/header/Header";
import Footer from "../components/layout/footer/Footer";
import { useAuth } from "../context/AuthContext";
import payosService from "../services/payosService";
import { useToast } from "../components/common/Toast";
import "../assets/css/PaymentPage.css";

const PaymentTest = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("payos");

  // Test data
  const testAmount = 1000; // 1000 VND
  const shippingFee = 0; // Free shipping for test
  const testItems = [
    {
      id: "test-product-1",
      name: "Sản phẩm test PayOS",
      price: 1000,
      quantity: 1,
      image: "/placeholder-product.svg"
    }
  ];

  const createTestOrderData = () => ({
    userId: user?.id || "test-user-id",
    items: testItems.map((item) => ({
      productId: item.id,
      quantity: item.quantity,
      price: item.price,
      name: item.name
    })),
    totalAmount: testAmount + shippingFee,
    shippingCost: shippingFee,
    paymentMethod: selectedMethod.toUpperCase(),
    status: "pending"
  });

  const handlePayOSTest = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: "/payment-test" } });
      return;
    }

    try {
      setLoading(true);
      
      // Step 1: Create test order using test endpoint
      const orderData = createTestOrderData();
      console.log('🧪 Creating test order with data:', orderData);
      
      const orderResponse = await payosService.createTestOrder(orderData);
      console.log('📦 Order response:', orderResponse);
      
      // Fix: Check for orderId in direct response or nested data
      const orderId = orderResponse?.data?.orderId || orderResponse?.orderId;
      if (!orderId) {
        console.error('❌ Invalid order response structure:', orderResponse);
        throw new Error("Không thể tạo đơn hàng test - Response không hợp lệ");
      }

      console.log('✅ Order created successfully, orderId:', orderId);

      // Step 2: Create PayOS payment link
      const paymentData = {
        orderId: orderId,
        amount: orderData.totalAmount,
        description: `Test PayOS - Đơn hàng #${orderId}`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      };

      console.log('💳 Creating payment link with data:', paymentData);
      const paymentResponse = await payosService.createPaymentLink(paymentData);
      console.log('🔗 Payment response:', paymentResponse);
      
      // Handle both production and test mode responses
      const checkoutUrl = paymentResponse?.data?.checkoutUrl || paymentResponse?.checkoutUrl;
      const orderCode = paymentResponse?.data?.orderCode || paymentResponse?.orderCode;
      
      if (checkoutUrl) {
        // Production mode: redirect to real PayOS
        showSuccess("Chuyển hướng đến PayOS...");
        window.location.href = checkoutUrl;
      } else if (orderCode) {
        // Test mode: simulate success since we can't redirect to real PayOS
        console.log('🧪 Test mode detected - orderCode:', orderCode);
        showSuccess("Test mode: Giả lập thanh toán thành công!");
        
        // Simulate successful payment after 2 seconds
        setTimeout(() => {
          navigate(`/payment/success?method=payos&orderId=${orderId}&orderCode=${orderCode}&test=true`);
        }, 2000);
      } else {
        console.error('❌ Invalid payment response structure:', paymentResponse);
        throw new Error("Không thể tạo link thanh toán test - Response không hợp lệ");
      }
    } catch (error) {
      console.error("PayOS test error:", error);
      console.error("Error details:", error.response?.data || error.message);
      showError(error.response?.data?.message || error.message || "Không thể tạo test PayOS");
    } finally {
      setLoading(false);
    }
  };

  const handleCODTest = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: "/payment-test" } });
      return;
    }

    try {
      setCodLoading(true);
      
      const orderData = createTestOrderData();
      console.log('🧪 Creating COD test order with data:', orderData);
      
      const response = await payosService.createTestOrder(orderData);
      console.log('📦 COD Order response:', response);
      
      // Fix: Check for orderId in direct response or nested data
      const orderId = response?.data?.orderId || response?.orderId;
      if (orderId) {
        console.log('✅ COD Order created successfully, orderId:', orderId);
        showSuccess("Tạo đơn hàng COD test thành công!");
        navigate(`/payment/success?method=cod&orderId=${orderId}`);
      } else {
        console.error('❌ Invalid COD order response structure:', response);
        throw new Error("Không thể tạo đơn hàng COD test - Response không hợp lệ");
      }
    } catch (error) {
      console.error("COD test error:", error);
      console.error("Error details:", error.response?.data || error.message);
      showError(error.response?.data?.message || error.message || "Không thể tạo test COD");
    } finally {
      setCodLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="payment-page-compact">
          <div className="empty-cart-section">
            <div className="container">
              <div className="empty-cart-content">
                <div className="empty-cart-icon">🔐</div>
                <h2 className="empty-cart-title">Cần đăng nhập</h2>
                <p className="empty-cart-description">
                  Bạn cần đăng nhập để test thanh toán PayOS
                </p>
                <button 
                  onClick={() => navigate('/login', { state: { returnTo: '/payment-test' } })} 
                  className="btn-primary btn-large"
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="payment-page-compact">
        <div className="payment-container-compact">
          <div className="container">
            <div className="payment-grid-compact">
              
              {/* Left: Test Order Summary */}
              <div className="order-summary-compact">
                <div className="summary-header">
                  <h2>🧪 Test PayOS - 1000đ</h2>
                  <span className="item-count">1 sản phẩm test</span>
                </div>
                
                <div className="test-warning">
                  <div className="warning-icon">⚠️</div>
                  <div>
                    <h4>Đây là môi trường test</h4>
                    <p>Giao dịch này chỉ để kiểm thử tích hợp PayOS. Số tiền 1000đ sẽ được hoàn trả.</p>
                  </div>
                </div>
                
                <div className="order-items-compact">
                  {testItems.map((item) => (
                    <div key={item.id} className="order-item-compact">
                      <div className="item-image-wrapper">
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="item-image"
                        />
                        <span className="item-quantity">{item.quantity}</span>
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-price">{item.price.toLocaleString()} đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals-compact">
                  <div className="total-row">
                    <span>Tạm tính:</span>
                    <span>{testAmount.toLocaleString()} đ</span>
                  </div>
                  <div className="total-row">
                    <span>Phí vận chuyển:</span>
                    <span>{shippingFee.toLocaleString()} đ</span>
                  </div>
                  <div className="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>{(testAmount + shippingFee).toLocaleString()} đ</span>
                  </div>
                </div>
              </div>

              {/* Right: Payment Methods */}
              <div className="payment-methods-compact">
                <h2>🧪 Test phương thức thanh toán</h2>
                
                <div className="payment-options">
                  {/* PayOS Test Option */}
                  <div 
                    className={`payment-option ${selectedMethod === 'payos' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('payos')}
                  >
                    <div className="option-header">
                      <div className="option-info">
                        <div className="option-icon">💳</div>
                        <div>
                          <h3>PayOS Test</h3>
                          <p>Test thanh toán trực tuyến 1000đ</p>
                        </div>
                      </div>
                      <div className={`radio-button ${selectedMethod === 'payos' ? 'checked' : ''}`}>
                        <div className="radio-dot"></div>
                      </div>
                    </div>
                    <div className="option-features">
                      <span className="feature-tag">Test Mode</span>
                      <span className="feature-tag">1000đ</span>
                      <span className="feature-tag">QR Code</span>
                    </div>
                  </div>

                  {/* COD Test Option */}
                  <div 
                    className={`payment-option ${selectedMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('cod')}
                  >
                    <div className="option-header">
                      <div className="option-info">
                        <div className="option-icon">💵</div>
                        <div>
                          <h3>COD Test</h3>
                          <p>Test thanh toán khi nhận hàng</p>
                        </div>
                      </div>
                      <div className={`radio-button ${selectedMethod === 'cod' ? 'checked' : ''}`}>
                        <div className="radio-dot"></div>
                      </div>
                    </div>
                    <div className="option-features">
                      <span className="feature-tag">Test Mode</span>
                      <span className="feature-tag">Miễn phí</span>
                      <span className="feature-tag">Instant</span>
                    </div>
                  </div>
                </div>

                {/* Test Checkout Button */}
                <button
                  onClick={selectedMethod === 'payos' ? handlePayOSTest : handleCODTest}
                  disabled={loading || codLoading}
                  className="checkout-btn-compact test-btn"
                >
                  {(loading || codLoading) ? (
                    <div className="btn-loading">
                      <div className="loading-spinner"></div>
                      <span>Đang test...</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <span className="btn-icon">🧪</span>
                      <span>
                        {selectedMethod === 'payos' ? 'Test PayOS 1000đ' : 'Test COD'}
                      </span>
                    </div>
                  )}
                </button>

                {/* Test Info */}
                <div className="security-info-compact">
                  <div className="security-item">
                    <span className="security-icon">🧪</span>
                    <span>Môi trường test - an toàn 100%</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">💰</span>
                    <span>Số tiền test sẽ được hoàn trả</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">⚡</span>
                    <span>Kiểm tra tích hợp PayOS</span>
                  </div>
                </div>

                {/* Test Instructions */}
                <div className="test-instructions">
                  <h4>📋 Hướng dẫn test</h4>
                  <ol>
                    <li>Chọn phương thức thanh toán test</li>
                    <li>Nhấn nút "Test PayOS 1000đ" hoặc "Test COD"</li>
                    <li>Với PayOS: quét QR code hoặc nhập thông tin test</li>
                    <li>Kiểm tra kết quả trên trang success</li>
                    <li>Xác nhận webhook và database update</li>
                  </ol>
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

export default PaymentTest; 