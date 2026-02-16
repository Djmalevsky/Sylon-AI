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
    <aside
      className="fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col text-white"
      style={{
        background: "linear-gradient(180deg, #1a1a2e 0%, #16162a 100%)",
        borderRight: "1px solid rgba(108, 92, 231, 0.15)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 pt-6 pb-5">
        <div
          className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px]"
          style={{
            background: "linear-gradient(135deg, #6C5CE7, #a29bfe)",
            boxShadow: "0 4px 12px rgba(108, 92, 231, 0.4)",
          }}
        >
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
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-[10px] text-sm transition-all duration-150 no-underline"
              style={{
                background: isActive ? "rgba(108, 92, 231, 0.25)" : "transparent",
                color: isActive ? "#ffffff" : "rgba(255, 255, 255, 0.75)",
                fontWeight: isActive ? 600 : 400,
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = "transparent";
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[13px] font-bold"
            style={{ background: "linear-gradient(135deg, #6C5CE7, #fd79a8)" }}
          >
            A
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] font-semibold truncate">Alice</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,0.45)" }}>Agency Owner</div>
          </div>
          <LogOut
            size={16}
            className="shrink-0 cursor-pointer"
            style={{ opacity: 0.4 }}
          />
        </div>
      </div>
    </aside>
  );
}