import React, { useState, useEffect, useRef } from 'react';
import { 
  Folder, Plus, ArrowLeft, ShoppingBag, 
  Power, ChevronLeft, ChevronRight, UploadCloud, X, Archive, CheckCircle,
  EyeOff,
  Trash2,
  Search,
  Edit2
} from 'lucide-react';
import axios from 'axios';
import { categoryApi, rootApi } from '../../../axiosInstance';

// Base URL for API
const API_BASE_URL = 'http://192.168.0.233:8083';

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

// --- Product Form Modal (Enhanced with Validation) ---
const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit, fixedCategoryId, triggerSuccess }) => {
  const [formData, setFormData] = useState({
    productName: '',
    categoryId: '',
    brand: '',
    description: '',
    discount: '',
    returnDays: '',
    mrp: '',
    unit: '',
    netWeight: '',
  });

  const [errors, setErrors] = useState({});
  
  // Handle both array of objects (old) or array of strings (new) for images
  const initialImages = productToEdit?.imageUrls 
    ? productToEdit.imageUrls.map((url, index) => ({ id: index, imageUrl: url })) 
    : (productToEdit?.images || []);

  const [productImages, setProductImages] = useState([]);
  const [existingImages, setExistingImages] = useState(initialImages);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const UNIT_TYPES = ['KG', 'GRAM', 'LITRE', 'ML', 'PIECE', 'PACKET'];

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      setErrors({}); // Clear errors on open
    }
  }, [isOpen]);

  // Update formData when productToEdit or fixedCategoryId changes
  useEffect(() => {
    if (productToEdit) {
      setFormData({
        productName: productToEdit.productName || '',
        categoryId: productToEdit.categoryId || fixedCategoryId || '',
        brand: productToEdit.brand || '',
        description: productToEdit.description || '',
        discount: productToEdit.discount || '',
        returnDays: productToEdit.returnDays || '',
        mrp: productToEdit.mrp || '',
        unit: productToEdit.unit || '',
        netWeight: productToEdit.netWeight || '',
      });
      setExistingImages(
        productToEdit.imageUrls 
        ? productToEdit.imageUrls.map((url, index) => ({ id: index, imageUrl: url })) 
        : (productToEdit.images || [])
      );
    } else {
        // Reset for new product
        setFormData({
            productName: '',
            categoryId: fixedCategoryId || '',
            brand: '',
            description: '',
            discount: '',
            returnDays: '',
            mrp: '',
            unit: '',
            netWeight: '',
        });
        setExistingImages([]);
        setProductImages([]);
    }
  }, [productToEdit, fixedCategoryId, isOpen]);

const PAGE_SIZE = 1000; // or any large number suitable for dropdown

const fetchCategories = async (pageNumber = 0, shouldRefresh = false) => {
  try {
    // Optionally, you can add loading state here if needed
    const response = await categoryApi.get(`/api/category/Active?page=${pageNumber}&size=${PAGE_SIZE}`);
    const newData = response.data.content || [];
    const sortedChunk = newData.sort((a, b) => a.id - b.id);

    if (shouldRefresh || pageNumber === 0) {
      setCategories(sortedChunk);
      // If you want to support "Load More" in dropdown, also track page and hasMore
      // setCategoryPage(0);
    } else {
      setCategories(prev => [...prev, ...sortedChunk]);
      // setCategoryPage(pageNumber);
    }
    // setCategoryHasMore(newData.length === PAGE_SIZE);
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
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
    if (window.confirm('Are you sure you want to delete all existing images?')) {
      setExistingImages([]);
      setCurrentImageIdx(0);
    }
  };

  const allImages = [
  ...existingImages.map(img => ({ 
    url: img.url || img.imageUrl, // Backend 'url' property ni use chestunnam
    type: 'existing', 
    id: img.id 
  })),
  ...productImages.map(file => ({ 
    url: URL.createObjectURL(file), 
    type: 'new', 
    file 
  }))
]
const handleDeleteExistingImage = async (imageId) => {
  if (window.confirm("Are you sure you want to delete this image?")) {
    try {
      // Meeru ichina delete endpoint
      await rootApi.delete(`http://192.168.0.233:8083/api/products/delete/${imageId}`);
      
      // UI nundi kooda remove chestunnam
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
      triggerSuccess("Image deleted successfully");
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("Failed to delete image from server.");
    }
  }
};
  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
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
    
    if (!validateForm()) {
        return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      productImages.forEach((file) => {
        formDataToSend.append('images', file);
      });

      // Construct Query Parameters
      const queryParams = new URLSearchParams({
        productName: formData.productName,
        brand: formData.brand,
        description: formData.description,
        discount: formData.discount || 0,
        returnDays: formData.returnDays || 0,
        mrp: formData.mrp,
        unit: formData.unit,
        netWeight: formData.netWeight
      }).toString();

      if (productToEdit) {
        await categoryApi.put(`/api/products/update/${productToEdit.id}?${queryParams}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        triggerSuccess('Product Updated Successfully');
      } else {
        await categoryApi.post(`/api/products/add/${formData.categoryId}?${queryParams}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        triggerSuccess('Product Created Successfully');
      }

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Failed to ${productToEdit ? 'update' : 'create'} product.`);
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
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Image Upload Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">Product Images <span className="text-red-500">*</span></label>
                {productToEdit && existingImages.length > 0 && (
                  <button type="button" onClick={removeAllOldImages} className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1">
                    <Trash2 size={14} /> Delete Old Images
                  </button>
                )}
              </div>

{allImages.length > 0 ? (
  <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group mb-3">
    <img src={allImages[currentImageIdx].url} alt="Preview" className="w-full h-full object-contain" />
    
    {allImages.length > 1 && (
      <>
        <button type="button" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 text-gray-800 rounded-full hover:bg-white z-20">
          <ChevronLeft size={24} />
        </button>
        <button type="button" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 bg-white/80 text-gray-800 rounded-full hover:bg-white z-20">
          <ChevronRight size={24} />
        </button>
      </>
    )}

    {/* Trash Icon for Existing Images to call Delete API */}
    {allImages[currentImageIdx].type === 'existing' && (
      <button 
        type="button" 
        onClick={() => handleDeleteExistingImage(allImages[currentImageIdx].id)} 
        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-20"
      >
        <Trash2 size={18} />
      </button>
    )}
 
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {currentImageIdx + 1} / {allImages.length}
                  </div>
                </div>
              ) : null}

              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="hidden" />
              <button type="button" onClick={() => fileInputRef.current?.click()} className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition ${errors.images ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-300 text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600'}`}>
                <UploadCloud size={32} className="mb-2" />
                <span className="text-sm font-medium">{allImages.length > 0 ? "Add More Images" : "Click to upload images"}</span>
              </button>
              {errors.images && <p className="text-xs text-red-500 mt-1">{errors.images}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <select 
                name="categoryId" 
                value={formData.categoryId} 
                onChange={handleInputChange} 
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition disabled:opacity-70 ${errors.categoryId ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}
                disabled={!!fixedCategoryId} 
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.categoryName}</option>
                ))}
              </select>
              {errors.categoryId && <p className="text-xs text-red-500 mt-1">{errors.categoryId}</p>}
            </div>

            {/* Basic Details */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Product Name <span className="text-red-500">*</span></label>
              <input type="text" name="productName" value={formData.productName} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.productName ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`} />
              {errors.productName && <p className="text-xs text-red-500 mt-1">{errors.productName}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Brand <span className="text-red-500">*</span></label>
              <input type="text" name="brand" value={formData.brand} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.brand ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`} />
              {errors.brand && <p className="text-xs text-red-500 mt-1">{errors.brand}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.description ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`} />
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* Unit & NetWeight */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Unit Type <span className="text-red-500">*</span></label>
                <select name="unit" value={formData.unit} onChange={handleInputChange} className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.unit ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`}>
                  <option value="">Select Unit</option>
                  {UNIT_TYPES.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                </select>
                {errors.unit && <p className="text-xs text-red-500 mt-1">{errors.unit}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">NetWeight <span className="text-red-500">*</span></label>
                <input type="number" name="netWeight" value={formData.netWeight} onChange={handleInputChange} step="0.01" min="0" className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.netWeight ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`} />
                {errors.netWeight && <p className="text-xs text-red-500 mt-1">{errors.netWeight}</p>}
              </div>
            </div>

            {/* Pricing */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">MRP (₹) <span className="text-red-500">*</span></label>
                <input type="number" name="mrp" value={formData.mrp} onChange={handleInputChange} min="0" step="0.01" className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.mrp ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`} />
                {errors.mrp && <p className="text-xs text-red-500 mt-1">{errors.mrp}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Discount (%)</label>
                <input type="number" name="discount" value={formData.discount} onChange={handleInputChange} min="0" max="100" className={`w-full p-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 transition ${errors.discount ? 'border-red-500 focus:ring-red-200' : 'border-gray-200 focus:ring-emerald-500'}`} />
                {errors.discount && <p className="text-xs text-red-500 mt-1">{errors.discount}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Return Days</label>
                <input type="number" name="returnDays" value={formData.returnDays} onChange={handleInputChange} min="0" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition" />
              </div>
            </div>

            <div className="pt-4">
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200 disabled:opacity-50" disabled={loading}>
                {loading ? 'Saving...' : (productToEdit ? 'Update Product' : 'Save Product')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Confirm Deactivate Modal ---
const DeactivateModal = ({ isOpen, onClose, onConfirm, item, type, isActivating }) => {
  if (!isOpen) return null;
  const name = type === 'category' ? item?.categoryName : item?.productName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-sm text-center">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          {isActivating ? `Activate ${type === 'category' ? 'Category' : 'Product'}?` : `Deactivate ${type === 'category' ? 'Category' : 'Product'}?`}
        </h2>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {isActivating ? 'activate' : 'deactivate'} "<strong>{name}</strong>"?
        </p>
        <div className="flex justify-center gap-4">
          <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition">Cancel</button>
          <button onClick={onConfirm} className={`px-6 py-2 rounded-lg text-white transition ${isActivating ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {isActivating ? 'Activate' : 'Deactivate'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Main Category Component ---
function Category() {
  // Category States
  const rowsPerPageOptions = [10, 20, 50, 100];
  const [categories, setCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [deactivateCategoryData, setDeactivateCategoryData] = useState({ isOpen: false, category: null });
  const [showInactiveCategories, setShowInactiveCategories] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');

  const [categoryPage, setCategoryPage] = useState(1);
  const [categoryPageSize, setCategoryPageSize] = useState(rowsPerPageOptions[rowsPerPageOptions.length - 1]);
  const [categoryTotalPages, setCategoryTotalPages] = useState(1);

  
  // Product View States
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageIndexes, setImageIndexes] = useState({}); // Stores current image index for each product
  const [showInactiveProducts, setShowInactiveProducts] = useState(false);
  const [deactivateProductData, setDeactivateProductData] = useState({ isOpen: false, product: null });
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(rowsPerPageOptions[rowsPerPageOptions.length - 1]);
  const [productTotalPages, setProductTotalPages] = useState(1);


  
  // Shared States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Success Modal State
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });

  // Form Validation State for Category
  const [categoryErrors, setCategoryErrors] = useState({});

  // Initial Load
useEffect(() => {
  fetchCategories(categoryPage, categoryPageSize);
  // eslint-disable-next-line
}, [showInactiveCategories, categoryPage, categoryPageSize]);

useEffect(() => { setCategoryPage(1); }, [showInactiveCategories, categoryPageSize]);
useEffect(() => { setProductPage(1); }, [showInactiveProducts, productPageSize, selectedCategory]);
  // Load Products when category selected
useEffect(() => {
  if (selectedCategory) fetchProducts(productPage, productPageSize);
  // eslint-disable-next-line
}, [selectedCategory, showInactiveProducts, productPage, productPageSize]);

  // Helper to trigger success modal
  const showSuccessMessage = (msg) => {
      setSuccessModal({ isOpen: true, message: msg });
  };

  // --- Category API Operations ---
const fetchCategories = async (pageNumber = 1, size = categoryPageSize) => {
  try {
    setLoading(true);
    setError(null);
    const endpoint = showInactiveCategories ? '/api/category/inActive' : '/api/category/Active';
    const response = await rootApi.get(`${endpoint}?page=${pageNumber - 1}&size=${size}`);
    const newData = response.data.content || [];
    setCategories(newData.sort((a, b) => a.id - b.id));
    setCategoryTotalPages(response.data.totalPages || 1);
    setCategoryPage(pageNumber);
  } catch (err) {
    setCategories([]);
    setCategoryTotalPages(1);
    setCategoryPage(1);
    setError('Failed to load categories.');
  } finally {
    setLoading(false);
  }
};

  const validateCategoryForm = () => {
      let errors = {};
      let isValid = true;
      if (!categoryName.trim()) { errors.name = 'Category Name is required'; isValid = false; }
      if (!categoryDescription.trim()) { errors.desc = 'Description is required'; isValid = false; }
      setCategoryErrors(errors);
      return isValid;
  };

const handleCategorySubmit = async (e) => {
  e.preventDefault();
  if (!validateCategoryForm()) return;

  setLoading(true);
  try {
    const formData = new FormData();
    formData.append('categoryName', categoryName.trim());
    formData.append('description', categoryDescription.trim());
    if (categoryImage) formData.append('imageFile', categoryImage);
    
    // Add headers config for multipart/form-data
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    };
    
   if (editingCategory) {
  await rootApi.put(`/api/category/update/${editingCategory.id}`, formData, config);
  showSuccessMessage('Category Updated Successfully');
} else {
  await rootApi.post(`/api/category/add`, formData, config);
  showSuccessMessage('Category Created Successfully');
}

// Always refresh from page 0 after save
await fetchCategories(0, true);
closeCategoryModal();
  } catch (err) {
    console.error('Error saving category:', err);
    const errorMessage = err.response?.data?.message || 'Failed to save category. Please try again.';
    alert(errorMessage);
  } finally {
    setLoading(false);
  }
};

  const toggleCategoryStatus = async () => {
    const category = deactivateCategoryData.category;
    if (!category) return;
    try {
        setLoading(true);
        const newStatus = !category.status;
        await rootApi.put(`/api/category/Status/${category.id}?status=${newStatus}`);
        setDeactivateCategoryData({ isOpen: false, category: null });
        await fetchCategories(1, categoryPageSize);
        showSuccessMessage(newStatus ? 'Category Activated Successfully' : 'Category Deactivated Successfully');
    } catch (err) {
        console.error('Error toggling category:', err);
        alert('Failed to update status.');
    } finally {
        setLoading(false);
    }
  };

  // --- Product API Operations (Within Category) ---
const fetchProducts = async (pageNumber = 1, size = productPageSize) => {
  if (!selectedCategory) return;
  try {
    setLoading(true);
    const endpoint = showInactiveProducts ? `/api/products/inActive` : `/api/products/activeProd`;
    const response = await rootApi.get(`${endpoint}?page=${pageNumber - 1}&size=${size}`);
    const newData = (response.data.content || []).filter(
      product => product.category?.id === selectedCategory.id || product.categoryId === selectedCategory.id
    );
    setProducts(newData.sort((a, b) => a.id - b.id));
    setProductTotalPages(response.data.totalPages || 1);
    setProductPage(pageNumber);
  } catch (err) {
    setProducts([]);
    setProductTotalPages(1);
    setProductPage(1);
  } finally {
    setLoading(false);
  }
};
  const toggleProductStatus = async () => {
      const product = deactivateProductData.product;
      if (!product) return;
      try {
        setLoading(true);
        const newStatus = !product.status;
        await rootApi.put(`/api/products/status/${product.id}?status=${newStatus}`);
        setDeactivateProductData({ isOpen: false, product: null });
        await fetchProducts(1, productPageSize);
        showSuccessMessage(newStatus ? 'Product Activated Successfully' : 'Product Deactivated Successfully');
      } catch (err) {
        console.error('Error toggling product:', err);
        alert('Failed to update status.');
      } finally {
        setLoading(false);
      }
  };

  // --- Search Filter Logic ---
  const filteredCategories = categories.filter(category => 
    category.categoryName.toLowerCase().includes(categorySearchQuery.toLowerCase())
  );

  const filteredProducts = products.filter(product => 
    product.productName.toLowerCase().includes(productSearchQuery.toLowerCase())
  );

  // --- Image Helpers for Products ---
const getProductImage = (product) => {
  const index = imageIndexes[product.id] || 0;
  // Backend response structure prakaram 'url' property ni check chestunnam
  if (product.imageUrls && product.imageUrls.length > 0) {
      const imgObj = product.imageUrls[index];
      return typeof imgObj === 'string' ? imgObj : imgObj.url;
  }
  return 'https://via.placeholder.com/400x500?text=No+Image';
};

  const getImagesLength = (product) => {
      return (product.imageUrls?.length) || (product.images?.length) || 0;
  };

  const handlePrevImage = (e, productId, length) => {
    e.stopPropagation();
    setImageIndexes(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) > 0 ? (prev[productId] || 0) - 1 : length - 1
    }));
  };

  const handleNextImage = (e, productId, length) => {
    e.stopPropagation();
    setImageIndexes(prev => ({
        ...prev,
        [productId]: (prev[productId] || 0) < length - 1 ? (prev[productId] || 0) + 1 : 0
    }));
  };

  // --- Modal Controllers ---
  const openCategoryModal = (cat = null) => {
    setEditingCategory(cat);
    setCategoryName(cat ? cat.categoryName : '');
    setCategoryDescription(cat ? cat.description : '');
    setImagePreview(cat ? cat.categoryImage : null);
    setCategoryErrors({});
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => {
    setIsCategoryModalOpen(false);
    setEditingCategory(null);
    setCategoryImage(null);
  };

  
  // --- Render Views ---

  // 1. VIEW: Product List (Inside a Category)
  if (selectedCategory) {
    return (
      <div className="min-h-screen w-full bg-emerald-50/60 font-sans">
        {/* Sticky Header */}
        <div className=" top-0 z-30 bg-gradient-to-r from-emerald-700 to-emerald-600 shadow-md px-6 py-4 mb-6 w-full">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => setSelectedCategory(null)} className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors">
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white tracking-wide">{selectedCategory.categoryName}</h1>
                {selectedCategory.description && <p className="text-sm text-white/80">{selectedCategory.description}</p>}
              </div>
            </div>
            <div className="relative w-[850px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            <input
              type="text"
              placeholder="Search products..."
              value={productSearchQuery}
              onChange={(e) => setProductSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-full text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/30 transition"
            />
          </div>
            <div className="flex gap-2">
              <button onClick={() => setShowInactiveProducts(!showInactiveProducts)} className={`p-2 ${showInactiveProducts ? 'bg-gray-600' : 'bg-amber-600'} text-white rounded-full transition-all flex items-center gap-2`}>
                <EyeOff size={20} /> {showInactiveProducts ? 'Active' : 'Inactive'}
              </button>
              <button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="p-2 bg-white text-emerald-700 rounded-full transition-all flex items-center gap-2 font-semibold">
                <Plus size={20} /> New Product
              </button>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="p-6">
            {loading && filteredProducts.length === 0 && (
                <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>
            )}

            {!loading && filteredProducts.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50">
                    <ShoppingBag size={48} className="text-gray-400 mb-4"/>
                    <p className="text-gray-600 text-lg">
                      {productSearchQuery ? `No products found matching "${productSearchQuery}"` : 'No products found here.'}
                    </p>
                </div>
            )}

             <> 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             
                {filteredProducts.map((product) => {
                  const dynamicDiscount = product.discountAmount; // API provided discount amount
                  const manualDiscount = product.discount; // Manual discount
                  
                  // Use Final Price from API if exists, otherwise fallback to MRP
                  const finalDisplayPrice = product.finalPrice ? product.finalPrice : product.mrp;
                  
                  // Determine which discount to display
                  const discountToShow = dynamicDiscount !== null ? dynamicDiscount : manualDiscount;
                  const isFlatDiscount = product.discountType === 'FLAT';
                    const imagesLen = getImagesLength(product);
                    const currentImg = getProductImage(product);
                    
                    // Safe calculation for After Discount if backend doesn't provide it directly
                    const price = product.afterDiscount || (product.mrp - (product.mrp * (product.discount || 0) / 100));

                    return (
                    <div key={product.id} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative">
                        
                        {/* Deactivated Overlay */}
                        {!product.status && (
                            <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center">
                                <span className="text-gray-800 text-center font-extrabold text-lg tracking-wide drop-shadow-sm opacity-80 px-2">
                                  {product.productName}
                                </span>
                                <span className="text-gray-800 text-center font-extrabold text-xl tracking-widest drop-shadow-sm opacity-80 mt-1">
                                  DEACTIVATED
                                </span>
                                <button onClick={() => setDeactivateProductData({ isOpen: true, product })} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-300 rounded-full shadow-sm hover:bg-white text-xs font-semibold text-gray-600 transition">
                                    <Power size={14} className="text-green-600" /> Click to Activate
                                </button>
                            </div>
                        )}

                        {/* Image Section */}
                        <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            <img src={currentImg} alt={product.productName} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            
                            {/* Navigation */}
                            {imagesLen > 1 && (
                                <>
                                    <button onClick={(e) => handlePrevImage(e, product.id, imagesLen)} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button onClick={(e) => handleNextImage(e, product.id, imagesLen)} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                                        <ChevronRight size={20} />
                                    </button>
                                </>
                            )}
                            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                {(imageIndexes[product.id] || 0) + 1} / {imagesLen}
                            </div>
                        </div>

                        {/* Content Section */}
                        <div className="flex flex-col flex-grow p-5 bg-white">
                            <div className="flex items-start justify-between mb-1">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 uppercase tracking-wide">
                                    {product.brand}
                                </span>
                                <div className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${product.status ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${product.status ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    {product.status ? 'Active' : 'Inactive'}
                                </div>
                            </div>

                            <h3 className="text-gray-900 font-bold text-lg leading-tight line-clamp-2 mb-2 group-hover:text-emerald-600 transition-colors">
                                {product.productName}
                            </h3>

                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-2xl font-bold text-slate-900">₹{finalDisplayPrice?.toLocaleString()}</span>
                                {discountToShow > 0 && (
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        {isFlatDiscount ? `₹${discountToShow} OFF` : `${discountToShow}% OFF`}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-400 mb-3">MRP: ₹{product.mrp} | Returns: {product.returnDays} Days</p>
                            
                            {/* Unit & NetWeight Grid */}
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Unit</span>
                                    <span className="text-sm font-medium text-gray-700 truncate">{product.unit}</span>
                                </div>
                                <div className="flex flex-col border-l border-gray-200 pl-4">
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">NetWeight</span>
                                    <span className="text-sm font-medium text-gray-700">{product.netWeight}</span>
                                </div>
                            </div>

                            <div className="mt-auto flex items-center gap-3 pt-1">
                                <button onClick={() => { setEditingProduct(product); setIsProductModalOpen(true); }} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2">
                                    <Edit2 size={16} /> Edit Product
                                </button>
                                <button onClick={() => setDeactivateProductData({ isOpen: true, product })} className={`px-4 py-2.5 rounded-lg border transition-all font-semibold text-sm flex items-center justify-center gap-2 ${product.status ? 'bg-white border-red-200 text-red-600 hover:bg-red-50' : 'bg-white border-green-200 text-green-600 hover:bg-green-50'}`}>
                                    {product.status ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    </div>
                );})}
            </div>
            </>
            <div className="flex justify-center items-center gap-4 mt-3">
                  <div>
                    <label className="mr-2 font-medium text-gray-700">Rows per page:</label>
                    <select
                      value={productPageSize}
                      onChange={e => setProductPageSize(Number(e.target.value))}
                      className="border rounded px-2 py-1"
                    >
                      {rowsPerPageOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setProductPage(p => Math.max(1, p - 1))}
                    disabled={productPage === 1}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
                  >Prev</button>
                  <span>Page {productPage} / {productTotalPages}</span>
                  <button
                    onClick={() => setProductPage(p => (p < productTotalPages ? p + 1 : p))}
                    disabled={productPage >= productTotalPages}
                    className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
                  >Next</button>
                </div>
        </div>

        {/* Product Modal */}
        <ProductFormModal 
          isOpen={isProductModalOpen}
          onClose={() => setIsProductModalOpen(false)}
          onSave={() => fetchProducts(1, productPageSize)}
          productToEdit={editingProduct}
          fixedCategoryId={selectedCategory.id}
          triggerSuccess={showSuccessMessage}
        />

        {/* Deactivate Product Modal */}
        <DeactivateModal
          isOpen={deactivateProductData.isOpen}
          onClose={() => setDeactivateProductData({ isOpen: false, product: null })}
          onConfirm={toggleProductStatus}
          item={deactivateProductData.product}
          type="product"
          isActivating={!deactivateProductData.product?.status}
        />
        
        {/* Global Success Modal */}
        <SuccessModal 
          isOpen={successModal.isOpen} 
          onClose={() => setSuccessModal({ ...successModal, isOpen: false })} 
          message={successModal.message} 
        />
      </div>
    );
  }

  // 2. VIEW: Category List (Default View)
  return (
    <div className="min-h-screen w-full bg-emerald-50/60 flex flex-col font-sans">
      <div className="top-0 z-30 w-full">
        <div className="w-full px-6 py-4">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-serif text-[#0a0a0a] tracking-wider drop-shadow-md">Categories</h1>
            <div className="relative w-[850px] ">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search categories..."
              value={categorySearchQuery}
              onChange={(e) => setCategorySearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-full text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition shadow-sm"
            />
          </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowInactiveCategories(!showInactiveCategories)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold border ${showInactiveCategories ? 'bg-gray-600 text-white border-gray-600' : 'bg-white text-gray-600 border-gray-200'}`}
              >
                <Archive size={18} /> {showInactiveCategories ? 'Active Category' : 'Inactive Category'}
              </button>
              <button onClick={() => openCategoryModal()} className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full shadow-md hover:bg-gray-800 transition-all text-sm font-bold">
                <Plus size={20} /> Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full flex-1 p-4 md:p-6">
        {loading && filteredCategories.length === 0 && (
          <div className="flex justify-center items-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c28341]"></div></div>
        )}

        {!loading && filteredCategories.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#e5dcc5] rounded-2xl bg-white/50">
            <Folder size={48} className="text-[#d6cbb2] mb-4"/>
            <p className="text-[#8c7860] text-lg font-serif">
              {categorySearchQuery ? `No categories found matching "${categorySearchQuery}"` : 'No categories found.'}
            </p>
          </div>
        )}
        <> 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} onClick={() => category.status && setSelectedCategory(category)} className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative cursor-pointer">
             {!category.status && (
                <div className="absolute inset-0 z-50 bg-white/50 backdrop-blur-sm flex flex-col items-center justify-center cursor-default">
                    <span className="text-gray-800 text-center font-extrabold text-2xl tracking-widest drop-shadow-sm opacity-80">
                      {category.categoryName}
                    </span>
                    <span className="text-gray-800 text-center font-extrabold text-xl tracking-widest drop-shadow-sm opacity-80 mt-1">
                      DEACTIVATED
                    </span>
                    <button onClick={(e) => { e.stopPropagation(); setDeactivateCategoryData({ isOpen: true, category }); }} className="mt-4 flex items-center gap-2 px-4 py-2 bg-white/80 border border-gray-300 rounded-full shadow-sm hover:bg-white text-xs font-semibold text-gray-600 transition">
                        <Power size={14} className="text-green-600" /> Click to Activate
                    </button>
                </div>
              )}
              <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                {category.status && (
                    <div className="absolute top-3 right-3 z-10"><span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-1 rounded shadow-sm">Active</span></div>
                )}
                <img src={category.categoryImage || 'https://images.unsplash.com/photo-1543158181-1274e5362710?w=600&q=60'} alt={category.categoryName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              </div>
              <div className="p-4 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 line-clamp-1">{category.categoryName}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-grow">{category.description}</p>
                <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-3" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openCategoryModal(category)} className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-all shadow-sm flex items-center justify-center gap-2"> <Edit2 size={16} /> Edit Category</button>
                    <button onClick={() => setDeactivateCategoryData({ isOpen: true, category })} className="bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold py-2.5 px-3 rounded-lg transition-colors border border-red-100 flex items-center justify-center">
                        <span className="ml-1">{category.status ? 'Deactivate' : 'Activate'}</span> 
                    </button>
                </div>
              </div>
            </div>
            
          ))}
        </div>
        </>
        <div className="flex justify-center items-center gap-4 mt-3">
            <div>
              <label className="mr-2 font-medium text-gray-700">Rows per page:</label>
              <select
                value={categoryPageSize}
                onChange={e => setCategoryPageSize(Number(e.target.value))}
                className="border rounded px-2 py-1"
              >
                {rowsPerPageOptions.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setCategoryPage(p => Math.max(1, p - 1))}
              disabled={categoryPage === 1}
              className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
            >Prev</button>
            <span>Page {categoryPage} / {categoryTotalPages}</span>
            <button
              onClick={() => setCategoryPage(p => (p < categoryTotalPages ? p + 1 : p))}
              disabled={categoryPage >= categoryTotalPages}
              className="px-2 py-1 rounded bg-gray-100 text-gray-600 disabled:opacity-50"
            >Next</button>
          </div>
      </div>

      {/* Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-[#fdfbf7] border border-[#e5dcc5] p-6 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-xl font-serif text-[#3d3126] mb-6 text-center border-b border-[#e5dcc5] pb-4">{editingCategory ? 'Update Category' : 'New Category'}</h2>
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-4">
                  <label className="block text-xs font-bold tracking-widest text-[#8c7860] mb-2 uppercase">Category Name</label>
                  <input type="text" value={categoryName} onChange={(e) => { setCategoryName(e.target.value); setCategoryErrors({...categoryErrors, name: null}) }} className={`w-full bg-white p-3 rounded-lg border focus:outline-none ${categoryErrors.name ? 'border-red-500 ring-1 ring-red-500' : 'border-[#d6cbb2] focus:ring-[#8c7860]'}`} />
                  {categoryErrors.name && <p className="text-xs text-red-500 mt-1">{categoryErrors.name}</p>}
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-bold tracking-widest text-[#8c7860] mb-2 uppercase">Description</label>
                  <textarea value={categoryDescription} onChange={(e) => { setCategoryDescription(e.target.value); setCategoryErrors({...categoryErrors, desc: null}) }} className={`w-full bg-white p-3 rounded-lg border focus:outline-none ${categoryErrors.desc ? 'border-red-500 ring-1 ring-red-500' : 'border-[#d6cbb2] focus:ring-[#8c7860]'}`} rows="3" />
                  {categoryErrors.desc && <p className="text-xs text-red-500 mt-1">{categoryErrors.desc}</p>}
                </div>
                <div className="mb-6">
                  <label className="block text-xs font-bold tracking-widest text-[#8c7860] mb-2 uppercase">Image</label>
                  <input type="file" onChange={(e) => { const file = e.target.files[0]; if (file) { setCategoryImage(file); setImagePreview(URL.createObjectURL(file)); } }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                  {imagePreview && <img src={imagePreview} alt="Preview" className="mt-3 h-32 w-auto rounded shadow mx-auto object-cover" />}
                </div>
                <div className="flex justify-end gap-3">
                  <button type="button" onClick={closeCategoryModal} className="px-4 py-2 text-[#8c7860]">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-[#3d3126] text-[#eaddcf] rounded-lg shadow" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                </div>
              </form>
            </div>
        </div>
      )}

      {/* Deactivate Category Modal */}
      <DeactivateModal
          isOpen={deactivateCategoryData.isOpen}
          onClose={() => setDeactivateCategoryData({ isOpen: false, category: null })}
          onConfirm={toggleCategoryStatus}
          item={deactivateCategoryData.category}
          type="category"
          isActivating={!deactivateCategoryData.category?.status}
      />
      
      {/* Global Success Modal */}
      <SuccessModal 
        isOpen={successModal.isOpen} 
        onClose={() => setSuccessModal({ ...successModal, isOpen: false })} 
        message={successModal.message} 
      />
    </div>
  );
}

export default Category;