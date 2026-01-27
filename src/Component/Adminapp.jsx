import React, { useEffect, useRef, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, } from "react-router-dom";
import {ArrowRight, Trash2, CheckCircle, AlertCircle, X } from "lucide-react";
import Sidebar from "./Home/Sidebar";
import Dashboard from "./AdminDashboard/Dashboard";
import Products from "./Products/Products";
import Loginpage from "./Login/Loginpage";
import Category from "./Products/Category";
import Navbar from "./Home/Navbar";
import Order from "./Products/Order";
import Branch from "./Products/Branch";
import Inventory from "./Products/Inventory"; // Import Inventory component
import ChangePasswordModal from "./Login/ChangePasswordModal";
import AllUsers from "./Login/Alluser";
import Banners from "./Login/Banner";
import Coupons from "./Products/Coupons";
import { rootApi } from "../../axiosInstance";
import AddAdmin from "./Login/AddAdmin";

const notifications = [
  {
    id: 1,
    user: "Ravi Kumar",
    product: "Groundnut Oil",
    category: "Cold Pressed Oils",
    status: "Pending",
    date: "2026-01-08",
  },
  {
    id: 2,
    user: "Sita Reddy",
    product: "Mango Pickle",
    category: "Pickles",
    status: "Delivered",
    date: "2026-01-07",
  },
  {
    id: 3,
    user: "Anil Sharma",
    product: "Turmeric Powder",
    category: "Spices",
    status: "Pending",
    date: "2026-01-08",
  },
  {
    id: 4,
    user: "Priya Singh",
    product: "Wild Honey",
    category: "Honey",
    status: "Delivered",
    date: "2026-01-06",
  },
];

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Categories", path: "/category" },
  { name: "Products", path: "/products" },
  { name: "Branches", path: "/branches" },
  { name: "Inventory", path: "/inventory" },
  { name: "Banners", path: "/banners" },
  { name: "Coupons", path: "/coupons" }, 
  { name: "Users", path: "/users" },
  { name: "Orders", path: "/orders" },
];

// Layout with sidebar
function MainLayout({ onLogout }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedDate, setSelectedDate] = useState("All");
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [notificationPage, setNotificationPage] = useState(0);
  const [notificationTotalPages, setNotificationTotalPages] = useState(1);
   const [unreadCount, setUnreadCount] = useState(0);

  const notificationContainerRef = useRef(null);

  const navigate = useNavigate();

  // Filter navItems for search
  const filteredNavItems = search
    ? navItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  // Handler for Sidebar logout button
  const handleSidebarLogout = () => setShowLogoutModal(true);

  // Handler for modal OK
  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    onLogout();
  };

  // Handler for modal Cancel
  const handleCancelLogout = () => setShowLogoutModal(false);
  
  const handleResultClick = (path) => {
    setSearch("");
    setSidebarOpen(false);
    navigate(path);
  };

  // Change password handler
  const handlePasswordChange = async (passwordData) => {
    try {
      console.log("Password changed successfully");
      return Promise.resolve();
    } catch (error) {
      console.error("Error in password change callback:", error);
      return Promise.reject(error);
    }
  };

  useEffect(() => {
  if (!showNotification) return;
  setLoadingNotifications(true);
  rootApi.get("/api/notification/subscribe")
    .then(res => setNotifications(res.data || []))
    .catch(() => setNotifications([]))
    .finally(() => setLoadingNotifications(false));
}, [showNotification]);

 useEffect(() => {
    if (!showNotification) return;
    rootApi.get("/api/notification/unread-count")
      .then(res => setUnreadCount(res.data || 0))
      .catch(() => setUnreadCount(0));
  }, [showNotification]);

  // Fetch notifications (pagination)
useEffect(() => {
  if (!showNotification) return;
  setLoadingNotifications(true);

  // Only add date param if selectedDate is valid and NOT "All"
  const isDateSelected = selectedDate && selectedDate !== "All";
  const dateParam = isDateSelected ? `&createdAt=${selectedDate}` : "";

  rootApi
    .get(`/api/notification/all?page=${notificationPage}&size=10${dateParam}`)
    .then(res => {
      const { content = [], totalPages = 1 } = res.data || {};
      setNotifications(content);
      setNotificationTotalPages(totalPages);
    })
    .catch(() => setNotifications([]))
    .finally(() => setLoadingNotifications(false));
}, [showNotification, notificationPage, selectedDate]);
  // Notification modal helpers
  const dates = [
    "All",
    ...Array.from(new Set(notifications.map((n) => n.date))).sort((a, b) => b.localeCompare(a)),
  ];
   const filteredNotifications = selectedDate
    ? notifications.filter((n) =>
        n.createdAt.slice(0, 10) === selectedDate
      )
    : notifications;
  const handleDeleteNotification = async (id) => {
    await rootApi.delete(`/api/notification/delete/${id}`);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  // When opening modal, reset page and fetch first page
  useEffect(() => {
    if (showNotification) {
      setNotificationPage(0);
      setSelectedDate("");
    }
  }, [showNotification]);
  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* 1. Navbar Full Width at the Top */}
      <div className="flex-shrink-0 z-50">
        <Navbar
          setSidebarOpen={setSidebarOpen}
          onLogout={onLogout}
          search={search}
          setSearch={setSearch}
          searchResults={filteredNavItems}
          onResultClick={handleResultClick}
          onShowNotification={() => setShowNotification(true)}
          onShowChangePassword={() => setShowChangePassword(true)}
        />
      </div>

      {/* 2. Main Content Area (Sidebar + Page Content) */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleSidebarLogout}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 lg:p-1 transition-all">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category" element={<Category />} />
            <Route path="/branches" element={<Branch />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/banners" element={<Banners />} />
            <Route path="/coupons" element={<Coupons />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="/orders" element={<Order />} />
            
            {/* --- UPDATED ROUTE --- */}
            {/* Only allow access if email matches admin@organics.com */}
            <Route 
              path="/add-admin" 
              element={
                localStorage.getItem("adminEmail") === "admin@organics.com" ? (
                  <AddAdmin />
                ) : (
                  <Navigate to="/dashboard" replace />
                )
              } 
            />
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center transform transition-all scale-100">
            <h2 className="text-xl font-bold mb-4 text-[#1f4d36]">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-center gap-4 mt-6">
              <button
                onClick={handleCancelLogout}
                className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLogout}
                className="px-6 py-2 rounded-lg bg-[#facc15] text-[#1f4d36] font-bold hover:bg-[#fde047] transition shadow-lg"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onPasswordChange={handlePasswordChange}
        />
      )}

      {/* Notification Modal */}
      {/* Professional Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[60] flex justify-end sm:justify-center items-start sm:items-center p-0 sm:p-4 transition-all duration-300">
          <div className="bg-white w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-md sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right sm:slide-in-from-bottom duration-300">
            
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 bg-white flex justify-between items-center z-10 sticky top-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </h2>
                <p className="text-xs text-gray-400 font-medium mt-0.5">Stay updated with latest activities</p>
              </div>
              <button
                onClick={() => setShowNotification(false)}
                className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="px-6 py-3 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter Date</span>
               <input
                 type="date"
                 value={selectedDate === "All" ? "" : selectedDate} // Ensure UI shows empty if "All"
                 onChange={(e) => {
                   setSelectedDate(e.target.value);
                   setNotificationPage(0); // <--- ADD THIS: Reset page to 0 on date change
                 }}
                 className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer shadow-sm"
               />
            </div>

            {/* Notification List */}
<div
  className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/30 custom-scrollbar"
>
  {loadingNotifications ? (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-2"></div>
      <span className="text-xs font-medium">Loading updates...</span>
    </div>
  ) : notifications.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400 opacity-60">
      <div className="bg-gray-100 p-4 rounded-full mb-3">
         <span className="text-2xl">🔕</span>
      </div>
      <p className="text-sm font-medium">No notifications found</p>
      <p className="text-xs">Try selecting a different date</p>
    </div>
  ) : (
    notifications
      .sort((a, b) => b.id - a.id)
      .map((n) => (
        <div
          key={n.id}
          className={`group relative bg-white border border-gray-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden ${
            !n.isRead ? "ring-2 ring-emerald-400" : ""
          }`}
        >
            {!n.isRead && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
              Unread
            </span>
          )}
                      {/* Left Accent Bar based on Type */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        n.type === "SUCCESS" ? "bg-emerald-500" : n.type === "INFO" ? "bg-blue-500" : "bg-amber-500"
                      }`}></div>

                      <div className="flex gap-4 pl-2">
                        {/* Icon Box */}
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                           n.type === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : n.type === "INFO" ? "bg-blue-50 text-blue-600" : "bg-amber-50 text-amber-600"
                        }`}>
                          {n.type === "SUCCESS" ? <CheckCircle size={18} /> : n.type === "INFO" ? <div className="font-bold text-lg">i</div> : <AlertCircle size={18} />}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-bold text-gray-900 leading-tight pr-6">
                              {n.subject}
                            </h4>
                              <span
                                className=" absolute right-9 top-2 text-[10px] text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100 shadow-sm z-10"
                                style={{ minWidth: 90 }}
                              >
                                {new Date(n.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit' })}{" "}
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                              </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            {n.message}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                             <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide bg-gray-50 px-2 py-1 rounded">
                                {n.category || 'General'}
                             </span>
                             
                             {/* --- NEW BUTTON: Navigate to Link --- */}
                             {/* Assuming 'n.link' contains '/orders/32' */}
                              {n.link && (
                                <button
                                  onClick={() => {
                                    setShowNotification(false);
                                    // Extract orderId from n.link (e.g., "/orders/10")
                                    const match = n.link.match(/\/orders\/(\d+)/);
                                    const orderId = match ? match[1] : null;
                                    if (orderId) {
                                      navigate("/orders", { state: { orderId: Number(orderId) } });
                                    } else {
                                      navigate("/orders");
                                    }
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3 py-1.5 rounded-lg shadow-sm transition-all active:scale-95"
                                >
                                  View Details
                                  <ArrowRight size={12} />
                                </button>
                              )}
                          </div>
                        </div>

                        {/* Delete Button (Hover only on desktop) */}
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n.id); }}
                          className="absolute top-2 right-2 p-1.5 text-gray-300 hover:text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                          title="Remove notification"
                        >
                          <Trash2 size={14} /> {/* Ensure Trash2 is imported from lucide-react */}
                        </button>
                      </div>
                    </div>
                  ))
              )}
             <div className="flex justify-center items-center gap-4 mt-4">
  <button
    onClick={() => setNotificationPage((p) => Math.max(0, p - 1))}
    disabled={notificationPage === 0}
    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >
    Prev
  </button>
  <span>
    Page {notificationPage + 1} / {notificationTotalPages}
  </span>
  <button
    onClick={() => setNotificationPage((p) => (p < notificationTotalPages - 1 ? p + 1 : p))}
    disabled={notificationPage >= notificationTotalPages - 1}
    className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >
    Next
  </button>
</div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button
                onClick={() => setShowNotification(false)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-50 hover:text-gray-900 transition shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("accessToken")
  );

  const handleLogin = () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("adminEmail"); // Clear email on logout
    setIsAuthenticated(false);
  };

  return (
    <Router>
      {isAuthenticated ? (
        <MainLayout onLogout={handleLogout} />
      ) : (
        <Routes>
          <Route
            path="/login"
            element={<Loginpage onLoginSuccess={handleLogin} />}
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      )}
    </Router>
  );
}