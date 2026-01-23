const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:9000";
const ML_API_KEY = process.env.ML_API_KEY || "dev-key";

async function callML(path, body = {}, headers = {}) {
  const url = `${ML_SERVICE_URL}${path}`;
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ML_API_KEY,
      ...headers
    },
    body: JSON.stringify(body),
    // set a reasonable timeout via AbortController if needed (omitted for brevity)
  };

  const resp = await fetch(url, opts);
  if (!resp.ok) {
    const txt = await resp.text();
    const err = new Error(`ML service error ${resp.status}: ${txt}`);
    err.status = resp.status;
    throw err;
  }
  return await resp.json();
}

module.exports = {
  recommend: async (payload, forwardHeaders = {}) => {
    return await callML("/api/v1/recommendations", payload, forwardHeaders);
  },
  pricingSuggest: async (payload, forwardHeaders = {}) => {
    return await callML("/api/v1/pricing/suggest", payload, forwardHeaders);
  },
  runForecast: async (payload = {}, forwardHeaders = {}) => {
    return await callML("/api/v1/forecast/run", payload, forwardHeaders);
  }
};

