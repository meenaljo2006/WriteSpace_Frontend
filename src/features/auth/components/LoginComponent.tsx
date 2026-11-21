import React, { useState } from 'react';
import { Mail, Lock, Loader2, Github, Eye, EyeOff, ArrowRight, User } from 'lucide-react';
import { AuthAPI } from '@/features/auth/api/auth.api';
import { useAuth } from '@/app/providers/AuthProvider';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import type { ApiError } from '@/types/ApiError';

interface LoginComponentProps {
  onToggleForm: () => void;
  onForgotPassword: () => void;
}

const LoginComponent: React.FC<LoginComponentProps> = ({ onToggleForm, onForgotPassword }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const { loginState } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error("Please fill in all fields");

    setIsLoading(true);
    try {
      const response = await AuthAPI.login({ email, password });
      loginState(response.user, response.accessToken);
      toast.success("Welcome back!");
      navigate('/home', { replace: true });
    } catch (error: unknown) {
      const err = error as { response?: { data?: ApiError } };
      toast.error(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#0B192C] dark:text-white tracking-tight mb-1 transition-colors duration-300">Login to WriteSpace</h2>
        <p className="text-[#0B192C]/60 dark:text-gray-400 text-sm transition-colors duration-300">Welcome back! Please sign in to continue.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        {/* Email */}
        <div className="relative">
          <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white dark:bg-[#0B192C]/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 pl-11 text-[#0B192C] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-all text-sm shadow-sm"
            placeholder="Email Address"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white dark:bg-[#0B192C]/50 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3.5 pl-11 pr-12 text-[#0B192C] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-all text-sm shadow-sm"
            placeholder="Password"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center">
            <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-gray-300 dark:border-white/20 bg-white dark:bg-[#0B192C]/50 text-[#F97316] focus:ring-[#F97316] cursor-pointer" />
            <label htmlFor="remember-me" className="ml-2 text-sm text-[#0B192C]/70 dark:text-gray-400 cursor-pointer transition-colors duration-300">Remember me</label>
          </div>
          <button type="button" onClick={onForgotPassword} className="text-sm font-medium text-[#A855F7] hover:underline transition-colors">
            Forgot password?
          </button>
        </div>

        <button type="submit" disabled={isLoading} className="mt-2 w-full bg-[#F97316] flex justify-center items-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white hover:bg-[#ea580c] disabled:opacity-60 transition-all shadow-md shadow-orange-500/20">
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-6 mb-5 flex items-center gap-4">
        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/10 transition-colors duration-300"></div>
        <span className="text-[0.65rem] text-gray-400 font-semibold tracking-wider uppercase">Or continue with</span>
        <div className="h-[1px] flex-1 bg-gray-200 dark:bg-white/10 transition-colors duration-300"></div>
      </div>
      
      {/* Social Login */}
      <div className="flex flex-row gap-3">
        <button onClick={AuthAPI.googleLogin} type="button" className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-[#0B192C]/50 border border-gray-200 dark:border-white/10 text-sm font-medium text-[#0B192C] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B192C]/80 transition-colors shadow-sm">
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-[18px]" /> Google
        </button>
        <button onClick={AuthAPI.githubLogin} type="button" className="flex-1 flex justify-center items-center gap-2 py-3 px-4 rounded-xl bg-white dark:bg-[#0B192C]/50 border border-gray-200 dark:border-white/10 text-sm font-medium text-[#0B192C] dark:text-white hover:bg-gray-50 dark:hover:bg-[#0B192C]/80 transition-colors shadow-sm">
          <Github size={18} /> GitHub
        </button>
      </div>
    </div>
  );
};

export default LoginComponent;