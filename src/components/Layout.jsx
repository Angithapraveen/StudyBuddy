import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Home, History, LogOut, GraduationCap, Github, User, Sparkles, CheckCircle } from 'lucide-react';

const Layout = ({ onLogout, user }) => {
  const navigate = useNavigate();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-b border-slate-200 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center w-11 h-11 bg-primary-600 rounded-[1.25rem] text-white shadow-xl shadow-primary-200">
            <GraduationCap size={24} strokeWidth={2.5} />
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-xl font-black text-slate-900 tracking-tight leading-none group flex items-center">
              StudyBuddy
              <Sparkles size={14} className="ml-1.5 text-primary-500 animate-pulse" />
            </span>
            <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] mt-0.5">AI Engine </span>
          </div>
        </div>

        <nav className="hidden md:flex items-center space-x-3">
          <NavLink to="/" className={({ isActive }) =>
            `flex items-center space-x-2.5 px-6 py-2.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${isActive
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`
          }>
            <Home size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/history" className={({ isActive }) =>
            `flex items-center space-x-2.5 px-6 py-2.5 rounded-2xl transition-all font-black text-[11px] uppercase tracking-widest ${isActive
              ? 'bg-slate-900 text-white shadow-lg shadow-slate-200'
              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`
          }>
            <History size={18} />
            <span>Learning Vault</span>
          </NavLink>
        </nav>

        <div className="flex items-center space-x-6">
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="hidden lg:flex items-center space-x-3 pl-4 pr-1 py-1 bg-slate-50 rounded-2xl border border-slate-200 ring-4 ring-slate-100/50 hover:bg-white transition-all group"
            >
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary-600">
                {user?.email?.split('@')[0]}
              </span>
              <div className="w-9 h-9 bg-white border border-slate-300 rounded-xl flex items-center justify-center text-primary-600 shadow-sm group-hover:border-primary-200 group-hover:shadow-md transition-all">
                <User size={18} />
              </div>
            </button>

            {showUserDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowUserDropdown(false)}
                />
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className="w-20 h-20 bg-primary-50 rounded-[2rem] flex items-center justify-center text-primary-600 shadow-inner">
                      <User size={40} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-lg font-black text-slate-900 tracking-tight leading-none capitalize">
                        {user?.email?.split('@')[0]}
                      </h4>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                        Academic Profile
                      </p>
                    </div>
                    
                    <div className="w-full h-px bg-slate-200 my-2" />
                    
                    <div className="w-full space-y-4 text-left">
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Contact Email</span>
                        <p className="text-sm font-bold text-slate-700 break-all">{user?.email}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Account Status</span>
                        <div className="flex items-center space-x-2 text-emerald-600">
                          <CheckCircle size={14} />
                          <p className="text-sm font-bold">Premium Workspace</p>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleLogoutClick}
                      className="w-full mt-4 flex items-center justify-center space-x-2 p-4 bg-red-50 text-red-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-200 hover:border-red-600"
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleLogoutClick}
            className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-2xl text-slate-600 hover:text-red-600 font-black text-[11px] uppercase tracking-widest hover:bg-red-50 transition-all border border-transparent hover:border-red-200"
          >
            <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 mt-20 p-6 md:px-8 md:py-12 bg-white">
        <div className="max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Mobile Navbar Bottom */}
      <nav className="md:hidden fixed bottom-8 left-8 right-8 h-20 bg-slate-900/90 backdrop-blur-2xl shadow-2xl rounded-3xl flex items-center justify-around z-50 ring-8 ring-white/10 px-8">
        <NavLink to="/" className={({ isActive }) =>
          `flex flex-col items-center space-y-1.5 transition-all ${isActive ? 'text-primary-400 scale-110' : 'text-slate-400 opacity-60'}`
        }>
          <Home size={24} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Home</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) =>
          `flex flex-col items-center space-y-1.5 transition-all ${isActive ? 'text-primary-400 scale-110' : 'text-slate-400 opacity-60'}`
        }>
          <History size={24} />
          <span className="text-[8px] font-black uppercase tracking-[0.2em]">Vault</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;

