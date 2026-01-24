from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split   # ✅ ADDED
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
X = df[['equipment_name', 'district']]
y = df['price_per_day']

# ✅ ADDED: Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), ['equipment_name', 'district'])
    ])

price_model = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('regressor', LinearRegression())
])

try:
    price_model.fit(X_train, y_train)
    print("Pricing model trained.")

    # ✅ ADDED: Print accuracy (R² score)
    print("Training Accuracy (R²):", round(price_model.score(X_train, y_train), 3))
    print("Testing Accuracy (R²):", round(price_model.score(X_test, y_test), 3))

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
    data = request.json
    equipment_name = data.get('equipment')
    month = data.get('month', 'June')
    
    base_demand = random.randint(30, 70)
    
    high_demand_keywords = ["Harvester", "Sower", "Planter", "Transplanter"]
    if any(k in equipment_name for k in high_demand_keywords):
        base_demand += 20
        
    return jsonify({
        "demand_score": min(100, max(0, base_demand)),
        "demand_level": "High" if base_demand > 75 else "Medium" if base_demand > 40 else "Low"
    })

@app.route('/smart-pricing', methods=['POST'])
def smart_pricing():
    data = request.json
    equipment_name = data.get('equipment')
    district = data.get('district')
    
    input_df = pd.DataFrame([{'equipment_name': equipment_name, 'district': district}])
    
    try:
        predicted_price = price_model.predict(input_df)[0]
        demand_factor = random.uniform(0.9, 1.1)
        final_price = max(100, round(predicted_price * demand_factor, 2))
        
        return jsonify({
            "suggested_price": final_price,
            "market_average": round(predicted_price, 2),
            "currency": "INR"
        })
    except:
        return jsonify({
            "suggested_price": 500,
            "market_average": 500,
            "currency": "INR"
        })

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.json
    crop = data.get('crop')
    land_size = data.get('land_size', 1)
    
    recommended_names = CROP_EQUIPMENT_MAP.get(crop, ["Tractor", "Sprayer"])
    
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
            
    return jsonify({"recommendations": results})

@app.route('/impact-analytics', methods=['POST'])
def impact_analytics():
    data = request.json
    hours_used = data.get('hours_used', 10)
    equipment_type = data.get('equipment_type', 'Tractor')
    
    manual_labor_hours = hours_used * 10
    cost_saving_per_hour = 500
    
    total_savings = hours_used * cost_saving_per_hour
    
    return jsonify({
        "manual_hours_saved": manual_labor_hours,
        "efficiency_increase": "1000%",
        "cost_savings": total_savings
    })

if __name__ == '__main__':
    app.run(port=5000, debug=True)
