import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { FileText, Eye, Trash2, Download } from 'lucide-react';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await client.get('/invoices');
      setInvoices(res.data);
    } catch (err) {
      toast.error('Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    try {
      await client.delete(`/invoices/${id}`);
      toast.success('Invoice deleted');
      fetchInvoices();
    } catch (err) {
      toast.error('Failed to delete invoice');
    }
  };

  const handleDownload = async (id) => {
    try {
      const response = await client.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      toast.error('Failed to download invoice');
    }
  };

  if (loading) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link to="/invoices/new" className="btn-primary">Create Invoice</Link>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800 border-b border-slate-700">
              <th className="p-4 text-slate-300 font-medium">Invoice No</th>
              <th className="p-4 text-slate-300 font-medium">Date</th>
              <th className="p-4 text-slate-300 font-medium">Buyer</th>
              <th className="p-4 text-slate-300 font-medium">Total Amount</th>
              <th className="p-4 text-slate-300 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-400">No invoices found.</td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-slate-700/50 hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-medium text-white">{inv.invoice_no}</td>
                  <td className="p-4 text-slate-300">{new Date(inv.invoice_date).toLocaleDateString()}</td>
                  <td className="p-4 text-slate-300">{inv.buyer?.company_name}</td>
                  <td className="p-4 font-semibold text-emerald-400">₹{parseFloat(inv.grand_total).toFixed(2)}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleDownload(inv.id)} className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-slate-700 rounded-md transition-colors" title="Download PDF">
                        <Download className="w-4 h-4" />
                      </button>
                      <Link to={`/invoices/${inv.id}`} className="p-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-md transition-colors" title="View">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => handleDelete(inv.id)} className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
