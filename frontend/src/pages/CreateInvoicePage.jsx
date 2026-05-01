import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import client from '../api/client';
import { Plus, Trash2, Save } from 'lucide-react';
import { getHSNSACSummary } from '../utils/numberToWords';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  
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
        setInvoice(prev => ({ ...prev, invoice_no: nextNoRes.data.next_invoice_no }));
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

    return {
      subtotal,
      total_cgst,
      total_sgst,
      grand_total: subtotal + total_cgst + total_sgst
    };
  };

  const totals = calculateTotals();

  const handleSave = async (e) => {
    e.preventDefault();
    if (!invoice.buyer_id) {
      toast.error('Please select a buyer');
      return;
    }
    if (items.length === 0 || !items[0].description) {
      toast.error('Please add at least one item');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...invoice,
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
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
      </div>

      <form onSubmit={handleSave}>
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
              <input type="text" name="mode_terms_payment" value={invoice.mode_terms_payment} onChange={handleInvoiceChange} className="input-field" />
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
              <div className="flex justify-between items-center text-xl font-bold text-emerald-400 pt-3 border-t border-slate-700">
                <span>Grand Total</span>
                <span>₹{totals.grand_total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
              <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 w-full justify-center text-lg py-3">
                <Save className="w-5 h-5" /> Save & Generate Invoice
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
