import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";

interface BrandingProps {
  mode?: string;
  onToggleForm?: () => void;
}

export default function AuthBranding({ mode = "login", onToggleForm }: BrandingProps) {
  const isLogin = mode === "login";

  return (
    <div className="w-full h-full p-12 ml-15 xl:px-8 flex flex-col gap-0 relative z-10 transition-colors duration-300">
      
      {/* Logo */}
      <Link to="/" className="flex items-center gap-3 z-10">
        {/* Light Mode Logo */}
        <img
          src="/logo.png"
          alt="WriteSpace Logo"
          className="w-10 h-10 rounded-full block dark:hidden"
        />

        {/* Dark Mode Logo */}
        <img
          src="/logo_light.png"
          alt="WriteSpace Logo"
          className="w-10 h-10 rounded-full hidden dark:block"
        />

        <span className="font-bold text-2xl text-[#0B192C] dark:text-white tracking-tight">
          WriteSpace
        </span>
      </Link>

      {/* Text Area */}
      <div className="z-10 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <h1 className="text-5xl lg:text-6xl font-extrabold text-[#0B192C] dark:text-white leading-tight mb-3 tracking-tight">
              {isLogin ? (
                <>Welcome <span className="relative inline-block text-[#F97316]">
                  back.
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#F97316]" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="6" fill="transparent" strokeLinecap="round" />
                  </svg>
                </span></>
              ) : (
                <>Create an <span className="relative inline-block text-[#F97316]">
                  account
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#F97316]" viewBox="0 0 100 20" preserveAspectRatio="none">
                    <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="6" fill="transparent" strokeLinecap="round" />
                  </svg>
                </span></>
              )}
            </h1>
            <p className="text-[#0B192C]/60 dark:text-gray-400 text-lg max-w-sm mt-3 font-medium transition-colors duration-300">
              {isLogin 
                ? "Continue your creative journey with WriteSpace." 
                : "Join the community of creators and bring your ideas to life."}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ---> REPLACED 3D LAPTOP WITH NEW IMAGE <--- */}
      <div className="relative w-full h-[360px] mt-6 flex items-center justify-center z-10">
        <motion.img 
          src="/login_photo.png" // <-- Make sure your image is named exactly this in the public folder
          alt="WriteSpace 3D Illustration"
          className="w-full h-full object-contain drop-shadow-2xl"
          animate={{ y: [0, -12, 0] }} // Smooth floating effect
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Bottom Link Text */}
      <div className="z-10 text-sm text-[#0B192C]/70 dark:text-gray-400 mt-6 font-medium transition-colors duration-300">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={onToggleForm} className="font-semibold text-[#A855F7] hover:underline">
          {isLogin ? "Sign up" : "Log in"}
        </button>
        <ArrowRight className="w-4 h-4 inline ml-1" />
      </div>
    </div>
  );
}