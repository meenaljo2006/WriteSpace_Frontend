import React from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';

const RightSidebar: React.FC = () => {
  const topics = [
    { tag: 'MERN_Stack_2026', posts: '1.2K Discussions' },
    { tag: 'System_Design', posts: '830 Responses' },
    { tag: 'AI_Engineering', posts: '2.4K Discussions' },
    { tag: 'Developer_Log', posts: '112 Responses' },
    { tag: 'LeetCode_Daily', posts: '612 Discussions' },
  ];

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Trending Topics Card */}
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl p-5 transition-colors duration-300">
        
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-[#0B192C] dark:text-white">Trending Topics</h3>
        </div>
        
        <div className="flex flex-col gap-1">
          {topics.map((topic, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 dark:hover:bg-orange-500/10 cursor-pointer transition-colors group"
            >
              <div>
                 <p className="text-sm font-bold text-[#0B192C] dark:text-gray-200 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                   #{topic.tag}
                 </p>
                 <p className="text-xs text-[#0B192C]/60 dark:text-gray-400">{topic.posts}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-orange-500 transition-colors" />
            </div>
          ))}
        </div>
        
        <button className="w-full mt-3 text-center text-sm font-semibold text-orange-500 hover:text-orange-600 transition-colors">
            Show more
        </button>
      </div>
    </div>
  );
};

export default RightSidebar;