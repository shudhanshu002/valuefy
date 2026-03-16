import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Wallet, History as HistoryIcon, Settings } from 'lucide-react';

const Navbar = () => {
  const { pathname } = useLocation();

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Investments', path: '/holdings', icon: <Wallet size={20} /> },
    { name: 'History', path: '/history', icon: <HistoryIcon size={20} /> },
    { name: 'Model Settings', path: '/edit-model', icon: <Settings size={20} /> },
  ];

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between h-18 items-center">
          <div className="flex items-center gap-3 group">
            <div className="bg-indigo-600 p-2 rounded-xl transform group-hover:rotate-12 transition-transform">
              <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" style={{ animationDuration: '3s' }}></div>
            </div>
            <span className="text-xl font-black text-slate-800 uppercase tracking-tighter">Rebalance<span className="text-indigo-600">AI</span></span>
          </div>

          <div className="flex gap-2">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                  pathname === link.path 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;