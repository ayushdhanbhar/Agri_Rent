import React from "react";
import usePricingSuggestion from "../hooks/usePricingSuggestion";

export default function PricingSuggestion({ equipmentId, currentPrice, region, utilization, forecastedDemand }) {
  const { loading, data, error } = usePricingSuggestion(equipmentId, currentPrice, region, utilization, forecastedDemand);

  if (!equipmentId) return null;
  if (loading) return <div className="p-4 bg-white rounded shadow">Loading pricing suggestion...</div>;
  if (error) return <div className="p-4 bg-white rounded shadow">Error loading suggestion.</div>;
  if (!data) return null;

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-bold mb-2">Pricing Suggestion</h3>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-gray-500">Equipment</div>
          <div className="font-semibold">{equipmentId}</div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Suggested</div>
          <div className="font-bold text-lg">₹{data.suggested_price}</div>
          <div className="text-xs text-gray-500">{data.adjustment_percentage}% — {data.reason}</div>
        </div>
      </div>
    </div>
  );
}

