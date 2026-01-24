# Intelligent Equipment Recommendation Service

This is an isolated Flask-based ML microservice for recommending agricultural equipment based on land size, crop type, and farming stage.

## How to Run

1. **Install dependencies:**
   ```bash
   pip install flask pandas scikit-learn
   ```
2. **Start the service:**
   ```bash
   python app.py
   ```
   The service will run on port 5055 by default.

## API Usage

### POST /ml/intelligent-recommendation

**Request Body:**
```
{
  "land_size": "small | medium | large",
  "crop_type": "string",
  "farming_stage": "string"
}
```

**Response:**
```
{
  "recommended_equipment": ["equipment1"],
  "confidence": 0.95
}
```

- Returns an empty list and error message for invalid input or if no recommendation is found.

### GET /ml/intelligent-recommendation/health
- Returns `{ "status": "ok" }` if the service is running.

## Notes
- This service is fully isolated and does not affect any existing ML logic.
- The model is trained on a small synthetic dataset for demo purposes.
- You can expand `equipment_recommendation_dataset.csv` for more robust recommendations.
