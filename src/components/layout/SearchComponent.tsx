import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Loader2, FileText } from "lucide-react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { UsersAPI } from "@/features/users/api/users.api";
import type { UserSearchResult } from "@/features/users/api/users.api";
import { SearchAPI } from "@/features/search/api/search.api";
import type { SearchPostResult } from "@/features/search/types/search.types";

interface SearchComponentProps {
  isMobile?: boolean;
  autoFocus?: boolean;
  onCloseMobile?: () => void;
}

const SearchComponent: React.FC<SearchComponentProps> = ({ isMobile, autoFocus, onCloseMobile }) => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [postResults, setPostResults] = useState<SearchPostResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced API Call
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      const q = searchQuery.trim();

      if (q.length < 2) {
        setUserResults([]);
        setPostResults([]);
        setShowDropdown(false);
        return;
      }

      setIsSearching(true);

      const [usersOutcome, postsOutcome] = await Promise.allSettled([
        UsersAPI.searchUsers(q),
        SearchAPI.searchPosts({ q, limit: 5 }),
      ]);

      if (usersOutcome.status === "fulfilled") {
        setUserResults(usersOutcome.value);
      } else {
        console.error("User search failed", usersOutcome.reason);
        setUserResults([]);
      }

      if (postsOutcome.status === "fulfilled") {
        setPostResults(postsOutcome.value.results);
      } else {
        console.error("Post search failed", postsOutcome.reason);
        setPostResults([]);
      }

      setShowDropdown(true);
      setIsSearching(false);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (username: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (onCloseMobile) onCloseMobile();
    navigate(`/profile/${username}`);
  };

  const handlePostClick = (postId: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    if (onCloseMobile) onCloseMobile();
    navigate(`/post/${postId}`);
  };

  return (
    <div ref={searchContainerRef} className={`relative w-full ${isMobile ? 'flex-1' : ''}`}>
      
      {/* ================= INPUT FIELD ================= */}
      <div className="relative flex items-center w-full group">
        
        {/* Yahan z-10, pointer-events-none, aur text-stone-500 add kiya hai */}
        <Search 
          size={isMobile ? 20 : 18} 
          className="absolute left-4 z-10 pointer-events-none text-stone-500 dark:text-stone-400 group-focus-within:text-orange-500 transition-colors duration-200" 
        />
        
        <input
          autoFocus={autoFocus}
          type="text"
          placeholder="Search WriteSpace..."
          value={searchQuery}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          onFocus={() => {
            if (searchQuery.length >= 2) setShowDropdown(true);
          }}
          className={`
            relative z-0
            w-full 
            ${isMobile 
              ? "bg-transparent border-none text-base py-2 pl-11 pr-4" 
              : "bg-white/60 dark:bg-stone-800/60 backdrop-blur-md border border-stone-200/80 dark:border-white/10 rounded-full py-2.5 pl-11 pr-4 shadow-sm shadow-stone-200/50 dark:shadow-none"
            }
            text-sm text-stone-800 dark:text-stone-200 
            placeholder-stone-400 dark:placeholder-stone-500
            focus:outline-none 
            focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/40 
            focus:bg-white dark:focus:bg-stone-900
            transition-all duration-300
          `}
        />
      </div>

      {/* ================= DROPDOWN ================= */}
      {showDropdown && (
        <div
          className={`
            absolute z-[1001] overflow-hidden flex flex-col
            bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl 
            border border-stone-200/80 dark:border-white/10 
            shadow-[0_8px_30px_rgb(0,0,0,0.12)] 
            rounded-xl max-h-[380px] overflow-y-auto
            ${isMobile ? "top-[calc(100%+20px)] -left-[40px] w-[calc(100vw-32px)]" : "top-[calc(100%+8px)] left-0 w-full"}
          `}
        >
          {isSearching ? (
            <div className="p-6 flex justify-center text-stone-500 dark:text-stone-400">
              <Loader2 size={24} className="animate-spin text-orange-500" />
            </div>
          ) : userResults.length === 0 && postResults.length === 0 ? (
            <div className="p-6 text-center text-stone-500 dark:text-stone-400 text-sm">
              No results found for "<span className="font-semibold text-stone-800 dark:text-stone-200">{searchQuery}</span>"
            </div>
          ) : (
            <div className="flex flex-col">
              
              {/* ---------- Users Section ---------- */}
              {userResults.length > 0 && (
                <div>
                  <div className="px-4 pt-3 pb-1 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    People
                  </div>

                  {userResults.map((result) => (
                    <div
                      key={result.id}
                      onClick={() => handleResultClick(result.username)}
                      className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                    >
                      <div className="w-9 h-9 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden shrink-0">
                        <img
                          src={result.profileImageUrl || `https://ui-avatars.com/api/?name=${result.username}`}
                          className="w-full h-full object-cover"
                          alt={result.username}
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {result.fullname}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400">
                          @{result.username}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------- Posts Section ---------- */}
              {postResults.length > 0 && (
                <div className={`${userResults.length > 0 ? "border-t border-stone-200/80 dark:border-white/10" : ""}`}>
                  <div className="px-4 pt-3 pb-1 text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                    Posts
                  </div>

                  {postResults.map((post) => (
                    <div
                      key={post.id}
                      onClick={() => handlePostClick(post.id)}
                      className="flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                    >
                      
                      <div className="w-8 h-8 rounded-lg bg-orange-500/10 dark:bg-orange-500/20 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={16} className="text-orange-500" />
                      </div>

                      <div className="flex flex-col min-w-0 gap-0.5">
                        <span className="text-sm font-semibold text-stone-800 dark:text-stone-200 truncate">
                          {post.title}
                        </span>
                        <span className="text-xs text-stone-500 dark:text-stone-400 line-clamp-1">
                          {post.excerpt || post.subtitle || "—"}
                        </span>
                        <span className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">
                          by {post.author.fullname || post.author.username}
                          {post.readTime ? ` · ${post.readTime} min read` : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ---------- View All Footer ---------- */}
              <div
                onClick={() => {
                  setShowDropdown(false);
                  if (onCloseMobile) onCloseMobile();
                  navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                }}
                className="p-3 text-center text-sm font-semibold text-orange-500 dark:text-orange-400 cursor-pointer border-t border-stone-200/80 dark:border-white/10 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
              >
                View all results for "{searchQuery.trim()}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchComponent;