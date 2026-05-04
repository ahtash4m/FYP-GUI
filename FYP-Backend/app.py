from flask import Flask, request, jsonify
from flask_cors import CORS
import time
import uuid
import datetime
import base64

app = Flask(__name__)
# Enable CORS so your Vite frontend (port 5173) can talk to Flask (port 5000)
CORS(app, supports_credentials=True)

# ---------------------------------------------------------
# AUTHENTICATION ROUTES
# ---------------------------------------------------------

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email', '')
    
    # Print to console to show evaluators that data is reaching the server
    print(f"--> [LOGIN ATTEMPT] Email: {email}")
    
    # Fake a small network delay
    time.sleep(0.5)
    
    # Determine role based on email (just like the frontend mock did)
    role = "admin" if "admin" in email.lower() else "patient"
    
    # Return the expected AuthUser JSON
    return jsonify({
        "id": str(uuid.uuid4()),
        "email": email,
        "displayName": email.split('@')[0].capitalize(),
        "role": role,
        "avatarUrl": None
    }), 200

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email', '')
    display_name = data.get('display_name', '')
    
    print(f"--> [REGISTER ATTEMPT] Email: {email}, Name: {display_name}")
    time.sleep(0.5)
    
    return jsonify({
        "id": str(uuid.uuid4()),
        "email": email,
        "displayName": display_name or "New User",
        "role": "patient",
        "avatarUrl": None
    }), 200

# ---------------------------------------------------------
# SCAN & AI PROCESSING ROUTE
# ---------------------------------------------------------

@app.route('/api/scans', methods=['POST'])
def process_scan():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400
        
    file = request.files['image']
    print(f"--> [SCAN UPLOAD] Received file: {file.filename}")
    
    # --- NEW: Convert the uploaded image to a Base64 Data URI ---
    image_data = file.read()
    base64_encoded = base64.b64encode(image_data).decode('utf-8')
    mime_type = file.mimetype # e.g., 'image/jpeg'
    data_uri = f"data:{mime_type};base64,{base64_encoded}"
    # ------------------------------------------------------------
    
    # FAKE THE AI PROCESSING DELAY
    print("--> [AI] Running Convolutional Neural Network... (Simulated)")
    time.sleep(3.0)
    
    return jsonify({
        "scanId": str(uuid.uuid4()),
        "predictedLabel": "Moderate Papulopustular Acne",
        "confidencePercent": 88,
        "description": "Papules and pustules present. Requires gentle cleansing and topical treatment.",
        "imageUrl": data_uri, # <-- We pass the Base64 image back here!
        "highlightRegion": { "x": 50, "y": 50, "width": 20, "height": 20 },
        "otcSteps": [
            {
                "rank": 1,
                "label": "Wash face twice daily with a mild, non-comedogenic cleanser."
            },
            {
                "rank": 2,
                "label": "Apply a 2.5% Benzoyl Peroxide gel to the affected areas."
            },
            {
                "rank": 3,
                "label": "Use an oil-free moisturizer to protect the skin barrier."
            }
        ]
    }), 200 


@app.route('/api/scans', methods=['GET'])
def get_scan_history():
    print("--> [SCAN HISTORY] Fetching user scan history...")
    # Returning a hardcoded history list based on your frontend's expected format
    return jsonify([
        {
            "scanId": "scan_101",
            "createdAt": datetime.datetime.utcnow().isoformat() + "Z",
            "predictedLabel": "Mild Comedonal Acne",
            "confidencePercent": 88
        },
        {
            "scanId": "scan_099",
            "createdAt": (datetime.datetime.utcnow() - datetime.timedelta(days=5)).isoformat() + "Z",
            "predictedLabel": "Moderate Pustular Acne",
            "confidencePercent": 91
        }
    ]), 200

if __name__ == '__main__':
    # Run the server on port 5000
    print("Starting Hollow Flask Backend on [http://127.0.0.1:5000](http://127.0.0.1:5000)")
    app.run(debug=True, port=5000)