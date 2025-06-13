import pandas as pd
from sklearn.ensemble import IsolationForest
from flask import Flask, request, jsonify

# Create your model
model = IsolationForest(n_estimators=100, contamination=0.05, random_state=42)

# Sample training data (could be historical receipts)
def load_data():
    return pd.DataFrame([
        {"receiptTotal": 6.0, "taxAmount": 0.0, "salesAmountWithTax": 6.0, "taxPercent": 0.0},
        {"receiptTotal": 14.5, "taxAmount": 1.89, "salesAmountWithTax": 14.5, "taxPercent": 15.0},
        {"receiptTotal": 200.0, "taxAmount": 26.09, "salesAmountWithTax": 200.0, "taxPercent": 15.0},
        # Add more
    ])

df = load_data()
X = df[["receiptTotal", "taxAmount", "salesAmountWithTax", "taxPercent"]]
model.fit(X)

# Flask API
app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.json
    input_df = pd.DataFrame([data])
    X_input = input_df[["receiptTotal", "taxAmount", "salesAmountWithTax", "taxPercent"]]
    
    prediction = model.predict(X_input)[0]
    anomaly_score = model.decision_function(X_input)[0]
    
    return jsonify({
        "is_anomaly": prediction == -1,
        "anomaly_score": float(anomaly_score)
    })

if __name__ == '__main__':
    app.run(port=5000)
