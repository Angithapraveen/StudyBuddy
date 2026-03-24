import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, History, LogOut, GraduationCap, Github, User } from 'lucide-react';

const Layout = ({ onLogout, user }) => {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-50 px-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-9 h-9 bg-primary-600 rounded-xl text-white shadow-lg shadow-primary-100">
            <GraduationCap size={22} />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight">StudyBuddy</span>
        </div>

        <nav className="hidden md:flex items-center space-x-2">
          <NavLink to="/" className={({ isActive }) => 
            `flex items-center space-x-2 px-5 py-2 rounded-xl transition-all font-bold text-sm uppercase tracking-widest ${
              isActive ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`
          }>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) => 
            `flex items-center space-x-2 px-5 py-2 rounded-xl transition-all font-bold text-sm uppercase tracking-widest ${
              isActive ? 'bg-primary-50 text-primary-600 ring-1 ring-primary-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`
          }>
            <History size={18} />
            <span>Archive</span>
          </NavLink>
        </nav>

        <div className="flex items-center space-x-6">
          <div className="hidden lg:flex items-center space-x-3 px-4 py-1.5 bg-slate-50 rounded-full border border-slate-200">
             <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 shadow-inner">
                <User size={14} />
             </div>
             <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{user?.email?.split('@')[0]}</span>
          </div>
          
          <button 
            onClick={handleLogoutClick}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-red-600 font-black text-xs uppercase tracking-widest hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-16 p-4 md:p-10 overflow-y-auto bg-slate-50/30">
        <div className="max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navbar Bottom */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-white shadow-2xl rounded-2xl border border-slate-200 flex items-center justify-around z-50 ring-8 ring-slate-100/50">
        <NavLink to="/" className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-all ${isActive ? 'text-primary-600 scale-110' : 'text-slate-400'}`
        }>
          <Home size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => 
          `flex flex-col items-center space-y-1 transition-all ${isActive ? 'text-primary-600 scale-110' : 'text-slate-400'}`
        }>
          <History size={22} />
          <span className="text-[9px] font-black uppercase tracking-widest">Notes</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
