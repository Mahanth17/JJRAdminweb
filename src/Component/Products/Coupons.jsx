import React, { useState, useRef, useEffect } from 'react';
import {Plus,Trash2,X,Edit2,CheckCircle,Search,AlertCircle,Tag,Calendar,Percent,DollarSign,Clock,Users,TrendingUp,Power,PowerOff,Filter,Gift,Sparkles,ChevronDown,} from 'lucide-react';
import { categoryApi, rootApi } from '../../../axiosInstance';
// --- Component: Success Modal ---
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-4 shadow-sm">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-sm text-gray-500 mb-6 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-xl shadow-lg shadow-green-200 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold hover:from-green-700 hover:to-green-600 focus:outline-none transition-all transform active:scale-95"
        >
          Okay
        </button>
      </div>
    </div>
  );
};
// --- Component: Deactivate/Activate Confirmation Modal ---
const DeactivateModal = ({ isOpen, onClose, onConfirm, item, type, isActivating }) => {
  if (!isOpen) return null;
  const name = type === 'coupon' ? item?.code : item?.name;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {isActivating ? 'Activate Coupon?' : 'Deactivate Coupon?'}
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {isActivating ? 'activate' : 'deactivate'} "<strong>{name}</strong>"?
        </p>
        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose} 
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm} 
            className={`px-6 py-2 rounded-lg text-white transition ${
              isActivating ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {isActivating ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component: Coupon Form Modal ---
const CouponFormModal = ({ isOpen, onClose, onSave, couponToEdit, triggerSuccess }) => {
  const [formData, setFormData] = useState({
    code: couponToEdit?.code || '',
    description: couponToEdit?.description || '',
    discountType: couponToEdit?.discountType || 'PERCENT',
    discountValue: couponToEdit?.discountValue || '',
    minOrderAmount: couponToEdit?.minOrderAmount || '',
    maxDiscountAmount: couponToEdit?.maxDiscountAmount || '',
    usageLimit: couponToEdit?.usageLimit || '',
    startDate: couponToEdit?.startDate || '',
    endDate: couponToEdit?.endDate || '',
    active: couponToEdit?.active ?? true,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    if (couponToEdit) {
      setFormData({
        code: couponToEdit.code || '',
        description: couponToEdit.description || '',
        discountType: couponToEdit.discountType || 'PERCENT',
        discountValue: couponToEdit.discountValue || '',
        minOrderAmount: couponToEdit.minOrderAmount || '',
        maxDiscountAmount: couponToEdit.maxDiscountAmount || '',
        usageLimit: couponToEdit.usageLimit || '',
        startDate: couponToEdit.startDate || '',
        endDate: couponToEdit.endDate || '',
        active: couponToEdit.active ?? true,
      });
    }
  }, [couponToEdit]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.code.trim()) {
      newErrors.code = "Coupon code is required";
      isValid = false;
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
      isValid = false;
    }

    if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
      newErrors.discountValue = "Valid discount value is required";
      isValid = false;
    }

    if (formData.discountType === 'PERCENT' && parseFloat(formData.discountValue) > 100) {
      newErrors.discountValue = "Percentage cannot exceed 100%";
      isValid = false;
    }

    if (!formData.minOrderAmount || parseFloat(formData.minOrderAmount) < 0) {
      newErrors.minOrderAmount = "Valid minimum order amount is required";
      isValid = false;
    }

    if (!formData.usageLimit || parseInt(formData.usageLimit) <= 0) {
      newErrors.usageLimit = "Valid usage limit is required";
      isValid = false;
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
      isValid = false;
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
      isValid = false;
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      newErrors.endDate = "End date must be after start date";
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
        code: formData.code,
        description: formData.description,
        discountType: formData.discountType,
        discountValue: parseFloat(formData.discountValue),
        minOrderAmount: parseFloat(formData.minOrderAmount),
        maxDiscountAmount: parseFloat(formData.maxDiscountAmount) || 0,
        usageLimit: parseInt(formData.usageLimit),
        startDate: formData.startDate,
        endDate: formData.endDate,
        active: formData.active,
      };

      if (couponToEdit) {
        // --- FIX: Create Query Parameters for Update ---
        // Mapping all fields to URL parameters to ensure backend receives them
        const queryParams = new URLSearchParams({
          code: formData.code,
          description: formData.description,
          discountType: formData.discountType,
          discountValue: parseFloat(formData.discountValue),
          minOrderAmount: parseFloat(formData.minOrderAmount),
          maxDiscountAmount: parseFloat(formData.maxDiscountAmount) || 0,
          usageLimit: parseInt(formData.usageLimit),
          startDate: formData.startDate,
          endDate: formData.endDate,
          active: formData.active,
        }).toString();

        // Pass queryParams in the URL
        await categoryApi.put(`/api/organics/coupon/update/${couponToEdit.id}?${queryParams}`, payload);
        triggerSuccess('Coupon Updated Successfully');
      } else {
        await categoryApi.post('/api/organics/coupon/create', payload);
        triggerSuccess('Coupon Created Successfully');
      }

      onSave();
      handleClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert(`Failed to ${couponToEdit ? 'update' : 'create'} coupon. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: '',
      minOrderAmount: '',
      maxDiscountAmount: '',
      usageLimit: '',
      startDate: '',
      endDate: '',
      active: true,
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-purple-600 to-pink-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Tag size={24} />
            {couponToEdit ? 'Edit Coupon' : 'Create New Coupon'}
          </h2>
          <button onClick={handleClose} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Coupon Code & Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Coupon Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  placeholder="e.g., SUMMER2026"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white uppercase ${
                    errors.code ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.code && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.code}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g., Summer Sale"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.description ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.description}
                  </p>
                )}
              </div>
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="PERCENT">PERCENT</option>
                    <option value="FLAT">FLAT</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    placeholder="e.g., 10"
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-3 pl-10 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                      errors.discountValue ? 'border-red-500' : 'border-gray-200'
                    }`}
                  />
                  {formData.discountType === 'PERCENT' ? (
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  )}
                </div>
                {errors.discountValue && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.discountValue}
                  </p>
                )}
              </div>
            </div>

            {/* Min Order & Max Discount */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Min Order Amount <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 500"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.minOrderAmount ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.minOrderAmount && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.minOrderAmount}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Max Discount Amount
                </label>
                <input
                  type="number"
                  name="maxDiscountAmount"
                  value={formData.maxDiscountAmount}
                  onChange={handleInputChange}
                  placeholder="e.g., 100 (0 for unlimited)"
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Usage Limit */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Usage Limit <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="usageLimit"
                value={formData.usageLimit}
                onChange={handleInputChange}
                placeholder="e.g., 1000"
                min="1"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                  errors.usageLimit ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.usageLimit && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.usageLimit}
                </p>
              )}
            </div>

            {/* Start & End Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Start Date <span className="text-red-500">*</span>
                </label>
               <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  max={formData.endDate || undefined}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.startDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.startDate && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.startDate}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  min={formData.startDate || undefined}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.endDate ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.endDate && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.endDate}
                  </p>
                )}
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                name="active"
                id="active"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
              />
              <label htmlFor="active" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Active Coupon
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 font-bold transition shadow-lg shadow-purple-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : couponToEdit ? 'Update Coupon' : 'Create Coupon'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Component: Coupon Card ---
const CouponCard = ({ coupon, onEdit, onToggleStatus }) => {
  const isExpired = new Date(coupon.endDate) < new Date();
  const isActive = coupon.active && !isExpired;
  const usagePercent = (coupon.usedCount / coupon.usageLimit) * 100;

  return (
    <div className={`relative group bg-gradient-to-br ${
      isActive 
        ? 'from-blue-50 to-purple-50 border-green-200' 
        : 'from-gray-50 to-gray-100 border-gray-300'
    } rounded-2xl border-2 overflow-hidden hover:shadow-xl transition-all duration-300 p-6`}>
      {/* Status Badge */}
      <div className="absolute top-4 right-4">
        {isExpired ? (
          <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
            EXPIRED
          </span>
        ) : isActive ? (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center gap-1">
            <Power size={12} /> ACTIVE
          </span>
        ) : (
          <span className="px-3 py-1 bg-gray-200 text-gray-700 text-xs font-bold rounded-full flex items-center gap-1">
            <PowerOff size={12} /> INACTIVE
          </span>
        )}
      </div>

      {/* Coupon Code */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Tag className={isActive ? 'text-purple-600' : 'text-gray-400'} size={20} />
          <h3 className={`text-2xl font-black ${isActive ? 'text-gray-900' : 'text-gray-500'} uppercase tracking-tight`}>
            {coupon.code}
          </h3>
        </div>
        <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'} font-medium`}>
          {coupon.description}
        </p>
      </div>

      {/* Discount Info */}
      <div className="mb-4 p-4 bg-white/60 rounded-xl border border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-600">Discount</span>
          <span className={`text-2xl font-black ${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
            {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-gray-500">Min Order:</span>
            <span className="font-bold text-gray-700 ml-1">₹{coupon.minOrderAmount}</span>
          </div>
          {coupon.maxDiscountAmount > 0 && (
            <div>
              <span className="text-gray-500">Max Discount:</span>
              <span className="font-bold text-gray-700 ml-1">₹{coupon.maxDiscountAmount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Usage Stats */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-gray-600 font-semibold">Usage: {coupon.usedCount} / {coupon.usageLimit}</span>
          <span className="text-gray-600 font-semibold">{usagePercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>
      </div>

      {/* Validity */}
      <div className="mb-4 p-3 bg-white/60 rounded-lg">
        <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
          <Calendar size={14} />
          <span className="font-semibold">Valid From:</span>
          <span>{new Date(coupon.startDate).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-600">
          <Clock size={14} />
          <span className="font-semibold">Valid Until:</span>
          <span className={isExpired ? 'text-red-600 font-bold' : ''}>
            {new Date(coupon.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onEdit(coupon)}
          className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 font-semibold transition flex items-center justify-center gap-2 text-sm"
        >
          <Edit2 size={16} />
          Edit coupon
        </button>
        <button
          onClick={() => onToggleStatus(coupon)}
          disabled={isExpired}
          className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 text-sm ${
            isExpired
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isActive
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-green-50 text-green-600 hover:bg-green-100'
          }`}
        >
          {isActive ? (
            <>
              <PowerOff size={16} />
              Deactivate
            </>
          ) : (
            <>
              <Power size={16} />
              Activate
            </>
          )}
        </button>
      </div>
    </div>
  );
};
// --- Component: Discount Form Modal ---
const DiscountFormModal = ({ isOpen, onClose, triggerSuccess, onDiscountCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    discountType: 'PERCENT',
    discountValue: '',
    scope: 'PRODUCT',
    active: true,
    validFrom: '',
    validTo: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
  let newErrors = {};
  let isValid = true;

  if (!formData.name.trim()) {
    newErrors.name = "Discount name is required";
    isValid = false;
  }

  if (!formData.discountValue || parseFloat(formData.discountValue) <= 0) {
    newErrors.discountValue = "Valid discount value is required";
    isValid = false;
  }

  if (formData.discountType === 'PERCENT' && parseFloat(formData.discountValue) > 100) {
    newErrors.discountValue = "Percent cannot exceed 100%";
    isValid = false;
  }

  if (!formData.validFrom) {
    newErrors.validFrom = "Valid from date and time is required";
    isValid = false;
  }

  if (!formData.validTo) {
    newErrors.validTo = "Valid to date and time is required";
    isValid = false;
  }

  if (formData.validFrom && formData.validTo && new Date(formData.validFrom) >= new Date(formData.validTo)) {
    newErrors.validTo = "Valid to must be after valid from";
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
    // Convert datetime-local to ISO format without timezone shift
    // datetime-local format: "2026-01-20T11:59"
    // We append seconds and 'Z' to make it ISO: "2026-01-20T11:59:00.000Z"
    const formatToISO = (dateTimeLocal) => {
      if (!dateTimeLocal) return null;
      // Add seconds and milliseconds, then append 'Z' for UTC
      return `${dateTimeLocal}:00.000Z`;
    };

    const payload = {
      name: formData.name,
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      scope: formData.scope,
      active: formData.active,
      validFrom: formatToISO(formData.validFrom),  // "2026-01-20T11:59:00.000Z"
      validTo: formatToISO(formData.validTo),      // "2026-01-20T13:00:00.000Z"
    };

    const response = await rootApi.post('/api/admin/discounts', payload);
    triggerSuccess('Discount Created Successfully');
    
    // Pass discount ID to parent component
    if (response.data && response.data.id) {
      onDiscountCreated(response.data.id, formData.scope);
    }
    
    handleClose();
  } catch (error) {
    console.error('Error creating discount:', error);
    alert('Failed to create discount. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setFormData({
      name: '',
      discountType: 'PERCENT',
      discountValue: '',
      scope: 'PRODUCT',
      active: true,
      validFrom: '',
      validTo: '',
    });
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Percent size={24} />
            Create Discount
          </h2>
          <button onClick={handleClose} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Discount Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Discount Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g., Summer Sale 20%"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                  errors.name ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Discount Type & Value */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                  >
                    <option value="PERCENT">PERCENT</option>
                    <option value="FLAT">FLAT</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Discount Value <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="discountValue"
                  value={formData.discountValue}
                  onChange={handleInputChange}
                  placeholder="e.g., 20"
                  step="0.01"
                  min="0"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.discountValue ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.discountValue && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.discountValue}
                  </p>
                )}
              </div>
            </div>

            {/* Scope */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Scope <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  name="scope"
                  value={formData.scope}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white appearance-none cursor-pointer"
                >
                  <option value="PRODUCT">PRODUCT</option>
                  <option value="CATEGORY">CATEGORY</option>
                  <option value="CART">CART</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
              </div>
            </div>

            {/* Valid From & Valid To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid From <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="validFrom"
                  value={formData.validFrom}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.validFrom ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.validFrom && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.validFrom}
                  </p>
                )}
              </div>
            
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Valid To <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  name="validTo"
                  value={formData.validTo}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                    errors.validTo ? 'border-red-500' : 'border-gray-200'
                  }`}
                />
                {errors.validTo && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle size={14} />
                    {errors.validTo}
                  </p>
                )}
              </div>
            </div>
            
            {/* Active Status */}
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                name="active"
                id="discountActive"
                checked={formData.active}
                onChange={handleInputChange}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="discountActive" className="text-sm font-semibold text-gray-700 cursor-pointer">
                Active Discount
              </label>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 font-bold transition shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Discount'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
// --- Component: Assign Discount to Product Modal ---
const AssignDiscountProductModal = ({ isOpen, onClose, discountId, triggerSuccess }) => {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
    }
  }, [isOpen]);

  const fetchProducts = async () => {
    try {
      const response = await categoryApi.get('/api/products/activeProd');
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  };

  if (!isOpen) return null;

 const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedProductId) {
    setError('Please select a product');
    return;
  }

  setLoading(true);

  try {
    await rootApi.post(`/api/admin/discounts/assign/product?productId=${selectedProductId}&discountId=${discountId}`);
    triggerSuccess('Discount Assigned to Product Successfully');
    handleClose();
  } catch (error) {
    console.error('Error assigning discount:', error);
    setLoading(false);
    
    // Handle specific error messages from backend
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('already has discount') || errorMessage.includes('Product already has discount')) {
        const productName = products.find(p => p.id === parseInt(selectedProductId))?.productName || 'This product';
        alert(`⚠️ Discount Already Exists!\n\n${productName} already has an active discount.\n\nPlease remove the existing discount first or choose a different product.`);
      } else {
        alert(`Error: ${errorMessage || 'Failed to assign discount. Please try again.'}`);
      }
    } else {
      alert('Failed to assign discount. Please try again.');
    }
    return;
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setSelectedProductId('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-green-600 to-emerald-600">
          <h2 className="text-xl font-bold text-white">Assign to Product</h2>
          <button onClick={handleClose} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Product <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => {
                  setSelectedProductId(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">-- Select Product --</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.productName}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
// --- Component: Assign Discount to Category Modal ---
const AssignDiscountCategoryModal = ({ isOpen, onClose, discountId, triggerSuccess }) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.get('/api/category/Active');
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setError('Failed to load categories');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!selectedCategoryId) {
    setError('Please select a category');
    return;
  }

  setLoading(true);

  try {
    await rootApi.post(`/api/admin/discounts/assign/category?categoryId=${selectedCategoryId}&discountId=${discountId}`);
    triggerSuccess('Discount Assigned to Category Successfully');
    handleClose();
  } catch (error) {
    console.error('Error assigning discount:', error);
    setLoading(false);
    
    // Handle specific error messages from backend
    if (error.response?.status === 400) {
      const errorMessage = error.response?.data?.message || '';
      
      if (errorMessage.includes('already has discount') || errorMessage.includes('Category already has discount')) {
        const categoryName = categories.find(c => c.id === parseInt(selectedCategoryId))?.categoryName || 'This category';
        alert(`⚠️ Discount Already Exists!\n\n${categoryName} already has an active discount.\n\nPlease remove the existing discount first or choose a different category.`);
      } else {
        alert(`Error: ${errorMessage || 'Failed to assign discount. Please try again.'}`);
      }
    } else {
      alert('Failed to assign discount. Please try again.');
    }
    return;
  } finally {
    setLoading(false);
  }
};

  const handleClose = () => {
    setSelectedCategoryId('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gradient-to-r from-orange-600 to-amber-600">
          <h2 className="text-xl font-bold text-white">Assign to Category</h2>
          <button onClick={handleClose} className="p-2 text-white hover:bg-white/20 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Select Category <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setError('');
                }}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none transition bg-gray-50 focus:bg-white ${
                  error ? 'border-red-500' : 'border-gray-200'
                }`}
              >
                <option value="">-- Select Category --</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
              {error && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {error}
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl hover:from-orange-700 hover:to-amber-700 font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
// --- Main Component: Coupons Management ---
const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [deactivateModalData, setDeactivateModalData] = useState({ isOpen: false, coupon: null });
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isAssignProductModalOpen, setIsAssignProductModalOpen] = useState(false);
  const [isAssignCategoryModalOpen, setIsAssignCategoryModalOpen] = useState(false);
  const [createdDiscountId, setCreatedDiscountId] = useState(null);
  const [allActiveCoupons, setAllActiveCoupons] = useState([]);
  const [allCoupons, setAllCoupons] = useState({ active: 0, inactive: 0 });
  

  useEffect(() => {
    fetchCoupons();
  }, [showInactive]);

const fetchCoupons = async () => {
  setLoading(true);
  try {
    // Fetch all coupons (active and inactive)
    const [activeRes, inactiveRes] = await Promise.all([
      categoryApi.get('/api/organics/coupon/get'),
      categoryApi.get('/api/organics/coupon/getInActive')
    ]);
    // Sort by id descending
    const activeCoupons = (activeRes.data || []).sort((a, b) => a.id - b.id);
    const inactiveCoupons = (inactiveRes.data || []).sort((a, b) => a.id - b.id);

    setAllCoupons({
      active: activeCoupons.length,
      inactive: inactiveCoupons.length,
    });

    // Show list based on toggle
    setCoupons(showInactive ? inactiveCoupons : activeCoupons);
  } catch (error) {
    console.error('Error fetching coupons:', error);
    alert('Failed to load coupons');
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  fetchCoupons();
}, [showInactive]);

  const handleToggleStatusClick = (coupon) => {
    setDeactivateModalData({ isOpen: true, coupon });
  };

  const confirmToggleStatus = async () => {
    const coupon = deactivateModalData.coupon;
    if (!coupon) return;

    try {
      const newStatus = !coupon.active;
      await categoryApi.put(`/api/organics/coupon/status/${coupon.id}?status=${newStatus}`);
      setDeactivateModalData({ isOpen: false, coupon: null });
      triggerSuccess(`Coupon ${newStatus ? 'Activated' : 'Deactivated'} Successfully`);
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      alert('Failed to update coupon status');
    }
  };

  const handleEdit = (coupon) => {
    setCouponToEdit(coupon);
    setIsModalOpen(true);
  };

  const triggerSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleDiscountCreated = (discountId, scope) => {
  setCreatedDiscountId(discountId);
  if (scope === 'PRODUCT') {
    setIsAssignProductModalOpen(true);
  } else if (scope === 'CATEGORY') {
    setIsAssignCategoryModalOpen(true);
  }
};
  // Check if coupon is expired
  const isCouponExpired = (endDate) => new Date(endDate) < new Date();

  // Filter coupons by search
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Calculate counts for all coupons (not filtered by showInactive)


  //useEffect(() => {
  //  const fetchAllCouponsForCount = async () => {
  //    try {
  //      const [activeRes, inactiveRes] = await Promise.all([
  //        categoryApi.get('/api/organics/coupon/get'),
  //        categoryApi.get('/api/organics/coupon/getInActive')
  //      ]);
  //      setAllActiveCoupons(activeRes.data || []);
  //      setAllInactiveCoupons(inactiveRes.data || []);
  //    } catch (error) {
  //      console.error('Error fetching coupon counts:', error);
  //    }
  //  };
  //  fetchAllCouponsForCount();
  //}, [coupons]);

const activeCouponCount = allCoupons.active;
const inactiveCouponCount = allCoupons.inactive;

  return (
    <div className="min-h-screen bg-emerald-50/60 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header & Controls */}
        <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                <Gift className="text-purple-600" size={36} />
                Coupon Management
              </h1>
              <p className="text-gray-500 font-medium mt-2">Create and manage discount coupons for your customers</p>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-600 font-semibold">Active: {activeCouponCount}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-gray-600 font-semibold">Inactive: {inactiveCouponCount}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
  {/* Search */}
  <div className="relative group">
    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-600 transition-colors" size={20} />
    <input
      type="text"
      placeholder="Search coupons..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full sm:w-64 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
    />
  </div>

  {/* Inactive Coupons Button */}
  <button
  onClick={() => setShowInactive(!showInactive)}
  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-lg hover:shadow-xl active:scale-95 ${
    showInactive
      ? 'bg-gradient-to-r from-gray-700 to-gray-900 text-white'
      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
  }`}
>
  <Filter size={20} />
  <span>{showInactive ? 'Show Active' : 'Show Inactive'}</span>
  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
    showInactive ? 'bg-white/20 text-white' : 'bg-gray-600 text-white'
  }`}>
    {showInactive ? allCoupons.active : allCoupons.inactive}
  </span>
</button>

  {/* Discount Button */}
  <button
    onClick={() => setIsDiscountModalOpen(true)}
    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full hover:from-blue-700 hover:to-indigo-700 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
  >
    <Percent size={20} />
    Discount
  </button>

  {/* New Coupon Button */}
  <button
    onClick={() => {
      setCouponToEdit(null);
      setIsModalOpen(true);
    }}
    className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:from-purple-700 hover:to-pink-700 font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
  >
    <Plus size={20} />
    New Coupon
  </button>
</div>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-100 border-t-purple-600 mb-4"></div>
            <p className="text-gray-400 font-medium">Loading coupons...</p>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <div className="bg-purple-50 p-6 rounded-full mb-4">
              <Gift size={48} className="text-purple-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              {showInactive ? 'No Inactive Coupons' : 'No Active Coupons Found'}
            </h3>
            <p className="text-gray-500 mt-2 mb-6">
              {searchTerm 
                ? 'Try adjusting your search' 
                : showInactive 
                ? 'All coupons are currently active'
                : 'Create your first coupon to get started'}
            </p>
            {!searchTerm && !showInactive && (
              <button
                onClick={() => {
                  setCouponToEdit(null);
                  setIsModalOpen(true);
                }}
                className="text-white font-bold hover:underline rounded-full flex items-center gap-2 bg-purple-400 hover:bg-purple-500 px-6 py-3 transition-shadow shadow-lg hover:shadow-xl"
              >
                + Create Now
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                onEdit={handleEdit}
                onToggleStatus={handleToggleStatusClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CouponFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCouponToEdit(null);
        }}
        onSave={fetchCoupons}
        couponToEdit={couponToEdit}
        triggerSuccess={triggerSuccess}
      />

      <DeactivateModal
        isOpen={deactivateModalData.isOpen}
        onClose={() => setDeactivateModalData({ isOpen: false, coupon: null })}
        onConfirm={confirmToggleStatus}
        item={deactivateModalData.coupon}
        type="coupon"
        isActivating={!deactivateModalData.coupon?.active}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
      <DiscountFormModal
  isOpen={isDiscountModalOpen}
  onClose={() => setIsDiscountModalOpen(false)}
  triggerSuccess={triggerSuccess}
  onDiscountCreated={handleDiscountCreated}
/>

<AssignDiscountProductModal
  isOpen={isAssignProductModalOpen}
  onClose={() => {
    setIsAssignProductModalOpen(false);
    setCreatedDiscountId(null);
  }}
  discountId={createdDiscountId}
  triggerSuccess={triggerSuccess}
/>

<AssignDiscountCategoryModal
  isOpen={isAssignCategoryModalOpen}
  onClose={() => {
    setIsAssignCategoryModalOpen(false);
    setCreatedDiscountId(null);
  }}
  discountId={createdDiscountId}
  triggerSuccess={triggerSuccess}
/>
    </div>
  );
};

export default Coupons;