"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { 
  ChevronRight, 
  ChevronDown, 
  Check, 
  X, 
  Eye, 
  Edit2, 
  Layers,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  User as UserIcon
} from "lucide-react";
import { HierarchicalPipeline, pipelineHelpers, type FlatPipeline } from "@/types/pipeline";
import { MOCK_USERS, type PipelineStatistics, type RejectionModalInfo } from "./data";
import { HIERARCHICAL_PIPELINES_KEY, USER_PIPELINE_VISIBILITY_KEY } from "./constants";
import { readJson, writeJson } from "@/utils/storage";

export default function AdminDashboard() {
  const router = useRouter();
  const [allPipelines, setAllPipelines] = useState<HierarchicalPipeline[]>([]);
  const [expandedUsers, setExpandedUsers] = useState<Set<string>>(new Set());
  const [expandedPipelines, setExpandedPipelines] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"All" | "Active" | "Pending" | "Rejected" | "Completed">("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionModal, setRejectionModal] = useState<RejectionModalInfo | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [userPipelineVisibility, setUserPipelineVisibility] = useState<Record<string, string[]>>({});
  const [showVisibilityPanel, setShowVisibilityPanel] = useState(false);

  useEffect(() => {
    try {
      const storedPipelines = readJson<FlatPipeline[]>(HIERARCHICAL_PIPELINES_KEY, []);
      if (storedPipelines.length > 0) {
        setAllPipelines(pipelineHelpers.buildTree(storedPipelines));
      } else {
        setAllPipelines([]);
      }
    } catch (error) {
      console.error("Failed to load pipelines:", error);
      setAllPipelines([]);
    }

    const storedVisibility = readJson<Record<string, string[]>>(USER_PIPELINE_VISIBILITY_KEY, {});
    setUserPipelineVisibility(storedVisibility);
  }, []);

  const saveUserPipelineVisibility = useCallback((visibility: Record<string, string[]>) => {
    writeJson(USER_PIPELINE_VISIBILITY_KEY, visibility);
  }, []);

  const togglePipelineVisibilityForUser = useCallback((userId: string, pipelineId: string) => {
    setUserPipelineVisibility((previous) => {
      const currentAssignments = new Set(previous[userId] ?? []);
      if (currentAssignments.has(pipelineId)) {
        currentAssignments.delete(pipelineId);
      } else {
        currentAssignments.add(pipelineId);
      }

      const nextVisibility = {
        ...previous,
        [userId]: Array.from(currentAssignments)
      };

      saveUserPipelineVisibility(nextVisibility);
      return nextVisibility;
    });
  }, [saveUserPipelineVisibility]);

  const isPipelineVisibleToUser = (userId: string, pipelineId: string): boolean => {
    return userPipelineVisibility[userId]?.includes(pipelineId) ?? false;
  };

  // Recursive function to render pipelines with sub-pipelines in visibility panel
  const renderPipelineVisibilityItem = (userId: string, pipeline: HierarchicalPipeline, depth: number = 0) => {
    const isVisible = isPipelineVisibleToUser(userId, pipeline.id);
    const hasChildren = pipeline.children.length > 0;
    const indentStyle = { paddingLeft: `${depth * 24}px` };

    const items = [];

    // Render the current pipeline
    items.push(
      <div 
        key={pipeline.id}
        style={indentStyle}
        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded"
      >
        <input
          type="checkbox"
          checked={isVisible}
          onChange={() => togglePipelineVisibilityForUser(userId, pipeline.id)}
          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
        />
        <Layers size={16} className="text-blue-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-gray-900 truncate">{pipeline.name}</p>
            {hasChildren && (
              <span className="text-xs text-gray-500">
                ({pipeline.children.length} sub-pipeline{pipeline.children.length !== 1 ? 's' : ''})
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Status: {pipeline.status} | Created: {format(new Date(pipeline.createdAt), "PP")}
          </p>
        </div>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full flex-shrink-0 ${
          pipeline.status === 'Active' ? 'bg-green-100 text-green-800' :
          pipeline.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
          pipeline.status === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-blue-100 text-blue-800'
        }`}>
          {pipeline.status}
        </span>
      </div>
    );

    // Recursively render children (sub-pipelines)
    if (hasChildren) {
      pipeline.children.forEach(child => {
        items.push(...renderPipelineVisibilityItem(userId, child, depth + 1));
      });
    }

    return items;
  };

  const savePipelines = useCallback((updatedTree: HierarchicalPipeline[]) => {
    const flat = pipelineHelpers.flattenTree(updatedTree);
    writeJson(HIERARCHICAL_PIPELINES_KEY, flat);
    setAllPipelines(updatedTree);
  }, []);

  const handleApprovePipeline = (pipelineId: string) => {
    const updateStatus = (nodes: HierarchicalPipeline[]): HierarchicalPipeline[] => {
      return nodes.map(node => {
        if (node.id === pipelineId) {
          return {
            ...node,
            status: "Active" as const,
            updatedAt: new Date().toISOString(),
            rejectionInfo: undefined, // Clear any previous rejection
            activityLogs: [
              ...node.activityLogs,
              {
                id: crypto.randomUUID(),
                action: "approved",
                timestamp: new Date().toISOString(),
                userId: "admin",
                userName: "Admin",
                details: "Pipeline approved and set to Active"
              }
            ]
          };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateStatus(node.children) };
        }
        return node;
      });
    };

    const updated = updateStatus(allPipelines);
    savePipelines(updated);
  };

  const handleRejectPipeline = () => {
    if (!rejectionModal || !rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    const updateStatus = (nodes: HierarchicalPipeline[]): HierarchicalPipeline[] => {
      return nodes.map(node => {
        if (node.id === rejectionModal.pipelineId) {
          return {
            ...node,
            status: "Rejected" as const,
            updatedAt: new Date().toISOString(),
            rejectionInfo: {
              reason: rejectionReason.trim(),
              rejectedAt: new Date().toISOString(),
              rejectedBy: "Admin" // In production, use actual admin name
            }
          };
        }
        if (node.children.length > 0) {
          return { ...node, children: updateStatus(node.children) };
        }
        return node;
      });
    };

    const updated = updateStatus(allPipelines);
    savePipelines(updated);
    setRejectionModal(null);
    setRejectionReason("");
  };

  const toggleUserExpand = (userId: string) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const togglePipelineExpand = (pipelineId: string) => {
    setExpandedPipelines(prev => {
      const next = new Set(prev);
      if (next.has(pipelineId)) {
        next.delete(pipelineId);
      } else {
        next.add(pipelineId);
      }
      return next;
    });
  };

  const renderPipelineTree = (pipeline: HierarchicalPipeline, depth: number = 0) => {
    const hasChildren = pipeline.children.length > 0;
    const isExpanded = expandedPipelines.has(pipeline.id);
    const hasContent = pipelineHelpers.hasContent(pipeline);
    
    const indentStyle = { paddingLeft: `${depth * 24}px` };

    const statusBadge = {
      Pending: "bg-yellow-100 text-yellow-800",
      Active: "bg-green-100 text-green-800",
      Rejected: "bg-red-100 text-red-800",
      Completed: "bg-blue-100 text-blue-800"
    };

    return (
      <div key={pipeline.id} className="border-b last:border-b-0">
        <div 
          style={indentStyle}
          className="flex items-center gap-3 p-4 hover:bg-gray-50 transition"
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => togglePipelineExpand(pipeline.id)}
              className="flex-shrink-0 p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <span className="flex-shrink-0 w-6" />
          )}

          {/* Pipeline Icon */}
          <Layers size={18} className="flex-shrink-0 text-blue-600" />

          {/* Pipeline Name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{pipeline.name}</h4>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadge[pipeline.status]}`}>
                {pipeline.status}
              </span>
              {!hasContent && (
                <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full">
                  Empty
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <UserIcon size={12} />
                {pipeline.userName || "Unknown User"}
              </span>
              <span title={`Created: ${format(new Date(pipeline.createdAt), "PPpp")}`}>
                Created: {format(new Date(pipeline.createdAt), "dd MMM yyyy")}
              </span>
              <span title={`Last Updated: ${format(new Date(pipeline.updatedAt), "PPpp")}`}>
                Updated: {format(new Date(pipeline.updatedAt), "dd MMM yyyy")}
              </span>
              <span>Stages: {pipeline.stages.length}</span>
              <span>Items: {pipeline.stages.reduce((sum, s) => sum + s.items.length, 0)}</span>
              {hasChildren && <span>Sub-pipelines: {pipeline.children.length}</span>}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => router.push(`/crm/pipelines/${pipeline.id}/rfq`)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded transition"
              title="View Pipeline"
            >
              <Eye size={18} />
            </button>
            
            {pipeline.status === "Pending" && (
              <>
                <button
                  onClick={() => handleApprovePipeline(pipeline.id)}
                  className="p-2 text-green-600 hover:bg-green-50 rounded transition"
                  title="Approve"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setRejectionModal({ pipelineId: pipeline.id, pipelineName: pipeline.name })}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  title="Reject"
                >
                  <X size={18} />
                </button>
              </>
            )}
            
            {pipeline.status === "Rejected" && pipeline.rejectionInfo && (
              <div className="text-xs text-red-600" title={`Rejected: ${pipeline.rejectionInfo.reason}`}>
                <AlertCircle size={18} />
              </div>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div>
            {pipeline.children.map(child => renderPipelineTree(child, depth + 1))}
          </div>
        )}

        {/* Rejection Info */}
        {pipeline.status === "Rejected" && pipeline.rejectionInfo && (
          <div style={indentStyle} className="ml-6 p-3 bg-red-50 border-l-2 border-red-200 mb-2">
            <p className="text-sm text-red-800">
              <strong>Rejection Reason:</strong> {pipeline.rejectionInfo.reason}
            </p>
            <p className="text-xs text-red-600 mt-1">
              Rejected on {format(new Date(pipeline.rejectionInfo.rejectedAt), "PPP")} by {pipeline.rejectionInfo.rejectedBy}
            </p>
          </div>
        )}
      </div>
    );
  };

  const flattenedPipelines = useMemo(() => {
    const collected: HierarchicalPipeline[] = [];

    const traverse = (nodes: HierarchicalPipeline[]) => {
      nodes.forEach((node) => {
        collected.push(node);
        if (node.children.length > 0) {
          traverse(node.children);
        }
      });
    };

    traverse(allPipelines);
    return collected;
  }, [allPipelines]);

  const stats = useMemo<PipelineStatistics>(() => {
    return flattenedPipelines.reduce<PipelineStatistics>((accumulator, pipeline) => {
      accumulator.total += 1;
      if (pipeline.status === "Pending") accumulator.pending += 1;
      if (pipeline.status === "Active") accumulator.active += 1;
      if (pipeline.status === "Rejected") accumulator.rejected += 1;
      if (pipeline.status === "Completed") accumulator.completed += 1;
      return accumulator;
    }, { total: 0, pending: 0, active: 0, rejected: 0, completed: 0 });
  }, [flattenedPipelines]);

  const filteredPipelineTree = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const nodeMatchesFilters = (node: HierarchicalPipeline) => {
      const statusMatches = filterStatus === "All" || node.status === filterStatus;
      const searchMatches = !normalizedQuery || node.name.toLowerCase().includes(normalizedQuery);
      return statusMatches && searchMatches;
    };

    const applyFilters = (nodes: HierarchicalPipeline[]): HierarchicalPipeline[] => {
      return nodes.reduce<HierarchicalPipeline[]>((accumulator, node) => {
        const filteredChildren = applyFilters(node.children);
        if (nodeMatchesFilters(node) || filteredChildren.length > 0) {
          accumulator.push({
            ...node,
            children: filteredChildren
          });
        }
        return accumulator;
      }, []);
    };

    return applyFilters(allPipelines);
  }, [allPipelines, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage all user pipelines and sub-pipelines</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pipelines</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <Layers className="text-blue-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle className="text-green-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-blue-600">{stats.completed}</p>
              </div>
              <CheckCircle className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search pipelines..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilterStatus("All")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "All"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus("Pending")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "Pending"
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setFilterStatus("Active")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "Active"
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setFilterStatus("Rejected")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "Rejected"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Rejected
              </button>
              <button
                onClick={() => setFilterStatus("Completed")}
                className={`px-4 py-2 rounded-lg transition ${
                  filterStatus === "Completed"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Completed
              </button>
            </div>
          </div>
          
          {/* User Visibility Management Button */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setShowVisibilityPanel(!showVisibilityPanel)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <UserIcon size={20} />
              {showVisibilityPanel ? 'Hide' : 'Manage'} User Pipeline Visibility
            </button>
          </div>
        </div>

        {/* User Pipeline Visibility Panel */}
        {showVisibilityPanel && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">User Pipeline Visibility Control</h2>
            <p className="text-gray-600 mb-6">Select which pipelines each user can see in their dashboard</p>
            
            <div className="space-y-6">
              {MOCK_USERS.map(user => {
                const userPipelines = userPipelineVisibility[user.id] || [];
                const visibleCount = userPipelines.length;
                
                return (
                  <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleUserExpand(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        {expandedUsers.has(user.id) ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                        <UserIcon size={20} className="text-purple-600" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-500">{user.email} - {user.role}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-purple-600">
                        {visibleCount} pipeline{visibleCount !== 1 ? 's' : ''} visible
                      </div>
                    </div>
                    
                    {expandedUsers.has(user.id) && (
                      <div className="mt-4 pl-8 space-y-2 max-h-96 overflow-y-auto">
                        {allPipelines.length === 0 ? (
                          <p className="text-gray-500 text-sm">No pipelines available</p>
                        ) : (
                          allPipelines.map(pipeline => renderPipelineVisibilityItem(user.id, pipeline))
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Pipelines Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">All Pipelines</h2>
          </div>

          {filteredPipelineTree.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Layers size={48} className="mx-auto mb-4 text-gray-300" />
              <p>No pipelines found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredPipelineTree.map((pipeline) => renderPipelineTree(pipeline))}
            </div>
          )}
        </div>
      </div>

      {/* Rejection Modal */}
      {rejectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reject Pipeline: {rejectionModal.pipelineName}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Provide a clear reason for rejection..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRejectPipeline}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Reject Pipeline
                </button>
                <button
                  onClick={() => {
                    setRejectionModal(null);
                    setRejectionReason("");
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
