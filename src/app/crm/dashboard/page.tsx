"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, Clock, CheckCircle, AlertTriangle, IndianRupee, FileWarning, XCircle } from 'lucide-react';
import { HierarchicalPipeline, pipelineHelpers } from "@/types/pipeline";

// --- TYPE DEFINITIONS ---
type RFQ = { id: string; company_name: string; deadline: string; };
type PreprocessItem = { id: string; company_name: string; deadline: string; project_handled_by: string };
type PostProcessItem = { id: string; company_name: string; deadline: string; project_handled_by: string };
type CompletedProject = { id: string; company_name: string; deadline: string; completion_date: string };
type PaymentPendingItem = { id: string; company_name: string; balance_due: number; };
type GstPurchaseItem = { id: string; vendor: string; total: number; paymentRequest: string; paymentStatus: 'Paid' | 'Unpaid' | 'Partially paid'; };

// A union type for items that can be overdue
type OverdueableItem = (RFQ | PreprocessItem | PostProcessItem) & { type: string };

// --- HELPER COMPONENTS ---
const DashboardCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode, color: string }) => (
    <div className={`p-6 rounded-lg shadow-lg bg-gradient-to-br from-${color}-500 to-${color}-600 text-white`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="text-4xl opacity-50">{icon}</div>
        </div>
    </div>
);

const OverdueItem = ({ item }: { item: OverdueableItem }) => (
    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
        <div>
            <p className="font-semibold text-gray-800">{item.company_name}</p>
            <p className="text-sm text-gray-500">{item.type} - Deadline: {new Date(item.deadline).toLocaleDateString()}</p>
        </div>
        <div className="text-red-500 font-bold">OVERDUE</div>
    </div>
);

export default function DashboardPage() {
    const router = useRouter();
    const [userName] = useState("User"); // setUserName removed as it was unused
    const [rejectedPipelines, setRejectedPipelines] = useState<HierarchicalPipeline[]>([]);
    const [stats, setStats] = useState({
        ongoing: 0,
        pendingRfqs: 0,
        onTime: 0,
        delayed: 0,
        overdueItems: [] as OverdueableItem[], // Typed correctly
        highPriorityPayments: [] as GstPurchaseItem[],
        customerPendingTotal: 0,
        supplierPendingTotal: 0,
    });

    useEffect(() => {
        // Load rejected pipelines
        const stored = localStorage.getItem("hierarchicalPipelines");
        if (stored) {
            try {
                const flatPipelines = JSON.parse(stored);
                const tree = pipelineHelpers.buildTree(flatPipelines);
                
                // Find all rejected pipelines (including nested ones)
                const findRejected = (nodes: HierarchicalPipeline[]): HierarchicalPipeline[] => {
                    const rejected: HierarchicalPipeline[] = [];
                    nodes.forEach(node => {
                        if (node.status === "Rejected") {
                            rejected.push(node);
                        }
                        if (node.children.length > 0) {
                            rejected.push(...findRejected(node.children));
                        }
                    });
                    return rejected;
                };
                
                setRejectedPipelines(findRejected(tree));
            } catch (error) {
                console.error("Failed to load pipelines:", error);
            }
        }

        const rfqs: RFQ[] = JSON.parse(localStorage.getItem("rfqData") || "[]");
        const preprocess: PreprocessItem[] = JSON.parse(localStorage.getItem("preprocessData") || "[]");
        const postprocess: PostProcessItem[] = JSON.parse(localStorage.getItem("postprocessData") || "[]");
        const completed: CompletedProject[] = JSON.parse(localStorage.getItem("completedProjectsData") || "[]");
        const paymentPending: PaymentPendingItem[] = JSON.parse(localStorage.getItem("paymentPendingData") || "[]");
        const gstPurchases: GstPurchaseItem[] = JSON.parse(localStorage.getItem("gstPurchaseData") || "[]");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const onTime = completed.filter(p => new Date(p.completion_date) <= new Date(p.deadline)).length;
        const delayed = completed.length - onTime;
        const ongoing = preprocess.length + postprocess.length;

        const overdueItems: OverdueableItem[] = [
            ...rfqs.filter(item => new Date(item.deadline) < today).map(item => ({ ...item, type: 'RFQ' })),
            ...preprocess.filter(item => new Date(item.deadline) < today).map(item => ({ ...item, type: 'Preprocess' })),
            ...postprocess.filter(item => new Date(item.deadline) < today).map(item => ({ ...item, type: 'Post Process' }))
        ];

        const highPriorityPayments = gstPurchases.filter(item => item.paymentRequest === "High");
        const customerPendingTotal = paymentPending.reduce((sum, item) => sum + item.balance_due, 0);
        const supplierPendingTotal = gstPurchases
            .filter(item => item.paymentStatus === 'Unpaid' || item.paymentStatus === 'Partially paid')
            .reduce((sum, item) => sum + item.total, 0);

        setStats({ ongoing, pendingRfqs: rfqs.length, onTime, delayed, overdueItems, highPriorityPayments, customerPendingTotal, supplierPendingTotal });

    }, []);

    const pieChartData = [
        { name: 'Ongoing', value: stats.ongoing },
        { name: 'On-Time', value: stats.onTime },
        { name: 'Delayed', value: stats.delayed },
    ];
    const COLORS = ['#0088FE', '#00ffd0ff', '#FF8042'];

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Hi, {userName}</h1>
            <p className="text-gray-500 mb-8">Here&apos;s your dashboard for today.</p>

            {/* Rejected Pipelines Alert */}
            {rejectedPipelines.length > 0 && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-500 rounded-lg p-4 shadow">
                    <div className="flex items-start gap-3">
                        <XCircle className="text-red-600 mt-0.5 flex-shrink-0" size={24} />
                        <div className="flex-1">
                            <h3 className="text-red-800 font-semibold mb-2">
                                {rejectedPipelines.length} Pipeline{rejectedPipelines.length > 1 ? 's' : ''} Rejected
                            </h3>
                            <div className="space-y-2">
                                {rejectedPipelines.map(pipeline => (
                                    <div key={pipeline.id} className="bg-white rounded p-3 border border-red-200">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-900">{pipeline.name}</p>
                                                {pipeline.rejectionInfo && (
                                                    <p className="text-sm text-red-700 mt-1">
                                                        <strong>Reason:</strong> {pipeline.rejectionInfo.reason}
                                                    </p>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => router.push(`/crm/pipelines/${pipeline.id}`)}
                                                className="ml-3 px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                                            >
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <DashboardCard title="Ongoing Works" value={stats.ongoing} icon={<Briefcase />} color="blue" />
                <DashboardCard title="Pending RFQs" value={stats.pendingRfqs} icon={<Clock />} color="yellow" />
                <DashboardCard title="Overdue Tasks" value={stats.overdueItems.length} icon={<AlertTriangle />} color="red" />
                <DashboardCard title="Completed On-Time" value={stats.onTime} icon={<CheckCircle />} color="green" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4">Works Overview</h2>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={(entry) => `${entry.name}: ${entry.value}`}>
                                    {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md space-y-6">
                    <h2 className="text-xl font-bold text-gray-700">Payments Overview</h2>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-red-100 rounded-full text-red-600"><IndianRupee /></div>
                        <div>
                            <p className="text-gray-500">Customer Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.customerPendingTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full text-blue-600"><IndianRupee /></div>
                        <div>
                            <p className="text-gray-500">Supplier Pending Payments</p>
                            <p className="text-2xl font-bold text-gray-800">{stats.supplierPendingTotal.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500"/> Overdue Items</h2>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                        {stats.overdueItems.length > 0 ? (
                            stats.overdueItems.map(item => <OverdueItem key={item.id} item={item} />)
                        ) : <p className="text-gray-500">No overdue items. Great job!</p>}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2"><FileWarning className="text-orange-500"/> High Priority Payments</h2>
                     <div className="space-y-3 max-h-60 overflow-y-auto">
                        {stats.highPriorityPayments.length > 0 ? (
                            stats.highPriorityPayments.map(item => (
                                <div key={item.id} className="p-3 bg-gray-50 rounded-lg">
                                    <p className="font-semibold text-gray-800">{item.vendor}</p>
                                    <p className="text-sm text-gray-500">Amount: {item.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</p>
                                </div>
                            ))
                        ) : <p className="text-gray-500">No high priority payments.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
