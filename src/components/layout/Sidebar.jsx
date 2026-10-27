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
  Cross,
  UserCheck,
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
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 bg-slate-900 text-slate-200 flex flex-col transition-all duration-300 ease-in-out border-r border-slate-800 no-print ${isCollapsed ? 'w-20' : 'w-64'
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
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
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-300'
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

