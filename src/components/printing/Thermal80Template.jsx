import React from 'react';

export default function Thermal80Template({ invoice, store }) {
  if (!invoice) return null;

  return (
    <div className="bg-white text-black p-4 w-[320px] mx-auto border border-dashed border-slate-300 font-mono text-xs leading-tight print-thermal-80 print:border-0 print:p-0 print:w-full">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-black">
        <h1 className="font-extrabold text-sm uppercase tracking-tight">
          {store?.storeName || 'Apollo Care Pharmacy'}
        </h1>
        <p className="text-[10px] text-slate-700">{store?.tagline || 'Chemists & Druggists'}</p>
        <p className="text-[10px] text-slate-700 mt-0.5">{store?.address || 'Shop No. 12, Central Market'}</p>
        <p className="text-[10px]">Ph: {store?.phone || '+91 9876543210'}</p>
        <p className="text-[10px] font-bold">GSTIN: {store?.gstin || '07AAAAA0000A1Z5'}</p>
        <p className="text-[9px] text-slate-600">DL: {store?.dlNumber1 || '20B/1234'} | {store?.dlNumber2 || '21B/1234'}</p>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-black text-[10.5px] space-y-0.5">
        <div className="flex justify-between">
          <span>Rcpt #: <strong className="text-black">{invoice.invoiceNumber}</strong></span>
          <span>{invoice.paymentMethod?.toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>Date: {new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
          <span>{new Date(invoice.createdAt || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div>
          <span>Cust: </span>
          <span className="font-semibold">{invoice.customer?.name || 'Walk-in'}</span>
          {invoice.customer?.phone && <span> ({invoice.customer.phone})</span>}
        </div>
        {invoice.doctor?.name && (
          <div>
            <span>Doc: </span>
            <span>{invoice.doctor.name}</span>
          </div>
        )}
      </div>

      {/* Item List */}
      <div className="py-2 border-b border-dashed border-black text-[10.5px]">
        <div className="grid grid-cols-12 font-bold pb-1 border-b border-dotted border-black">
          <span className="col-span-6">ITEM</span>
          <span className="col-span-2 text-center">QTY</span>
          <span className="col-span-2 text-right">RATE</span>
          <span className="col-span-2 text-right">AMT</span>
        </div>

        <div className="pt-1.5 space-y-1.5">
          {invoice.items?.map((item, idx) => (
            <div key={idx}>
              <div className="font-semibold">{item.name}</div>
              <div className="grid grid-cols-12 text-[9.5px] text-slate-700">
                <span className="col-span-6 truncate text-slate-500">
                  B:{item.batchNo} E:{new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}
                </span>
                <span className="col-span-2 text-center">{item.quantity}</span>
                <span className="col-span-2 text-right">{Number(item.unitPrice || 0).toFixed(1)}</span>
                <span className="col-span-2 text-right font-bold text-black">{Number(item.total || 0).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals & Tax */}
      <div className="py-2 border-b border-dashed border-black text-[11px] space-y-1">
        <div className="flex justify-between">
          <span>Sub Total (Taxable):</span>
          <span>₹{Number(invoice.subTotal || 0).toFixed(2)}</span>
        </div>
        {invoice.discountTotal > 0 && (
          <div className="flex justify-between text-slate-700">
            <span>Discount:</span>
            <span>-₹{Number(invoice.discountTotal || 0).toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>CGST / SGST:</span>
          <span>+₹{Number(invoice.taxTotal || 0).toFixed(2)}</span>
        </div>
        {invoice.roundOff !== 0 && (
          <div className="flex justify-between text-[10px]">
            <span>Round Off:</span>
            <span>{invoice.roundOff > 0 ? `+${invoice.roundOff}` : invoice.roundOff}</span>
          </div>
        )}
        <div className="flex justify-between font-extrabold text-sm border-t border-dotted border-black pt-1">
          <span>NET PAYABLE:</span>
          <span>₹{Number(invoice.grandTotal || 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Paid: ₹{Number(invoice.amountPaid || 0).toFixed(2)}</span>
          {invoice.balanceDue > 0 && <span className="font-bold">Due: ₹{Number(invoice.balanceDue || 0).toFixed(2)}</span>}
        </div>
      </div>

      {/* Footer Notes */}
      <div className="text-center pt-2 text-[9px] text-slate-600 space-y-0.5">
        <p className="font-bold text-black">*** Thank You • Get Well Soon ***</p>
        <p>Medicines once sold not returnable without bill</p>
        <p>Please consult doctor before taking medicines</p>
      </div>
    </div>
  );
}

