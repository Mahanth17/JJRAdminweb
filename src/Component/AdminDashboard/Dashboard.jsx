import React, { useEffect, useState } from "react";
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
import { categoryApi, orderApi, rootApi } from "../../../axiosInstance";

// --- MOVED STATIC DATA OUTSIDE COMPONENT (Prevents Re-renders) ---
const allCustomers = [
  { name: "Amit Sharma", orders: 12, spent: "₹15,000" },
  { name: "Priya Singh", orders: 9, spent: "₹11,200" },
  { name: "Rahul Verma", orders: 8, spent: "₹9,800" },
  { name: "Sneha Patel", orders: 7, spent: "₹8,400" },
];

const yearlyData = [
  { year: "2021", sales: 850000, orders: 1200 },
  { year: "2022", sales: 1100000, orders: 1500 },
  { year: "2023", sales: 1450000, orders: 2100 },
  { year: "2024", sales: 1250000, orders: 1800 },
];

const yearlyCategoryTrendData = [
  { year: "2021", Vegetables: 250000, Fruits: 180000, DryFruits: 120000, Dairy: 80000 },
  { year: "2022", Vegetables: 320000, Fruits: 240000, DryFruits: 150000, Dairy: 100000 },
  { year: "2023", Vegetables: 450000, Fruits: 310000, DryFruits: 200000, Dairy: 140000 },
  { year: "2024", Vegetables: 410000, Fruits: 280000, DryFruits: 180000, Dairy: 130000 },
];

const COLORS = ["#166534", "#22c55e", "#facc15", "#3b82f6", "#f472b6", "#f59e42", "#6366f1", "#14b8a6"];
const monthOptions = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const pieCategories = [
  { id: 1, name: "Spices" },
  { id: 2, name: "Dry Fruits" },
  { id: 3, name: "Food oils" },
  { id: 4, name: "Rice types" },
  { id: 5, name: "Veg Pickles" },
  { id: 6, name: "Non-veg Pickles" },
];

const Dashboard = () => {
  const getTodayDate = () => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  };
  
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [categoryMonthlyData, setCategoryMonthlyData] = useState([]);
  
  // --- State for Year Range ---
  const [startYear, setStartYear] = useState("2021");
  const [endYear, setEndYear] = useState("2024");

  const [productCount, setProductCount] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [branchCount, setBranchCount] = useState(0);

  const [topProducts, setTopProducts] = useState([]);
  const [topProductsPage, setTopProductsPage] = useState(1);

  const [recentOrders, setRecentOrders] = useState([]);
  const [ordersPage, setOrdersPage] = useState(1);
  const [monthlyData, setMonthlyData] = useState([]);
  
  const [selectedMonthBar, setSelectedMonthBar] = useState(new Date().getMonth() + 1);
  const [selectedYearBar, setSelectedYearBar] = useState(new Date().getFullYear());
  
  const [branchPage] = useState(1);
  const [branchPageSize] = useState(5);
  const [branchTotal, setBranchTotal] = useState(0);
  const [branches, setBranches] = useState([]);
  
  const [productPage] = useState(1);
  const [productPageSize] = useState(5);
  const [productTotal, setProductTotal] = useState(0);
  const [products, setProducts] = useState([]);
  const [quantityData, setQuantityData] = useState([]);
  const [categoryPageSize] = useState(1);

  const [tpStartDate, setTpStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().slice(0, 10);
  });
  const [tpEndDate, setTpEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const getCurrentMonth = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  const [monthlyStats, setMonthlyStats] = useState({ totalOrders: 0, totalRevenue: 0 });
  
  // Calculate this once per render
  const currentMonth = getCurrentMonth();

  // 1. Top Products
  useEffect(() => {
    (async () => {
      try {
        const res = await orderApi.get(`/api/orders/admin/topproducts?startDate=${tpStartDate}&endDate=${tpEndDate}`);
        setTopProducts(res.data || []);
        setTopProductsPage(1);
      } catch {
        setTopProducts([]);
      }
    })();
  }, [tpStartDate, tpEndDate]);

  // 2. Category Counts (Pie Chart)
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      try {
        const results = await Promise.all(
          pieCategories.map(async (cat) => {
            const res = await categoryApi.get(
              `/api/products/byCategory?categoryId=${cat.id}&page=0&size=${categoryPageSize}`
            );
            return {
              name: cat.name,
              value: res.data.totalElements || (res.data.content ? res.data.content.length : (res.data || []).length)
            };
          })
        );
        setQuantityData(results);
      } catch {
        setQuantityData([]);
      }
    };
    fetchCategoryCounts();
  }, [categoryPageSize]);

  // 3. MERGED EFFECT: Recent Orders & Daily Stats (Prevents Double Hit)
  useEffect(() => {
    if (!selectedDate) return;
    (async () => {
      try {
        const res = await orderApi.get(`/api/orders/admin/date?date=${selectedDate}`);
        
        // Logic for Recent Orders List
        const sortedOrders = (res.data || []).slice().sort((a, b) => a.id - b.id);
        setRecentOrders(sortedOrders);
        setOrdersPage(1);

        // Logic for Daily Stats Cards (Count & Revenue)
        setOrderCount(res.data.length || 0);
        const sale = res.data.reduce((sum, prod) => sum + (prod.orderAmount || 0), 0);
        setRevenue(sale);

      } catch {
        setRecentOrders([]);
        setOrderCount(0);
        setRevenue(0);
      }
    })();
  }, [selectedDate]);

  // 4. Monthly Stats
  useEffect(() => {
    orderApi
      .get(`/api/orders/admin/monthly/count?month=${currentMonth}`)
      .then(res => {
        setMonthlyStats({
          totalOrders: res.data.totalOrders || 0,
          totalRevenue: res.data.totalRevenue || 0,
        });
      })
      .catch(() => {
        setMonthlyStats({ totalOrders: 0, totalRevenue: 0 });
      });
  }, [currentMonth]);

  // 5. Monthly Bar Chart
  useEffect(() => {
    (async () => {
      try {
        const monthNames = [
          "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
          "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        const selectedMonthName = monthNames[selectedMonthBar - 1];
        const res = await orderApi.get(`/api/orders/admin/monthly/count?month=${selectedMonthName}&year=${selectedYearBar}`);
        const monthMap = {
          JANUARY: "Jan", FEBRUARY: "Feb", MARCH: "Mar", APRIL: "Apr",
          MAY: "May", JUNE: "Jun", JULY: "Jul", AUGUST: "Aug",
          SEPTEMBER: "Sep", OCTOBER: "Oct", NOVEMBER: "Nov", DECEMBER: "Dec"
        };
        const data = res.data
          ? [{
              name: monthMap[res.data.month?.toUpperCase()] || res.data.month,
              totalRevenue: res.data.totalRevenue || 0
            }]
          : [];
        setMonthlyData(data);
      } catch {
        setMonthlyData([]);
      }
    })();
  }, [selectedMonthBar, selectedYearBar]);

  // 6. Category Monthly Revenue (Line Chart)
  useEffect(() => {
    (async () => {
      try {
        // Note: Check if the IP '192.168.0.235:8083' is hardcoded intentionally or if you should use base URL
        const res = await categoryApi.get(`http://192.168.0.235:8083/api/category/admin/revenue/category-monthly?month=${selectedMonth}`);
        setCategoryMonthlyData(
          (res.data || []).map(item => ({
            name: item.categoryName,
            sales: item.revenue,
          }))
        );
      } catch {
        setCategoryMonthlyData([]);
      }
    })();
  }, [selectedMonth]);

  // 7. Active Products
  useEffect(() => {
    categoryApi
      .get(`/api/products/activeProd?page=${productPage - 1}&size=${productPageSize}`)
      .then(res => {
        setProducts(res.data.content || []);
        setProductTotal(res.data.totalElements || 0);
        setProductCount(res.data.totalElements || 0); 
        const sales = (res.data.content || []).reduce((sum, prod) => sum + (prod.finalPrice || 0), 0);
        setTotalSales(sales);
      })
      .catch(() => {
        setProducts([]);
        setProductTotal(0);
        setProductCount(0);
        setTotalSales(0);
      });
  }, [productPage, productPageSize]);

  // 8. Branches
  useEffect(() => {
    rootApi
      .get(`/api/admin/branches?page=${branchPage - 1}&size=${branchPageSize}`)
      .then(res => {
        setBranches(res.data.content || []);
        setBranchTotal(res.data.totalElements || 0);
        setBranchCount(res.data.totalElements || 0);
      })
      .catch(() => {
        setBranches([]);
        setBranchTotal(0);
        setBranchCount(0);
      });
  }, [branchPage, branchPageSize]);


  // --- Filtered Data Calculations ---
  // --- Filter chart data by year range ---
  const filteredYearlyData = yearlyData.filter(
    (d) => d.year >= startYear && d.year <= endYear
  );
  const filteredYearlyCategoryTrendData = yearlyCategoryTrendData.filter(
    (d) => d.year >= startYear && d.year <= endYear
  );
  
  // Pagination helpers
  const paginate = (arr, page, perPage = 5) => arr.slice((page - 1) * perPage, page * perPage);

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
      <div className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex items-center gap-4 border border-gray-100">
        <span className="text-3xl bg-green-50 p-3 rounded-full">🥦</span>
        <div>
          <div className="text-lg font-bold text-gray-800">{productCount}</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">Products</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex items-center gap-4 border border-gray-100">
        <span className="text-3xl bg-green-50 p-3 rounded-full">💰</span>
        <div>
          <div className="text-lg font-bold text-gray-800">₹{revenue}</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">Total Sales</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex items-center gap-4 border border-gray-100">
        <span className="text-3xl bg-green-50 p-3 rounded-full">🛒</span>
        <div>
          <div className="text-lg font-bold text-gray-800">{orderCount}</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">Orders (Today)</div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex items-center gap-4 border border-gray-100">
        <span className="text-3xl bg-green-50 p-3 rounded-full">📅</span>
        <div>
          <div className="text-lg font-bold text-gray-800">
            {monthlyStats.totalOrders} Orders | ₹{monthlyStats.totalRevenue}
          </div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">
            This Month
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow hover:shadow-md transition p-5 flex items-center gap-4 border border-gray-100">
        <span className="text-3xl bg-green-50 p-3 rounded-full">🏬</span>
        <div>
          <div className="text-lg font-bold text-gray-800">{branchCount}</div>
          <div className="text-xs md:text-sm text-gray-500 font-medium">Branches</div>
        </div>
      </div>
    </div>
       
      <div className="grid grid-cols-1 lg:grid-cols-3 mb-5 gap-8">
        {/* Top Products */}

       <div className="bg-white rounded-xl shadow p-6 border border-gray-100 overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-green-700 mb-4 flex items-center gap-4">
            Top Selling Products
            <input
              type="date"
              value={tpStartDate}
              onChange={e => setTpStartDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              style={{ minWidth: 120 }}
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={tpEndDate}
              onChange={e => setTpEndDate(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
              style={{ minWidth: 120 }}
            />
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2 font-medium">Product</th>
                  <th className="py-2 font-medium">Quantity Ordered</th>
                  <th className="py-2 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {paginate(topProducts, topProductsPage).map((prod) => (
                  <tr key={prod.productId} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 text-gray-800 text-sm">{prod.productName}</td>
                    <td className="py-3 text-gray-600 text-sm">{prod.totalQuantityOrdered}</td>
                    <td className="py-3 font-medium text-green-600 text-sm">₹{prod.totalRevenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-3">
              <button
                onClick={() => setTopProductsPage(p => Math.max(1, p - 1))}
                disabled={topProductsPage === 1}
                className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
              >Prev</button>
              <span>Page {topProductsPage} / {Math.ceil(topProducts.length / 5) || 1}</span>
              <button
                onClick={() => setTopProductsPage(p => p < Math.ceil(topProducts.length / 5) ? p + 1 : p)}
                disabled={topProductsPage >= Math.ceil(topProducts.length / 5)}
                className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
       <div className="bg-white rounded-xl shadow p-6 border border-gray-100 overflow-hidden flex flex-col">
          <h2 className="text-lg font-bold text-green-700 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[300px]">
              <thead>
                <tr className="text-gray-500 text-sm border-b">
                  <th className="py-2 font-medium">Customer</th>
                  <th className="py-2 font-medium">Products</th>
                  <th className="py-2 font-medium">Order Status</th>
                </tr>
              </thead>
              <tbody>
                {paginate(recentOrders, ordersPage).map((order) => (
                  <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                    <td className="py-3 text-gray-800 text-sm">{order.userName}</td>
                    <td className="py-3">
                      <select className="border rounded px-2 py-1 text-sm">
                        {order.orderItems?.map((item, idx) => (
                          <option key={idx} value={item.productName}>
                            {item.productName} (₹{item.totalPrice || item.price || 0})
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3">
                      <span
                        className={`text-xs font-semibold ${
                          order.orderStatus === "DELIVERED"
                            ? " text-green-700"
                            : order.orderStatus === "PENDING"
                            ? "text-yellow-700"
                            : order.orderStatus === "CANCELLED"
                            ? "text-red-700"
                            : "text-blue-700"
                        }`}
                      >
                        {order.orderStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Pagination */}
            <div className="flex justify-center items-center gap-2 mt-3">
              <button
                onClick={() => setOrdersPage(p => Math.max(1, p - 1))}
                disabled={ordersPage === 1}
                className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
              >Prev</button>
              <span>Page {ordersPage} / {Math.ceil(recentOrders.length / 5) || 1}</span>
              <button
                onClick={() => setOrdersPage(p => p < Math.ceil(recentOrders.length / 5) ? p + 1 : p)}
                disabled={ordersPage >= Math.ceil(recentOrders.length / 5)}
                className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
              >Next</button>
            </div>
          </div>
        </div>

        {/* Category-wise Line Chart */}
      <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-bold text-green-700">Category Sales Volume (Monthly)</h2>
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(Number(e.target.value))}
            className="px-2 py-1 rounded border border-gray-300 bg-gray-50 text-green-700 font-semibold"
          >
            {monthOptions.map(m => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={categoryMonthlyData} margin={{ top: 5, right: 10, left: 5, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 12 }} padding={{ left: 10, right: 10 }} />
              <YAxis tickFormatter={value => `₹${value}`} tick={{ fill: '#4b5563' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
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
        <div className="bg-white rounded-xl shadow p-3 border border-gray-100">
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
        
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-bold text-green-700 mb-6">Monthly Sales (Current Year)</h2>
          <div className="h-[300px] w-full">
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
               <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
               <XAxis dataKey="name" tick={{ fill: '#4b5563', fontSize: 12 }} />
               <YAxis tickFormatter={value => `₹${value / 1000}k`} tick={{ fill: '#4b5563' }} />
               <Tooltip
                 cursor={{ fill: '#f0fdf4' }}
                 contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
               />
               <Legend />
               <Bar dataKey="totalRevenue" name="Monthly Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
             </BarChart>
           </ResponsiveContainer>
          </div>
        </div>
      </div>
      {/* Footer */}
      <footer className="mt-12 text-center text-gray-400 text-sm pb-4">
        &copy; {new Date().getFullYear()} JJROrganics Store Admin Dashboard
      </footer>
    </div>
  );
};
export default Dashboard;