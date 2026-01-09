import React, { useState } from "react";
import { Menu, Search, User, LogOut, Settings, Bell } from "lucide-react";
import JJRLogo from "../../assets/JJR.png"; // Adjust path if needed

function Navbar({
  setSidebarOpen,
  onLogout,
  search,
  setSearch,
  searchResults,
  onResultClick,
  onShowNotification, // new prop
}) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#e2ede6] border-b border-[#2d5c45] shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-8">
        {/* --- LEFT SECTION (Menu Toggle & Mobile Logo) --- */}
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden flex items-center justify-center p-2 rounded-md hover:bg-[#dde3e0] transition-colors"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open sidebar"
          >
            <Menu size={28} className="text-[#1f4d36]" />
          </button>
          <div className="flex items-center gap-2 lg:hidden">
            <img src={JJRLogo} alt="JJR Logo" className="h-8 w-auto" />
            <span className="font-bold text-[#0d0e0e] text-lg font-serif tracking-wide">
              JJROrganics
            </span>
          </div>
        </div>

        {/* --- CENTER SECTION (Logo + Search Bar) - Desktop only --- */}
        <div className="hidden lg:flex flex-1 items-center gap-4 mx-4">
          <div className="flex items-center gap-2 justify-start">
            <img src={JJRLogo} alt="JJR Logo" className="h-10 w-auto" />
            {/*<span className="font-bold text-[#0d0e0e] text-xl font-TimesnewRoman tracking-wide">
              JJROrganics
            </span>*/}
          </div>
          <div className="flex-1 relative">
            <div className="relative w-full text-gray-600 focus-within:text-[#1f4d36]">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-[#2d5c45]/30 rounded-full leading-5 bg-white placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1f4d36] focus:border-[#1f4d36] sm:text-sm transition-all shadow-sm"
                placeholder="Search components, orders, users..."
                autoComplete="off"
              />
              {search && searchResults.length > 0 && (
                <div className="absolute left-4 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                  {searchResults.map((item) => (
                    <div
                      key={item.name}
                      className="px-4 py-2 cursor-pointer hover:bg-[#e2ede6] text-[#1f4d36] font-medium"
                      onClick={() => onResultClick(item.path)}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              )}
              {search && searchResults.length === 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 px-4 py-2 text-gray-400">
                  No results found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* --- RIGHT SECTION (Profile & Notifications) --- */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-start mr-1 text-left">
            <span className="text-xs font-bold text-[#1f4d36]">Admin</span>
          </div>
          <button
            className="hidden sm:block text-[#1f4d36] hover:bg-[#dde3e0] p-2 rounded-full transition-colors relative"
            onClick={onShowNotification} // use the new prop
          >
            <Bell size={20} />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#e2ede6]"></span>
          </button>
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-2 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-[#1f4d36] flex items-center justify-center text-white shadow-md cursor-pointer hover:bg-[#163828] transition-colors border-2 border-white">
                <User size={18} />
              </div>
            </button>
            {isProfileOpen && (
              <>
                <div
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setIsProfileOpen(false)}
                ></div>
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 animation-fade-in-down origin-top-right">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 rounded-t-lg">
                    <p className="text-sm font-semibold text-gray-900">Super Admin</p>
                    <p className="text-xs text-gray-500 truncate">admin@jjrorganic.com</p>
                  </div>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#e2ede6] hover:text-[#1f4d36] transition-colors gap-2">
                    <User size={16} />
                    My Profile
                  </a>
                  <a href="#" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#e2ede6] hover:text-[#1f4d36] transition-colors gap-2">
                    <Settings size={16} />
                    Settings
                  </a>
                  <div className="border-t border-gray-100 mt-1"></div>
                  <button
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors gap-2"
                    onClick={onLogout}
                  >
                    <LogOut size={16} />
                    {!collapsed && <span>Logout</span>}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {/* REMOVE notification modal and related state from here */}
    </header>
  );
}

export default Navbar;