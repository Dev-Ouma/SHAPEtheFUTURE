"use client";

import React from "react";
import AdminGlobalSearch from "./AdminGlobalSearch";
import { Bell, UserCircle } from "lucide-react";

const Header = () => {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <AdminGlobalSearch />

      <div className="flex items-center space-x-6">
        <button className="relative text-slate-400 hover:text-primary transition-colors">
          <Bell size={20} />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full" />
        </button>
        
        <div className="flex items-center space-x-3 border-l border-slate-200 pl-6">
          <div className="text-right">
            <p className="text-sm font-black text-primary-darker">Admin User</p>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">System Manager</p>
          </div>
          <div className="w-10 h-10 bg-slate-200 flex items-center justify-center">
            <UserCircle size={24} className="text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
