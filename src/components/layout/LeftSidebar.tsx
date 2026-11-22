import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, Users, Bookmark, FileText } from 'lucide-react';

const LeftSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', icon: Home, path: '/home' },
    { name: 'Explore', icon: Compass, path: '/explore' },
    { name: 'Following', icon: Users, path: '/following' },
    { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks' },
    { name: 'Your Blogs', icon: FileText, path: '/my-blogs' },
  ];

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* Profile Card */}
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl overflow-hidden transition-colors duration-300">
        
        {/* Banner */}
        <div className="h-20 w-full bg-gradient-to-r from-orange-400 to-orange-300 dark:from-orange-700 dark:to-orange-900" />
        
        {/* Profile Info */}
        <div className="px-4 pb-4 relative text-center">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-full bg-blue-600 border-4 border-white dark:border-[#15233B] absolute -top-8 left-1/2 -translate-x-1/2 shadow-sm flex items-center justify-center text-white text-xl font-bold">
            S
          </div>
          <div className="mt-10">
            <h3 className="font-bold text-[#0B192C] dark:text-white">SRMeenal</h3>
            <p className="text-xs text-[#0B192C]/60 dark:text-gray-400 mt-1">Add a headline in your profile settings to stand out.</p>
            
            {/* Stats */}
            <div className="flex justify-between mt-6 pt-4 border-t border-black/5 dark:border-white/10 text-sm">
              <div className="flex justify-between w-full mb-2">
                <span className="text-[#0B192C]/60 dark:text-gray-400">Followers</span>
                <span className="font-bold text-orange-500">2</span>
              </div>
            </div>
            <div className="flex justify-between w-full">
              <span className="text-[#0B192C]/60 dark:text-gray-400">My Posts</span>
              <span className="font-bold text-orange-500">1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 shadow-[0_8px_30px_rgb(249,115,22,0.06)] rounded-2xl p-2 flex flex-col gap-1 transition-colors duration-300">
        {navItems.map((item) => {
          const isActive = currentPath === item.path;
          return (
            <Link 
              key={item.name} 
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all font-medium text-sm ${
                isActive 
                  ? 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400' 
                  : 'text-[#0B192C]/70 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/5 hover:text-orange-500'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default LeftSidebar;