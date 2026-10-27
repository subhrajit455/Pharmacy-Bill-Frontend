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
} from 'lucide-react';
import { itemsApi, categoriesApi } from '../services/api';

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
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Pill className="w-6 h-6 text-teal-600" />
            <span>Pharmacy Medicines & Stock</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage drug formulations, batches, expiry alerts, rack locations, and inventory levels
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, generic, batch..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-teal-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-teal-500 bg-white"
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-teal-500 bg-white"
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-teal-500 bg-white"
          >
            <option value="">Expiry: All Items</option>
            <option value="expiring_soon">⏳ Expiring Soon (&lt; 60 Days)</option>
            <option value="expired">🚫 Expired</option>
          </select>
        </div>
      </div>

      {/* Medicines Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-xs text-slate-400 mt-2">Loading medicine inventory...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Pill className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No medicines found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search filters or click "Add Medicine" or "Load Demo Stock".</p>
            <button
              onClick={onSeedData}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-xs font-semibold hover:bg-teal-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Load 15+ Demo Medicines</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200 text-[11px]">
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
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const now = new Date();
                  const expDate = new Date(item.expiryDate);
                  const daysToExpiry = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
                  const isExpired = daysToExpiry <= 0;
                  const isExpiringSoon = daysToExpiry > 0 && daysToExpiry <= 60;
                  const isLow = item.stock <= item.minStockAlert;
                  const isOut = item.stock <= 0;

                  return (
                    <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                        <div className="text-[10px] text-slate-400 italic truncate max-w-xs">{item.genericName}</div>
                        {item.manufacturer && (
                          <div className="text-[9px] text-slate-400">Mfg: {item.manufacturer}</div>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          style={{
                            backgroundColor: `${item.category?.color || '#3b82f6'}15`,
                            color: item.category?.color || '#3b82f6',
                          }}
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold inline-block"
                        >
                          {item.category?.name || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span className="font-mono text-slate-700 font-medium">{item.batchNo}</span>
                        <div
                          className={`text-[10px] font-medium ${
                            isExpired
                              ? 'text-rose-600 font-bold'
                              : isExpiringSoon
                              ? 'text-amber-600 font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          {expDate.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          {isExpired && ' (Expired)'}
                          {isExpiringSoon && ` (${daysToExpiry}d)`}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-center text-slate-600 font-medium">
                        {item.rackLocation || 'A-1'}
                      </td>
                      <td className="py-3 px-2 text-right text-slate-500 font-mono">
                        ₹{Number(item.mrp || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-slate-900 font-mono">
                        ₹{Number(item.sellingPrice || item.mrp || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`font-black text-sm ${
                            isOut ? 'text-rose-600' : isLow ? 'text-amber-600' : 'text-slate-800'
                          }`}
                        >
                          {item.stock}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{item.packType || 'Units'}</span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
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
                            className="px-2 py-1 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 text-[10px] font-semibold rounded-md transition-colors"
                          >
                            Stock +/-
                          </button>
                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Edit Medicine"
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item._id, item.name)}
                            title="Delete Medicine"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden my-8">
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h3 className="font-bold text-slate-800 text-base">
                {editingItem ? 'Edit Medicine / Formulation' : 'Add New Medicine to Inventory'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveItem} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Medicine / Brand Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Dolo 650 Tablet"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Generic Composition <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.genericName}
                    onChange={(e) => setFormData({ ...formData, genericName: e.target.value })}
                    placeholder="e.g. Paracetamol 650mg"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500 bg-white"
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
                  <label className="font-semibold text-slate-700 block mb-1">
                    Batch Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.batchNo}
                    onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                    placeholder="e.g. B2409"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500 uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Expiry Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Rack / Shelf Location</label>
                  <input
                    type="text"
                    value={formData.rackLocation}
                    onChange={(e) => setFormData({ ...formData, rackLocation: e.target.value })}
                    placeholder="e.g. Rack A-12, Cold Room"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Manufacturer</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="e.g. Micro Labs, Cipla"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pack Type / Unit</label>
                  <input
                    type="text"
                    value={formData.packType}
                    onChange={(e) => setFormData({ ...formData, packType: e.target.value })}
                    placeholder="e.g. Strip of 15, Bottle 100ml"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Purchase / Cost Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.purchasePrice}
                    onChange={(e) => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder="25.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    MRP (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.mrp}
                    onChange={(e) => setFormData({ ...formData, mrp: e.target.value })}
                    placeholder="35.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                    placeholder="32.00"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">GST Rate (%)</label>
                  <select
                    value={formData.gstRate}
                    onChange={(e) => setFormData({ ...formData, gstRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500 bg-white"
                  >
                    <option value={0}>0% (Tax Exempt)</option>
                    <option value={5}>5%</option>
                    <option value={12}>12% (Standard Pharma)</option>
                    <option value={18}>18% (Devices / Cosmetic)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Current Stock <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    placeholder="100"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Low Stock Alert Min</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minStockAlert}
                    onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-teal-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-800 text-sm">Quick Stock Adjustment</h3>
              <button onClick={() => setIsAdjustModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Medicine:</span>
                <div className="font-bold text-slate-800 text-sm mt-0.5">{adjustingItem.name}</div>
                <div className="text-slate-400">Current Stock: <strong className="text-teal-700">{adjustingItem.stock}</strong> units</div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustAction('add')}
                  className={`flex-1 py-2 rounded-xl font-bold ${
                    adjustAction === 'add' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  + Add Stock
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustAction('subtract')}
                  className={`flex-1 py-2 rounded-xl font-bold ${
                    adjustAction === 'subtract' ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  - Deduct Stock
                </button>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-teal-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white rounded-lg font-bold hover:bg-teal-700"
                >
                  Apply Change
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

