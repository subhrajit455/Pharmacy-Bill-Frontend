import React from 'react';

export default function Thermal58Template({ invoice, store }) {
  if (!invoice) return null;

  return (
    <div className="bg-white text-black p-2 w-[240px] mx-auto border border-dashed border-slate-300 font-mono text-[10px] leading-tight print-thermal-58 print:border-0 print:p-0 print:w-full">
      {/* Header */}
      <div className="text-center pb-1.5 border-b border-dashed border-black">
        <h1 className="font-extrabold text-xs uppercase">
          {store?.storeName || 'Pharmacy Billing'}
        </h1>
        <p className="text-[8.5px]">{store?.address || 'Medical Store'}</p>
        <p className="text-[8.5px]">Ph: {store?.phone || '+91 9876543210'}</p>
        <p className="text-[8.5px] font-bold">GSTIN: {store?.gstin || '07AAAAA0000A1Z5'}</p>
      </div>

      {/* Meta */}
      <div className="py-1 border-b border-dashed border-black text-[9px] space-y-0.5">
        <div className="flex justify-between">
          <span>Inv: <strong>{invoice.invoiceNumber}</strong></span>
        </div>
        <div className="flex justify-between">
          <span>{new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
          <span>{invoice.paymentMethod?.toUpperCase()}</span>
        </div>
        <div>Cust: {invoice.customer?.name || 'Walk-in'}</div>
      </div>

      {/* Items */}
      <div className="py-1 border-b border-dashed border-black text-[9px]">
        <div className="flex justify-between font-bold border-b border-dotted border-black pb-0.5">
          <span>Item</span>
          <span>Qty x Rt = Amt</span>
        </div>
        <div className="pt-1 space-y-1">
          {invoice.items?.map((item, idx) => (
            <div key={idx}>
              <div className="font-medium truncate">{item.name}</div>
              <div className="flex justify-between text-[8px] text-slate-600">
                <span>B:{item.batchNo}</span>
                <span>{item.quantity} x {Number(item.unitPrice || 0).toFixed(1)} = <strong className="text-black">₹{Number(item.total || 0).toFixed(1)}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="py-1 border-b border-dashed border-black text-[9.5px] space-y-0.5">
        <div className="flex justify-between">
          <span>SubTotal:</span>
          <span>₹{Number(invoice.subTotal || 0).toFixed(1)}</span>
        </div>
        {invoice.discountTotal > 0 && (
          <div className="flex justify-between">
            <span>Disc:</span>
            <span>-₹{Number(invoice.discountTotal || 0).toFixed(1)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>GST Tax:</span>
          <span>+₹{Number(invoice.taxTotal || 0).toFixed(1)}</span>
        </div>
        <div className="flex justify-between font-bold text-xs border-t border-dotted border-black pt-1">
          <span>TOTAL:</span>
          <span>₹{Number(invoice.grandTotal || 0).toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pt-1.5 text-[8px] text-slate-600">
        <p className="font-bold text-black">Get Well Soon!</p>
        <p>No return without bill</p>
      </div>
    </div>
  );
}

