import React, { useState, useEffect } from 'react';
import { Plus, Package, Building2, Archive, CheckCircle, X, TrendingUp } from 'lucide-react';
import { categoryApi, rootApi } from '../../../axiosInstance';

// --- Success Modal Component ---
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-6 w-6 text-green-600" />
        </div>
        <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:text-sm"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

// --- Inventory Form Modal Component ---
const InventoryFormModal = ({ isOpen, onClose, onSave, triggerSuccess }) => {
  const [formData, setFormData] = useState({
    productId: '',
    branchId: '',
    stock: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [branches, setBranches] = useState([]);
  const rowsPerPageOptions = [10, 20, 50, 100];
  const [inventorySize] = useState(rowsPerPageOptions[rowsPerPageOptions.length - 1]);

  useEffect(() => {
    if (isOpen) {
      fetchProducts();
      fetchBranches();
      setFormData({
        productId: '',
        branchId: '',
        stock: '',
      });
      setErrors({});
    }
  }, [isOpen]);

  const fetchProducts = async () => {
  let allProducts = [];
  let page = 0;
  let last = false;
  const size = inventorySize; // Adjust as needed

  try {
    while (!last) {
      const response = await rootApi.get(`/api/products/activeProd?page=${page}&size=${size}`);
      const data = response.data.content || [];
      allProducts = [...allProducts, ...data];
      last = response.data.last;
      page += 1;
    }
    setProducts(allProducts);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const fetchBranches = async () => {
  let allBranches = [];
  let page = 0;
  let last = false;
  const size = inventorySize; // Adjust as needed

  try {
    while (!last) {
      const response = await rootApi.get(`/api/admin/branches?page=${page}&size=${size}`);
      const data = response.data.content || [];
      // Filter only if status exists and is not false
      const availableBranches = data.filter(branch =>
        !branch.hasOwnProperty('status') || branch.status !== false
      );
      allBranches = [...allBranches, ...availableBranches];
      last = response.data.last;
      page += 1;
    }
    setBranches(allBranches);
  } catch (error) {
    console.error('Error fetching branches:', error);
  }
};

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Please select a product';
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Please select a branch';
    }

    if (!formData.stock) {
      newErrors.stock = 'Stock is required';
    } else if (isNaN(formData.stock) || Number(formData.stock) < 0) {
      newErrors.stock = 'Stock must be a positive number';
    } else if (Number(formData.stock) > 1073741824) {
      newErrors.stock = 'Stock cannot exceed 1,073,741,824';
    } else if (!Number.isInteger(Number(formData.stock))) {
      newErrors.stock = 'Stock must be a whole number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        productId: Number(formData.productId),
        branchId: Number(formData.branchId),
        stock: Number(formData.stock),
      };

      await rootApi.post(`/api/admin/inventory`, payload);
      triggerSuccess('Inventory added successfully!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Error adding inventory:', error);
      const errorMessage = error.response?.data?.message || 'Failed to add inventory. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Add Inventory</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="productId"
                value={formData.productId}
                onChange={handleInputChange}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.productId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                }`}
              >
                <option>Select a product</option>
                {products.map(product => (
                  <option key={product.id} value={product.id}>
                    {product.productName} - {product.brand}
                  </option>
                ))}
              </select>
              {errors.productId && <p className="text-xs text-red-500 mt-1">{errors.productId}</p>}
            </div>

            {/* Branch Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                name="branchId"
                value={formData.branchId}
                onChange={handleInputChange}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.branchId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                }`}
              >
                <option>Select a branch</option>
                {branches.map(branch => (
                  <option key={branch.id} value={branch.id}>
                    {branch.branchName} ({branch.branchCode}) - {branch.location}
                  </option>
                ))}
              </select>
              {errors.branchId && <p className="text-xs text-red-500 mt-1">{errors.branchId}</p>}
            </div>

            {/* Stock Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Stock <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                placeholder="Enter stock quantity"
                min="0"
                step="1"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${
                  errors.stock ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-500'
                }`}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Adding Inventory...' : 'Add Inventory'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main Inventory Component ---
export default function Inventory() {
  const [inventories, setInventories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [products, setProducts] = useState({});
  const [branches, setBranches] = useState({});
  const [selectedProductFilter, setSelectedProductFilter] = useState('ALL'); // Changed from '' to 'ALL'
  const [productsList, setProductsList] = useState([]);
  const rowsPerPageOptions = [10, 20, 50, 100];
  const [pageSize, setPageSize]  = useState(rowsPerPageOptions[rowsPerPageOptions.length - 1]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalInventories, setTotalInventories] = useState(0);
 
 

  useEffect(() => {
    fetchProductsMap();
    fetchBranchesMap();
    fetchProductsList();
    fetchInventories(); // Add this to fetch all inventories on mount
  }, []);

useEffect(() => {
  fetchInventories(page, pageSize);
  // eslint-disable-next-line
}, [selectedProductFilter, page, pageSize]);

useEffect(() => {
  setPage(1);
}, [selectedProductFilter, pageSize]);
  // Add this new function to fetch all inventories
  //const fetchAllInventories = async () => {
  //  try {
  //    setLoading(true);
  //    const response = await rootApi.get(`/api/admin/inventory`);
  //    setInventories(response.data || []);
  //  } catch (error) {
  //    console.error('Error fetching all inventories:', error);
  //    alert('Failed to load inventories. Please try again.');
  //  } finally {
  //    setLoading(false);
  //  }
  //};

 const fetchInventories = async (pageNumber = 1, size = pageSize) => {
  try {
    setLoading(true);
    let response;
    if (selectedProductFilter === 'ALL') {
      response = await rootApi.get(`/api/admin/inventory?page=${pageNumber - 1}&size=${size}`);
    } else {
      response = await rootApi.get(`/api/admin/inventory/product/${selectedProductFilter}?page=${pageNumber - 1}&size=${size}`);
    }
    const data = response.data;
    setInventories((data.content || []).sort((a, b) => a.inventoryId - b.inventoryId));
    setTotalPages(data.totalPages || 1);
    setPage(pageNumber);
    setTotalInventories(data.totalElements || 0);
  } catch (error) {
    setInventories([]);
    setTotalPages(1);
    setPage(1);
    console.error('Error fetching inventories:', error);
    alert('Failed to load inventories. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const fetchProductsList = async () => {
  let allProducts = [];
  let page = 0;
  let last = false;
  const size = 1000; // Adjust as needed

  try {
    while (!last) {
      const response = await rootApi.get(`/api/products/activeProd?page=${page}&size=${size}`);
      const data = response.data.content || [];
      allProducts = [...allProducts, ...data];
      last = response.data.last;
      page += 1;
    }
    setProductsList(allProducts);
  } catch (error) {
    console.error('Error fetching products list:', error);
  }
};


  const fetchProductsMap = async () => {
  let productMap = {};
  let page = 0;
  let last = false;
  const size = 1000;

  try {
    while (!last) {
      const response = await rootApi.get(`/api/products/activeProd?page=${page}&size=${size}`);
      const data = response.data.content || [];
      data.forEach(product => {
        productMap[product.id] = product;
      });
      last = response.data.last;
      page += 1;
    }
    setProducts(productMap);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

  const fetchBranchesMap = async () => {
  let branchMap = {};
  let page = 0;
  let last = false;
  const size = 1000;

  try {
    while (!last) {
      const response = await rootApi.get(`/api/admin/branches?page=${page}&size=${size}`);
      const data = response.data.content || [];
      data.forEach(branch => {
        branchMap[branch.id] = branch;
      });
      last = response.data.last;
      page += 1;
    }
    setBranches(branchMap);
  } catch (error) {
    console.error('Error fetching branches:', error);
  }
};

  const handleAddNewClick = () => {
    setIsModalOpen(true);
  };

  const showSuccessMessage = (msg) => {
    setSuccessModal({ isOpen: true, message: msg });
  };

  const getProductDetails = (productId) => {
    return products[productId] || { productName: 'Unknown Product', brand: '' };
  };

  const getBranchDetails = (branchId) => {
    return branches[branchId] || { branchName: 'Unknown Branch', branchCode: '', location: '' };
  };

  return (
    <div className="min-h-screen  bg-emerald-50/60 p-4 sm:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                Inventory Management
              </h1>
              <p className="text-gray-600">Manage stock across all branches</p>
            </div>
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition shadow-lg hover:shadow-xl"
            >
              <Plus size={20} />
              <span>Add Inventory</span>
            </button>
          </div>
        </div>

        {/* Filter Section */}
<div className="mb-6 flex items-center gap-4 bg-white p-4 rounded-xl shadow-md">
  <label className="text-sm font-semibold text-gray-700">Filter by Product:</label>
  <select
    value={selectedProductFilter}
    onChange={(e) => setSelectedProductFilter(e.target.value)}
    className="flex-1 max-w-md p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  >
    <option>Select a product</option>
    <option value="ALL">All Products</option>
    {productsList.map(product => (
      <option key={product.id} value={product.id}>
        {product.productName} - {product.brand}
      </option>
    ))}
  </select>
  {selectedProductFilter && (
    <button
      onClick={() => setSelectedProductFilter('')}
      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition"
    >
      Clear Filter
    </button>
  )}
  <div className="ml-auto text-lg font-semibold text-gray-700">
    Total: <span className="text-blue-600">{totalInventories}</span>
  </div>
</div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            {/* Inventory Grid */}
            {inventories.length === 0 ? (
              <div className="text-center py-20">
                <Package className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  {selectedProductFilter ? 'No Inventory Records for Selected Product' : 'Select a Product to View Inventory'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {selectedProductFilter 
                    ? 'Try selecting a different product or add inventory for this product' 
                    : 'Please select a product from the dropdown above to view its inventory'}
                </p>
                {selectedProductFilter && (
                  <button
                    onClick={handleAddNewClick}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    <Plus size={18} />
                    Add Inventory
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
  {inventories.map((inventory) => {
    // --- YOUR LOGIC (UNCHANGED) ---
    const product = getProductDetails(inventory.productId);
    const branch = getBranchDetails(inventory.branchId);
    const totalStock = inventory.availableStock + inventory.reservedStock;
    const availablePercentage = totalStock > 0 ? (inventory.availableStock / totalStock) * 100 : 0;
    // ------------------------------

    return (
      <div
        key={inventory.inventoryId}
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col"
      >
        {/* Decorative Top Accent */}
        <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-600" />

        <div className="p-6 flex-1 flex flex-col">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                {product.brand || "Generic"}
              </p>
              <h3 className="text-xl font-bold text-gray-800 line-clamp-2 leading-tight group-hover:text-emerald-700 transition-colors">
                {product.productName}
              </h3>
            </div>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
              <Package size={20} />
            </div>
          </div>

          {/* Branch Badge (Pill Style) */}
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100 text-xs text-gray-600">
              <Building2 size={14} className="text-gray-400" />
              <span className="font-medium text-gray-700 truncate max-w-[200px]">
                {branch.branchName}
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">{branch.location}</span>
            </div>
          </div>

          {/* Main Stock Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            {/* Available Box */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100/50 text-center">
              <div className="flex justify-center items-center gap-1.5 text-emerald-600 mb-1">
                <TrendingUp size={14} />
                <span className="text-xs font-semibold uppercase">Available</span>
              </div>
              <span className="text-2xl font-bold text-emerald-700 block tracking-tight">
                {inventory.availableStock.toLocaleString()}
              </span>
            </div>

            {/* Reserved Box */}
            <div className="p-3 rounded-xl bg-orange-50/50 border border-orange-100/50 text-center">
              <div className="flex justify-center items-center gap-1.5 text-orange-600 mb-1">
                <Archive size={14} />
                <span className="text-xs font-semibold uppercase">Reserved</span>
              </div>
              <span className="text-2xl font-bold text-orange-700 block tracking-tight">
                {inventory.reservedStock.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Total Stock & Progress - Pushed to bottom of flex container */}
          <div className="mt-auto space-y-3">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-gray-400 font-medium mb-0.5">Total Inventory</p>
                <p className="text-3xl font-extrabold text-gray-800">
                  {totalStock.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-gray-700">{availablePercentage.toFixed(0)}%</span>
                <span className="text-xs text-gray-400 ml-1">Utilization</span>
              </div>
            </div>

            {/* Custom Progress Bar */}
            <div className="relative w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`absolute top-0 left-0 h-full rounded-full transition-all duration-500 ease-out ${
                   availablePercentage < 20 ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-600'
                }`}
                style={{ width: `${availablePercentage}%` }}
              >
                {/* Shine effect on progress bar */}
                <div className="absolute top-0 right-0 bottom-0 w-full bg-gradient-to-l from-white/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer / ID */}
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center text-xs">
           <span className="text-gray-400">ID: <span className="font-mono text-gray-500">{inventory.inventoryId}</span></span>
           <span className="text-emerald-600 font-medium cursor-pointer hover:underline">View Details</span>
        </div>
      </div>
    );
  })}

</div>
     
            )}
            <div className="flex justify-center items-center gap-4 mt-3">
  <div>
    <label className="mr-2 font-medium text-gray-700">Rows per page:</label>
    <select
      value={pageSize}
      onChange={e => setPageSize(Number(e.target.value))}
      className="border rounded px-2 py-1"
    >
      {rowsPerPageOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
  <button
    onClick={() => setPage(p => Math.max(1, p - 1))}
    disabled={page === 1}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Prev</button>
  <span>Page {page} / {totalPages}</span>
  <button
    onClick={() => setPage(p => (p < totalPages ? p + 1 : p))}
    disabled={page >= totalPages}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Next</button>
</div>
          </>
        )}
      </div>

      {/* Modals */}
      <InventoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchInventories}
        triggerSuccess={showSuccessMessage}
      />

      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => {
          setSuccessModal({ isOpen: false, message: '' });
        }}
        message={successModal.message}
      />
    </div>
  );
}