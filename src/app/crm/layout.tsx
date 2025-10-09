"use client";

import Sidebar from "./components/Sidebar";
import TopNavbar from "./components/TopNavbar";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <header className="border-b border-gray-200">
           <TopNavbar />
        </header>
      </div>
      <div className="flex h-screen">
        {/* Sidebar */}
        <aside className="border-r border-gray-200">
          <Sidebar />
        </aside>

        {/* Page Content */}
        <main className="flex-1 overf   low-y-auto p-4">{children}</main>
      </div>
    </>
  );
}
