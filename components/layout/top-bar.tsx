import { Search, Bell, ChevronDown } from "lucide-react";

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b border-gray-100 bg-white px-8 py-4">
      <h1 className="text-[22px] font-bold text-brand-900 tracking-tight">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="flex items-center gap-2 rounded-[10px] bg-gray-50 px-3.5 py-2 w-[220px]">
          <Search size={15} className="text-gray-400" />
          <input
            placeholder="Search..."
            className="border-none bg-transparent text-[13px] text-gray-700 outline-none w-full placeholder:text-gray-400"
          />
        </div>

        {/* Notifications */}
        <div className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-[10px] bg-gray-50 hover:bg-gray-100 transition-colors">
          <Bell size={16} className="text-gray-500" />
          <div className="absolute right-[7px] top-[5px] h-[7px] w-[7px] rounded-full bg-red-500 ring-2 ring-white" />
        </div>

        {/* Avatar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="flex h-[34px] w-[34px] items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-pink-400 text-[13px] font-bold text-white">
            A
          </div>
          <span className="text-sm font-semibold text-gray-700">Alice</span>
          <ChevronDown size={14} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
