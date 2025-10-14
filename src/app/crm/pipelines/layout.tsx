"use client";

import PipelineNavbar from "../components/PipelineNavbar";

export default function PipelinesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PipelineNavbar />
      <main className="mx-auto px-6 py-8">{children}</main>
    </div>
  );
}