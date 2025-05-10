import React, { useState, useEffect, useRef } from 'react';
import InputField from '../../components/ui/inputfield/InputField';
import countriesData from '../../assets/data/countriesV1.json';
import './PersonalAddress.css';

const PersonalAddress = () => {
    const [countries, setCountries] = useState([]);
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [visibleCountries, setVisibleCountries] = useState([]);
    const countryListRef = useRef(null);
    const dropdownRef = useRef(null);

    const [addressInfo, setAddressInfo] = useState({
        streetAddress: '',
        city: '',
        district: '',
        zipCode: '',
    });

    // Load countries on mount
    useEffect(() => {
        try {
            setCountries(countriesData || []);
            // Default to Vietnam if available
            const vietnam = countriesData.find(c => c.alpha2Code === 'VN');
            if (vietnam) {
                setSelectedCountry(vietnam);
            }
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
            setVisibleCountries(filtered.slice(0, 20));
        }
    }, [searchQuery, countries]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowCountryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Handle scrolling for country list
    const handleCountryListScroll = () => {
        if (!countryListRef.current) return;
        
        const { scrollTop, scrollHeight, clientHeight } = countryListRef.current;
        if (scrollHeight - scrollTop - clientHeight < scrollHeight * 0.2) {
            const currentLength = visibleCountries.length; 
            if (currentLength < filteredCountries.length) {
                const nextItems = filteredCountries.slice(currentLength, currentLength + 10);
                if (nextItems.length > 0) {
                    setVisibleCountries(prev => {
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
            if (countries.length > 0) {
                const filtered = countries.filter(country => 
                    country.name.toLowerCase().includes(value.toLowerCase()) ||
                    (country.nativeName && country.nativeName.toLowerCase().includes(value.toLowerCase()))
                );
                setFilteredCountries(filtered);
                setVisibleCountries(filtered.slice(0, 20));
                
                if (countryListRef.current) {
                    countryListRef.current.scrollTop = 0;
                }
            }
        } else if (Object.keys(addressInfo).includes(name)) {
            setAddressInfo({
                ...addressInfo,
                [name]: value
            });
        }
    };

    const selectCountry = (country) => {
        setSelectedCountry(country);
        setShowCountryDropdown(false);
        setSearchQuery('');
    };

    const toggleCountryDropdown = () => {
        setShowCountryDropdown(!showCountryDropdown);
        if (!showCountryDropdown) {
            setSearchQuery('');
            setVisibleCountries(filteredCountries.slice(0, 20));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle saving the address
        console.log({
            country: selectedCountry,
            ...addressInfo
        });
        alert('Địa chỉ đã được lưu thành công!');
    };

    return (
        <div className="personal-address-container">
            <h2 className="personal-address-title">Địa chỉ giao hàng</h2>           
            <form onSubmit={handleSubmit} className="personal-address-form">
                {/* Country Selection */}
                <div className="personal-address-field">
                    <label className="personal-address-label">Quốc Gia</label>
                    <div className="personal-address-country-dropdown" ref={dropdownRef}>
                        <div 
                            className="personal-address-country-selected" 
                            onClick={toggleCountryDropdown}
                        >
                            {selectedCountry ? (
                                <div className="personal-address-selected-country">
                                    <span>{selectedCountry.name}</span>
                                </div>
                            ) : (
                                <span className="personal-address-placeholder">Chọn quốc gia</span>
                            )}
                            <span className={`personal-address-dropdown-arrow ${showCountryDropdown ? 'open' : ''}`}></span>
                        </div>                       
                        {showCountryDropdown && (
                            <div className="personal-address-dropdown-content">
                                <div className="personal-address-search-container">
                                    <input
                                        type="text"
                                        name="countrySearch"
                                        placeholder="Tìm kiếm quốc gia..."
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        className="personal-address-search-input"
                                    />
                                </div>
                                <div 
                                    className="personal-address-countries-list" 
                                    ref={countryListRef}
                                    onScroll={handleCountryListScroll}
                                >
                                    {visibleCountries.length > 0 ? (
                                        visibleCountries.map((country) => (
                                            <div
                                                key={country.alpha3Code}
                                                className="personal-address-country-item"
                                                onClick={() => selectCountry(country)}
                                            >
                                                <span>{country.name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="personal-address-no-results">Không tìm thấy quốc gia</div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                {/* City/Province */}
                <div className="personal-address-field">
                    <InputField
                        label="Thành phố"
                        type="text"
                        name="city"
                        value={addressInfo.city}
                        onChange={handleInputChange}
                        placeholder="Quy Nhơn"
                        labelClassName="personal-address-label"
                        className="personal-address-input"
                    />
                </div>
                {/* District */}
                <div className="personal-address-field">
                    <InputField
                        label="Phường/Huyện"
                        type="text"
                        name="district"
                        value={addressInfo.district}
                        onChange={handleInputChange}
                        placeholder="Quang Trung"
                        labelClassName="personal-address-label"
                        className="personal-address-input"
                    />
                </div>
                {/* Street Address */}
                <div className="personal-address-field">
                    <InputField
                        label="Địa chỉ (Số nhà, Đường)"
                        type="text"
                        name="streetAddress"
                        value={addressInfo.streetAddress}
                        onChange={handleInputChange}
                        placeholder="2436 Tây Sơn"
                        labelClassName="personal-address-label"
                        className="personal-address-input"
                    />
                </div>
                {/* Zip Code */}
                <div className="personal-address-field">
                    <InputField
                        label="Zip Code"
                        type="text"
                        name="zipCode"
                        value={addressInfo.zipCode}
                        onChange={handleInputChange}
                        placeholder="32405"
                        labelClassName="personal-address-label"
                        className="personal-address-input"
                    />
                </div>
                <button type="submit" className="personal-address-save-btn">
                    Lưu Thay Đổi
                </button>
            </form>
        </div>
    );
};
export default PersonalAddress;