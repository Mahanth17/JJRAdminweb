import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

// --- EXISTING DATA (UNCHANGED) ---
const allStats = {
  "2026-01-09": [
    { label: "Total Sales", value: "₹1,25,000", icon: "💰" },
    { label: "Orders", value: "320", icon: "🛒" },
    { label: "Products", value: "58", icon: "🥦" },
    { label: "Customers", value: "210", icon: "👥" },
    { label: "Revenue (This Month)", value: "₹45,000", icon: "📈" },
  ],
  "2026-01-08": [
    { label: "Total Sales", value: "₹1,10,000", icon: "💰" },
    { label: "Orders", value: "300", icon: "🛒" },
    { label: "Products", value: "55", icon: "🥦" },
    { label: "Customers", value: "200", icon: "👥" },
    { label: "Revenue (This Month)", value: "₹40,000", icon: "📈" },
  ],
  // Add more dates as needed
};
const allTopProducts = {
  "2026-01-09": [
    { name: "Organic Apples", sold: 120, revenue: "₹12,000" },
    { name: "Fresh Spinach", sold: 95, revenue: "₹7,600" },
    { name: "Almonds (500g)", sold: 80, revenue: "₹9,200" },
    { name: "Raw Honey", sold: 60, revenue: "₹8,400" },
  ],
  "2026-01-08": [
    { name: "Organic Apples", sold: 100, revenue: "₹10,000" },
    { name: "Fresh Spinach", sold: 80, revenue: "₹6,400" },
    { name: "Almonds (500g)", sold: 70, revenue: "₹8,000" },
    { name: "Raw Honey", sold: 50, revenue: "₹7,000" },
  ],
};

const allRecentOrders = {
  "2026-01-09": [
    { id: "#ORD1021", customer: "Amit Sharma", total: "₹1,200", status: "Delivered" },
    { id: "#ORD1020", customer: "Priya Singh", total: "₹950", status: "Pending" },
    { id: "#ORD1019", customer: "Rahul Verma", total: "₹2,100", status: "Shipped" },
    { id: "#ORD1018", customer: "Sneha Patel", total: "₹1,500", status: "Delivered" },
  ],
  "2026-01-08": [
    { id: "#ORD1017", customer: "Amit Sharma", total: "₹1,000", status: "Delivered" },
    { id: "#ORD1016", customer: "Priya Singh", total: "₹850", status: "Pending" },
    { id: "#ORD1015", customer: "Rahul Verma", total: "₹1,900", status: "Shipped" },
    { id: "#ORD1014", customer: "Sneha Patel", total: "₹1,200", status: "Delivered" },
  ],
};

const allCustomers = {
  "2026-01-09": [
    { name: "Amit Sharma", orders: 12, spent: "₹15,000" },
    { name: "Priya Singh", orders: 9, spent: "₹11,200" },
    { name: "Rahul Verma", orders: 8, spent: "₹9,800" },
    { name: "Sneha Patel", orders: 7, spent: "₹8,400" },
  ],
  "2026-01-08": [
    { name: "Amit Sharma", orders: 10, spent: "₹13,000" },
    { name: "Priya Singh", orders: 8, spent: "₹10,000" },
    { name: "Rahul Verma", orders: 7, spent: "₹8,500" },
    { name: "Sneha Patel", orders: 6, spent: "₹7,000" },
  ],
};

// --- EXISTING CHART DATA ---
const yearlyData = [
  { year: "2021", sales: 850000, orders: 1200 },
  { year: "2022", sales: 1100000, orders: 1500 },
  { year: "2023", sales: 1450000, orders: 2100 },
  { year: "2024", sales: 1250000, orders: 1800 },
];

const quantityData = [
  { name: "Vegetables", value: 450 },
  { name: "Fruits", value: 300 },
  { name: "Dry Fruits", value: 150 },
  { name: "Dairy", value: 100 },
];

const monthlyData = [
  { name: "Jan", sales: 4000 },
  { name: "Feb", sales: 3000 },
  { name: "Mar", sales: 5000 },
  { name: "Apr", sales: 7500 },
  { name: "May", sales: 6000 },
  { name: "Jun", sales: 9000 },
  { name: "Jul", sales: 11000 },
  { name: "Aug", sales: 13000 },
  { name: "Sep", sales: 10000 },
  { name: "Oct", sales: 15000 },
  { name: "Nov", sales: 12000 },
  { name: "Dec", sales: 18000 },
];

const categoryTrendData = [
  { name: "Vegetables", sales: 12000 },
  { name: "Fruits", sales: 18000 },
  { name: "Dry Fruits", sales: 8000 },
  { name: "Dairy", sales: 5000 },
  { name: "Spices", sales: 3000 },
];

// --- NEW DATA FOR MULTI-LINE CHART ---
const yearlyCategoryTrendData = [
  { year: "2021", Vegetables: 250000, Fruits: 180000, DryFruits: 120000, Dairy: 80000 },
  { year: "2022", Vegetables: 320000, Fruits: 240000, DryFruits: 150000, Dairy: 100000 },
  { year: "2023", Vegetables: 450000, Fruits: 310000, DryFruits: 200000, Dairy: 140000 },
  { year: "2024", Vegetables: 410000, Fruits: 280000, DryFruits: 180000, Dairy: 130000 },
];

const COLORS = ["#166534", "#22c55e", "#facc15", "#3b82f6"];

const Dashboard = () => {
  const [selectedDate, setSelectedDate] = useState("2026-01-09");

  // --- State for Year Range ---
  const [startYear, setStartYear] = useState("2021");
  const [endYear, setEndYear] = useState("2024");

  // --- Filtered Data ---
const stats = allStats[selectedDate] ?? [];
const topProducts = allTopProducts[selectedDate] ?? [];
const recentOrders = allRecentOrders[selectedDate] ?? [];
const customers = allCustomers[selectedDate] ?? [];

  // --- Filter chart data by year range ---
  const filteredYearlyData = yearlyData.filter(
    (d) => d.year >= startYear && d.year <= endYear
  );
  const filteredYearlyCategoryTrendData = yearlyCategoryTrendData.filter(
    (d) => d.year >= startYear && d.year <= endYear
  );
  return (
    <div className="min-h-screen bg-emerald-50/60 p-4 md:p-6 lg:p-8 font-sans">
      {/* Header */}
      <header className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-green-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">Complete analytics for your Organic Store</p>
        </div>
        {/* Calendar Button */}
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-green-700 font-semibold shadow hover:border-green-500 transition"
            style={{ minWidth: 140 }}
          />
        </div>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex items-center gap-4 border border-gray-100">
            <span className="text-3xl bg-green-50 p-3 rounded-full">{stat.icon}</span>
            <div>
              <div className="text-lg font-bold text-gray-800">{stat.value}</div>
              <div className="text-xs md:text-sm text-gray-500 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
       
        <div className="grid grid-cols-1 lg:grid-cols-3 mb-5 gap-8">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-green-700 mb-4">Top Selling Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Sold</th>
                  <th className="py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((prod) => (
                  <tr key={prod.name} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 text-gray-800 text-sm">{prod.name}</td>
                    <td className="py-3 text-gray-600 text-sm">{prod.sold}</td>
                    <td className="py-3 font-medium text-green-600 text-sm">{prod.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-green-700 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2 font-medium">ID</th>
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 text-gray-600 text-sm">{order.id}</td>
                    <td className="py-3 text-gray-800 text-sm">{order.customer}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          order.status === "Delivered"
                            ? "bg-green-100 text-green-700"
                            : order.status === "Pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100 overflow-hidden">
          <h2 className="text-lg font-bold text-green-700 mb-4">Top Customers</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Orders</th>
                  <th className="py-2 font-medium">Spent</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((cust) => (
                  <tr key={cust.name} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 text-gray-800 text-sm">{cust.name}</td>
                    <td className="py-3 text-gray-600 text-sm">{cust.orders}</td>
                    <td className="py-3 font-medium text-green-600 text-sm">{cust.spent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- NEW CHART: Year-wise Category Revenue Trend (Placed Above others) --- */}
      <div className="grid grid-cols-1 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-green-700">Yearly Category Revenue Trends</h2>
            {/* Year Range Selectors */}
            <div className="flex gap-2 items-center mt-2 md:mt-0">
              <span className="text-xs text-gray-500">From</span>
              <select
                value={startYear}
                onChange={e => setStartYear(e.target.value)}
                className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-green-700 font-semibold"
              >
                {yearlyCategoryTrendData.map(d => (
                  <option key={d.year} value={d.year}>{d.year}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">To</span>
              <select
                value={endYear}
                onChange={e => setEndYear(e.target.value)}
                className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-green-700 font-semibold"
              >
                {yearlyCategoryTrendData.map(d => (
                  <option key={d.year} value={d.year}>{d.year}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={filteredYearlyCategoryTrendData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="year" tick={{ fill: '#4b5563', fontSize: 12 }} padding={{ left: 20, right: 20 }} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: '#4b5563' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                />
                <Legend iconType="circle" />
                <Line type="monotone" dataKey="Vegetables" stroke="#166534" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Fruits" stroke="#22c55e" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="DryFruits" name="Dry Fruits" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="Dairy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* --- PREVIOUS CHARTS SECTION (Yearly Bar & Quantity Pie) --- */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Bar Chart: Year Wise Analysis */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-green-700">Year-wise Total Sales</h2>
            {/* Year Range Selectors */}
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500">From</span>
              <select
                value={startYear}
                onChange={e => setStartYear(e.target.value)}
                className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-green-700 font-semibold"
              >
                {yearlyData.map(d => (
                  <option key={d.year} value={d.year}>{d.year}</option>
                ))}
              </select>
              <span className="text-xs text-gray-500">To</span>
              <select
                value={endYear}
                onChange={e => setEndYear(e.target.value)}
                className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-green-700 font-semibold"
              >
                {yearlyData.map(d => (
                  <option key={d.year} value={d.year}>{d.year}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={filteredYearlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" tick={{ fill: '#4b5563' }} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: '#4b5563' }} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Bar dataKey="sales" name="Sales Revenue" fill="#15803d" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-green-700 mb-6">Monthly Sales (Current Year)</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: '#4b5563' }} />
                <Tooltip 
                  cursor={{ fill: '#f0fdf4' }}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                />
                <Legend />
                <Bar dataKey="sales" name="Monthly Sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      
      </div>

      {/* --- MONTHLY & CATEGORY TREND CHARTS --- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        
        {/* Month-wise Bar Chart */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-green-700 mb-6">Quantity Wise (Category)</h2>
          <div className="h-[300px] w-full flex justify-center items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={quantityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {quantityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category-wise Line Chart */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-green-700 mb-6">Category Sales Volume</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={categoryTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 12 }} padding={{ left: 30, right: 30 }} />
                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} tick={{ fill: '#4b5563' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  name="Sales Volume" 
                  stroke="#166534" 
                  strokeWidth={3} 
                  dot={{ fill: '#166534', r: 4 }} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Main Analytics Tables */}
     

      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-sm pb-4">
        &copy; {new Date().getFullYear()} JJROrganics Store Admin Dashboard
      </footer>
    </div>
  );
};


export default Dashboard;