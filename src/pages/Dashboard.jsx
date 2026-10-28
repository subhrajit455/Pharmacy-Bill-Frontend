import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Receipt,
  Pill,
  AlertTriangle,
  Calendar,
  Clock,
  ArrowUpRight,
  PlusCircle,
  Eye,
  Printer,
  Sparkles,
  CheckCircle,
} from 'lucide-react';
import { dashboardApi } from '../services/api';

export default function Dashboard({ setCurrentRoute, onOpenPrintModal, onSeedData }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await dashboardApi.getStats();
      if (res.data?.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-navy-800"></div>
      </div>
    );
  }

  const summary = stats?.summary || {};
  const recentInvoices = stats?.recentInvoices || [];
  const last7Days = stats?.last7Days || [];
  const lowStock = stats?.alerts?.lowStock || [];
  const expiringSoon = stats?.alerts?.expiringSoon || [];

  const maxSale = Math.max(...last7Days.map((d) => d.sales), 100);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-navy-950 rounded-2xl p-5 sm:p-6 text-beige-50 shadow-xl border border-navy-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-beige-300 text-xs font-bold uppercase tracking-wider">
            Pharmacy Control Center
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-0.5 tracking-tight text-beige-50">
            Welcome to Pharmacy POS & Inventory
          </h2>
          <p className="text-beige-200/80 text-xs sm:text-sm mt-1 max-w-xl">
            Real-time stock monitoring, fast retail billing with GST & batch tracking, and multiple professional printing options.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setCurrentRoute('billing')}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 bg-beige-500 hover:bg-beige-400 text-navy-950 font-black text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Bill</span>
          </button>
          <button
            onClick={onSeedData}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3.5 sm:px-4 py-2.5 bg-navy-850 hover:bg-navy-800 text-beige-200 border border-navy-700 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-beige-400" />
            <span>Load Demo Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Today's Sales */}
        <div className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy-700 uppercase tracking-wide">Today's Sales</p>
            <h3 className="text-2xl font-black text-navy-950 mt-1">₹{summary.todaySales?.toLocaleString('en-IN') || 0}</h3>
            <p className="text-xs text-navy-600 mt-1 flex items-center gap-1 font-medium">
              <span className="text-navy-900 font-bold">{summary.todayInvoicesCount || 0}</span> bills issued today
            </p>
          </div>
          <div className="p-3 bg-navy-100 text-navy-800 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Invoices / Month Sales */}
        <div className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy-700 uppercase tracking-wide">Month Sales</p>
            <h3 className="text-2xl font-black text-navy-950 mt-1">₹{summary.monthSales?.toLocaleString('en-IN') || 0}</h3>
            <p className="text-xs text-navy-600 mt-1 flex items-center gap-1 font-medium">
              <span className="text-navy-900 font-bold">{summary.monthInvoicesCount || 0}</span> bills this month
            </p>
          </div>
          <div className="p-3 bg-navy-100 text-navy-800 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total Inventory Medicines */}
        <div className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-navy-700 uppercase tracking-wide">Total Medicines</p>
            <h3 className="text-2xl font-black text-navy-950 mt-1">{summary.totalItems || 0}</h3>
            <p className="text-xs text-navy-600 mt-1 font-medium">
              Across <span className="font-bold text-navy-900">{summary.totalCategories || 0}</span> categories
            </p>
          </div>
          <div className="p-3 bg-navy-100 text-navy-800 rounded-xl">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Alerts: Low Stock & Expiring */}
        <div
          onClick={() => setCurrentRoute('alerts')}
          className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div>
            <p className="text-xs font-bold text-amber-900 uppercase tracking-wide">Stock / Expiry Alerts</p>
            <h3 className="text-2xl font-black text-amber-800 mt-1">
              {(summary.lowStockCount || 0) + (summary.expiringSoonCount || 0) + (summary.expiredCount || 0)}
            </h3>
            <p className="text-xs text-navy-600 mt-1 flex gap-2 font-medium">
              <span className="text-rose-700 font-bold">{summary.lowStockCount || 0} low</span>
              <span>•</span>
              <span className="text-amber-800 font-bold">{summary.expiringSoonCount || 0} near exp</span>
            </p>
          </div>
          <div className="p-3 bg-amber-100/70 text-amber-800 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Trend & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* 7 Days Sales Trend Chart */}
        <div className="lg:col-span-2 bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-extrabold text-navy-950 text-sm sm:text-base">7-Day Sales Performance</h3>
              <p className="text-xs text-navy-600">Daily revenue trend in ₹</p>
            </div>
            <span className="text-xs font-bold text-navy-900 bg-beige-200 px-2.5 py-1 rounded-xl">
              Total: ₹{summary.totalSales?.toLocaleString('en-IN') || 0}
            </span>
          </div>

          <div className="h-44 sm:h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-beige-200">
            {last7Days.map((day, idx) => {
              const heightPercent = maxSale > 0 ? Math.max((day.sales / maxSale) * 100, 8) : 8;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-navy-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{day.sales}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-navy-800 group-hover:bg-navy-950 rounded-t-lg transition-all duration-300 relative"
                  />
                  <span className="text-[11px] text-navy-700 font-bold truncate">{day.date.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Alerts Mini Box */}
        <div className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-extrabold text-navy-950 text-sm sm:text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <span>Stock Watchlist</span>
            </h3>
            <button
              onClick={() => setCurrentRoute('alerts')}
              className="text-xs text-navy-800 hover:text-navy-950 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-60 touch-scroll">
            {lowStock.length === 0 && expiringSoon.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-36 text-center text-navy-400">
                <CheckCircle className="w-8 h-8 text-emerald-600 mb-2" />
                <p className="text-xs font-bold text-navy-800">All medicines in good stock!</p>
                <p className="text-[11px] text-navy-500">No immediate shortage or expiry</p>
              </div>
            ) : (
              <>
                {lowStock.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-navy-950 truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-navy-500 font-medium">Rack: {item.rackLocation || 'A-1'}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-700 font-black">{item.stock} left</span>
                      <div className="text-[9px] text-navy-400">Min: {item.minStockAlert}</div>
                    </div>
                  </div>
                ))}

                {expiringSoon.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/70 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-navy-950 truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-navy-500 font-medium">Batch: {item.batchNo}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-900 font-bold">
                        Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="text-[9px] text-amber-800 font-semibold">Expiring Soon</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-extrabold text-navy-950 text-sm sm:text-base">Recent Invoices</h3>
            <p className="text-xs text-navy-600">Latest pharmacy transactions and billing records</p>
          </div>
          <button
            onClick={() => setCurrentRoute('invoices')}
            className="text-xs text-navy-800 hover:text-navy-950 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="text-center py-10 text-navy-400 text-sm">
            No bills created yet. Click <span className="font-bold text-navy-900">"Create New Bill"</span> to start!
          </div>
        ) : (
          <div className="overflow-x-auto touch-scroll">
            <table className="w-full text-left text-xs min-w-[600px]">
              <thead className="bg-beige-150 text-navy-800 uppercase font-extrabold border-b border-beige-200 text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Patient / Customer</th>
                  <th className="py-2.5 px-3">Doctor</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Print</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-200/80 bg-white">
                {recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-beige-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-navy-900">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-navy-950">{inv.customer?.name || 'Walk-in'}</div>
                      {inv.customer?.phone && <div className="text-[10px] text-navy-500 font-mono">{inv.customer.phone}</div>}
                    </td>
                    <td className="py-3 px-3 text-navy-700">{inv.doctor?.name || 'Self / OTC'}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-navy-900">{inv.items?.length || 0}</span> meds
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded-lg bg-beige-200 text-navy-900">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-black text-navy-950 text-sm font-mono">
                      ₹{Number(inv.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onOpenPrintModal(inv)}
                        className="p-1.5 text-navy-800 hover:text-navy-950 hover:bg-beige-150 rounded-xl transition-colors inline-flex items-center gap-1 cursor-pointer"
                        title="Print this invoice"
                      >
                        <Printer className="w-4 h-4 text-navy-700" />
                        <span className="text-[10px] font-bold">Print</span>
                      </button>
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
