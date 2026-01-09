import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Sidebar from "./Home/Sidebar";
import Dashboard from "./AdminDashboard/Dashboard";
import Products from "./Products/Products";
import Loginpage from "./Login/loginpage";
import Category from "./Products/Category";
import Navbar from "./Home/Navbar";
import Order from "./Products/Order";

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
  { name: "Orders", path: "/orders" },
];

// Layout with sidebar
function MainLayout({ onLogout }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [search, setSearch] = useState("");
  const [showNotification, setShowNotification] = useState(false);
  const [selectedDate, setSelectedDate] = useState("All");
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

  // Notification modal helpers
  const dates = [
    "All",
    ...Array.from(new Set(notifications.map((n) => n.date))).sort((a, b) => b.localeCompare(a)),
  ];
  const filteredNotifications =
    selectedDate === "All"
      ? notifications
      : notifications.filter((n) => n.date === selectedDate);

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
        />
      </div>

      {/* 2. Main Content Area (Sidebar + Page Content) */}
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onLogout={handleSidebarLogout}
        />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6 transition-all">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/category" element={<Category />} />
            <Route path="/orders" element={<Order />} />
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

      {/* Notification Modal */}
      {showNotification && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 relative">
            <h2 className="text-xl font-bold text-[#1f4d36] mb-4 text-center">Notifications</h2>
            {/* Date Filter */}
            <div className="mb-4 flex justify-end">
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded border border-[#e2ede6] bg-[#f6f8f7] text-[#1f4d36] font-semibold"
              >
                {dates.map((date) => (
                  <option key={date} value={date}>
                    {date === "All" ? "All Dates" : date}
                  </option>
                ))}
              </select>
            </div>
            {/* Notifications List */}
            <div className="max-h-80 overflow-y-auto space-y-3">
              {filteredNotifications.length === 0 ? (
                <div className="text-center text-gray-400 py-8">No notifications for this date.</div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n.id}
                    className="border rounded-lg p-3 flex flex-col bg-[#fdfbf7] shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-bold text-[#1f4d36]">{n.product}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-bold ${
                          n.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {n.status}
                      </span>
                    </div>
                    <div className="text-sm text-[#3d3126]">
                      <span className="font-semibold">User:</span> {n.user}
                    </div>
                    <div className="text-xs text-[#8c7860]">
                      <span className="font-semibold">Category:</span> {n.category}
                    </div>
                    <div className="text-xs text-[#8c7860]">
                      <span className="font-semibold">Date:</span> {n.date}
                    </div>
                  </div>
                ))
              )}
            </div>
            {/* Modal Footer */}
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNotification(false)}
                className="px-6 py-2 rounded-lg bg-[#facc15] text-[#1f4d36] font-bold hover:bg-[#fde047] transition"
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
    localStorage.setItem("accessToken", "dummy_token");
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
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