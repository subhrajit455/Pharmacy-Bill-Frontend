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
    { id: 'a4', name: 'A4 Full Page', icon: FileText, desc: 'Tax Invoice' },
    { id: 'thermal-80', name: '80mm Thermal', icon: Receipt, desc: 'POS Receipt' },
    { id: 'thermal-58', name: '58mm Thermal', icon: Minimize2, desc: 'Mini Roll' },
    { id: 'a5', name: 'A5 Half Page', icon: FileText, desc: 'Half Slip' },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-navy-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-beige-50 rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-beige-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-navy-800 bg-navy-950 text-beige-50 no-print">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 bg-navy-800 text-beige-300 rounded-xl border border-navy-700">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-beige-50">Print Preview & Multiple Formats</h2>
              <p className="text-xs text-beige-300/80">Invoice: <strong className="text-beige-100 font-mono">{invoice.invoiceNumber}</strong></p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 bg-beige-500 hover:bg-beige-400 text-navy-950 text-xs sm:text-sm font-black rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Invoice</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-beige-300 hover:text-beige-50 hover:bg-navy-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Format Selector Tabs */}
        <div className="px-3 sm:px-6 py-2.5 bg-beige-150 border-b border-beige-200 flex flex-wrap gap-1.5 sm:gap-2 items-center justify-between no-print">
          <span className="text-[11px] font-extrabold text-navy-800 uppercase tracking-wide">Template:</span>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {formats.map((fmt) => {
              const Icon = fmt.icon;
              const isActive = selectedFormat === fmt.id;
              return (
                <button
                  key={fmt.id}
                  onClick={() => setSelectedFormat(fmt.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-navy-900 text-beige-50 shadow-sm border border-navy-700'
                      : 'bg-white text-navy-800 hover:bg-beige-200 border border-beige-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{fmt.name}</span>
                  {isActive && <Check className="w-3 h-3 ml-0.5 text-beige-300" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 bg-beige-200/50 flex justify-center items-start touch-scroll">
          <div
            id="printable-invoice"
            className="shadow-xl transition-all duration-200 print:shadow-none bg-white rounded-xl overflow-hidden max-w-full"
          >
            {selectedFormat === 'a4' && <A4InvoiceTemplate invoice={invoice} store={store} />}
            {selectedFormat === 'thermal-80' && <Thermal80Template invoice={invoice} store={store} />}
            {selectedFormat === 'thermal-58' && <Thermal58Template invoice={invoice} store={store} />}
            {selectedFormat === 'a5' && <A5InvoiceTemplate invoice={invoice} store={store} />}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-4 sm:px-6 py-3 border-t border-beige-200 bg-beige-100 flex items-center justify-between text-xs text-navy-700 font-medium no-print">
          <div>
            Format active: <strong className="text-navy-950 uppercase font-bold">{selectedFormat}</strong>
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 text-navy-700 hover:bg-beige-200 rounded-xl font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-navy-900 hover:bg-navy-800 text-beige-50 font-black rounded-xl shadow-sm transition-all cursor-pointer border border-navy-700"
            >
              <Printer className="w-4 h-4 text-beige-300" />
              <span>Print Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
