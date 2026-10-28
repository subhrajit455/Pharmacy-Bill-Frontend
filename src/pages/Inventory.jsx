import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Plus,
  Filter,
  AlertTriangle,
  Edit2,
  Trash2,
  CheckCircle,
  X,
  Layers,
  Sparkles,
  Camera,
} from 'lucide-react';
import { itemsApi, categoriesApi } from '../services/api';
import CameraInvoiceModal from '../components/inventory/CameraInvoiceModal';

export default function Inventory({ onRefreshAlerts, onSeedData }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [stockFilter, setStockFilter] = useState('');
  const [expiryFilter, setExpiryFilter] = useState('');

  // Modals
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustingItem, setAdjustingItem] = useState(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustAction, setAdjustAction] = useState('add');

  // Form State
  const initialFormState = {
    name: '',
    genericName: '',
    category: '',
    batchNo: '',
    barcode: '',
    manufacturer: '',
    rackLocation: '',
    packType: 'Strip of 10',
    hsnCode: '3004',
    purchasePrice: '',
    mrp: '',
    sellingPrice: '',
    gstRate: 12,
    stock: '',
    minStockAlert: 10,
    expiryDate: '',
    isPrescriptionRequired: false,
  };
  const [formData, setFormData] = useState(initialFormState);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      if (stockFilter) params.stockStatus = stockFilter;
      if (expiryFilter) params.expiryStatus = expiryFilter;

      const [itemsRes, catRes] = await Promise.all([
        itemsApi.getAll(params),
        categoriesApi.getAll(),
      ]);

      if (itemsRes.data?.success) setItems(itemsRes.data.data);
      if (catRes.data?.success) setCategories(catRes.data.data);
    } catch (err) {
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [search, selectedCategory, stockFilter, expiryFilter]);

  // Open modal to add
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      ...initialFormState,
      category: categories[0]?._id || '',
      expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Open modal to edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      genericName: item.genericName,
      category: item.category?._id || item.category,
      batchNo: item.batchNo,
      barcode: item.barcode || '',
      manufacturer: item.manufacturer || '',
      rackLocation: item.rackLocation || '',
      packType: item.packType || 'Strip',
      hsnCode: item.hsnCode || '3004',
      purchasePrice: item.purchasePrice,
      mrp: item.mrp,
      sellingPrice: item.sellingPrice,
      gstRate: item.gstRate || 12,
      stock: item.stock,
      minStockAlert: item.minStockAlert || 10,
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
      isPrescriptionRequired: !!item.isPrescriptionRequired,
    });
    setFormError('');
    setIsAddEditModalOpen(true);
  };

  // Save add / edit
  const handleSaveItem = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.genericName || !formData.batchNo || !formData.category) {
      setFormError('Please fill in required fields: Name, Generic formula, Category, and Batch No.');
      return;
    }

    try {
      setIsSubmitting(true);
      setFormError('');

      if (editingItem) {
        await itemsApi.update(editingItem._id, formData);
      } else {
        await itemsApi.create(formData);
      }

      setIsAddEditModalOpen(false);
      fetchItems();
      if (onRefreshAlerts) onRefreshAlerts();
    } catch (err) {
      console.error('Failed to save item:', err);
      setFormError(err.response?.data?.message || err.message || 'Error saving medicine');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete item
  const handleDeleteItem = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete "${name}" from inventory?`)) {
      try {
        await itemsApi.delete(id);
        fetchItems();
        if (onRefreshAlerts) onRefreshAlerts();
      } catch (err) {
        alert('Failed to delete item: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Stock Adjustment
  const handleOpenAdjust = (item) => {
    setAdjustingItem(item);
    setAdjustQty('');
    setAdjustAction('add');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = async (e) => {
    e.preventDefault();
    const qty = parseInt(adjustQty, 10);
    if (isNaN(qty) || qty <= 0) {
      alert('Please enter a valid positive quantity.');
      return;
    }

    try {
      await itemsApi.adjustStock(adjustingItem._id, {
        quantity: qty,
        action: adjustAction,
      });
      setIsAdjustModalOpen(false);
      fetchItems();
      if (onRefreshAlerts) onRefreshAlerts();
    } catch (err) {
      alert('Failed to adjust stock: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <Pill className="w-5 h-5 sm:w-6 sm:h-6 text-navy-800" />
            <span>Pharmacy Medicines & Stock</span>
          </h2>
          <p className="text-xs text-navy-700/70 mt-0.5">
            Manage drug formulations, batches, expiry alerts, rack locations, and inventory levels
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setIsCameraModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-navy-900 hover:bg-navy-800 text-beige-50 font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer border border-navy-700"
          >
            <Camera className="w-4 h-4 text-beige-300" />
            <span>Scan Medicine (Camera)</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-beige-500 hover:bg-beige-400 text-navy-950 font-black text-xs sm:text-sm rounded-xl shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-beige-50 p-3.5 sm:p-4 rounded-2xl border border-beige-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, generic, batch..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-beige-300 bg-white text-navy-950 placeholder-navy-300 focus:outline-navy-700"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-beige-300 bg-white text-navy-900 focus:outline-navy-700 cursor-pointer"
          >
            <option value="">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-beige-300 bg-white text-navy-900 focus:outline-navy-700 cursor-pointer"
          >
            <option value="">Stock: All Items</option>
            <option value="in_stock">In Stock (&gt; Min Alert)</option>
            <option value="low_stock">⚠️ Low Stock (Alert)</option>
            <option value="out_of_stock">❌ Out of Stock (0)</option>
          </select>

          {/* Expiry Filter */}
          <select
            value={expiryFilter}
            onChange={(e) => setExpiryFilter(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-beige-300 bg-white text-navy-900 focus:outline-navy-700 cursor-pointer"
          >
            <option value="">Expiry: All Items</option>
            <option value="expiring_soon">⏳ Expiring Soon (&lt; 60 Days)</option>
            <option value="expired">🚫 Expired</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 mx-auto"></div>
            <p className="text-xs text-navy-700 mt-2">Loading medicine inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-navy-400">
            <Pill className="w-10 h-10 mx-auto text-navy-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No medicines found</p>
            <p className="text-xs text-navy-600 mt-1">Try adjusting search filters or scan an invoice with camera.</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setIsCameraModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 text-beige-50 rounded-xl text-xs font-bold hover:bg-navy-800 transition-colors cursor-pointer"
              >
                <Camera className="w-3.5 h-3.5 text-beige-300" />
                <span>Scan Medicine via Camera</span>
              </button>
              <button
                onClick={onSeedData}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-beige-200 text-navy-900 border border-beige-300 rounded-xl text-xs font-bold hover:bg-beige-300 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-beige-700" />
                <span>Load 15+ Demo Medicines</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-beige-150 text-navy-800 uppercase font-extrabold border-b border-beige-200 text-[11px]">
                <tr>
                  <th className="py-3 px-3">Medicine Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-2 text-center">Batch / Exp</th>
                  <th className="py-3 px-2 text-center">Rack</th>
                  <th className="py-3 px-2 text-right">MRP</th>
                  <th className="py-3 px-2 text-right">Rate</th>
                  <th className="py-3 px-2 text-center">Stock</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200/80 bg-white">
                {items.map((item) => {
                  const now = new Date();
                  const expDate = new Date(item.expiryDate);
                  const daysToExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                  const isExpired = daysToExpiry <= 0;
                  const isExpiringSoon = daysToExpiry > 0 && daysToExpiry <= 60;
                  const isLow = item.stock <= item.minStockAlert;
                  const isOut = item.stock <= 0;

                  return (
                    <tr key={item._id} className="hover:bg-beige-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-extrabold text-navy-950 text-sm">{item.name}</div>
                        <div className="text-[10px] text-navy-600 italic truncate max-w-xs">{item.genericName}</div>
                        {item.manufacturer && (
                          <div className="text-[9px] text-navy-400">Mfg: {item.manufacturer}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          style={{
                            backgroundColor: `${item.category?.color || '#1e4670'}18`,
                            color: item.category?.color || '#153354',
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                        >
                          {item.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-mono text-navy-900 font-bold">{item.batchNo}</span>
                        <div
                          className={`text-[10px] font-semibold ${isExpired
                              ? 'text-rose-700 font-bold'
                              : isExpiringSoon
                                ? 'text-amber-800'
                                : 'text-navy-500'
                            }`}
                        >
                          {expDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          {isExpired && ' (Expired)'}
                          {isExpiringSoon && ` (${daysToExpiry}d)`}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-navy-800 font-bold">
                        {item.rackLocation || 'A-1'}
                      </td>
                      <td className="py-3 px-2 text-right text-navy-600 font-mono">
                        ₹{Number(item.mrp || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right font-black text-navy-950 font-mono">
                        ₹{Number(item.sellingPrice || item.mrp || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`font-black text-sm ${isOut ? 'text-rose-700' : isLow ? 'text-amber-800' : 'text-navy-900'
                            }`}
                        >
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-navy-500 block">{item.packType || 'Units'}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                        >
                          {isOut ? 'Out of Stock' : isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenAdjust(item)}
                            title="Quick Adjust Stock"
                            className="px-2 py-1 bg-beige-150 hover:bg-navy-900 hover:text-beige-50 text-navy-900 text-[10px] font-bold rounded-lg transition-colors cursor-pointer border border-beige-300"
                          >
                            Stock +/-
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Medicine"
                            className="p-1.5 text-navy-700 hover:text-navy-950 hover:bg-beige-150 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id, item.name)}
                            title="Delete Medicine"
                            className="p-1.5 text-navy-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Medicine */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-beige-50 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-6 border border-beige-200 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center px-4 sm:px-6 py-3.5 border-b border-beige-200 bg-beige-100/90 shrink-0">
              <h3 className="font-extrabold text-navy-950 text-sm sm:text-base">
                {editingItem ? 'Edit Medicine / Formulation' : 'Add New Medicine to Inventory'}
              </h3>
              <div className="flex items-center gap-2">
                {!editingItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddEditModalOpen(false);
                      setIsCameraModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 bg-navy-900 hover:bg-navy-800 text-beige-50 border border-navy-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-beige-300" />
                    <span className="hidden xs:inline">Capture Invoice via Camera</span>
                    <span className="xs:hidden">Scan Camera</span>
                  </button>
                )}
                <button
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="text-navy-400 hover:text-navy-900 p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveItem} className="p-4 sm:p-6 space-y-4 overflow-y-auto touch-scroll">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs">
                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Medicine / Brand Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dolo 650 Tablet"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Generic Composition <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Category <span className="text-rose-600">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 font-bold text-navy-900 focus:outline-navy-700 bg-white cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Batch Number <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g. B2409"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 font-mono uppercase font-bold text-navy-950 focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Expiry Date <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 font-bold text-navy-950 focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={formData.rackLocation}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    placeholder="e.g. Rack A-12, Cold Room"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Micro Labs, Cipla"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Pack Type / Unit</label>
                  <input
                    type="text"
                    value={formData.packType}
                    onChange={(e) => setFormData({ ...formData, packType: e.target.value })}
                    placeholder="e.g. Strip of 15, Bottle 100ml"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-semibold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Purchase / Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="25.00"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-mono font-bold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    MRP (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="35.00"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-mono font-bold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Selling Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="32.00"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-mono font-black focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 font-bold text-navy-900 focus:outline-navy-700 bg-white cursor-pointer"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12% (Standard Pharma)</option>
                    <option value={18}>18% (Devices / Cosmetic)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">
                    Current Stock <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-bold focus:outline-navy-700 bg-white"
                  />
                </div>

                <div>
                  <label className="font-bold text-navy-900 block mb-1">Low Stock Alert Min</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-xl border border-beige-300 text-navy-950 font-bold focus:outline-navy-700 bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-beige-200 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-navy-700 hover:bg-beige-200/60 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-navy-900 hover:bg-navy-800 text-beige-50 rounded-xl text-xs font-black shadow-md border border-navy-700 cursor-pointer"
                >
                  {isSubmitting ? 'Saving...' : editingItem ? 'Update Medicine' : 'Save Medicine'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quick Adjust Stock */}
      {isAdjustModalOpen && adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/70 backdrop-blur-xs">
          <div className="bg-beige-50 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-beige-200">
            <div className="p-4 border-b border-beige-200 flex justify-between items-center bg-beige-100">
              <h3 className="font-extrabold text-navy-950 text-sm">Quick Stock Adjustment</h3>
              <button onClick={() => setIsAdjustModalOpen(false)} className="text-navy-400 hover:text-navy-900 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-navy-600 font-bold">Medicine:</span>
                <div className="font-extrabold text-navy-950 text-sm mt-0.5">{adjustingItem.name}</div>
                <div className="text-navy-500 font-medium">Current Stock: <strong className="text-navy-900">{adjustingItem.stock}</strong> units</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('add')}
                  className={`flex-1 py-2 rounded-xl font-bold cursor-pointer transition-colors ${adjustAction === 'add' ? 'bg-navy-900 text-beige-50' : 'bg-beige-200 text-navy-800'
                    }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('subtract')}
                  className={`flex-1 py-2 rounded-xl font-bold cursor-pointer transition-colors ${adjustAction === 'subtract' ? 'bg-rose-700 text-white' : 'bg-beige-200 text-navy-800'
                    }`}
                >
                  - Deduct Stock
                </button>
              </div>

              <div>
                <label className="font-bold text-navy-900 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 rounded-xl border border-beige-300 text-sm font-bold text-navy-950 focus:outline-navy-700 bg-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-beige-200">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 text-navy-600 hover:bg-beige-200 rounded-lg font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-navy-900 text-beige-50 rounded-lg font-black hover:bg-navy-800 cursor-pointer"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Camera Capture Invoice Scanner */}
      <CameraInvoiceModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        categories={categories}
        onMedicinesSaved={() => {
          fetchItems();
          if (onRefreshAlerts) onRefreshAlerts();
        }}
        onFillSingleForm={(scannedItem) => {
          setEditingItem(null);
          setFormData({
            ...initialFormState,
            ...scannedItem,
            category: scannedItem.category || categories[0]?._id || '',
          });
          setFormError('');
          setIsAddEditModalOpen(true);
        }}
      />
    </div>
  );
}
