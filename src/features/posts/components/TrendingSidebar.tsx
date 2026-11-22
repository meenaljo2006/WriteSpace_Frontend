import React from "react";
import { TrendingUp, MessageSquare, ChevronRight } from "lucide-react";
import { toast } from "react-toastify";
import { useTheme } from "@/app/providers/ThemeProvider";

const TrendingSidebar: React.FC = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const trendingTopics = [
    { tag: "MERN_Stack_2026", posts: "1.2K Discussions" },
    { tag: "System_Design", posts: "830 Responses" },
    { tag: "AI_Engineering", posts: "2.4K Discussions" },
    { tag: "Developer_Log", posts: "112 Responses" },
    { tag: "LeetCode_Daily", posts: "612 Discussions" }
  ];

  const handleComingSoon = () => {
    toast.info("Trending topics feature coming soon!", { theme: isDark ? "dark" : "light" });
  };

  return (
    <aside className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl overflow-hidden transition-colors duration-300">
      
      {/* Header */}
      <div className="p-4 border-b border-black/5 dark:border-white/10 flex items-center gap-2">
        <TrendingUp size={18} className="text-orange-500" />
        <h3 className="text-base font-bold text-[#0B192C] dark:text-white font-sans m-0">
          Trending Topics
        </h3>
      </div>

      {/* List */}
      <div className="flex flex-col">
        {trendingTopics.map((item, idx) => (
          <div 
            key={idx}
            onClick={handleComingSoon}
            className="p-4 flex items-center justify-between cursor-pointer transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/10 group border-b border-black/5 dark:border-white/10 last:border-none"
          >
            <div className="flex gap-3 items-center">
              <span className="text-[#0B192C]/40 dark:text-gray-500 font-semibold text-sm">
                0{idx + 1}
              </span>
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-sm text-[#0B192C] dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  #{item.tag}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#0B192C]/60 dark:text-gray-400">
                  <MessageSquare size={12} /> {item.posts}
                </span>
              </div>
            </div>
            <ChevronRight size={16} className="text-gray-400 group-hover:text-orange-500 transition-colors" />
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div 
        onClick={handleComingSoon}
        className="p-4 border-t border-black/5 dark:border-white/10 text-orange-500 dark:text-orange-400 text-sm font-semibold cursor-pointer transition-colors hover:bg-orange-50 dark:hover:bg-orange-500/10 text-center"
      >
        Show more
      </div>
    </aside>
  );
};

export default TrendingSidebar;