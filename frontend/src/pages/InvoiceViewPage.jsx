import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { ArrowLeft, Download, Printer } from 'lucide-react';

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

      <div className="glass-card p-8 rounded-xl bg-white text-slate-900 shadow-xl overflow-x-auto">
        {/* Invoice Header */}
        <div className="border-b-2 border-slate-200 pb-6 mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-3xl font-bold text-indigo-700">TAX INVOICE</h2>
            <div className="mt-4 text-sm text-slate-600">
              <p><strong>Invoice No:</strong> {invoice.invoice_no}</p>
              <p><strong>Date:</strong> {new Date(invoice.invoice_date).toLocaleDateString()}</p>
              {invoice.irn && <p><strong>IRN:</strong> {invoice.irn}</p>}
            </div>
          </div>
          <div className="text-right">
             <h3 className="text-xl font-bold text-slate-800">Vuk Traders</h3>
             <p className="text-sm text-slate-600 max-w-[250px] mt-1 ml-auto">
               Your Company Address Here, City, State, Pincode
             </p>
          </div>
        </div>

        {/* Parties Info */}
        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
          <div>
            <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1 mb-2">Billed To</h4>
            <p className="font-bold text-slate-800">{invoice.buyer.company_name}</p>
            <p className="text-slate-600">{invoice.buyer.address_line1}</p>
            {(invoice.buyer.address_line2 || invoice.buyer.address_line3) && (
              <p className="text-slate-600">{invoice.buyer.address_line2} {invoice.buyer.address_line3}</p>
            )}
            <p className="text-slate-600">{invoice.buyer.city}, {invoice.buyer.state} - {invoice.buyer.pincode}</p>
            <p className="text-slate-600 mt-1"><strong>GSTIN:</strong> {invoice.buyer.gstin || 'N/A'}</p>
          </div>
          <div>
            <h4 className="font-bold text-slate-700 border-b border-slate-200 pb-1 mb-2">Shipping Details</h4>
            <p><strong>Destination:</strong> {invoice.destination || 'N/A'}</p>
            <p><strong>Dispatched Through:</strong> {invoice.dispatched_through || 'N/A'}</p>
            <p><strong>Terms of Delivery:</strong> {invoice.terms_of_delivery || 'N/A'}</p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-sm mb-8 border border-slate-200">
          <thead>
            <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
              <th className="p-2 border-r border-slate-200 text-center w-12">S.No</th>
              <th className="p-2 border-r border-slate-200 text-left">Description of Goods</th>
              <th className="p-2 border-r border-slate-200 text-center w-24">HSN/SAC</th>
              <th className="p-2 border-r border-slate-200 text-right w-20">Qty</th>
              <th className="p-2 border-r border-slate-200 text-right w-24">Rate</th>
              <th className="p-2 text-right w-32">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-slate-200">
                <td className="p-2 border-r border-slate-200 text-center">{index + 1}</td>
                <td className="p-2 border-r border-slate-200">{item.description}</td>
                <td className="p-2 border-r border-slate-200 text-center">{item.hsn_sac || '-'}</td>
                <td className="p-2 border-r border-slate-200 text-right">{item.quantity} {item.unit}</td>
                <td className="p-2 border-r border-slate-200 text-right">{parseFloat(item.rate).toFixed(2)}</td>
                <td className="p-2 text-right">{parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Section */}
        <div className="flex justify-end mb-8">
          <div className="w-1/2">
            <table className="w-full text-sm">
              <tbody>
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-600">Sub Total</td>
                  <td className="p-2 text-right w-32 border border-slate-200">{parseFloat(invoice.subtotal).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-600">CGST</td>
                  <td className="p-2 text-right w-32 border border-slate-200">{parseFloat(invoice.total_cgst).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="p-2 text-right font-semibold text-slate-600">SGST</td>
                  <td className="p-2 text-right w-32 border border-slate-200">{parseFloat(invoice.total_sgst).toFixed(2)}</td>
                </tr>
                <tr className="bg-slate-100 font-bold text-lg">
                  <td className="p-3 text-right text-indigo-900 border border-slate-200">Grand Total (₹)</td>
                  <td className="p-3 text-right text-indigo-900 border border-slate-200">{parseFloat(invoice.grand_total).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Amount in words */}
        <div className="mb-8">
          <p className="text-sm text-slate-600">Amount Chargeable (in words)</p>
          <p className="font-bold text-slate-800 capitalize">INR {invoice.amount_in_words}</p>
        </div>

      </div>
    </div>
  );
}
