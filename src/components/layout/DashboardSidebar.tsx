"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Brain, LayoutDashboard, FileText, Grid3X3, Settings,
  LogOut, BarChart3, ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Profile } from "@/types";
import type { User } from "@supabase/supabase-js";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/forms", label: "My Forms", icon: FileText },
  { href: "/templates", label: "Templates", icon: Grid3X3 },
  { href: "/responses", label: "Responses", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

interface DashboardSidebarProps {
  user: User;
  profile: Profile | null;
}

export function DashboardSidebar({ user, profile }: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Failed to sign out");
      return;
    }
    router.push("/");
    router.refresh();
  };

  const displayName = profile?.full_name || user.email?.split("@")[0] || "User";
  const email = user.email || "";
  const initials = displayName.split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase();

  return (
    <aside className="w-64 flex-shrink-0 bg-white border-r border-[rgba(191,200,199,0.3)] flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[rgba(191,200,199,0.2)]">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-[#002e2c] rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-105">
            <Brain className="h-5 w-5 text-[#f9bc60]" />
          </div>
          <span className="font-heading font-black text-lg text-[#002e2c] tracking-tight">Blazion Forms</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-[#002e2c] text-[#fcf9f1]"
                  : "text-[#404847] hover:bg-[#f6f3eb] hover:text-[#002e2c]"
              )}
            >
              <item.icon className={cn("h-4.5 w-4.5 flex-shrink-0", isActive ? "text-[#f9bc60]" : "text-[#707978] group-hover:text-[#002e2c]")} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="h-3.5 w-3.5 ml-auto text-[#f9bc60]" />}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-[rgba(191,200,199,0.2)]">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[#f6f3eb] transition-all group">
          <div className="w-8 h-8 bg-[#002e2c] rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-[#f9bc60]">{initials}</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-[#1c1c17] truncate">{displayName}</div>
            <div className="text-xs text-[#707978] truncate">{email}</div>
          </div>
          <button
            onClick={handleSignOut}
            title="Sign out"
            className="text-[#707978] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
