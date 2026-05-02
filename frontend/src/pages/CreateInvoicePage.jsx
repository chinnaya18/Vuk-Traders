import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { Plus, Trash2, Save, X, CheckCircle, Eye } from 'lucide-react';
import { getHSNSACSummary } from '../utils/numberToWords';

const PAYMENT_MODES = [
  'Cash',
  'Credit',
  'Net 15',
  'Net 30',
  'Net 45',
  'Net 60',
  'Bank Transfer / NEFT',
  'RTGS',
  'UPI',
  'Cheque',
  'Demand Draft',
  'Letter of Credit',
  'Against Delivery',
  'Advance Payment',
];

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [invoice, setInvoice] = useState({
    invoice_no: '',
    invoice_date: new Date().toISOString().split('T')[0],
    buyer_id: '',
    delivery_note: '',
    buyer_order_no: '',
    dispatch_doc_no: '',
    dispatched_through: '',
    destination: '',
    mode_terms_payment: '',
    delivery_note_date: '',
    terms_of_delivery: '',
    irn: '',
    ack_no: '',
    ack_date: ''
  });

  const [items, setItems] = useState([
    { description: '', hsn_sac: '', quantity: 1, unit: 'PCS', rate: 0, cgst_rate: 9, sgst_rate: 9 }
  ]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [buyersRes, nextNoRes, productsRes] = await Promise.all([
          client.get('/buyers'),
          client.get('/invoices/next-number'),
          client.get('/products').catch(() => ({ data: [] }))
        ]);
        setBuyers(buyersRes.data);
        setProducts(productsRes.data);
        setInvoice(prev => ({ ...prev, invoice_no: nextNoRes.data.invoice_no }));
      } catch (err) {
        toast.error('Failed to load initial data');
      }
    };
    fetchInitialData();
  }, []);

  const handleInvoiceChange = (e) => setInvoice({ ...invoice, [e.target.name]: e.target.value });

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleProductSelect = (index, productId) => {
    const selected = products.find(p => p.id === parseInt(productId));
    if (selected) {
      const newItems = [...items];
      newItems[index] = {
        ...newItems[index],
        description: selected.name,
        hsn_sac: selected.hsn_sac,
        rate: selected.rate
      };
      setItems(newItems);
    }
  };

  const addItem = () => {
    setItems([...items, { description: '', hsn_sac: '', quantity: 1, unit: 'PCS', rate: 0, cgst_rate: 9, sgst_rate: 9 }]);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  // Calculations
  const calculateTotals = () => {
    let subtotal = 0;
    let total_cgst = 0;
    let total_sgst = 0;

    items.forEach(item => {
      const amount = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
      subtotal += amount;
      total_cgst += amount * (parseFloat(item.cgst_rate || 0) / 100);
      total_sgst += amount * (parseFloat(item.sgst_rate || 0) / 100);
    });

    const exact_total = subtotal + total_cgst + total_sgst;
    const rounded_total = Math.round(exact_total);
    const round_off = rounded_total - exact_total;

    return {
      subtotal,
      total_cgst,
      total_sgst,
      round_off,
      grand_total: rounded_total
    };
  };

  const totals = calculateTotals();

  // Get selected buyer name
  const getSelectedBuyer = () => {
    return buyers.find(b => b.id === parseInt(invoice.buyer_id));
  };

  const handlePreview = (e) => {
    e.preventDefault();
    if (!invoice.buyer_id) {
      toast.error('Please select a buyer');
      return;
    }
    if (items.length === 0 || !items[0].description) {
      toast.error('Please add at least one item');
      return;
    }
    setShowPreview(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    try {
      const payload = {
        ...invoice,
        buyer_id: parseInt(invoice.buyer_id),
        delivery_note_date: invoice.delivery_note_date || null,
        ack_date: invoice.ack_date || null,
        items: items.map((item, index) => ({
          serial_no: index + 1,
          description: item.description,
          hsn_sac: item.hsn_sac,
          quantity: parseFloat(item.quantity),
          unit: item.unit,
          rate: parseFloat(item.rate),
          cgst_rate: parseFloat(item.cgst_rate),
          sgst_rate: parseFloat(item.sgst_rate)
        }))
      };
      
      const res = await client.post('/invoices', payload);
      toast.success('Invoice created successfully!');
      setShowPreview(false);
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      let errorMessage = 'Failed to create invoice';
      if (err.response?.data?.detail) {
        if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map(d => `${d.loc.join('.')}: ${d.msg}`).join(', ');
        } else {
          errorMessage = err.response.data.detail;
        }
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
      </div>

      <form onSubmit={handlePreview}>
        <div className="glass-card p-6 rounded-xl mb-6">
          <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Invoice Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Invoice No *</label>
              <input required type="text" name="invoice_no" value={invoice.invoice_no} onChange={handleInvoiceChange} className="input-field bg-slate-700" readOnly />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Invoice Date *</label>
              <input required type="date" name="invoice_date" value={invoice.invoice_date} onChange={handleInvoiceChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Buyer *</label>
              <select required name="buyer_id" value={invoice.buyer_id} onChange={handleInvoiceChange} className="input-field">
                <option value="">Select a buyer</option>
                {buyers.map(b => (
                  <option key={b.id} value={b.id}>{b.company_name} ({b.city})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Delivery Note</label>
              <input type="text" name="delivery_note" value={invoice.delivery_note} onChange={handleInvoiceChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Buyer Order No</label>
              <input type="text" name="buyer_order_no" value={invoice.buyer_order_no} onChange={handleInvoiceChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Mode/Terms of Payment</label>
              <select name="mode_terms_payment" value={invoice.mode_terms_payment} onChange={handleInvoiceChange} className="input-field">
                <option value="">Select payment mode</option>
                {PAYMENT_MODES.map(mode => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Dispatch Document No</label>
              <input type="text" name="dispatch_doc_no" value={invoice.dispatch_doc_no} onChange={handleInvoiceChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Dispatched Through</label>
              <input type="text" name="dispatched_through" value={invoice.dispatched_through} onChange={handleInvoiceChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Destination</label>
              <input type="text" name="destination" value={invoice.destination} onChange={handleInvoiceChange} className="input-field" />
            </div>
            
            {/* IRN & Acknowledgment Section */}
            <div className="col-span-3 border-t border-slate-700 pt-4 mt-2">
              <h3 className="text-sm font-semibold text-slate-300 mb-3">GST Registration Portal Details (Optional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">IRN (Invoice Registration Number)</label>
                  <input type="text" name="irn" value={invoice.irn} onChange={handleInvoiceChange} className="input-field text-sm" placeholder="From e-Invoice portal" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Acknowledgment Number</label>
                  <input type="text" name="ack_no" value={invoice.ack_no} onChange={handleInvoiceChange} className="input-field text-sm" placeholder="Ack number" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Acknowledgment Date</label>
                  <input type="date" name="ack_date" value={invoice.ack_date} onChange={handleInvoiceChange} className="input-field text-sm" />
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2">Leave blank if invoice hasn't been registered with GST portal yet</p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl mb-6 overflow-x-auto">
          <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
            <h2 className="text-xl font-semibold">Items</h2>
            <button type="button" onClick={addItem} className="btn-secondary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" /> Add Item
            </button>
          </div>
          
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-800 border-b border-slate-700">
                <th className="p-3 text-slate-300 font-medium w-12">#</th>
                <th className="p-3 text-slate-300 font-medium w-32">Select Product</th>
                <th className="p-3 text-slate-300 font-medium">Description *</th>
                <th className="p-3 text-slate-300 font-medium w-24">HSN</th>
                <th className="p-3 text-slate-300 font-medium w-24">Qty *</th>
                <th className="p-3 text-slate-300 font-medium w-20">Unit</th>
                <th className="p-3 text-slate-300 font-medium w-32">Rate *</th>
                <th className="p-3 text-slate-300 font-medium w-24">CGST %</th>
                <th className="p-3 text-slate-300 font-medium w-24">SGST %</th>
                <th className="p-3 text-slate-300 font-medium w-32 text-right">Amount</th>
                <th className="p-3 w-12"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-slate-700/50">
                  <td className="p-3 text-slate-400">{index + 1}</td>
                  <td className="p-2">
                    <select 
                      value="" 
                      onChange={(e) => handleProductSelect(index, e.target.value)} 
                      className="input-field py-1 text-sm"
                    >
                      <option value="">Choose...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.rate})</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2"><input required type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="input-field py-1" /></td>
                  <td className="p-2"><input type="text" value={item.hsn_sac} onChange={(e) => handleItemChange(index, 'hsn_sac', e.target.value)} className="input-field py-1" /></td>
                  <td className="p-2"><input required type="number" min="0.01" step="0.01" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} className="input-field py-1" /></td>
                  <td className="p-2"><input type="text" value={item.unit} onChange={(e) => handleItemChange(index, 'unit', e.target.value)} className="input-field py-1 text-center" /></td>
                  <td className="p-2"><input required type="number" min="0" step="0.01" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} className="input-field py-1" /></td>
                  <td className="p-2"><input required type="number" min="0" step="0.1" value={item.cgst_rate} onChange={(e) => handleItemChange(index, 'cgst_rate', e.target.value)} className="input-field py-1" /></td>
                  <td className="p-2"><input required type="number" min="0" step="0.1" value={item.sgst_rate} onChange={(e) => handleItemChange(index, 'sgst_rate', e.target.value)} className="input-field py-1" /></td>
                  <td className="p-3 text-right font-medium">₹{(parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)).toFixed(2)}</td>
                  <td className="p-2">
                    <button type="button" onClick={() => removeItem(index)} className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-700 rounded-md" disabled={items.length === 1}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* HSN/SAC Summary */}
          <div className="mt-4 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <div className="flex justify-between items-center">
              <span className="text-slate-300 font-medium">HSN/SAC Summary:</span>
              <span className="text-amber-400 font-bold">{getHSNSACSummary(items)}</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl mb-6 flex justify-end">
          <div className="w-full max-w-sm">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Tax Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-slate-300">
                <span>Subtotal</span>
                <span>₹{totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total CGST</span>
                <span>₹{totals.total_cgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Total SGST</span>
                <span>₹{totals.total_sgst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300 border-t border-slate-700/50 pt-2">
                <span>Round Off</span>
                <span>{totals.round_off >= 0 ? '+' : ''}₹{totals.round_off.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-emerald-400 pt-3 border-t border-slate-700">
                <span>Grand Total</span>
                <span>₹{totals.grand_total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center text-lg py-3">
                <Eye className="w-5 h-5" /> Preview & Save Invoice
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* ===== CONFIRMATION PREVIEW MODAL ===== */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowPreview(false)}>
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex justify-between items-center z-10 rounded-t-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-600/20 rounded-full flex items-center justify-center">
                  <Eye className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Invoice Preview</h2>
                  <p className="text-sm text-slate-400">Review the details before confirming</p>
                </div>
              </div>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">Invoice Details</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-slate-400">Invoice No:</span> <span className="text-white font-medium">{invoice.invoice_no}</span></p>
                    <p><span className="text-slate-400">Date:</span> <span className="text-white">{invoice.invoice_date}</span></p>
                    <p><span className="text-slate-400">Delivery Note:</span> <span className="text-white">{invoice.delivery_note || '-'}</span></p>
                    <p><span className="text-slate-400">Mode/Terms:</span> <span className="text-white">{invoice.mode_terms_payment || '-'}</span></p>
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-amber-400 mb-3">Dispatch Details</h3>
                  <div className="space-y-1.5 text-sm">
                    <p><span className="text-slate-400">Buyer Order No:</span> <span className="text-white">{invoice.buyer_order_no || '-'}</span></p>
                    <p><span className="text-slate-400">Dispatch Doc No:</span> <span className="text-white">{invoice.dispatch_doc_no || '-'}</span></p>
                    <p><span className="text-slate-400">Dispatched Through:</span> <span className="text-white">{invoice.dispatched_through || '-'}</span></p>
                    <p><span className="text-slate-400">Destination:</span> <span className="text-white">{invoice.destination || '-'}</span></p>
                  </div>
                </div>
              </div>

              {/* Buyer Info */}
              {getSelectedBuyer() && (
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <h3 className="text-sm font-semibold text-amber-400 mb-2">Buyer</h3>
                  <p className="text-white font-medium">{getSelectedBuyer().company_name}</p>
                  <p className="text-sm text-slate-300">{getSelectedBuyer().city}, {getSelectedBuyer().state}</p>
                  {getSelectedBuyer().gstin && <p className="text-sm text-slate-300">GSTIN: {getSelectedBuyer().gstin}</p>}
                </div>
              )}

              {/* Items Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-slate-700 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-800 text-amber-400">
                      <th className="p-2 text-center border-r border-slate-700 w-10">#</th>
                      <th className="p-2 text-left border-r border-slate-700">Description</th>
                      <th className="p-2 text-center border-r border-slate-700 w-20">HSN</th>
                      <th className="p-2 text-right border-r border-slate-700 w-16">Qty</th>
                      <th className="p-2 text-right border-r border-slate-700 w-20">Rate</th>
                      <th className="p-2 text-center border-r border-slate-700 w-16">CGST%</th>
                      <th className="p-2 text-center border-r border-slate-700 w-16">SGST%</th>
                      <th className="p-2 text-right w-24">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, index) => (
                      <tr key={index} className="border-t border-slate-700 text-slate-200">
                        <td className="p-2 text-center border-r border-slate-700">{index + 1}</td>
                        <td className="p-2 border-r border-slate-700 text-white">{item.description}</td>
                        <td className="p-2 text-center border-r border-slate-700">{item.hsn_sac || '-'}</td>
                        <td className="p-2 text-right border-r border-slate-700">{item.quantity} {item.unit}</td>
                        <td className="p-2 text-right border-r border-slate-700">₹{parseFloat(item.rate || 0).toFixed(2)}</td>
                        <td className="p-2 text-center border-r border-slate-700">{item.cgst_rate}%</td>
                        <td className="p-2 text-center border-r border-slate-700">{item.sgst_rate}%</td>
                        <td className="p-2 text-right text-white font-medium">₹{(parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-full max-w-xs space-y-2 bg-slate-800/50 rounded-xl p-4 border border-slate-700/50">
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>Subtotal</span>
                    <span>₹{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>CGST</span>
                    <span>₹{totals.total_cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300">
                    <span>SGST</span>
                    <span>₹{totals.total_sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-slate-300 border-t border-slate-700/50 pt-2">
                    <span>Round Off</span>
                    <span>{totals.round_off >= 0 ? '+' : ''}₹{totals.round_off.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-emerald-400 pt-2 border-t border-slate-700">
                    <span>Grand Total</span>
                    <span>₹{totals.grand_total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowPreview(false)}
                className="btn-secondary flex items-center gap-2 px-6"
              >
                <X className="w-4 h-4" /> Go Back & Edit
              </button>
              <button
                onClick={handleConfirmSave}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 focus:ring-offset-slate-900"
              >
                <CheckCircle className="w-5 h-5" />
                {loading ? 'Saving...' : 'Confirm & Save Invoice'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
