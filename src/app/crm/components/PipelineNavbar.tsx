"use client";

import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Plus } from "lucide-react";
import { useState, useEffect } from "react";

type Pipeline = {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  hasContent: boolean;
};

export default function PipelineNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [allPipelines, setAllPipelines] = useState<Pipeline[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Standard pipelines (always visible)
  const standardPipelines = [
    { id: "rfq", name: "Rfq", path: "/crm/pipelines/rfq" },
    { id: "feasibility", name: "Feasibility", path: "/crm/pipelines/feasibility" },
    { id: "quotation", name: "Quotation", path: "/crm/pipelines/quotation" },
    { id: "negotiation", name: "Negotiation", path: "/crm/pipelines/negotiation" },
    { id: "closed-deals", name: "Closed deals", path: "/crm/pipelines/closed-deals" },
    { id: "preprocess", name: "Preprocess", path: "/crm/pipelines/preprocess" },
    { id: "postprocess", name: "Postprocess", path: "/crm/pipelines/postprocess" },
    { id: "payment-pending", name: "Payment pending", path: "/crm/pipelines/payment-pending" },
    { id: "completed-projects", name: "Completed projects", path: "/crm/pipelines/completed-projects" },
  ];

  useEffect(() => {
    // Load custom pipelines from localStorage
    const stored = localStorage.getItem("hierarchicalPipelines");
    if (stored) {
      try {
        const pipelines: Pipeline[] = JSON.parse(stored);
        // Only show pipelines with content
        const withContent = pipelines.filter(p => p.hasContent);
        setAllPipelines(withContent);
      } catch {
        setAllPipelines([]);
      }
    }
  }, [pathname]); // Reload when route changes

  const isActive = (path: string) => pathname?.startsWith(path);
  const getCurrentPipelineName = () => {
    const current = standardPipelines.find(p => pathname?.startsWith(p.path));
    if (current) return current.name;
    
    const customId = pathname?.split("/").pop();
    const custom = allPipelines.find(p => p.id === customId);
    return custom?.name || "Pipeline";
  };

  return (
    <div className="bg-white border-b shadow-sm sticky top-12 z-40">
      <div className="flex items-center justify-between px-6">
        {/* Horizontal Tab Navigation */}
        <div className="flex items-center gap-1 overflow-x-auto flex-1">
          {/* Standard Pipelines */}
          {standardPipelines.map((pipeline) => (
            <button
              key={pipeline.id}
              onClick={() => router.push(pipeline.path)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${
                isActive(pipeline.path)
                  ? "text-white border-green-500 bg-blue-900"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:border-blue-500"
              }`}
            >
              {pipeline.name}
            </button>
          ))}

          {/* Custom Pipelines with Content */}
          {allPipelines.filter(p => p.hasContent).map((pipeline) => (
            <button
              key={pipeline.id}
              onClick={() => router.push(`/crm/pipelines/custom/${pipeline.id}`)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${
                pathname?.includes(pipeline.id)
                  ? "text-white border-green-500 bg-blue-900"
                  : "text-gray-600 border-transparent hover:text-gray-900 hover:border-blue-500"
              }`}
            >
              {pipeline.name}
            </button>
          ))}
        </div>

        {/* Right Side Actions - Dropdown Menu Only */}
        <div className="flex items-center gap-3 ml-4">
          {/* Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 text-sm border rounded hover:bg-gray-50"
            >
              <span>{getCurrentPipelineName()}</span>
              <ChevronDown size={16} />
            </button>

            {isDropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 mt-2 w-64 bg-white border rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
                  {/* Standard Pipelines Section */}
                  <div className="p-2 border-b">
                    <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Standard Pipelines</p>
                    {standardPipelines.map((pipeline) => (
                      <button
                        key={pipeline.id}
                        onClick={() => {
                          router.push(pipeline.path);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                      >
                        {pipeline.name}
                      </button>
                    ))}
                  </div>

                  {/* Custom Pipelines Section */}
                  {allPipelines.filter(p => p.hasContent).length > 0 && (
                    <div className="p-2">
                      <p className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase">Custom Pipelines</p>
                      {allPipelines.filter(p => p.hasContent).map((pipeline) => (
                        <button
                          key={pipeline.id}
                          onClick={() => {
                            router.push(`/crm/pipelines/custom/${pipeline.id}`);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                        >
                          {pipeline.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
