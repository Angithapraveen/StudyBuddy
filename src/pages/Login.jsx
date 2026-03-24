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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 animate-in fade-in duration-700">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4 shadow-lg shadow-primary-200 text-white animate-bounce-subtle">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">StudyBuddy</h1>
          <p className="text-slate-500 font-medium">Your AI-Powered Learning Partner</p>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <h2 className="text-xl font-bold text-slate-800 mb-6">
            {isRegisterMode ? 'Create New Account' : 'Sign in to StudyBuddy'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Email Address</label>
              <input 
                type="email" 
                required
                className="input-field h-12"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1.5 uppercase tracking-wider text-[10px]">Password</label>
              <input 
                type="password" 
                required
                className="input-field h-12"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center btn-primary space-x-2 py-4 shadow-lg shadow-primary-200 disabled:opacity-70 disabled:cursor-not-allowed group transition-all"
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <>
                  {isRegisterMode ? <LogIn size={20} /> : <LogIn size={20} />}
                  <span className="font-bold">{isRegisterMode ? 'Join Now' : 'Access Dashboard'}</span>
                </>
              )}
            </button>
          </form>

          <div className="relative my-8 text-center text-xs before:absolute before:left-0 before:top-1/2 before:w-full before:h-px before:bg-slate-100 before:-z-0">
             <span className="relative bg-white px-4 text-slate-400 font-bold uppercase tracking-widest leading-none z-10">OR</span>
          </div>

          <p className="text-center text-sm text-slate-600 font-medium">
            {isRegisterMode ? 'Already have an account?' : "Don't have an account?"}
            <button 
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="ml-2 text-primary-600 font-black hover:underline transition-all"
            >
              {isRegisterMode ? 'Login Here' : 'Create One Now'}
            </button>
          </p>
        </div>
        
        <p className="text-center mt-8 text-xs text-slate-400 font-bold uppercase tracking-widest">
           Secure • Intelligent • Personal
        </p>
      </div>
    </div>
  );
};

export default Login;
