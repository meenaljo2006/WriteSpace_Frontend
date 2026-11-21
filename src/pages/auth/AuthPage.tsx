import React, { useState, useEffect } from "react";
import LoginComponent from "@/features/auth/components/LoginComponent";
import RegisterComponent from "@/features/auth/components/RegisterComponent";
import ForgotPasswordComponent from "@/features/auth/components/ForgotPasswordComponent";
import ResetPasswordComponent from "@/features/auth/components/ResetPasswordComponent";
import AuthBranding from "@/features/auth/components/AuthBranding";

type AuthMode = 'login' | 'register' | 'forgot' | 'reset';

interface AuthPageProps {
  initialMode?: AuthMode;
}

const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login' }) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  return (
    <div className="relative flex min-h-screen w-full font-sans bg-[#FFF9F5] dark:bg-[#0B192C] overflow-hidden transition-colors duration-300">
      
      {/* ================= BACKGROUND ORGANIC CURVES ================= */}
      <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-[#FFE8D6] dark:bg-[#A855F7]/10 rounded-full z-0 pointer-events-none transition-colors duration-300 blur-[100px]"></div>
      <div className="absolute bottom-[-30%] right-[-10%] w-[80vw] h-[80vw] bg-[#FFDAB9] dark:bg-[#F97316]/10 rounded-full z-0 pointer-events-none opacity-50 transition-colors duration-300 blur-[100px]"></div>
      <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-[#F3E8FF] dark:bg-[#4C1D95]/20 rounded-full filter blur-[80px] z-0 pointer-events-none opacity-60 transition-colors duration-300"></div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 flex w-full">
        
        {/* LEFT SIDE - Branding */}
        <div className="hidden lg:flex lg:w-1/2 relative">
          <AuthBranding 
            mode={mode} 
            onToggleForm={() => setMode(mode === 'login' ? 'register' : 'login')} 
          />
        </div>

        {/* RIGHT SIDE - Glass Form Card */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 py-10 relative">
          
          {/* Mobile Logo */}
          <div className="lg:hidden absolute top-8 left-8 flex items-center gap-2">
            <img src="/logo_light.png" alt="Logo" className="w-8 h-8 rounded-full dark:hidden" />
            <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-full hidden dark:block" />
            <span className="font-bold text-xl text-[#0B192C] dark:text-white">WriteSpace</span>
          </div>

          {/* THE FROSTED CARD */}
          <div className="w-full max-w-[420px] bg-white/60 dark:bg-[#1A1433]/60 backdrop-blur-2xl rounded-[2rem] p-8 sm:p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/80 dark:border-white/10 relative z-20 transition-colors duration-300">
            {mode === 'login' && <LoginComponent onToggleForm={() => setMode('register')} onForgotPassword={() => setMode('forgot')} />}
            {mode === 'register' && <RegisterComponent onToggleForm={() => setMode('login')} />}
            {mode === 'forgot' && <ForgotPasswordComponent onBackToLogin={() => setMode('login')} />}
            {mode === 'reset' && <ResetPasswordComponent />}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AuthPage;