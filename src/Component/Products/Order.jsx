import React, { useEffect, useState } from "react";
import {
  X,
  CheckCircle,
  Truck,
  Package,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar,
  Filter,
  ShoppingBag,
  DollarSign,
  Clock,
  AlertCircle,
  RefreshCcw,
  Download, // Added Icon
} from "lucide-react";
import { orderApi } from "../../../axiosInstance"; // Adjust path as needed

// --- HELPER: INVOICE GENERATOR ---
const downloadInvoice = (order) => {
  // Calculate Totals for the Invoice
  const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalTax = order.orderItems.reduce((acc, item) => acc + (item.tax * item.quantity), 0);
  
  // Invoice HTML Template
  const invoiceHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${order.id}</title>
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
        .logo { font-size: 24px; font-weight: bold; color: #1f4d36; border: 2px solid #1f4d36; padding: 5px 10px; display: inline-block; }
        .invoice-title { font-size: 36px; font-weight: 300; color: #333; text-align: right; }
        .invoice-meta { text-align: right; margin-top: 5px; font-size: 14px; color: #777; }
        
        .bill-to { margin-bottom: 40px; }
        .bill-to h3 { font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #777; margin-bottom: 10px; }
        .bill-to p { margin: 3px 0; font-size: 15px; }
        
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th { text-align: left; padding: 12px 0; border-bottom: 2px solid #333; font-size: 14px; text-transform: uppercase; }
        td { padding: 12px 0; border-bottom: 1px solid #eee; font-size: 14px; }
        .text-right { text-align: right; }
        
        .totals { float: right; width: 300px; }
        .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .total-final { background: #1f4d36; color: #fff; padding: 10px; font-weight: bold; font-size: 16px; border-radius: 4px; margin-top: 10px; }
        
        .footer { margin-top: 100px; border-top: 1px solid #eee; padding-top: 20px; font-size: 12px; color: #777; display: flex; justify-content: space-between; }
        .signature { font-family: 'Times New Roman', serif; font-style: italic; font-size: 24px; margin-top: 20px; }
      </style>
    </head>
    <body>
     <div class="header">
        <div style="width:100%;text-align:center;margin-bottom:10px;">
          <img src="/JJR.png" alt="JJR Logo" style="height:80px;display:inline-block;" />
        </div>
        <div style="text-align:left;">
          <div class="invoice-title">INVOICE</div>
          <div class="invoice-meta">Invoice No. #${order.id}</div>
          <div class="invoice-meta">Date: ${new Date(order.orderDate).toLocaleDateString()}</div>
        </div>
      </div>

      <div class="bill-to">
        <h3>Billed To:</h3>
        <p><strong>${order.userName}</strong></p>
        <p>${order.userPhone || ''}</p>
        <p style="max-width: 300px; line-height: 1.4;">${order.shippingAddress?.fullAddress || order.fullAddress || 'Address not available'}</p>
      </div>

      <table>
        <thead>
          <tr>
            <th width="50%">Item</th>
            <th width="15%">Quantity</th>
            <th width="20%">Unit Price</th>
            <th width="15%" class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.orderItems.map(item => `
            <tr>
              <td>
                <div style="display:flex;align-items:center;gap:10px;">
                  <img src="${item.imageUrl}" alt="${item.productName}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;border:1px solid #eee;" />
                  <div>
                    <div style="font-weight:bold;">${item.productName}</div>
                    <div style="font-size:11px; color:#999;">Tax: ₹${item.tax} | Discount: ₹${item.discount}</div>
                  </div>
                </div>
              </td>
              <td>${item.quantity}</td>
              <td>
                <div>₹${item.price}</div>
                <div style="font-size:11px;color:#999;">(Unit Price)</div>
              </td>
              <td class="text-right">
                <div>₹${item.totalPrice}</div>
                <div style="font-size:11px;color:#999;">(Total)</div>
              </td>
            </tr>
          `).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="text-align:right; font-weight:bold;">Total Tax (GST):</td>
            <td class="text-right" style="font-weight:bold;">₹${totalTax}</td>
          </tr>
        </tfoot>
      </table>

      <div class="totals">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>₹${order.subtotal ?? subtotal}</span>
        </div>
        <div class="totals-row">
          <span>Tax (GST)</span>
          <span>₹${order.totalTax ?? totalTax}</span>
        </div>
        <div class="totals-row">
          <span>Item Discount</span>
          <span>-₹${order.itemDiscount ?? 0}</span>
        </div>
        <div class="totals-row">
          <span>Cart Discount</span>
          <span>-₹${order.cartDiscount ?? 0}</span>
        </div>
        <div class="totals-row">
          <span>Total Discount</span>
          <span>-₹${order.totalDiscount ?? 0}</span>
        </div>
        <div class="totals-row total-final">
          <span>Grand Total</span>
          <span>₹${order.grandTotal ?? order.orderAmount}</span>
        </div>
      </div>
      <div style="clear:both;"></div>
      
      <div class="footer">
        <div>
          <div class="signature">Thank You!</div>
          <p style="margin-top:20px;">
            <strong>Payment Information</strong><br>
            Status: ${order.paymentStatus}
          </p>
        </div>
        <div style="text-align:right; margin-top:auto;">
          <p>Authorized Signature</p>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); }
      </script>
    </body>
    </html>
  `;

  // Open Print Window
  const printWindow = window.open('', '_blank');
  printWindow.document.write(invoiceHTML);
  printWindow.document.close();
};

// --- SUB-COMPONENT: ORDER CARD ---
const OrderCard = ({ order, onUpdateClick }) => {
  const [itemIdx, setItemIdx] = useState(0);
  const items = order.orderItems || [];
  const showLeft = itemIdx > 0;
  const showRight = itemIdx < items.length - 1;

  // Helper for Status Badge Styling
  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED": return "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-500/30";
      case "SHIPPED": return "bg-blue-50 text-blue-600 ring-1 ring-blue-500/30";
      case "CANCELLED": return "bg-red-50 text-red-600 ring-1 ring-red-500/30";
      case "PENDING": return "bg-amber-50 text-amber-600 ring-1 ring-amber-500/30";
      default: return "bg-gray-50 text-gray-600 ring-1 ring-gray-500/30";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-200 border-t-4 border-t-[#10B981] flex flex-col h-full group relative overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-2 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 text-lg tracking-tight">Order #{order.id}</span>
          </div>
          <div className="text-xs font-medium text-gray-400 mt-1 flex items-center gap-1">
            <Calendar size={12} />
            {new Date(order.orderDate).toLocaleDateString()}
          </div>
        </div>
        <span
          className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider ${getStatusColor(
            order.orderStatus
          )}`}
        >
          {order.orderStatus}
        </span>
      </div>

      {/* Body */}
      <div className="px-5 py-3 flex-1 flex flex-col gap-4">
        <div className="relative bg-[#f8fafc] rounded-lg p-4 border border-gray-100 min-h-[120px] flex flex-col justify-center">
          {items.length > 0 ? (
            <>
              <div className="flex justify-between items-start mb-1">
                <h4 className="font-bold text-[#10B981] line-clamp-1 pr-2 text-base">
                  {items[itemIdx].productName}
                </h4>
              </div>
              <div className="flex justify-between items-end mt-auto">
                <div className="text-sm">
                  <p className="text-gray-500 text-xs">Quantity</p>
                  <p className="font-bold text-gray-900 text-lg">{items[itemIdx].quantity}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Total Price</p>
                  <p className="font-bold text-gray-900 text-lg">₹{items[itemIdx].totalPrice}</p>
                </div>
              </div>
              {items.length > 1 && (
                <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-1 pointer-events-none">
                  <button
                    onClick={(e) => { e.stopPropagation(); setItemIdx(Math.max(0, itemIdx - 1)); }}
                    disabled={!showLeft}
                    className={`p-1.5 rounded-full bg-white shadow-sm border border-gray-100 pointer-events-auto transition-all ${
                      showLeft ? "text-gray-700 hover:text-[#10B981]" : "opacity-0"
                    }`}
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setItemIdx(Math.min(items.length - 1, itemIdx + 1)); }}
                    disabled={!showRight}
                    className={`p-1.5 rounded-full bg-white shadow-sm border border-gray-100 pointer-events-auto transition-all ${
                      showRight ? "text-gray-700 hover:text-[#10B981]" : "opacity-0"
                    }`}
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center text-gray-400 text-sm">No Items</div>
          )}
        </div>
        <div className="text-sm pt-2 border-t border-dashed border-gray-100">
          <p className="font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold border border-blue-100">
              {order.userName.charAt(0).toUpperCase()}
            </div>
            {order.userName}
          </p>
          <p className="text-gray-400 text-xs pl-8 truncate">
            {order.fullAddress}
          </p>
        </div>
      </div>
      
      {/* Footer with Actions */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-xl gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 font-medium uppercase">Order Total</span>
          <span className="font-bold text-gray-900 text-lg">₹{order.orderAmount}</span>
        </div>    
<div className="flex items-center gap-2">
  {/* Track Order Button - Added here */}
  {order.shiprocketTrackingUrl && (
    <button
      onClick={() => window.open(order.shiprocketTrackingUrl, '_blank')}
      className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 hover:border-blue-200"
      title="Track Order"
    >
      <Truck size={16} />
      <span className="hidden sm:inline">Track</span>
    </button>
  )}

  {/* Download Invoice Button */}
  <button
    onClick={() => downloadInvoice(order)}
    className="flex items-center gap-1 text-sm medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-blue-100"
    title="Download Invoice"
  >
    <Download size={16} />
    <span className="hidden sm:inline">Invoice</span>
  </button>

  {/* Update Status Button */}
  <button
    onClick={() => onUpdateClick(order)}
    className="text-sm font-medium text-[#10B981] hover:text-emerald-700 hover:bg-emerald-50 px-3 py-1.5 bg-emerald-100 rounded-lg transition-colors"
  >
    Update Status
  </button>
</div>
      </div>
      <div className="h-1 w-full bg-gray-100 mt-auto">
        <div className="h-full bg-[#10B981] w-full opacity-80"></div>
      </div>
    </div>
  );
};

const statusOptions = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "DISPATCHED",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

// --- MAIN COMPONENT ---
const Order = () => {
  const [startDate, setStartDate] = useState(() =>
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [endDate, setEndDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(false);
  const [modalOrder, setModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState("PENDING");
  const [updating, setUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await orderApi.get(
        `/api/orders/admin/daily-statistics?startDate=${startDate}&endDate=${endDate}`
      );
      const data = res.data || [];
      // Sum up the stats for the range
      const totals = data.reduce(
        (acc, day) => {
          acc.totalOrders += day.totalOrders || 0;
          acc.pendingOrders += day.pendingOrders || 0;
          acc.deliveredOrders += day.deliveredOrders || 0;
          acc.totalRevenue += day.totalRevenue || 0;
          acc.confirmedOrders += day.confirmedOrders || 0;
          acc.shippedOrders += day.shippedOrders || 0;
          return acc;
        },
        { totalOrders: 0, pendingOrders: 0, deliveredOrders: 0, totalRevenue: 0, confirmedOrders: 0, shippedOrders: 0 }
      );
      setStats(totals);
    } catch (e) {
      setStats(null);
    }
  };
  fetchStats();
}, [startDate, endDate]);

useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        let res;
        if (statusFilter === "ALL") {
          res = await orderApi.get(`/api/orders/admin/all?page=${page}&size=${pageSize}`);
        } else {
          res = await orderApi.get(`/api/orders/admin/status?status=${statusFilter}&page=${page}&size=${pageSize}`);
        }
        // If your API returns a paged object:
        const paged = res.data;
        const data = (paged.content || paged).map((o) => ({
          id: o.id,
          orderDate: o.orderDate,
          orderAmount: o.orderAmount,
          orderStatus: o.orderStatus,
          userId: o.userId,
          userName: o.userName,
          fullAddress: o.shippingAddress?.fullAddress || "",
          orderItems: o.orderItems,
          shiprocketTrackingUrl: o.shiprocketTrackingUrl || null, 
        }));
        data.sort((a, b) => b.id - a.id);
        setOrders(data);
        setTotalPages(paged.totalPages || 1);
        const cats = new Set();
        data.forEach((order) =>
          order.orderItems.forEach((item) => cats.add(item.productName))
        );
        setCategories(["All", ...Array.from(cats)]);
      } catch (e) {
        setOrders([]);
        setCategories(["All"]);
        setTotalPages(1);
      }
      setLoading(false);
    };
    fetchOrders();
  }, [statusFilter, page, pageSize]);
  const filteredOrders = orders.filter((order) =>
    order.orderItems.some((item) =>
      item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const handleStatusUpdate = async () => {
    if (!modalOrder) return;
    setUpdating(true);
    try {
      await orderApi.put(
        `/api/orders/${modalOrder.id}/status?status=${newStatus}`
      );
      setOrders((prev) =>
        prev.map((o) =>
          o.id === modalOrder.id ? { ...o, orderStatus: newStatus } : o
        )
      );
      setModalOrder(null);
    } catch (e) {
      alert("Failed to update status");
    }
    setUpdating(false);
  };

  const statCards = [
    {
      label: "Total Orders",
      value: stats?.totalOrders ?? "-",
      icon: <ShoppingBag className="w-5 h-5 text-blue-600" />,
      bg: "bg-white",
      border: "border-gray-100 border-t-4 border-t-blue-500",
    },
    {
      label: "Confirmed",
      value: stats?.confirmedOrders ?? "-",
      icon: <CheckCircle className="w-5 h-5 text-[#10B981]" />,
      bg: "bg-white",
      border: "border-gray-100 border-t-4 border-t-[#10B981]",
    },
    {
      label: "Delivered",
      value: stats?.deliveredOrders ?? "-",
      icon: <Package className="w-5 h-5 text-[#10B981]" />,
      bg: "bg-white",
      border: "border-gray-100 border-t-4 border-t-emerald-600",
    },
    {
      label: "Pending",
      value: stats?.pendingOrders ?? "-",
      icon: <Clock className="w-5 h-5 text-orange-500" />,
      bg: "bg-white",
      border: "border-gray-100 border-t-4 border-t-orange-500",
    },
    {
      label: "Shipped",
      value: stats?.shippedOrders ?? "-",
      icon: <Truck className="w-5 h-5 text-purple-600" />,
      bg: "bg-white",
      border: "border-gray-100 border-t-4 border-t-purple-500",
    },
    {
      label: "Sales",
      value: `₹${stats?.totalRevenue ?? 0}`,
      icon: <DollarSign className="w-5 h-5 text-pink-600" />,
      bg: "bg-white",
      border: "border-gray-100 border-t-4 border-t-pink-500",
    },
  ];

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans text-gray-900 pb-20">
      
      {/* 1. Dashboard Header - Clean White */}
      <div className="bg-emerald-50/60 top-0 z-30 shadow-sm">
        <div className="max-w-8xl mx-auto px-4 md:px-8 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
             <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Order Management</h1>
             <p className="text-sm text-gray-500 mt-1">Manage orders across all branches</p>
          </div>

          {/* Date Filter & Action Button */}
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-lg border border-gray-200">
                <div className="px-2">
                  <Calendar size={16} className="text-gray-400" />
                </div>
              <input
                  type="date"
                  value={startDate}
                  max={endDate} // Prevent selecting a start date after end date
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 w-32 cursor-pointer"
                />
                <span className="text-gray-300">|</span>
                <input
                  type="date"
                  value={endDate}
                  min={startDate} // Prevent selecting an end date before start date
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:ring-0 text-gray-700 w-32 cursor-pointer"
                />
             </div>
             {/* Mimicking the "Add Inventory" button from screenshot */}
             {/*<button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                <RefreshCcw size={16} /> Sync
             </button>*/}
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 md:px-8 mt-8">
        
        {/* 2. Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5 mb-8">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow bg-white ${card.border}`}
            >
              <div className="flex justify-between items-start mb-4">
                 <div className="p-2 bg-gray-50 rounded-lg">
                   {card.icon}
                 </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{card.value}</h3>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mt-1">{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 3. Controls & Filters - Styled exactly like the screenshot's white filter bar */}
        <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row items-center gap-2">
           <div className="flex items-center gap-2 px-3 py-2 w-full md:w-auto border-r border-gray-100">
              <span className="text-sm font-medium text-gray-500 whitespace-nowrap">Filter by Status:</span>
           </div>
           
           {/* Status Dropdown - Clean */}
           <div className="relative w-full md:w-64">
              <select
                className="w-full appearance-none pl-3 pr-10 py-2 rounded-lg bg-gray-50 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer text-gray-700 border-none hover:bg-gray-100 transition-colors"
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value === "ALL"
                      ? "ALL"
                      : e.target.value
                  )
                }
              >
                <option value="ALL">All Statuses</option>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0) + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
           </div>

           {/* Search - Clean */}
           <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-white text-sm focus:outline-none focus:ring-0 placeholder-gray-400"
              />
           </div>

           <button 
                onClick={() => { setSearchTerm(""); setStatusFilter("ALL"); }}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition whitespace-nowrap"
            >
                Clear Filter
            </button>
        </div>

        {/* 4. Order Grid */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#10B981]"></div>
            <p className="mt-4 text-gray-500 font-medium">Loading...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
            <div className="bg-gray-50 p-4 rounded-full mb-3">
               <Package className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No orders found</h3>
            <p className="text-sm text-gray-500">Adjust filters to see results.</p>
          </div>
        ) : (
           <> 
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onUpdateClick={(o) => {
                  setModalOrder(o);
                  setNewStatus(o.orderStatus);
                }} 
              />
            ))}
          </div>
            <div className="flex justify-center items-center gap-4 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
        >
          Prev
        </button>
        <span>
          Page {page + 1} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => (p < totalPages - 1 ? p + 1 : p))}
          disabled={page >= totalPages - 1}
          className="px-3 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
        >
          Next
        </button>
      </div>
          </>
        )}
      </div>

      {/* 5. Modal - Clean Professional Look */}
      {modalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setModalOrder(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-emerald-500">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Update Status
              </h2>
              <button
                onClick={() => setModalOrder(null)}
                className="p-2 bg-emerald-600 rounded-full text-gray-900 transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="bg-[#f8fafc] p-4 rounded-xl border border-gray-100 mb-6">
                  <div className="flex justify-between items-center mb-2">
                     <span className="font-bold text-gray-900">Order #{modalOrder.id}</span>
                  </div>
                  <ul className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                    {modalOrder.orderItems.map((item, idx) => (
                      <li key={idx} className="flex justify-between text-sm text-gray-600 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                        <span className="truncate w-2/3">{item.productName}</span>
                        <span className="font-mono font-bold text-gray-900">x{item.quantity}</span>
                      </li>
                    ))}
                  </ul>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-gray-700">Select New Status</label>
                <div className="relative">
                    <select
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#10B981] focus:border-transparent transition shadow-sm appearance-none"
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        {statusOptions.map((s) => (
                        <option key={s} value={s}>
                            {s.charAt(0) + s.slice(1).toLowerCase()}
                        </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 pointer-events-none" />
                </div>
                
                {newStatus === "CANCELLED" && (
                    <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg text-xs">
                        <AlertCircle size={14} className="mt-0.5" />
                        <p>Warning: This will cancel the order and may trigger a refund process.</p>
                    </div>
                )}
              </div>

              <div className="mt-8 flex gap-3">
                 <button
                  className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-semibold hover:bg-gray-50 transition"
                  onClick={() => setModalOrder(null)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-lg bg-[#10B981] text-white font-bold hover:bg-emerald-600 transition shadow-lg hover:shadow-emerald-500/30 disabled:opacity-70 flex justify-center items-center gap-2"
                  onClick={handleStatusUpdate}
                  disabled={updating}
                >
                  {updating ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Order;