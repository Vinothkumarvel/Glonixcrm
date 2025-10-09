'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Clock, CheckCircle, Briefcase, Users } from "lucide-react";

export default function CRMPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");

  const workData = [
    { label: "Today Works", value: 5, color: "#00B050" },
    { label: "Ongoing Works", value: 3, color: "#0066FF" },
    { label: "Pending Works", value: 2, color: "#FF0000" },
    { label: "Upcoming Works", value: 4, color: "#FFA500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Greeting */}
      <h1 className="text-3xl font-bold mb-6">Hi {userName} 👋</h1>

      {/* Work Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {workData.map((work, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-gray-700">{work.label}</span>
            </div>
            <p className="text-3xl font-bold" style={{ color: work.color }}>{work.value}</p>
          </div>
        ))}
      </div>

      {/* Navigate Button */}
      <button
        onClick={() => router.push("/crm/pipelines/dashboard")}
        className="mt-4 px-6 py-3 bg-blue-900 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors"
      >
        Go to Pipelines
      </button>
    </div>
  );
}
