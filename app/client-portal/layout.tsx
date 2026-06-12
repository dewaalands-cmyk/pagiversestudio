"use client";

import { SessionProvider } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import {
  LayoutDashboard,
  FolderKanban,
  Receipt,
  MessageCircle,
  LogOut,
} from "lucide-react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const NAV = [
  { href: "/client-portal", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/client-portal/projects", label: "Proyek", icon: FolderKanban },
  { href: "/client-portal/invoices", label: "Invoice", icon: Receipt },
  { href: "/client-portal/messages", label: "Pesan", icon: MessageCircle },
];

function ClientNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <div className="flex flex-col h-full bg-navy-deep w-64 border-r border-white/10">
      <div className="px-5 py-4 border-b border-white/10">
        <Logo />
        <p className="text-xs text-slate-label mt-2">Client Portal</p>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon, exact }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive(href, exact)
                ? "bg-mint/15 text-mint"
                : "text-slate-label hover:text-white hover:bg-white/5"
            }`}
          >
            <Icon size={18} />
            {label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <div className="px-3 py-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-mint/20 flex items-center justify-center text-mint font-semibold text-sm">
            {session?.user?.name?.[0]?.toUpperCase() ?? "C"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
            <p className="text-xs text-slate-label truncate">{session?.user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-slate-label hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={18} />
          Keluar
        </button>
      </div>
    </div>
  );
}

export default function ClientPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <div className="flex h-screen bg-cloud-50 dark:bg-navy-deep overflow-hidden">
        <div className="hidden lg:flex">
          <ClientNav />
        </div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="h-14 flex items-center justify-end px-6 bg-white dark:bg-navy-soft border-b border-cloud-200 dark:border-white/10">
            <ThemeToggle />
          </header>
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </SessionProvider>
  );
}
