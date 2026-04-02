"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Lock, Bell, Trash2, Loader2, CheckCircle2, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { profileSchema, changePasswordSchema, type ProfileFormData, type ChangePasswordFormData } from "@/lib/validations";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import type { User as SupabaseUser } from "@supabase/supabase-js";

type SettingsTab = "profile" | "account" | "notifications";

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data);
    };
    load();
  }, [router]);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: { full_name: profile?.full_name || "" },
  });

  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const handleProfileSave = async (data: ProfileFormData) => {
    if (!user) return;
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ full_name: data.full_name }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    setProfile(prev => prev ? { ...prev, full_name: data.full_name } : prev);
    toast.success("Profile updated!");
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("bucket", "avatars");
    fd.append("folder", user.id);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (data.error) { toast.error(data.error); setUploading(false); return; }

    const supabase = createClient();
    await supabase.from("profiles").update({ avatar_url: data.data.url }).eq("id", user.id);
    setProfile(prev => prev ? { ...prev, avatar_url: data.data.url } : prev);
    toast.success("Avatar updated!");
    setUploading(false);
  };

  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: data.new_password });
    if (error) { toast.error(error.message); return; }
    toast.success("Password updated!" );
    passwordForm.reset();
  };

  const handleDeleteAccount = async () => {
    toast.error("Please contact support to delete your account.");
    setDeleteConfirm(false);
  };

  const TABS: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: "profile", label: "Profile", icon: User },
    { id: "account", label: "Account", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const initials = (profile?.full_name || "U").split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="font-heading font-black text-3xl text-[#1c1c17] mb-8">Settings</h1>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 flex-shrink-0">
          <nav className="space-y-1">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.id ? "bg-[#002e2c] text-white" : "text-[#404847] hover:bg-[#f6f3eb]"
                )}
              >
                <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-[#f9bc60]" : "text-[#707978]")} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-6">
                <h2 className="font-heading font-bold text-lg text-[#1c1c17] mb-5">Profile Information</h2>

                {/* Avatar */}
                <div className="flex items-center gap-5 mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#002e2c] flex items-center justify-center overflow-hidden flex-shrink-0">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-bold text-[#f9bc60]">{initials}</span>
                    )}
                  </div>
                  <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-[rgba(191,200,199,0.5)] rounded-xl text-sm font-medium text-[#404847] hover:bg-[#f6f3eb] transition-colors">
                    {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {uploading ? "Uploading..." : "Upload Photo"}
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="sr-only" />
                  </label>
                </div>

                <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Full Name</label>
                    <input
                      {...profileForm.register("full_name")}
                      className="w-full px-4 py-3 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]"
                    />
                    {profileForm.formState.errors.full_name && (
                      <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.full_name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1c1c17] mb-1.5">Email</label>
                    <input value={user?.email || ""} disabled className="w-full px-4 py-3 rounded-xl border border-[rgba(191,200,199,0.3)] text-sm text-[#707978] bg-[#f6f3eb]" />
                  </div>
                  <button type="submit" disabled={profileForm.formState.isSubmitting} className="px-6 py-2.5 bg-[#002e2c] text-white rounded-xl text-sm font-semibold hover:bg-[#004643] transition-colors disabled:opacity-60 flex items-center gap-2">
                    {profileForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Save Changes
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "account" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-6">
                <h2 className="font-heading font-bold text-lg text-[#1c1c17] mb-5">Change Password</h2>
                <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                  {(["new_password", "confirm_password"] as const).map(field => (
                    <div key={field}>
                      <label className="block text-sm font-medium text-[#1c1c17] mb-1.5 capitalize">
                        {field === "new_password" ? "New Password" : "Confirm Password"}
                      </label>
                      <input type="password" {...passwordForm.register(field)} className="w-full px-4 py-3 rounded-xl border border-[rgba(191,200,199,0.5)] text-sm text-[#1c1c17] outline-none focus:ring-2 focus:ring-[#002e2c]" />
                      {passwordForm.formState.errors[field] && (
                        <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors[field]?.message}</p>
                      )}
                    </div>
                  ))}
                  <button type="submit" disabled={passwordForm.formState.isSubmitting} className="px-6 py-2.5 bg-[#002e2c] text-white rounded-xl text-sm font-semibold hover:bg-[#004643] transition-colors disabled:opacity-60 flex items-center gap-2">
                    {passwordForm.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Update Password
                  </button>
                </form>
              </div>

              {/* Danger Zone */}
              <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
                <h2 className="font-heading font-bold text-lg text-red-700 mb-2">Danger Zone</h2>
                <p className="text-sm text-red-600 mb-4">Permanently delete your account and all data.</p>
                {!deleteConfirm ? (
                  <button onClick={() => setDeleteConfirm(true)} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors flex items-center gap-2">
                    <Trash2 className="h-4 w-4" /> Delete Account
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={() => setDeleteConfirm(false)} className="px-4 py-2 border border-red-300 text-red-700 rounded-xl text-sm font-medium">Cancel</button>
                    <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors">Yes, delete everything</button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-[rgba(191,200,199,0.3)] p-6">
              <h2 className="font-heading font-bold text-lg text-[#1c1c17] mb-5">Email Notifications</h2>
              <div className="space-y-4">
                {[
                  { key: "response_notifications", label: "New Response Alerts", desc: "Get an email when someone fills your form" },
                  { key: "weekly_digest", label: "Weekly Digest", desc: "Summary of form activity every Monday" },
                  { key: "product_updates", label: "Product Updates", desc: "New features and improvements from Blazion" },
                  { key: "security_alerts", label: "Security Alerts", desc: "Sign-in from new devices (always on)", disabled: true },
                ].map(({ key, label, desc, disabled }) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-[rgba(191,200,199,0.2)] last:border-0">
                    <div>
                      <div className="text-sm font-medium text-[#1c1c17]">{label}</div>
                      <div className="text-xs text-[#707978]">{desc}</div>
                    </div>
                    <button disabled={disabled} className={cn("w-10 h-6 rounded-full flex items-center px-1 transition-all", disabled ? "bg-[#002e2c] justify-end opacity-70 cursor-not-allowed" : "bg-[#002e2c] justify-end")}>
                      <div className="w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
