import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import InputField from '../components/ui/inputfield/InputField';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import countriesData from '../assets/data/countriesV1.json';
import creditCardIcon from '../assets/icons/credit-card.png';
import vietqrIcon from '../assets/icons/vietqr.jpg';
import '../assets/css/PaymentPage.css';
import axios from 'axios';

// Initialize Stripe with public key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// Separate Card Form component to use Stripe hooks
const StripeCardForm = ({ orderTotal, shippingInfo, selectedCountry, onPaymentSuccess, onPaymentError }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { token } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');
    const [clientSecret, setClientSecret] = useState('');
    const [paymentId, setPaymentId] = useState('');
    const { cartItems } = useCart();
    
    // Create payment intent when component mounts
    useEffect(() => {
        const createPaymentIntent = async () => {
            try {
                // Create orderId from server first (this step is not shown in code)
                // Assuming orderId already exists
                const orderId = localStorage.getItem('currentOrderId');                
                if (!orderId) {
                    setPaymentError('Không tìm thấy thông tin đơn hàng');
                    return;
                }               
                const response = await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/stripe/create-payment-intent`,
                    {
                        orderId: orderId,
                        amount: orderTotal
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );               
                setClientSecret(response.data.clientSecret);
                setPaymentId(response.data.paymentId);
            } catch (error) {
                console.error('Error creating payment intent:', error);
                setPaymentError(error.response?.data?.error?.message || 'Không thể tạo phiên thanh toán');
            }
        };       
        if (orderTotal > 0) {
            createPaymentIntent();
        }
    }, [orderTotal, token]);
    
    const handleSubmit = async (event) => {
        event.preventDefault();       
        if (!stripe || !elements) {
            return;
        }        
        setIsProcessing(true);
        setPaymentError('');       
        // Get card information from CardElement
        const cardNumberElement = elements.getElement(CardNumberElement);     
        // Confirm payment with Stripe
        const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardNumberElement,
                billing_details: {
                    name: `${shippingInfo.firstName} ${shippingInfo.lastName}`,
                    address: {
                        line1: shippingInfo.address,
                        city: shippingInfo.city,
                        postal_code: shippingInfo.postalCode,
                        country: selectedCountry?.alpha2Code
                    }
                }
            }
        });

        if (error) {
            setPaymentError(error.message);
            
            // Send payment error message to server
            try {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/stripe/payment-failure`,
                    {
                        paymentId: paymentId,
                        errorMessage: error.message
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );
            } catch (serverError) {
                console.error('Không thể gửi thông báo lỗi thanh toán:', serverError);
            }            
            onPaymentError(error.message);
        } else {
            // Payment successful
            try {
                await axios.post(
                    `${process.env.REACT_APP_API_URL}/api/stripe/payment-success`,
                    {
                        paymentIntentId: paymentIntent.id,
                        paymentId: paymentId
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );               
                onPaymentSuccess();
            } catch (serverError) {
                console.error('Lỗi khi cập nhật thanh toán trên server:', serverError);
                setPaymentError('Thanh toán đã được xác nhận nhưng có lỗi khi cập nhật trạng thái');
            }
        }        
        setIsProcessing(false);
    };

    const cardElementOptions = {
        style: {
            base: {
                fontSize: '16px',
                color: '#424770',
                '::placeholder': {
                    color: '#aab7c4',
                },
                fontFamily: 'Arial, sans-serif',
            },
            invalid: {
                color: '#9e2146',
            },
        },
    };
    
    return (
        <form onSubmit={handleSubmit} className="stripe-card-form">
            <div className="card-element-container">
                <label className="card-label">Số thẻ:</label>
                <CardNumberElement options={cardElementOptions} className="card-element" />
            </div>
            
            <div className="card-elements-row">
                <div className="card-element-container expiry-container">
                    <label className="card-label">Ngày hết hạn:</label>
                    <CardExpiryElement options={cardElementOptions} className="card-element" />
                </div>
                
                <div className="card-element-container cvc-container">
                    <label className="card-label">Mã bảo mật (CVC):</label>
                    <CardCvcElement options={cardElementOptions} className="card-element" />
                </div>
            </div>
            
            {paymentError && <div className="stripe-error">{paymentError}</div>}
            
            <button 
                type="submit" 
                disabled={!stripe || isProcessing || !clientSecret} 
                className="place-order-btn"
            >
                {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
            </button>
        </form>
    );
};

const PaymentPage = () => {
    const navigate = useNavigate();
    const { cartItems, clearCart } = useCart();
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [visibleCountries, setVisibleCountries] = useState([]);
    const [paymentMethod, setPaymentMethod] = useState('credit-card');
    const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);
    const [checkValidation, setCheckValidation] = useState(false);
    const [saveShippingInfo, setSaveShippingInfo] = useState(false);
    const [itemsTotal, setItemsTotal] = useState(0);
    const [shipping, setShipping] = useState(40000);
    const [orderTotal, setOrderTotal] = useState(0);
    const countryListRef = useRef(null);
    const dropdownRef = useRef(null);

    const [shippingInfo, setShippingInfo] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
    });

    // Load countries on mount
    useEffect(() => {
        try {
            setCountries(countriesData || []);
        } catch (error) {
            console.error('Error loading countries data:', error);
        }
    }, []);

    // Filter countries based on search query
    useEffect(() => {
        if (countries.length > 0) {
            const filtered = countries.filter(country => 
                country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (country.nativeName && country.nativeName.toLowerCase().includes(searchQuery.toLowerCase()))
            );
            setFilteredCountries(filtered);
            setVisibleCountries(filtered.slice(0, 20)); // Initially show first 20 countries
        }
    }, [searchQuery, countries]);

    // Calculate totals when cart items change
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setItemsTotal(total);
        setOrderTotal(total + shipping);
    }, [cartItems, shipping]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Check if target is either in country-search-input or country-dropdown-list
            const isSearchInput = event.target.classList.contains('country-search-input');
            const isDropdownList = event.target.closest('.country-dropdown-list');
            if (isSearchInput || isDropdownList) {
                return;
            }        
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
                setShowPaymentDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle virtual scrolling for country list
    const handleCountryListScroll = () => {
        if (!countryListRef.current) return;      
        const { scrollTop, scrollHeight, clientHeight } = countryListRef.current;
        if (scrollHeight - scrollTop - clientHeight < scrollHeight * 0.2) {
            const currentLength = visibleCountries.length; 
            // Only load more if not all filtered countries are displayed
            if (currentLength < filteredCountries.length) {
                const nextItems = filteredCountries.slice(currentLength, currentLength + 10);
                if (nextItems.length > 0) {
                    // Use functional update to avoid problems with old state
                    setVisibleCountries(prev => {
                        // Check for duplicates before adding
                        const newItems = nextItems.filter(item => 
                            !prev.some(country => country.alpha3Code === item.alpha3Code)
                        );
                        return [...prev, ...newItems];
                    });
                }
            }
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;       
        if (name === 'countrySearch') {
            setSearchQuery(value);
            // Reset the displayed list when the search changes
            if (countries.length > 0) {
                const filtered = countries.filter(country => 
                    country.name.toLowerCase().includes(value.toLowerCase()) ||
                    (country.nativeName && country.nativeName.toLowerCase().includes(value.toLowerCase()))
                );
                setFilteredCountries(filtered);
                setVisibleCountries(filtered.slice(0, 20));               
                // Scroll to top of list when search changes
                if (countryListRef.current) {
                    countryListRef.current.scrollTop = 0;
                }
            }
        } else if (Object.keys(shippingInfo).includes(name)) {
            setShippingInfo({
                ...shippingInfo,
                [name]: value
            });
            // Clear error when user types
            if (errors[name]) {
                setErrors({
                    ...errors,
                    [name]: ''
                });
            }
        }
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setShowCountryDropdown(false);
        setSearchQuery('');       
        // Clear country error if it exists
        if (errors.country) {
            setErrors({
                ...errors,
                country: ''
            });
        }
    };

    const toggleCountryDropdown = () => {
        setShowCountryDropdown(!showCountryDropdown);
        if (!showCountryDropdown) {
            setSearchQuery('');
            setVisibleCountries(filteredCountries.slice(0, 20));
        }
    };

    const togglePaymentDropdown = () => {
        setShowPaymentDropdown(!showPaymentDropdown);
    };

    const selectPaymentMethod = (method) => {
        setPaymentMethod(method);
        setShowPaymentDropdown(false);
    };

    const isShippingInfoValid = useMemo(() => {
        return (
            shippingInfo.firstName.trim() !== '' &&
            shippingInfo.lastName.trim() !== '' &&
            shippingInfo.address.trim() !== '' &&
            shippingInfo.city.trim() !== '' &&
            shippingInfo.postalCode.trim() !== '' &&
            selectedCountry !== null
        );
    }, [shippingInfo.firstName, shippingInfo.lastName, shippingInfo.address, 
        shippingInfo.city, shippingInfo.postalCode, selectedCountry]);

    const validateShippingInfo = () => {
        const newErrors = {};
        let isValid = true;           
        // Validate shipping info
        if (!shippingInfo.firstName.trim()) {
            newErrors.firstName = 'Vui lòng nhập tên';
            isValid = false;
        }            
        if (!shippingInfo.lastName.trim()) {
            newErrors.lastName = 'Vui lòng nhập họ';
            isValid = false;
        }            
        if (!shippingInfo.address.trim()) {
            newErrors.address = 'Vui lòng nhập địa chỉ';
            isValid = false;
        }            
        if (!shippingInfo.city.trim()) {
            newErrors.city = 'Vui lòng nhập tên thành phố';
            isValid = false;
        }           
        if (!shippingInfo.postalCode.trim()) {
            newErrors.postalCode = 'Vui lòng nhập mã bưu điện';
            isValid = false;
        }           
        if (!selectedCountry) {
            newErrors.country = 'Vui lòng chọn quốc gia/khu vực';
            isValid = false;
        }            
        setErrors(newErrors);
        setCheckValidation(true);
        return isValid;
    };

    const handleCheckValidation = () => {
        validateShippingInfo();
    };

    const handlePaymentSuccess = () => {
        clearCart();
        // Điều hướng đến trang thanh toán thành công
        navigate('/payment-status/success');
    };

    const handlePaymentError = (errorMessage) => {
        // Có thể hiển thị lỗi hoặc điều hướng đến trang lỗi thanh toán
        navigate('/payment-status/failed');
    };

    // Format price in Vietnamese currency
    const formatPrice = (price) => {
        return price.toLocaleString('vi-VN') + ' đ';
    };

    return (
        <>
            <Header />
            <div className="payment-container">
                <h1 className="payment-title">Thanh toán</h1>               
                <div className="payment-content">
                    <div className="payment-form-container">
                        <section className="shipping-section">
                            <h2 className="section-title">Giao hàng</h2>                               
                            <div className="country-dropdown-container" ref={dropdownRef}>
                                <div className="country-dropdown-header" onClick={toggleCountryDropdown}>
                                    {selectedCountry ? (
                                        <div className="selected-country">
                                            {selectedCountry.alpha2Code && (
                                                <img 
                                                    src={`../assets/images/flags/${selectedCountry.alpha2Code.toLowerCase()}.svg`} 
                                                    alt={selectedCountry.name} 
                                                    className="country-flag"
                                                />
                                            )}
                                            <span>{selectedCountry.name}</span>
                                        </div>
                                    ) : (
                                        <span className="placeholder">Country / Region</span>
                                    )}
                                    <span className={`dropdown-arrow ${showCountryDropdown ? 'open' : ''}`}></span>
                                </div>                                   
                                {errors.country && <div className="input-error-message">{errors.country}</div>}                                   
                                {showCountryDropdown && (
                                    <div className="country-dropdown-list-container">
                                        <div className="country-search-container">
                                            <input
                                                type="text"
                                                name="countrySearch"
                                                placeholder="Tìm kiếm quốc gia..."
                                                value={searchQuery}
                                                onChange={handleInputChange}
                                                className="country-search-input"
                                            />
                                        </div>
                                        <div 
                                            className="country-dropdown-list" 
                                            ref={countryListRef}
                                            onScroll={handleCountryListScroll}
                                        >
                                            {visibleCountries.length > 0 ? (
                                                visibleCountries.map((country) => (
                                                    <div
                                                        key={country.alpha3Code}
                                                        className="country-dropdown-item"
                                                        onClick={() => selectCountry(country)}
                                                    >
                                                        {country.alpha2Code && (
                                                            <img 
                                                                src={`../assets/images/flags/${country.alpha2Code.toLowerCase()}.svg`} 
                                                                alt={country.name} 
                                                                className="country-flag"
                                                                onError={(e) => { e.target.style.display = 'none'; }}
                                                            />
                                                        )}
                                                        <span>{country.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="no-results">Không tìm thấy quốc gia</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>                               
                            <div className="name-row">
                                <InputField
                                    type="text"
                                    name="firstName"
                                    value={shippingInfo.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First Name"
                                    error={errors.firstName}
                                />                                   
                                <InputField
                                    type="text"
                                    name="lastName"
                                    value={shippingInfo.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                    error={errors.lastName}
                                />
                            </div>                               
                            <InputField
                                type="text"
                                name="address"
                                value={shippingInfo.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                                error={errors.address}
                            />                               
                            <div className="city-postal-row">
                                <InputField
                                    type="text"
                                    name="city"
                                    value={shippingInfo.city}
                                    onChange={handleInputChange}
                                    placeholder="City"
                                    error={errors.city}
                                />                                   
                                <InputField
                                    type="text"
                                    name="postalCode"
                                    value={shippingInfo.postalCode}
                                    onChange={handleInputChange}
                                    placeholder="Postal Code"
                                    error={errors.postalCode}
                                />
                            </div>                                
                            <div className="checkbox-container">
                                <input
                                    type="checkbox"
                                    id="saveShippingInfo"
                                    checked={saveShippingInfo}
                                    onChange={() => setSaveShippingInfo(!saveShippingInfo)}
                                />
                                <label htmlFor="saveShippingInfo">Lưu Thông Tin Cho Đơn Hàng Sau</label>
                            </div>
                        </section>                            
                        <section className="payment-section">
                            <h2 className="section-title">Thanh toán</h2>                               
                            <div className="payment-dropdown-container" ref={dropdownRef}>
                                <div className="payment-dropdown-header" onClick={togglePaymentDropdown}>
                                    <div className="selected-payment-method">
                                        <img 
                                            src={paymentMethod === 'credit-card' ? creditCardIcon : './assets/icons/qr-code.png'} 
                                            alt={paymentMethod === 'credit-card' ? "Credit Card" : "VietQR"} 
                                            className="payment-method-icon" 
                                        />
                                        <span>{paymentMethod === 'credit-card' ? 'Thẻ Tín Dụng/Ghi Nợ' : 'VietQR'}</span>
                                    </div>
                                    <span className={`dropdown-arrow ${showPaymentDropdown ? 'open' : ''}`}></span>
                                </div>
                                
                                {showPaymentDropdown && (
                                    <div className="payment-dropdown-list">
                                        <div className="payment-dropdown-item" onClick={() => selectPaymentMethod('credit-card')}>
                                            <img src={creditCardIcon} alt="Credit Card" className="payment-method-icon" />
                                            <span>Thẻ Tín Dụng/Ghi Nợ</span>
                                        </div>
                                        <div className="payment-dropdown-item" onClick={() => selectPaymentMethod('vietqr')}>
                                            <img src={vietqrIcon} alt="VietQR" className="payment-method-icon" />
                                            <span>VietQR</span>
                                        </div>
                                    </div>
                                )}
                            </div>                           
                            {/* Payment Methods */}
                            {isShippingInfoValid ? (
                                paymentMethod === 'credit-card' ? (
                                    <Elements stripe={stripePromise}>
                                        <StripeCardForm 
                                            orderTotal={orderTotal}
                                            shippingInfo={shippingInfo}
                                            selectedCountry={selectedCountry}
                                            onPaymentSuccess={handlePaymentSuccess}
                                            onPaymentError={handlePaymentError}
                                        />
                                    </Elements>
                                ) : (
                                    <div className="vietqr-container">
                                        <p className="vietqr-text">Quét mã QR bên dưới để thanh toán</p>
                                        <div className="qr-placeholder">
                                            <p>Mã QR sẽ được hiển thị ở đây</p>
                                            <button className="place-order-btn">Xác nhận đã thanh toán</button>
                                        </div>
                                    </div>
                                )
                            ) : (
                                <div className="shipping-validation-message">
                                    Vui lòng điền đầy đủ thông tin giao hàng để tiếp tục thanh toán
                                    <button 
                                        onClick={handleCheckValidation} 
                                        className="validate-shipping-btn"
                                    >
                                        Kiểm tra thông tin
                                    </button>
                                </div>
                            )}
                        </section>                            
                    </div>                   
                    <div className="order-summary-container">
                        <div className="order-items">
                            {cartItems.map((item) => (
                                <div key={item.cartItemId} className="order-item">
                                    <div className="order-item-image-container">
                                        <img src={item.image} alt={item.name} className="order-item-image" />
                                    </div>
                                    <div className="order-item-details">
                                        <h3 className="order-item-name">{item.name}</h3>
                                        <p className="order-item-attributes">
                                            Color: {item.color}
                                            {item.size && <span> | Size: {item.size}</span>}
                                            <span> | x{item.quantity}</span>
                                        </p>
                                    </div>
                                    <div className="order-item-price">
                                        {formatPrice(item.price)}
                                    </div>
                                </div>
                            ))}
                        </div>                       
                        <div className="order-summary-details">
                            <div className="summary-row">
                                <span>Thành tiền</span>
                                <span>{formatPrice(itemsTotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Ship</span>
                                <span>{formatPrice(shipping)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Tổng</span>
                                <span>{formatPrice(orderTotal)}</span>
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