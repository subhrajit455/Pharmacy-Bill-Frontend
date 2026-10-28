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
    <header className="h-16 bg-beige-50/90 backdrop-blur-md border-b border-beige-200 px-3 sm:px-5 md:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs no-print">
      {/* Left: Mobile Toggle & Store Tag */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Open sidebar menu"
          className="p-2 text-navy-800 hover:text-navy-950 hover:bg-beige-200/60 rounded-xl lg:hidden cursor-pointer transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h1 className="text-sm sm:text-base font-extrabold text-navy-900 truncate max-w-[170px] sm:max-w-xs">
              {store?.storeName || 'Apollo Care Pharmacy'}
            </h1>
            <span className="hidden xs:inline-flex text-[10px] font-bold bg-navy-100 text-navy-800 border border-navy-200/80 px-2 py-0.5 rounded-full items-center gap-1 shrink-0">
              <ShieldCheck className="w-3 h-3 text-navy-700" />
              Verified DL
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-navy-700/70 -mt-0.5 truncate max-w-[180px] sm:max-w-xs">
            {store?.tagline || 'Pharmacy Billing & Inventory System'}
          </p>
        </div>
      </div>

      {/* Center: Live Time / Clock (Tablet & Desktop) */}
      <div className="hidden md:flex items-center gap-2 text-xs text-navy-700 bg-beige-150/70 border border-beige-200 px-3 py-1.5 rounded-xl">
        <Clock className="w-3.5 h-3.5 text-navy-700" />
        <span className="font-mono font-medium text-navy-800">
          {time.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' })}
        </span>
        <span className="text-beige-300">|</span>
        <span className="font-mono font-bold text-navy-900">
          {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </span>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Sample Data Seed Button */}
        <button
          onClick={onSeedData}
          title="Seed realistic pharmaceutical demo data"
          className="hidden sm:flex items-center gap-1.5 text-xs text-navy-800 bg-beige-150 hover:bg-beige-200 border border-beige-300/80 px-2.5 py-1.5 rounded-xl transition-colors font-semibold cursor-pointer shadow-xs"
        >
          <Sparkles className="w-3.5 h-3.5 text-beige-600" />
          <span>Demo Data</span>
        </button>

        {/* Stock Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className={`relative p-2 rounded-xl border transition-all cursor-pointer ${
            totalAlertsCount > 0
              ? 'text-amber-800 bg-amber-50 border-amber-300/80 hover:bg-amber-100'
              : 'text-navy-700 hover:text-navy-950 hover:bg-beige-200/60 border-beige-200 bg-beige-50'
          }`}
          title={`${totalAlertsCount} Stock / Expiry Alerts`}
        >
          <Bell className="w-4 h-4" />
          {totalAlertsCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-rose-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-beige-50 animate-pulse">
              {totalAlertsCount > 9 ? '9+' : totalAlertsCount}
            </span>
          )}
        </button>

        {/* Quick New Bill CTA */}
        <button
          onClick={() => setCurrentRoute('billing')}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-xl shadow-sm transition-all cursor-pointer ${
            currentRoute === 'billing'
              ? 'bg-navy-950 text-beige-50 ring-2 ring-beige-400'
              : 'bg-navy-900 hover:bg-navy-800 text-beige-50'
          }`}
        >
          <PlusCircle className="w-4 h-4 text-beige-300" />
          <span className="hidden xs:inline">New Bill (POS)</span>
          <span className="xs:hidden">Bill</span>
        </button>
      </div>
    </header>
  );
}
