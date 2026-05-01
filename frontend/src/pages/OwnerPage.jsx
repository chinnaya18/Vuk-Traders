import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../api/client';

export default function OwnerPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [owner, setOwner] = useState({
    company_name: '',
    address_line1: '',
    address_line2: '',
    address_line3: '',
    city: '',
    pincode: '',
    state: '',
    state_code: '',
    gstin: '',
    email: '',
  });

  const [bank, setBank] = useState({
    bank_name: '',
    account_no: '',
    branch: '',
    ifsc_code: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ownerRes, bankRes] = await Promise.all([
          client.get('/owner').catch(() => null),
          client.get('/bank-details').catch(() => null)
        ]);
        
        if (ownerRes && ownerRes.data) {
          setOwner(ownerRes.data);
        }
        if (bankRes && bankRes.data) {
          setBank(bankRes.data);
        }
      } catch (err) {
        console.error('Failed to fetch initial data', err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, []);

  const handleOwnerChange = (e) => setOwner({ ...owner, [e.target.name]: e.target.value });
  const handleBankChange = (e) => setBank({ ...bank, [e.target.name]: e.target.value });

  const handleSaveOwner = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const exists = !!owner.id;
      if (exists) {
        await client.put('/owner', owner);
      } else {
        await client.post('/owner', owner);
      }
      toast.success('Owner details saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save owner details');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const exists = !!bank.id;
      if (exists) {
        await client.put('/bank-details', bank);
      } else {
        await client.post('/bank-details', bank);
      }
      toast.success('Bank details saved successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save bank details');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings & Owner Details</h1>
      
      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Company Information</h2>
        <form onSubmit={handleSaveOwner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Company Name *</label>
            <input required type="text" name="company_name" value={owner.company_name} onChange={handleOwnerChange} className="input-field" placeholder="Vuk Traders" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">GSTIN *</label>
            <input required type="text" name="gstin" value={owner.gstin} onChange={handleOwnerChange} className="input-field" placeholder="22AAAAA0000A1Z5" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Email</label>
            <input type="email" name="email" value={owner.email} onChange={handleOwnerChange} className="input-field" placeholder="contact@example.com" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Address Line 1</label>
            <input type="text" name="address_line1" value={owner.address_line1} onChange={handleOwnerChange} className="input-field" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm text-slate-400 mb-1">Address Line 2</label>
            <input type="text" name="address_line2" value={owner.address_line2} onChange={handleOwnerChange} className="input-field" />
          </div>
          <div className="col-span-2 md:col-span-1">
            <label className="block text-sm text-slate-400 mb-1">Address Line 3</label>
            <input type="text" name="address_line3" value={owner.address_line3} onChange={handleOwnerChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">City</label>
            <input type="text" name="city" value={owner.city} onChange={handleOwnerChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Pincode</label>
            <input type="text" name="pincode" value={owner.pincode} onChange={handleOwnerChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">State</label>
            <input type="text" name="state" value={owner.state} onChange={handleOwnerChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">State Code</label>
            <input type="text" name="state_code" value={owner.state_code} onChange={handleOwnerChange} className="input-field" placeholder="e.g. 22" />
          </div>
          <div className="col-span-2 flex justify-end mt-4">
            <button type="submit" disabled={loading} className="btn-primary">Save Company Details</button>
          </div>
        </form>
      </div>

      <div className="glass-card p-6 rounded-xl">
        <h2 className="text-xl font-semibold mb-4 border-b border-slate-700 pb-2">Bank Information</h2>
        <form onSubmit={handleSaveBank} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Bank Name</label>
            <input type="text" name="bank_name" value={bank.bank_name} onChange={handleBankChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">Account Number</label>
            <input type="text" name="account_no" value={bank.account_no} onChange={handleBankChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1">IFSC Code</label>
            <input type="text" name="ifsc_code" value={bank.ifsc_code} onChange={handleBankChange} className="input-field" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm text-slate-400 mb-1">Branch</label>
            <input type="text" name="branch" value={bank.branch} onChange={handleBankChange} className="input-field" />
          </div>
          <div className="col-span-2 flex justify-end mt-4">
            <button type="submit" disabled={loading} className="btn-primary">Save Bank Details</button>
          </div>
        </form>
      </div>
    </div>
  );
}
