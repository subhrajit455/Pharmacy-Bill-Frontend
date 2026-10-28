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
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'billing',
      label: 'New Bill (POS)',
      icon: ReceiptText,
      badge: 'POS',
      badgeColor: 'bg-teal-500 text-white',
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
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 no-print ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-900/40 shrink-0">
              <span className="font-black text-xl leading-none">Rx</span>
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-bold text-white tracking-tight text-sm block">MED BILL</span>
                <span className="text-[10px] text-teal-400 font-medium tracking-wider uppercase block">
                  Billing & Stock
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectRoute(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-lg shadow-teal-900/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.badgeColor || 'bg-slate-700 text-slate-300'
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
          <div className="pt-3 mt-3 border-t border-slate-800">
            {!isCollapsed ? (
              <div className="p-3 rounded-xl bg-slate-800/70 border border-slate-700/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        gstEnabled
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Percent className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white leading-tight">GST Tax</div>
                      <div className="text-[10px] text-slate-400">
                        {gstEnabled ? 'Applied on Bills' : 'GST Disabled (0%)'}
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
                      gstEnabled ? 'bg-emerald-500' : 'bg-slate-600'
                    }`}
                    title={gstEnabled ? 'Click to turn GST OFF' : 'Click to turn GST ON'}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        gstEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Quick ON / OFF segmented buttons */}
                <div className="grid grid-cols-2 gap-1.5 bg-slate-900/80 p-1 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => onToggleGst && onToggleGst(true)}
                    className={`py-1 rounded-md transition-all ${
                      gstEnabled
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    GST ON
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleGst && onToggleGst(false)}
                    className={`py-1 rounded-md transition-all ${
                      !gstEnabled
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
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
                className={`w-full flex flex-col items-center justify-center py-2.5 rounded-xl border text-[10px] font-bold transition-all ${
                  gstEnabled
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400'
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
          <div className="p-3 border-t border-slate-800 m-3 rounded-xl bg-slate-800/50">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs shrink-0">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="truncate text-xs">
                <div className="font-semibold text-slate-200">Registered Pharmacist</div>
                <div className="text-[10px] text-slate-400 truncate">DL: {store?.dlNumber1 || 'Form 20B/21B'}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-800 flex justify-center text-teal-400">
            <UserCheck className="w-5 h-5" />
          </div>
        )}
      </aside>
    </>
  );
}
