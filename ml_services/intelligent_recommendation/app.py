import os
import traceback
from flask import Flask, request, jsonify
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.exceptions import NotFittedError

# --- Config ---
DATA_PATH = os.path.join(os.path.dirname(__file__), 'equipment_recommendation_dataset.csv')

# --- Demo Dataset (synthetic, can be replaced with real) ---
SYNTHETIC_DATA = [
    {'land_size': 'small', 'crop_type': 'wheat', 'farming_stage': 'preparation', 'equipment': 'Plough'},
    {'land_size': 'small', 'crop_type': 'wheat', 'farming_stage': 'sowing', 'equipment': 'Seed Drill'},
    {'land_size': 'small', 'crop_type': 'wheat', 'farming_stage': 'growing', 'equipment': 'Sprayer'},
    {'land_size': 'small', 'crop_type': 'wheat', 'farming_stage': 'harvesting', 'equipment': 'Sickle'},
    {'land_size': 'medium', 'crop_type': 'rice', 'farming_stage': 'preparation', 'equipment': 'Rotavator'},
    {'land_size': 'medium', 'crop_type': 'rice', 'farming_stage': 'sowing', 'equipment': 'Transplanter'},
    {'land_size': 'medium', 'crop_type': 'rice', 'farming_stage': 'growing', 'equipment': 'Sprayer'},
    {'land_size': 'medium', 'crop_type': 'rice', 'farming_stage': 'harvesting', 'equipment': 'Combine Harvester'},
    {'land_size': 'large', 'crop_type': 'cotton', 'farming_stage': 'preparation', 'equipment': 'Tractor'},
    {'land_size': 'large', 'crop_type': 'cotton', 'farming_stage': 'sowing', 'equipment': 'Planter'},
    {'land_size': 'large', 'crop_type': 'cotton', 'farming_stage': 'growing', 'equipment': 'Sprayer'},
    {'land_size': 'large', 'crop_type': 'cotton', 'farming_stage': 'harvesting', 'equipment': 'Cotton Picker'},
    # Add more rows for demo robustness
    {'land_size': 'small', 'crop_type': 'vegetables', 'farming_stage': 'preparation', 'equipment': 'Hoe'},
    {'land_size': 'medium', 'crop_type': 'vegetables', 'farming_stage': 'growing', 'equipment': 'Sprayer'},
    {'land_size': 'large', 'crop_type': 'sugarcane', 'farming_stage': 'harvesting', 'equipment': 'Sugarcane Harvester'},
]

# --- Model Trainer ---
def get_training_data():
    if os.path.exists(DATA_PATH):
        try:
            return pd.read_csv(DATA_PATH)
        except Exception:
            pass
    return pd.DataFrame(SYNTHETIC_DATA)

def train_model():
    df = get_training_data()
    features = ['land_size', 'crop_type', 'farming_stage']
    target = 'equipment'
    X = df[features]
    y = df[target]
    # Encode categorical features
    encoders = {col: LabelEncoder().fit(X[col]) for col in features}
    X_enc = pd.DataFrame({col: encoders[col].transform(X[col]) for col in features})
    target_encoder = LabelEncoder().fit(y)
    y_enc = target_encoder.transform(y)
    model = RandomForestClassifier(n_estimators=30, random_state=42)
    model.fit(X_enc, y_enc)
    return model, encoders, target_encoder, features

# --- Flask App ---
app = Flask(__name__)

try:
    model, encoders, target_encoder, features = train_model()
except Exception as e:
    model = None
    encoders = None
    target_encoder = None
    features = ['land_size', 'crop_type', 'farming_stage']
    print('Model training failed:', e)

@app.route('/ml/intelligent-recommendation', methods=['POST'])
def recommend_equipment():
    try:
        data = request.get_json(force=True)
        # Validate input
        for f in features:
            if f not in data:
                return jsonify({
                    'recommended_equipment': []
                }), 400
        available_equipment = data.get('available_equipment', [])
        # Encode input
        try:
            X_input_dict = {f: [encoders[f].transform([data[f]])[0]] for f in features}
            X_input_df = pd.DataFrame(X_input_dict)
        except Exception:
            return jsonify({
                'recommended_equipment': []
            }), 400
        # Predict
        try:
            pred = model.predict(X_input_df)
            top_idx = pred[0]
            equipment = target_encoder.inverse_transform([top_idx])[0]
            # Filter with available equipment
            if equipment in available_equipment:
                return jsonify({
                    'recommended_equipment': [equipment]
                })
            else:
                return jsonify({
                    'recommended_equipment': ["Equipment not available"]
                })
        except NotFittedError:
            return jsonify({
                'recommended_equipment': []
            }), 500
    except Exception as ex:
        print(traceback.format_exc())
        return jsonify({
            'recommended_equipment': []
        }), 500

@app.route('/ml/intelligent-recommendation/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5055, debug=True)
