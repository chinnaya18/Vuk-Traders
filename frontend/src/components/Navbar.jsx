import { Link, useLocation } from 'react-router-dom';
import { FileText, Users, Home, Settings, FilePlus } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path)) 
      ? 'text-amber-400 bg-slate-800' 
      : 'text-slate-300 hover:text-white hover:bg-slate-800';
  };

  return (
    <nav className="glass-card border-b border-slate-700 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Company Name */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <img src="/icon.png" alt="Vuk Traders" className="h-10 w-10 rounded" />
              <span className="font-bold text-xl tracking-tight text-amber-300">VUK TRADERS</span>
            </Link>
          </div>

          {/* Center: Empty Space */}
          <div className="flex-1"></div>

          {/* Right: Navigation Options */}
          <div className="hidden md:block">
            <div className="flex items-baseline space-x-1">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/')}`}>
                <Home className="h-4 w-4" /> Dashboard
              </Link>
              <Link to="/invoices/new" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/invoices/new')}`}>
                <FilePlus className="h-4 w-4" /> New Invoice
              </Link>
              <Link to="/invoices" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${location.pathname === '/invoices' ? isActive('/invoices') : 'text-slate-300 hover:text-white hover:bg-slate-800'}`}>
                <FileText className="h-4 w-4" /> Invoices
              </Link>
              <Link to="/buyers" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/buyers')}`}>
                <Users className="h-4 w-4" /> Buyers
              </Link>
              <Link to="/owner" className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${isActive('/owner')}`}>
                <Settings className="h-4 w-4" /> Settings
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
