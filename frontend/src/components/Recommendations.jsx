import React from "react";
import useRecommendations from "../hooks/useRecommendations";

export default function Recommendations({ userId, userRole, location }) {
  const { loading, data, error } = useRecommendations(userId, userRole, location);

  if (loading) return <div>Loading recommendations...</div>;
  if (error) return <div>Error loading recommendations.</div>;
  if (!data || !data.recommendations?.length) return <div>No recommendations available.</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-bold mb-2">Recommended for you</h3>
      <ul className="space-y-2">
        {data.recommendations.map((r) => (
          <li key={r.equipment_id} className="flex justify-between items-center p-2 border rounded">
            <div>
              <div className="font-semibold">{r.equipment_id}</div>
              <div className="text-sm text-gray-500">Score: {r.score}</div>
            </div>
            {r.suggested_price && <div className="text-right">₹{r.suggested_price}</div>}
          </li>
        ))}
      </ul>
    </div>
  );
}

