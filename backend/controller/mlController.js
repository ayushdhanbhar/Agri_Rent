const mlClient = require("../services/mlClient");

const mlController = {
  recommendations: async (req, res) => {
    try {
      const payload = req.body || {};
      // Forward auth header if present
      const forwardHeaders = {};
      if (req.headers.authorization) forwardHeaders["Authorization"] = req.headers.authorization;

      const result = await mlClient.recommend(payload, forwardHeaders);
      res.json(result);
    } catch (err) {
      console.error("ML recommendations error:", err);
      res.status(err.status || 500).json({ error: "ML service error", detail: err.message });
    }
  },

  pricingSuggest: async (req, res) => {
    try {
      const payload = req.body || {};
      const forwardHeaders = {};
      if (req.headers.authorization) forwardHeaders["Authorization"] = req.headers.authorization;

      const result = await mlClient.pricingSuggest(payload, forwardHeaders);
      res.json(result);
    } catch (err) {
      console.error("ML pricing error:", err);
      res.status(err.status || 500).json({ error: "ML service error", detail: err.message });
    }
  },

  runForecast: async (req, res) => {
    try {
      const payload = req.body || {};
      const result = await mlClient.runForecast(payload, {});
      res.json(result);
    } catch (err) {
      console.error("ML forecast error:", err);
      res.status(err.status || 500).json({ error: "ML service error", detail: err.message });
    }
  }
};

module.exports = mlController;

