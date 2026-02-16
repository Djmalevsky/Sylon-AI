"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  Users,
  Phone,
  Puzzle,
  Sparkles,
  CreditCard,
  Settings,
  Zap,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/calls", label: "Calls / Transcripts", icon: Phone },
  { href: "/integrations", label: "Integrations", icon: Puzzle },
  { href: "/prompts", label: "Prompt Builder", icon: Sparkles },
  { href: "/billing", label: "Billing & Usage", icon: CreditCard },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col border-r border-brand-500/15 bg-gradient-to-b from-brand-900 to-brand-950 text-white">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5">
        <div className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-gradient-to-br from-brand-500 to-brand-400 shadow-[0_4px_12px_rgba(108,92,231,0.4)]">
          <Zap size={20} />
        </div>
        <span className="text-xl font-bold tracking-tight">Sylon AI</span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-0.5 px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "sidebar-link",
                isActive ? "sidebar-link-active" : "sidebar-link-inactive"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pink-400 text-[13px] font-bold">
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">Alice</div>
            <div className="text-[11px] text-white/40">Agency Owner</div>
          </div>
          <LogOut
            size={16}
            className="shrink-0 opacity-40 cursor-pointer hover:opacity-70 transition-opacity"
          />
        </div>
      </div>
    </aside>
  );
}
