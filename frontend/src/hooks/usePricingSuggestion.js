import { useState, useEffect } from "react";

export default function usePricingSuggestion(equipmentId, currentPrice, region = null, utilization = null, forecastedDemand = null) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!equipmentId || !currentPrice) return;
    setLoading(true);
    setError(null);
    fetch("/api/v1/ml/pricing/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        equipment_id: equipmentId,
        current_price: Number(currentPrice),
        region,
        utilization,
        forecasted_demand: forecastedDemand
      })
    })
      .then((r) => r.json())
      .then((json) => setData(json))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [equipmentId, currentPrice, region, utilization, forecastedDemand]);

  return { loading, data, error };
}

