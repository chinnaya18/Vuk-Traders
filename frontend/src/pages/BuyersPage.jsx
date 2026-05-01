import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

export default function BuyersPage() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [currentBuyer, setCurrentBuyer] = useState(null);

  const fetchBuyers = async () => {
    try {
      const res = await client.get('/buyers');
      setBuyers(res.data);
    } catch (err) {
      toast.error('Failed to load buyers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this buyer?')) return;
    try {
      await client.delete(`/buyers/${id}`);
      toast.success('Buyer deleted');
      fetchBuyers();
    } catch (err) {
      toast.error('Failed to delete buyer');
    }
  };

  const openForm = (buyer = null) => {
    setCurrentBuyer(buyer || {
      company_name: '', gstin: '', gstins: [], email: '',
      address_line1: '', address_line2: '', address_line3: '',
      city: '', pincode: '', state: '', state_code: ''
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setCurrentBuyer(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (currentBuyer.id) {
        await client.put(`/buyers/${currentBuyer.id}`, currentBuyer);
        toast.success('Buyer updated');
      } else {
        await client.post('/buyers', currentBuyer);
        toast.success('Buyer added');
      }
      closeForm();
      fetchBuyers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save buyer');
    }
  };

  const handleChange = (e) => setCurrentBuyer({ ...currentBuyer, [e.target.name]: e.target.value });

  const addGSTIN = () => {
    const gstins = currentBuyer.gstins || [];
    setCurrentBuyer({ ...currentBuyer, gstins: [...gstins, ''] });
  };

  const removeGSTIN = (index) => {
    const gstins = currentBuyer.gstins.filter((_, i) => i !== index);
    setCurrentBuyer({ ...currentBuyer, gstins });
  };

  const handleGSTINChange = (index, value) => {
    const gstins = [...(currentBuyer.gstins || [])];
    gstins[index] = value.toUpperCase();
    setCurrentBuyer({ ...currentBuyer, gstins });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Buyers</h1>
        <button onClick={() => openForm()} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Buyer
        </button>
      </div>

      {isFormOpen && (
        <div className="glass-card p-6 rounded-xl relative">
          <h2 className="text-xl font-semibold mb-4">{currentBuyer.id ? 'Edit Buyer' : 'New Buyer'}</h2>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
              <input required type="text" name="company_name" value={currentBuyer.company_name} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Primary GSTIN</label>
              <input type="text" name="gstin" value={currentBuyer.gstin} onChange={handleChange} className="input-field" placeholder="22AAAAA0000A1Z5" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input type="email" name="email" value={currentBuyer.email} onChange={handleChange} className="input-field" />
            </div>

            <div className="col-span-2">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm text-slate-400">Additional GSTINs</label>
                <button type="button" onClick={addGSTIN} className="text-xs btn-secondary py-1 px-2 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add GSTIN
                </button>
              </div>
              <div className="space-y-2">
                {(currentBuyer.gstins || []).map((g, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input 
                      type="text" 
                      value={g} 
                      onChange={(e) => handleGSTINChange(idx, e.target.value)} 
                      className="input-field flex-1"
                      placeholder="22AAAAA0000A1Z5"
                    />
                    <button type="button" onClick={() => removeGSTIN(idx)} className="btn-danger px-3 py-2">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <label className="block text-sm text-slate-400 mb-1">Address Line 1</label>
              <input type="text" name="address_line1" value={currentBuyer.address_line1} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Address Line 2</label>
              <input type="text" name="address_line2" value={currentBuyer.address_line2} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Address Line 3</label>
              <input type="text" name="address_line3" value={currentBuyer.address_line3} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">City</label>
              <input type="text" name="city" value={currentBuyer.city} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Pincode</label>
              <input type="text" name="pincode" value={currentBuyer.pincode} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">State</label>
              <input type="text" name="state" value={currentBuyer.state} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">State Code</label>
              <input type="text" name="state_code" value={currentBuyer.state_code} onChange={handleChange} className="input-field" placeholder="e.g. 22" />
            </div>
            <div className="col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={closeForm} className="btn-secondary">Cancel</button>
              <button type="submit" className="btn-primary">Save Buyer</button>
            </div>
          </form>
        </div>
      )}

      {!loading && buyers.length === 0 && !isFormOpen && (
        <div className="text-center py-12 text-slate-400 glass-card rounded-xl">
          No buyers found. Add a buyer to get started.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {buyers.map(buyer => (
          <div key={buyer.id} className="glass-card p-5 rounded-xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-white mb-1">{buyer.company_name}</h3>
              {buyer.gstin && <p className="text-sm text-slate-300">GSTIN: <span className="text-emerald-400">{buyer.gstin}</span></p>}
              {buyer.gstins && buyer.gstins.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-slate-400 mb-1">Additional GSTINs:</p>
                  <div className="flex flex-wrap gap-1">
                    {buyer.gstins.map((g, idx) => (
                      <span key={idx} className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded">{g}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-slate-400 mt-2 truncate">{buyer.address_line1}, {buyer.city}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-700">
              <button onClick={() => openForm(buyer)} className="text-slate-300 hover:text-white p-2 hover:bg-slate-700 rounded-md transition-colors" title="Edit">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(buyer.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-slate-700 rounded-md transition-colors" title="Delete">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
