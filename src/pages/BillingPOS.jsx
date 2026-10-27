import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  Plus,
  Trash2,
  Printer,
  CreditCard,
  Banknote,
  QrCode,
  User,
  Stethoscope,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  Percent,
} from 'lucide-react';
import { itemsApi, invoicesApi } from '../services/api';

export default function BillingPOS({ onInvoiceCreated, store }) {
  // Search & Cart State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
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

  // Search input ref for quick autofocus
  const searchInputRef = useRef(null);

  // Search medicines when query changes
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        try {
          setIsSearching(true);
          const res = await itemsApi.getAll({ search: searchQuery.trim() });
          if (res.data?.success) {
            setSearchResults(res.data.data || []);
          }
        } catch (err) {
          console.error('Failed to search items:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  // Add Item to Cart
  const addToCart = (item) => {
    // Check if item already exists in cart
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
          gstRate: item.gstRate || 12,
        },
      ]);
    }

    setSearchQuery('');
    setSearchResults([]);
    if (searchInputRef.current) searchInputRef.current.focus();
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
        setErrorMsg(`Maximum stock available: ${item.stock}`);
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
    if (cart.length > 0 && window.confirm('Are you sure you want to clear current bill?')) {
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
      const tax = (taxable * (item.gstRate || 0)) / 100;

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
      setErrorMsg('Cannot create bill: Cart is empty.');
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
          gstRate: item.gstRate,
        })),
        paymentMethod,
        paymentStatus,
        amountPaid: paymentStatus === 'paid' ? totals.grandTotal : (parseFloat(amountPaid) || 0),
        notes,
      };

      const res = await invoicesApi.create(invoicePayload);

      if (res.data?.success) {
        setSuccessMsg(`Invoice ${res.data.data.invoiceNumber} created successfully!`);
        // Trigger print modal in App parent
        onInvoiceCreated(res.data.data);

        // Reset cart and customer details
        setCart([]);
        setCustomer({ name: 'Walk-in Customer', phone: '', address: '' });
        setDoctor({ name: 'Self / OTC', regNo: '', clinic: '' });
        setNotes('');
        setAmountPaid('');
        setPaymentStatus('paid');

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
      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Billing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Search & Cart (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Medicine Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs relative">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medicine by Brand name, Generic composition, Batch or Barcode..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500"
              />
              {isSearching && (
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-600"></div>
                </div>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-80 overflow-y-auto z-40 divide-y divide-slate-100">
                {searchResults.map((item) => {
                  const isLow = item.stock <= item.minStockAlert;
                  const isOut = item.stock <= 0;
                  return (
                    <div
                      key={item._id}
                      onClick={() => !isOut && addToCart(item)}
                      className={`p-3 flex items-center justify-between text-xs transition-colors ${
                        isOut ? 'opacity-50 cursor-not-allowed bg-slate-50' : 'cursor-pointer hover:bg-teal-50/50'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{item.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {item.category?.name || 'Med'}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">B: {item.batchNo}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 italic">{item.genericName}</div>
                        <div className="text-[10px] text-slate-400 flex gap-2">
                          <span>Rack: {item.rackLocation || 'A-1'}</span>
                          <span>•</span>
                          <span>Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-bold text-teal-800 text-sm">₹{Number(item.sellingPrice || item.mrp).toFixed(2)}</div>
                        <span
                          className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOut
                              ? 'bg-rose-100 text-rose-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isOut ? 'Out of Stock' : `${item.stock} in Stock`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Cart Items Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-800 text-sm">Bill Items</h3>
                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold">
                  {cart.length}
                </span>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={handleClearCart}
                  className="text-xs text-rose-600 hover:text-rose-800 font-medium flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear List</span>
                </button>
              )}
            </div>

            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Search className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-medium text-slate-600">Cart is empty</p>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  Type a medicine name or generic composition in the search box above to add items to this bill.
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
                      <th className="py-2.5 px-2 text-center w-24">Qty</th>
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
                      const lineTotal = taxable + (taxable * (item.gstRate || 0)) / 100;

                      return (
                        <tr key={item._id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-900">{item.name}</div>
                            <div className="text-[10px] text-slate-400 italic">{item.genericName}</div>
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <span className="font-mono text-slate-700">{item.batchNo}</span>
                            <div className="text-[10px] text-slate-400">
                              {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}
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
                            <span className="text-slate-600 font-mono text-[11px]">{item.gstRate}%</span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 text-sm">
                            ₹{lineTotal.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center">
                            <button
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

        {/* Right Column: Customer Info & Checkout Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Customer & Doctor Card */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <User className="w-4 h-4 text-teal-600" />
              <span>Customer / Patient Details</span>
            </h3>

            <div className="space-y-2 text-xs">
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
            <h3 className="font-bold text-slate-800 text-sm">Payment & Checkout</h3>

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
                <span>Taxable Amount:</span>
                <span className="font-mono font-medium">₹{totals.subTotal.toFixed(2)}</span>
              </div>
              {totals.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Total Discount:</span>
                  <span className="font-mono">-₹{totals.discountTotal.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>GST Tax (CGST + SGST):</span>
                <span className="font-mono font-medium">+₹{totals.taxTotal.toFixed(2)}</span>
              </div>
              {totals.roundOff !== 0 && (
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Round Off:</span>
                  <span className="font-mono">{totals.roundOff > 0 ? `+${totals.roundOff}` : totals.roundOff}</span>
                </div>
              )}
              <div className="flex justify-between items-center pt-2 text-base font-black text-slate-900 border-t border-slate-200">
                <span>Net Payable:</span>
                <span className="text-xl text-teal-700 font-mono">₹{totals.grandTotal.toFixed(2)}</span>
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
                    paymentStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  Fully Paid
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentStatus('partial')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold ${
                    paymentStatus === 'partial' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'
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

            {/* Checkout & Print Button */}
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

