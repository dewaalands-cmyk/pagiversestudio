"use client";

import { useSession } from "next-auth/react";
import { Menu, Bell } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";

interface AdminHeaderProps {
  title: string;
  onMenuClick?: () => void;
}

export default function AdminHeader({ title, onMenuClick }: AdminHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-navy-soft border-b border-cloud-200 dark:border-white/10 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors"
        >
          <Menu size={22} />
        </button>
        <h1 className="text-lg font-semibold text-navy-deep dark:text-white">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button className="relative p-2 text-slate-muted hover:text-navy-deep dark:hover:text-white transition-colors rounded-lg hover:bg-cloud-100 dark:hover:bg-white/5">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 pl-2 border-l border-cloud-200 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center text-mint font-semibold text-sm">
            {user?.name?.[0]?.toUpperCase() ?? "A"}
          </div>
          <span className="text-sm font-medium text-navy-deep dark:text-white hidden sm:block">
            {user?.name ?? "Admin"}
          </span>
        </div>
      </div>
    </header>
  );
}
