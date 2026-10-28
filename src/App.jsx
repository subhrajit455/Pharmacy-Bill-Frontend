import React, { useState, useEffect } from 'react';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import BillingPOS from './pages/BillingPOS';
import Inventory from './pages/Inventory';
import Categories from './pages/Categories';
import InvoicesHistory from './pages/InvoicesHistory';
import StockAlerts from './pages/StockAlerts';
import Settings from './pages/Settings';
import PrintModal from './components/printing/PrintModal';
import { settingsApi, itemsApi, seedApi } from './services/api';
import {
  ReceiptText,
  Pill,
  FileSpreadsheet,
  AlertOctagon,
  Menu,
  LayoutDashboard,
} from 'lucide-react';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState('billing'); // default to POS for quick billing
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Global GST ON / OFF state persisted in localStorage
  const [gstEnabled, setGstEnabled] = useState(() => {
    const saved = localStorage.getItem('pharma_gst_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleGst = (val) => {
    const nextVal = typeof val === 'boolean' ? val : !gstEnabled;
    setGstEnabled(nextVal);
    localStorage.setItem('pharma_gst_enabled', String(nextVal));
  };

  // Global settings & alerts
  const [store, setStore] = useState(null);
  const [alerts, setAlerts] = useState(null);

  // Print Modal
  const [printInvoice, setPrintInvoice] = useState(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printFormat, setPrintFormat] = useState('a4');

  const fetchGlobalData = async () => {
    try {
      const [settingsRes, alertsRes] = await Promise.all([
        settingsApi.get(),
        itemsApi.getAlerts(),
      ]);
      if (settingsRes.data?.success) setStore(settingsRes.data.data);
      if (alertsRes.data?.success) setAlerts(alertsRes.data.data);
    } catch (err) {
      console.warn('Initial data load warning:', err.message);
    }
  };

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const handleOpenPrintModal = (invoice, format = null) => {
    setPrintInvoice(invoice);
    if (format) setPrintFormat(format);
    else if (store?.defaultPrintFormat) setPrintFormat(store.defaultPrintFormat);
    setIsPrintModalOpen(true);
  };

  const handleSeedData = async () => {
    try {
      const res = await seedApi.seed(false);
      alert(res.data?.message || 'Demo data loaded successfully!');
      fetchGlobalData();
      setCurrentRoute('inventory');
    } catch (err) {
      alert('Seed failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const totalAlertsCount = (alerts?.lowStockCount || 0) + (alerts?.expiredCount || 0);

  return (
    <div className="flex h-screen bg-beige-100 overflow-hidden font-sans text-navy-950">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        setCurrentRoute={setCurrentRoute}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
        alerts={alerts}
        store={store}
        gstEnabled={gstEnabled}
        onToggleGst={handleToggleGst}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        {/* Top Navbar */}
        <Navbar
          store={store}
          alerts={alerts}
          currentRoute={currentRoute}
          setCurrentRoute={setCurrentRoute}
          onOpenAlerts={() => setCurrentRoute('alerts')}
          toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onSeedData={handleSeedData}
        />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto px-2.5 py-3 sm:p-5 md:p-6 bg-beige-100/90 pb-24 lg:pb-6 touch-scroll">
          <div className="max-w-7xl mx-auto">
            {currentRoute === 'dashboard' && (
              <Dashboard
                setCurrentRoute={setCurrentRoute}
                onOpenPrintModal={handleOpenPrintModal}
                onSeedData={handleSeedData}
              />
            )}

            {currentRoute === 'billing' && (
              <BillingPOS
                store={store}
                gstEnabled={gstEnabled}
                onToggleGst={handleToggleGst}
                onInvoiceCreated={(newInvoice) => {
                  fetchGlobalData();
                  handleOpenPrintModal(newInvoice);
                }}
              />
            )}

            {currentRoute === 'inventory' && (
              <Inventory
                onRefreshAlerts={fetchGlobalData}
                onSeedData={handleSeedData}
              />
            )}

            {currentRoute === 'categories' && <Categories />}

            {currentRoute === 'invoices' && (
              <InvoicesHistory onOpenPrintModal={handleOpenPrintModal} />
            )}

            {currentRoute === 'alerts' && (
              <StockAlerts setCurrentRoute={setCurrentRoute} />
            )}

            {currentRoute === 'settings' && (
              <Settings onSettingsUpdated={(updated) => setStore(updated)} />
            )}
          </div>
        </main>

        {/* Mobile Bottom Navigation Bar (High UX on smartphones) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-md border-t border-navy-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl no-print">
          <button
            type="button"
            onClick={() => setCurrentRoute('billing')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              currentRoute === 'billing'
                ? 'text-beige-100 bg-navy-800'
                : 'text-navy-300 hover:text-beige-200'
            }`}
          >
            <ReceiptText className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-bold tracking-tight">New Bill</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('inventory')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              currentRoute === 'inventory'
                ? 'text-beige-100 bg-navy-800'
                : 'text-navy-300 hover:text-beige-200'
            }`}
          >
            <Pill className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Stock</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('invoices')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              currentRoute === 'invoices'
                ? 'text-beige-100 bg-navy-800'
                : 'text-navy-300 hover:text-beige-200'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Invoices</span>
          </button>

          <button
            type="button"
            onClick={() => setCurrentRoute('alerts')}
            className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              currentRoute === 'alerts'
                ? 'text-beige-100 bg-navy-800'
                : 'text-navy-300 hover:text-beige-200'
            }`}
          >
            <AlertOctagon className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Alerts</span>
            {totalAlertsCount > 0 && (
              <span className="absolute top-0.5 right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-navy-300 hover:text-beige-200 transition-all"
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium tracking-tight">Menu</span>
          </button>
        </div>
      </div>

      {/* Multi-Format Print Preview Modal */}
      <PrintModal
        invoice={printInvoice}
        store={store}
        isOpen={isPrintModalOpen}
        initialFormat={printFormat}
        onClose={() => setIsPrintModalOpen(false)}
      />
    </div>
  );
}
