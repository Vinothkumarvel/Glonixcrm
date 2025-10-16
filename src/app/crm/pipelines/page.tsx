"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function PipelinesPage() {
  const router = useRouter();

  useEffect(() => {
    // Try to load from localStorage
    const storedPipelines = localStorage.getItem('hierarchicalPipelines');
    let defaultPipeline = null;
    
    if (storedPipelines) {
      try {
        const pipelines = JSON.parse(storedPipelines);
        // Use the first pipeline as default, if any exist
        if (pipelines && pipelines.length > 0) {
          defaultPipeline = pipelines[0].id;
        }
      } catch (e) {
        console.error('Error parsing stored pipelines:', e);
      }
    }
    
    // If no pipelines found, create a default one
    if (!defaultPipeline) {
      const defaultPipelineId = uuidv4();
      const defaultPipelines = [{
        id: defaultPipelineId,
        name: 'Default Pipeline',
        parentId: null
      }];
      localStorage.setItem('hierarchicalPipelines', JSON.stringify(defaultPipelines));
      defaultPipeline = defaultPipelineId;
    }
    
    // Redirect to the default pipeline's RFQ
    if (defaultPipeline) {
      router.push(`/crm/pipelines/${defaultPipeline}/rfq`);
    }
  }, [router]);

  return (
    <div className="flex justify-center items-center h-screen">
      <p className="text-xl text-gray-500">Loading pipeline...</p>
    </div>
  );
}