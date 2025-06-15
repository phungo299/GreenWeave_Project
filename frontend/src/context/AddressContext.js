import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import personalService from "../services/personalService";
import { useAuth } from "./AuthContext";

// Address context for sharing user addresses across pages
const AddressContext = createContext({
  addresses: [],
  loading: false,
  fetchAddresses: () => {},
  addAddress: async () => {},
  updateAddress: async () => {},
  deleteAddress: async () => {},
  setDefaultAddress: async () => {}
});

export const AddressProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);

  // --- API helpers ---
  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const res = await personalService.getAddresses();
      if (res?.data) setAddresses(res.data);
    } catch (err) {
      console.error("fetchAddresses error", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const addAddress = async (addressData) => {
    const res = await personalService.addAddress(addressData);
    if (res?.data) setAddresses((prev) => [...prev, res.data]);
    return res;
  };

  const updateAddress = async (id, data) => {
    const res = await personalService.updateAddress(id, data);
    if (res?.data) {
      setAddresses((prev) => prev.map((a) => ((a._id || a.id) === id ? res.data : a)));
    }
    return res;
  };

  const deleteAddress = async (id) => {
    // Optimistic update
    setAddresses((prev) => prev.filter((a) => (a._id || a.id) !== id));
    try {
      await personalService.deleteAddress(id);
    } catch (err) {
      console.error("deleteAddress error", err);
      // rollback
      await fetchAddresses();
    }
  };

  const setDefaultAddress = async (id) => {
    const res = await personalService.setDefaultAddress(id);
    if (res?.data) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: (a._id || a.id) === id }))
      );
    }
    return res;
  };

  // Fetch when auth ready
  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const value = {
    addresses,
    loading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
  };

  return (
    <AddressContext.Provider value={value}>{children}</AddressContext.Provider>
  );
};

export const useAddresses = () => useContext(AddressContext); 