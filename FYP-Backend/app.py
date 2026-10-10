from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import time
import uuid
import datetime
import base64
import urllib
import datetime
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
# Enable CORS so your Vite frontend (port 5173) can talk to Flask (port 5000)
CORS(app, supports_credentials=True)

# --- DATABASE CONFIGURATION ---
# We use urllib to safely encode your Windows Authentication connection string
params = urllib.parse.quote_plus(
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=HAMDAN-VICTUS\SQLEXPRESS;'
    r'DATABASE=acne_fyp_db;'
    r'Trusted_Connection=yes;'
)
app.config['SQLALCHEMY_DATABASE_URI'] = "mssql+pyodbc:///?odbc_connect=%s" % params
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

class TreatmentPlan(db.Model):
    __tablename__ = 'Treatment_Plans'
    __table_args__ = {'schema': 'dbo'}

    plan_id = db.Column(db.Integer, primary_key=True)
    acne_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    recommended_treatment = db.Column(db.Text, nullable=False) # -1 length indicates varchar(max)

app.config['JWT_SECRET_KEY'] = 'your-super-secret-fyp-key-change-later' # Keep this safe!
jwt = JWTManager(app)

import os
import numpy as np
from PIL import Image
import tensorflow as tf
from tensorflow.keras.models import load_model
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input

# Load the model once when Flask starts
MODEL_PATH = os.path.join(os.path.dirname(__file__), 'model', 'acne_classifier_ultimate.h5')
acne_model = load_model(MODEL_PATH)

# The updated 8-class mapping (matches the clean training data)
CLASS_LABELS = {
    0: 'acne-closed-comedo', 
    1: 'acne-cystic', 
    2: 'acne-open-comedo',
    3: 'acne-pustular', 
    4: 'hidradenitis-suppurativa', 
    5: 'perioral-dermatitis', 
    6: 'pigmentation', 
    7: 'rosacea'
}


OTC_RECOMMENDATIONS = {
    'acne-closed-comedo': {
        "description": "The AI detected closed comedones (whiteheads). Consistent chemical exfoliation is key to clearing trapped sebum beneath the skin surface.",
        "steps": [
            {"rank": 1, "label": "Wash daily with a gentle Salicylic Acid (BHA) cleanser to unclog pores."},
            {"rank": 2, "label": "Apply a topical retinoid (like Adapalene gel) at night to speed up cell turnover."},
            {"rank": 3, "label": "Use a lightweight, non-comedogenic moisturizer to prevent the skin from overproducing oil."}
        ]
    },
    'acne-cystic': {
        "description": "The AI detected cystic acne, characterized by deep, inflamed bumps. This requires gentle care to avoid scarring, and a dermatologist visit is highly recommended.",
        "steps": [
            {"rank": 1, "label": "Wash with a hydrating, non-foaming cleanser. Avoid harsh scrubbing which worsens inflammation."},
            {"rank": 2, "label": "Spot treat cysts with a thin layer of 2.5% Benzoyl Peroxide to target deep bacteria."},
            {"rank": 3, "label": "Apply a warm compress for 10 minutes to soothe pain, followed by a barrier-repairing moisturizer."}
        ]
    },
    'acne-open-comedo': {
        "description": "The AI detected open comedones (blackheads). These occur when oxidized sebum and dead skin cells stretch the pores.",
        "steps": [
            {"rank": 1, "label": "Use a leave-on 2% Salicylic Acid (BHA) liquid exfoliant to dissolve oil inside the pore."},
            {"rank": 2, "label": "Incorporate a Niacinamide serum to help regulate sebum production and visibly tighten pores."},
            {"rank": 3, "label": "Apply an oil-free gel moisturizer to maintain hydration without clogging pores."}
        ]
    },
    'acne-pustular': {
        "description": "The AI detected pustular acne, presenting as inflamed bumps with visible pus. The focus should be on reducing inflammation and extracting impurities safely.",
        "steps": [
            {"rank": 1, "label": "Wash your face twice daily with a gentle, non-comedogenic cleanser."},
            {"rank": 2, "label": "Apply hydrocolloid pimple patches over active pustules to safely absorb fluid overnight."},
            {"rank": 3, "label": "Apply a lightweight moisturizer to protect the skin barrier and prevent dryness."}
        ]
    },
    'hidradenitis-suppurativa': {
        "description": "The AI detected visual signs associated with Hidradenitis Suppurativa. This is a chronic inflammatory condition that requires professional medical treatment.",
        "steps": [
            {"rank": 1, "label": "Wash the affected areas gently with an antibacterial soap (like chlorhexidine or benzoyl peroxide wash)."},
            {"rank": 2, "label": "Apply warm compresses to painful nodules to help soothe inflammation."},
            {"rank": 3, "label": "Wear loose-fitting clothing to minimize friction. Consult a dermatologist immediately for prescription management."}
        ]
    },
    'perioral-dermatitis': {
        "description": "The AI detected perioral dermatitis, an inflammatory rash typically around the mouth. Less is more when treating this condition.",
        "steps": [
            {"rank": 1, "label": "Stop using all harsh active ingredients, exfoliants, and heavy cosmetics immediately."},
            {"rank": 2, "label": "Wash the area strictly with warm water or an ultra-mild, fragrance-free cleanser."},
            {"rank": 3, "label": "Apply a thin layer of a basic, soothing zinc-based barrier cream. Avoid all steroid creams."}
        ]
    },
    'pigmentation': {
        "description": "The AI detected post-inflammatory hyperpigmentation or dark spots left behind by healed acne.",
        "steps": [
            {"rank": 1, "label": "Wash with a gentle cleanser to prep the skin."},
            {"rank": 2, "label": "Apply a Vitamin C or Alpha Arbutin serum in the morning to actively brighten dark spots."},
            {"rank": 3, "label": "Apply a broad-spectrum SPF 30+ sunscreen every day. UV exposure darkens existing pigmentation."}
        ]
    },
    'rosacea': {
        "description": "The AI detected rosacea, characterized by facial redness and visible blood vessels. The goal is to calm the skin and avoid known triggers.",
        "steps": [
            {"rank": 1, "label": "Cleanse with an ultra-gentle, hydrating face wash. Avoid hot water, which increases redness."},
            {"rank": 2, "label": "Apply an OTC Azelaic Acid serum to help reduce inflammation and diffuse redness."},
            {"rank": 3, "label": "Protect the skin daily with a mineral sunscreen (Zinc Oxide/Titanium Dioxide) to block UV triggers."}
        ]
    }
}

# --- UPLOAD CONFIGURATION ---
UPLOAD_FOLDER = os.path.join(app.root_path, 'static', 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # Cap uploads at 5MB limit


# --- DATABASE MODELS ---
class User(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='Patient')
    
    # Relationship to scans
    scans = db.relationship('ScanHistory', backref='patient', lazy=True)

class ScanHistory(db.Model):
    __tablename__ = 'Scan_History'
    scan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    image_url = db.Column(db.String(255), nullable=False)
    predicted_type = db.Column(db.String(50), nullable=False)
    confidence = db.Column(db.Numeric(5, 2), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.datetime.utcnow)

class TreatmentPlan(db.Model):
    __tablename__ = 'Treatment_Plans'
    plan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    acne_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    recommended_treatment = db.Column(db.Text, nullable=False)

# ---------------------------------------------------------
# AUTHENTICATION ROUTES
# ---------------------------------------------------------

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    # display_name or role hints can also be captured here if your frontend sends them
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
        
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "User already exists"}), 409
        
    # Hash the password and save to DB
    hashed_password = generate_password_hash(password)
    new_user = User(email=email, password_hash=hashed_password, role='Patient')
    
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token
    access_token = create_access_token(identity=str(new_user.user_id))
    
    return jsonify({
        "user": {
            "id": str(new_user.user_id),
            "email": new_user.email,
            "role": new_user.role
        },
        "token": access_token
    }), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    # Find user by email
    user = User.query.filter_by(email=email).first()
    
    # Verify user exists and password matches
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password"}), 401
        
    # Generate token
    access_token = create_access_token(identity=str(user.user_id))
    
    return jsonify({
        "user": {
            "id": str(user.user_id),
            "email": user.email,
            "role": user.role
        },
        "token": access_token
    }), 200


# --- ADMIN TREATMENT ROUTES (UPDATED) ---

@app.route('/api/admin/treatments', methods=['GET'])
@jwt_required()
def get_treatments():
    plans = TreatmentPlan.query.all()
    result = [{
        "id": str(p.plan_id),
        "acneType": p.acne_type,
        "severity": p.severity,
        "recommendedTreatment": p.recommended_treatment
    } for p in plans]
    return jsonify(result), 200

@app.route('/api/admin/treatments', methods=['POST'])
@jwt_required()
def create_treatment():
    data = request.get_json()
    new_plan = TreatmentPlan(
        acne_type=data.get('acneType', 'Unknown'),
        severity=data.get('severity', 'Unknown'),
        recommended_treatment=data.get('recommendedTreatment', '')
    )
    db.session.add(new_plan)
    db.session.commit()
    
    return jsonify({
        "id": str(new_plan.plan_id),
        "acneType": new_plan.acne_type,
        "severity": new_plan.severity,
        "recommendedTreatment": new_plan.recommended_treatment
    }), 201

@app.route('/api/admin/treatments/<int:plan_id>', methods=['PATCH'])
@jwt_required()
def update_treatment(plan_id):
    data = request.get_json()
    plan = TreatmentPlan.query.get_or_404(plan_id)
    
    if 'acneType' in data:
        plan.acne_type = data['acneType']
    if 'severity' in data:
        plan.severity = data['severity']
    if 'recommendedTreatment' in data:
        plan.recommended_treatment = data['recommendedTreatment']
        
    db.session.commit()
    
    return jsonify({
        "id": str(plan.plan_id),
        "acneType": plan.acne_type,
        "severity": plan.severity,
        "recommendedTreatment": plan.recommended_treatment
    }), 200

@app.route('/api/admin/treatments/<int:plan_id>', methods=['DELETE'])
@jwt_required()
def delete_treatment(plan_id):
    plan = TreatmentPlan.query.get_or_404(plan_id)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": "Treatment plan deleted successfully"}), 200


@app.route('/api/admin/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    return jsonify({"totalScans": 0, "activeUsers": 0, "criticalCases": 0, "systemHealth": 100}), 200

@app.route('/api/admin/stats/acne-types', methods=['GET'])
@jwt_required()
def get_acne_stats():
    return jsonify([]), 200

@app.route('/api/admin/activity', methods=['GET'])
@jwt_required()
def get_activity_log():
    return jsonify([]), 200

@app.route('/api/admin/users', methods=['GET'])
@jwt_required()
def get_admin_users():
    return jsonify([]), 200

@app.route('/api/admin/settings', methods=['GET'])
@jwt_required()
def get_settings():
    return jsonify({"maintenanceMode": False, "allowNewRegistrations": True, "maxUploadSizeMb": 5, "aiConfidenceThreshold": 75}), 200

# --- PATIENT SCAN ROUTES ---

@app.route('/api/scans', methods=['POST'])
@jwt_required()
def process_scan():
    # Identify which user is uploading the image
    current_user_id = int(get_jwt_identity())

    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(file.filename)
    unique_filename = f"{int(time.time())}_{filename}"
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
    file.save(file_path)

    image_url = f"{request.host_url}static/uploads/{unique_filename}"

    # --- START OF REAL AI INFERENCE LOGIC ---
    # 1. Open and format the image for MobileNetV2
    img = Image.open(file_path).convert('RGB')
    img = img.resize((224, 224))
    img_array = np.array(img)

    # TensorFlow expects a batch of images, so we add a dummy dimension: (1, 224, 224, 3)
    img_array = np.expand_dims(img_array, axis=0)
    img_array = preprocess_input(img_array)

    # 2. Run inference on the T4-trained model
    predictions = acne_model.predict(img_array)
    predicted_index = int(np.argmax(predictions[0]))
    confidence_val = round(float(np.max(predictions[0])) * 100, 2)

    # 3. Map the numerical prediction to the medical string
    predicted_label = CLASS_LABELS.get(predicted_index, "Unknown")
    # --- END OF REAL AI INFERENCE LOGIC ---

    # Save the record to the MS SQL Database
    new_scan = ScanHistory(
        user_id=current_user_id,
        image_url=image_url,
        predicted_type=predicted_label,
        confidence=confidence_val
    )
    db.session.add(new_scan)
    db.session.commit()
    
    # Fetch the treatment plan directly from SQL Server
    plan = TreatmentPlan.query.filter_by(acne_type=predicted_label).first()

    if plan:
        # Parse the block of text into distinct steps by splitting at periods or newlines
        raw_sentences = plan.recommended_treatment.replace('\n', '.').split('.')
        otc_steps = [
            {"rank": idx + 1, "label": sentence.strip() + "."}
            for idx, sentence in enumerate(raw_sentences) if sentence.strip()
        ]
        
        description = f"Severity: {plan.severity}. (Confidence: {confidence_val}%)"
    else:
        # Fallback if the AI classifies a type not yet in the database
        description = f"Condition classified as {predicted_label}. Maintain a consistent, gentle skincare routine. (Confidence: {confidence_val}%)"
        otc_steps = [
            {"rank": 1, "label": "Wash face twice daily with a mild cleanser."},
            {"rank": 2, "label": "Apply an oil-free moisturizer."},
            {"rank": 3, "label": "Use SPF 30+ sunscreen during the day."}
        ]

    return jsonify({
        "scanId": str(new_scan.scan_id),
        "predictedLabel": predicted_label,
        "confidencePercent": confidence_val,
        "description": description,
        "imageUrl": image_url,
        "otcSteps": otc_steps
    }), 201

@app.route('/api/scans', methods=['GET'])
@jwt_required()
def get_scan_history():
    current_user_id = get_jwt_identity()
    # Fetch scans for this specific user, newest first
    scans = ScanHistory.query.filter_by(user_id=current_user_id).order_by(ScanHistory.timestamp.desc()).all()
    
    # Matches the ScanListItem interface perfectly
    result = [{
        "scanId": str(s.scan_id),
        "createdAt": s.timestamp.isoformat() + "Z",
        "predictedLabel": s.predicted_type,
        "confidencePercent": float(s.confidence)
    } for s in scans]
    
    return jsonify(result), 200

@app.route('/api/scans/<int:scan_id>', methods=['GET'])
@jwt_required()
def get_single_scan(scan_id):
    current_user_id = get_jwt_identity()
    # Ensure the user can only fetch their own scans
    scan = ScanHistory.query.filter_by(scan_id=scan_id, user_id=current_user_id).first_or_404()
    
    # Matches the ScanResult interface perfectly
    return jsonify({
        "scanId": str(scan.scan_id),
        "predictedLabel": scan.predicted_type,
        "confidencePercent": float(scan.confidence),
        "description": "Historical scan retrieved from database.",
        "imageUrl": scan.image_url,
        "otcSteps": [] 
    }), 200

with app.app_context():
    db.create_all()
    print("--> [DATABASE] MS SQL Tables verified/created successfully!")


from flask import send_from_directory

@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    # Run the server on port 5000
    print("Starting Hollow Flask Backend on [http://127.0.0.1:5000](http://127.0.0.1:5000)")
    app.run(debug=True, port=5000)