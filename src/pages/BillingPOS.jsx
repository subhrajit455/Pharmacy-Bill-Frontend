import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Pill,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Check,
} from 'lucide-react';
import { itemsApi, categoriesApi, invoicesApi } from '../services/api';

export default function BillingPOS({ onInvoiceCreated, store, gstEnabled = true, onToggleGst }) {
  // All Medicines & Categories State
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Cart (Selected Items for Bill)
  const [cart, setCart] = useState([]);

  // Customer & Doctor info
  const [customer, setCustomer] = useState({
    name: 'Walk-in Customer',
    phone: '',
    address: '',
  });

  const [doctor, setDoctor] = useState({
    name: 'Self / OTC',
    regNo: '',
    clinic: '',
  });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paymentStatus, setPaymentStatus] = useState('paid');
  const [amountPaid, setAmountPaid] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const searchInputRef = useRef(null);

  // Load all medicines and categories on mount
  const fetchCatalog = async () => {
    try {
      setLoadingCatalog(true);
      const [itemsRes, catRes] = await Promise.all([
        itemsApi.getAll(),
        categoriesApi.getAll(),
      ]);
      if (itemsRes.data?.success) {
        setAllItems(itemsRes.data.data || []);
      }
      if (catRes.data?.success) {
        setCategories(catRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load medicines for POS:', err);
      setErrorMsg('Could not load medicines catalog. Please check connection.');
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  // Filter medicines by search query and selected category
  const filteredMedicines = allItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (item.category?._id || item.category) === selectedCategory;

    if (!searchQuery.trim()) return matchesCategory;

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      item.name?.toLowerCase().includes(q) ||
      item.genericName?.toLowerCase().includes(q) ||
      item.batchNo?.toLowerCase().includes(q) ||
      item.barcode?.toLowerCase().includes(q) ||
      item.rackLocation?.toLowerCase().includes(q) ||
      item.manufacturer?.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  // Get quantity of an item currently in cart
  const getCartQty = (itemId) => {
    const found = cart.find((c) => c._id === itemId);
    return found ? found.quantity : 0;
  };

  // Add Item to Cart
  const addToCart = (item) => {
    const existingIndex = cart.findIndex((c) => c._id === item._id);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.quantity + 1 > item.stock) {
        setErrorMsg(`Cannot add more: only ${item.stock} in stock for ${item.name}`);
        setTimeout(() => setErrorMsg(''), 3000);
        return;
      }
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      setCart(updated);
    } else {
      if (item.stock <= 0) {
        setErrorMsg(`${item.name} is OUT OF STOCK!`);
        setTimeout(() => setErrorMsg(''), 3000);
        return;
      }

      setCart([
        ...cart,
        {
          _id: item._id,
          name: item.name,
          genericName: item.genericName,
          category: item.category?.name || 'General',
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          packType: item.packType,
          hsnCode: item.hsnCode || '3004',
          stock: item.stock,
          mrp: item.mrp,
          unitPrice: item.sellingPrice || item.mrp,
          quantity: 1,
          discountPercent: 0,
          gstRate: item.gstRate ?? 12,
        },
      ]);
    }
  };

  // Decrement item quantity directly from medicine card
  const decrementFromCatalog = (itemId, e) => {
    e.stopPropagation();
    const existingIndex = cart.findIndex((c) => c._id === itemId);
    if (existingIndex === -1) return;

    const updated = [...cart];
    if (updated[existingIndex].quantity <= 1) {
      updated.splice(existingIndex, 1);
    } else {
      updated[existingIndex].quantity -= 1;
    }
    setCart(updated);
  };

  // Update item in cart
  const updateCartItem = (index, field, value) => {
    const updated = [...cart];
    const item = updated[index];

    if (field === 'quantity') {
      const num = parseInt(value, 10);
      if (isNaN(num) || num <= 0) {
        item.quantity = 1;
      } else if (num > item.stock) {
        item.quantity = item.stock;
        setErrorMsg(`Maximum stock available for ${item.name}: ${item.stock}`);
        setTimeout(() => setErrorMsg(''), 3000);
      } else {
        item.quantity = num;
      }
    } else if (field === 'unitPrice') {
      item.unitPrice = Math.max(0, parseFloat(value) || 0);
    } else if (field === 'discountPercent') {
      item.discountPercent = Math.min(100, Math.max(0, parseFloat(value) || 0));
    } else if (field === 'gstRate') {
      item.gstRate = Math.max(0, parseFloat(value) || 0);
    }

    setCart(updated);
  };

  // Remove item from cart
  const removeFromCart = (index) => {
    const updated = [...cart];
    updated.splice(index, 1);
    setCart(updated);
  };

  // Clear cart
  const handleClearCart = () => {
    if (cart.length > 0 && window.confirm('Clear all selected items from the current bill?')) {
      setCart([]);
    }
  };

  // Calculations
  const calculateTotals = () => {
    let subTotal = 0;
    let discountTotal = 0;
    let taxTotal = 0;

    cart.forEach((item) => {
      const base = item.unitPrice * item.quantity;
      const discount = (base * (item.discountPercent || 0)) / 100;
      const taxable = base - discount;
      const effectiveGst = gstEnabled ? (item.gstRate || 0) : 0;
      const tax = (taxable * effectiveGst) / 100;

      subTotal += taxable;
      discountTotal += discount;
      taxTotal += tax;
    });

    const rawTotal = subTotal + taxTotal;
    const grandTotal = Math.round(rawTotal);
    const roundOff = Number((grandTotal - rawTotal).toFixed(2));

    const finalAmountPaid = paymentStatus === 'paid' ? grandTotal : (parseFloat(amountPaid) || 0);
    const balanceDue = Math.max(0, Number((grandTotal - finalAmountPaid).toFixed(2)));

    return {
      subTotal: Number(subTotal.toFixed(2)),
      discountTotal: Number(discountTotal.toFixed(2)),
      taxTotal: Number(taxTotal.toFixed(2)),
      roundOff,
      grandTotal,
      balanceDue,
    };
  };

  const totals = calculateTotals();

  // Submit and create bill
  const handleCheckout = async () => {
    if (cart.length === 0) {
      setErrorMsg('Please select at least one medicine to generate a bill.');
      setTimeout(() => setErrorMsg(''), 3000);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg('');

      const invoicePayload = {
        customer,
        doctor,
        items: cart.map((item) => ({
          item: item._id,
          name: item.name,
          genericName: item.genericName,
          batchNo: item.batchNo,
          expiryDate: item.expiryDate,
          packType: item.packType,
          hsnCode: item.hsnCode,
          quantity: item.quantity,
          mrp: item.mrp,
          unitPrice: item.unitPrice,
          discountPercent: item.discountPercent,
          gstRate: gstEnabled ? item.gstRate : 0,
        })),
        paymentMethod,
        paymentStatus,
        amountPaid: paymentStatus === 'paid' ? totals.grandTotal : (parseFloat(amountPaid) || 0),
        notes,
      };

      const res = await invoicesApi.create(invoicePayload);

      if (res.data?.success) {
        setSuccessMsg(`Invoice ${res.data.data.invoiceNumber} generated! Opening print options...`);
        onInvoiceCreated(res.data.data);

        // Reset cart & customer details
        setCart([]);
        setCustomer({ name: 'Walk-in Customer', phone: '', address: '' });
        setDoctor({ name: 'Self / OTC', regNo: '', clinic: '' });
        setNotes('');
        setAmountPaid('');
        setPaymentStatus('paid');

        // Refresh catalog stock counts
        fetchCatalog();

        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error('Invoice creation failed:', err);
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Alert / Toast Banners */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main POS Grid: Left = All Medicines Catalog + Selected Bill Items | Right = Customer & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT COLUMN (7 cols): All Medicines Catalog & Selected Bill Table */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5">
          {/* 1. ALL MEDICINES CATALOG SECTION */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Catalog Top Bar: Title + Search + Refresh */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-teal-100 text-teal-700 rounded-xl">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                      <span>Available Medicines</span>
                      <span className="text-[11px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                        {filteredMedicines.length}
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      Click any medicine card below to add it to the current bill
                    </p>
                  </div>
                </div>

                <button
                  onClick={fetchCatalog}
                  className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-teal-700 bg-white hover:bg-teal-50 border border-slate-200 rounded-xl transition-colors"
                  title="Refresh medicines stock"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin text-teal-600' : ''}`} />
                  <span>Refresh Stock</span>
                </button>
              </div>

              {/* Search Input & Category Dropdown Row */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter medicines by Brand name, Generic formula, Batch No, Rack or Barcode..."
                    className="w-full pl-10 pr-8 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Dropdown */}
                <div className="sm:w-64 shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 cursor-pointer"
                  >
                    <option value="all">All Categories ({allItems.length})</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name} {cat.itemCount !== undefined ? `(${cat.itemCount})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Medicines Grid */}
            <div className="p-4 max-h-[420px] overflow-y-auto bg-slate-50/40">
              {loadingCatalog ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                  <p className="text-xs text-slate-500 mt-2">Loading medicines inventory...</p>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <Package className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-600">No matching medicines found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Try clearing the search filter or selecting "All" categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                  {filteredMedicines.map((item) => {
                    const isOut = item.stock <= 0;
                    const isLow = item.stock > 0 && item.stock <= item.minStockAlert;
                    const qtyInCart = getCartQty(item._id);
                    const isSelected = qtyInCart > 0;
                    const sellPrice = Number(item.sellingPrice || item.mrp || 0);
                    const mrpPrice = Number(item.mrp || sellPrice);

                    return (
                      <div
                        key={item._id}
                        onClick={() => !isOut && addToCart(item)}
                        className={`group relative rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                          isOut
                            ? 'bg-slate-100/70 border-slate-200 opacity-60 cursor-not-allowed'
                            : isSelected
                            ? 'bg-teal-50/70 border-teal-500 ring-2 ring-teal-500/20 cursor-pointer shadow-xs'
                            : 'bg-white border-slate-200 hover:border-teal-400 hover:shadow-md cursor-pointer'
                        }`}
                      >
                        {/* Top row: Category Badge & Stock Status */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              style={{
                                backgroundColor: `${item.category?.color || '#0d9488'}15`,
                                color: item.category?.color || '#0d9488',
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full truncate"
                            >
                              {item.category?.name || 'Medicine'}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                                isOut
                                  ? 'bg-rose-100 text-rose-700'
                                  : isLow
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {isOut ? 'Out of Stock' : `${item.stock} in Stock`}
                            </span>
                          </div>

                          {/* Medicine Name & Generic */}
                          <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-teal-800 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 italic line-clamp-1 mt-0.5">
                            {item.genericName}
                          </p>

                          {/* Meta Info: Batch, Rack, Expiry */}
                          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-1">
                            <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                              B: {item.batchNo}
                            </span>
                            <span>Rack: <strong className="text-slate-700">{item.rackLocation || 'A-1'}</strong></span>
                            <span>
                              Exp:{' '}
                              <strong className="text-slate-700">
                                {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  year: '2-digit',
                                })}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Bottom row: Price & Add / Qty Controls */}
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <div className="text-base font-black text-teal-800 font-mono leading-none">
                              ₹{sellPrice.toFixed(2)}
                            </div>
                            {mrpPrice > sellPrice && (
                              <div className="text-[10px] text-slate-400 line-through font-mono mt-0.5">
                                MRP ₹{mrpPrice.toFixed(2)}
                              </div>
                            )}
                          </div>

                          {isSelected ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 bg-teal-600 text-white rounded-lg p-1 shadow-xs"
                            >
                              <button
                                type="button"
                                onClick={(e) => decrementFromCatalog(item._id, e)}
                                className="w-6 h-6 rounded bg-teal-700 hover:bg-teal-800 flex items-center justify-center font-bold transition-colors"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-1.5 text-xs font-extrabold font-mono">
                                {qtyInCart}
                              </span>
                              <button
                                type="button"
                                onClick={() => addToCart(item)}
                                className="w-6 h-6 rounded bg-teal-700 hover:bg-teal-800 flex items-center justify-center font-bold transition-colors"
                                title="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={isOut}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!isOut) addToCart(item);
                              }}
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                isOut
                                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                  : 'bg-teal-50 text-teal-700 hover:bg-teal-600 hover:text-white border border-teal-200'
                              }`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 2. SELECTED BILL ITEMS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-teal-600" />
                <h3 className="font-bold text-slate-800 text-sm">Selected Items for Bill</h3>
                <span className="text-xs bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full font-bold">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear Selected</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">No medicines selected yet</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click on any medicine card from the catalog above to add it to this bill.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/75 text-slate-700 font-semibold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-2 text-center">Batch / Exp</th>
                      <th className="py-2.5 px-2 text-right">Rate (₹)</th>
                      <th className="py-2.5 px-2 text-center w-28">Qty</th>
                      <th className="py-2.5 px-2 text-center w-16">Disc%</th>
                      <th className="py-2.5 px-2 text-center w-14">GST%</th>
                      <th className="py-2.5 px-3 text-right">Total (₹)</th>
                      <th className="py-2.5 px-2 text-center w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {cart.map((item, idx) => {
                      const baseAmt = item.unitPrice * item.quantity;
                      const discAmt = (baseAmt * (item.discountPercent || 0)) / 100;
                      const taxable = baseAmt - discAmt;
                      const effectiveGst = gstEnabled ? (item.gstRate || 0) : 0;
                      const lineTotal = taxable + (taxable * effectiveGst) / 100;

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 italic">{item.genericName}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="font-mono text-slate-700">{item.batchNo}</span>
                            <div className="text-[10px] text-slate-400">
                              {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                                month: '2-digit',
                                year: '2-digit',
                              })}
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-right">
                            <input
                              type="number"
                              min="0"
                              step="0.5"
                              value={item.unitPrice}
                              onChange={(e) => updateCartItem(idx, 'unitPrice', e.target.value)}
                              className="w-16 px-1.5 py-1 text-right text-xs rounded border border-slate-200 focus:outline-teal-500"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateCartItem(idx, 'quantity', item.quantity - 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) => updateCartItem(idx, 'quantity', e.target.value)}
                                className="w-12 text-center py-1 text-xs font-bold rounded border border-slate-200 focus:outline-teal-500"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartItem(idx, 'quantity', item.quantity + 1)}
                                className="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.discountPercent}
                              onChange={(e) => updateCartItem(idx, 'discountPercent', e.target.value)}
                              className="w-12 text-center py-1 text-xs rounded border border-slate-200 focus:outline-teal-500"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {gstEnabled ? (
                              <span className="text-slate-600 font-mono text-[11px]">{item.gstRate}%</span>
                            ) : (
                              <span className="text-slate-400 font-mono text-[10px]">0% (Off)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-sm font-mono">
                            ₹{lineTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5/4 cols): Customer Info & Bill Checkout Panel */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4">
          {/* Customer & Doctor Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Customer / Patient Details</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Customer Name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mb-1">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Prescribing Doctor (Optional)</span>
                </label>
                <input
                  type="text"
                  value={doctor.name}
                  onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                  placeholder="e.g. Dr. A. Sharma / Self"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:ring-1 focus:ring-teal-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Payment & Summary Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Bill Summary & Payment</h3>
              <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} Total Units
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              {[
                { id: 'cash', label: 'Cash', icon: Banknote },
                { id: 'upi', label: 'UPI / QR', icon: QrCode },
                { id: 'card', label: 'Card', icon: CreditCard },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id)}
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50 text-teal-800 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bill Summary Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
              <div className="flex justify-between">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-medium">₹{totals.subTotal.toFixed(2)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount:</span>
                  <span className="font-mono">-₹{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5">
                  <span>GST Tax (CGST + SGST):</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                      gstEnabled
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {gstEnabled ? 'ON' : 'OFF'}
                  </span>
                </span>
                <span className="font-mono font-medium">
                  {gstEnabled ? `+₹${totals.taxTotal.toFixed(2)}` : '₹0.00'}
                </span>
              </div>
              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Round Off:</span>
                  <span className="font-mono">
                    {totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 text-base font-black text-slate-900 border-t border-slate-200">
                <span>Net Payable:</span>
                <span className="text-xl text-teal-700 font-mono">
                  ₹{totals.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Paid / Due status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">Payment Status:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('paid')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    paymentStatus === 'paid'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Fully Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('partial')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    paymentStatus === 'partial'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Due / Partial
                </button>
              </div>
            </div>

            {paymentStatus === 'partial' && (
              <div className="space-y-1.5 text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                <div className="flex justify-between items-center">
                  <label className="text-amber-800 font-medium">Amount Received:</label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="₹0"
                    className="w-24 px-2 py-1 text-right text-xs rounded border border-amber-300 focus:outline-amber-600 bg-white"
                  />
                </div>
                <div className="flex justify-between text-rose-700 font-bold">
                  <span>Balance Due:</span>
                  <span>₹{totals.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Generate Bill & Print Button */}
            <button
              onClick={handleCheckout}
              disabled={submitting || cart.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-md transition-all ${
                submitting || cart.length === 0
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-teal-600 hover:bg-teal-700 active:scale-[0.99] shadow-teal-700/20'
              }`}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Printer className="w-5 h-5" />
                  <span>Generate Bill & Print (₹{totals.grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
