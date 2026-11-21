import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#F6F3EC] dark:bg-[#071324] border-t border-[#0B192C]/10 dark:border-gray-800/60 transition-colors duration-300 overflow-hidden">
      
      {/* ================= BACKGROUND DECORATIONS ================= */}
      
      {/* 1. Huge Watermark Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] sm:text-[200px] lg:text-[280px] font-black tracking-tighter text-[#0B192C]/[0.03] dark:text-white/[0.02] whitespace-nowrap select-none pointer-events-none z-0">
        WRITESPACE
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#F97316]/5 dark:bg-[#F97316]/10 rounded-full blur-[100px] z-0 pointer-events-none"></div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-8">
        
        {/* Newsletter Section  */}
        <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto mb-20">
          
          <h3 className="text-3xl md:text-5xl font-extrabold text-[#0B192C] dark:text-white mb-4 tracking-tight">
            Stay in the loop.
          </h3>
          
          <p className="text-[#0B192C]/60 dark:text-gray-400 text-base md:text-lg mb-10 max-w-xl">
            Get new stories and updates from WriteSpace. No spam, just pure knowledge delivered to your inbox.
          </p>
          
          {/* Form */}
          <form className="w-full flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="w-full px-6 py-4 rounded-2xl border border-[#0B192C]/10 dark:border-gray-700 bg-white dark:bg-[#15233B] text-base text-[#0B192C] dark:text-white placeholder-[#0B192C]/40 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 shadow-sm transition-all"
              required
            />
            <button 
              type="submit" 
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-[#F97316] text-white font-semibold text-base hover:bg-[#ea580c] transition-all shadow-xl shadow-orange-500/20 hover:-translate-y-0.5 whitespace-nowrap"
            >
              Subscribe
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* ================= BOTTOM BAR ================= */}
        <div className="pt-8 border-t border-[#0B192C]/10 dark:border-gray-800/60 flex flex-col md:flex-row justify-between items-center gap-4">
          
          <p className="text-sm text-[#0B192C]/50 dark:text-gray-500 font-medium">
            © 2026 WriteSpace. All rights reserved.
          </p>

          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="text-[#0B192C]/60 dark:text-gray-500">Have a question?</span>
            <Link 
              to="/contact" 
              className="text-[#F97316] hover:text-[#ea580c] flex items-center gap-1 group transition-colors"
            >
              Contact us
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
}