import { useState } from 'react';
import { LogIn, GraduationCap, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { login, register } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await register({ email, password });
        toast.success('Registration successful! Please login.');
        setIsRegisterMode(false);
      } else {
        const response = await login({ email, password });
        const { token, user } = response.data || {};
        if (!token || !user) {
          toast.error('Login succeeded but the response was invalid. Check the server logs.');
          return;
        }
        onLoginSuccess(token, user);
        toast.success(`Welcome back ${user.email.split('@')[0]}!`);
      }
    } catch (error) {
      const fromServer = error.response?.data?.message;
      let message = fromServer;
      if (!message) {
        const code = error.code;
        const msg = error.message || '';
        if (code === 'ERR_NETWORK' || msg === 'Network Error' || code === 'ECONNREFUSED') {
          message =
            'Cannot reach the API. From the project’s server folder run npm start (port 5000), then try again.';
        } else {
          message = msg || 'Something went wrong. Please try again.';
        }
      }
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white overflow-hidden">
      {/* Left side: Professional Gradient Background */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-slate-900 to-primary-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent" />
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

        <div className="relative z-10 flex flex-col items-center justify-center w-full h-full p-20 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 mb-8 shadow-2xl text-white">
            <GraduationCap size={48} strokeWidth={2} />
          </div>
          <h1 className="text-6xl font-black text-white mb-6 tracking-tighter leading-none">
            Welcome to <br /> <span className="text-primary-400">StudyBuddy</span>
          </h1>
          <p className="text-xl text-slate-300 font-medium max-w-sm mx-auto leading-relaxed">
            AI-Powered Learning Assistant
          </p>


        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-12 lg:p-20 bg-white min-h-screen">
        <div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-right-8 duration-700">
          <div className="md:hidden text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200 text-white">
              <GraduationCap size={32} />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight leading-none uppercase">StudyBuddy</h1>
          </div>

          <div className="space-y-3">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-none">
              {isRegisterMode ? 'Get Started' : 'Sign In'}
            </h2>
            <p className="text-slate-500 font-medium text-lg">
              {isRegisterMode ? 'Join our community of fast learners today.' : 'Welcome back! Enter your details to continue.'}
            </p>
          </div>

          <div className="bg-slate-50/50 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <GraduationCap size={120} />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Identification</label>
                <input
                  type="email"
                  required
                  className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all shadow-sm"
                  placeholder="student@studybuddy.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Security Password</label>
                <input
                  type="password"
                  required
                  className="w-full h-16 bg-white border border-slate-200 rounded-2xl px-6 text-slate-900 font-bold placeholder:text-slate-400 focus:ring-4 focus:ring-primary-600/10 focus:border-primary-600 outline-none transition-all shadow-sm"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-16 flex items-center justify-center bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 active:scale-[0.98] transition-all disabled:opacity-70 disabled:pointer-events-none group"
              >
                {isLoading ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <div className="flex items-center space-x-3">
                    <span>{isRegisterMode ? 'Initialize Account' : 'Sign In'}</span>
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            </form>

            <div className="relative my-8 text-center text-xs before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-200 before:-z-0">
              <span className="relative bg-[#fcfdfe] px-4 text-slate-400 font-black uppercase tracking-widest leading-none z-10"></span>
            </div>

            <p className="text-center text-sm text-slate-600 font-bold uppercase tracking-tight">
              {isRegisterMode ? 'Ready to work?' : 'Need an entry?'}
              <button
                onClick={() => setIsRegisterMode(!isRegisterMode)}
                className="ml-2 text-primary-600 font-black hover:text-primary-700 transition-all border-b-2 border-primary-100 hover:border-primary-600 pb-0.5"
              >
                {isRegisterMode ? 'Login Here' : 'Create Free Workspace'}
              </button>
            </p>
          </div>


        </div>
      </div>
    </div>
  );
};

export default Login;
