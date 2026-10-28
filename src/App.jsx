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

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/60">
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
