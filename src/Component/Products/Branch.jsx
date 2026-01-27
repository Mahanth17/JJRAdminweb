import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, MapPin, Code, DollarSign, Archive, CheckCircle, 
  X, Power, Package, ArrowLeft, Building2, TrendingUp, Search 
} from 'lucide-react';
import axios from 'axios';
import { rootApi, categoryApi } from '../../../axiosInstance';

const API_BASE_URL = 'http://192.168.0.110:8082';

// --- Success Modal Component (Shared) ---
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 animate-in fade-in zoom-in duration-200">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

// --- Branch Form Modal Component ---
const BranchFormModal = ({ isOpen, onClose, onSave, branchToEdit, triggerSuccess }) => {
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    location: '',
    latitude: '',
    longitude: '',
    chargePerKm: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingLocation, setFetchingLocation] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (branchToEdit) {
        setFormData({
          branchName: branchToEdit.branchName || '',
          branchCode: branchToEdit.branchCode || '',
          location: branchToEdit.location || '',
          latitude: branchToEdit.latitude || '',
          longitude: branchToEdit.longitude || '',
          chargePerKm: branchToEdit.chargePerKm || '',
        });
      } else {
        setFormData({
          branchName: '',
          branchCode: '',
          location: '',
          latitude: '',
          longitude: '',
          chargePerKm: '',
        });
      }
      setErrors({});
    }
  }, [isOpen, branchToEdit]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const fetchCurrentLocation = () => {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser');
    return;
  }

  setFetchingLocation(true);

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;
      
      // Set latitude and longitude immediately
      setFormData(prev => ({
        ...prev,
        latitude: latitude.toFixed(6),
        longitude: longitude.toFixed(6)
      }));

      // Fetch address using reverse geocoding
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.address) {
          const address = data.address;
          
          // Build formatted address from specific components
          const addressParts = [];
          
          if (address.road) addressParts.push(address.road);
          if (address.neighbourhood) addressParts.push(address.neighbourhood);
          if (address.suburb) addressParts.push(address.suburb);
          if (address.city_district) addressParts.push(address.city_district);
          if (address.city) addressParts.push(address.city);
          if (address.postcode) addressParts.push(address.postcode);
          if (address.country) addressParts.push(address.country);
          
          const formattedLocation = addressParts.join(', ');
          
          setFormData(prev => ({
            ...prev,
            location: formattedLocation || data.display_name,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
        } else {
          // Fallback to display_name if address details not available
          setFormData(prev => ({
            ...prev,
            location: data.display_name || '',
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6)
          }));
        }
      } catch (error) {
        console.error('Error fetching address:', error);
        // Even if address fetch fails, we still have lat/long
        alert('Location coordinates fetched, but unable to get address. Please enter manually.');
      } finally {
        setFetchingLocation(false);
      }
    },
    (error) => {
      setFetchingLocation(false);
      let errorMessage = 'Unable to retrieve your location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location permission denied. Please enable location access in your browser.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      alert(errorMessage);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  );
};

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.branchName.trim()) {
      newErrors.branchName = "Branch Name is required";
      isValid = false;
    } else if (formData.branchName.trim().length < 3) {
      newErrors.branchName = "Branch Name must be at least 3 characters";
      isValid = false;
    }

    // Skip branchCode validation when editing (since it's disabled and can't be changed)
    if (!branchToEdit) {
      if (!formData.branchCode.trim()) {
        newErrors.branchCode = "Branch Code is required";
        isValid = false;
      } else if (!/^[A-Z0-9]+$/.test(formData.branchCode.trim())) {
        newErrors.branchCode = "Branch Code must contain only uppercase letters and numbers";
        isValid = false;
      }
    }

    if (!formData.location.trim()) {
      newErrors.location = "Location is required";
      isValid = false;
    }

    if (!formData.latitude || isNaN(formData.latitude)) {
      newErrors.latitude = "Valid Latitude is required";
      isValid = false;
    } else if (parseFloat(formData.latitude) < -90 || parseFloat(formData.latitude) > 90) {
      newErrors.latitude = "Latitude must be between -90 and 90";
      isValid = false;
    }

    if (!formData.longitude || isNaN(formData.longitude)) {
      newErrors.longitude = "Valid Longitude is required";
      isValid = false;
    } else if (parseFloat(formData.longitude) < -180 || parseFloat(formData.longitude) > 180) {
      newErrors.longitude = "Longitude must be between -180 and 180";
      isValid = false;
    }

    if (!formData.chargePerKm || parseFloat(formData.chargePerKm) <= 0) {
      newErrors.chargePerKm = "Valid Charge Per KM is required";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        branchName: formData.branchName.trim(),
        branchCode: formData.branchCode.trim().toUpperCase(),
        location: formData.location.trim(),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        chargePerKm: parseFloat(formData.chargePerKm),
      };

      if (branchToEdit) {
        await rootApi.put(`/api/admin/branches/${branchToEdit.id}`, payload);
        triggerSuccess('Branch Updated Successfully');
      } else {
        await rootApi.post(`/api/admin/branches`, payload);
        triggerSuccess('Branch Created Successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving branch:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save branch';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">
            {branchToEdit ? 'Edit Branch' : 'New Branch'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Branch Name & Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.branchName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'
                  }`}
                />
                {errors.branchName && <p className="text-xs text-red-500 mt-1">{errors.branchName}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Branch Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  placeholder="e.g. MIY001"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition uppercase ${
                    errors.branchCode ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'
                  }`}
                  disabled={!!branchToEdit}
                />
                {errors.branchCode && <p className="text-xs text-red-500 mt-1">{errors.branchCode}</p>}
              </div>
            </div>

            {/* Location with Fetch Current Location Button */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  className={`flex-1 p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.location ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={fetchCurrentLocation}
                  disabled={fetchingLocation}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {fetchingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Fetching...</span>
                    </>
                  ) : (
                    <>
                      <MapPin size={18} />
                      <span>Get Current Location</span>
                    </>
                  )}
                </button>
              </div>
              {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
            </div>

            {/* Latitude & Longitude */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  step="0.000001"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.latitude ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'
                  }`}
                />
                {errors.latitude && <p className="text-xs text-red-500 mt-1">{errors.latitude}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleInputChange}
                  placeholder="0.0"
                  step="0.000001"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.longitude ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'
                  }`}
                />
                {errors.longitude && <p className="text-xs text-red-500 mt-1">{errors.longitude}</p>}
              </div>
            </div>

            {/* Charge Per KM */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Charge Per KM (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="chargePerKm"
                value={formData.chargePerKm}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.chargePerKm ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'
                }`}
              />
              {errors.chargePerKm && <p className="text-xs text-red-500 mt-1">{errors.chargePerKm}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (branchToEdit ? 'Update Branch' : 'Create Branch')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Inventory Form Modal Component ---
const InventoryFormModal = ({ isOpen, onClose, onSave, triggerSuccess, preSelectedBranchId, preSelectedBranchName }) => {
  const [formData, setFormData] = useState({
    productId: '',
    branchId: preSelectedBranchId || '',
    stock: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      // Only fetch branches if we haven't locked to one branch
      if (!preSelectedBranchId) {
        fetchBranches();
      }
      setFormData({
        productId: '',
        branchId: preSelectedBranchId || '',
        stock: '',
      });
      setErrors({});
    }
  }, [isOpen, preSelectedBranchId]);

const fetchProducts = async (page = 1, size = 100000) => {
  try {
    const response = await categoryApi.get(`/api/products/activeProd?page=${page - 1}&size=${size}`);
    setProducts(response.data?.content || []);
    // Optionally, handle total pages/count if your API returns them
    // setProductTotalPages(response.data.totalPages || 1);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchBranches = async (page = 1, size = 100000) => {
  try {
    const response = await rootApi.get(`/api/admin/branches?page=${page - 1}&size=${size}`);
    const availableBranches = (response.data?.content || []).filter(branch =>
      !branch.hasOwnProperty('status') || branch.status !== false
    );
    setBranches(availableBranches);
    // Optionally, handle total pages/count if your API returns them
    // setBranchTotalPages(response.data.totalPages || 1);
  } catch (error) {
    console.error('Error fetching branches:', error);
  }
};

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.productId) newErrors.productId = 'Please select a product';
    if (!formData.branchId) newErrors.branchId = 'Please select a branch';
    if (!formData.stock) {
      newErrors.stock = 'Stock is required';
    } else if (isNaN(formData.stock) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a positive number';
    } else if (!Number.isInteger(Number(formData.stock))) {
      newErrors.stock = 'Stock must be a whole number';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        productId: Number(formData.productId),
        branchId: Number(formData.branchId),
        stock: Number(formData.stock),
      };

      await rootApi.post(`/api/admin/inventory`, payload);
      triggerSuccess('Inventory added successfully!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error adding inventory:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add inventory.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800">Add Inventory</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Branch Selection - Read Only if preSelected */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              {preSelectedBranchId ? (
                <div className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 font-medium">
                  {preSelectedBranchName}
                  <input type="hidden" name="branchId" value={preSelectedBranchId} />
                </div>
              ) : (
                <select
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                    errors.branchId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                  }`}
                >
                  <option value="">Select a branch</option>
                  {branches.map(branch => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName} ({branch.branchCode})
                    </option>
                  ))}
                </select>
              )}
              {errors.branchId && <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>}
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.productId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                }`}
              >
                <option value="">Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.productName} - {product.brand}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-xs text-red-500 mt-1">{errors.productId}</p>}
            </div>

            {/* Stock Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Enter stock amount"
                min="0"
                step="1"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.stock ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Adding...' : 'Add Stock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Deactivate Confirmation Modal ---
const DeactivateModal = ({ isOpen, onClose, onConfirm, branch, isActivating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center animate-in fade-in zoom-in duration-200">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {isActivating ? 'Activate Branch?' : 'Deactivate Branch?'}
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {isActivating ? 'activate' : 'deactivate'} "<strong>{branch?.branchName}</strong>"?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg font-bold transition shadow-lg ${
              isActivating
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Yes, {isActivating ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Branch Component ---
export default function Branch() {
  const [branches, setBranches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, branch: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [allBranches, setAllBranches] = useState({ active: 0, inactive: 0 });


  const rowsPerPageOptions = [10, 20, 50, 100];

// Branches
  const [branchPage, setBranchPage] = useState(1);
  const [branchPageSize, setBranchPageSize] = useState(rowsPerPageOptions[rowsPerPageOptions.length - 1]);
  const [branchTotalPages, setBranchTotalPages] = useState(1);
  
  // Inventory Integration States
  const [view, setView] = useState('BRANCHES'); // 'BRANCHES' or 'INVENTORY'
  const [selectedBranchForInventory, setSelectedBranchForInventory] = useState(null);
  const [branchInventory, setBranchInventory] = useState([]);
  const [productsMap, setProductsMap] = useState({});
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);


  const [inventoryPage, setInventoryPage] = useState(1);
  const [inventoryPageSize, setInventoryPageSize] = useState(rowsPerPageOptions[rowsPerPageOptions.length - 1]);
  const [inventoryTotalPages, setInventoryTotalPages] = useState(1);

useEffect(() => {
  fetchBranches(branchPage, branchPageSize);
  fetchProductsMap();
  // eslint-disable-next-line
}, [showInactive, branchPage, branchPageSize]);

  // Fetch Inventory when a branch is selected
useEffect(() => {
  if (view === 'INVENTORY' && selectedBranchForInventory)
    fetchInventoryForBranch(selectedBranchForInventory.id, inventoryPage, inventoryPageSize);
  // eslint-disable-next-line
}, [view, selectedBranchForInventory, inventoryPage, inventoryPageSize]);
useEffect(() => { setBranchPage(1); }, [showInactive, branchPageSize]);
useEffect(() => { setInventoryPage(1); }, [inventoryPageSize, selectedBranchForInventory]);

const fetchBranches = async (pageNumber = 1, size = branchPageSize) => {
  try {
    setLoading(true);
    const response = await rootApi.get(`/api/admin/branches?page=${pageNumber - 1}&size=${size}`);
    const data = response.data;
    let newBranches = data.content || [];
    newBranches = newBranches.sort((a, b) => a.id - b.id);
    const filtered = showInactive
      ? newBranches.filter(branch => !branch.active)
      : newBranches.filter(branch => branch.active);
    setBranches(filtered);
    setAllBranches({
      active: data.content.filter(b => b.active).length,
      inactive: data.content.filter(b => !b.active).length,
    });
    setBranchTotalPages(data.totalPages || 1);
    setBranchPage(pageNumber);
  } catch (error) {
    setBranches([]);
    setBranchTotalPages(1);
    setBranchPage(1);
    console.error('Error fetching branches:', error);
    alert('Failed to load branches');
  } finally {
    setLoading(false);
  }
};
  // --- Inventory Logic ---
const fetchProductsMap = async (page = 1, size = 100000) => {
  try {
    const response = await categoryApi.get(`/api/products/activeProd?page=${page - 1}&size=${size}`);
    const map = {};
    (response.data?.content || []).forEach(p => map[p.id] = p);
    setProductsMap(map);
  } catch (error) {
    console.error('Error fetching products map:', error);
  }
};

const fetchInventoryForBranch = async (branchId, pageNumber = 1, size = inventoryPageSize) => {
  try {
    setInventoryLoading(true);
    const response = await rootApi.get(`/api/admin/inventory/branch/${branchId}?page=${pageNumber - 1}&size=${size}`);
    let inventory = response.data.content || [];
    inventory = inventory.sort((a, b) => a.inventoryId - b.inventoryId);
    setBranchInventory(inventory);
    setInventoryTotalPages(response.data.totalPages || 1);
    setInventoryPage(pageNumber);
  } catch (error) {
    setBranchInventory([]);
    setInventoryTotalPages(1);
    setInventoryPage(1);
    console.error('Error fetching branch inventory:', error);
  } finally {
    setInventoryLoading(false);
  }
};

 const handleOpenInventory = (branch) => {
  setSelectedBranchForInventory(branch);
  setBranchInventory([]); // Clear previous inventory
  setInventoryPage(1);
  setView('INVENTORY');
  fetchInventoryForBranch(branch.id, 1); // Fetch first page immediately
};

  const handleBackToBranches = () => {
    setView('BRANCHES');
    setSelectedBranchForInventory(null);
    setBranchInventory([]);
  };

  // --- Handlers ---
  const handleAddNewClick = () => {
    setEditingBranch(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (branch) => {
    setEditingBranch(branch);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (branch) => {
    setDeactivateModal({ isOpen: true, branch });
  };

  const showSuccessMessage = (msg) => {
    setSuccessModal({ isOpen: true, message: msg });
  };

const confirmToggleStatus = async () => {
  const branch = deactivateModal.branch;
  if (!branch) return;
  try {
    // Toggle the status: if currently active, deactivate (false), otherwise activate (true)
    const newStatus = !branch.active;
    
    // Use PUT instead of PATCH for the status endpoint with query parameter
    await rootApi.put(`/api/admin/branches/${branch.id}/status?active=${newStatus}`);
    
    setDeactivateModal({ isOpen: false, branch: null });
     setBranchPage(1);
  fetchBranches(branchPage, branchPageSize);
    
    // Show appropriate success message based on new status
    showSuccessMessage(newStatus ? 'Branch Activated Successfully' : 'Branch Deactivated Successfully');
  } catch (error) {
    console.error('Error toggling branch status:', error);
    const errorMessage = error.response?.data?.message || 'Failed to update branch status';
    alert(errorMessage);
  }
};

  const getProductDetails = (productId) => productsMap[productId] || { productName: 'Unknown Product', brand: '' };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-emerald-50/60 p-4 md:p-8 font-sans transition-colors duration-500">
      <div className="max-w-8xl mx-auto">
        {/* VIEW: BRANCH LIST */}
        {view === 'BRANCHES' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <> 
            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Branches</h1>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setShowInactive(!showInactive)}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold border ${
                    showInactive ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  <Archive size={18} />
                  <span>{showInactive ? 'Active Branches' : 'Inactive Branches'}</span>
                  <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${showInactive ? 'bg-white/20 text-white' : 'bg-gray-600 text-white'}`}>
                    {showInactive ? allBranches.active : allBranches.inactive}
                  </span>
                </button>
                <button
                  onClick={handleAddNewClick}
                  className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full shadow-md hover:bg-gray-800 transition-all text-sm font-bold"
                >
                  <Plus size={20} /> Add Branch
                </button>
              </div>
            </header>

            {loading && (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
              </div>
            )}

            {!loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {branches.map((branch) => (
                  <div key={branch.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative">
                    {!branch.active && (
                      <div className="absolute inset-0 z-40 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center">
                        <span className="text-gray-800 font-extrabold text-2xl tracking-widest drop-shadow-sm opacity-80">DEACTIVATED</span>
                        <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(branch); }} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-300 rounded-full shadow-sm hover:bg-white text-xs font-semibold text-gray-600 transition">
                          <Power size={14} className="text-green-600" /> Click to Activate
                        </button>
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 p-6 relative">
                      <div className="absolute top-3 right-3">
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${branch.active ? 'bg-white/20 text-white' : 'bg-red-500/80 text-white'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${branch.active ? 'bg-white' : 'bg-red-200'}`}></span>
                          {branch.active ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      <div className="text-white">
                        <h3 className="text-xl font-bold mb-1">{branch.branchName}</h3>
                        <div className="flex items-center gap-2 text-sm opacity-90">
                          <Code size={14} /> <span className="font-mono">{branch.branchCode}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col flex-grow p-5 bg-white">
                      <div className="mb-4">
                        <div className="flex items-start gap-2 text-gray-600">
                          <MapPin size={16} className="mt-1 text-emerald-600 flex-shrink-0" />
                          <span className="text-sm font-medium">{branch.location}</span>
                        </div>
                      </div>
                      <div className="space-y-3 bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                        <div className="flex justify-between items-center text-sm">
                           <span className="text-xs uppercase text-gray-400 font-bold tracking-wider">Coordinates</span>
                           <span className="font-mono text-gray-600">{branch.latitude}, {branch.longitude}</span>
                        </div>
                        <div className="flex justify-between items-center border-t border-gray-200 pt-2">
                          <span className="text-xs uppercase text-gray-400 font-bold tracking-wider flex items-center gap-1"><DollarSign size={12} /> Charge/KM</span>
                          <span className="text-sm font-bold text-emerald-700">₹{branch.chargePerKm}</span>
                        </div>
                      </div>
                      
                      {/* ACTION BUTTONS */}
                      <div className="mt-auto space-y-3">
                        {/* Manage Inventory Button - Primary Action for Branch */}
                        <button
                          onClick={() => handleOpenInventory(branch)}
                          className="w-full bg-green-600 hover:bg-green-500 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-all shadow-sm hover:shadow flex items-center justify-center gap-2"
                        >
                          <Package size={18} /> Manage Inventory
                        </button>
                        
                        <div className="flex items-center gap-3">
                          <button onClick={() => handleEditClick(branch)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2">
                            <Edit2 size={14} /> Edit Branch
                          </button>
                          <button onClick={() => handleToggleStatus(branch)} className={`px-4 py-2 rounded-lg border transition-all font-semibold text-sm flex items-center justify-center gap-2 ${branch.active ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'}`}>
                            {branch.active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && branches.length === 0 && (
              <div className="text-center py-20 text-gray-500">
                {showInactive ? 'No inactive branches found.' : 'No branches found. Click "Add Branch" to create one.'}
              </div>
            )}
           </>
           <div className="flex justify-center items-center gap-4 mt-3">
  <div>
    <label className="mr-2 font-medium text-gray-700">Rows per page:</label>
    <select
      value={branchPageSize}
      onChange={e => setBranchPageSize(Number(e.target.value))}
      className="border rounded px-2 py-1"
    >
      {rowsPerPageOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
  <button
    onClick={() => setBranchPage(p => Math.max(1, p - 1))}
    disabled={branchPage === 1}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Prev</button>
  <span>Page {branchPage} / {branchTotalPages}</span>
  <button
    onClick={() => setBranchPage(p => (p < branchTotalPages ? p + 1 : p))}
    disabled={branchPage >= branchTotalPages}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Next</button>
</div>
          </div>
        )}

        {/* VIEW: INVENTORY */}
        {view === 'INVENTORY' && selectedBranchForInventory && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <> 
            {/* Inventory Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
              <div>
                <button 
                  onClick={handleBackToBranches}
                  className="group flex items-center gap-2 text-gray-500 hover:text-emerald-700 transition-colors mb-2 font-medium"
                >
                  <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                  Back to Branches
                </button>
                <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3">
                  <Building2 className="text-emerald-600" />
                  Inventory: <span className="text-emerald-700">{selectedBranchForInventory.branchName}</span>
                </h1>
                <p className="text-gray-500 text-sm ml-9 mt-1">
                  Managing stock for {selectedBranchForInventory.location} ({selectedBranchForInventory.branchCode})
                </p>
              </div>
              <button
                onClick={() => setIsInventoryModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all text-sm font-bold"
              >
                <Plus size={20} /> Add Stock
              </button>
            </div>

            {/* Inventory List */}
            {inventoryLoading ? (
               <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-sm">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
               </div>
            ) : (
              <>
                {branchInventory.length === 0 ? (
                  <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-dashed border-gray-300">
                    <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Inventory Records Found</h3>
                    <p className="text-gray-400 mb-6">This branch currently has no stock records.</p>
                    <button onClick={() => setIsInventoryModalOpen(true)} className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-bold py-2 px-6 rounded-lg hover:bg-blue-100 transition">
                      <Plus size={18} /> Add First Item
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {branchInventory.map((inv) => {
                      const product = getProductDetails(inv.productId);
                      const totalStock = inv.availableStock + inv.reservedStock;
                      const percentage = totalStock > 0 ? (inv.availableStock / totalStock) * 100 : 0;
                      
                      return (
                        <div key={inv.inventoryId} className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 group">
                           <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 text-white flex justify-between items-start">
                             <div>
                               <h3 className="font-bold text-lg leading-tight mb-1">{product.productName}</h3>
                               <p className="text-blue-100 text-xs">{product.brand || 'No Brand'}</p>
                             </div>
                             <Package size={20} className="opacity-80" />
                           </div>
                           <div className="p-5 space-y-4">
                             {/* Stats Grid */}
                             <div className="grid grid-cols-2 gap-3">
                               <div className="bg-green-50 p-2 rounded-lg border border-green-100 text-center">
                                 <span className="block text-xs text-green-800 font-semibold uppercase tracking-wider">Available</span>
                                 <span className="block text-xl font-bold text-green-700">{inv.availableStock}</span>
                               </div>
                               <div className="bg-orange-50 p-2 rounded-lg border border-orange-100 text-center">
                                 <span className="block text-xs text-orange-800 font-semibold uppercase tracking-wider">Reserved</span>
                                 <span className="block text-xl font-bold text-orange-700">{inv.reservedStock}</span>
                               </div>
                             </div>
                             
                             <div>
                               <div className="flex justify-between text-xs text-gray-500 mb-1 font-medium">
                                 <span>Availability</span>
                                 <span>{percentage.toFixed(0)}%</span>
                               </div>
                               <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                 <div className="bg-green-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${percentage}%` }}></div>
                               </div>
                             </div>
                             <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                               <span>ID: #{inv.inventoryId}</span>
                               <span className="font-mono bg-gray-100 px-2 py-0.5 rounded text-gray-600">Total: {totalStock}</span>
                             </div>
                           </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </>
            )}
            </>
            <div className="flex justify-center items-center gap-4 mt-3">
  <div>
    <label className="mr-2 font-medium text-gray-700">Rows per page:</label>
    <select
      value={inventoryPageSize}
      onChange={e => setInventoryPageSize(Number(e.target.value))}
      className="border rounded px-2 py-1"
    >
      {rowsPerPageOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
  <button
    onClick={() => setInventoryPage(p => Math.max(1, p - 1))}
    disabled={inventoryPage === 1}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Prev</button>
  <span>Page {inventoryPage} / {inventoryTotalPages}</span>
  <button
    onClick={() => setInventoryPage(p => (p < inventoryTotalPages ? p + 1 : p))}
    disabled={inventoryPage >= inventoryTotalPages}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Next</button>
</div>
          </div>
        )}

        {/* Modals */}
 <BranchFormModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSave={() => fetchBranches(branchPage, branchPageSize)}
  branchToEdit={editingBranch}
  triggerSuccess={showSuccessMessage}
/>

<InventoryFormModal
  isOpen={isInventoryModalOpen}
  onClose={() => setIsInventoryModalOpen(false)}
  onSave={() => fetchInventoryForBranch(selectedBranchForInventory?.id, inventoryPage, inventoryPageSize)}
  triggerSuccess={showSuccessMessage}
  preSelectedBranchId={selectedBranchForInventory?.id}
  preSelectedBranchName={selectedBranchForInventory?.branchName}
/>

<DeactivateModal
  isOpen={deactivateModal.isOpen}
  onClose={() => setDeactivateModal({ isOpen: false, branch: null })}
  onConfirm={async () => {
    await confirmToggleStatus();
    fetchBranches(branchPage, branchPageSize);
  }}
  branch={deactivateModal.branch}
  isActivating={!deactivateModal.branch?.active}
/>

        <SuccessModal 
          isOpen={successModal.isOpen} 
          onClose={() => setSuccessModal({ ...successModal, isOpen: false })} 
          message={successModal.message} 
        />
      </div>
    </div>
  );
}