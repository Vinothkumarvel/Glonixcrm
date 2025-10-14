"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar with mobile sidebar toggle */}
      <TopNavbar onOpenSidebar={() => setMobileSidebarOpen(true)} />

      <div className="flex flex-1">
        {/* Desktop sidebar (visible md and up) */}
        <div className="hidden md:block border-r border-gray-200">
          <Sidebar />
        </div>

        {/* Mobile sidebar (only visible on small screens) */}
        <div className="md:hidden">
          <Sidebar
            isMobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
          />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
