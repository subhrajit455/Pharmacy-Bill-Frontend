import React from 'react';
import {
  LayoutDashboard,
  ReceiptText,
  Pill,
  Tags,
  FileSpreadsheet,
  AlertOctagon,
  Settings,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Percent,
  X,
} from 'lucide-react';

export default function Sidebar({
  currentRoute,
  setCurrentRoute,
  isCollapsed,
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
  alerts,
  store,
  gstEnabled = true,
  onToggleGst,
}) {
  const navItems = [
    {
      id: 'billing',
      label: 'New Bill (POS)',
      icon: ReceiptText,
      badge: 'POS',
      badgeColor: 'bg-beige-500 text-navy-950 font-bold',
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory',
      label: 'Medicines & Stock',
      icon: Pill,
      badge: null,
    },
    {
      id: 'categories',
      label: 'Categories',
      icon: Tags,
      badge: null,
    },
    {
      id: 'invoices',
      label: 'Sales & Invoices',
      icon: FileSpreadsheet,
      badge: null,
    },
    {
      id: 'alerts',
      label: 'Stock Alerts',
      icon: AlertOctagon,
      badge: (alerts?.lowStockCount || 0) + (alerts?.expiredCount || 0) || null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'settings',
      label: 'Store Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleSelectRoute = (routeId) => {
    setCurrentRoute(routeId);
    if (isOpenMobile) setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 bg-navy-950/70 backdrop-blur-xs z-50 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-navy-900 text-beige-100 flex flex-col transition-all duration-300 ease-in-out border-r border-navy-800/90 shadow-2xl lg:shadow-none no-print ${
          isCollapsed ? 'w-20' : 'w-64 max-w-[85vw]'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-800/80 bg-navy-950/40">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-beige-500 to-beige-300 flex items-center justify-center text-navy-950 shadow-md shadow-navy-950/60 shrink-0 font-black">
              <span className="text-xl leading-none">Rx</span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-extrabold text-beige-50 tracking-wide text-sm block">MED BILL</span>
                <span className="text-[10px] text-beige-300 font-medium tracking-wider uppercase block">
                  Pharmacy POS
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-beige-300 hover:text-beige-50 hover:bg-navy-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg text-beige-300 hover:text-beige-50 hover:bg-navy-800 transition-colors"
            title="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto touch-scroll">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectRoute(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-navy-700 text-beige-50 shadow-md shadow-navy-950/60 border border-beige-300/25 font-bold'
                    : 'text-beige-200/75 hover:text-beige-50 hover:bg-navy-800/70'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-beige-300' : 'text-navy-300'}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-navy-800 text-beige-200 border border-navy-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}

          {/* GST ON / OFF Toggle Control in Sidebar */}
          <div className="pt-3 mt-3 border-t border-navy-800/80">
            {!isCollapsed ? (
              <div className="p-3 rounded-xl bg-navy-850/80 border border-navy-700/60 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        gstEnabled
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-navy-800 text-navy-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-beige-50 leading-tight">GST Tax</div>
                      <div className="text-[10px] text-beige-300/80">
                        {gstEnabled ? 'Enabled on Bills' : 'GST Off (0%)'}
                      </div>
                    </div>
                  </div>

                  {/* Pill Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={gstEnabled}
                    onClick={() => onToggleGst && onToggleGst(!gstEnabled)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      gstEnabled ? 'bg-emerald-500' : 'bg-navy-700'
                    }`}
                    title={gstEnabled ? 'Click to turn GST OFF' : 'Click to turn GST ON'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-beige-50 shadow-md ring-0 transition duration-200 ease-in-out ${
                        gstEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Quick ON / OFF segmented buttons */}
                <div className="grid grid-cols-2 gap-1.5 bg-navy-950 p-1 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => onToggleGst && onToggleGst(true)}
                    className={`py-1 rounded-md transition-all cursor-pointer ${
                      gstEnabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-beige-300/70 hover:text-beige-100'
                    }`}
                  >
                    GST ON
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleGst && onToggleGst(false)}
                    className={`py-1 rounded-md transition-all cursor-pointer ${
                      !gstEnabled
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-beige-300/70 hover:text-beige-100'
                    }`}
                  >
                    GST OFF
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onToggleGst && onToggleGst(!gstEnabled)}
                title={gstEnabled ? 'GST is ON (Click to turn OFF)' : 'GST is OFF (Click to turn ON)'}
                className={`w-full flex flex-col items-center justify-center py-2.5 rounded-xl border text-[10px] font-bold transition-all cursor-pointer ${
                  gstEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-navy-850 border-navy-700 text-beige-300/70'
                }`}
              >
                <Percent className="w-4 h-4 mb-0.5" />
                <span>{gstEnabled ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>
        </nav>

        {/* Pharmacist On-Duty Footer */}
        {!isCollapsed ? (
          <div className="p-3 border-t border-navy-800/80 m-3 rounded-xl bg-navy-850/60 border border-navy-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-beige-500/20 text-beige-300 flex items-center justify-center font-bold text-xs shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <div className="font-semibold text-beige-100">Registered Pharmacist</div>
                <div className="text-[10px] text-beige-300/70 truncate">DL: {store?.dlNumber1 || 'Form 20B/21B'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-navy-800/80 flex justify-center text-beige-300">
            <UserCheck className="w-5 h-5" />
          </div>
        )}
      </aside>
    </>
  );
}
