"use client";

import { useState, useEffect } from "react";
import type { SystemMetric } from "@/types/database";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MetricsDashboard() {
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch("/api/metrics");
        if (!response.ok) {
          throw new Error("Failed to fetch metrics");
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetrics();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading metrics...</div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  // Group metrics by name
  const metricsByName: Record<string, SystemMetric[]> = {};
  metrics.forEach((metric) => {
    if (!metricsByName[metric.metric_name]) {
      metricsByName[metric.metric_name] = [];
    }
    metricsByName[metric.metric_name].push(metric);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {Object.entries(metricsByName).map(([metricName, metricData]) => (
        <Card key={metricName}>
          <CardHeader>
            <CardTitle>{metricName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-2xl font-bold">
                {metricData.length > 0
                  ? metricData[0].metric_value.toFixed(2)
                  : "N/A"}
              </div>
              <div className="text-sm text-muted-foreground">
                Last updated:{" "}
                {metricData.length > 0
                  ? new Date(metricData[0].timestamp).toLocaleString()
                  : "N/A"}
              </div>
              <div className="border rounded-md p-4 max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left pb-2">Value</th>
                      <th className="text-left pb-2">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metricData.map((metric, index) => (
                      <tr key={index} className="border-t">
                        <td className="py-2">
                          {metric.metric_value.toFixed(2)}
                        </td>
                        <td className="py-2">
                          {new Date(metric.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
