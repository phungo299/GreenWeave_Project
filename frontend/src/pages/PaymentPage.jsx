import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../components/layout/header/Header";
import Footer from "../components/layout/footer/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import payosService from "../services/payosService";
import { useToast } from "../components/common/Toast";
import { filterValidCartItems } from '../utils/stockUtils';
import "../assets/css/PaymentPage.css";
import { useAddresses } from "../context/AddressContext";
import AddressFormModal from "../components/address/AddressFormModal";

const PaymentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartItems, clearCart, getCartTotal } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { showError, showSuccess, showInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [codLoading, setCodLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("payos");
  const shippingFee = 5000; // hardcode
  
  // 🚀 NEW: Shipping address management
  const [shippingAddress, setShippingAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  
  // Get selected items from navigation state or fallback to all cart items
  const selectedItems = location.state?.selectedItems || cartItems;
  const selectedTotal = location.state?.totalAmount || getCartTotal();

  const { addresses } = useAddresses();
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  // Auto-select default address or first whenever addresses change
  useEffect(() => {
    if (addresses && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault);
      const firstAddr = addresses[0];
      const chosen = addresses.find((a) => (a._id || a.id) === selectedAddressId) || defaultAddr || firstAddr;
      if (chosen) {
        setSelectedAddressId(chosen._id || chosen.id);
        setShippingAddress(formatAddress(chosen));
      }
    }
  }, [addresses]);

  // Helper to format address object to string
  const formatAddress = (addr) => {
    if (!addr) return "";
    return [
      addr.streetAddress || addr.street || "",
      addr.ward || "",
      addr.district || "",
      addr.province || addr.state || "",
      addr.country || ""
    ]
      .filter(Boolean)
      .join(", ");
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: "/payment" } });
      return;
    }
    if (selectedItems.length === 0) {
      showInfo("Không có sản phẩm nào được chọn, chuyển hướng về giỏ hàng");
      navigate("/cart");
      return;
    }
  }, [isAuthenticated, selectedItems.length, navigate, showInfo]);

  // REMOVED: Stock validation useEffect that was causing spam
  // Stock validation is now only done when user clicks payment buttons

  const createOrderData = () => ({
    userId: user?.id,
    items: selectedItems.map((item) => ({
      productId: item.id || item.productId?._id, // Fix: Handle both formats
      variantId: item.variantId || null,
      color: item.color || '',
      quantity: item.quantity,
      price: item.price, // Use price from cart item
      name: item.name
    })),
    totalAmount: selectedTotal + shippingFee,
    shippingCost: shippingFee,
    paymentMethod: selectedMethod.toUpperCase(),
    status: "pending",
    // ✅ FIXED: Use real shipping address from state
    shippingAddress: shippingAddress.trim()
  });

  const handlePayOSCheckout = async () => {
    try {
      setLoading(true);
      
      // Validate user authentication
      if (!user?.id) {
        showError("Vui lòng đăng nhập để tiếp tục thanh toán");
        navigate("/login", { state: { returnTo: "/payment" } });
        return;
      }
      
      // 🚨 CRITICAL: Validate shipping address before proceeding
      if (!shippingAddress || shippingAddress.trim() === '') {
        showError("Vui lòng nhập địa chỉ giao hàng trước khi thanh toán");
        setShowAddressModal(true);
        return;
      }
      
      // Real-time stock validation before payment
      const { invalidItems: stockInvalidItems } = filterValidCartItems(selectedItems);
      
      if (stockInvalidItems.length > 0) {
        showError(`Không thể thanh toán. Có ${stockInvalidItems.length} sản phẩm hết hàng hoặc không đủ số lượng. Vui lòng kiểm tra lại giỏ hàng.`);
        navigate("/cart");
        return;
      }
      
      // Step 1: Create order in database first
      const orderData = createOrderData();
      
      // Debug log the order data being sent
      console.log('Order data being sent:', orderData);
      
      const orderResponse = await payosService.createOrder(orderData);
      
      // 🔧 DEBUG: Log the actual response structure
      console.log('📋 Full order response:', JSON.stringify(orderResponse, null, 2));
      console.log('📋 Response type:', typeof orderResponse);
      console.log('📋 Response success:', orderResponse?.success);
      console.log('📋 Response message:', orderResponse?.message);
      console.log('📋 Response data:', orderResponse?.data);
      console.log('📋 Response data _id:', orderResponse?.data?._id);
      
      // 🔧 IMPROVED: Better response validation logic
      let orderId = null;
      let responseValid = false;
      
      // Case 1: Standard success response format with orderId (new structure)
      if (orderResponse?.success === true && orderResponse?.data?.orderId) {
        orderId = orderResponse.data.orderId;
        responseValid = true;
        console.log('✅ Standard success format with orderId detected');
      }
      // Case 2: Standard success response format with _id (old structure)
      else if (orderResponse?.success === true && orderResponse?.data?._id) {
        orderId = orderResponse.data._id;
        responseValid = true;
        console.log('✅ Standard success format with _id detected');
      }
      // Case 3: Direct data response (when axiosClient returns data directly)
      else if (orderResponse?._id) {
        orderId = orderResponse._id;
        responseValid = true;
        console.log('✅ Direct data format detected');
      }
      // Case 4: Alternative success field variations
      else if (orderResponse?.success !== false && (orderResponse?.data?.orderId || orderResponse?.data?._id)) {
        orderId = orderResponse.data.orderId || orderResponse.data._id;
        responseValid = true;
        console.log('✅ Alternative success format detected');
      }
      // Case 5: Check if response has success message but missing structure
      else if (orderResponse?.message?.includes?.('thành công') || orderResponse?.message?.includes?.('success')) {
        console.log('⚠️ Success message detected but missing expected structure');
        console.log('⚠️ Attempting to extract order ID from response...');
        
        // Try different possible ID locations in order of preference
        const possibleId = orderResponse?.data?.orderId || 
                          orderResponse?.data?._id || 
                          orderResponse?.orderId || 
                          orderResponse?.id || 
                          orderResponse?._id;
        if (possibleId) {
          orderId = possibleId;
          responseValid = true;
          console.log('✅ Order ID found in alternative location:', orderId);
        }
      }
      
      // Final validation
      if (!responseValid || !orderId) {
        const errorMsg = orderResponse?.message || "Không thể tạo đơn hàng - format response không hợp lệ";
        console.error('❌ Order creation failed:', {
          responseValid,
          orderId,
          fullResponse: orderResponse
        });
        throw new Error(errorMsg);
      }
      
      console.log('✅ Order created successfully with ID:', orderId);

      // Step 2: Create PayOS payment link
      const paymentData = {
        orderId: orderId,
        amount: orderData.totalAmount,
        description: `Thanh toán đơn hàng #${orderId}`,
        returnUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`
      };

      console.log('💳 Creating PayOS payment link with data:', paymentData);
      const paymentResponse = await payosService.createPaymentLink(paymentData);
      console.log('💳 PayOS payment response:', paymentResponse);
      
      // 🔧 IMPROVED: Better PayOS response handling with multiple fallbacks
      let checkoutUrl = null;
      
      // Case 1: Full success response with data.checkoutUrl
      if (paymentResponse?.success === true && paymentResponse?.data?.checkoutUrl) {
        checkoutUrl = paymentResponse.data.checkoutUrl;
        console.log('✅ PayOS checkoutUrl found in data.checkoutUrl');
      }
      // Case 2: Direct checkoutUrl in response
      else if (paymentResponse?.checkoutUrl) {
        checkoutUrl = paymentResponse.checkoutUrl;
        console.log('✅ PayOS checkoutUrl found in direct response');
      }
      // Case 3: PayOS response has orderCode but no checkoutUrl (DANGEROUS - likely API failure)
      else if (paymentResponse?.data?.orderCode || paymentResponse?.orderCode) {
        const orderCode = paymentResponse?.data?.orderCode || paymentResponse?.orderCode;
        console.warn('❌ PayOS returned orderCode without checkoutUrl - likely API failure!');
        console.warn('❌ This means the payment link was NOT created on PayOS servers');
        console.warn('❌ Generated URL will show "order not found" error');
        
        // Don't generate fake URL - this leads to "order not found" error
        // Instead, treat as error
        throw new Error(`PayOS API failed: orderCode ${orderCode} returned without valid checkoutUrl`);
      }
      // Case 4: Check if response indicates success but format is unexpected
      else if (paymentResponse?.success !== false && (
        paymentResponse?.message?.includes?.('success') || 
        paymentResponse?.message?.includes?.('thành công')
      )) {
        console.warn('⚠️ PayOS success message but missing checkout data');
        // Try to extract any code/id for manual URL generation
        const possibleCode = paymentResponse?.id || paymentResponse?.code || Date.now();
        checkoutUrl = `https://pay.payos.vn/web/${possibleCode}`;
        console.log('⚠️ PayOS fallback URL generated:', checkoutUrl);
      }
      
      // Final handling
      if (checkoutUrl) {
        showSuccess("Chuyển hướng đến PayOS...");
        console.log('🚀 Redirecting to PayOS:', checkoutUrl);
        window.location.href = checkoutUrl;
      } else {
        console.error('❌ PayOS response missing checkout URL completely:', paymentResponse);
        console.error('❌ Debug PayOS response structure:', {
          success: paymentResponse?.success,
          data: paymentResponse?.data,
          keys: Object.keys(paymentResponse || {}),
          dataKeys: paymentResponse?.data ? Object.keys(paymentResponse.data) : null
        });
        throw new Error("Không thể tạo link thanh toán PayOS - thiếu checkout URL");
      }
    } catch (error) {
      console.error("PayOS checkout error:", error);
      
      // 🔧 IMPROVED: Better error message handling
      let errorMessage = "Không thể tạo thanh toán PayOS";
      
      // Don't show success messages as errors
      if (error.message && !error.message.includes('thành công') && !error.message.includes('success')) {
        errorMessage = error.message;
      } else if (error.message?.includes('thành công')) {
        // This is actually a success message being thrown as error - investigate
        console.log('🔍 Success message thrown as error - investigating...');
        errorMessage = "Có lỗi trong quá trình xử lý đơn hàng. Vui lòng thử lại.";
      }
      
      // Check if this is actually a stock error (success=false from backend)
      if (errorMessage.includes("sản phẩm trong kho")) {
        showError(errorMessage);
      } else {
        showError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCODCheckout = async () => {
    try {
      setCodLoading(true);
      
      // 🚨 CRITICAL: Validate shipping address before proceeding
      if (!shippingAddress || shippingAddress.trim() === '') {
        showError("Vui lòng nhập địa chỉ giao hàng trước khi đặt hàng COD");
        setShowAddressModal(true);
        return;
      }
      
      // Real-time stock validation before COD payment
      const { invalidItems: stockInvalidItems } = filterValidCartItems(selectedItems);
      
      if (stockInvalidItems.length > 0) {
        showError(`Không thể thanh toán COD. Có ${stockInvalidItems.length} sản phẩm hết hàng hoặc không đủ số lượng. Vui lòng kiểm tra lại giỏ hàng.`);
        navigate("/cart");
        return;
      }
      
      // Create COD order directly
      const orderData = createOrderData();
      
      // Debug log for COD as well
      console.log('COD Order data being sent:', orderData);
      
      const response = await payosService.createOrder(orderData);
      
      // 🔧 DEBUG: Log COD response structure 
      console.log('📋 COD Full response:', JSON.stringify(response, null, 2));
      console.log('📋 COD Response success:', response?.success);
      console.log('📋 COD Response data _id:', response?.data?._id);
      
      // 🔧 IMPROVED: Better response validation logic (same as PayOS)
      let orderId = null;
      let responseValid = false;
      
      // Case 1: Standard success response format with orderId (new structure)
      if (response?.success === true && response?.data?.orderId) {
        orderId = response.data.orderId;
        responseValid = true;
        console.log('✅ COD Standard success format with orderId detected');
      }
      // Case 2: Standard success response format with _id (old structure)
      else if (response?.success === true && response?.data?._id) {
        orderId = response.data._id;
        responseValid = true;
        console.log('✅ COD Standard success format with _id detected');
      }
      // Case 3: Direct data response
      else if (response?._id) {
        orderId = response._id;
        responseValid = true;
        console.log('✅ COD Direct data format detected');
      }
      // Case 4: Alternative success field variations
      else if (response?.success !== false && (response?.data?.orderId || response?.data?._id)) {
        orderId = response.data.orderId || response.data._id;
        responseValid = true;
        console.log('✅ COD Alternative success format detected');
      }
      // Case 5: Check if response has success message but missing structure
      else if (response?.message?.includes?.('thành công') || response?.message?.includes?.('success')) {
        console.log('⚠️ COD Success message detected but missing expected structure');
        
        // Try different possible ID locations in order of preference
        const possibleId = response?.data?.orderId || 
                          response?.data?._id || 
                          response?.orderId || 
                          response?.id || 
                          response?._id;
        if (possibleId) {
          orderId = possibleId;
          responseValid = true;
          console.log('✅ COD Order ID found in alternative location:', orderId);
        }
      }
      
      // Final validation
      if (responseValid && orderId) {
        showSuccess("Đặt hàng COD thành công! Đơn đang chờ xác nhận");
        navigate(`/payment/success?method=cod&orderId=${orderId}`);
      } else {
        const errorMsg = response?.message || "Không thể tạo đơn hàng COD - format response không hợp lệ";
        console.error('❌ COD Order creation failed:', {
          responseValid,
          orderId,
          fullResponse: response
        });
        throw new Error(errorMsg);
      }
    } catch (error) {
      console.error("COD checkout error:", error);
      
      // 🔧 IMPROVED: Better error message handling for COD
      let errorMessage = "Không thể tạo đơn COD";
      
      // Don't show success messages as errors
      if (error.message && !error.message.includes('thành công') && !error.message.includes('success')) {
        errorMessage = error.message;
      } else if (error.message?.includes('thành công')) {
        console.log('🔍 COD Success message thrown as error - investigating...');
        errorMessage = "Có lỗi trong quá trình xử lý đơn hàng COD. Vui lòng thử lại.";
      }
      
      showError(errorMessage);
    } finally {
      setCodLoading(false);
    }
  };

  if (selectedItems.length === 0) {
    return (
      <>
        <Header />
        <div className="payment-page-compact">
          <div className="empty-cart-section">
            <div className="container">
              <div className="empty-cart-content">
                <div className="empty-cart-icon">🛒</div>
                <h2 className="empty-cart-title">Không có sản phẩm được chọn</h2>
                <p className="empty-cart-description">
                  Bạn chưa chọn sản phẩm nào để thanh toán. Hãy quay lại giỏ hàng và chọn sản phẩm!
                </p>
                <button 
                  onClick={() => navigate('/cart')} 
                  className="btn-primary btn-large"
                >
                  Quay lại giỏ hàng
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
              
              {/* Left: Order Summary */}
              <div className="order-summary-compact">
                <div className="summary-header">
                  <h2>Đơn hàng của bạn</h2>
                  <span className="item-count">{selectedItems.length} sản phẩm</span>
                </div>
                
                <div className="order-items-compact">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="order-item-compact">
                      <div className="item-image-wrapper">
                        <img 
                          src={item.image || "/placeholder-product.jpg"} 
                          alt={item.name}
                          className="item-image"
                        />
                        <span className="item-quantity">{item.quantity}</span>
                      </div>
                      <div className="item-details">
                        <h4 className="item-name">{item.name}</h4>
                        <p className="item-price">{(item.price * item.quantity).toLocaleString()} đ</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-totals-compact">
                  <div className="total-row">
                    <span>Tạm tính:</span>
                    <span>{selectedTotal.toLocaleString()} đ</span>
                  </div>
                  <div className="total-row">
                    <span>Phí vận chuyển:</span>
                    <span>{shippingFee.toLocaleString()} đ</span>
                  </div>
                  <div className="total-row final-total">
                    <span>Tổng cộng:</span>
                    <span>{(selectedTotal + shippingFee).toLocaleString()} đ</span>
                  </div>
                </div>
              </div>

              {/* Right: Shipping & Payment */}
              <div className="payment-methods-compact">
                
                {/* 🚀 NEW: Shipping Address Section */}
                <div className="shipping-address-section">
                  <h2>Địa chỉ giao hàng</h2>
                  
                  {/* Address list or placeholder */}
                  {addresses.length > 0 ? (
                    <div className="address-list">
                      {addresses.map((addr) => (
                        <label key={addr._id || addr.id} className={`address-item ${selectedAddressId === (addr._id||addr.id) ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="address"
                            value={addr._id||addr.id}
                            checked={selectedAddressId === (addr._id||addr.id)}
                            onChange={() => {
                              setSelectedAddressId(addr._id||addr.id);
                              setShippingAddress(formatAddress(addr));
                            }}
                          />
                          <span>{formatAddress(addr)}{addr.isDefault ? ' (Mặc định)' : ''}</span>
                        </label>
                      ))}
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Thêm địa chỉ mới
                      </button>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="address-placeholder">
                      <p className="address-prompt">Bạn chưa có địa chỉ giao hàng</p>
                      <button 
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowAddressModal(true)}
                      >
                        Thêm địa chỉ giao hàng
                      </button>
                    </div>
                  ) : null}
                  
                  {showAddressModal && (
                    <AddressFormModal
                      onClose={(saved, newAddr) => {
                        setShowAddressModal(false);
                        if (saved && newAddr) {
                          setSelectedAddressId(newAddr._id || newAddr.id);
                          setShippingAddress(formatAddress(newAddr));
                        }
                      }}
                    />
                  )}
                </div>
                
                <h2>Chọn phương thức thanh toán</h2>
                
                <div className="payment-options">
                  {/* PayOS Option */}
                  <div 
                    className={`payment-option ${selectedMethod === 'payos' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('payos')}
                  >
                    <div className="option-header">
                      <div className="option-info">
                        <div className="option-icon">💳</div>
                        <div>
                          <h3>PayOS</h3>
                          <p>Thanh toán trực tuyến</p>
                        </div>
                      </div>
                      <div className={`radio-button ${selectedMethod === 'payos' ? 'checked' : ''}`}>
                        <div className="radio-dot"></div>
                      </div>
                    </div>
                    <div className="option-features">
                      <span className="feature-tag">Bảo mật</span>
                      <span className="feature-tag">Nhanh chóng</span>
                      <span className="feature-tag">QR Code</span>
                    </div>
                  </div>

                  {/* COD Option */}
                  <div 
                    className={`payment-option ${selectedMethod === 'cod' ? 'active' : ''}`}
                    onClick={() => setSelectedMethod('cod')}
                  >
                    <div className="option-header">
                      <div className="option-info">
                        <div className="option-icon">💵</div>
                        <div>
                          <h3>Thanh toán khi nhận hàng</h3>
                          <p>Trả tiền mặt khi giao hàng</p>
                        </div>
                      </div>
                      <div className={`radio-button ${selectedMethod === 'cod' ? 'checked' : ''}`}>
                        <div className="radio-dot"></div>
                      </div>
                    </div>
                    <div className="option-features">
                      <span className="feature-tag">Tiện lợi</span>
                      <span className="feature-tag">An toàn</span>
                      <span className="feature-tag">Kiểm tra hàng</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={selectedMethod === 'payos' ? handlePayOSCheckout : handleCODCheckout}
                  disabled={loading || codLoading}
                  className="checkout-btn-compact"
                >
                  {(loading || codLoading) ? (
                    <div className="btn-loading">
                      <div className="loading-spinner"></div>
                      <span>Đang xử lý...</span>
                    </div>
                  ) : (
                    <div className="btn-content">
                      <span className="btn-icon">
                        {selectedMethod === 'payos' ? '💳' : '💵'}
                      </span>
                      <span>
                        {selectedMethod === 'payos' ? 'Thanh toán PayOS' : 'Đặt hàng COD'}
                      </span>
                    </div>
                  )}
                </button>

                {/* Security Info */}
                <div className="security-info-compact">
                  <div className="security-item">
                    <span className="security-icon">🔒</span>
                    <span>Thông tin được bảo mật SSL</span>
                  </div>
                  <div className="security-item">
                    <span className="security-icon">✅</span>
                    <span>Đảm bảo hoàn tiền 100%</span>
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

export default PaymentPage;