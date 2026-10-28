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
    <div className="space-y-4 sm:space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-beige-50 p-4 sm:p-5 rounded-2xl border border-beige-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-navy-950 flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            <span>Stock & Expiry Compliance Center</span>
          </h2>
          <p className="text-xs text-navy-700/70 mt-0.5">
            Real-time pharmacy regulatory alerts for drug expiry control and inventory replenishment
          </p>
        </div>

        <button
          onClick={fetchAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-navy-800 bg-beige-150 hover:bg-beige-200 rounded-xl font-bold transition-colors cursor-pointer border border-beige-300 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Alerts</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        <button
          onClick={() => setActiveTab('lowStock')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'lowStock'
              ? 'bg-rose-700 text-white shadow-sm'
              : 'bg-beige-50 text-navy-800 border border-beige-200 hover:bg-beige-150'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Low Stock ({lowStock.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expiringSoon')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'expiringSoon'
              ? 'bg-amber-700 text-white shadow-sm'
              : 'bg-beige-50 text-navy-800 border border-beige-200 hover:bg-beige-150'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Expiring Soon &lt;60d ({expiringSoon.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('expired')}
          className={`flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'expired'
              ? 'bg-navy-900 text-beige-50 shadow-sm border border-navy-700'
              : 'bg-beige-50 text-navy-800 border border-beige-200 hover:bg-beige-150'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Expired Drugs ({expired.length})</span>
        </button>
      </div>

      {/* Content Table */}
      <div className="bg-beige-50 rounded-2xl border border-beige-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-navy-800 mx-auto"></div>
          </div>
        ) : (
          <div>
            {activeTab === 'lowStock' && (
              <div>
                <div className="px-4 sm:px-5 py-3 bg-rose-50/70 border-b border-rose-200 text-xs text-rose-900 font-bold">
                  Medicines below safety stock threshold. Replenish immediately to prevent dispensing delays.
                </div>
                {lowStock.length === 0 ? (
                  <div className="py-12 text-center text-navy-400 text-xs">No low stock items!</div>
                ) : (
                  <div className="overflow-x-auto touch-scroll">
                    <table className="w-full text-left text-xs min-w-[550px]">
                      <thead className="bg-beige-150 text-navy-800 uppercase text-[11px] font-extrabold border-b border-beige-200">
                        <tr>
                          <th className="py-2.5 px-3">Medicine</th>
                          <th className="py-2.5 px-3">Rack</th>
                          <th className="py-2.5 px-3 text-center">Current Stock</th>
                          <th className="py-2.5 px-3 text-center">Min Threshold</th>
                          <th className="py-2.5 px-3 text-right">Selling Rate</th>
                          <th className="py-2.5 px-3 text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige-200/80 bg-white">
                        {lowStock.map((item) => (
                          <tr key={item._id} className="hover:bg-rose-50/30">
                            <td className="py-3 px-3">
                              <div className="font-extrabold text-navy-950">{item.name}</div>
                              <div className="text-[10px] text-navy-600 italic">{item.genericName}</div>
                            </td>
                            <td className="py-3 px-3 font-bold text-navy-800">{item.rackLocation || 'A-1'}</td>
                            <td className="py-3 px-3 text-center">
                              <span className="font-black text-rose-700 text-sm">{item.stock}</span> units
                            </td>
                            <td className="py-3 px-3 text-center font-mono text-navy-600 font-bold">{item.minStockAlert}</td>
                            <td className="py-3 px-3 text-right font-mono font-black text-navy-950">₹{Number(item.sellingPrice || item.mrp).toFixed(2)}</td>
                            <td className="py-3 px-3 text-center">
                              <button
                                onClick={() => setCurrentRoute('inventory')}
                                className="text-xs text-navy-900 hover:text-navy-950 font-black inline-flex items-center gap-1 cursor-pointer bg-beige-150 px-2.5 py-1 rounded-lg border border-beige-300"
                              >
                                <span>Restock</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'expiringSoon' && (
              <div>
                <div className="px-4 sm:px-5 py-3 bg-amber-50/70 border-b border-amber-200 text-xs text-amber-900 font-bold">
                  Medicines expiring within the next 60 days. Prioritize dispensing or return to distributor.
                </div>
                {expiringSoon.length === 0 ? (
                  <div className="py-12 text-center text-navy-400 text-xs">No medicines expiring soon!</div>
                ) : (
                  <div className="overflow-x-auto touch-scroll">
                    <table className="w-full text-left text-xs min-w-[550px]">
                      <thead className="bg-beige-150 text-navy-800 uppercase text-[11px] font-extrabold border-b border-beige-200">
                        <tr>
                          <th className="py-2.5 px-3">Medicine</th>
                          <th className="py-2.5 px-3">Batch</th>
                          <th className="py-2.5 px-3 text-center">Expiry Date</th>
                          <th className="py-2.5 px-3 text-center">Days Remaining</th>
                          <th className="py-2.5 px-3 text-center">In Stock</th>
                          <th className="py-2.5 px-3 text-right">Rack Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige-200/80 bg-white">
                        {expiringSoon.map((item) => {
                          const days = Math.ceil((new Date(item.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                          return (
                            <tr key={item._id} className="hover:bg-amber-50/30">
                              <td className="py-3 px-3">
                                <div className="font-extrabold text-navy-950">{item.name}</div>
                                <div className="text-[10px] text-navy-600 italic">{item.genericName}</div>
                              </td>
                              <td className="py-3 px-3 font-mono text-navy-900 font-bold">{item.batchNo}</td>
                              <td className="py-3 px-3 text-center font-bold text-amber-900">
                                {new Date(item.expiryDate).toLocaleDateString('en-IN', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900">
                                  {days} days left
                                </span>
                              </td>
                              <td className="py-3 px-3 text-center font-black text-navy-950">{item.stock}</td>
                              <td className="py-3 px-3 text-right text-navy-800 font-bold">{item.rackLocation || 'A-1'}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'expired' && (
              <div>
                <div className="px-4 sm:px-5 py-3 bg-rose-100 border-b border-rose-200 text-xs text-rose-950 font-black">
                  ⚠️ WARNING: Selling expired drugs violates Pharmacy Regulations (Drugs and Cosmetics Act). Remove from sales racks immediately!
                </div>
                {expired.length === 0 ? (
                  <div className="py-12 text-center text-navy-400 text-xs">No expired drugs found. Excellent compliance!</div>
                ) : (
                  <div className="overflow-x-auto touch-scroll">
                    <table className="w-full text-left text-xs min-w-[550px]">
                      <thead className="bg-beige-150 text-navy-800 uppercase text-[11px] font-extrabold border-b border-beige-200">
                        <tr>
                          <th className="py-2.5 px-3">Medicine</th>
                          <th className="py-2.5 px-3">Batch</th>
                          <th className="py-2.5 px-3 text-center">Expired On</th>
                          <th className="py-2.5 px-3 text-center">Stock Count</th>
                          <th className="py-2.5 px-3 text-right">Rack Location</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-beige-200/80 bg-white">
                        {expired.map((item) => (
                          <tr key={item._id} className="bg-rose-50/50">
                            <td className="py-3 px-3">
                              <div className="font-extrabold text-rose-950">{item.name}</div>
                              <div className="text-[10px] text-navy-600 italic">{item.genericName}</div>
                            </td>
                            <td className="py-3 px-3 font-mono font-bold text-navy-900">{item.batchNo}</td>
                            <td className="py-3 px-3 text-center font-bold text-rose-800">
                              {new Date(item.expiryDate).toLocaleDateString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-center font-black text-rose-800">{item.stock}</td>
                            <td className="py-3 px-3 text-right text-navy-800 font-bold">{item.rackLocation || 'A-1'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
