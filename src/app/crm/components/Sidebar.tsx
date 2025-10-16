"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Layers,
  Users,
  BookOpen,
  Box,
  Calendar,
  Settings,
  Plus,
  Flag,
} from "lucide-react";
import { HierarchicalPipeline, pipelineHelpers, STANDARD_PIPELINE_STAGES, ActivityLog } from "@/types/pipeline";
import PipelineTreeView from "./PipelineTreeView";

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: React.ComponentType<{ size?: number }>;
};

function getStorageKeyForTab(tab: string) {
  const map: Record<string, string> = {
    rfq: "rfqData",
    feasibility: "feasibilityData",
    quotation: "quotationData",
    negotiation: "negotiationData",
    "closed-deals": "closedDealsData",
    preprocess: "preprocessData",
    postprocess: "postprocessData",
    "payment-pending": "paymentPendingData",
    "completed-projects": "completedProjectsData",
  };
  return map[tab] || "";
}

const NAV_ITEMS: NavItem[] = [
  {id: "dashboard", label: "Dashboard", href: "/crm", Icon: Flag },
  { id: "contacts", label: "Contacts", href: "/crm/contacts", Icon: Users },
  {
    id: "companies",
    label: "Companies",
    href: "/crm/company",
    Icon: BookOpen,
  },
  { id: "products", label: "Products", href: "", Icon: Box },
  {
    id: "activities",
    label: "Activities",
    href: "",
    Icon: Calendar,
  },
  { id: "reports", label: "Reports", href: "", Icon: Flag },
  { id: "admin", label: "Admin", href: "/crm/admin", Icon: Settings },
  { id: "settings", label: "Settings", href: "", Icon: Settings },
];

export default function Sidebar({
  isMobileOpen = false,
  onMobileClose,
}: {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [hierarchicalPipelines, setHierarchicalPipelines] = useState<HierarchicalPipeline[]>([]);
  const [pipelinesExpanded, setPipelinesExpanded] = useState(false);

  // Standard pipeline stages


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onMobileClose && onMobileClose();
    }
    if (isMobileOpen) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isMobileOpen, onMobileClose]);

  useEffect(() => {
    // Load hierarchical pipelines from localStorage
    const stored = localStorage.getItem("hierarchicalPipelines");
    if (stored) {
      try {
        const flatPipelines = JSON.parse(stored);
        const tree = pipelineHelpers.buildTree(flatPipelines);
        setHierarchicalPipelines(tree);
      } catch {
        setHierarchicalPipelines([]);
      }
    }
  }, []);

  const handleUpdatePipelines = (updated: HierarchicalPipeline[]) => {
    setHierarchicalPipelines(updated);
    
    // Save all pipelines to localStorage (including empty ones)
    // We want to keep new pipelines even without items so they can be accessed
    const flatPipelines = pipelineHelpers.flattenTree(updated);
    localStorage.setItem("hierarchicalPipelines", JSON.stringify(flatPipelines));
  };

  const handleAddPipeline = () => {
    // Create new top-level pipeline with all 8 standard stages
    const newPipeline: HierarchicalPipeline = {
      id: crypto.randomUUID(),
      name: `Pipeline ${hierarchicalPipelines.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      parentId: null,
      userId: "current-user", // TODO: Get from auth context
      userName: "Current User", // TODO: Get from auth context
      status: "Pending", // New pipelines start as pending
      activityLogs: [
        {
          id: crypto.randomUUID(),
          action: "created",
          timestamp: new Date().toISOString(),
          userId: "current-user",
          userName: "Current User",
          details: "Pipeline created"
        }
      ],
      stages: pipelineHelpers.createStandardStages(), // All 8 standard stages
      children: [],
    };

    // Add to TOP of list (prepend)
    const updated = [newPipeline, ...hierarchicalPipelines];
    
    // Save immediately to localStorage (including empty pipelines)
    handleUpdatePipelines(updated);

    // Navigate to the new pipeline's RFQ stage
    router.push(`/crm/pipelines/${newPipeline.id}/rfq`);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex flex-col ${
          collapsed ? "w-14" : "w-52"
        } bg-[#0f2230] text-white transition-all duration-200 sticky top-0 z-40 h-screen`}
        aria-label="left sidebar"
      >
        {/* Workspace / Brand */}
        <div className="flex items-center justify-between px-2 py-2 border-b border-white/10">
          <div
            className={`flex items-center gap-2 ${
              collapsed ? "justify-center w-full" : ""
            }`}
          >
            <div className="w-7 h-7 rounded-sm bg-emerald-400 flex items-center justify-center font-bold text-[#042018] text-xs">
              B
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="text-xs font-medium">Team Pipelines</span>
                <span className="text-[10px] text-white/60">Sales Pipeline</span>
              </div>
            )}
          </div>

          {/* Collapse toggle */}
          <button
            className="ml-1 p-1 rounded hover:bg-white/10"
            onClick={() => setCollapsed((s) => !s)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Plus
              size={12}
              className={`${collapsed ? "rotate-45" : "rotate-0"} transition`}
            />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-auto px-1 py-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((it) => {
              const isActive = pathname?.startsWith(it.href);
              return (
                <li key={it.id}>
                  <Link
                    href={it.href}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md mx-1 text-xs hover:bg-white/10 transition ${
                      isActive ? "bg-white/10 font-medium" : "text-white/80"
                    }`}
                  >
                    <span className="flex items-center justify-center w-6">
                      <it.Icon size={16} />
                    </span>
                    {!collapsed && <span>{it.label}</span>}
                  </Link>
                </li>
              );
            })}

            {/* Pipelines Dropdown Section */}
            {!collapsed && (
              <li>
                <button
                  onClick={() => setPipelinesExpanded(!pipelinesExpanded)}
                  className={`flex items-center gap-2 py-1.5 px-2 rounded-md mx-1 text-xs hover:bg-white/10 transition w-full ${
                    pathname?.startsWith("/crm/pipelines") ? "bg-white/10 font-medium" : "text-white/80"
                  }`}
                >
                  <span className="flex items-center justify-center w-6">
                    <Layers size={16} />
                  </span>
                  <span className="flex-1 text-left">Pipelines</span>
                  <Plus
                    size={12}
                    className={`${pipelinesExpanded ? "rotate-45" : "rotate-0"} transition`}
                  />
                </button>

                {/* Pipelines Submenu */}
                {pipelinesExpanded && (
                  <div className="mt-1 ml-4 space-y-1">
                    {/* Add Pipeline Button */}
                    <button
                      onClick={handleAddPipeline}
                      className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-xs bg-emerald-600 hover:bg-emerald-700 transition font-medium"
                    >
                      <Plus size={14} />
                      <span>Add Pipeline</span>
                    </button>


                    {/* Custom Pipelines Tree */}
                    {hierarchicalPipelines.length > 0 && (
                      <div className="mt-2">
                        <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1 px-2">
                          Custom Pipelines
                        </div>
                        <PipelineTreeView 
                          pipelines={hierarchicalPipelines} 
                          onUpdate={handleUpdatePipelines}
                        />
                      </div>
                    )}
                  </div>
                )}
              </li>
            )}
          </ul>

          {/* Hierarchical Pipelines Tree - REMOVED (moved to dropdown) */}
          {/* Add Pipeline Button - REMOVED (moved to dropdown) */}
        </nav>

        {/* User */}
        <div className="px-2 py-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
              G
            </div>
            {!collapsed && <div className="text-xs">Glonix</div>}
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-opacity duration-200 ${
          isMobileOpen ? "visible opacity-60 bg-black/60" : "pointer-events-none opacity-0"
        }`}
        onClick={() => onMobileClose && onMobileClose()}
        aria-hidden={!isMobileOpen}
      />

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 bottom-0 z-50 transform transition-transform duration-200 bg-[#0f2230] text-white w-64 flex flex-col ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal={isMobileOpen}
        aria-hidden={!isMobileOpen}
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-sm bg-emerald-400 flex items-center justify-center font-bold text-[#042018] text-xs">B</div>
            <div className="flex flex-col leading-tight">
              <span className="text-xs font-medium">Team Pipelines</span>
              <span className="text-[10px] text-white/60">Sales Pipeline</span>
            </div>
          </div>
          <button className="p-2 rounded hover:bg-white/10" onClick={() => onMobileClose && onMobileClose()} aria-label="Close sidebar">
            <Plus size={12} className="rotate-45" />
          </button>
        </div>

        <nav className="flex-1 overflow-auto px-1 py-2">
          <ul className="space-y-1">
            {NAV_ITEMS.map((it) => {
              const isActive = pathname?.startsWith(it.href);
              return (
                <li key={it.id}>
                  <Link
                    href={it.href}
                    onClick={() => onMobileClose && onMobileClose()}
                    className={`flex items-center gap-2 py-1.5 px-2 rounded-md mx-1 text-xs hover:bg-white/10 transition ${
                      isActive ? "bg-white/10 font-medium" : "text-white/80"
                    }`}
                  >
                    <span className="flex items-center justify-center w-6">
                      <it.Icon size={16} />
                    </span>
                    <span>{it.label}</span>
                  </Link>
                </li>
              );
            })}

            {/* Pipelines Dropdown Section - Mobile */}
            <li>
              <button
                onClick={() => setPipelinesExpanded(!pipelinesExpanded)}
                className={`flex items-center gap-2 py-1.5 px-2 rounded-md mx-1 text-xs hover:bg-white/10 transition w-full ${
                  pathname?.startsWith("/crm/pipelines") ? "bg-white/10 font-medium" : "text-white/80"
                }`}
              >
                <span className="flex items-center justify-center w-6">
                  <Layers size={16} />
                </span>
                <span className="flex-1 text-left">Pipelines</span>
                <Plus
                  size={12}
                  className={`${pipelinesExpanded ? "rotate-45" : "rotate-0"} transition`}
                />
              </button>

              {/* Pipelines Submenu - Mobile */}
              {pipelinesExpanded && (
                <div className="mt-1 ml-4 space-y-1">
                  {/* Add Pipeline Button */}
                  <button
                    onClick={() => {
                      handleAddPipeline();
                      onMobileClose && onMobileClose();
                    }}
                    className="w-full flex items-center gap-2 py-1.5 px-2 rounded-md text-xs bg-emerald-600 hover:bg-emerald-700 transition font-medium"
                  >
                    <Plus size={14} />
                    <span>Add Pipeline</span>
                  </button>

                  {/* Standard Pipelines */}
                  <div className="mt-2">
                    <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1 px-2">
                      Standard Pipelines
                    </div>
                  </div>

                  {/* Custom Pipelines Tree - Mobile */}
                  {hierarchicalPipelines.length > 0 && (
                    <div className="mt-2">
                      <div className="text-[10px] text-white/50 uppercase tracking-wider mb-1 px-2">
                        Custom Pipelines
                      </div>
                      <PipelineTreeView 
                        pipelines={hierarchicalPipelines} 
                        onUpdate={handleUpdatePipelines}
                      />
                    </div>
                  )}
                </div>
              )}
            </li>
          </ul>
        </nav>

        <div className="px-2 py-2 border-t border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs">G</div>
            <div className="text-xs">Glonix</div>
          </div>
        </div>
      </aside>
    </>
  );
}
