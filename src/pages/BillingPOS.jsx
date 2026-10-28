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
  Camera,
  ArrowRight,
} from 'lucide-react';
import { itemsApi, categoriesApi, invoicesApi } from '../services/api';
import CameraInvoiceModal from '../components/inventory/CameraInvoiceModal';

export default function BillingPOS({ onInvoiceCreated, store, gstEnabled = true, onToggleGst }) {
  // All Medicines & Categories State
  const [allItems, setAllItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // Mobile View Tab switcher: 'catalog' | 'cart'
  const [mobileTab, setMobileTab] = useState('catalog');

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
  const totalUnits = cart.reduce((sum, i) => sum + i.quantity, 0);

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
        setMobileTab('catalog');

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
    <div className="space-y-3 sm:space-y-4">
      {/* Alert / Toast Banners */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Mobile Top Navigation Segmented Switcher (Visible on < lg screens) */}
      <div className="lg:hidden bg-beige-50 p-1 rounded-2xl border border-beige-200 shadow-xs grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileTab === 'catalog'
              ? 'bg-navy-900 text-beige-50 shadow-sm'
              : 'text-navy-800 hover:bg-beige-150'
            }`}
        >
          <Pill className="w-3.5 h-3.5" />
          <span>Medicines ({filteredMedicines.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${mobileTab === 'cart'
              ? 'bg-navy-900 text-beige-50 shadow-sm'
              : 'text-navy-800 hover:bg-beige-150'
            }`}
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>Bill & Pay ({cart.length})</span>
          {cart.length > 0 && (
            <span className="bg-beige-500 text-navy-950 px-1.5 py-0.2 rounded-full text-[10px] font-black">
              ₹{totals.grandTotal}
            </span>
          )}
        </button>
      </div>

      {/* Main POS Grid: Left = Medicines Catalog + Selected Bill Items | Right = Customer & Checkout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
        {/* LEFT COLUMN (7 cols): Medicines Catalog & Selected Bill Table */}
        <div
          className={`lg:col-span-7 xl:col-span-8 space-y-4 lg:space-y-5 ${mobileTab === 'cart' ? 'hidden lg:block' : 'block'
            }`}
        >
          {/* 1. ALL MEDICINES CATALOG SECTION */}
          <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-xs overflow-hidden">
            {/* Catalog Top Bar: Title + Search + Refresh */}
            <div className="p-3.5 sm:p-4 border-b border-beige-200 bg-beige-100/70 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-navy-900 text-beige-300 rounded-xl shadow-xs">
                    <Pill className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-navy-900 text-sm flex items-center gap-2">
                      <span>Available Medicines</span>
                      <span className="text-[11px] bg-navy-800 text-beige-100 px-2 py-0.5 rounded-full font-bold">
                        {filteredMedicines.length}
                      </span>
                    </h2>
                    <p className="text-[11px] text-navy-700/70">
                      Tap medicine card to add to current bill
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-beige-50 bg-navy-900 hover:bg-navy-800 rounded-xl transition-all cursor-pointer shadow-xs border border-navy-700"
                    title="Capture supplier invoice via camera to add medicines"
                  >
                    <Camera className="w-3.5 h-3.5 text-beige-400" />
                    <span>Scan Medicine (Camera)</span>
                  </button>

                  <button
                    onClick={fetchCatalog}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-navy-800 hover:text-navy-950 bg-beige-50 hover:bg-beige-200/80 border border-beige-300 rounded-xl transition-colors cursor-pointer"
                    title="Refresh medicines stock"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingCatalog ? 'animate-spin text-navy-700' : ''}`} />
                    <span className="hidden xs:inline">Refresh Stock</span>
                  </button>
                </div>
              </div>

              {/* Search Input & Category Dropdown Row */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by Brand, Generic, Batch, Rack..."
                    className="w-full pl-10 pr-8 py-2.5 bg-white rounded-xl border border-beige-300 text-xs sm:text-sm text-navy-950 placeholder-navy-300 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-navy-400 hover:text-navy-700 font-bold p-1"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Dropdown */}
                <div className="w-full sm:w-60 shrink-0">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white rounded-xl border border-beige-300 text-xs sm:text-sm font-bold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 cursor-pointer"
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
            <div className="p-3 sm:p-4 max-h-[460px] overflow-y-auto bg-beige-100/40 touch-scroll">
              {loadingCatalog ? (
                <div className="py-16 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 mx-auto"></div>
                  <p className="text-xs text-navy-700 mt-2">Loading medicines inventory...</p>
                </div>
              ) : filteredMedicines.length === 0 ? (
                <div className="py-12 text-center text-navy-400">
                  <Package className="w-10 h-10 mx-auto text-navy-300 mb-2" />
                  <p className="text-sm font-bold text-navy-800">No matching medicines found</p>
                  <p className="text-xs text-navy-500 mt-1">
                    Try clearing the search filter or selecting "All" categories.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3">
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
                        className={`group relative rounded-xl p-3 sm:p-3.5 border transition-all flex flex-col justify-between select-none ${isOut
                            ? 'bg-beige-100/60 border-beige-200 opacity-60 cursor-not-allowed'
                            : isSelected
                              ? 'bg-navy-50/90 border-navy-700 ring-2 ring-navy-600/30 cursor-pointer shadow-sm'
                              : 'bg-white border-beige-200 hover:border-navy-400 hover:shadow-md cursor-pointer'
                          }`}
                      >
                        {/* Top row: Category Badge & Stock Status */}
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1.5">
                            <span
                              style={{
                                backgroundColor: `${item.category?.color || '#1e4670'}18`,
                                color: item.category?.color || '#153354',
                              }}
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full truncate"
                            >
                              {item.category?.name || 'Medicine'}
                            </span>

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isOut
                                  ? 'bg-rose-100 text-rose-800'
                                  : isLow
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                            >
                              {isOut ? 'Out of Stock' : `${item.stock} in Stock`}
                            </span>
                          </div>

                          {/* Medicine Name & Generic */}
                          <h4 className="font-extrabold text-navy-950 text-sm leading-snug group-hover:text-navy-700 transition-colors">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-navy-700/80 italic line-clamp-1 mt-0.5">
                            {item.genericName}
                          </p>

                          {/* Meta Info: Batch, Rack, Expiry */}
                          <div className="mt-2 pt-2 border-t border-beige-200/70 flex flex-wrap items-center justify-between text-[10px] text-navy-600 gap-1 font-medium">
                            <span className="font-mono bg-beige-150 px-1.5 py-0.5 rounded text-navy-900 font-semibold">
                              B: {item.batchNo}
                            </span>
                            <span>Rack: <strong className="text-navy-900">{item.rackLocation || 'A-1'}</strong></span>
                            <span>
                              Exp:{' '}
                              <strong className="text-navy-900">
                                {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                                  month: 'short',
                                  year: '2-digit',
                                })}
                              </strong>
                            </span>
                          </div>
                        </div>

                        {/* Bottom row: Price & Add / Qty Controls */}
                        <div className="mt-3 pt-2 border-t border-beige-200/70 flex items-center justify-between">
                          <div>
                            <div className="text-base font-black text-navy-900 font-mono leading-none">
                              ₹{sellPrice.toFixed(2)}
                            </div>
                            {mrpPrice > sellPrice && (
                              <div className="text-[10px] text-navy-400 line-through font-mono mt-0.5">
                                MRP ₹{mrpPrice.toFixed(2)}
                              </div>
                            )}
                          </div>

                          {isSelected ? (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-1.5 bg-navy-900 text-beige-50 rounded-xl p-1 shadow-xs"
                            >
                              <button
                                type="button"
                                onClick={(e) => decrementFromCatalog(item._id, e)}
                                className="w-7 h-7 rounded-lg bg-navy-800 hover:bg-navy-700 active:scale-95 flex items-center justify-center font-bold transition-all text-beige-100"
                                title="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="px-1.5 text-xs font-black font-mono text-beige-100">
                                {qtyInCart}
                              </span>
                              <button
                                type="button"
                                onClick={() => addToCart(item)}
                                className="w-7 h-7 rounded-lg bg-navy-800 hover:bg-navy-700 active:scale-95 flex items-center justify-center font-bold transition-all text-beige-100"
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
                              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isOut
                                  ? 'bg-beige-200 text-navy-400 cursor-not-allowed'
                                  : 'bg-navy-100 text-navy-900 hover:bg-navy-900 hover:text-beige-50 border border-navy-300'
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
          <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-xs overflow-hidden">
            <div className="px-4 sm:px-5 py-3.5 bg-beige-100/80 border-b border-beige-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-navy-800" />
                <h3 className="font-extrabold text-navy-900 text-sm">Selected Bill Items</h3>
                <span className="text-xs bg-navy-900 text-beige-100 px-2.5 py-0.5 rounded-full font-bold">
                  {cart.length} {cart.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-700 hover:text-rose-900 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-10 text-center text-navy-400">
                <ShoppingBag className="w-8 h-8 mx-auto text-beige-300 mb-2" />
                <p className="text-sm font-bold text-navy-800">No medicines selected yet</p>
                <p className="text-xs text-navy-500 mt-0.5">
                  Click on any medicine card from the catalog above to add to this bill.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto touch-scroll">
                <table className="w-full text-left text-xs min-w-[550px]">
                  <thead className="bg-beige-150 text-navy-800 font-bold uppercase text-[11px] border-b border-beige-200">
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
                  <tbody className="divide-y divide-beige-200/80 bg-white">
                    {cart.map((item, idx) => {
                      const baseAmt = item.unitPrice * item.quantity;
                      const discAmt = (baseAmt * (item.discountPercent || 0)) / 100;
                      const taxable = baseAmt - discAmt;
                      const effectiveGst = gstEnabled ? (item.gstRate || 0) : 0;
                      const lineTotal = taxable + (taxable * effectiveGst) / 100;

                      return (
                        <tr key={item._id} className="hover:bg-beige-50/70 transition-colors">
                          <td className="py-2.5 px-3">
                            <div className="font-extrabold text-navy-950">{item.name}</div>
                            <div className="text-[10px] text-navy-600 italic truncate max-w-xs">{item.genericName}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="font-mono text-navy-900 font-bold">{item.batchNo}</span>
                            <div className="text-[10px] text-navy-500">
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
                              className="w-16 px-1.5 py-1 text-right text-xs rounded-lg border border-beige-300 font-mono text-navy-900 focus:outline-navy-700 bg-beige-50/50"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                type="button"
                                onClick={() => updateCartItem(idx, 'quantity', item.quantity - 1)}
                                className="w-6 h-6 rounded bg-beige-200 hover:bg-beige-300 text-navy-900 font-bold flex items-center justify-center cursor-pointer"
                              >
                                -
                              </button>
                              <input
                                type="number"
                                min="1"
                                max={item.stock}
                                value={item.quantity}
                                onChange={(e) => updateCartItem(idx, 'quantity', e.target.value)}
                                className="w-12 text-center py-1 text-xs font-black rounded-lg border border-beige-300 text-navy-950 focus:outline-navy-700 bg-beige-50"
                              />
                              <button
                                type="button"
                                onClick={() => updateCartItem(idx, 'quantity', item.quantity + 1)}
                                className="w-6 h-6 rounded bg-beige-200 hover:bg-beige-300 text-navy-900 font-bold flex items-center justify-center cursor-pointer"
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
                              className="w-12 text-center py-1 text-xs font-semibold rounded-lg border border-beige-300 text-navy-900 focus:outline-navy-700 bg-beige-50/50"
                            />
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            {gstEnabled ? (
                              <span className="text-navy-800 font-mono text-[11px] font-bold">{item.gstRate}%</span>
                            ) : (
                              <span className="text-navy-400 font-mono text-[10px]">0% (Off)</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-black text-navy-950 text-sm font-mono">
                            ₹{lineTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
                              type="button"
                              onClick={() => removeFromCart(idx)}
                              className="text-navy-400 hover:text-rose-700 p-1 rounded-lg transition-colors cursor-pointer"
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
        <div
          className={`lg:col-span-5 xl:col-span-4 space-y-3 sm:space-y-4 lg:sticky lg:top-4 ${mobileTab === 'catalog' ? 'hidden lg:block' : 'block'
            }`}
        >
          {/* Customer & Doctor Card */}
          <div className="bg-beige-50 p-4 rounded-2xl border border-beige-200 shadow-xs space-y-3">
            <h3 className="font-extrabold text-navy-900 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-navy-700" />
              <span>Customer & Patient Details</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-[11px] text-navy-700 font-bold block mb-1">Customer / Patient Name</label>
                <input
                  type="text"
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 rounded-xl border border-beige-300 text-xs font-semibold text-navy-950 focus:ring-2 focus:ring-navy-600/30 focus:outline-none bg-white"
                />
              </div>

              <div>
                <label className="text-[11px] text-navy-700 font-bold block mb-1">Phone Number</label>
                <input
                  type="text"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-beige-300 text-xs font-semibold text-navy-950 focus:ring-2 focus:ring-navy-600/30 focus:outline-none bg-white"
                />
              </div>

              <div className="pt-2 border-t border-beige-200">
                <label className="text-[11px] text-navy-700 font-bold flex items-center gap-1 mb-1">
                  <Stethoscope className="w-3.5 h-3.5 text-navy-700" />
                  <span>Prescribing Doctor (Optional)</span>
                </label>
                <input
                  type="text"
                  value={doctor.name}
                  onChange={(e) => setDoctor({ ...doctor, name: e.target.value })}
                  placeholder="e.g. Dr. A. Sharma / Self"
                  className="w-full px-3 py-2 rounded-xl border border-beige-300 text-xs font-semibold text-navy-950 focus:ring-2 focus:ring-navy-600/30 focus:outline-none bg-white"
                />
              </div>
            </div>
          </div>

          {/* Payment & Summary Card */}
          <div className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-navy-900 text-sm">Bill Summary & Payment</h3>
              <span className="text-[11px] font-bold text-navy-900 bg-beige-200 px-2.5 py-0.5 rounded-full">
                {totalUnits} Units Total
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
                    className={`flex flex-col items-center justify-center p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${isSelected
                        ? 'border-navy-900 bg-navy-900 text-beige-50 shadow-sm'
                        : 'border-beige-300 bg-white hover:bg-beige-100 text-navy-800'
                      }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Bill Summary Breakdown */}
            <div className="space-y-1.5 text-xs text-navy-800 border-t border-b border-beige-200 py-3">
              <div className="flex justify-between">
                <span>Taxable Subtotal:</span>
                <span className="font-mono font-bold">₹{totals.subTotal.toFixed(2)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Total Discount:</span>
                  <span className="font-mono">-₹{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 font-medium">
                  <span>GST Tax (CGST + SGST):</span>
                  <span
                    className={`text-[10px] font-black px-1.5 py-0.2 rounded ${gstEnabled
                        ? 'bg-emerald-100 text-emerald-900'
                        : 'bg-rose-100 text-rose-900'
                      }`}
                  >
                    {gstEnabled ? 'ON' : 'OFF'}
                  </span>
                </span>
                <span className="font-mono font-bold">
                  {gstEnabled ? `+₹${totals.taxTotal.toFixed(2)}` : '₹0.00'}
                </span>
              </div>
              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-[11px] text-navy-400">
                  <span>Round Off:</span>
                  <span className="font-mono">
                    {totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 text-base font-black text-navy-950 border-t border-beige-300">
                <span>Net Payable:</span>
                <span className="text-xl text-navy-900 font-mono font-black">
                  ₹{totals.grandTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Paid / Due status */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-navy-700 font-bold">Payment Status:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentStatus('paid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${paymentStatus === 'paid'
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-beige-200 text-navy-800 hover:bg-beige-300'
                    }`}
                >
                  Fully Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('partial')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all ${paymentStatus === 'partial'
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-beige-200 text-navy-800 hover:bg-beige-300'
                    }`}
                >
                  Due / Partial
                </button>
              </div>
            </div>

            {paymentStatus === 'partial' && (
              <div className="space-y-1.5 text-xs bg-amber-50 p-2.5 rounded-xl border border-amber-300">
                <div className="flex justify-between items-center">
                  <label className="text-amber-900 font-bold">Amount Received:</label>
                  <input
                    type="number"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="₹0"
                    className="w-24 px-2 py-1 text-right text-xs font-bold rounded-lg border border-amber-400 focus:outline-amber-700 bg-white text-navy-950"
                  />
                </div>
                <div className="flex justify-between text-rose-800 font-black">
                  <span>Balance Due:</span>
                  <span>₹{totals.balanceDue.toFixed(2)}</span>
                </div>
              </div>
            )}

            {/* Generate Bill & Print Button */}
            <button
              onClick={handleCheckout}
              disabled={submitting || cart.length === 0}
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${submitting || cart.length === 0
                  ? 'bg-beige-300 cursor-not-allowed text-navy-400'
                  : 'bg-navy-900 hover:bg-navy-800 active:scale-[0.99] text-beige-50 shadow-navy-950/30 border border-navy-700'
                }`}
            >
              {submitting ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Printer className="w-5 h-5 text-beige-300" />
                  <span>Generate Bill & Print (₹{totals.grandTotal.toFixed(2)})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Bottom Bill Bar on Mobile (when in catalog view & items are in cart) */}
      {cart.length > 0 && mobileTab === 'catalog' && (
        <div className="lg:hidden fixed bottom-14 left-3 right-3 z-30 bg-navy-950 text-beige-50 p-3 rounded-2xl shadow-2xl border border-navy-800 flex items-center justify-between animate-bounce-short">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-beige-500 text-navy-950 flex items-center justify-center font-black">
              {cart.length}
            </div>
            <div>
              <div className="text-xs text-beige-300 font-semibold">{totalUnits} units in bill</div>
              <div className="text-base font-black text-beige-50 font-mono">₹{totals.grandTotal.toFixed(2)}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileTab('cart')}
            className="flex items-center gap-1.5 px-4 py-2 bg-beige-500 hover:bg-beige-400 text-navy-950 text-xs font-black rounded-xl cursor-pointer transition-colors"
          >
            <span>Review & Pay</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Camera Capture Invoice Modal */}
      <CameraInvoiceModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        categories={categories}
        onMedicinesSaved={() => {
          fetchCatalog();
          setSuccessMsg('Medicines added from captured invoice! Catalog updated.');
          setTimeout(() => setSuccessMsg(''), 4000);
        }}
      />
    </div>
  );
}
