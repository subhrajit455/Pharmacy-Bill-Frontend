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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600"></div>
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
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions */}
      <div className="bg-gradient-to-r from-teal-800 to-emerald-700 rounded-2xl p-6 text-white shadow-md flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="text-teal-200 text-xs font-semibold uppercase tracking-wider">
            Pharmacy Control Center
          </span>
          <h2 className="text-2xl font-bold mt-0.5">Welcome to Pharmacy POS & Inventory</h2>
          <p className="text-teal-100/90 text-sm mt-1 max-w-xl">
            Real-time stock monitoring, fast retail billing with GST & batch tracking, and multiple professional printing options.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setCurrentRoute('billing')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white text-teal-900 hover:bg-teal-50 font-bold text-sm rounded-xl shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4 text-teal-700" />
            <span>Create New Bill</span>
          </button>
          <button
            onClick={onSeedData}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-900/60 hover:bg-teal-900 text-teal-100 border border-teal-500/30 text-sm font-medium rounded-xl transition-all"
          >
            <Sparkles className="w-4 h-4 text-teal-300" />
            <span>Load Demo Stock</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Today's Sales</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">₹{summary.todaySales?.toLocaleString('en-IN') || 0}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-teal-600 font-semibold">{summary.todayInvoicesCount || 0}</span> bills issued today
            </p>
          </div>
          <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Invoices / Month Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Month Sales</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">₹{summary.monthSales?.toLocaleString('en-IN') || 0}</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">{summary.monthInvoicesCount || 0}</span> bills this month
            </p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Total Inventory Medicines */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total Medicines</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{summary.totalItems || 0}</h3>
            <p className="text-xs text-slate-500 mt-1">
              Across <span className="font-semibold text-slate-700">{summary.totalCategories || 0}</span> categories
            </p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Pill className="w-6 h-6" />
          </div>
        </div>

        {/* Alerts: Low Stock & Expiring */}
        <div
          onClick={() => setCurrentRoute('alerts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div>
            <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Stock / Expiry Alerts</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">
              {(summary.lowStockCount || 0) + (summary.expiringSoonCount || 0) + (summary.expiredCount || 0)}
            </h3>
            <p className="text-xs text-slate-500 mt-1 flex gap-2">
              <span className="text-rose-600 font-medium">{summary.lowStockCount || 0} low</span>
              <span>•</span>
              <span className="text-amber-600 font-medium">{summary.expiringSoonCount || 0} near exp</span>
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Middle Row: Sales Trend & Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7 Days Sales Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-base">7-Day Sales Performance</h3>
              <p className="text-xs text-slate-500">Daily revenue trend in ₹</p>
            </div>
            <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg">
              Total: ₹{summary.totalSales?.toLocaleString('en-IN') || 0}
            </span>
          </div>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-slate-100">
            {last7Days.map((day, idx) => {
              const heightPercent = maxSale > 0 ? Math.max((day.sales / maxSale) * 100, 8) : 8;
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-slate-500 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    ₹{day.sales}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[36px] bg-teal-500 group-hover:bg-teal-600 rounded-t-lg transition-all duration-300 relative"
                  />
                  <span className="text-[11px] text-slate-600 font-medium truncate">{day.date.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Critical Alerts Mini Box */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Stock Watchlist</span>
            </h3>
            <button
              onClick={() => setCurrentRoute('alerts')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-0.5"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 space-y-2.5 overflow-y-auto max-h-64">
            {lowStock.length === 0 && expiringSoon.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-slate-400">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                <p className="text-xs font-medium text-slate-600">All medicines in good stock!</p>
                <p className="text-[11px] text-slate-400">No immediate shortage or expiry</p>
              </div>
            ) : (
              <>
                {lowStock.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-slate-500">Rack: {item.rackLocation || 'A-1'}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-rose-600 font-bold">{item.stock} left</span>
                      <div className="text-[9px] text-slate-400">Min: {item.minStockAlert}</div>
                    </div>
                  </div>
                ))}

                {expiringSoon.slice(0, 3).map((item) => (
                  <div
                    key={item._id}
                    className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/50 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-800 truncate max-w-[150px]">{item.name}</div>
                      <div className="text-[10px] text-slate-500">Batch: {item.batchNo}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-amber-700 font-semibold">
                        Exp: {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                      <div className="text-[9px] text-amber-600 font-medium">Expiring Soon</div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Recent Invoices</h3>
            <p className="text-xs text-slate-500">Latest pharmacy transactions and billing records</p>
          </div>
          <button
            onClick={() => setCurrentRoute('invoices')}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
          >
            <span>View All Invoices</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            No bills created yet. Click <span className="font-semibold text-teal-600">"Create New Bill"</span> to start!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {recentInvoices.map((inv) => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-teal-800">{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">{inv.customer?.name || 'Walk-in'}</div>
                      {inv.customer?.phone && <div className="text-[10px] text-slate-400">{inv.customer.phone}</div>}
                    </td>
                    <td className="py-3 px-3 text-slate-600">{inv.doctor?.name || 'Self / OTC'}</td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-slate-700">{inv.items?.length || 0}</span> meds
                    </td>
                    <td className="py-3 px-3">
                      <span className="uppercase text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {inv.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900 text-sm">
                      ₹{Number(inv.grandTotal || 0).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => onOpenPrintModal(inv)}
                        className="p-1.5 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Print this invoice"
                      >
                        <Printer className="w-4 h-4" />
                        <span className="text-[10px] font-medium">Print</span>
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

