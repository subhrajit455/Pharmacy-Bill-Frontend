import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Search,
  Printer,
  Trash2,
  Calendar,
  Filter,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import { invoicesApi } from '../services/api';

export default function InvoicesHistory({ onOpenPrintModal }) {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await invoicesApi.getAll(params);
      if (res.data?.success) {
        setInvoices(res.data.data || []);
        setTotalCount(res.data.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [search, paymentStatus, startDate, endDate]);

  const handleDeleteInvoice = async (id, invNum) => {
    if (
      window.confirm(
        `Are you sure you want to cancel Invoice #${invNum}? This will RESTORE all items back to inventory stock.`
      )
    ) {
      try {
        await invoicesApi.delete(id);
        fetchInvoices();
      } catch (err) {
        alert('Failed to delete invoice: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const totalAmountSum = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 sm:w-6 sm:h-6 text-navy-800" />
            <span>Sales History & Invoices</span>
          </h2>
          <p className="text-xs text-navy-700/70 mt-0.5">
            Search, filter, reprint bills in any format (A4, 80mm POS, 58mm Mini, A5) or void invoices
          </p>
        </div>

        <div className="bg-beige-150 border border-beige-300 px-4 py-2 rounded-xl text-left sm:text-right w-full sm:w-auto">
          <span className="text-[11px] text-navy-700 font-bold">Filtered Sales Total:</span>
          <div className="text-lg sm:text-xl font-black text-navy-950 font-mono">₹{totalAmountSum.toLocaleString('en-IN')}</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-beige-50 p-3.5 sm:p-4 rounded-2xl border border-beige-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search invoice #, customer..."
              className="w-full pl-9 pr-3 py-2 text-xs font-semibold rounded-xl border border-beige-300 bg-white text-navy-950 focus:outline-navy-700 placeholder-navy-300"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-beige-300 bg-white text-navy-900 focus:outline-navy-700 cursor-pointer"
          >
            <option value="">Payment Status: All</option>
            <option value="paid">Fully Paid</option>
            <option value="partial">Partial / Due</option>
            <option value="unpaid">Unpaid</option>
          </select>

          {/* Start Date */}
          <div>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-beige-300 bg-white text-navy-900 focus:outline-navy-700"
              title="Start Date"
            />
          </div>

          {/* End Date */}
          <div>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-xl border border-beige-300 bg-white text-navy-900 focus:outline-navy-700"
              title="End Date"
            />
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 mx-auto"></div>
            <p className="text-xs text-navy-700 mt-2">Loading billing records...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="py-16 text-center text-navy-400">
            <FileSpreadsheet className="w-10 h-10 mx-auto text-navy-300 mb-2" />
            <p className="text-sm font-bold text-navy-900">No invoices found</p>
            <p className="text-xs text-navy-500 mt-1">Generate your first bill from the "New Bill (POS)" tab.</p>
          </div>
        ) : (
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[650px]">
              <thead className="bg-beige-150 text-navy-800 uppercase font-extrabold border-b border-beige-200 text-[11px]">
                <tr>
                  <th className="py-3 px-3">Invoice #</th>
                  <th className="py-3 px-3">Date & Time</th>
                  <th className="py-3 px-3">Patient / Customer</th>
                  <th className="py-3 px-3">Doctor</th>
                  <th className="py-3 px-2 text-center">Meds</th>
                  <th className="py-3 px-2 text-center">Method</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Grand Total</th>
                  <th className="py-3 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200/80 bg-white">
                {invoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-beige-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-navy-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3 text-navy-700 text-[11px] font-medium">
                      {new Date(inv.createdAt).toLocaleString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-extrabold text-navy-950">{inv.customer?.name || 'Walk-in'}</div>
                      {inv.customer?.phone && <div className="text-[10px] text-navy-500 font-mono">{inv.customer.phone}</div>}
                    </td>
                    <td className="py-3 px-3 text-navy-700 font-medium">{inv.doctor?.name || 'Self / OTC'}</td>
                    <td className="py-3 px-2 text-center font-bold text-navy-900">{inv.items?.length || 0}</td>
                    <td className="py-3 px-2 text-center">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-md bg-beige-200 text-navy-900">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-black ${
                          inv.paymentStatus === 'paid'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {inv.paymentStatus === 'paid' ? 'PAID' : `DUE ₹${inv.balanceDue || 0}`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-navy-950 font-mono text-sm">
                      ₹{Number(inv.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onOpenPrintModal(inv)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-navy-900 hover:bg-navy-800 text-beige-50 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-navy-700"
                          title="Print / View Invoice in any format"
                        >
                          <Printer className="w-3.5 h-3.5 text-beige-300" />
                          <span>Print</span>
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(inv._id, inv.invoiceNumber)}
                          className="p-1.5 text-navy-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Void bill & restore stock"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
