import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarChart2, Package, LogOut, ChevronLeft, ChevronRight, Leaf, Folder } from "lucide-react";

function Sidebar({ isSidebarOpen, setSidebarOpen, onLogout, search }) {
  const [collapsed, setCollapsed] = useState(false);
  
  const location = useLocation();
  const navItems = [
    { name: "Dashboard", icon: <BarChart2 size={20} />, path: "/dashboard" },
    { name: "Categories", icon: <Folder size={20} />, path: "/category" },
    { name: "Products", icon: <Package size={20} />, path: "/products" },
    { name: "Orders", icon: <Leaf size={20} />, path: "/orders" },
  ];
  const itemsToShow = search
    ? navItems.filter((item) =>
        item.name.toLowerCase().includes(search.toLowerCase())
      )
    : navItems;



  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-60 z-40 lg:hidden transition-opacity ${
          isSidebarOpen ? "block" : "hidden"
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar Container */}
      <div
        style={{ boxShadow: "4px 0 15px rgba(20, 83, 45, 0.4)" }} // Greenish shadow
        className={`
          fixed  top-0 left-0 z-50 
          h-[93vh]
          /* Changed Theme: REMOVED BLACK, used Deep Forest Green */
          bg-[#e2ede6]
          text-gray-100
          transition-all duration-300 ease-in-out 
          flex flex-col
          ${collapsed ? "w-20" : "w-64"} 
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
          /* Kept Sticky to prevent scrolling with page */
          lg:translate-x-0 lg:sticky lg:top-0
          overflow-hidden
        `}
      >
        {/* Header */}
       

        {/* Toggle Button */}
        <div className="absolute right-2 top-3 z-50 hidden lg:block">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="border rounded-full p-1 bg-[#1f4d36] border-[#3d7a5c] hover:bg-[#facc15] hover:text-[#0f291e] text-gray-200 shadow-md transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-10 flex-1 px-3">
          {itemsToShow.map((item) => {
              const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg mb-2 transition-all font-medium duration-200 ${
                  collapsed ? "justify-center" : "justify-start"
                } ${
                  isActive
                    ? "bg-[#dde3e0] text-[#191a18] border-l-4 border-[#facc15] shadow-lg" // Lighter green for active item
                    : "text-gray-800 hover:bg-[#cdd3d1] hover:text-black"
                }`}
              >
                {item.icon}
                {!collapsed && <span className="whitespace-nowrap">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="mt-auto p-4 border-t border-[#2d5c45]">
          <button
            onClick={onLogout}
            className={`flex items-center gap-3 px-3 py-2 rounded-md w-full font-semibold text-red-600 hover:bg-[#cdd3d1] transition-colors ${
              collapsed ? "justify-center" : "justify-start"
            }`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;