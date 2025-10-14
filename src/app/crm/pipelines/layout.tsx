"use client";

import { usePathname, useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";

// The order here defines the display order of the tabs
const navItems = ["rfq","feasibility","quotation", "negotiation", "closed-deals", "preprocess", "postprocess", "payment-pending","completed-projects"];

export default function PipelinesLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  // This correctly defaults to 'rfq' if no specific tab is in the URL
  const activeTab = pathname.split("/").pop() || "rfq";

  return (
    <div>
      <nav className="mx-auto bg-white px-6 shadow-sm border-b sticky top-0 z-50">
        <div className="">
          <div className="flex gap-1 overflow-x-auto justify-around">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => router.push(`/crm/pipelines/${item}`)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${
                  activeTab === item
                    ? "text-white border-green-500 bg-blue-900" // Active tab style
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-blue-500" // Inactive tab style
                }`}
              >
                {/* This condition for an icon was for 'dashboard', which isn't in your navItems array. You can ignore or adapt it. */}
                {item === "dashboard" && <BarChart3 size={16} className="inline mr-2" />}
                {/* This correctly capitalizes and formats the tab name */}
                {item.charAt(0).toUpperCase() + item.slice(1).replace("-", " ")}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto px-6 py-8">{children}</main>
    </div>
  );
}