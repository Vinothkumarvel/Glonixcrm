"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, Settings } from "lucide-react";
import { format } from "date-fns";
import { HierarchicalPipeline, PipelineItem, pipelineHelpers } from "@/types/pipeline";

export default function DynamicPipelinePage() {
  const router = useRouter();
  const pathname = usePathname();
  const pipelineId = pathname?.split("/").pop() || "";

  const [pipeline, setPipeline] = useState<HierarchicalPipeline | null>(null);
  const [activeStageId, setActiveStageId] = useState<string>("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newStageName, setNewStageName] = useState("");
  const [newItem, setNewItem] = useState<Partial<PipelineItem>>({
    company_name: "",
    contact: "",
    department: "",
    description: "",
    priority: "Medium",
    state: "Active",
  });

  useEffect(() => {
    loadPipeline();
  }, [pipelineId]);

  const loadPipeline = () => {
    const stored = localStorage.getItem("hierarchicalPipelines");
    if (stored) {
      try {
        const flatPipelines = JSON.parse(stored);
        const tree = pipelineHelpers.buildTree(flatPipelines);
        const found = pipelineHelpers.findById(tree, pipelineId);
        
        if (found) {
          setPipeline(found);
          if (found.stages.length > 0 && !activeStageId) {
            setActiveStageId(found.stages[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to load pipeline:", error);
      }
    }
  };

  const savePipeline = (updated: HierarchicalPipeline) => {
    const stored = localStorage.getItem("hierarchicalPipelines");
    if (stored) {
      try {
        const flatPipelines = JSON.parse(stored);
        const tree = pipelineHelpers.buildTree(flatPipelines);
        
        // Update the pipeline in tree
        const updateInTree = (nodes: HierarchicalPipeline[]): HierarchicalPipeline[] => {
          return nodes.map(node => {
            if (node.id === pipelineId) {
              // Add activity log for update
              const updatedWithLog = pipelineHelpers.addActivityLog(
                updated,
                "updated",
                updated.userId,
                updated.userName,
                "Pipeline data updated"
              );
              return { ...updatedWithLog, updatedAt: new Date().toISOString() };
            }
            if (node.children.length > 0) {
              return { ...node, children: updateInTree(node.children) };
            }
            return node;
          });
        };

        const updatedTree = updateInTree(tree);
        
        // Filter out pipelines without content before saving
        const pipelinesWithContent = updatedTree.filter(p => 
          pipelineHelpers.shouldSave(p) || p.children.some(c => pipelineHelpers.shouldSave(c))
        );
        
        const flatUpdated = pipelineHelpers.flattenTree(pipelinesWithContent);
        localStorage.setItem("hierarchicalPipelines", JSON.stringify(flatUpdated));
        setPipeline(updated);
      } catch (error) {
        console.error("Failed to save pipeline:", error);
      }
    }
  };

  const handleAddStage = () => {
    if (!pipeline || !newStageName.trim()) return;

    const newStage = {
      id: crypto.randomUUID(),
      name: newStageName.trim(),
      items: []
    };

    const updated = {
      ...pipeline,
      stages: [...pipeline.stages, newStage]
    };

    savePipeline(updated);
    setNewStageName("");
    setActiveStageId(newStage.id);
  };

  const handleDeleteStage = (stageId: string) => {
    if (!pipeline || pipeline.stages.length === 1) {
      alert("Cannot delete the last stage");
      return;
    }

    if (confirm("Are you sure you want to delete this stage and all its items?")) {
      const updated = {
        ...pipeline,
        stages: pipeline.stages.filter(s => s.id !== stageId)
      };

      savePipeline(updated);
      
      // Update active stage if needed
      if (activeStageId === stageId && updated.stages.length > 0) {
        setActiveStageId(updated.stages[0].id);
      }
    }
  };

  const handleAddItem = () => {
    if (!pipeline || !activeStageId || !newItem.company_name?.trim()) {
      alert("Please enter at least a company name");
      return;
    }

    const item: PipelineItem = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      company_name: newItem.company_name.trim(),
      contact: newItem.contact || "",
      department: newItem.department || "",
      description: newItem.description || "",
      deadline: newItem.deadline || "",
      priority: newItem.priority as "High" | "Medium" | "Low",
      state: newItem.state || "Active",
      source: "manual"
    };

    const updated = {
      ...pipeline,
      stages: pipeline.stages.map(stage =>
        stage.id === activeStageId
          ? { ...stage, items: [...stage.items, item] }
          : stage
      )
    };

    savePipeline(updated);
    setIsAddingItem(false);
    setNewItem({
      company_name: "",
      contact: "",
      department: "",
      description: "",
      priority: "Medium",
      state: "Active",
    });
  };

  const handleDeleteItem = (itemId: string) => {
    if (!pipeline || !activeStageId) return;

    if (confirm("Are you sure you want to delete this item?")) {
      const updated = {
        ...pipeline,
        stages: pipeline.stages.map(stage =>
          stage.id === activeStageId
            ? { ...stage, items: stage.items.filter(item => item.id !== itemId) }
            : stage
        )
      };

      savePipeline(updated);
    }
  };

  const activeStage = pipeline?.stages.find((s) => s.id === activeStageId);

  if (!pipeline) {
    return (
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Pipeline not found.</p>
          <button
            onClick={() => router.push('/crm/pipelines/rfq')}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Back to Pipelines
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Stage Tabs */}
      <nav className="mx-auto bg-white px-6 shadow-sm border-b sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 overflow-x-auto flex-1">
            {pipeline.stages.map((stage) => (
              <button
                key={stage.id}
                onClick={() => setActiveStageId(stage.id)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors duration-300 ${
                  activeStageId === stage.id
                    ? "text-white border-green-500 bg-blue-900"
                    : "text-gray-600 border-transparent hover:text-gray-900 hover:border-blue-500"
                }`}
              >
                {stage.name}
              </button>
            ))}
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="ml-4 p-2 text-gray-600 hover:text-blue-900 transition"
            title="Pipeline Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="mx-auto px-6 py-8">
        {/* Pipeline Status Badge */}
        {pipeline.status === "Rejected" && pipeline.rejectionInfo && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="text-red-800 font-semibold mb-1">Pipeline Rejected</h3>
                <p className="text-sm text-red-700 mb-2">
                  <strong>Reason:</strong> {pipeline.rejectionInfo.reason}
                </p>
                <p className="text-xs text-red-600">
                  Rejected on {format(new Date(pipeline.rejectionInfo.rejectedAt), "PPP")} by {pipeline.rejectionInfo.rejectedBy}
                </p>
              </div>
            </div>
          </div>
        )}

        {pipeline.status === "Pending" && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>Status:</strong> Pending Admin Approval
            </p>
          </div>
        )}

        {pipeline.status === "Active" && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-sm text-green-800">
              <strong>Status:</strong> Active
            </p>
          </div>
        )}

        {pipeline.status === "Completed" && (
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-sm text-blue-800">
              <strong>Status:</strong> Completed
            </p>
          </div>
        )}

        {/* Settings Panel */}
        {isSettingsOpen && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border-l-4 border-blue-900">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Settings size={20} />
              Pipeline Settings
            </h3>

            {/* Pipeline Info */}
            <div className="mb-4 p-4 bg-gray-50 rounded">
              <p className="text-sm"><strong>Name:</strong> {pipeline.name}</p>
              <p className="text-sm"><strong>Created:</strong> {format(new Date(pipeline.createdAt), "PPP p")}</p>
              <p className="text-sm"><strong>Last Updated:</strong> {format(new Date(pipeline.updatedAt), "PPP p")}</p>
              <p className="text-sm"><strong>Type:</strong> {pipeline.parentId ? 'Sub-Pipeline' : 'Main Pipeline'}</p>
              <p className="text-sm"><strong>Status:</strong> <span className={`font-semibold ${
                pipeline.status === 'Active' ? 'text-green-600' :
                pipeline.status === 'Completed' ? 'text-blue-600' :
                pipeline.status === 'Rejected' ? 'text-red-600' :
                'text-yellow-600'
              }`}>{pipeline.status}</span></p>
              <p className="text-sm"><strong>Stages:</strong> {pipeline.stages.length}</p>
              <p className="text-sm"><strong>Sub-Pipelines:</strong> {pipeline.children.length}</p>
            </div>

            {/* Add New Stage */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Add New Stage</label>
              <div className="flex gap-2">
                <input
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter stage name"
                />
                <button
                  onClick={handleAddStage}
                  className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Stage
                </button>
              </div>
            </div>

            {/* Manage Stages */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Manage Stages</label>
              <div className="space-y-2">
                {pipeline.stages.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="font-medium">{stage.name} ({stage.items.length} items)</span>
                    <button
                      onClick={() => handleDeleteStage(stage.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                      disabled={pipeline.stages.length === 1}
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Close Settings
            </button>
          </div>
        )}

        {/* Active Stage Content */}
        {activeStage && (
          <div className="bg-white rounded-lg shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{activeStage.name}</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeStage.items.length} item{activeStage.items.length !== 1 ? 's' : ''}
                </p>
              </div>
              <button
                onClick={() => setIsAddingItem(true)}
                className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>

            {/* Add Item Form */}
            {isAddingItem && (
              <div className="p-6 bg-blue-50 border-b">
                <h3 className="font-semibold mb-4">Add New Item</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Company Name *</label>
                    <input
                      value={newItem.company_name || ""}
                      onChange={(e) => setNewItem({ ...newItem, company_name: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter company name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Contact</label>
                    <input
                      value={newItem.contact || ""}
                      onChange={(e) => setNewItem({ ...newItem, contact: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contact person"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Department</label>
                    <input
                      value={newItem.department || ""}
                      onChange={(e) => setNewItem({ ...newItem, department: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Department"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select
                      value={newItem.priority || "Medium"}
                      onChange={(e) => setNewItem({ ...newItem, priority: e.target.value as "High" | "Medium" | "Low" })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Description</label>
                    <textarea
                      value={newItem.description || ""}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter description"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={handleAddItem}
                    className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  >
                    Save Item
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingItem(false);
                      setNewItem({
                        company_name: "",
                        contact: "",
                        department: "",
                        description: "",
                        priority: "Medium",
                        state: "Active",
                      });
                    }}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 text-left border">Date</th>
                    <th className="p-3 text-left border">Company Name</th>
                    <th className="p-3 text-left border">Department</th>
                    <th className="p-3 text-left border">Deadline</th>
                    <th className="p-3 text-left border">Priority</th>
                    <th className="p-3 text-left border">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStage.items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500">
                        No items in this stage. Click &quot;Add Item&quot; to get started.
                      </td>
                    </tr>
                  ) : (
                    activeStage.items.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-green-50">
                        <td className="p-3 border">
                          {item.date ? format(new Date(item.date), "dd/MM/yyyy") : "-"}
                        </td>
                        <td className="p-3 border font-medium">{item.company_name}</td>
                        <td className="p-3 border">{item.department || "-"}</td>
                        <td className="p-3 border">
                          {item.deadline ? format(new Date(item.deadline), "dd/MM/yyyy") : "-"}
                        </td>
                        <td className="p-3 border">
                          <span
                            className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              item.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : item.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {item.priority}
                          </span>
                        </td>
                        <td className="p-3 border">
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="px-3 py-1 text-xs text-white bg-red-500 rounded hover:bg-red-600"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> This pipeline works just like RFQ, Feasibility, and other standard pipelines.
            Use the tabs above to switch between stages. You can add sub-pipelines from the sidebar.
          </p>
        </div>
      </main>
    </div>
  );
}
