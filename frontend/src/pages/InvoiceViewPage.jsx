import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { ArrowLeft, Download, Printer } from 'lucide-react';
import { getHSNSACSummary } from '../utils/numberToWords';

export default function InvoiceViewPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await client.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        toast.error('Failed to load invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleDownload = async () => {
    try {
      const response = await client.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${invoice.invoice_no}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) return <div className="text-center p-12">Loading...</div>;
  if (!invoice) return <div className="text-center p-12 text-red-400">Invoice not found</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/invoices" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-3xl font-bold">Invoice {invoice.invoice_no}</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={handleDownload} className="btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" /> Download PDF
          </button>
        </div>
      </div>

      <div className="glass-card p-8 rounded-xl bg-slate-900 text-white shadow-xl overflow-x-auto">
        {/* Invoice Header */}
        <div className="border-b-2 border-slate-600 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-amber-400">TAX INVOICE</h2>
            <div className="mt-4 text-sm text-slate-300">
              <p><strong>Invoice No:</strong> <span className="text-white">{invoice.invoice_no}</span></p>
              <p><strong>Date:</strong> <span className="text-white">{new Date(invoice.invoice_date).toLocaleDateString()}</span></p>
            </div>
            {/* GST Portal Details */}
            {(invoice.irn || invoice.ack_no || invoice.ack_date) && (
              <div className="mt-4 p-3 bg-emerald-900/30 border border-emerald-600 rounded text-sm">
                <p className="font-semibold text-emerald-400 mb-2">✅ GST e-Invoice Registered</p>
                {invoice.irn && <p><strong>IRN:</strong> <span className="font-mono text-emerald-300 break-all">{invoice.irn}</span></p>}
                {invoice.ack_no && <p><strong>Ack No:</strong> <span className="text-white">{invoice.ack_no}</span></p>}
                {invoice.ack_date && <p><strong>Ack Date:</strong> <span className="text-white">{new Date(invoice.ack_date).toLocaleDateString()}</span></p>}
              </div>
            )}
          </div>
          <div className="text-right flex flex-col items-end gap-4">
            <div>
              <h3 className="text-xl font-bold text-white">Vuk Traders</h3>
              <p className="text-sm text-slate-300 max-w-[250px]">
                Your Company Address Here, City, State, Pincode
              </p>
            </div>
            {/* QR Code Display - Only if IRN exists */}
            {invoice.irn && invoice.qr_code_data && (
              <div className="border border-slate-600 p-2 bg-slate-800 rounded">
                <img 
                  src={`data:image/png;base64,${invoice.qr_code_data}`}
                  alt="Invoice QR Code"
                  className="w-24 h-24"
                />
                <p className="text-xs text-slate-400 text-center mt-1">IRN QR Code</p>
              </div>
            )}
          </div>
        </div>

        {/* Parties Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h4 className="font-bold text-amber-400 border-b border-slate-600 pb-1 mb-2">Billed To</h4>
            <p className="font-bold text-white">{invoice.buyer.company_name}</p>
            <p className="text-slate-300">{invoice.buyer.address_line1}</p>
            {(invoice.buyer.address_line2 || invoice.buyer.address_line3) && (
              <p className="text-slate-300">{invoice.buyer.address_line2} {invoice.buyer.address_line3}</p>
            )}
            <p className="text-slate-300">{invoice.buyer.city}, {invoice.buyer.state} - {invoice.buyer.pincode}</p>
            <p className="text-slate-300 mt-1"><strong>GSTIN:</strong> <span className="text-white">{invoice.buyer.gstin || 'N/A'}</span></p>
          </div>
          <div>
            <h4 className="font-bold text-amber-400 border-b border-slate-600 pb-1 mb-2">Shipping Details</h4>
            <p className="text-slate-300"><strong>Destination:</strong> <span className="text-white">{invoice.destination || 'N/A'}</span></p>
            <p className="text-slate-300"><strong>Dispatched Through:</strong> <span className="text-white">{invoice.dispatched_through || 'N/A'}</span></p>
            <p className="text-slate-300"><strong>Terms of Delivery:</strong> <span className="text-white">{invoice.terms_of_delivery || 'N/A'}</span></p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-8 border border-slate-600">
          <thead>
            <tr className="bg-slate-800 text-amber-400 border-b border-slate-600">
              <th className="p-2 border-r border-slate-600 text-center w-12">S.No</th>
              <th className="p-2 border-r border-slate-600 text-left">Description of Goods</th>
              <th className="p-2 border-r border-slate-600 text-center w-24">HSN/SAC</th>
              <th className="p-2 border-r border-slate-600 text-right w-20">Qty</th>
              <th className="p-2 border-r border-slate-600 text-right w-24">Rate</th>
              <th className="p-2 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-slate-600 text-slate-300">
                <td className="p-2 border-r border-slate-600 text-center">{index + 1}</td>
                <td className="p-2 border-r border-slate-600 text-white">{item.description}</td>
                <td className="p-2 border-r border-slate-600 text-center text-white">{item.hsn_sac || '-'}</td>
                <td className="p-2 border-r border-slate-600 text-right text-white">{item.quantity} {item.unit}</td>
                <td className="p-2 border-r border-slate-600 text-right text-white">{parseFloat(item.rate).toFixed(2)}</td>
                <td className="p-2 text-right text-white">{parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* HSN/SAC Summary */}
        <div className="mb-8 p-3 bg-slate-800 border border-slate-600 rounded">
          <div className="flex justify-between items-center">
            <span className="text-slate-300 font-medium">HSN/SAC Summary:</span>
            <span className="text-amber-400 font-bold">{getHSNSACSummary(invoice.items)}</span>
          </div>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-1/2">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-300">Sub Total</td>
                  <td className="p-2 text-right w-32 border border-slate-600 text-white">{parseFloat(invoice.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-300">CGST</td>
                  <td className="p-2 text-right w-32 border border-slate-600 text-white">{parseFloat(invoice.total_cgst).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-300">SGST</td>
                  <td className="p-2 text-right w-32 border border-slate-600 text-white">{parseFloat(invoice.total_sgst).toFixed(2)}</td>
                </tr>
                <tr className="bg-slate-800 font-bold text-lg">
                  <td className="p-3 text-right text-amber-400 border border-slate-600">Grand Total (₹)</td>
                  <td className="p-3 text-right text-amber-400 border border-slate-600">{parseFloat(invoice.grand_total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="mb-8">
          <p className="text-sm text-slate-400">Amount Chargeable (in words)</p>
          <p className="font-bold text-white capitalize">INR {invoice.amount_in_words}</p>
        </div>

      </div>
    </div>
  );
}
