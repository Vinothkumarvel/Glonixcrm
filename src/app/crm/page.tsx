'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DollarSign, Clock, CheckCircle, Briefcase, Users } from "lucide-react";

export default function CRMPage() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>("User");
  const [loading, setLoading] = useState(true);

  const workData = [
    { label: "Today Works", value: 5, color: "#00B050" },
    { label: "Ongoing Works", value: 3, color: "#0066FF" },
    { label: "Pending Works", value: 2, color: "#FF0000" },
    { label: "Upcoming Works", value: 4, color: "#FFA500" },
  ];

  useEffect(() => {
    async function validateTokens() {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      if (!accessToken || !refreshToken) {
        router.push("/login");
        return;
      }

      try {
        // Replace this with your actual token refresh API
        const res = await fetch("https://web-production-6baf3.up.railway.app/api/auth/token/refresh/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!res.ok) throw new Error("Failed to refresh token");

        const data = await res.json();
        localStorage.setItem("accessToken", data.access);

        // Example: get user name from token / API
        setUserName("John Doe"); // replace with actual user data
        setLoading(false);
      } catch (err) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        router.push("/login");
      }
    }

    validateTokens();
  }, [router]);

  if (loading) return <h1 className="text-2xl text-center mt-10">Loading...</h1>;

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
