import React, { useState, useEffect } from "react";
import { rootApi } from "../../../axiosInstance";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/;

const AddAdmin = () => {
  const [admins, setAdmins] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", phoneNumber: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Fetch all admins
  const fetchAdmins = async () => {
    try {
      const res = await rootApi.get("/api/auth/admin/all");
      setAdmins(res.data || []);
    } catch {
      setAdmins([]);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Form validation
  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = "Email is required";
    else if (!emailRegex.test(form.email)) errs.email = "Invalid email";
    if (!form.password) errs.password = "Password is required";
    else if (form.password.length < 6) errs.password = "Min 6 characters";
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
      setSuccessMsg("Admin created successfully!");
      setForm({ email: "", password: "", phoneNumber: "" });
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      setErrors({ api: err.response?.data?.message || "Failed to create admin" });
    }
    setLoading(false);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">Admins</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-5 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-xl font-bold shadow hover:from-green-700 hover:to-emerald-600 transition"
        >
          + Add Admin
        </button>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <table className="w-full text-left">
          <thead>
            <tr className="text-gray-500 text-sm border-b">
              <th className="py-2 font-medium">Email</th>
              <th className="py-2 font-medium">Phone Number</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.email} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-3 text-gray-800 text-sm">{admin.email}</td>
                <td className="py-3 text-gray-600 text-sm">{admin.phoneNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <h3 className="text-xl font-bold text-green-700 mb-4">Add New Admin</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Email</label>
                <input
                  type="email"
                  className={`w-full px-4 py-2 border rounded-lg ${errors.email ? "border-red-500" : "border-gray-200"}`}
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  autoFocus
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Password</label>
                <input
                  type="password"
                  className={`w-full px-4 py-2 border rounded-lg ${errors.password ? "border-red-500" : "border-gray-200"}`}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Phone Number</label>
                <input
                  type="text"
                  className={`w-full px-4 py-2 border rounded-lg ${errors.phoneNumber ? "border-red-500" : "border-gray-200"}`}
                  value={form.phoneNumber}
                  onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
                  maxLength={10}
                />
                {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
              </div>
              {errors.api && <p className="text-xs text-red-600 mt-1">{errors.api}</p>}
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setErrors({}); }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-lg font-bold hover:from-green-700 hover:to-emerald-600 transition disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Create Admin"}
                </button>
              </div>
            </form>
            {successMsg && <div className="mt-4 text-green-600 font-semibold">{successMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default AddAdmin;