"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Briefcase, Clock, CheckCircle, AlertTriangle, IndianRupee, FileWarning, XCircle, Calendar } from 'lucide-react';
import { HierarchicalPipeline, pipelineHelpers, type FlatPipeline } from "@/types/pipeline";
import { format } from 'date-fns';
import { STORAGE_KEYS } from '@/constants/storage';
import { readJson } from '@/utils/storage';

// --- TYPE DEFINITIONS ---
type RFQ = { id: string; company_name: string; deadline: string; };
type PreprocessItem = { id: string; company_name: string; deadline: string; project_handled_by: string };
type PostProcessItem = { id: string; company_name: string; deadline: string; project_handled_by: string };
type CompletedProject = { id: string; company_name: string; deadline: string; completion_date: string };
type PaymentPendingItem = { id: string; company_name: string; balance_due: number; };
type GstPurchaseItem = { id: string; vendor: string; total: number; paymentRequest: string; paymentStatus: 'Paid' | 'Unpaid' | 'Partially paid'; };

// A union type for items that can be overdue
type OverdueableItem = (RFQ | PreprocessItem | PostProcessItem) & { type: string; pipelineId?: string };

// --- HELPER COMPONENTS ---
const CARD_VARIANTS = {
    blue: "from-blue-500 to-blue-600",
    yellow: "from-yellow-500 to-yellow-600",
    red: "from-red-500 to-red-600",
    green: "from-green-500 to-green-600"
} as const;

type CardVariant = keyof typeof CARD_VARIANTS;

const DashboardCard = ({ title, value, icon, variant }: { title: string; value: string | number; icon: React.ReactNode; variant: CardVariant }) => (
    <div className={`p-6 rounded-lg shadow-lg bg-gradient-to-br ${CARD_VARIANTS[variant]} text-white`}>
        <div className="flex items-center justify-between">
            <div>
                <p className="text-lg font-semibold">{title}</p>
                <p className="text-3xl font-bold">{value}</p>
            </div>
            <div className="text-4xl opacity-50">{icon}</div>
        </div>
    </div>
);

type RouterInstance = ReturnType<typeof useRouter>;

const OverdueItem = ({ item, router }: { item: OverdueableItem; router: RouterInstance }) => {
    const getViewUrl = () => {
        const pipelineId = item.pipelineId || 'default';
        const typeMap: Record<string, string> = {
            'RFQ': 'rfq',
            'Preprocess': 'preprocess',
            'Post Process': 'postprocess'
        };
        const stage = typeMap[item.type] || 'rfq';
        return `/crm/pipelines/${pipelineId}/${stage}`;
    };

    return (
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-red-100">
            <div className="flex-1">
                <p className="font-semibold text-gray-800">{item.company_name}</p>
                <p className="text-sm text-gray-500">
                    {item.type} - Deadline: {format(new Date(item.deadline), "dd MMM yyyy")}
                </p>
                <p className="text-xs text-red-600 mt-1">
                    Overdue by {Math.floor((Date.now() - new Date(item.deadline).getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
            </div>
            <div className="flex gap-2">
                <button
                    onClick={() => router.push(getViewUrl())}
                    className="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                >
                    View
                </button>
                <span className="px-2 py-1 text-xs font-bold text-red-600 bg-red-100 rounded">
                    OVERDUE
                </span>
            </div>
        </div>
    );
};

export default function DashboardPage() {
    const router = useRouter();
    const [userName] = useState("User"); // setUserName removed as it was unused
    const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
    const [showDateFilter, setShowDateFilter] = useState(false);
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
        try {
            const flatPipelines = readJson<FlatPipeline[]>(STORAGE_KEYS.HIERARCHICAL_PIPELINES, []);
            if (flatPipelines.length > 0) {
                const tree = pipelineHelpers.buildTree(flatPipelines);

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
            } else {
                setRejectedPipelines([]);
            }
        } catch (error) {
            console.error("Failed to load pipelines:", error);
            setRejectedPipelines([]);
        }

        const rfqs = readJson<RFQ[]>(STORAGE_KEYS.RFQ, []);
        const preprocess = readJson<PreprocessItem[]>(STORAGE_KEYS.PREPROCESS, []);
        const postprocess = readJson<PostProcessItem[]>(STORAGE_KEYS.POSTPROCESS, []);
        const completed = readJson<CompletedProject[]>(STORAGE_KEYS.COMPLETED_PROJECTS, []);
        const paymentPending = readJson<PaymentPendingItem[]>(STORAGE_KEYS.PAYMENT_PENDING, []);
        const gstPurchases = readJson<GstPurchaseItem[]>(STORAGE_KEYS.GST_PURCHASE, []);

        // Date filtering helper
        const isWithinDateRange = (dateStr: string) => {
            if (!dateRange.start || !dateRange.end) return true;
            const date = new Date(dateStr);
            const start = new Date(dateRange.start);
            const end = new Date(dateRange.end);
            end.setHours(23, 59, 59, 999); // Include the entire end date
            return date >= start && date <= end;
        };

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Apply date filtering to all data
        const filteredRfqs = rfqs.filter(item => isWithinDateRange(item.deadline));
        const filteredPreprocess = preprocess.filter(item => isWithinDateRange(item.deadline));
        const filteredPostprocess = postprocess.filter(item => isWithinDateRange(item.deadline));
        const filteredCompleted = completed.filter(item => isWithinDateRange(item.completion_date));

        const onTime = filteredCompleted.filter(p => new Date(p.completion_date) <= new Date(p.deadline)).length;
        const delayed = filteredCompleted.length - onTime;
        const ongoing = filteredPreprocess.length + filteredPostprocess.length;

        const overdueItems: OverdueableItem[] = [
            ...filteredRfqs.filter(item => new Date(item.deadline) < today).map(item => ({ ...item, type: 'RFQ' })),
            ...filteredPreprocess.filter(item => new Date(item.deadline) < today).map(item => ({ ...item, type: 'Preprocess' })),
            ...filteredPostprocess.filter(item => new Date(item.deadline) < today).map(item => ({ ...item, type: 'Post Process' }))
        ];

        const highPriorityPayments = gstPurchases.filter(item => item.paymentRequest === "High");
        const customerPendingTotal = paymentPending.reduce((sum, item) => sum + item.balance_due, 0);
        const supplierPendingTotal = gstPurchases
            .filter(item => item.paymentStatus === 'Unpaid' || item.paymentStatus === 'Partially paid')
            .reduce((sum, item) => sum + item.total, 0);

        setStats({ ongoing, pendingRfqs: filteredRfqs.length, onTime, delayed, overdueItems, highPriorityPayments, customerPendingTotal, supplierPendingTotal });

    }, [dateRange]);

    const pieChartData = [
        { name: 'Ongoing', value: stats.ongoing },
        { name: 'On-Time', value: stats.onTime },
        { name: 'Delayed', value: stats.delayed },
    ];
    const COLORS = ['#0088FE', '#00FFD0', '#FF8042'];

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-gray-800">Hi, {userName}</h1>
                <button
                    onClick={() => setShowDateFilter(!showDateFilter)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Calendar size={20} />
                    {dateRange.start && dateRange.end ? 'Change Date Filter' : 'Filter by Date'}
                </button>
            </div>

            {/* Date Filter Display */}
            {dateRange.start && dateRange.end && (
                <div className="mb-4 bg-blue-50 border-l-4 border-blue-500 rounded-lg p-4 shadow">
                    <div className="flex items-center gap-3">
                        <Calendar className="text-blue-600" size={24} />
                        <div>
                            <p className="font-semibold text-blue-900">Date Filter Applied</p>
                            <p className="text-blue-700">
                                Showing data from <span className="font-bold">{format(new Date(dateRange.start), 'MMM dd, yyyy')}</span> to <span className="font-bold">{format(new Date(dateRange.end), 'MMM dd, yyyy')}</span>
                            </p>
                        </div>
                        <button
                            onClick={() => setDateRange({ start: '', end: '' })}
                            className="ml-auto text-blue-600 hover:text-blue-800 font-semibold"
                        >
                            Clear Filter
                        </button>
                    </div>
                </div>
            )}

            {/* Date Filter Modal */}
            {showDateFilter && (
                <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Date Range</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <input
                                type="date"
                                value={dateRange.start}
                                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <input
                                type="date"
                                value={dateRange.end}
                                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4">
                        <button
                            onClick={() => {
                                setDateRange({ start: '', end: '' });
                                setShowDateFilter(false);
                            }}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                        >
                            Clear
                        </button>
                        <button
                            onClick={() => setShowDateFilter(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Apply Filter
                        </button>
                    </div>
                </div>
            )}

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
                                                <div className="mt-2 space-y-1">
                                                    <p className="text-xs text-gray-600">
                                                        <strong>Created:</strong> {format(new Date(pipeline.createdAt), "dd MMM yyyy, hh:mm a")}
                                                    </p>
                                                    {pipeline.rejectionInfo && (
                                                        <>
                                                            <p className="text-xs text-gray-600">
                                                                <strong>Rejected:</strong> {format(new Date(pipeline.rejectionInfo.rejectedAt), "dd MMM yyyy, hh:mm a")}
                                                            </p>
                                                            <p className="text-sm text-red-700 mt-1">
                                                                <strong>Reason:</strong> {pipeline.rejectionInfo.reason}
                                                            </p>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/crm/pipelines/${pipeline.id}/rfq`)}
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
                <DashboardCard title="Ongoing Works" value={stats.ongoing} icon={<Briefcase />} variant="blue" />
                <DashboardCard title="Pending RFQs" value={stats.pendingRfqs} icon={<Clock />} variant="yellow" />
                <DashboardCard title="Overdue Tasks" value={stats.overdueItems.length} icon={<AlertTriangle />} variant="red" />
                <DashboardCard title="Completed On-Time" value={stats.onTime} icon={<CheckCircle />} variant="green" />
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
                            stats.overdueItems.map(item => <OverdueItem key={item.id} item={item} router={router} />)
                        ) : <p className="text-gray-500">No overdue items. Great job!</p>}
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2"><FileWarning className="text-orange-500"/> High Priority Payments</h2>
                     <div className="space-y-3 max-h-60 overflow-y-auto">
                        {stats.highPriorityPayments.length > 0 ? (
                            stats.highPriorityPayments.map(item => (
                                <div key={item.id} className="flex justify-between items-center p-3 bg-orange-50 rounded-lg border border-orange-100">
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">{item.vendor}</p>
                                        <p className="text-sm text-gray-600">
                                            Amount: <span className="font-bold">{item.total.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Status: <span className={`font-medium ${
                                                item.paymentStatus === 'Paid' ? 'text-green-600' :
                                                item.paymentStatus === 'Unpaid' ? 'text-red-600' :
                                                'text-yellow-600'
                                            }`}>{item.paymentStatus}</span>
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="px-2 py-1 text-xs font-bold text-orange-700 bg-orange-200 rounded text-center">
                                            HIGH PRIORITY
                                        </span>
                                        <button
                                            onClick={() => router.push('/crm/company')}
                                            className="px-3 py-1 text-xs text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                                        >
                                            View
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : <p className="text-gray-500">No high priority payments.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
}
