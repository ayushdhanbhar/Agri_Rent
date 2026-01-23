import { useState, useEffect } from "react";

export default function useRecommendations(userId, userRole, location) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    fetch("/api/v1/ml/recommendations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: userId, user_role: userRole, location, recent_activity: [] })
    })
      .then((r) => r.json())
      .then((json) => {
        setData(json);
      })
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [userId, userRole, location]);

  return { loading, data, error };
}

