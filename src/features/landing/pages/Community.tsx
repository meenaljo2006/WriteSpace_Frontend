import { motion } from 'framer-motion';
import { Users, TrendingUp, MessageSquare, Zap, UserPlus, Award } from 'lucide-react';

const stats = [
  { label: 'Writers', value: '12.4K', icon: Users },
  { label: 'Posts', value: '45.2K', icon: MessageSquare },
  { label: 'Online Now', value: '342', icon: Zap, live: true },
];

const topWriters = [
  { name: 'Aarav Sharma', role: 'Tech Writer', followers: '2.4k', avatar: 'A' },
  { name: 'Meenal Jain', role: 'Frontend Dev', followers: '1.8k', avatar: 'M' },
  { name: 'Rahul Verma', role: 'AI Researcher', followers: '1.2k', avatar: 'R' },
];

const activities = [
  { text: 'Aarav published a new story', time: '2 mins ago', icon: '✍️' },
  { text: 'Meenal followed Rahul Verma', time: '15 mins ago', icon: '🤝' },
  { text: 'Sneha commented on "The Future of AI"', time: '1 hour ago', icon: '💬' },
  { text: 'New member joined: Vikram', time: '2 hours ago', icon: '👋' },
];

export default function Community() {
  return (
    <main className="bg-[#FFFBF5] dark:bg-[#0B192C] text-[#0B192C] dark:text-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20">
        
        {/* --- HEADER --- */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4">
            Join the <span className="text-[#F97316]">Community</span>
          </h1>
          <p className="text-[#0B192C]/70 dark:text-gray-400">
            Connect with fellow writers, discover top creators, and see what's happening right now on WriteSpace.
          </p>
        </div>

        {/* --- STATS BAR --- */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-16 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              key={stat.label} 
              className="flex items-center gap-4 bg-white dark:bg-[#0f213a] px-5 py-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm"
            >
              <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 text-[#F97316] flex items-center justify-center shrink-0">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium flex items-center gap-2">
                  {stat.label} {stat.live && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </p>
                <h3 className="text-2xl font-bold">{stat.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Top Writers */}
          <div className="lg:col-span-7">
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-6 h-6 text-[#F97316]" />
              <h2 className="text-2xl font-bold">Top Writers This Week</h2>
            </div>
            
            <div className="flex flex-col gap-3">
              {topWriters.map((writer, i) => (
                <div key={writer.name} className="group flex items-center justify-between bg-white dark:bg-[#0f213a] px-4 py-3 sm:px-5 sm:py-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-bold text-gray-300 dark:text-gray-600 w-6">#{i + 1}</span>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-400 to-[#F97316] text-white flex items-center justify-center font-bold text-base shadow-inner shrink-0">
                      {writer.avatar}
                    </div>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg leading-tight">{writer.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{writer.role} • {writer.followers} followers</p>
                    </div>
                  </div>
                  <button className="hidden sm:flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-black/10 dark:border-white/20 text-sm font-semibold hover:bg-[#F97316] hover:text-white hover:border-[#F97316] transition-all shrink-0">
                    <UserPlus className="w-4 h-4" /> Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Recent Activity */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp className="w-6 h-6 text-[#F97316]" />
              <h2 className="text-2xl font-bold">Live Activity</h2>
            </div>
            
            <div className="bg-white dark:bg-[#0f213a] p-6 rounded-2xl border border-black/5 dark:border-white/10 shadow-sm">
              <div className="relative border-l-2 border-black/5 dark:border-white/10 ml-4 space-y-7 pb-2">
                {activities.map((act, i) => (
                  <div key={i} className="relative pl-6">
                    {/* Timeline Dot */}
                    <span className="absolute -left-[23px] top-0 w-10 h-10 rounded-full bg-[#FFFBF5] dark:bg-[#0f213a] flex items-center justify-center text-lg border-2 border-black/5 dark:border-white/10">
                      {act.icon}
                    </span>
                    <p className="text-sm font-medium leading-snug">{act.text}</p>
                    <span className="text-xs text-gray-400 mt-1 block">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}