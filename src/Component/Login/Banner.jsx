import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Trash2,
  X,
  UploadCloud,
  ChevronLeft,
  ChevronRight,
  Edit2,
  CheckCircle,
  Search,
  ExternalLink,
  ImageIcon,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { rootApi } from '../../../axiosInstance';

// --- Component: Success Modal (Unchanged Logic, Improved UI) ---
const SuccessModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm text-center transform transition-all scale-100 border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-50 mb-4 shadow-sm">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Success!</h3>
        <p className="text-sm text-gray-500 mb-6 font-medium">{message}</p>
        <button
          onClick={onClose}
          className="w-full inline-flex justify-center rounded-xl shadow-lg shadow-green-200 px-4 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white font-bold hover:from-green-700 hover:to-green-600 focus:outline-none transition-all transform active:scale-95"
        >
          Okay
        </button>
      </div>
    </div>
  );
};

// --- Component: Banner Form Modal (Logic Kept Intact) ---
const BannerFormModal = ({ isOpen, onClose, onSave, bannerToEdit, triggerSuccess }) => {
  const [formData, setFormData] = useState({
    title: bannerToEdit?.title || '',
    description: bannerToEdit?.description || '',
    priority: bannerToEdit?.priority || '',
    redirectUrl: bannerToEdit?.redirectUrl || '',
  });

  const [errors, setErrors] = useState({});
  const [bannerImages, setBannerImages] = useState([]);
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [deleteImageKeys, setDeleteImageKeys] = useState([]); // New state to track deleted keys
  const [existingImages, setExistingImages] = useState([]);
  

  useEffect(() => {
    if (isOpen) {
      setErrors({});
    }
  }, [isOpen]);

useEffect(() => {
    if (bannerToEdit) {
      setFormData({
        title: bannerToEdit.title || '',
        description: bannerToEdit.description || '',
        priority: bannerToEdit.priority || '',
        redirectUrl: bannerToEdit.redirectUrl || '',
      });
      // Backend nunchi vache Objects ni save chestunnam
      setExistingImages(bannerToEdit.imageUrls || []);
      setDeleteImageKeys([]); // Reset delete list on edit
    }
  }, [bannerToEdit]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setBannerImages((prev) => [...prev, ...files]);
    if (errors.images) setErrors(prev => ({ ...prev, images: null }));
  };

const removeCurrentImage = () => {
    const totalExisting = existingImages.length;
    
    if (currentImageIdx < totalExisting) {
      const imageToDelete = existingImages[currentImageIdx];
      // Track the key to delete from S3/Backend
      setDeleteImageKeys(prev => [...prev, imageToDelete.key]);
      setExistingImages((prev) => prev.filter((_, idx) => idx !== currentImageIdx));
      
      if (currentImageIdx >= existingImages.length - 1 && currentImageIdx > 0) {
        setCurrentImageIdx(currentImageIdx - 1);
      }
    } else {
      const newIdx = currentImageIdx - totalExisting;
      setBannerImages((prev) => prev.filter((_, idx) => idx !== newIdx));
      if (currentImageIdx > 0) {
        setCurrentImageIdx(currentImageIdx - 1);
      }
    }
  };

  const removeAllOldImages = () => {
    if (window.confirm('Are you sure you want to delete all existing images? This action cannot be undone.')) {
      setExistingImages([]);
      setDeleteImageKeys([]); // Clear all delete keys when removing all old images
      setCurrentImageIdx(0);
    }
  };

const allImages = [
    ...existingImages.map(img => ({ url: img.url, type: 'existing', key: img.key })),
    ...bannerImages.map(file => ({ url: URL.createObjectURL(file), type: 'new', file }))
  ];

  const nextImage = () => {
    setCurrentImageIdx((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIdx((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    );
  };

  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = "Banner title is required";
      isValid = false;
    }

    if (formData.priority && (parseInt(formData.priority) < 0)) {
      newErrors.priority = "Priority must be a positive number";
      isValid = false;
    }

    if (formData.redirectUrl && !isValidUrl(formData.redirectUrl)) {
      newErrors.redirectUrl = "Please enter a valid URL";
      isValid = false;
    }

    if (!bannerToEdit && bannerImages.length === 0) {
      newErrors.images = "At least one image is required for new banners";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    const formDataToSend = new FormData();

    // 1. New Images (MultipartFile[])
    if (bannerImages.length > 0) {
      bannerImages.forEach((file) => {
        formDataToSend.append('images', file);
      });
    }

    // 2. Delete Image Keys (List<String>)
    // Backend @RequestParam List<String> expect chestondi kabatti separate append cheyali
    if (deleteImageKeys.length > 0) {
      deleteImageKeys.forEach((key) => {
        formDataToSend.append('deleteImageKeys', key);
      });
    }

    // 3. Other Fields
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('redirectUrl', formData.redirectUrl || '');

    // 4. API Call
    const url = bannerToEdit 
      ? `/api/admin/banners/${bannerToEdit.id}` 
      : '/api/admin/banners/add';

    const method = bannerToEdit ? 'put' : 'post';

    // Axios automatic ga headers set chestundi if we pass FormData correctly
    await rootApi({
      method: method,
      url: url,
      data: formDataToSend,
      headers: {
        'Content-Type': 'multipart/form-data', // Explicit ga specify cheyadam better
      },
    });

    triggerSuccess(bannerToEdit ? 'Banner Updated Successfully' : 'Banner Created Successfully');
    onSave();
    handleClose();
  } catch (error) {
    console.error('Error saving banner:', error.response?.data || error.message);
    alert(error.response?.data?.message || 'Something went wrong while saving');
  } finally {
    setLoading(false);
  }
};
  const handleClose = () => {
    setFormData({ title: '', description: '', priority: '', redirectUrl: '' });
    setBannerImages([]);
    setExistingImages([]);
    setCurrentImageIdx(0);
    setErrors({});
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <ImageIcon className="text-emerald-600" size={24} />
            {bannerToEdit ? 'Edit Banner' : 'Create New Banner'}
          </h2>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow mx-auto w-full">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Uploader */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Banner Images <span className="text-red-500">*</span>
                </label>
                {bannerToEdit && existingImages.length > 0 && (
                  <button type="button" onClick={removeAllOldImages} className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded">
                    <Trash2 size={12} /> Delete All Old
                  </button>
                )}
              </div>

              {allImages.length > 0 ? (
                <div className="relative w-full h-64 bg-gray-100 rounded-xl overflow-hidden group shadow-inner border border-gray-200">
                  <img src={allImages[currentImageIdx].url} alt="Preview" className="w-full h-full object-contain" />
                  
                  {allImages.length > 1 && (
                    <>
                      <button type="button" onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100">
                        <ChevronLeft size={20} />
                      </button>
                      <button type="button" onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100">
                        <ChevronRight size={20} />
                      </button>
                    </>
                  )}
                  
                  <div className="absolute top-2 right-2">
                    <button type="button" onClick={removeCurrentImage} className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full shadow-md transition">
                       <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white px-2 py-0.5 rounded-full text-xs font-medium backdrop-blur-sm">
                    {currentImageIdx + 1} / {allImages.length}
                  </div>
                </div>
              ) : (
                <div onClick={() => fileInputRef.current?.click()} className="w-full h-48 bg-gray-50 rounded-xl flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-emerald-500 hover:bg-emerald-50 cursor-pointer transition-colors group">
                   <div className="bg-white p-3 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud size={24} className="text-emerald-600" />
                   </div>
                   <p className="text-gray-600 font-medium text-sm">Click to upload images</p>
                </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
              
              {allImages.length > 0 && (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="mt-3 text-sm text-emerald-700 font-semibold flex items-center gap-1 hover:underline">
                  <Plus size={16} /> Add more images
                </button>
              )}
              
              {errors.images && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} /> {errors.images}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4">
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                  <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="E.g., Summer Sale 50% Off" className={`w-full p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-gray-50 focus:bg-white ${errors.title ? 'border-red-500' : 'border-gray-200'}`} />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
               </div>
               
               <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                  <textarea name="description" value={formData.description} onChange={handleInputChange} placeholder="Enter a catchy description..." rows={2} className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-gray-50 focus:bg-white resize-none" />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                    <input type="number" name="priority" value={formData.priority} onChange={handleInputChange} placeholder="0" min="0" className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-gray-50 focus:bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Link URL</label>
                    <input type="text" name="redirectUrl" value={formData.redirectUrl} onChange={handleInputChange} placeholder="https://..." className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none transition bg-gray-50 focus:bg-white" />
                  </div>
               </div>
            </div>

            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button type="button" onClick={handleClose} className="flex-1 px-4 py-3 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold transition">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-bold transition shadow-lg shadow-emerald-200 disabled:opacity-50">
                {loading ? 'Saving...' : bannerToEdit ? 'Update Banner' : 'Create Banner'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- New Component: Banner Card with Auto Scroll ---
// This handles the UI logic for the carousel locally
const BannerCard = ({ banner, onEdit, onDelete }) => {
  const [currentImgIndex, setCurrentImgIndex] = useState(0);

  // Auto scroll logic - 3 Seconds
useEffect(() => {
    if (!banner.imageUrls || banner.imageUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % banner.imageUrls.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banner.imageUrls]);
const hasImages = banner.imageUrls && banner.imageUrls.length > 0; 
  
  return (
    <div className="relative group rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-80 md:h-96">
       {/* Background Image Carousel - Full Layout */}
       <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400">
         {hasImages ? (
            banner.imageUrls.map((imgObj, idx) => (
              <img
                key={idx}
                src={imgObj.url} // .url property ni use chestunnam
                alt={banner.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                   idx === currentImgIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
               <ImageIcon size={64} />
               <span>No Image</span>
            </div>
          )}
       </div>

       {/* Dark Gradient Overlay for Better Text Readability */}
       {/*<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>*/}

       {/* Content Overlay on Image */}
       <div className="absolute inset-0 z-20 p-6 md:p-8 flex flex-col justify-between">
          {/* Top Section - Priority Badge & Edit/Delete Buttons */}
          <div className="flex items-start justify-between">
             {banner.priority && (
                <span className="px-4 py-1.5 bg-yellow-400 text-black text-xs font-black uppercase tracking-wider rounded-full shadow-lg">
                   Priority: {banner.priority}
                </span>
             )}
             
             {/* Edit/Delete Actions - Top Right */}
             <div className="flex gap-2 ml-auto">
                <button 
                  onClick={() => onEdit(banner)}
                  className="p-2.5 bg-white/90 hover:bg-white text-gray-800 rounded-full transition-all shadow-lg hover:scale-110 backdrop-blur-sm"
                  title="Edit Banner"
                >
                   <Edit2 size={18} />
                </button>
                <button 
                  onClick={() => onDelete(banner.id)}
                  className="p-2.5 bg-red-500/90 hover:bg-red-600 text-white rounded-full transition-all shadow-lg hover:scale-110 backdrop-blur-sm"
                  title="Delete Banner"
                >
                   <Trash2 size={18} />
                </button>
             </div>
          </div>

          {/* Bottom Section - Title, Description & CTA */}
          <div className="space-y-4">
             <div>
                <h3 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3 line-clamp-2 drop-shadow-2xl">
                   {banner.title}
                </h3>
                
                <p className="text-base md:text-lg text-white/90 font-medium line-clamp-2 leading-relaxed drop-shadow-lg max-w-2xl">
                   {banner.description || "Explore amazing offers and deals!"}
                </p>
             </div>

             <div className="flex items-center gap-3 flex-wrap">
                {banner.redirectUrl && (
                   <a 
                     href={banner.redirectUrl} 
                     target="_blank" 
                     rel="noopener noreferrer"
                     className="px-6 py-3 bg-white text-gray-900 text-sm font-black rounded-full hover:bg-yellow-400 hover:text-black transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-2xl"
                   >
                     Shop Now <ArrowRight size={18} />
                   </a>
                )}
                
                {/* Pagination Dots */}
                {hasImages && banner.imageUrls.length > 1 && (
                   <div className="flex gap-2 items-center">
                      {banner.imageUrls.map((_, idx) => (
                         <div 
                            key={idx} 
                            className={`h-2 rounded-full transition-all duration-300 ${
                               idx === currentImgIndex 
                                 ? 'w-8 bg-white shadow-lg' 
                                 : 'w-2 bg-white/50 hover:bg-white/70 cursor-pointer'
                            }`}
                            onClick={() => setCurrentImgIndex(idx)}
                         />
                      ))}
                   </div>
                )}
             </div>
          </div>
       </div>
    </div>
  );
};

// --- Main Component: Banners Management ---
const Banners = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [bannerToEdit, setBannerToEdit] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const response = await rootApi.get('/api/admin/banners');
      const data = response.data || [];

      // --- FIX START ---
      // Sort banners to maintain stable order. 
      // This prevents the edited banner from jumping to the last position.
      const sortedBanners = data.sort((a, b) => {
        // If you want to sort by Priority first, uncomment the lines below:
        // const priorityDiff = (a.priority || 0) - (b.priority || 0);
        // if (priorityDiff !== 0) return priorityDiff;

        // Sort by ID (keeps them in creation order)
        if (a.id < b.id) return -1;
        if (a.id > b.id) return 1;
        return 0;
      });
      // --- FIX END ---

      setBanners(sortedBanners);
    } catch (error) {
      console.error('Error fetching banners:', error);
      alert('Failed to load banners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this banner?')) return;

    try {
      await rootApi.delete(`/api/admin/banners/${id}`);
      triggerSuccess('Banner Deleted Successfully');
      fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleEdit = (banner) => {
    setBannerToEdit(banner);
    setIsModalOpen(true);
  };

  const triggerSuccess = (message) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const filteredBanners = banners.filter(banner =>
    banner.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (banner.description && banner.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-emerald-50/60 p-4 md:p-8 font-sans">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Header & Controls */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                 <Sparkles className="text-emerald-500 fill-emerald-500" size={32} />
                 Promotional Banners
              </h1>
              <p className="text-gray-500 font-medium mt-2">Manage app-wide marketing campaigns and sliders.</p>
           </div>

           <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search */}
              <div className="relative group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-600 transition-colors" size={20} />
                 <input
                    type="text"
                    placeholder="Search campaigns..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full sm:w-64 pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                 />
              </div>

              <button
                 onClick={() => {
                    setBannerToEdit(null);
                    setIsModalOpen(true);
                 }}
                 className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full hover:bg-black font-bold transition-all shadow-lg hover:shadow-xl active:scale-95"
              >
                 <Plus size={20} />
                 New Banner
              </button>
           </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex flex-col justify-center items-center h-80">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-100 border-t-emerald-600 mb-4"></div>
            <p className="text-gray-400 font-medium">Loading campaigns...</p>
          </div>
        ) : filteredBanners.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 bg-white rounded-3xl border border-dashed border-gray-300">
             <div className="bg-gray-50 p-6 rounded-full mb-4">
                <ImageIcon size={48} className="text-gray-300" />
             </div>
             <h3 className="text-xl font-bold text-gray-900">No Banners Found</h3>
             <p className="text-gray-500 mt-2 mb-6">Create your first marketing banner to get started.</p>
             <button
                 onClick={() => { setBannerToEdit(null); setIsModalOpen(true); }}
                 className="text-gray-600 font-bold hover:underline rounded-full flex items-center gap-2 px-4 py-2 border border-emerald-600 hover:bg-emerald-50 transition"
              >
                 + Create Now
              </button>
          </div>
        ) : (
          /* GRID LAYOUT: 1 Col Mobile, 2 Col Desktop (Half Screen) */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
            {filteredBanners.map((banner) => (
              <BannerCard 
                key={banner.id} 
                banner={banner} 
                onEdit={handleEdit} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <BannerFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setBannerToEdit(null);
        }}
        onSave={fetchBanners}
        bannerToEdit={bannerToEdit}
        triggerSuccess={triggerSuccess}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMessage}
      />
    </div>
  );
};

export default Banners;