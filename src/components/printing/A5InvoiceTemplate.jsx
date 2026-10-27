import React from 'react';

export default function A5InvoiceTemplate({ invoice, store }) {
  if (!invoice) return null;

  return (
    <div className="bg-white text-slate-900 p-5 max-w-2xl mx-auto border border-slate-300 text-xs leading-tight print-a5 print:border-0 print:p-1">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-teal-800 pb-2 mb-2">
        <div>
          <h2 className="text-lg font-black text-teal-800 uppercase tracking-tight">
            {store?.storeName || 'Apollo Care Pharmacy'}
          </h2>
          <p className="text-[11px] text-slate-600">{store?.address || 'Shop No. 12, Ground Floor, Central Market'}</p>
          <p className="text-[10px] text-slate-500">Ph: {store?.phone || '+91 9876543210'} | GSTIN: <strong className="font-mono text-slate-800">{store?.gstin || '07AAAAA0000A1Z5'}</strong></p>
        </div>
        <div className="text-right text-[10px]">
          <div className="font-bold text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 inline-block mb-1">
            RETAIL INVOICE
          </div>
          <div><strong>DL:</strong> {store?.dlNumber1 || '20B/1234'}</div>
          <div><strong>Inv #:</strong> <span className="font-mono font-bold text-teal-800">{invoice.invoiceNumber}</span></div>
          <div><strong>Date:</strong> {new Date(invoice.createdAt || Date.now()).toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      {/* Customer & Doctor Mini Bar */}
      <div className="bg-slate-50 p-2 rounded border border-slate-200 mb-2 flex justify-between text-[11px]">
        <div>
          <span className="text-slate-500">Patient: </span>
          <strong className="text-slate-800">{invoice.customer?.name || 'Walk-in'}</strong>
          {invoice.customer?.phone && <span className="text-slate-600"> ({invoice.customer.phone})</span>}
        </div>
        <div>
          <span className="text-slate-500">Doctor: </span>
          <span className="text-slate-800 font-medium">{invoice.doctor?.name || 'Self / OTC'}</span>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border border-slate-200 text-[11px] mb-2">
        <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
          <tr>
            <th className="py-1 px-1.5 w-6 text-center">#</th>
            <th className="py-1 px-1.5">Item Name</th>
            <th className="py-1 px-1.5 text-center">Batch</th>
            <th className="py-1 px-1.5 text-center">Exp</th>
            <th className="py-1 px-1.5 text-center">Qty</th>
            <th className="py-1 px-1.5 text-right">MRP</th>
            <th className="py-1 px-1.5 text-right">Rate</th>
            <th className="py-1 px-1.5 text-right">Disc%</th>
            <th className="py-1 px-1.5 text-right font-bold">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {invoice.items?.map((item, idx) => (
            <tr key={idx}>
              <td className="py-1 px-1.5 text-center text-slate-400">{idx + 1}</td>
              <td className="py-1 px-1.5">
                <span className="font-semibold text-slate-800">{item.name}</span>
              </td>
              <td className="py-1 px-1.5 text-center font-mono text-[10px] text-slate-600">{item.batchNo}</td>
              <td className="py-1 px-1.5 text-center text-[10px] text-slate-500">
                {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}
              </td>
              <td className="py-1 px-1.5 text-center font-bold">{item.quantity}</td>
              <td className="py-1 px-1.5 text-right text-slate-500">₹{Number(item.mrp || 0).toFixed(1)}</td>
              <td className="py-1 px-1.5 text-right">₹{Number(item.unitPrice || 0).toFixed(1)}</td>
              <td className="py-1 px-1.5 text-right text-slate-500">{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</td>
              <td className="py-1 px-1.5 text-right font-bold text-slate-900">₹{Number(item.total || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Footer */}
      <div className="flex justify-between items-start text-[11px] pt-1">
        <div className="text-[10px] text-slate-500 space-y-0.5">
          <div>* Medicines once sold will not be accepted without bill.</div>
          <div>* Payment: <strong className="uppercase text-slate-700">{invoice.paymentMethod}</strong></div>
        </div>

        <div className="w-56 space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
          <div className="flex justify-between text-slate-600">
            <span>Subtotal:</span>
            <span>₹{Number(invoice.subTotal || 0).toFixed(2)}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span>Discount:</span>
              <span>-₹{Number(invoice.discountTotal || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>GST Tax:</span>
            <span>+₹{Number(invoice.taxTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-sm text-teal-900 border-t border-slate-300 pt-1">
            <span>Grand Total:</span>
            <span>₹{Number(invoice.grandTotal || 0).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-3 pt-2 border-t border-slate-200">
        <span>Wish you good health!</span>
        <span>Authorized Signatory</span>
      </div>
    </div>
  );
}

