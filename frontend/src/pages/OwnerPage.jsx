import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import client from '../api/client';
import { Plus, Edit2, Trash2, Package } from 'lucide-react';

export default function OwnerPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [products, setProducts] = useState([]);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  
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
        const [ownerRes, bankRes, productsRes] = await Promise.all([
          client.get('/owner').catch(() => null),
          client.get('/bank-details').catch(() => null),
          client.get('/products').catch(() => ({ data: [] }))
        ]);
        
        if (ownerRes && ownerRes.data) {
          setOwner(ownerRes.data);
        }
        if (bankRes && bankRes.data) {
          setBank(bankRes.data);
        }
        if (productsRes && productsRes.data) {
          setProducts(productsRes.data);
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

  const openProductForm = (product = null) => {
    setCurrentProduct(product || {
      name: '',
      hsn_sac: '',
      rate: 0
    });
    setIsProductFormOpen(true);
  };

  const closeProductForm = () => {
    setIsProductFormOpen(false);
    setCurrentProduct(null);
  };

  const handleProductChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: name === 'rate' ? parseFloat(value) || 0 : value
    });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!currentProduct.name || !currentProduct.hsn_sac || !currentProduct.rate) {
      toast.error('All fields are required');
      return;
    }
    
    try {
      if (currentProduct.id) {
        await client.put(`/products/${currentProduct.id}`, currentProduct);
        toast.success('Product updated');
      } else {
        await client.post('/products', currentProduct);
        toast.success('Product added');
      }
      closeProductForm();
      const productsRes = await client.get('/products');
      setProducts(productsRes.data);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await client.delete(`/products/${id}`);
      toast.success('Product deleted');
      const productsRes = await client.get('/products');
      setProducts(productsRes.data);
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  if (fetching) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold">Settings & Configuration</h1>
      
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

      <div className="glass-card p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-400" /> Manage Products
          </h2>
        </div>
        <p className="text-sm text-slate-400 mb-4">Add products with HSN/SAC codes and rates. These will appear in the invoice generator.</p>
        
        <button onClick={() => openProductForm()} className="btn-primary flex items-center gap-2 mb-4">
          <Plus className="w-4 h-4" /> Add New Product
        </button>

        {isProductFormOpen && (
          <div className="bg-slate-800/50 p-4 rounded-lg mb-4 border border-slate-700">
            <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm text-slate-400 mb-1">Product Name *</label>
                <input 
                  required 
                  type="text" 
                  name="name" 
                  value={currentProduct.name} 
                  onChange={handleProductChange} 
                  className="input-field text-sm" 
                  placeholder="e.g., Painting Service"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm text-slate-400 mb-1">HSN/SAC Code *</label>
                <input 
                  required 
                  type="text" 
                  name="hsn_sac" 
                  value={currentProduct.hsn_sac} 
                  onChange={handleProductChange} 
                  className="input-field text-sm" 
                  placeholder="e.g., 9982"
                />
              </div>
              <div className="col-span-2 md:col-span-1">
                <label className="block text-sm text-slate-400 mb-1">Rate (₹) *</label>
                <input 
                  required 
                  type="number" 
                  name="rate" 
                  value={currentProduct.rate} 
                  onChange={handleProductChange} 
                  className="input-field text-sm" 
                  placeholder="0"
                  step="0.01"
                  min="0"
                />
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <button type="button" onClick={closeProductForm} className="btn-secondary text-sm py-1">Cancel</button>
                <button type="submit" className="btn-primary text-sm py-1">Save Product</button>
              </div>
            </form>
          </div>
        )}

        {products.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-700">
                <tr>
                  <th className="text-left py-2 px-2 text-slate-400">Product Name</th>
                  <th className="text-left py-2 px-2 text-slate-400">HSN/SAC</th>
                  <th className="text-left py-2 px-2 text-slate-400">Rate</th>
                  <th className="text-center py-2 px-2 text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id} className="border-b border-slate-700/50 hover:bg-slate-800/30">
                    <td className="py-2 px-2 text-white">{product.name}</td>
                    <td className="py-2 px-2 text-slate-300">{product.hsn_sac}</td>
                    <td className="py-2 px-2 text-amber-400">₹{product.rate.toFixed(2)}</td>
                    <td className="py-2 px-2 text-center flex justify-center gap-2">
                      <button 
                        onClick={() => openProductForm(product)} 
                        className="text-slate-300 hover:text-white p-1 hover:bg-slate-700 rounded text-xs"
                        title="Edit product"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product.id)} 
                        className="text-red-400 hover:text-red-300 p-1 hover:bg-slate-700 rounded text-xs"
                        title="Delete product"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No products added yet. Create your first product to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
