import { useState } from 'react';
import { Search, Flame, Clock, TrendingUp, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

const dummyPosts = [
  { id: 1, title: 'The Future of AI in Web Development', author: 'Aarav Sharma', tag: 'Technology', likes: 120, time: '2 hours ago' },
  { id: 2, title: 'Why I switched to Tailwind CSS 4', author: 'Sneha Kapoor', tag: 'Design', likes: 89, time: '5 hours ago' },
  { id: 3, title: 'Understanding React 19 Compiler', author: 'Rahul Verma', tag: 'Programming', likes: 230, time: '1 day ago' },
//   { id: 4, title: 'A guide to Minimalist Living', author: 'Sneha Kapoor', tag: 'Life', likes: 45, time: '3 hours ago' },
];

const categories = ['All', 'Technology', 'Design', 'Programming', 'Life', 'AI'];

export default function Explore() {
  const [activeTab, setActiveTab] = useState('Trending');
  const [activeCategory, setActiveCategory] = useState('All');

  return (
    <main className="bg-[#FFFBF5] dark:bg-[#0B192C] text-[#0B192C] dark:text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        
        {/* 1. Header & Search */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Discover <span className="text-[#F97316]">Stories</span>
          </h1>
          <p className="text-[#0B192C]/70 dark:text-gray-400 mb-8">
            Explore trending topics, find new writers, and read what the community is talking about.
          </p>
          
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#F97316] transition-colors" />
            <input 
              type="text" 
              placeholder="Search posts, tags, or authors..." 
              className="w-full pl-14 pr-6 py-4 rounded-full bg-white dark:bg-[#0f213a] border border-black/5 dark:border-white/10 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F97316]/50 transition-all text-base"
            />
          </div>
        </div>

        {/* 2. Filter Bar & Categories */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-black/5 dark:border-white/10 pb-4">
          {/* Sort Tabs */}
          <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1 rounded-full">
            {[{ name: 'Trending', icon: Flame }, { name: 'Latest', icon: Clock }, { name: 'Top', icon: TrendingUp }].map((tab) => (
              <button
                key={tab.name}
                onClick={() => setActiveTab(tab.name)}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  activeTab === tab.name 
                    ? 'bg-white dark:bg-[#0f213a] text-[#F97316] shadow-sm' 
                    : 'text-gray-500 hover:text-black dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.name}
              </button>
            ))}
          </div>

          {/* Categories (Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 hide-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap border transition-all ${
                  activeCategory === cat
                    ? 'border-[#F97316] text-[#F97316] bg-orange-500/5'
                    : 'border-black/10 dark:border-white/10 hover:border-black/30 dark:hover:border-white/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Main Grid Feed */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyPosts.map((post, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={post.id} 
              className="group rounded-2xl bg-white dark:bg-[#0f213a] border border-black/5 dark:border-white/10 p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col h-full"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="px-3 py-1 rounded-full bg-[#F97316]/10 text-[#F97316] text-xs font-bold">
                  {post.tag}
                </span>
                <span className="text-xs text-gray-400">{post.time}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 group-hover:text-[#F97316] transition-colors line-clamp-2">
                {post.title}
              </h3>
              <p className="text-sm text-[#0B192C]/70 dark:text-gray-400 mb-6 line-clamp-3 flex-grow">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <span className="text-sm font-medium">{post.author}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-500">
                  ❤️ {post.likes}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 4. Load More Button (Agar infinite scroll nahi lagate toh) */}
        <div className="mt-12 text-center">
          <button className="px-8 py-3 rounded-full border border-black/10 dark:border-white/10 font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition">
            Load More Stories
          </button>
        </div>

      </div>
    </main>
  );
}