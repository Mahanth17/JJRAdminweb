import React, { useState } from 'react';
import { Folder, Pencil, Trash2, Plus, ArrowLeft, ShoppingBag } from 'lucide-react';

// Mock data (UNCHANGED)
const initialCategories = [
  { id: 1, name: 'Cold Pressed Oils', items: 5, featured: true },
  { id: 2, name: 'Pickles', items: 12 },
  { id: 3, name: 'Spices', items: 8 },
  { id: 4, name: 'Honey', items: 3 },
  { id: 5, name: 'Hair Oil', items: 2 },
  { id: 6, name: 'Snacks', items: 15 },
  { id: 7, name: 'Laddus', items: 6 },
  { id: 8, name: 'Homemade Snacks', items: 9 },
  { id: 9, name: 'Dry Fruits', items: 4 },
];

// Mock products (UNCHANGED)
const productsByCategory = {
  1: [{ id: 101, name: "Groundnut Oil", price: 450 }, { id: 102, name: "Sesame Oil", price: 550 }],
  2: [{ id: 201, name: "Mango Pickle", price: 250 }],
  3: [{ id: 301, name: "Turmeric Powder", price: 120 }, { id: 302, name: "Chilli Powder", price: 150 }],
};

// Visual Helper: Images
const getCategoryImage = (index, name) => {
  const images = [
    "https://images.unsplash.com/photo-1610602925036-1d81bb50065a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8cGlja2xlc3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1581600140682-d4e68c8cde32?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3BpY2VzfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1587049352851-8d4e89133924?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8aG9uZXl8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1669281393011-c335050cf0e9?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8aGFpciUyMG9pbHxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1571865402713-98ba5a56f12b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHNuYWNrc3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1605194000384-439c3ced8d15?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8bGFkZHV8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1743409390921-1d1e673bc351?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTk5fHxIb21lbWFkZSUyMHNuYWNrc3xlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1543158181-1274e5362710?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8c25hY2tzfGVufDB8fDB8fHww",
    //"https://images.unsplash.com/photo-1596591606975-97ee5cef3a1e?q=80&w=500&auto=format&fit=crop",
  ];
  return images[index % images.length];
};

function Category() {
  const [categories, setCategories] = useState(initialCategories);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryImage, setCategoryImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

const openModal = (category = null) => {
  setEditingCategory(category);
  setCategoryName(category ? category.name : '');
  setImagePreview(category && category.image ? category.image : null);
  setIsModalOpen(true);
};

  const closeModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setIsModalOpen(false);
  };

  const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type === "image/png") {
    setCategoryImage(file);
    setImagePreview(URL.createObjectURL(file));
  } else {
    setCategoryImage(null);
    setImagePreview(null);
    alert("Please select a PNG image only.");
  }
};
  const handleSubmit = (e) => {
  e.preventDefault();
  if (editingCategory) {
    setCategories(categories.map(cat =>
      cat.id === editingCategory.id
        ? { ...cat, name: categoryName, image: imagePreview || cat.image }
        : cat
    ));
  } else {
    const newCategory = {
      id: categories.length + 1,
      name: categoryName,
      items: 0,
      image: imagePreview || null,
    };
    setCategories([...categories, newCategory]);
  }
  closeModal();
  setCategoryImage(null);
  setImagePreview(null);
};

  const deleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  // --- Category List View ---
  if (!selectedCategory) {
    return (
      <div className="min-h-screen w-full bg-emerald-50/60 flex flex-col">
        
        {/* Header */}
        <div className="top-0 z-30  w-full">
          <div className="w-full px-6 py-4 flex justify-between items-center">
             <div className="w-8">
               {/*<div className="space-y-1.5 cursor-pointer">
                  <div className="w-6 h-0.5 bg-[#eaddcf]"></div>
                  <div className="w-4 h-0.5 bg-[#eaddcf]"></div>
                  <div className="w-6 h-0.5 bg-[#eaddcf]"></div>
               </div>*/}
             </div>
            <h1 className="text-2xl font-serif text-[#0a0a0a] tracking-wider drop-shadow-md">
              Categories
            </h1>
            <button
              onClick={() => openModal()}
              className="p-2 bg-[#c28341]  text-[#f3f2f1] rounded-full border border-[#efebe7] transition-all flex items-center gap-2"
            >
              <Plus size={22} /> New Category
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="w-full flex-1 p-4 md:p-6">
          
          {/* Featured/Banner Card */}
          {/*<div className="mb-6 relative rounded-xl overflow-hidden shadow-lg border border-[#e5dcc5] h-64 cursor-pointer group w-full">
             <img 
               src="https://images.unsplash.com/photo-1465101046530-73398c7f28ca?q=80&w=1000&auto=format&fit=crop" 
               className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
             <div className="absolute bottom-6 left-6 text-left">
                <h2 className="text-3xl font-serif text-white mb-2 drop-shadow-lg">Cold Pressed Oils</h2>
                <p className="text-[#eaddcf] text-base font-serif drop-shadow-md">Rice Bran, Groundnut, Sesame Oil</p>
             </div>
          </div>*/}

          {/* Grid Layout */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {categories.filter(c => c.id !== 1).map((category, index) => (
              <div
                key={category.id}
                // Changed: Removed 'flex flex-col', image now takes full height relative to this container
                className="relative rounded-xl overflow-hidden shadow-md cursor-pointer group  border border-[#e5dcc5] h-56 md:h-64"
                onClick={() => setSelectedCategory(category)}
              >
                {/* 1. Image takes full space */}
                <img
                  src={category.image ? category.image : getCategoryImage(index + 1, category.name)}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out opacity-90"
                />
                
                {/* 2. Gradient Overlay (Makes text readable over image) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-black/5 to-transparent"></div>

                {/* 3. Edit/Delete Actions (Top Right) */}
                <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30" onClick={e => e.stopPropagation()}>
                  <button onClick={() => openModal(category)} className="p-1.5 bg-white/90 text-amber-900 rounded-full shadow hover:bg-amber-100">
                      <Pencil size={20} />
                  </button>
                  <button onClick={() => deleteCategory(category.id)} className="p-1.5 bg-white/90 text-red-600 rounded-full shadow hover:bg-red-50">
                      <Trash2 size={20} />
                  </button>
                </div>

                {/* 4. Label Section (Positioned Absolutely at Bottom) */}
                {/* Changed: No separate black box. Just text over the gradient overlay. */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between z-20">
                   <div className="overflow-hidden">
                      <h2 className="text-white font-serif text-lg tracking-wide whitespace-nowrap overflow-hidden text-ellipsis drop-shadow-md">
                        {category.name}
                      </h2>
                   </div>
                   {/* Changed icon color to match text */}
                   <ShoppingBag size={18} className="text-[#eaddcf] flex-shrink-0 drop-shadow-md" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Styling */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4">
            <div className="bg-[#fdfbf7] border border-[#e5dcc5] p-6 rounded-xl shadow-2xl w-full max-w-md">
              <h2 className="text-xl font-serif text-[#3d3126] mb-6 text-center border-b border-[#e5dcc5] pb-4">
                {editingCategory ? 'Update Collection' : 'New Collection'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <label className="block text-xs font-bold tracking-widest text-[#8c7860] mb-2 uppercase">
                    Category Name
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="w-full bg-white text-[#3d3126] p-3 rounded-lg border border-[#d6cbb2] focus:border-[#8c7860] focus:ring-1 focus:ring-[#8c7860] focus:outline-none transition-all font-serif"
                    placeholder="E.g. Spices..."
                    required
                  />
                </div>
                {/* Image Upload */}
                <div className="mb-6">
                  <label className="block text-xs font-bold tracking-widest text-[#8c7860] mb-2 uppercase">
                    Category Image (PNG only)
                  </label>
                  <input
                    type="file"
                    accept="image/png"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                  />
                  {imagePreview && (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="mt-3 h-24 w-auto rounded shadow border border-[#e5dcc5] mx-auto"
                    />
                  )}
                </div>
                <div className="flex justify-end gap-3 font-sans">
                  <button type="button" onClick={closeModal} className="px-4 py-2 text-[#8c7860] hover:text-[#5e4f3d] text-sm font-medium">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-[#3d3126] hover:bg-[#5e4f3d] text-[#eaddcf] text-sm font-medium rounded-lg shadow transition-all">
                    {editingCategory ? 'Save Changes' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Product List View ---
  const products = productsByCategory[selectedCategory.id] || [];

  return (
    <div className="min-h-screen w-full bg-[#fdfbf7] text-[#3d3126]">
       <div className="sticky top-0 z-30 bg-gradient-to-r from-[#2c241b] to-[#433629] shadow-md px-6 py-4 mb-6 w-full">
        <div className="w-full flex items-center gap-4">
            <button
            onClick={() => setSelectedCategory(null)}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-[#eaddcf]/20 text-[#eaddcf] hover:bg-[#eaddcf]/40 transition-colors"
            >
            <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-serif font-medium text-[#eaddcf] tracking-wide">
                {selectedCategory.name}
            </h1>
        </div>
      </div>

      <div className="w-full p-6">
        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-[#e5dcc5] rounded-2xl bg-white/50">
            <Folder size={48} className="text-[#d6cbb2] mb-4"/>
            <p className="text-[#8c7860] text-lg font-serif">No products found here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <div key={product.id} className="bg-white border border-[#e5dcc5] p-5 rounded-xl shadow-sm hover:shadow-md hover:border-[#8c7860] transition-all flex justify-between items-center group">
                <div>
                    <h2 className="text-lg font-serif font-bold text-[#3d3126]">{product.name}</h2>
                    <p className="text-[#8c7860] text-xs uppercase tracking-widest mt-1">Available</p>
                </div>
                <div className="text-lg font-bold text-[#5e4f3d] font-serif bg-[#fdfbf7] px-3 py-1 rounded border border-[#e5dcc5]">
                    ₹{product.price}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;