import React, { useState, useEffect } from "react";
import { rootApi } from "../../../axiosInstance";
import { 
  UserPlus, Mail, Lock, Phone, X, ChevronLeft, ChevronRight, 
  ShieldCheck, CheckCircle, AlertCircle, Search, Filter, 
  Users, UserCheck, UserX 
} from "lucide-react";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

const ValidationIndicator = ({ isValid, text }) => (
  <div className="flex items-center gap-2 text-xs">
    <span className={`w-3 h-3 rounded-full ${isValid ? "bg-green-500" : "bg-gray-300"} inline-block`} />
    <span className={isValid ? "text-green-700" : "text-gray-500"}>{text}</span>
  </div>
);
const AddAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", phoneNumber: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordValidations, setPasswordValidations] = useState({
  minLength: false,
  hasUpperCase: false,
  hasLowerCase: false,
  hasNumber: false,
  hasSpecialChar: false,
});
  
  // New State for Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [totalAdmins, setTotalAdmins] = useState(0);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch all admins with pagination
 const fetchAdmins = async (pg = page, size = pageSize) => {
  try {
    const res = await rootApi.get(`/api/auth/admin/all?page=${pg - 1}&size=${size}`);
    const adminsArr = Array.isArray(res.data?.content) ? res.data.content : [];
    // Sort by id descending (newest first)
    adminsArr.sort((a, b) => a.id - b.id);
    setAdmins(adminsArr);
    setTotalPages(res.data?.totalPages || 1);
    setTotalAdmins(res.data?.totalElements || 0); // Capture Total Elements
  } catch {
    setAdmins([]);
    setTotalPages(1);
    setTotalAdmins(0);
  }
};;

  useEffect(() => {
    fetchAdmins();
    // eslint-disable-next-line
  }, [page, pageSize]);

  const validatePasswordRules = (password) => ({
  minLength: password.length >= 8,
  hasUpperCase: /[A-Z]/.test(password),
  hasLowerCase: /[a-z]/.test(password),
  hasNumber: /[0-9]/.test(password),
  hasSpecialChar: /[!@#$%^&*]/.test(password),
});
  // Form validation logic
  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!emailRegex.test(form.email)) errs.email = "Invalid email format";
    
    if (!form.password) errs.password = "Password is required";
    else if ( form.password.length < 6 || !passwordValidations.minLength || !passwordValidations.hasUpperCase || !passwordValidations.hasLowerCase || !passwordValidations.hasNumber || !passwordValidations.hasSpecialChar) {
      errs.password = "Password does not meet requirements";
    }
    
    if (!form.phoneNumber) errs.phoneNumber = "Phone number is required";
    else if (!phoneRegex.test(form.phoneNumber)) errs.phoneNumber = "Invalid phone number";
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await rootApi.post("/api/auth/admin/create", form);
      setForm({ email: "", password: "", phoneNumber: "" });
      setShowModal(false); 
      setShowSuccessModal(true); 
      fetchAdmins(page, pageSize); 
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Failed to create admin" });
    }
    setLoading(false);
  };

  // Filter Logic (Client Side for current page)
  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = admin.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          admin.phoneNumber.includes(searchTerm);
    // Assuming all fetched admins are 'Active' for now as per original UI
    const matchesStatus = statusFilter === "All" ? true : 
                          statusFilter === "Active" ? true : false; 
    return matchesSearch && matchesStatus;
  });


  return (
    <div className="min-h-screen bg-emerald-50/60 p-6 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1f4d36] flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={28} />
            Admin Management
          </h2>
          <p className="text-sm text-gray-500 mt-1">Manage system administrators and permissions</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setErrors({}); }}
          className="group flex items-center gap-2 px-5 py-2.5 bg-[#1f4d36] text-white rounded-xl font-bold shadow-lg shadow-emerald-900/20 hover:bg-[#163828] hover:scale-[1.02] transition-all duration-200"
        >
          <UserPlus size={18} className="group-hover:rotate-12 transition-transform" />
          <span>Add New Admin</span>
        </button>
      </div>

      {/* --- STATS CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Admins */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-blue-500"></div>
          <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Admins</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalAdmins}</h3>
          </div>
        </div>

        {/* Active Admins */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-emerald-500"></div>
          <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Active Admins</p>
            <h3 className="text-2xl font-bold text-gray-800">{totalAdmins}</h3>
          </div>
        </div>

        {/* Inactive Admins */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 h-full w-1 bg-red-500"></div>
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Inactive Admins</p>
            <h3 className="text-2xl font-bold text-gray-800">0</h3>
          </div>
        </div>
      </div>

      {/* --- SEARCH & FILTER BAR --- */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by Email or Phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm"
          />
        </div>

        {/* Status Dropdown */}
        <div className="relative min-w-[200px]">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all shadow-sm appearance-none cursor-pointer"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
             <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
             </svg>
          </div>
        </div>
      </div>

      {/* --- ADMINS GRID --- */}
      {filteredAdmins.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredAdmins.map((admin, index) => (
            <div 
              key={admin.email || index} 
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 group relative overflow-hidden"
            >
              {/* Decorative Background Element */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-10 -mt-10 opacity-50 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shadow-inner">
                  {admin.email.charAt(0).toUpperCase()}
                </div>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                  Active
                </span>
              </div>

              <div className="relative z-10">
                <h3 className="text-gray-900 font-bold text-base mb-1 truncate" title={admin.email}>
                  {admin.email}
                </h3>
                <div className="flex items-center gap-2 text-gray-500 text-sm mt-3 bg-gray-50 p-2 rounded-lg">
                  <Phone size={14} className="text-emerald-600" />
                  <span className="font-medium">{admin.phoneNumber}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="text-gray-300" size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-900">No Admins Found</h3>
          <p className="text-gray-500">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Pagination Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm gap-4">
          <div className="text-xs text-gray-500 font-medium">
            Showing Page <span className="text-gray-900 font-bold">{page}</span> of {totalPages}
          </div>
          <div className="flex items-center gap-3">
             <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="bg-gray-50 border border-gray-200 text-gray-700 text-xs rounded-lg px-2 py-1.5 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
            >
              {[9, 18, 27].map(size => (
                <option key={size} value={size}>{size} / page</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
      </div>

      {/* --- ADD ADMIN FORM MODAL --- */}
      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 bg-[#1f4d36] flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus size={20} className="text-[#facc15]" />
                Add New Admin
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-white/70 hover:text-white hover:bg-white/10 rounded-full p-1 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="email"
                        placeholder="admin@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                          errors.email 
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        autoFocus
                      />
                    </div>
                    {errors.email && <p className="text-xs text-red-500 font-medium ml-1 animate-pulse">{errors.email}</p>}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Lock className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                       <input
                         type="password"
                         placeholder="••••••••"
                         className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                           errors.password 
                             ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                             : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                         }`}
                         value={form.password}
                         onChange={e => {
                           const value = e.target.value;
                           setForm({ ...form, password: value });
                           setPasswordValidations(validatePasswordRules(value));
                         }}
                       />
                       {form.password && (
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
                    {errors.password && <p className="text-xs text-red-500 font-medium ml-1 animate-pulse">{errors.password}</p>}
                  </div>

                  {/* Phone Number Field */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wide ml-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-3 top-2.5 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
                      <input
                        type="text"
                        placeholder="9876543210"
                        maxLength={10}
                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium outline-none transition-all duration-200 focus:bg-white focus:ring-2 ${
                          errors.phoneNumber 
                            ? "border-red-300 focus:border-red-500 focus:ring-red-500/20" 
                            : "border-gray-200 focus:border-emerald-500 focus:ring-emerald-500/20"
                        }`}
                        value={form.phoneNumber}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, '');
                          setForm({ ...form, phoneNumber: val });
                        }}
                      />
                    </div>
                    {errors.phoneNumber && <p className="text-xs text-red-500 font-medium ml-1 animate-pulse">{errors.phoneNumber}</p>}
                  </div>

                  {/* API Error Message */}
                  {errors.api && (
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-xs font-semibold">
                      <AlertCircle size={16} />
                      {errors.api}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3 mt-6 pt-2">
                    <button
                      type="button"
                      onClick={() => { setShowModal(false); setErrors({}); }}
                      className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 hover:text-gray-800 transition active:scale-95"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2.5 bg-[#facc15] text-[#1f4d36] rounded-xl font-bold text-sm hover:bg-[#fde047] shadow-md shadow-yellow-500/20 transition-all hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-[#1f4d36] border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        "Create Admin"
                      )}
                    </button>
                  </div>
                </form>
            </div>
          </div>
        </div>
      )}

      {/* --- SUCCESS MODAL --- */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center transform scale-100 animate-in zoom-in-95 duration-200 relative">
             <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-t-2xl"></div>
             
             <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6 shadow-sm border border-green-100">
               <CheckCircle className="h-10 w-10 text-green-600" />
             </div>
             
             <h3 className="text-2xl font-extrabold text-[#1f4d36] mb-2">Success!</h3>
             <p className="text-gray-500 font-medium mb-8">
               New admin has been created successfully.
             </p>
             
             <button
               onClick={() => setShowSuccessModal(false)}
               className="w-full py-3 bg-[#1f4d36] text-white rounded-xl font-bold hover:bg-[#163828] transition-all shadow-lg shadow-emerald-900/20 active:scale-95"
             >
               Okay, Got it
             </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default AddAdmin;