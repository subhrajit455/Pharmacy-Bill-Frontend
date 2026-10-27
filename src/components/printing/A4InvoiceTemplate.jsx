import React from 'react';

export default function A4InvoiceTemplate({ invoice, store }) {
  if (!invoice) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (num) => {
    return '₹' + Number(num || 0).toFixed(2);
  };

  return (
    <div className="bg-white text-slate-900 p-8 max-w-4xl mx-auto border border-slate-200 text-[13px] leading-snug print-a4 print:border-0 print:p-2">
      {/* Top Banner / Store Header */}
      <div className="border-b-2 border-teal-700 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-teal-700 font-black text-2xl tracking-tight uppercase">
                {store?.storeName || 'Apollo Care Pharmacy'}
              </span>
            </div>
            <p className="text-xs text-teal-800 font-medium tracking-wide">
              {store?.tagline || 'Chemists & Druggists • Surgical & Healthcare'}
            </p>
            <p className="text-xs text-slate-600 mt-1 max-w-md">
              {store?.address || 'Shop No. 12, Ground Floor, Central Market'}
            </p>
            <p className="text-xs text-slate-600">
              <span className="font-semibold">Phone:</span> {store?.phone || '+91 9876543210'} |{' '}
              <span className="font-semibold">Email:</span> {store?.email || 'care@apollopharmacy.local'}
            </p>
          </div>

          <div className="text-right text-xs space-y-0.5 bg-slate-50 p-2.5 rounded border border-slate-200">
            <div className="font-bold text-teal-900 text-sm tracking-wider uppercase mb-1">
              TAX INVOICE / CASH MEMO
            </div>
            <div><span className="font-semibold text-slate-700">D.L. No. (20B):</span> {store?.dlNumber1 || 'DL-20B/12345/21'}</div>
            <div><span className="font-semibold text-slate-700">D.L. No. (21B):</span> {store?.dlNumber2 || 'DL-21B/12346/21'}</div>
            <div><span className="font-semibold text-slate-700">GSTIN:</span> <span className="font-mono font-bold">{store?.gstin || '07AAAAA0000A1Z5'}</span></div>
            {store?.fssaiNumber && <div><span className="font-semibold text-slate-700">FSSAI No:</span> {store?.fssaiNumber}</div>}
          </div>
        </div>
      </div>

      {/* Invoice Meta & Customer / Doctor Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded border border-slate-200">
        <div>
          <div className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-1">Patient / Customer</div>
          <div className="font-bold text-slate-900 text-sm">{invoice.customer?.name || 'Walk-in Customer'}</div>
          {invoice.customer?.phone && <div className="text-slate-600 text-xs">Mobile: {invoice.customer.phone}</div>}
          {invoice.customer?.address && <div className="text-slate-600 text-xs">{invoice.customer.address}</div>}
        </div>

        <div className="text-right flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-500 tracking-wider">Invoice No: </span>
            <span className="font-mono font-bold text-teal-800 text-sm">{invoice.invoiceNumber}</span>
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold">Date & Time: </span>
            {new Date(invoice.createdAt || Date.now()).toLocaleString('en-IN', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold">Doctor: </span>
            <span className="font-medium text-slate-800">{invoice.doctor?.name || 'Self / OTC'}</span>
            {invoice.doctor?.regNo && ` (Reg: ${invoice.doctor.regNo})`}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-left border border-slate-300 text-xs mb-4">
        <thead className="bg-slate-100 text-slate-800 border-b border-slate-300 font-semibold uppercase text-[11px]">
          <tr>
            <th className="py-2 px-2 text-center w-8 border-r border-slate-300">#</th>
            <th className="py-2 px-2 border-r border-slate-300">Medicine & Description</th>
            <th className="py-2 px-2 text-center border-r border-slate-300">Batch</th>
            <th className="py-2 px-2 text-center border-r border-slate-300">Exp</th>
            <th className="py-2 px-2 text-center border-r border-slate-300">HSN</th>
            <th className="py-2 px-2 text-right border-r border-slate-300">MRP</th>
            <th className="py-2 px-2 text-center border-r border-slate-300">Qty</th>
            <th className="py-2 px-2 text-right border-r border-slate-300">Rate</th>
            <th className="py-2 px-2 text-right border-r border-slate-300">Disc%</th>
            <th className="py-2 px-2 text-right border-r border-slate-300">GST%</th>
            <th className="py-2 px-2 text-right font-bold">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {invoice.items?.map((item, index) => (
            <tr key={index} className="hover:bg-slate-50/50">
              <td className="py-1.5 px-2 text-center border-r border-slate-200 text-slate-500">{index + 1}</td>
              <td className="py-1.5 px-2 border-r border-slate-200">
                <div className="font-semibold text-slate-900">{item.name}</div>
                {item.genericName && (
                  <div className="text-[10px] text-slate-500 italic">{item.genericName}</div>
                )}
              </td>
              <td className="py-1.5 px-2 text-center font-mono border-r border-slate-200 text-slate-700">{item.batchNo}</td>
              <td className="py-1.5 px-2 text-center border-r border-slate-200 text-slate-600">
                {new Date(item.expiryDate).toLocaleDateString('en-IN', { month: '2-digit', year: '2-digit' })}
              </td>
              <td className="py-1.5 px-2 text-center font-mono text-[11px] border-r border-slate-200 text-slate-500">{item.hsnCode || '3004'}</td>
              <td className="py-1.5 px-2 text-right border-r border-slate-200 text-slate-600">₹{Number(item.mrp || 0).toFixed(2)}</td>
              <td className="py-1.5 px-2 text-center font-bold border-r border-slate-200">{item.quantity}</td>
              <td className="py-1.5 px-2 text-right border-r border-slate-200">₹{Number(item.unitPrice || 0).toFixed(2)}</td>
              <td className="py-1.5 px-2 text-right border-r border-slate-200 text-slate-600">{item.discountPercent > 0 ? `${item.discountPercent}%` : '-'}</td>
              <td className="py-1.5 px-2 text-right border-r border-slate-200 text-slate-600">{item.gstRate}%</td>
              <td className="py-1.5 px-2 text-right font-semibold text-slate-900">₹{Number(item.total || 0).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary and Calculation Breakdown */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Left Side: Tax Breakdown & Notes */}
        <div className="text-xs space-y-2">
          <div className="border border-slate-200 rounded p-2.5 bg-slate-50">
            <div className="font-bold text-slate-700 mb-1 uppercase text-[10px] tracking-wider">GST Tax Summary</div>
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>Taxable Value:</span>
              <span className="font-mono">₹{Number(invoice.subTotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>CGST ({invoice.taxTotal > 0 ? '6%' : '0%'}):</span>
              <span className="font-mono">₹{Number(invoice.cgst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 text-slate-600">
              <span>SGST ({invoice.taxTotal > 0 ? '6%' : '0%'}):</span>
              <span className="font-mono">₹{Number(invoice.sgst || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-0.5 border-t border-slate-200 font-semibold text-slate-800 mt-1 pt-1">
              <span>Total GST:</span>
              <span className="font-mono">₹{Number(invoice.taxTotal || 0).toFixed(2)}</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Payment: </span>
            <span className="uppercase font-medium text-teal-800">{invoice.paymentMethod}</span> |{' '}
            <span className="font-semibold text-slate-700">Status: </span>
            <span className="uppercase font-semibold text-emerald-700">{invoice.paymentStatus}</span>
          </div>
        </div>

        {/* Right Side: Totals */}
        <div className="border border-slate-200 rounded p-3 bg-slate-50 text-xs space-y-1.5">
          <div className="flex justify-between text-slate-600">
            <span>Sub Total (Taxable):</span>
            <span className="font-mono">₹{Number(invoice.subTotal || 0).toFixed(2)}</span>
          </div>
          {invoice.discountTotal > 0 && (
            <div className="flex justify-between text-emerald-700 font-medium">
              <span>Total Discount:</span>
              <span className="font-mono">-₹{Number(invoice.discountTotal || 0).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between text-slate-600">
            <span>Total GST Tax:</span>
            <span className="font-mono">+₹{Number(invoice.taxTotal || 0).toFixed(2)}</span>
          </div>
          {invoice.roundOff !== 0 && (
            <div className="flex justify-between text-slate-500 text-[11px]">
              <span>Round Off:</span>
              <span className="font-mono">{invoice.roundOff > 0 ? `+₹${invoice.roundOff}` : `-₹${Math.abs(invoice.roundOff)}`}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-t-2 border-teal-800 pt-2 text-base font-extrabold text-teal-900">
            <span>NET AMOUNT PAYABLE:</span>
            <span className="text-lg font-mono">₹{Number(invoice.grandTotal || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-xs pt-1 border-t border-slate-200">
            <span>Amount Paid:</span>
            <span className="font-mono font-semibold">₹{Number(invoice.amountPaid || 0).toFixed(2)}</span>
          </div>
          {invoice.balanceDue > 0 && (
            <div className="flex justify-between text-rose-600 text-xs font-bold">
              <span>Balance Due:</span>
              <span className="font-mono">₹{Number(invoice.balanceDue || 0).toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Terms & Signature */}
      <div className="border-t border-slate-300 pt-3 mt-4 text-[10px] text-slate-500 flex justify-between items-end">
        <div className="max-w-md space-y-0.5">
          <div className="font-semibold text-slate-700 uppercase">Terms & Conditions:</div>
          <div>1. Medicines without batch number and cash memo will not be exchanged.</div>
          <div>2. Refrigerated & Schedule H/X drugs are non-returnable.</div>
          <div>3. Take medicines strictly according to registered doctor's prescription.</div>
        </div>

        <div className="text-center min-w-[160px]">
          <div className="h-10"></div>
          <div className="border-t border-slate-400 pt-1 font-semibold text-slate-800">
            Authorized Signatory / Pharmacist
          </div>
          <div className="text-[9px] text-slate-400">For {store?.storeName || 'Apollo Care Pharmacy'}</div>
        </div>
      </div>

      <div className="text-center text-[11px] text-teal-800 font-semibold mt-4 border-t border-slate-100 pt-2">
        *** Wish You a Speedy Recovery & Healthy Life! ***
      </div>
    </div>
  );
}

