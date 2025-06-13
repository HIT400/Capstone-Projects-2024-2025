import sqlite3
import pandas as pd
import json
from flask import Flask, request, jsonify
from sklearn.ensemble import IsolationForest
# ─── Configuration ─────────────────────────────────────────────────────────────
DB_PATH  = r"C:/fiscalization.db"
FEATURES = [
    "receiptGlobalNo",
    "receiptTotal",
    "taxAmount",
    "salesAmountWithTax",
    "taxPercent"
]
app = Flask(__name__)
# ─── Database Helpers ──────────────────────────────────────────────────────────
def get_db_connection():
    """Open (and create if needed) the SQLite database file."""
    return sqlite3.connect(DB_PATH)

def load_raw_receipts():
    """
    Load raw JSON bodies and global numbers into a DataFrame.
    Alias receiptJsonbody as receiptJsonBody for consistent parsing.
    """
    conn = get_db_connection()
    df = pd.read_sql_query(
        """
        SELECT
          receiptGlobalNo,
          receiptJsonbody AS receiptJsonBody
        FROM submittedReceipts
        """,
        conn
    )
    conn.close()
    return df

def parse_receipt_rows(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Parse each JSON receipt, extract features, and build a DataFrame.
    """
    records = []
    for _, row in raw_df.iterrows():
        raw_json  = row['receiptJsonBody']
        global_no = row['receiptGlobalNo']
        try:
            data    = json.loads(raw_json)
            receipt = data.get('receipt', {})
            total   = float(receipt.get('receiptTotal', 0))
            for tax in receipt.get('receiptTaxes', []):
                records.append({
                    "receiptGlobalNo":    int(global_no),
                    "receiptTotal":       total,
                    "taxAmount":          float(tax.get('taxAmount', 0)),
                    "salesAmountWithTax": float(
                                              tax.get(
                                                'SalesAmountwithTax',
                                                tax.get('salesAmountWithTax', 0)
                                              )
                                           ),
                    "taxPercent":         float(tax.get('taxPercent', 0))
                })
        except Exception as e:
            print(f"Error parsing JSON for ID {global_no}: {e}")
    return pd.DataFrame(records)

# ─── Model Training ────────────────────────────────────────────────────────────
def train_model() -> IsolationForest:
    raw_df = load_raw_receipts()
    df     = parse_receipt_rows(raw_df)
    X      = df[FEATURES]
    model  = IsolationForest(
        n_estimators=150,
        max_samples='auto',
        contamination=0.02,
        random_state=42
    )
    model.fit(X)
    return model

# Train on startup
model = train_model()

# ─── API Endpoint ──────────────────────────────────────────────────────────────
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json(force=True)
        # Validate required features
        missing = [f for f in FEATURES if f not in data]
        if missing:
            return jsonify({"error": f"Missing features: {missing}"}), 400

        # Prepare DataFrame for inference
        input_df = pd.DataFrame([data], columns=FEATURES)

        # Perform anomaly detection
        pred  = model.predict(input_df)[0]
        score = model.decision_function(input_df)[0]

        return jsonify({
            "is_anomaly":   bool(pred == -1),
            "anomaly_score": round(float(score), 4),
            "details":      data
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

