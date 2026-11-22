import { useEffect, useState } from "react";
import { Navigate, useParams, useOutletContext } from "react-router-dom"; // <-- useOutletContext import kiya
import { toast } from "react-toastify";

import { useAuth } from "@/app/providers/AuthProvider";
import { PostsAPI } from "@/features/posts/posts.api";
import { useToggleFollow } from "@/features/users/hooks/useToggleFollow";
import { useUserProfile } from "@/features/users/hooks/useUserProfile";
import type { User } from "@/features/users/types/user.types";
import type { Post } from "@/types/api.types";

import EditProfileModal from "../edit-profile/EditProfileModal";
import ProfileContent from "./ProfileContent";
import ProfileIdentity from "./ProfileIdentity";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user: authUser, isAuthenticated } = useAuth();
  
  const setSidebarData = useOutletContext<(data: any) => void>();

  const isMeRoute = !username || username === "me";
  const targetUsername = isMeRoute ? authUser?.username : username;
  const isOwnProfile = isMeRoute || authUser?.username === targetUsername;

  const {
    profile,
    loading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
    setProfile,
  } = useUserProfile(targetUsername);

  const { toggleFollow, loading: followLoading } = useToggleFollow();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setIsFollowing(profile.isFollowingByMe ?? false);
    setFollowerCount(profile.totalFollowers ?? 0);
  }, [profile]);

  useEffect(() => {
    if (profile && setSidebarData) {
      setSidebarData({ profile, followerCount });
    }
    return () => {
      if (setSidebarData) setSidebarData(null);
    };
  }, [profile, followerCount, setSidebarData]);

  useEffect(() => {
    if (!profile?.id) {
      setPosts([]);
      return;
    }
    let cancelled = false;
    const fetchProfilePosts = async () => {
      try {
        const response = await PostsAPI.getPosts({ authorId: profile.id, limit: 10 });
        if (!cancelled) setPosts(response.posts ?? []);
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to fetch profile posts:", error);
          setPosts([]);
          toast.error("Unable to load profile posts.");
        }
      }
    };
    void fetchProfilePosts();
    return () => { cancelled = true; };
  }, [profile?.id]);

  if (isMeRoute && !isAuthenticated) return <Navigate to="/login" replace />;
  if (isMeRoute && !targetUsername) return <div className="flex h-full items-center justify-center text-stone-500">Loading...</div>;
  if (profileLoading) return <div className="flex h-full items-center justify-center text-stone-500">Loading profile...</div>;

  if (profileError || !profile) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-stone-500">
        <h2 className="text-xl font-bold text-[#0B192C] dark:text-white">Profile not found</h2>
        <button onClick={() => void refetchProfile()} className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600">Try again</button>
      </div>
    );
  }

  const handleToggleFollow = async () => {
    if (followLoading) return;
    const previousFollowing = isFollowing;
    const previousFollowerCount = followerCount;
    const optimisticFollowing = !previousFollowing;
    setIsFollowing(optimisticFollowing);
    setFollowerCount(optimisticFollowing ? previousFollowerCount + 1 : Math.max(previousFollowerCount - 1, 0));
    try {
      const result = await toggleFollow(profile.id);
      const serverFollowing = result.status === "followed";
      if (serverFollowing !== optimisticFollowing) {
        setIsFollowing(serverFollowing);
        setFollowerCount(serverFollowing ? previousFollowerCount + 1 : Math.max(previousFollowerCount - 1, 0));
      }
      setProfile((currentProfile) => currentProfile ? {
          ...currentProfile,
          isFollowingByMe: serverFollowing,
          totalFollowers: serverFollowing ? previousFollowerCount + 1 : Math.max(previousFollowerCount - 1, 0),
        } : currentProfile
      );
    } catch (error) {
      setIsFollowing(previousFollowing);
      setFollowerCount(previousFollowerCount);
      toast.error("Unable to update follow status.");
    }
  };

  const handleProfileUpdate = (updatedUser: Partial<User>) => {
    setProfile((currentProfile) => currentProfile ? { ...currentProfile, ...updatedUser } : currentProfile);
    setIsEditModalOpen(false);
    toast.success("Profile updated successfully.");
  };

  return (
    <div className="w-full pb-10 bg-transparent flex flex-col gap-6">
      
      {/* Profile Header */}
      <div className="bg-white/70 dark:bg-[#15233B]/70 backdrop-blur-md border border-white/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(249,115,22,0.06)]">
        <ProfileIdentity
          profileUser={profile}
          isOwnProfile={isOwnProfile}
          isFollowing={isFollowing}
          onToggleFollow={handleToggleFollow}
          onOpenEditModal={() => setIsEditModalOpen(true)}
        />
      </div>
      

      {/* Posts Content */}
      <ProfileContent
        profileUser={profile}
        posts={posts}
        isFollowing={isFollowing}
      />

      {/* Edit Modal */}
      {isEditModalOpen && isOwnProfile && (
        <EditProfileModal
          user={profile}
          onClose={() => setIsEditModalOpen(false)}
          onUpdate={handleProfileUpdate}
        />
      )}
    </div>
  );
}