import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ArrowRight, Play, Users, FileText, Layers, Star, Sparkles 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="bg-[#FFFBF5] dark:bg-[#0B192C] font-sans overflow-hidden transition-colors duration-300">
      
      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-0 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          
          {/* ================= LEFT COLUMN (Text) ================= */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex flex-col items-start z-10"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFF0E5] dark:bg-[#1A2B4C] text-[#F97316] font-medium text-sm mb-6 transition-colors duration-300">
              <Sparkles className="w-4 h-4" />
              The new standard for technical writers
            </div>
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-[#0B192C] dark:text-white leading-[1.1] mb-6 transition-colors duration-300">
              Write. Share. <br />
              <span className="relative inline-block text-[#F97316]">
                Connect.
                <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#F97316]" viewBox="0 0 100 20" preserveAspectRatio="none">
                  <path d="M0,15 Q50,0 100,15" stroke="currentColor" strokeWidth="4" fill="transparent" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Paragraph text color */}
            <p className="text-lg text-[#0B192C]/70 dark:text-gray-400 mb-8 max-w-lg leading-relaxed transition-colors duration-300">
              A social blogging platform for developers, engineers and tech enthusiasts. 
              Write insightful blogs, discover new ideas, and grow with a community of creators.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-10">
              <Link to="/register" className="flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#F97316] text-white font-semibold hover:bg-[#ea580c] transition-all duration-300 shadow-xl shadow-orange-500/30 hover:-translate-y-0.5">
                Start Writing - Free
                {/* <ArrowRight className="w-5 h-5" /> */}
              </Link>
              <button className="flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-[#0B192C]/10 dark:border-gray-700 text-[#0B192C] dark:text-white font-semibold hover:border-[#0B192C] dark:hover:border-gray-500 transition-all duration-300 bg-white dark:bg-[#15233B]">
                <Play className="w-5 h-5 fill-[#0B192C] dark:fill-white" />
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <img key={i} src={`https://i.pravatar.cc/100?img=${i+10}`} alt="user" className="w-10 h-10 rounded-full border-2 border-[#FFFBF5] dark:border-[#0B192C] object-cover transition-colors duration-300" />
                ))}
              </div>
              <p className="text-sm font-medium text-[#0B192C]/70 dark:text-gray-400 transition-colors duration-300">
                Join <span className="font-bold text-[#0B192C] dark:text-white">10,000+</span> technical writers <br/>
                sharing knowledge on WriteSpace
              </p>
            </div>
          </motion.div>

          {/* ================= RIGHT COLUMN (3D Image) ================= */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative w-full h-[450px] lg:h-[650px] flex items-center justify-center lg:justify-end mt-10 lg:mt-0"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-400/20 dark:bg-orange-500/10 rounded-full blur-[100px] z-0 transition-colors duration-300"></div>

            {/* THE 3D IMAGE */}
            <motion.img
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src="/hero-laptop.png"
              alt="WriteSpace 3D Laptop Interface"
              className="relative z-10 w-full max-w-[700px] lg:max-w-none lg:w-[130%] xl:w-[140%] h-auto object-contain drop-shadow-2xl lg:-mr-16 dark:opacity-90"
            />
          </motion.div>

        </div>
      </main>
      
    </div>
  );
}