import React, { useState } from "react";
import { Card } from "./ui/Card";

const API_BASE = "http://localhost:8000";

const LAND_SIZE_OPTIONS = [
  { value: "small", label: "Small" },
  { value: "medium", label: "Medium" },
  { value: "large", label: "Large" },
];
const FARMING_STAGE_OPTIONS = [
  { value: "preparation", label: "Preparation" },
  { value: "sowing", label: "Sowing" },
  { value: "growing", label: "Growing" },
  { value: "harvesting", label: "Harvesting" },
];
const CROP_TYPE_OPTIONS = [
  "wheat",
  "rice",
  "cotton",
  "sugarcane",
  "vegetables",
  // Add more as needed
];

export default function IntelligentEquipmentRecommendation() {
  const [landSize, setLandSize] = useState("");
  const [cropType, setCropType] = useState("");
  const [farmingStage, setFarmingStage] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/ml/intelligent-recommendation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          land_size: landSize,
          crop_type: cropType,
          farming_stage: farmingStage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      setResult(data);
    } catch (err) {
      setError(err.message || "Failed to get recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow mt-4">
      <h3 className="font-bold mb-2">Intelligent Equipment Recommendation</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block font-medium">Land Size</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={landSize}
            onChange={(e) => setLandSize(e.target.value)}
            required
          >
            <option value="">Select Land Size</option>
            {LAND_SIZE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Crop Type</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={cropType}
            onChange={(e) => setCropType(e.target.value)}
            required
          >
            <option value="">Select Crop Type</option>
            {CROP_TYPE_OPTIONS.map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium">Farming Stage</label>
          <select
            className="border rounded px-2 py-1 w-full"
            value={farmingStage}
            onChange={(e) => setFarmingStage(e.target.value)}
            required
          >
            <option value="">Select Stage</option>
            {FARMING_STAGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          disabled={loading}
        >
          {loading ? "Loading..." : "Get Recommendation"}
        </button>
      </form>
      {error && <div className="text-red-600 mt-2">{error}</div>}
      {result && (
        <div className="mt-4">
          <div className="font-semibold mb-2">Recommended Equipment:</div>
          {result.recommended_equipment && result.recommended_equipment.length > 0 ? (
            result.recommended_equipment[0] && result.recommended_equipment[0].name === undefined && result.recommended_equipment[0]._id === undefined ? (
              <div className="text-red-600 mt-2">Equipment not available</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {result.recommended_equipment.map((eq, i) => (
                  <Card key={eq._id || i} className="flex flex-col gap-2">
                    <div className="font-bold text-lg">{eq.name || eq.subCategory}</div>
                    <div className="text-sm text-gray-600">Category: {eq.category}</div>
                    <div className="text-sm">Rate/Hour: <span className="font-semibold">₹{eq.ratePerHour}</span></div>
                    <div className="text-sm">Rate/Day: <span className="font-semibold">₹{eq.ratePerDay}</span></div>
                    <div className="text-sm">District: {eq.district}</div>
                    <div className="text-sm">Availability: <span className={eq.availability ? "text-green-600" : "text-red-600"}>{eq.availability ? "Available" : "Unavailable"}</span></div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div>No recommendation found.</div>
          )}
        </div>
      )}
    </div>
  );
}
