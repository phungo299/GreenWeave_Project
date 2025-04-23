import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/header/Header';
import Footer from '../components/layout/footer/Footer';
import InputField from '../components/ui/inputfield/InputField';
import { useCart } from '../context/CartContext';
import countriesData from '../assets/data/countriesV1.json';
import creditCardIcon from '../assets/icons/credit-card.png';
import '../assets/css/PaymentPage.css';

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
    const [saveShippingInfo, setSaveShippingInfo] = useState(false);
    const [savePaymentInfo, setSavePaymentInfo] = useState(false);
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

    const [paymentInfo, setPaymentInfo] = useState({
        cardNumber: '',
        expirationDate: '',
        securityCode: '',
        cardHolderName: '',
    });

    const [errors, setErrors] = useState({
        firstName: '',
        lastName: '',
        address: '',
        city: '',
        postalCode: '',
        country: '',
        cardNumber: '',
        expirationDate: '',
        securityCode: '',
        cardHolderName: '',
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
        } else if (Object.keys(paymentInfo).includes(name)) {
            let formattedValue = value;           
            // Format card number with spaces
            if (name === 'cardNumber') {
                formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
                formattedValue = formattedValue.substring(0, 19); // Limit to 16 digits + 3 spaces
            }           
            // Format expiration date MM/YY
            if (name === 'expirationDate') {
                formattedValue = value.replace(/\D/g, '');
                if (formattedValue.length > 2) {
                    formattedValue = formattedValue.substring(0, 2) + '/' + formattedValue.substring(2, 4);
                }
                formattedValue = formattedValue.substring(0, 5);
            }           
            // Limit security code to 3 or 4 digits
            if (name === 'securityCode') {
                formattedValue = value.replace(/\D/g, '');
                formattedValue = formattedValue.substring(0, 4);
            }            
            setPaymentInfo({
                ...paymentInfo,
                [name]: formattedValue
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

    const validateForm = () => {
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
        // Validate payment info
        if (paymentMethod === 'credit-card') {
            if (!paymentInfo.cardNumber.trim() || paymentInfo.cardNumber.replace(/\s/g, '').length < 16) {
                newErrors.cardNumber = 'Vui lòng nhập số thẻ hợp lệ';
                isValid = false;
            }            
            if (!paymentInfo.expirationDate.trim() || paymentInfo.expirationDate.length < 5) {
                newErrors.expirationDate = 'Vui lòng nhập ngày hết hạn hợp lệ';
                isValid = false;
            }           
            if (!paymentInfo.securityCode.trim() || paymentInfo.securityCode.length < 3) {
                newErrors.securityCode = 'Vui lòng nhập mã bảo mật hợp lệ';
                isValid = false;
            }            
            if (!paymentInfo.cardHolderName.trim()) {
                newErrors.cardHolderName = 'Vui lòng nhập tên chủ thẻ';
                isValid = false;
            }
        }       
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (validateForm()) {
            // In fact, this is where you will send the data to the API
            console.log('Order submitted:', {
                shippingInfo,
                paymentInfo,
                selectedCountry,
                cartItems,
                total: orderTotal
            });
            
            // Payment processed successfully
            clearCart();
            alert('Đặt hàng thành công!');
            navigate('/');
        }
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
                        <form onSubmit={handleSubmit}>
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
                                            <img src={creditCardIcon} alt="Credit Card" className="payment-method-icon" />
                                            <span>Credit Card</span>
                                        </div>
                                        <span className={`dropdown-arrow ${showPaymentDropdown ? 'open' : ''}`}></span>
                                    </div>                                   
                                    {showPaymentDropdown && (
                                        <div className="payment-dropdown-list">
                                            <div 
                                                className="payment-dropdown-item" 
                                                onClick={() => selectPaymentMethod('credit-card')}
                                            >
                                                <img src={creditCardIcon} alt="Credit Card" className="payment-method-icon" />
                                                <span>Credit Card</span>
                                            </div>
                                            {/* Add more payment methods here in the future */}
                                        </div>
                                    )}
                                </div>                             
                                {paymentMethod === 'credit-card' && (
                                    <div className="credit-card-form">
                                        <InputField
                                            type="text"
                                            name="cardNumber"
                                            value={paymentInfo.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="Card Number"
                                            error={errors.cardNumber}
                                        />                                       
                                        <div className="card-details-row">
                                            <InputField
                                                type="text"
                                                name="expirationDate"
                                                value={paymentInfo.expirationDate}
                                                onChange={handleInputChange}
                                                placeholder="Expiration Date"
                                                error={errors.expirationDate}
                                            />                                           
                                            <InputField
                                                type="text"
                                                name="securityCode"
                                                value={paymentInfo.securityCode}
                                                onChange={handleInputChange}
                                                placeholder="Security Code"
                                                error={errors.securityCode}
                                            />
                                        </div>                                       
                                        <InputField
                                            type="text"
                                            name="cardHolderName"
                                            value={paymentInfo.cardHolderName}
                                            onChange={handleInputChange}
                                            placeholder="Card Holder Name"
                                            error={errors.cardHolderName}
                                        />                                        
                                        <div className="checkbox-container">
                                            <input
                                                type="checkbox"
                                                id="savePaymentInfo"
                                                checked={savePaymentInfo}
                                                onChange={() => setSavePaymentInfo(!savePaymentInfo)}
                                            />
                                            <label htmlFor="savePaymentInfo">Lưu Thông Tin Cho Đơn Hàng Sau</label>
                                        </div>
                                    </div>
                                )}
                            </section>                            
                            <button type="submit" className="place-order-btn">
                                Đặt Hàng Ngay
                            </button>
                        </form>
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
