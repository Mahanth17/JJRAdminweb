import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Archive,
  Trash2,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Edit2,
  ShoppingCart,
  Power,
  CheckCircle,
  Search, // Added Search icon
} from 'lucide-react';
import axios from 'axios';
import { categoryApi } from '../../../axiosInstance';
import { div } from 'framer-motion/client';

const API_BASE_URL = 'http://192.168.0.233:8083';

// --- Component: Success Modal ---
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

// --- Component: Product Form Modal ---
const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit, triggerSuccess }) => {
  const [formData, setFormData] = useState({
    productName: productToEdit?.productName || '',
    categoryId: productToEdit?.categoryId || '',
    brand: productToEdit?.brand || '',
    description: productToEdit?.description || '',
    discount: productToEdit?.discount || '',
    returnDays: productToEdit?.returnDays || '',
    mrp: productToEdit?.mrp || '',
    unit: productToEdit?.unit || '',
    netWeight: productToEdit?.netWeight || '',
  });
  
  // Validation Error State
  const [errors, setErrors] = useState({});

  const [productImages, setProductImages] = useState([]);
  const [existingImages, setExistingImages] = useState(
    productToEdit?.imageUrls?.map((url, index) => ({ id: index, imageUrl: url })) || []
  );
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const rowsPerPageOptions = [10, 20, 50, 100];
  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(rowsPerPageOptions[0]);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);
  const [categoryTotalElements, setCategoryTotalElements] = useState(0);

  // Unit types enum
  const UNIT_TYPES = ['KG', 'GRAM', 'LITRE', 'ML', 'PIECE', 'PACKET'];

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setErrors({}); // Clear errors when modal opens
    }
  }, [isOpen]);

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        productName: productToEdit.productName || '',
        categoryId: productToEdit.categoryId || '',
        brand: productToEdit.brand || '',
        description: productToEdit.description || '',
        discount: productToEdit.discount || '',
        returnDays: productToEdit.returnDays || '',
        mrp: productToEdit.mrp || '',
        unit: productToEdit.unit || '',
        netWeight: productToEdit.netWeight || '',
      });
      setExistingImages(
        productToEdit.imageUrls?.map((url, index) => ({ id: index, imageUrl: url })) || []
      );
    }
  }, [productToEdit]);

const fetchCategories = async (pageNum = categoryPage, size = categoryPageSize) => {
  try {
    const response = await categoryApi.get(`/api/category/Active?page=${pageNum - 1}&size=${size}`);
    const data = response.data;
    // Always sort by id descending (in case backend doesn't)
    const sortedCategories = (data.content || []).sort((a, b) => b.id - a.id);
    setCategories(sortedCategories);
    setCategoryTotalPages(data.totalPages || 1);
    setCategoryTotalElements(data.totalElements || 0);
  } catch (error) {
    console.error('Error fetching categories:', error);
    alert('Failed to load categories');
  }
};

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field on change
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setProductImages((prev) => [...prev, ...files]);
    if (errors.images) setErrors(prev => ({ ...prev, images: null }));
  };

  const removeCurrentImage = () => {
    const totalExisting = existingImages.length;
    
    if (currentImageIdx < totalExisting) {
      setExistingImages((prev) => prev.filter((_, idx) => idx !== currentImageIdx));
      if (currentImageIdx >= existingImages.length - 1 && currentImageIdx > 0) {
        setCurrentImageIdx(currentImageIdx - 1);
      }
    } else {
      const newIdx = currentImageIdx - totalExisting;
      setProductImages((prev) => prev.filter((_, idx) => idx !== newIdx));
      if (currentImageIdx > 0) {
        setCurrentImageIdx(currentImageIdx - 1);
      }
    }
  };

  const removeAllOldImages = () => {
    if (window.confirm('Are you sure you want to delete all existing images? This action cannot be undone.')) {
      setExistingImages([]);
      setCurrentImageIdx(0);
    }
  };

  const allImages = [
    ...existingImages.map(img => ({ url: img.imageUrl, type: 'existing', id: img.id })),
    ...productImages.map(file => ({ url: URL.createObjectURL(file), type: 'new', file }))
  ];

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  // --- Validation Logic ---
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.productName.trim()) { newErrors.productName = "Product Name is required"; isValid = false; }
    if (!formData.categoryId) { newErrors.categoryId = "Category is required"; isValid = false; }
    if (!formData.brand.trim()) { newErrors.brand = "Brand is required"; isValid = false; }
    if (!formData.description.trim()) { newErrors.description = "Description is required"; isValid = false; }
    
    if (!formData.unit) { newErrors.unit = "Unit Type is required"; isValid = false; }
    
    if (!formData.netWeight || parseFloat(formData.netWeight) <= 0) { 
        newErrors.netWeight = "Valid Net Weight is required"; isValid = false; 
    }
    
    if (!formData.mrp || parseFloat(formData.mrp) <= 0) { 
        newErrors.mrp = "Valid MRP is required"; isValid = false; 
    }

    if (formData.discount && (parseFloat(formData.discount) < 0 || parseFloat(formData.discount) > 100)) {
        newErrors.discount = "Discount must be 0-100"; isValid = false;
    }

    // Image validation for new products
    if (!productToEdit && productImages.length === 0) {
        newErrors.images = "At least one image is required for new products"; isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check validation
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      
      productImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      if (productToEdit) {
        const url = `/api/products/update/${productToEdit.id}?productName=${encodeURIComponent(formData.productName)}&brand=${encodeURIComponent(formData.brand)}&description=${encodeURIComponent(formData.description)}&discount=${formData.discount}&returnDays=${formData.returnDays}&mrp=${formData.mrp}&unit=${encodeURIComponent(formData.unit)}&netWeight=${formData.netWeight}`;
        await categoryApi.put(url, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        triggerSuccess('Successfully Updated');
      } else {
        const url = `/api/products/add/${formData.categoryId}?productName=${encodeURIComponent(formData.productName)}&brand=${encodeURIComponent(formData.brand)}&description=${encodeURIComponent(formData.description)}&discount=${formData.discount}&returnDays=${formData.returnDays}&mrp=${formData.mrp}&unit=${encodeURIComponent(formData.unit)}&netWeight=${formData.netWeight}`;
        await categoryApi.post(url, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        triggerSuccess('Successfully Created');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Failed to ${productToEdit ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">
            {productToEdit ? 'Edit Product' : 'New Product'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Product Images <span className="text-red-500">*</span>
                </label>
                {productToEdit && existingImages.length > 0 && (
                  <button
                    type="button"
                    onClick={removeAllOldImages}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 size={14} />
                    Delete All Old Images
                  </button>
                )}
              </div>

              {productToEdit && (
                <div className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-xs text-blue-800">
                    <strong>Existing:</strong> {existingImages.length} images | 
                    <strong> New:</strong> {productImages.length} images
                  </p>
                </div>
              )}

              {allImages.length > 0 ? (
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group mb-3">
                  <img
                    src={allImages[currentImageIdx].url}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                  
                  <div className="absolute top-2 left-2 z-10">
                    <span className={`text-xs font-bold px-2 py-1 rounded ${
                      allImages[currentImageIdx].type === 'existing' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-green-500 text-white'
                    }`}>
                      {allImages[currentImageIdx].type === 'existing' ? 'Existing' : 'New'}
                    </span>
                  </div>

                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-between px-4">
                    {allImages.length > 1 && (
                      <>
                        <button type="button" onClick={prevImage} className="p-1 bg-white/80 text-gray-800 rounded-full hover:bg-white">
                          <ChevronLeft size={24} />
                        </button>
                        <button type="button" onClick={nextImage} className="p-1 bg-white/80 text-gray-800 rounded-full hover:bg-white">
                          <ChevronRight size={24} />
                        </button>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={removeCurrentImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIdx + 1} / {allImages.length}
                  </div>
                </div>
              ) : null}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${errors.images ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600'}`}
              >
                <UploadCloud size={32} className="mb-2" />
                <span className="text-sm font-medium">
                  {allImages.length > 0 ? "Add More Images" : "Click to upload images"}
                </span>
              </button>
              {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.categoryId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                disabled={!!productToEdit}
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
            </div>

            {/* Product Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleInputChange}
                placeholder="Product Name"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.productName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
              />
              {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Brand Name"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.brand ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
              />
              {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Product Description"
                rows="3"
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
              />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Unit Type and NetWeight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Unit Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.unit ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                >
                  <option value="">Select Unit</option>
                  {UNIT_TYPES.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
                {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  NetWeight <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="netWeight"
                  value={formData.netWeight}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.netWeight ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                />
                {errors.netWeight && <p className="text-xs text-red-500 mt-1">{errors.netWeight}</p>}
              </div>
            </div>

            {/* MRP, Discount, Return Days */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  MRP (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="mrp"
                  value={formData.mrp}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  step="0.01"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.mrp ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                />
                {errors.mrp && <p className="text-xs text-red-500 mt-1">{errors.mrp}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  max="100"
                  className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.discount ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                />
                {errors.discount && <p className="text-xs text-red-500 mt-1">{errors.discount}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Return Days
                </label>
                <input
                  type="number"
                  name="returnDays"
                  value={formData.returnDays}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Saving...' : (productToEdit ? 'Update Product' : 'Save Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
// --- Deactivate Confirmation Modal ---
const DeactivateModal = ({ isOpen, onClose, onConfirm, product, isActivating }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {isActivating ? 'Activate Product?' : 'Deactivate Product?'}
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {isActivating ? 'activate' : 'deactivate'} "<strong>{product?.productName}</strong>"?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-6 py-2 rounded-lg font-bold transition shadow-lg ${
              isActivating
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            Yes, {isActivating ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component: Main Products Page ---
export default function Products() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({});
  const [loading, setLoading] = useState(false);
  const [showInactive, setShowInactive] = useState(false);
  const [deactivateModal, setDeactivateModal] = useState({ isOpen: false, product: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [searchQuery, setSearchQuery] = useState(''); // Added search state
  const rowsPerPageOptions = [10, 20, 50, 100];
  const [productsPage, setProductsPage] = useState(1);
  const [pageSize, setPageSize] = useState(rowsPerPageOptions[0]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);


useEffect(() => {
  fetchProducts(productsPage, pageSize);
  // eslint-disable-next-line
}, [productsPage, pageSize, showInactive]);

const fetchProducts = async (pageNum = productsPage, size = pageSize) => {
  try {
    setLoading(true);
    const endpoint = showInactive ? '/api/products/inActive' : '/api/products/activeProd';
    // Add pagination and sort params
    const response = await categoryApi.get(`${endpoint}?page=${pageNum - 1}&size=${size}`);
    const data = response.data;
    // Always sort by id descending (in case backend doesn't)
    const sortedProducts = (data.content || []).sort((a, b) => b.id - a.id);
    setProducts(sortedProducts);
    setTotalPages(data.totalPages || 1);
    setTotalElements(data.totalElements || 0);
  } catch (error) {
    console.error('Error fetching products:', error);
    alert('Failed to load products');
  } finally {
    setLoading(false);
  }
};

  
  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handlePrevImage = (e, productId, imagesLength) => {
    e.stopPropagation();
    setImageIndexes((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] || 0) > 0
          ? (prev[productId] || 0) - 1
          : imagesLength - 1,
    }));
  };

  const handleNextImage = (e, productId, imagesLength) => {
    e.stopPropagation();
    setImageIndexes((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] || 0) < imagesLength - 1
          ? (prev[productId] || 0) + 1
          : 0,
    }));
  };

  const handleToggleStatus = (product) => {
    setDeactivateModal({ isOpen: true, product });
  };

  const showSuccessMessage = (msg) => {
    setSuccessModal({ isOpen: true, message: msg });
  };

  const handleAfterAction = () => {
  fetchProducts(productsPage, pageSize);
};
  const confirmToggleStatus = async () => {
    const product = deactivateModal.product;
    const newStatus = !product.status;

    try {
      await categoryApi.put(`/api/products/status/${product.id}?status=${newStatus}`);
      setDeactivateModal({ isOpen: false, product: null });
      fetchProducts();
      showSuccessMessage(newStatus ? 'Successfully Activated' : 'Successfully Deactivated');
    } catch (error) {
      console.error('Error toggling product status:', error);
      alert('Failed to update product status');
    }
  };

  // Filter products based on search query
  const filteredProducts = products.filter(product =>
    product.productName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-emerald-50/60 p-8 font-sans">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Products
          </h1>
          <div className="relative w-[850px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold border ${
                showInactive
                  ? 'bg-gray-600 text-white border-gray-600'
                  : 'bg-white text-gray-600 border-gray-200'
              }`}
            >
              <Archive size={18} />
              {showInactive ? 'Active Items' : 'Inactive Items'}
            </button>
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full shadow-md hover:bg-gray-800 transition-all text-sm font-bold"
            >
              <Plus size={20} /> Add New
            </button>
          </div>
        </header>
        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
        ) : (
          <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
               const currentImgIndex = imageIndexes[product.id] || 0;
               const currentImg = product.imageUrls?.[currentImgIndex] || 'https://via.placeholder.com/400x500?text=No+Image';
               
               // --- FIX: Logic to handle Dynamic vs Manual Discount ---
               const dynamicDiscountValue = product.discountAmount; // From Coupon/Discount API
               const manualDiscountValue = product.discount; // From manual entry
               
               // Determine which discount to show (Dynamic takes priority if exists)
               const displayDiscountValue = dynamicDiscountValue !== null ? dynamicDiscountValue : manualDiscountValue;
               const displayDiscountType = product.discountType || 'PERCENT'; // Assuming manual is always percent
               
               // Use finalPrice if available, else calculate manually
               const finalPrice = product.finalPrice ? product.finalPrice : product.mrp;
               
              return (
                <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative">
                  {!product.status && (
                    <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center">
                      <span className="text-gray-800 font-extrabold text-2xl tracking-widest opacity-80">DEACTIVATED</span>
                      <button onClick={(e) => { e.stopPropagation(); handleToggleStatus(product); }} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white border rounded-full shadow-sm text-xs font-semibold hover:bg-gray-50">
                        <Power size={14} className="text-green-600" /> Activate
                      </button>
                    </div>
                  )}

                  <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={currentImg} alt={product.productName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    {product.imageUrls?.length > 1 && (
                      <>
                        <button onClick={(e) => handlePrevImage(e, product.id, product.imageUrls.length)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronLeft size={20} /></button>
                        <button onClick={(e) => handleNextImage(e, product.id, product.imageUrls.length)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><ChevronRight size={20} /></button>
                      </>
                    )}
                  </div>

                  <div className="flex flex-col flex-grow p-5 bg-white relative">
                    <div className="flex items-start justify-between mb-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 uppercase">{product.brand}</span>
                        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase border ${product.status ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-green-500' : 'bg-red-500'}`}></span> {product.status ? 'Active' : 'Inactive'}
                        </div>
                    </div>

                    <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">{product.productName}</h3>

                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-2xl font-bold text-slate-900">₹{finalPrice?.toLocaleString()}</span>
                        
                        {/* --- FIX: Display Discount Badge correctly --- */}
                        {displayDiscountValue > 0 && (
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                {displayDiscountType === 'FLAT' ? `₹${displayDiscountValue} OFF` : `${displayDiscountValue}% OFF`}
                            </span>
                        )}
                        
                        {/* Show Original MRP Crossed out if discount exists */}
                        {displayDiscountValue > 0 && (
                          <div>
                           <span className="text-xs font-medium text-gray-500">MRP:</span> <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                          </div>
                        )}
                    </div>

                    <p className="text-xs text-gray-400 mb-3">Unit: {product.unit} | NetWeight: {product.netWeight}</p>

                    <div className="flex items-center gap-3 pt-1 mt-auto">
                        <button onClick={() => handleEditClick(product)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"><Edit2 size={16} /> Update</button>
                        <button onClick={() => handleToggleStatus(product)} className={`px-4 py-2.5 rounded-lg border transition-all font-semibold text-sm flex items-center justify-center gap-2 ${product.status ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'}`}>
                            <Power size={16} /> {product.status ? 'Deactivate' : 'Activate'}
                        </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-center items-center gap-4 mt-3">
  <div>
    <label className="mr-2 font-medium text-gray-700">Rows per page:</label>
    <select
      value={pageSize}
      onChange={e => {
        setPageSize(Number(e.target.value));
        setProductsPage(1); // Reset to first page when size changes
      }}
      className="border rounded px-2 py-1"
    >
      {rowsPerPageOptions.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
  <button
    onClick={() => setProductsPage(p => Math.max(1, p - 1))}
    disabled={productsPage === 1}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Prev</button>
  <span>Page {productsPage} / {totalPages}</span>
  <button
    onClick={() => setProductsPage(p => (p < totalPages ? p + 1 : p))}
    disabled={productsPage >= totalPages}
    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
  >Next</button>
  <span className="ml-4 text-gray-500 text-sm">Total: {totalElements}</span>
</div>
          </>
        )}
       
        {!loading && filteredProducts.length === 0 && (
          <div className="text-center py-20 text-gray-500">
            {searchQuery 
              ? `No products found matching "${searchQuery}"` 
              : (showInactive ? 'No inactive products found.' : 'No products in inventory. Click "Add New" to begin.')
            }
          </div>
        
        )}

        {/* Modals */}
         {isModalOpen && (
           <ProductFormModal
             isOpen={isModalOpen}
             onClose={() => setIsModalOpen(false)}
             onSave={handleAfterAction}
             productToEdit={editingProduct}
             triggerSuccess={showSuccessMessage}
           />
         )}
         
         <DeactivateModal
           isOpen={deactivateModal.isOpen}
           onClose={() => setDeactivateModal({ isOpen: false, product: null })}
           onConfirm={async () => {
             await confirmToggleStatus();
             handleAfterAction();
           }}
           product={deactivateModal.product}
           isActivating={!deactivateModal.product?.status}
         />

        {/* Global Success Modal */}
        <SuccessModal 
          isOpen={successModal.isOpen} 
          onClose={() => setSuccessModal({ ...successModal, isOpen: false })} 
          message={successModal.message} 
        />
      </div>
    </div>
  );
}