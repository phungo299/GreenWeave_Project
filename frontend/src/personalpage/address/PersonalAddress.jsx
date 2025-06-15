import React, { useState, useEffect, useRef } from 'react';
import InputField from '../../components/ui/inputfield/InputField';
import personalService from '../../services/personalService';
import vietnamLocationService from '../../services/vietnamLocationService';
import { useAddresses } from '../../context/AddressContext';
import './PersonalAddress.css';

const PersonalAddress = () => {
    // Fixed country to Vietnam
    const VIETNAM_COUNTRY = {
        name: 'Việt Nam',
        alpha2Code: 'VN',
        alpha3Code: 'VNM',
        nativeName: 'Việt Nam'
    };

    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState(null);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedWard, setSelectedWard] = useState(null);
    
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
    const [showWardDropdown, setShowWardDropdown] = useState(false);
    
    const [provinceSearchQuery, setProvinceSearchQuery] = useState('');
    const [districtSearchQuery, setDistrictSearchQuery] = useState('');
    const [wardSearchQuery, setWardSearchQuery] = useState('');
    
    const [filteredProvinces, setFilteredProvinces] = useState([]);
    const [filteredDistricts, setFilteredDistricts] = useState([]);
    const [filteredWards, setFilteredWards] = useState([]);
    
    const provinceDropdownRef = useRef(null);
    const districtDropdownRef = useRef(null);
    const wardDropdownRef = useRef(null);

    const [addressInfo, setAddressInfo] = useState({
        streetAddress: '',
        zipCode: '',
    });

    const { addresses, loading, fetchAddresses, deleteAddress: ctxDeleteAddress, addAddress: ctxAddAddress, updateAddress: ctxUpdateAddress, setDefaultAddress: ctxSetDefault } = useAddresses();
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [editingAddress, setEditingAddress] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // Load provinces and addresses on mount
    useEffect(() => {
        loadProvinces();
    }, []);

    // Load provinces from API
    const loadProvinces = async () => {
        try {
            const provincesData = await vietnamLocationService.getProvinces();
            setProvinces(provincesData);
            setFilteredProvinces(provincesData);
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    // Load districts when province is selected
    const loadDistricts = async (provinceCode) => {
        try {
            const districtsData = await vietnamLocationService.getDistricts(provinceCode);
            setDistricts(districtsData);
            setFilteredDistricts(districtsData);
            // Reset district and ward selection
            setSelectedDistrict(null);
            setSelectedWard(null);
            setWards([]);
            setFilteredWards([]);
        } catch (error) {
            console.error('Error loading districts:', error);
        }
    };

    // Load wards when district is selected
    const loadWards = async (districtCode) => {
        try {
            const wardsData = await vietnamLocationService.getWards(districtCode);
            setWards(wardsData);
            setFilteredWards(wardsData);
            // Reset ward selection
            setSelectedWard(null);
        } catch (error) {
            console.error('Error loading wards:', error);
        }
    };

    // Filter provinces based on search query
    useEffect(() => {
        if (provinces.length > 0) {
            const filtered = provinces.filter(province => 
                province.name.toLowerCase().includes(provinceSearchQuery.toLowerCase())
            );
            setFilteredProvinces(filtered);
        }
    }, [provinceSearchQuery, provinces]);

    // Filter districts based on search query
    useEffect(() => {
        if (districts.length > 0) {
            const filtered = districts.filter(district => 
                district.name.toLowerCase().includes(districtSearchQuery.toLowerCase())
            );
            setFilteredDistricts(filtered);
        }
    }, [districtSearchQuery, districts]);

    // Filter wards based on search query
    useEffect(() => {
        if (wards.length > 0) {
            const filtered = wards.filter(ward => 
                ward.name.toLowerCase().includes(wardSearchQuery.toLowerCase())
            );
            setFilteredWards(filtered);
        }
    }, [wardSearchQuery, wards]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (provinceDropdownRef.current && !provinceDropdownRef.current.contains(event.target)) {
                setShowProvinceDropdown(false);
            }
            if (districtDropdownRef.current && !districtDropdownRef.current.contains(event.target)) {
                setShowDistrictDropdown(false);
            }
            if (wardDropdownRef.current && !wardDropdownRef.current.contains(event.target)) {
                setShowWardDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'provinceSearch') {
            setProvinceSearchQuery(value);
        } else if (name === 'districtSearch') {
            setDistrictSearchQuery(value);
        } else if (name === 'wardSearch') {
            setWardSearchQuery(value);
        } else if (Object.keys(addressInfo).includes(name)) {
            setAddressInfo({
                ...addressInfo,
                [name]: value
            });
        }
    };

    const selectProvince = (province) => {
        setSelectedProvince(province);
        setShowProvinceDropdown(false);
        setProvinceSearchQuery('');
        loadDistricts(province.code);
    };

    const selectDistrict = (district) => {
        setSelectedDistrict(district);
        setShowDistrictDropdown(false);
        setDistrictSearchQuery('');
        loadWards(district.code);
    };

    const selectWard = (ward) => {
        setSelectedWard(ward);
        setShowWardDropdown(false);
        setWardSearchQuery('');
    };

    const toggleProvinceDropdown = () => {
        // Close other dropdowns
        setShowDistrictDropdown(false);
        setShowWardDropdown(false);
        
        setShowProvinceDropdown(!showProvinceDropdown);
        if (!showProvinceDropdown) {
            setProvinceSearchQuery('');
        }
    };

    const toggleDistrictDropdown = () => {
        if (!selectedProvince) {
            alert('Vui lòng chọn tỉnh/thành phố trước');
            return;
        }
        
        // Close other dropdowns
        setShowProvinceDropdown(false);
        setShowWardDropdown(false);
        
        setShowDistrictDropdown(!showDistrictDropdown);
        if (!showDistrictDropdown) {
            setDistrictSearchQuery('');
        }
    };

    const toggleWardDropdown = () => {
        if (!selectedDistrict) {
            alert('Vui lòng chọn quận/huyện trước');
            return;
        }
        
        // Close other dropdowns
        setShowProvinceDropdown(false);
        setShowDistrictDropdown(false);
        
        setShowWardDropdown(!showWardDropdown);
        if (!showWardDropdown) {
            setWardSearchQuery('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!selectedProvince) {
            window.toast?.warning('Vui lòng chọn tỉnh/thành phố');
            return;
        }
        
        if (!selectedDistrict) {
            window.toast?.warning('Vui lòng chọn quận/huyện');
            return;
        }
        
        if (!addressInfo.streetAddress.trim()) {
            window.toast?.warning('Vui lòng nhập địa chỉ cụ thể');
            return;
        }
        
        try {
            setSaving(true);
            setError(null);
            
            const addressData = {
                country: VIETNAM_COUNTRY.name,
                countryCode: VIETNAM_COUNTRY.alpha2Code,
                province: selectedProvince.name,
                provinceCode: selectedProvince.code,
                district: selectedDistrict.name,
                districtCode: selectedDistrict.code,
                ward: selectedWard?.name || '',
                wardCode: selectedWard?.code || '',
                streetAddress: addressInfo.streetAddress.trim(),
                zipCode: addressInfo.zipCode.trim(),
                isDefault: addresses.length === 0 // First address is default
            };
            
            if (editingAddress) {
                // Update existing address
                await ctxUpdateAddress(editingAddress._id || editingAddress.id, addressData);
                window.toast?.success('Địa chỉ đã được cập nhật thành công!');
            } else {
                // Add new address
                await ctxAddAddress(addressData);
                window.toast?.success('Địa chỉ đã được thêm thành công!');
            }
            
            // Reset form
            setAddressInfo({
                streetAddress: '',
                zipCode: '',
            });
            setSelectedProvince(null);
            setSelectedDistrict(null);
            setSelectedWard(null);
            setDistricts([]);
            setWards([]);
            setEditingAddress(null);
            setShowAddForm(false);
            
        } catch (err) {
            console.error('Error saving address:', err);
            setError(err.message || 'Không thể lưu địa chỉ');
        } finally {
            setSaving(false);
        }
    };

    // Handle edit address
    const handleEditAddress = async (address) => {
        setEditingAddress(address);
        setShowAddForm(true);
        
        // Set address info
        setAddressInfo({
            streetAddress: address.streetAddress || address.street || '',
            zipCode: address.zipCode || '',
        });
        
        // Xử lý cấu trúc địa chỉ mới (Việt Nam)
        if (address.provinceCode && address.districtCode) {
            // Find and set province
            const province = provinces.find(p => p.code === address.provinceCode);
            if (province) {
                setSelectedProvince(province);
                await loadDistricts(province.code);
                
                // Find and set district after districts are loaded
                setTimeout(async () => {
                    const districtsData = await vietnamLocationService.getDistricts(province.code);
                    const district = districtsData.find(d => d.code === address.districtCode);
                    if (district) {
                        setSelectedDistrict(district);
                        await loadWards(district.code);
                        
                        // Find and set ward after wards are loaded
                        if (address.wardCode) {
                            setTimeout(async () => {
                                const wardsData = await vietnamLocationService.getWards(district.code);
                                const ward = wardsData.find(w => w.code === address.wardCode);
                                if (ward) {
                                    setSelectedWard(ward);
                                }
                            }, 200);
                        }
                    }
                }, 200);
            }
        } else {
            // Xử lý cấu trúc cũ - tìm kiếm theo tên
            if (address.city || address.province) {
                const provinceName = address.province || address.city;
                const province = provinces.find(p => 
                    p.name.toLowerCase().includes(provinceName.toLowerCase()) ||
                    provinceName.toLowerCase().includes(p.name.toLowerCase())
                );
                if (province) {
                    setSelectedProvince(province);
                    await loadDistricts(province.code);
                    
                    if (address.district) {
                        setTimeout(async () => {
                            const districtsData = await vietnamLocationService.getDistricts(province.code);
                            const district = districtsData.find(d => 
                                d.name.toLowerCase().includes(address.district.toLowerCase()) ||
                                address.district.toLowerCase().includes(d.name.toLowerCase())
                            );
                            if (district) {
                                setSelectedDistrict(district);
                                await loadWards(district.code);
                            }
                        }, 200);
                    }
                }
            }
        }
    };

    // Handle delete address
    const handleDeleteAddress = async (addressId) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa địa chỉ này?')) {
            return;
        }
        
        try {
            await ctxDeleteAddress(addressId);
            window.toast?.success('Địa chỉ đã được xóa thành công!');
        } catch (err) {
            console.error('Error deleting address:', err);
            window.toast?.error('Không thể xóa địa chỉ');
        }
    };

    // Handle set default address
    const handleSetDefaultAddress = async (addressId) => {
        try {
            await ctxSetDefault(addressId);
            window.toast?.success('Đã đặt làm địa chỉ mặc định!');
        } catch (err) {
            console.error('Error setting default address:', err);
            window.toast?.error('Không thể đặt làm địa chỉ mặc định');
        }
    };

    // Handle cancel edit
    const handleCancelEdit = () => {
        setEditingAddress(null);
        setShowAddForm(false);
        setAddressInfo({
            streetAddress: '',
            zipCode: '',
        });
        setSelectedProvince(null);
        setSelectedDistrict(null);
        setSelectedWard(null);
        setDistricts([]);
        setWards([]);
    };

    // Render loading state
    if (loading) {
        return (
            <div className="personal-address-container">
                <h2 className="personal-address-title">Địa chỉ giao hàng</h2>
                <div className="personal-address-loading">
                    <div className="loading-spinner"></div>
                    <p>Đang tải danh sách địa chỉ...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="personal-address-container">
            <div className="personal-address-header">
                <h2 className="personal-address-title">Địa chỉ giao hàng</h2>
                <button 
                    className="personal-address-add-btn"
                    onClick={() => setShowAddForm(true)}
                >
                    Thêm địa chỉ mới
                </button>
            </div>

            {error && (
                <div className="personal-address-error">
                    <p className="error-message">{error}</p>
                </div>
            )}

            {/* Existing Addresses List */}
            {addresses.length > 0 && (
                <div className="personal-address-list">
                    <h3>Địa chỉ đã lưu</h3>
                    {addresses.map((address) => (
                        <div key={address._id || address.id} className="personal-address-item">
                            <div className="personal-address-item-content">
                                <div className="personal-address-item-header">
                                    <span className="personal-address-item-name">
                                        {address.streetAddress || address.street || 'Địa chỉ'}
                                    </span>
                                    {address.isDefault && (
                                        <span className="personal-address-default-badge">Mặc định</span>
                                    )}
                                </div>
                                <div className="personal-address-item-details">
                                    <p>
                                        {address.ward && `${address.ward}, `}
                                        {address.district && `${address.district}, `}
                                        {address.province || address.city}
                                    </p>
                                    <p>{address.country} {address.zipCode && `- ${address.zipCode}`}</p>
                                </div>
                            </div>
                            <div className="personal-address-item-actions">
                                <button 
                                    className="personal-address-edit-btn"
                                    onClick={() => handleEditAddress(address)}
                                >
                                    Sửa
                                </button>
                                {!address.isDefault && (
                                    <button 
                                        className="personal-address-default-btn"
                                        onClick={() => handleSetDefaultAddress(address._id || address.id)}
                                    >
                                        Đặt mặc định
                                    </button>
                                )}
                                <button 
                                    className="personal-address-delete-btn"
                                    onClick={() => handleDeleteAddress(address._id || address.id)}
                                >
                                    Xóa
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Address Form */}
            {showAddForm && (
                <div className="personal-address-form-container">
                    <h3>{editingAddress ? 'Sửa địa chỉ' : 'Thêm địa chỉ mới'}</h3>
                    <form onSubmit={handleSubmit} className="personal-address-form">
                        {/* Country - Fixed to Vietnam */}
                        <div className="personal-address-field">
                            <label className="personal-address-label">Quốc Gia</label>
                            <div className="personal-address-country-fixed">
                                <span className="personal-address-country-name">🇻🇳 Việt Nam</span>
                            </div>
                        </div>

                        {/* Province Selection */}
                        <div className="personal-address-field">
                            <label className="personal-address-label">Tỉnh/Thành phố *</label>
                            <div className="personal-address-dropdown" ref={provinceDropdownRef}>
                                <div 
                                    className="personal-address-dropdown-selected" 
                                    onClick={toggleProvinceDropdown}
                                >
                                    {selectedProvince ? (
                                        <span>{selectedProvince.name}</span>
                                    ) : (
                                        <span className="personal-address-placeholder">Chọn tỉnh/thành phố</span>
                                    )}
                                    <span className={`personal-address-dropdown-arrow ${showProvinceDropdown ? 'open' : ''}`}></span>
                                </div>                       
                                {showProvinceDropdown && (
                                    <div className="personal-address-dropdown-content">
                                        <div className="personal-address-search-container">
                                            <input
                                                type="text"
                                                name="provinceSearch"
                                                placeholder="Tìm kiếm tỉnh/thành phố..."
                                                value={provinceSearchQuery}
                                                onChange={handleInputChange}
                                                className="personal-address-search-input"
                                            />
                                        </div>
                                        <div className="personal-address-dropdown-list">
                                            {filteredProvinces.length > 0 ? (
                                                filteredProvinces.map((province) => (
                                                    <div
                                                        key={province.code}
                                                        className="personal-address-dropdown-item"
                                                        onClick={() => selectProvince(province)}
                                                    >
                                                        <span>{province.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="personal-address-no-results">Không tìm thấy tỉnh/thành phố</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* District Selection */}
                        <div className="personal-address-field">
                            <label className="personal-address-label">Quận/Huyện *</label>
                            <div className="personal-address-dropdown" ref={districtDropdownRef}>
                                <div 
                                    className={`personal-address-dropdown-selected ${!selectedProvince ? 'disabled' : ''}`}
                                    onClick={toggleDistrictDropdown}
                                >
                                    {selectedDistrict ? (
                                        <span>{selectedDistrict.name}</span>
                                    ) : (
                                        <span className="personal-address-placeholder">
                                            {selectedProvince ? 'Chọn quận/huyện' : 'Chọn tỉnh/thành phố trước'}
                                        </span>
                                    )}
                                    <span className={`personal-address-dropdown-arrow ${showDistrictDropdown ? 'open' : ''}`}></span>
                                </div>                       
                                {showDistrictDropdown && selectedProvince && (
                                    <div className="personal-address-dropdown-content">
                                        <div className="personal-address-search-container">
                                            <input
                                                type="text"
                                                name="districtSearch"
                                                placeholder="Tìm kiếm quận/huyện..."
                                                value={districtSearchQuery}
                                                onChange={handleInputChange}
                                                className="personal-address-search-input"
                                            />
                                        </div>
                                        <div className="personal-address-dropdown-list">
                                            {filteredDistricts.length > 0 ? (
                                                filteredDistricts.map((district) => (
                                                    <div
                                                        key={district.code}
                                                        className="personal-address-dropdown-item"
                                                        onClick={() => selectDistrict(district)}
                                                    >
                                                        <span>{district.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="personal-address-no-results">Không tìm thấy quận/huyện</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ward Selection */}
                        <div className="personal-address-field">
                            <label className="personal-address-label">Phường/Xã</label>
                            <div className="personal-address-dropdown" ref={wardDropdownRef}>
                                <div 
                                    className={`personal-address-dropdown-selected ${!selectedDistrict ? 'disabled' : ''}`}
                                    onClick={toggleWardDropdown}
                                >
                                    {selectedWard ? (
                                        <span>{selectedWard.name}</span>
                                    ) : (
                                        <span className="personal-address-placeholder">
                                            {selectedDistrict ? 'Chọn phường/xã (tùy chọn)' : 'Chọn quận/huyện trước'}
                                        </span>
                                    )}
                                    <span className={`personal-address-dropdown-arrow ${showWardDropdown ? 'open' : ''}`}></span>
                                </div>                       
                                {showWardDropdown && selectedDistrict && (
                                    <div className="personal-address-dropdown-content">
                                        <div className="personal-address-search-container">
                                            <input
                                                type="text"
                                                name="wardSearch"
                                                placeholder="Tìm kiếm phường/xã..."
                                                value={wardSearchQuery}
                                                onChange={handleInputChange}
                                                className="personal-address-search-input"
                                            />
                                        </div>
                                        <div className="personal-address-dropdown-list">
                                            {filteredWards.length > 0 ? (
                                                filteredWards.map((ward) => (
                                                    <div
                                                        key={ward.code}
                                                        className="personal-address-dropdown-item"
                                                        onClick={() => selectWard(ward)}
                                                    >
                                                        <span>{ward.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="personal-address-no-results">Không tìm thấy phường/xã</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Street Address */}
                        <div className="personal-address-field">
                            <InputField
                                label="Địa chỉ cụ thể (Số nhà, Đường) *"
                                type="text"
                                name="streetAddress"
                                value={addressInfo.streetAddress}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 123 Đường Lê Lợi"
                                labelClassName="personal-address-label"
                                className="personal-address-input"
                                required
                            />
                        </div>

                        {/* Zip Code */}
                        <div className="personal-address-field">
                            <InputField
                                label="Mã bưu điện"
                                type="text"
                                name="zipCode"
                                value={addressInfo.zipCode}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 700000"
                                labelClassName="personal-address-label"
                                className="personal-address-input"
                            />
                        </div>

                        <div className="personal-address-form-actions">
                            <button 
                                type="button" 
                                className="personal-address-cancel-btn"
                                onClick={handleCancelEdit}
                            >
                                Hủy
                            </button>
                            <button 
                                type="submit" 
                                className={`personal-address-save-btn ${saving ? 'loading' : ''}`}
                                disabled={saving}
                            >
                                {saving ? 'Đang lưu...' : (editingAddress ? 'Cập nhật' : 'Thêm địa chỉ')}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Empty state */}
            {addresses.length === 0 && !showAddForm && (
                <div className="personal-address-empty">
                    <p>Bạn chưa có địa chỉ giao hàng nào</p>
                    <button 
                        className="personal-address-add-first-btn"
                        onClick={() => setShowAddForm(true)}
                    >
                        Thêm địa chỉ đầu tiên
                    </button>
                </div>
            )}
        </div>
    );
};
export default PersonalAddress;