import React, { useState, useRef } from 'react';
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
} from 'lucide-react';

// --- Mock Data ---
const initialProducts = [
  {
    id: 1,
    name: 'CLASSIC BLEND',
    category: 'COFFEE BEANS',
    stock: 48,
    price: 450,
    images: [
  'https://images.unsplash.com/photo-1512568400610-62da28bc8a13?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGNvZmZlZSUyMGN1cHxlbnwwfHwwfHx8MA%3D%3D'
],
  },
  {
    id: 2,
    name: 'Diet Coke 250ml',
    category: 'BEVERAGES',
    stock: 80,
    price: 50,
     images: [
      'https://images.unsplash.com/photo-1543253687-c931c8e01820?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGlldCUyMGNva2V8ZW58MHx8MHx8fDA%3D',
      'https://images.unsplash.com/photo-1600871254391-89876f6a9959?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    ],
  },
  {
    id: 3,
    name: 'Sprite 250ml',
    category: 'BEVERAGES',
    stock: 80,
    price: 50,
     images: [
      'https://images.unsplash.com/photo-1680404005217-a441afdefe83?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3ByaXRlJTIwY2FufGVufDB8fDB8fHww',
      'https://images.unsplash.com/photo-1554310636-9eef29dea2fa?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8c3ByaXRlJTIwY2FufGVufDB8fDB8fHww'
    ],
  },
 {
    id: 4,
    name: 'Perrier Carbonate',
    category: 'BEVERAGES',
    stock: 50,
    price: 120,
    images: [
      'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmV2ZXJhZ2V8ZW58MHx8MHx8fDA%3D',
      'https://media.istockphoto.com/id/1281410543/photo/pouring-cola-from-bottle-into-glass-and-fizz-with-ice-cubes-on-table-against-blurred.webp?a=1&b=1&s=612x612&w=0&k=20&c=fMOAR0j_4WIMLhZrXYm6p2b3CnH_iUf1MM-a4A6KvQs='
    ],
  },
];

const CATEGORIES = ['BEVERAGES', 'COFFEE BEANS', 'SNACKS', 'DAIRY'];

// --- Component: Product Form Modal ---
// (No changes here, keeping it exactly as you had it)
const ProductFormModal = ({ isOpen, onClose, onSave, productToEdit }) => {
  const [formData, setFormData] = useState({
    name: productToEdit?.name || '',
    category: productToEdit?.category || '',
    stock: productToEdit?.stock || '',
    price: productToEdit?.price || '',
  });
  const [productImages, setProductImages] = useState(productToEdit?.images || []);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validPngs = files.filter((file) => file.type === 'image/png');

    if (validPngs.length !== files.length) {
      alert('Only PNG image format is allowed.');
    }

    const newImageUrls = validPngs.map((file) => URL.createObjectURL(file));
    setProductImages((prev) => [...prev, ...newImageUrls]);
  };

  const removeCurrentImage = () => {
    setProductImages((prev) => {
      const updated = prev.filter((_, idx) => idx !== currentImageIdx);
      if (currentImageIdx >= updated.length && updated.length > 0) {
        setCurrentImageIdx(updated.length - 1);
      }
      return updated;
    });
  };

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % productImages.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) =>
      prev === 0 ? productImages.length - 1 : prev - 1
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.category || productImages.length === 0) {
      alert('Please fill in required fields and upload at least one image.');
      return;
    }

    onSave({
      id: productToEdit?.id || Date.now(),
      ...formData,
      stock: Number(formData.stock),
      price: Number(formData.price),
      images: productImages,
    });
    onClose();
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Product Images (PNG Only) <span className="text-red-500">*</span>
              </label>

              {productImages.length > 0 ? (
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group mb-3">
                  <img
                    src={productImages[currentImageIdx]}
                    alt="Product preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-between px-4">
                    {productImages.length > 1 && (
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
                      {currentImageIdx + 1} / {productImages.length}
                  </div>
                </div>
              ) : null}

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png"
                multiple
                className="hidden"
              />
               <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-600 transition ${productImages.length > 0 ? 'border-gray-300 bg-transparent' : 'border-gray-300 bg-gray-50 h-48'}`}
              >
                <UploadCloud size={32} className="mb-2" />
                <span className="text-sm font-medium">
                  {productImages.length > 0 ? "Upload More PNGs" : "Click to upload PNG images"}
                </span>
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              >
                <option value="">Select Category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Product Name"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Stock <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                  min="0"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                  required
                />
              </div>
               <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  min="0"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
                />
              </div>
            </div>
             
            <div className="pt-4">
                <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl transition duration-200"
                >
                {productToEdit ? 'Update Product' : 'Save Product'}
                </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Component: Main Gallery Page ---
export default function Products() {
  const [products, setProducts] = useState(initialProducts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Stores the current image index for each product card in the grid
  const [imageIndexes, setImageIndexes] = useState({});

  const handleAddNewClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  // Grid Image Scroll Handlers
  const handlePrevImage = (e, productId, imagesLength) => {
    e.stopPropagation(); // Stop click from triggering card selection/edit
    setImageIndexes((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] || 0) > 0
          ? (prev[productId] || 0) - 1
          : imagesLength - 1,
    }));
  };

  const handleNextImage = (e, productId, imagesLength) => {
    e.stopPropagation(); // Stop click from triggering card selection/edit
    setImageIndexes((prev) => ({
      ...prev,
      [productId]:
        (prev[productId] || 0) < imagesLength - 1
          ? (prev[productId] || 0) + 1
          : 0,
    }));
  };

  const handleDeleteProduct = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSaveProduct = (productData) => {
    if (editingProduct) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productData.id ? productData : p))
      );
    } else {
      setProducts((prev) => [...prev, productData]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-emerald-50/60 p-8 font-sans">
      <div className="max-w-8xl mx-auto">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Products
          </h1>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-white text-gray-600 px-5 py-2.5 rounded-full shadow-sm hover:shadow-md transition-all text-sm font-semibold border border-gray-200">
              <Archive size={18} />
              Inactive Items
            </button>
            <button
              onClick={handleAddNewClick}
              className="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-full shadow-md hover:bg-gray-800 transition-all text-sm font-bold"
            >
              <Plus size={20} /> Add New
            </button>
          </div>
        </header>

        {/* Gallery Grid - Updated UI to match Screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
  {products.map((product) => {
    const currentImgIndex = imageIndexes[product.id] || 0;
    const currentImg = product.images[currentImgIndex] || 'https://via.placeholder.com/400x500?text=No+Image';

    return (
      <div
        key={product.id}
        className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col"
      >
        {/* --- Top Section: Image --- */}
        {/* Removed p-4 so image touches corners. Added h-64 to make it roughly half height */}
        <div className="relative h-64 w-full bg-gray-100 flex items-center justify-center overflow-hidden">
          
          {/* Available Badge */}
          <div className="absolute top-3 right-3 z-10">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">
              Available
            </span>
          </div>

          {/* Product Image */}
          {/* Changed to object-cover to fill the corners completely */}
          <img
            src={currentImg}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />

          {/* Left Scroll Arrow */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => handlePrevImage(e, product.id, product.images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
          )}

          {/* Right Scroll Arrow */}
          {product.images.length > 1 && (
            <button
              onClick={(e) => handleNextImage(e, product.id, product.images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/80 hover:bg-white text-gray-700 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        {/* --- Bottom Section: Info & Action --- */}
        <div className="p-4 flex flex-col flex-grow">
          {/* Category */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.category}
          </p>

          {/* Name and Price Row */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-lg font-bold text-gray-900 leading-tight line-clamp-2">
              {product.name}
            </h3>
            <span className="text-emerald-700 font-bold text-base ml-3 whitespace-nowrap">
              ₹{product.price}
            </span>
          </div>

          {/* Stock Info */}
          <p className="text-xs text-gray-400 mb-4">
            Remaining/Total: {product.stock}
          </p>

          {/* Footer: Buttons */}
          <div className="mt-auto flex items-center gap-3 border-t border-gray-100 pt-3">
            
            {/* Update Button (Takes more space) */}
            <button
              onClick={() => handleEditClick(product)}
              className="flex-1 bg-slate-900 text-white text-xs font-bold py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors text-center"
            >
              Update
            </button>

            {/* Delete Button (Added to the right) */}
            <button
              onClick={(e) => { handleDeleteProduct(product.id); }}
              className="bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold py-2.5 px-3 rounded-lg transition-colors border border-red-100 flex items-center justify-center"
              title="Delete Product"
            >
              <Trash2 size={18} />
            </button>

          </div>
        </div>
      </div>
    );
  })}
</div>
        
        {products.length === 0 && (
            <div className="text-center py-20 text-gray-500">
                No products in inventory. Click "Add New" to begin.
            </div>
        )}

        {/* Modal Component Instance */}
        {isModalOpen && (
          <ProductFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
            productToEdit={editingProduct}
          />
        )}
      </div>
    </div>
  );
}