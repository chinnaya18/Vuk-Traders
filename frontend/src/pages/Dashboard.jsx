import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import client from '../api/client';
import { FileText, Users, TrendingUp, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react';

// WhatsApp Images from public folder
const WHATSAPP_IMAGES = [
  "/whatsapp-images/WhatsApp Image 2026-05-02 at 12.56.55 PM.jpeg",
  "/whatsapp-images/WhatsApp Image 2026-05-02 at 12.56.55 PM (1).jpeg",
  "/whatsapp-images/WhatsApp Image 2026-05-02 at 12.56.56 PM.jpeg",
  "/whatsapp-images/WhatsApp Image 2026-05-02 at 12.56.56 PM (1).jpeg",
  "/whatsapp-images/WhatsApp Image 2026-05-02 at 12.56.56 PM (2).jpeg",
  "/whatsapp-images/WhatsApp Image 2026-05-02 at 12.56.57 PM.jpeg"
];

const CAROUSEL_IMAGES = [
  {
    title: "Professional Invoicing",
    description: "Create and manage professional GST invoices",
    color: "from-amber-600 to-amber-900",
    icon: "📋"
  },
  {
    title: "Tax Compliance",
    description: "Automated GST tax calculation and reporting",
    color: "from-emerald-600 to-emerald-900",
    icon: "✓"
  },
  {
    title: "Business Growth",
    description: "Track revenue and manage your clients",
    color: "from-blue-600 to-blue-900",
    icon: "📈"
  },
  {
    title: "Client Management",
    description: "Organize and manage all your buyers",
    color: "from-purple-600 to-purple-900",
    icon: "👥"
  },
  {
    title: "PDF Generation",
    description: "Generate and download professional PDFs",
    color: "from-orange-600 to-orange-900",
    icon: "🖨️"
  }
];

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalInvoices: 0,
    totalBuyers: 0,
    totalRevenue: 0,
    recentInvoices: []
  });
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentWhatsAppSlide, setCurrentWhatsAppSlide] = useState(0);

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

  // Auto-rotate carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate WhatsApp images carousel every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWhatsAppSlide((prev) => (prev + 1) % WHATSAPP_IMAGES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % CAROUSEL_IMAGES.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + CAROUSEL_IMAGES.length) % CAROUSEL_IMAGES.length);
  };

  const nextWhatsAppSlide = () => {
    setCurrentWhatsAppSlide((prev) => (prev + 1) % WHATSAPP_IMAGES.length);
  };

  const prevWhatsAppSlide = () => {
    setCurrentWhatsAppSlide((prev) => (prev - 1 + WHATSAPP_IMAGES.length) % WHATSAPP_IMAGES.length);
  };

  if (loading) return <div className="text-center p-12">Loading...</div>;

  const currentImage = CAROUSEL_IMAGES[currentSlide];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link to="/invoices/new" className="btn-primary flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> New Invoice
        </Link>
      </div>

      {/* Enhanced Image Carousel */}
      <div className="relative overflow-hidden rounded-xl">
        <div className={`bg-gradient-to-br ${currentImage.color} p-12 md:p-16 text-white transition-all duration-500 ease-in-out`}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1">
              <div className="text-6xl mb-4">{currentImage.icon}</div>
              <h2 className="text-3xl md:text-4xl font-bold mb-3">{currentImage.title}</h2>
              <p className="text-lg text-white/90 mb-6">{currentImage.description}</p>
              <Link to="/invoices/new" className="inline-block bg-white text-slate-900 hover:bg-slate-50 font-semibold py-3 px-6 rounded-lg transition-colors">
                Get Started →
              </Link>
            </div>
            <div className="text-8xl opacity-20 flex-shrink-0">
              {currentImage.icon}
            </div>
          </div>
        </div>

        {/* Carousel Controls */}
        <button 
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 p-4">
          {CAROUSEL_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* WhatsApp Images Carousel */}
      <div className="relative overflow-hidden rounded-xl shadow-lg">
        <div className="relative bg-slate-800 p-6 aspect-video flex items-center justify-center">
          <img 
            src={WHATSAPP_IMAGES[currentWhatsAppSlide]}
            alt={`WhatsApp Image ${currentWhatsAppSlide + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Carousel Controls */}
        <button 
          onClick={prevWhatsAppSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Previous image"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button 
          onClick={nextWhatsAppSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-colors z-10"
          aria-label="Next image"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="flex justify-center gap-2 p-4 bg-slate-900/50">
          {WHATSAPP_IMAGES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentWhatsAppSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentWhatsAppSlide 
                  ? 'bg-white w-8' 
                  : 'bg-white/40 w-2 hover:bg-white/60'
              }`}
              aria-label={`Go to image ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-xl border-l-4 border-amber-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-amber-500/20 p-3 rounded-lg">
              <FileText className="w-8 h-8 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Invoices</p>
              <h2 className="text-3xl font-bold text-white">{stats.totalInvoices}</h2>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6 rounded-xl border-l-4 border-emerald-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 p-3 rounded-lg">
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Total Revenue</p>
              <h2 className="text-3xl font-bold text-white">₹{stats.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</h2>
            </div>
          </div>
        </div>

        <div className="glass-card p-6 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-shadow">
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

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 rounded-xl hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Recent Invoices</h2>
            <Link to="/invoices" className="text-amber-400 hover:text-amber-300 text-sm font-medium">View All</Link>
          </div>
          
          {stats.recentInvoices.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No invoices generated yet.</p>
          ) : (
            <div className="space-y-4">
              {stats.recentInvoices.map(inv => (
                <Link key={inv.id} to={`/invoices/${inv.id}`} className="block">
                  <div className="flex justify-between items-center p-4 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer">
                    <div>
                      <h3 className="font-bold text-white">{inv.invoice_no}</h3>
                      <p className="text-sm text-slate-400">{inv.buyer?.company_name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-400">₹{parseFloat(inv.grand_total).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-slate-500">{new Date(inv.invoice_date).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
        
        <div className="glass-card p-6 rounded-xl flex flex-col justify-center items-center text-center hover:shadow-lg transition-shadow">
          <div className="bg-amber-500/20 p-6 rounded-full mb-4">
            <FileText className="w-12 h-12 text-amber-400" />
          </div>
          <h2 className="text-xl font-bold mb-2">Ready to bill?</h2>
          <p className="text-slate-400 mb-6 max-w-sm">Create professional GST invoices with automatic tax calculation, QR codes, and PDF generation.</p>
          <Link to="/invoices/new" className="btn-primary">Generate Invoice</Link>
        </div>
      </div>

      {/* Quick Stats Section */}
      <div className="glass-card p-6 rounded-xl">
        <h3 className="text-lg font-bold mb-4">Quick Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 mb-1">Average Invoice Value</p>
            <p className="text-2xl font-bold text-emerald-400">
              ₹{stats.totalInvoices > 0 ? (stats.totalRevenue / stats.totalInvoices).toLocaleString('en-IN', { maximumFractionDigits: 0 }) : '0'}
            </p>
          </div>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 mb-1">Buyers on File</p>
            <p className="text-2xl font-bold text-blue-400">{stats.totalBuyers}</p>
          </div>
          <div className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50">
            <p className="text-slate-400 mb-1">Invoices This Month</p>
            <p className="text-2xl font-bold text-amber-400">{stats.totalInvoices}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
