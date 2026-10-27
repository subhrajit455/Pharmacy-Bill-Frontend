import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  PlusCircle,
  Menu,
  ShieldCheck,
  Clock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export default function Navbar({
  store,
  alerts,
  currentRoute,
  setCurrentRoute,
  onOpenAlerts,
  toggleSidebar,
  onSeedData,
}) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalAlertsCount = (alerts?.lowStockCount || 0) + (alerts?.expiredCount || 0) + (alerts?.expiringSoonCount || 0);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Left: Mobile Toggle & Store Tag */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h1 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <span>{store?.storeName || 'Apollo Care Pharmacy'}</span>
            <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Verified DL
            </span>
          </h1>
          <p className="text-[11px] text-slate-500 -mt-0.5 truncate max-w-xs">
            {store?.tagline || 'Pharmacy Billing & Inventory System'}
          </p>
        </div>
      </div>

      {/* Center: Live Time / Clock */}
      <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
        <Clock className="w-3.5 h-3.5 text-teal-600" />
        <span className="font-mono font-medium text-slate-700">
          {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
        </span>
        <span className="text-slate-300">|</span>
        <span className="font-mono font-semibold text-teal-700">
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5">
        {/* Sample Data Seed Button */}
        <button
          onClick={onSeedData}
          title="Seed realistic pharmaceutical demo data"
          className="hidden sm:flex items-center gap-1.5 text-xs text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
        >
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Demo Data</span>
        </button>

        {/* Stock Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className={`relative p-2 rounded-lg border transition-all ${
            totalAlertsCount > 0
              ? 'text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 border-slate-200'
          }`}
          title={`${totalAlertsCount} Stock / Expiry Alerts`}
        >
          <Bell className="w-4 h-4" />
          {totalAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-pulse">
              {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
            </span>
          )}
        </button>

        {/* Quick New Bill CTA */}
        <button
          onClick={() => setCurrentRoute('billing')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-all ${
            currentRoute === 'billing'
              ? 'bg-teal-700 text-white ring-2 ring-teal-400/40'
              : 'bg-teal-600 hover:bg-teal-700 text-white'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden xs:inline">New Bill (POS)</span>
          <span className="xs:hidden">Bill</span>
        </button>
      </div>
    </header>
  );
}

