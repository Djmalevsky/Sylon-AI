"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/agents": "Agents",
  "/clients": "Clients",
  "/calls": "Calls / Transcripts",
  "/phone-numbers": "Phone Numbers",
  "/integrations": "Integrations",
  "/prompts": "Prompt Builder",
  "/billing": "Billing & Usage",
  "/settings": "Settings",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Resolve title — check exact match first, then prefix match for dynamic routes
  let title = PAGE_TITLES[pathname];
  if (!title) {
    if (pathname.startsWith("/clients/")) title = "Client Detail";
    else title = "Sylon AI";
  }

  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="ml-[260px] min-h-screen bg-gray-50">
        <TopBar title={title} />
        {children}
      </main>
    </div>
  );
}
