from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import random

app = Flask(__name__)
CORS(app)

# Load Dataset
try:
    df = pd.read_csv('equipment_dataset.csv')
    print("Dataset loaded successfully.")
except Exception as e:
    print(f"Error loading dataset: {e}")
    df = pd.DataFrame(columns=['category', 'equipment_name', 'district', 'price_per_hour', 'price_per_day'])

# --- Pre-train simple pricing model ---
# We will predict price_per_day based on equipment_name and district
X = df[['equipment_name', 'district']]
y = df['price_per_day']

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['equipment_name', 'district'])
    ])

price_model = Pipeline(steps=[('preprocessor', preprocessor),
                              ('regressor', LinearRegression())])

try:
    price_model.fit(X, y)
    print("Pricing model trained.")
except Exception as e:
    print(f"Error training pricing model: {e}")

# --- Data Mappings (Mock Knowledge Base) ---
CROP_EQUIPMENT_MAP = {
    "Wheat": ["Tractor", "Seed Drill", "Harvester", "Combine Harvester", "Thresher"],
    "Rice": ["Tractor", "Puddler", "Rice Transplanter", "Weeder", "Harvester"],
    "Sugarcane": ["Tractor", "Ridger", "Sugarcane Planter", "Sugarcane Harvester"],
    "Corn": ["Tractor", "Planter", "Combine Harvester"],
    "Cotton": ["Tractor", "Plough", "Cultivator", "Sprayer", "Cotton Picker"],
    "Vegetables": ["Rotavator", "Bed Maker", "Drip Irrigation System", "Sprayer"],
    "Fruits": ["Sprayer", "Pruning Machine", "Harvester"]
}

SEASONS = ["Kharif", "Rabi", "Zaid"]

@app.route('/predict-demand', methods=['POST'])
def predict_demand():
    """
    Predict demand score (0-100) based on equipment, location, and month.
    Since we lack historical booking data, we simulate this with heuristic logic.
    """
    data = request.json
    equipment_name = data.get('equipment')
    month = data.get('month', 'June') # Default to peak season start
    
    base_demand = random.randint(30, 70)
    
    # Heuristic: High demand for Sowing/Harvesting equipment in specific months
    high_demand_keywords = ["Harvester", "Sower", "Planter", "Transplanter"]
    if any(k in equipment_name for k in high_demand_keywords):
        base_demand += 20
        
    return jsonify({
        "demand_score": min(100, max(0, base_demand)),
        "demand_level": "High" if base_demand > 75 else "Medium" if base_demand > 40 else "Low"
    })

@app.route('/smart-pricing', methods=['POST'])
def smart_pricing():
    """
    Predict optimal rental price.
    """
    data = request.json
    equipment_name = data.get('equipment')
    district = data.get('district')
    
    input_df = pd.DataFrame([{'equipment_name': equipment_name, 'district': district}])
    
    try:
        predicted_price = price_model.predict(input_df)[0]
        # Add some "dynamic" fluctuation based on demand
        demand_factor = random.uniform(0.9, 1.1)
        final_price = max(100, round(predicted_price * demand_factor, 2))
        
        return jsonify({
            "suggested_price": final_price,
            "market_average": round(predicted_price, 2),
            "currency": "INR"
        })
    except:
        # Fallback if model fails
        return jsonify({
            "suggested_price": 500,
            "market_average": 500,
            "currency": "INR"
        })

@app.route('/recommend', methods=['POST'])
def recommend():
    """
    Recommend equipment based on crop type.
    """
    data = request.json
    crop = data.get('crop')
    land_size = data.get('land_size', 1)
    
    recommended_names = CROP_EQUIPMENT_MAP.get(crop, ["Tractor", "Sprayer"]) # Default
    
    # Filter dataset for these items to get real examples (random sample)
    results = []
    for name in recommended_names:
        matches = df[df['equipment_name'].str.contains(name, case=False, na=False)]
        if not matches.empty:
            sample = matches.sample(1).iloc[0]
            results.append({
                "equipment_name": sample['equipment_name'],
                "category": sample['category'],
                "avg_price": float(sample['price_per_day'])
            })
            
    return jsonify({
        "recommendations": results
    })

@app.route('/impact-analytics', methods=['POST'])
def impact_analytics():
    """
    Calculate productivity savings.
    """
    data = request.json
    hours_used = data.get('hours_used', 10)
    equipment_type = data.get('equipment_type', 'Tractor')
    
    # Mock savings calculation
    manual_labor_hours = hours_used * 10 # 1 machine hour = 10 man hours
    cost_saving_per_hour = 500 # vs manual labor cost
    
    total_savings = hours_used * cost_saving_per_hour
    
    return jsonify({
        "manual_hours_saved": manual_labor_hours,
        "efficiency_increase": "1000%",
        "cost_savings": total_savings
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
