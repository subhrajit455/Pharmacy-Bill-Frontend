import React, { useState, useEffect } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { itemsApi } from '../services/api';

export default function StockAlerts({ setCurrentRoute }) {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lowStock'); // 'lowStock' | 'expiringSoon' | 'expired'

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await itemsApi.getAlerts();
      if (res.data?.success) {
        setAlerts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const lowStock = alerts?.lowStockItems || [];
  const expiringSoon = alerts?.expiringSoonItems || [];
  const expired = alerts?.expiredItems || [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-amber-500" />
            <span>Stock & Expiry Compliance Center</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pharmacy regulatory alerts for drug expiry control and inventory replenishment
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-medium transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2.5">
        <button
          onClick={() => setActiveTab('lowStock')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'lowStock'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock ({lowStock.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expiringSoon')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expiringSoon'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Expiring Soon &lt;60d ({expiringSoon.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'expired'
              ? 'bg-purple-700 text-white shadow-sm'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Expired Drugs ({expired.length})</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'lowStock' && (
              <div>
                <div className="px-5 py-3 bg-rose-50/60 border-b border-rose-100 text-xs text-rose-800 font-medium">
                  Medicines below safety stock threshold. Replenish immediately to prevent OTC dispensing delays.
                </div>
                {lowStock.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No low stock items!</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Rack</th>
                        <th className="py-2.5 px-3 text-center">Current Stock</th>
                        <th className="py-2.5 px-3 text-center">Min Threshold</th>
                        <th className="py-2.5 px-3 text-right">Selling Rate</th>
                        <th className="py-2.5 px-3 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {lowStock.map((item) => (
                        <tr key={item._id} className="hover:bg-rose-50/30">
                          <td className="py-3 px-3">
                            <div className="font-bold text-slate-800">{item.name}</div>
                            <div className="text-[10px] text-slate-400 italic">{item.genericName}</div>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-600">{item.rackLocation || 'A-1'}</td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-black text-rose-600 text-sm">{item.stock}</span> units
                          </td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500">{item.minStockAlert}</td>
                          <td className="py-3 px-3 text-right font-mono font-bold">₹{Number(item.sellingPrice || item.mrp).toFixed(2)}</td>
                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => setCurrentRoute('inventory')}
                              className="text-xs text-teal-600 hover:text-teal-800 font-semibold inline-flex items-center gap-1"
                            >
                              <span>Restock</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'expiringSoon' && (
              <div>
                <div className="px-5 py-3 bg-amber-50/60 border-b border-amber-100 text-xs text-amber-800 font-medium">
                  Medicines expiring within the next 60 days. Prioritize dispensing or return to distributor.
                </div>
                {expiringSoon.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No medicines expiring soon!</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3 text-center">Expiry Date</th>
                        <th className="py-2.5 px-3 text-center">Days Remaining</th>
                        <th className="py-2.5 px-3 text-center">In Stock</th>
                        <th className="py-2.5 px-3 text-right">Rack Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expiringSoon.map((item) => {
                        const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={item._id} className="hover:bg-amber-50/30">
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-800">{item.name}</div>
                              <div className="text-[10px] text-slate-400 italic">{item.genericName}</div>
                            </td>
                            <td className="py-3 px-3 font-mono text-slate-700">{item.batchNo}</td>
                            <td className="py-3 px-3 text-center font-bold text-amber-800">
                              {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                {days} days left
                              </span>
                            </td>
                            <td className="py-3 px-3 text-center font-bold">{item.stock}</td>
                            <td className="py-3 px-3 text-right text-slate-600 font-medium">{item.rackLocation || 'A-1'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {activeTab === 'expired' && (
              <div>
                <div className="px-5 py-3 bg-rose-100 border-b border-rose-200 text-xs text-rose-900 font-bold">
                  ⚠️ WARNING: Selling expired drugs violates Pharmacy Regulations (Drugs and Cosmetics Act). Remove from sales racks immediately!
                </div>
                {expired.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">No expired drugs found. Excellent compliance!</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-semibold border-b border-slate-200">
                      <tr>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3 text-center">Expired On</th>
                        <th className="py-2.5 px-3 text-center">Stock Count</th>
                        <th className="py-2.5 px-3 text-right">Rack Location</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expired.map((item) => (
                        <tr key={item._id} className="bg-rose-50/50">
                          <td className="py-3 px-3">
                            <div className="font-bold text-rose-900">{item.name}</div>
                            <div className="text-[10px] text-slate-500 italic">{item.genericName}</div>
                          </td>
                          <td className="py-3 px-3 font-mono">{item.batchNo}</td>
                          <td className="py-3 px-3 text-center font-bold text-rose-700">
                            {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-rose-800">{item.stock}</td>
                          <td className="py-3 px-3 text-right">{item.rackLocation || 'A-1'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

