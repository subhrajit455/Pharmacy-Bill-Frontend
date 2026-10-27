import React, { useState, useEffect } from 'react';
import { Printer, X, FileText, Receipt, Minimize2, Check } from 'lucide-react';
import A4InvoiceTemplate from './A4InvoiceTemplate';
import Thermal80Template from './Thermal80Template';
import Thermal58Template from './Thermal58Template';
import A5InvoiceTemplate from './A5InvoiceTemplate';

export default function PrintModal({ invoice, store, isOpen, onClose, initialFormat }) {
  const [selectedFormat, setSelectedFormat] = useState(initialFormat || store?.defaultPrintFormat || 'a4');

  useEffect(() => {
    if (initialFormat) {
      setSelectedFormat(initialFormat);
    } else if (store?.defaultPrintFormat) {
      setSelectedFormat(store.defaultPrintFormat);
    }
  }, [initialFormat, store]);

  if (!isOpen || !invoice) return null;

  const formats = [
    { id: 'a4', name: 'A4 Full Page', icon: FileText, desc: 'Professional Tax Invoice' },
    { id: 'thermal-80', name: '80mm Thermal (3")', icon: Receipt, desc: 'Standard POS Receipt' },
    { id: 'thermal-58', name: '58mm Thermal (2")', icon: Minimize2, desc: 'Compact Mini Roll' },
    { id: 'a5', name: 'A5 Half Page', icon: FileText, desc: 'Landscape / Half Slip' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-teal-100 text-teal-700 rounded-lg">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Print Preview & Multiple Formats</h2>
              <p className="text-xs text-slate-500">Invoice: <strong className="text-teal-700">{invoice.invoiceNumber}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex flex-wrap gap-2 items-center justify-between no-print">
          <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Choose Template:</span>
          <div className="flex gap-2">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isActive = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-sm ring-2 ring-teal-400/40'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{fmt.name}</span>
                  {isActive && <Check className="w-3 h-3 ml-0.5" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-200/70 flex justify-center items-start">
          <div
            id="printable-invoice"
            className="shadow-lg transition-all duration-200 print:shadow-none"
          >
            {selectedFormat === 'a4' && <A4InvoiceTemplate invoice={invoice} store={store} />}
            {selectedFormat === 'thermal-80' && <Thermal80Template invoice={invoice} store={store} />}
            {selectedFormat === 'thermal-58' && <Thermal58Template invoice={invoice} store={store} />}
            {selectedFormat === 'a5' && <A5InvoiceTemplate invoice={invoice} store={store} />}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 no-print">
          <div>
            Format active: <strong className="text-slate-800 uppercase">{selectedFormat}</strong>. Ready for printer.
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-lg font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

