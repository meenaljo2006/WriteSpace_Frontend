import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Image as ImageIcon,
  User as UserIcon,
  Link as LinkIcon,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";

import { useUpdateProfile } from "@/features/users/hooks/useUpdateProfile";
import type {
  SocialLinks,
  UpdateProfilePayload,
  User,
} from "@/features/users/types/user.types";

interface EditProfileModalProps {
  user: User;
  onClose: () => void;
  onUpdate: (updatedUser: Partial<User>) => void;
}

type TabId = "basic" | "socials" | "images";

interface PersonalInfoState {
  fullname: string;
  headline: string;
  bio: string;
  location: string;
}

interface SocialLinksState {
  website: string;
  github: string;
  twitter: string;
  linkedin: string;
  instagram: string;
  youtube: string;
  facebook: string;
  leetcode: string;
  codeforces: string;
  geeksforgeeks: string;
}

interface FileState {
  profileImage?: File;
  bannerImage?: File;
}

interface PreviewState {
  profile: string | null;
  banner: string | null;
}

const SOCIAL_FIELDS: Array<keyof SocialLinksState> = [
  "website",
  "github",
  "twitter",
  "linkedin",
  "instagram",
  "youtube",
  "facebook",
  "leetcode",
  "codeforces",
  "geeksforgeeks",
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  user,
  onClose,
  onUpdate,
}) => {
  const { updateProfile, loading } = useUpdateProfile();

  const [activeTab, setActiveTab] = useState<TabId>("basic");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfoState>({
    fullname: user.fullname || "",
    headline: user.headline || "",
    bio: user.bio || "",
    location: user.location || "",
  });

  const [socialLinks, setSocialLinks] = useState<SocialLinksState>({
    website: user.website || "",
    github: user.github || "",
    twitter: user.twitter || "",
    linkedin: user.linkedin || "",
    instagram: user.instagram || "",
    youtube: user.youtube || "",
    facebook: user.facebook || "",
    leetcode: user.leetcode || "",
    codeforces: user.codeforces || "",
    geeksforgeeks: user.geeksforgeeks || "",
  });

  const [files, setFiles] = useState<FileState>({
    profileImage: undefined,
    bannerImage: undefined,
  });

  const [previews, setPreviews] = useState<PreviewState>({
    profile: user.profileImageUrl || null,
    banner: user.bannerImageUrl || null,
  });

  // Clean up object URLs
  useEffect(() => {
    return () => {
      if (previews.profile?.startsWith("blob:")) URL.revokeObjectURL(previews.profile);
      if (previews.banner?.startsWith("blob:")) URL.revokeObjectURL(previews.banner);
    };
  }, [previews.profile, previews.banner]);

  // Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, loading]);

  const handlePersonalChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setPersonalInfo((previous) => ({ ...previous, [name]: value }));
  };

  const handleSocialChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setSocialLinks((previous) => ({ ...previous, [name]: value }));
  };

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: keyof FileState
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    setFiles((previous) => ({ ...previous, [type]: file }));
    setPreviews((previous) => ({
      ...previous,
      [type === "profileImage" ? "profile" : "banner"]: previewUrl,
    }));
  };

  const normalizeSocialUrl = (value: string): string => {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const buildSocialLinks = (): SocialLinks => {
    const result: SocialLinks = {};
    for (const field of SOCIAL_FIELDS) {
      result[field] = normalizeSocialUrl(socialLinks[field]);
    }
    return result;
  };

  const validatePersonalInfo = (): boolean => {
    const fullname = personalInfo.fullname.trim();
    if (fullname.length < 3) {
      toast.error("Full name must be at least 3 characters.");
      setActiveTab("basic");
      return false;
    }
    if (personalInfo.headline.length > 200) {
      toast.error("Headline cannot exceed 200 characters.");
      setActiveTab("basic");
      return false;
    }
    if (personalInfo.location.length > 100) {
      toast.error("Location cannot exceed 100 characters.");
      setActiveTab("basic");
      return false;
    }
    if (personalInfo.bio.length > 500) {
      toast.error("Bio cannot exceed 500 characters.");
      setActiveTab("basic");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (loading) return;
    if (!validatePersonalInfo()) return;

    try {
      const payload: UpdateProfilePayload = {
        personal_info: {
          fullname: personalInfo.fullname.trim(),
          headline: personalInfo.headline.trim(),
          location: personalInfo.location.trim(),
          bio: personalInfo.bio.trim(),
        },
        social_links: buildSocialLinks(),
        profileImage: files.profileImage,
        bannerImage: files.bannerImage,
      };

      const updatedUser = await updateProfile(user.id, payload);
      toast.success("Profile updated successfully.");
      onUpdate(updatedUser);
      onClose();
    } catch (error: unknown) {
      console.error("Profile update failed:", error);
      const apiError = error as { response?: { data?: { message?: string } } };
      toast.error(apiError.response?.data?.message || "Failed to update profile.");
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm sm:p-6 animate-in fade-in duration-200">
    
      {/* MAIN MODAL CONTAINER */}
      <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-white/80 bg-white/95 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#15233B]/95 animate-in zoom-in-95 duration-200">
        
        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-stone-200/60 px-6 py-5 dark:border-white/10 sm:px-8">
          <div>
            <h2 className="text-xl font-bold text-[#0B192C] dark:text-white">Edit Profile</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">Make your profile stand out.</p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-600 dark:hover:bg-white/5 dark:hover:text-stone-200 transition-colors disabled:opacity-50"
          >
            <X size={22} />
          </button>
        </div>

        {/* TABS */}
        <div className="shrink-0 border-b border-stone-200/60 px-6 dark:border-white/10 sm:px-8">
          <div className="flex gap-6">
            {[
              { id: "basic", label: "Basic Info", icon: UserIcon },
              { id: "socials", label: "Social Links", icon: LinkIcon },
              { id: "images", label: "Images", icon: ImageIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                disabled={loading}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-500"
                    : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-8 sm:px-8">
          <div className="mx-auto max-w-2xl">
            
            {/* --- TAB: BASIC INFO --- */}
            {activeTab === "basic" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B192C] dark:text-stone-200">Full Name</label>
                  <input
                    name="fullname"
                    value={personalInfo.fullname}
                    onChange={handlePersonalChange}
                    type="text"
                    maxLength={100}
                    placeholder="John Doe"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                  <p className="mt-1.5 text-xs text-stone-400">Minimum 3 characters.</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B192C] dark:text-stone-200">Headline</label>
                  <input
                    name="headline"
                    value={personalInfo.headline}
                    onChange={handlePersonalChange}
                    type="text"
                    maxLength={200}
                    placeholder="Frontend Developer at XYZ"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                  <p className="mt-1.5 text-xs text-stone-400 text-right">{personalInfo.headline.length}/200</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B192C] dark:text-stone-200">Location</label>
                  <input
                    name="location"
                    value={personalInfo.location}
                    onChange={handlePersonalChange}
                    type="text"
                    maxLength={100}
                    placeholder="Dubai, UAE"
                    className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                  <p className="mt-1.5 text-xs text-stone-400 text-right">{personalInfo.location.length}/100</p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-[#0B192C] dark:text-stone-200">Bio</label>
                  <textarea
                    name="bio"
                    value={personalInfo.bio}
                    onChange={handlePersonalChange}
                    rows={4}
                    maxLength={500}
                    placeholder="Tell us about yourself..."
                    className="w-full resize-none rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                  />
                  <p className="mt-1.5 text-xs text-stone-400 text-right">{personalInfo.bio.length}/500</p>
                </div>
              </div>
            )}

            {/* --- TAB: SOCIAL LINKS --- */}
            {activeTab === "socials" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                  Enter your profile URLs. For example: https://github.com/username
                </p>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {SOCIAL_FIELDS.map((key) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-bold text-[#0B192C] dark:text-stone-200 capitalize">
                        {key}
                      </label>
                      <input
                        name={key}
                        value={socialLinks[key]}
                        onChange={handleSocialChange}
                        type="text"
                        placeholder={`${key}.com/yourusername`}
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 outline-none transition-all focus:border-orange-500/50 focus:ring-2 focus:ring-orange-500/20 dark:border-white/10 dark:bg-black/20 dark:text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TAB: IMAGES --- */}
            {activeTab === "images" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                
                {/* Profile Avatar */}
                <div>
                  <label className="mb-3 block text-sm font-bold text-[#0B192C] dark:text-stone-200">Profile Avatar</label>
                  <div className="flex items-center gap-6">
                    <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg dark:border-stone-800 bg-stone-100 dark:bg-stone-900 flex items-center justify-center">
                      {previews.profile ? (
                        <img src={previews.profile} alt="Avatar" className="h-full w-full object-cover" />
                      ) : (
                        <UserIcon size={32} className="text-stone-400" />
                      )}
                    </div>
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        id="avatar-upload"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "profileImage")}
                        disabled={loading}
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 shadow-sm hover:bg-stone-50 dark:border-white/10 dark:bg-[#1C2A45] dark:text-white dark:hover:bg-[#233454]"
                      >
                        <Upload size={16} /> Upload Avatar
                      </label>
                      <p className="mt-2 text-xs text-stone-400">JPG, PNG or WEBP. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                {/* Banner */}
                <div>
                  <label className="mb-3 block text-sm font-bold text-[#0B192C] dark:text-stone-200">Cover Banner</label>
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-stone-200 bg-stone-100 shadow-sm dark:border-white/10 dark:bg-stone-900 group">
                    {previews.banner ? (
                      <img src={previews.banner} alt="Banner" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full flex-col items-center justify-center text-stone-400">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-sm">No banner selected</span>
                      </div>
                    )}
                    
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <input
                        type="file"
                        accept="image/*"
                        id="banner-upload"
                        className="hidden"
                        onChange={(e) => handleFileChange(e, "bannerImage")}
                        disabled={loading}
                      />
                      <label
                        htmlFor="banner-upload"
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-stone-800 shadow-lg hover:bg-stone-100"
                      >
                        <Upload size={16} /> Change Banner
                      </label>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-stone-400">Recommended size: 1500x500px. Max 5MB.</p>
                </div>

              </div>
            )}

          </div>
        </div>

        {/* FOOTER */}
        <div className="shrink-0 border-t border-stone-200/60 bg-white/50 px-6 py-4 backdrop-blur-md dark:border-white/10 dark:bg-black/10 sm:px-8">
          <div className="mx-auto flex max-w-2xl items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-stone-200 bg-transparent px-6 py-2.5 text-sm font-bold text-stone-600 transition-colors hover:bg-stone-100 disabled:opacity-50 dark:border-white/10 dark:text-stone-300 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-orange-500/20 transition-all hover:bg-orange-600 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

      </div>
    </div>,
    document.body
  );
};

export default EditProfileModal;