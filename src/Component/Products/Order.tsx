import React, { useState } from "react";
import { X, ShoppingBag, Truck, CheckCircle, Package } from "lucide-react"; // Assuming you have lucide-react, or use SVGs

// --- Static Data ---
const categories = [
  "All",
  "Cold Pressed Oils",
  "Pickles",
  "Spices",
  "Honey",
  "Snacks",
  "Dry Fruits",
];

type OrderStatus = "Delivered" | "Pending";
type Order = {
  id: number;
  user: string;
  address: string;
  category: string;
  product: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  date: string;
  image: string;
};

const orders: Order[] = [
  {
    id: 1,
    user: "Ravi Kumar",
    address: "12-34, MG Road, Hyderabad, Telangana",
    category: "Cold Pressed Oils",
    product: "Groundnut Oil",
    quantity: 2,
    price: 900,
    status: "Pending",
    date: "2026-01-07",
    image: "https://images.unsplash.com/photo-1720468750623-39e9a09f5067?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y29va2luZyUyMG9pbHxlbnwwfHwwfHx8MA%3D%3D", // Replace with your image path
  },
  {
    id: 2,
    user: "Sita Reddy",
    address: "45-67, Jubilee Hills, Hyderabad, Telangana",
    category: "Pickles",
    product: "Mango Pickle",
    quantity: 1,
    price: 250,
    status: "Delivered",
    date: "2026-01-06",
    image: "https://images.unsplash.com/photo-1664791461482-79f5deee490f?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFuZ28lMjBwaWNrbGV8ZW58MHx8MHx8fDA%3D",
  },
  {
    id: 3,
    user: "Anil Sharma",
    address: "23, Park Street, Guntur, Andhra Pradesh",
    category: "Spices",
    product: "Turmeric Powder",
    quantity: 3,
    price: 360,
    status: "Pending",
    date: "2026-01-08",
    image: "https://plus.unsplash.com/premium_photo-1726862790171-0d6208559224?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fFR1cm1lcmljJTIwUG93ZGVyfGVufDB8fDB8fHww",
  },
  {
    id: 4,
    user: "Priya Singh",
    address: "78, Anna Nagar, Chennai, Tamil Nadu",
    category: "Honey",
    product: "Wild Honey",
    quantity: 1,
    price: 350,
    status: "Delivered",
    date: "2026-01-05",
    image: "https://images.unsplash.com/photo-1584389344735-f73aa9678f6a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fHdpbGQlMjBIb25leXxlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 5,
    user: "Vikram Patel",
    address: "56, SG Highway, Ahmedabad, Gujarat",
    category: "Snacks",
    product: "Murukku",
    quantity: 4,
    price: 400,
    status: "Pending",
    date: "2026-01-08",
    image: "https://media.istockphoto.com/id/1152670096/photo/rice-chakli-sticks.webp?a=1&b=1&s=612x612&w=0&k=20&c=BXYaOKyntUY5ZTggtSL6o8GMCej-YfEoOjfKqAeSpfs=",
  },
  {
    id: 6,
    user: "Lakshmi Nair",
    address: "90, Marine Drive, Kochi, Kerala",
    category: "Dry Fruits",
    product: "Almonds",
    quantity: 2,
    price: 600,
    status: "Delivered",
    date: "2026-01-04",
    image: "https://plus.unsplash.com/premium_photo-1675237625910-e5d354c03987?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8QWxtb25kc3xlbnwwfHwwfHx8MA%3D%3D",
  },
  {
    id: 7,
    user: "Rahul Das",
    address: "11, Salt Lake, Kolkata, West Bengal",
    category: "Cold Pressed Oils",
    product: "Sesame Oil",
    quantity: 1,
    price: 550,
    status: "Pending",
    date: "2026-01-08",
    image: "https://images.unsplash.com/photo-1640958903174-936043ea7c17?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c2VzYW1lJTIwb2lsfGVufDB8fDB8fHww",
  },
];

// --- Main Component ---
const Order: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Delivered" | "Pending">("All");
  
  // State for Confirmed Orders Modal
  const [confirmedOrders, setConfirmedOrders] = useState<Order[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter orders by category and status
 const filteredOrders = orders
  .filter((order) => {
    const matchCategory = selectedCategory === "All" || order.category === selectedCategory;
    const matchStatus = statusFilter === "All" || order.status === statusFilter;
    return matchCategory && matchStatus;
  })
  .sort((a, b) => {
    if (statusFilter === "All") {
      if (a.status === b.status) return 0;
      if (a.status === "Pending") return -1;
      return 1;
    }
    return 0;
  });

  // Handle Confirm Order (Adds to the confirmed list)
  const handleConfirmOrder = (order: Order) => {
    // Check if already confirmed to avoid duplicates
    if (!confirmedOrders.some((o) => o.id === order.id)) {
      setConfirmedOrders([...confirmedOrders, order]);
      alert(`Order #${order.id} confirmed successfully!`);
    } else {
      alert(`Order #${order.id} is already in the confirmed list.`);
    }
  };

  // Handle Dispatch Logic
  const handleDispatch = (id: number) => {
    alert(`Order #${id} has been Dispatched!`);
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 font-sans text-gray-800">
      
      {/* --- Top Navbar --- */}
      <main className="max-w-8xl  mx-auto px-4 py-8">
        
        {/* --- Filters Section --- */}
        <div className="mb-8  space-y-4">
            {/* Category Pills */}
           <div className="overflow-x-auto pb-2 scrollbar-hide">
              <div className="flex items-center justify-between mt-5 gap-2">
                {/* Category Pills */}
                <nav className="flex gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`whitespace-nowrap px-5 py-2 rounded-full font-medium text-sm transition-all duration-300 border
                        ${
                          selectedCategory === cat
                            ? "bg-[#1f4d36] text-white border-[#1f4d36] shadow-lg transform scale-105"
                            : "bg-white text-gray-600 border-gray-200 hover:border-[#1f4d36] hover:text-[#1f4d36]"
                        }
                      `}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </nav>
                {/* Confirmed Orders Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="relative flex items-center gap-2 bg-[#facc15] text-[#1f4d36] px-5 py-2 rounded-full font-bold shadow-md hover:bg-[#fde047] transition-all active:scale-95 ml-2 mr-3"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Confirmed Orders</span>
                  {confirmedOrders.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 flex items-center justify-center rounded-full border-2 border-[#1f4d36]">
                      {confirmedOrders.length}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Status Dropdown */}
            <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-[#1f4d36]">All Orders</h2>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500">Filter by Status:</span>
                <select
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1f4d36] transition cursor-pointer"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="All">Show All</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>
        </div>

        {/* --- Main Orders Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400">
              <Package className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg font-medium">No orders found matching your filters.</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="group bg-white  rounded-2xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Card Header */}
                <div className="border-b h-64 border-gray-100 bg-gray-50/50 flex flex-col items-stretch p-0">
  {/* Product Image Full Width, rounded only at the top */}
  <img
    src={order.image}
    alt={order.product}
    className="w-full h-64 object-cover rounded-t-2xl"
    loading="lazy"
  />
  <div className="flex justify-between items-start mt-5 px-5">
    <div>
      <h3 className="font-bold text-[#1f4d36] text-lg">{order.product}</h3>
      <p className="text-xs text-gray-500 mt-1">{order.category}</p>
    </div>
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
        ${
          order.status === "Delivered"
            ? "bg-green-100 text-green-700"
            : "bg-amber-100 text-amber-700"
        }
      `}
    >
      {order.status}
    </span>
  </div>
</div>

                {/* Card Body */}
                <div className="p-5 flex-grow mt-10 space-y-3">
                  <div className="flex justify-between items-center mt-2 text-sm">
                     <span className="text-gray-500">Price</span>
                     <span className="font-bold text-lg text-[#1f4d36]">₹{order.price}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Quantity</span>
                     <span className="font-semibold">{order.quantity} Pack(s)</span>
                  </div>
                  
                  <div className="pt-2 border-t border-gray-100 mt-2">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Customer Details</p>
                    <p className="text-sm text-gray-600 truncate"><span className="font-medium">User:</span> {order.user}</p>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed"><span className="font-medium">Address:</span> {order.address}</p>
                    <p className="text-xs text-gray-600 mt-2 text-right"><span className="font-medium">Date:</span>{order.date}</p>
                  </div>
                </div>

                {/* Card Footer (Action Button) */}
                {order.status === "Pending" && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100">
                    <button
                      className="w-full py-2.5 rounded-xl bg-[#1f4d36] text-white font-semibold shadow hover:bg-[#163826] active:scale-95 transition-all flex items-center justify-center gap-2"
                      onClick={() => handleConfirmOrder(order)}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirm Order
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>

      {/* --- CONFIRMED ORDERS MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="bg-[#1f4d36] text-white p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-[#facc15]" />
                        <h2 className="text-xl font-bold">Confirmed Orders Queue</h2>
                    </div>
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-6 overflow-y-auto bg-gray-50 flex-grow">
                    {confirmedOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                            <ShoppingBag className="w-12 h-12 mb-3 opacity-30" />
                            <p>No orders have been confirmed yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {confirmedOrders.map((order, index) => (
                                <div key={`${order.id}-${index}`} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-3">
                                    <div className="flex justify-between items-start border-b border-gray-100 pb-2">
                                        <div>
                                            <p className="font-bold text-[#1f4d36]">{order.product}</p>
                                            <p className="text-xs text-gray-500">Order ID: #{order.id}</p>
                                        </div>
                                        <span className="bg-[#facc15]/20 text-[#854d0e] text-xs font-bold px-2 py-1 rounded">
                                            Ready
                                        </span>
                                    </div>
                                    
                                    <div className="text-sm space-y-1 text-gray-600">
                                        <p><span className="font-semibold">User:</span> {order.user}</p>
                                        <p><span className="font-semibold">Qty:</span> {order.quantity}</p>
                                        <p><span className="font-semibold">Address:</span> {order.address}</p>
                                    </div>

                                    <button
                                        onClick={() => handleDispatch(order.id)}
                                        className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Truck className="w-4 h-4" />
                                        Dispatched
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-white flex justify-end shrink-0">
                    <button 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default Order;