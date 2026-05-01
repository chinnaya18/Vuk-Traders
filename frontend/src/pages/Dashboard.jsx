import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { FileText, Users, TrendingUp, PlusCircle } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalBuyers: 0,
    totalRevenue: 0,
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [invoicesRes, buyersRes] = await Promise.all([
          client.get('/invoices').catch(() => ({ data: [] })),
          client.get('/buyers').catch(() => ({ data: [] }))
        ]);
        
        const invoices = invoicesRes.data || [];
        const buyers = buyersRes.data || [];
        
        const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.grand_total || 0), 0);
        
        setStats({
          totalInvoices: invoices.length,
          totalBuyers: buyers.length,
          totalRevenue,
          recentInvoices: invoices.slice(0, 5) // Get first 5
        });
      } catch (err) {
        console.error('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) return <div className="text-center p-12">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/invoices/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border-l-4 border-indigo-500">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-500/20 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Invoices</p>
              <h2 className="text-3xl font-bold text-white">{stats.totalInvoices}</h2>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl border-l-4 border-emerald-500">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <h2 className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}</h2>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-l-4 border-blue-500">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Users className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Buyers</p>
              <h2 className="text-3xl font-bold text-white">{stats.totalBuyers}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 rounded-xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
            <Link to="/invoices" className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">View All</Link>
          </div>
          
          {stats.recentInvoices.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No invoices generated yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentInvoices.map(inv => (
                <div key={inv.id} className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
                  <div>
                    <h3 className="font-bold text-white">{inv.invoice_no}</h3>
                    <p className="text-sm text-slate-400">{inv.buyer?.company_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">₹{parseFloat(inv.grand_total).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-500">{new Date(inv.invoice_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center">
          <div className="bg-slate-800 p-6 rounded-full mb-4">
            <FileText className="w-12 h-12 text-slate-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to bill?</h2>
          <p className="text-slate-400 mb-6 max-w-sm">Create professional GST invoices with automatic tax calculation and PDF generation.</p>
          <Link to="/invoices/new" className="btn-primary">Generate Invoice</Link>
        </div>
      </div>
    </div>
  );
}
