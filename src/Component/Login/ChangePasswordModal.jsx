import React, { useState } from "react";
import { Eye, EyeOff, Lock, X, Check } from "lucide-react";
import { rootApi } from "../../../axiosInstance";


function ChangePasswordModal({ onClose, onPasswordChange }) {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Password validation rules
  const validatePassword = (password) => {
    const validations = {
      minLength: password.length >= 8,
      hasUpperCase: /[A-Z]/.test(password),
      hasLowerCase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    return validations;
  };

  const passwordValidations = validatePassword(formData.newPassword);
  const isPasswordValid = Object.values(passwordValidations).every((v) => v);

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (!isPasswordValid) {
      newErrors.newPassword = "Password does not meet requirements";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (formData.currentPassword && formData.newPassword && formData.currentPassword === formData.newPassword) {
      newErrors.newPassword = "New password must be different from current password";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      currentPassword: true,
      newPassword: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Call API to change password
      const response = await rootApi.post(
        `/api/auth/admin/change-password?oldPassword=${encodeURIComponent(formData.currentPassword)}&newPassword=${encodeURIComponent(formData.newPassword)}`
      );

      // Call the onPasswordChange callback
      if (onPasswordChange) {
        await onPasswordChange(formData);
      }

      setSubmitSuccess(true);
      
      // Close modal after showing success
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error changing password:", error);
      
      // Handle specific error messages from backend
      let errorMessage = "Failed to change password. Please try again.";
      
      if (error.response?.status === 400) {
        errorMessage = "Invalid current password. Please try again.";
      } else if (error.response?.status === 401) {
        errorMessage = "Session expired. Please login again.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const ValidationIndicator = ({ isValid, text }) => (
    <div className={`flex items-center gap-2 text-xs ${isValid ? "text-green-600" : "text-gray-500"}`}>
      {isValid ? <Check size={14} /> : <X size={14} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-[#1f4d36] flex items-center justify-center">
              <Lock size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-[#1f4d36]">Change Password</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {submitSuccess ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-green-600 mb-2">Password Changed Successfully!</h3>
            <p className="text-gray-600 text-sm">Your password has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1f4d36] mb-2">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.current ? "text" : "password"}
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("currentPassword")}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    touched.currentPassword && errors.currentPassword
                      ? "border-red-500 focus:ring-red-200"
                      : "border-[#e2ede6] focus:ring-[#1f4d36]/20"
                  }`}
                  placeholder="Enter current password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1f4d36]"
                  tabIndex={-1}
                >
                  {showPasswords.current ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.currentPassword && errors.currentPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1f4d36] mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.new ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("newPassword")}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    touched.newPassword && errors.newPassword
                      ? "border-red-500 focus:ring-red-200"
                      : "border-[#e2ede6] focus:ring-[#1f4d36]/20"
                  }`}
                  placeholder="Enter new password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1f4d36]"
                  tabIndex={-1}
                >
                  {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.newPassword && errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}

              {/* Password Requirements */}
              {formData.newPassword && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-1">
                  <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                  <ValidationIndicator isValid={passwordValidations.minLength} text="At least 8 characters" />
                  <ValidationIndicator isValid={passwordValidations.hasUpperCase} text="One uppercase letter" />
                  <ValidationIndicator isValid={passwordValidations.hasLowerCase} text="One lowercase letter" />
                  <ValidationIndicator isValid={passwordValidations.hasNumber} text="One number" />
                  <ValidationIndicator isValid={passwordValidations.hasSpecialChar} text="One special character (!@#$%^&*)" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#1f4d36] mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPasswords.confirm ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={() => handleBlur("confirmPassword")}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 transition-all ${
                    touched.confirmPassword && errors.confirmPassword
                      ? "border-red-500 focus:ring-red-200"
                      : "border-[#e2ede6] focus:ring-[#1f4d36]/20"
                  }`}
                  placeholder="Confirm new password"
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#1f4d36]"
                  tabIndex={-1}
                >
                  {showPasswords.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {touched.confirmPassword && errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition disabled:opacity-50"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 rounded-lg bg-[#facc15] text-[#1f4d36] font-bold hover:bg-[#fde047] transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Changing..." : "Change Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default ChangePasswordModal;