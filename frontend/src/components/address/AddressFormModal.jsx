import React, { useState, useEffect } from "react";
import vietnamLocationService from "../../services/vietnamLocationService";
import { useAddresses } from "../../context/AddressContext";
import "../../assets/css/AddressFormModal.css";

const AddressFormModal = ({ onClose }) => {
  const { addAddress: ctxAddAddress, addresses } = useAddresses();

  const VIETNAM = { country: "Việt Nam", countryCode: "VN" };
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [street, setStreet] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [saving, setSaving] = useState(false);

  // load provinces once
  useEffect(() => {
    const load = async () => {
      const p = await vietnamLocationService.getProvinces();
      setProvinces(p);
    };
    load();
  }, []);

  const loadDistricts = async (code) => {
    const data = await vietnamLocationService.getDistricts(code);
    setDistricts(data);
  };
  const loadWards = async (code) => {
    const data = await vietnamLocationService.getWards(code);
    setWards(data);
  };

  const handleSave = async () => {
    if (!selectedProvince || !selectedDistrict || !street.trim()) {
      alert("Vui lòng nhập đầy đủ địa chỉ");
      return;
    }
    const payload = {
      ...VIETNAM,
      province: selectedProvince.name,
      provinceCode: selectedProvince.code,
      district: selectedDistrict.name,
      districtCode: selectedDistrict.code,
      ward: selectedWard?.name || "",
      wardCode: selectedWard?.code || "",
      streetAddress: street.trim(),
      zipCode: zipCode.trim(),
      isDefault: addresses.length === 0
    };
    try {
      setSaving(true);
      const res = await ctxAddAddress(payload);
      if (res?.success !== false) {
        onClose(true, res.data); // success
      }
    } catch (err) {
      console.error(err);
      alert("Không thể lưu địa chỉ");
    } finally {
      setSaving(false);
    }
  };

  // simple modal overlay
  return (
    <div className="modal-overlay">
      <div className="modal-content address-form-modal">
        <h3>Thêm địa chỉ mới</h3>
        <div className="field-group">
          <label>Tỉnh/Thành phố *</label>
          <select
            value={selectedProvince?.code || ""}
            onChange={(e) => {
              const p = provinces.find((p) => p.code === Number(e.target.value));
              setSelectedProvince(p);
              setSelectedDistrict(null);
              setSelectedWard(null);
              setDistricts([]);
              setWards([]);
              if (p) loadDistricts(p.code);
            }}
          >
            <option value="">Chọn tỉnh/thành phố</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>Quận/Huyện *</label>
          <select
            value={selectedDistrict?.code || ""}
            onChange={(e) => {
              const d = districts.find((d) => d.code === Number(e.target.value));
              setSelectedDistrict(d);
              setSelectedWard(null);
              setWards([]);
              if (d) loadWards(d.code);
            }}
            disabled={!selectedProvince}
          >
            <option value="">{selectedProvince ? "Chọn quận/huyện" : "Chọn tỉnh trước"}</option>
            {districts.map((d) => (
              <option key={d.code} value={d.code}>{d.name}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>Phường/Xã</label>
          <select
            value={selectedWard?.code || ""}
            onChange={(e) => {
              const w = wards.find((w) => w.code === Number(e.target.value));
              setSelectedWard(w);
            }}
            disabled={!selectedDistrict}
          >
            <option value="">{selectedDistrict ? "Chọn phường/xã" : "Chọn quận trước"}</option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>{w.name}</option>
            ))}
          </select>
        </div>
        <div className="field-group">
          <label>Địa chỉ cụ thể *</label>
          <input value={street} onChange={(e)=>setStreet(e.target.value)} placeholder="Số nhà, tên đường" />
        </div>
        <div className="field-group">
          <label>Mã bưu điện</label>
          <input value={zipCode} onChange={(e)=>setZipCode(e.target.value)} />
        </div>
        <div className="modal-actions">
          <button onClick={()=>onClose(false)}>Hủy</button>
          <button onClick={handleSave} disabled={saving}>{saving?"Đang lưu":"Thêm địa chỉ"}</button>
        </div>
      </div>
    </div>
  );
};

export default AddressFormModal; 