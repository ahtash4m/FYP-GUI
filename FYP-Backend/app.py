from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import time
import uuid
import datetime
import base64
import urllib.parse
import os
import json
from functools import wraps
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
    role = db.Column(db.String(20), nullable=False, default='patient')
    
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
    __table_args__ = {'schema': 'dbo'}
    plan_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    acne_type = db.Column(db.String(50), nullable=False)
    severity = db.Column(db.String(50), nullable=False)
    recommended_treatment = db.Column(db.Text, nullable=False)

def get_treatment_protocol(predicted_label, confidence_val=None):
    """Fetches mapped clinical treatment protocol from SQL Server and formats OTC steps."""
    plan = TreatmentPlan.query.filter_by(acne_type=predicted_label).first()
    if plan:
        raw_sentences = plan.recommended_treatment.replace('\n', '.').split('.')
        otc_steps = [
            {"rank": idx + 1, "label": sentence.strip() + "."}
            for idx, sentence in enumerate(raw_sentences) if sentence.strip()
        ]
        description = f"Severity: {plan.severity}."
    else:
        description = f"Condition classified as {predicted_label}. Maintain a consistent, gentle skincare routine."
        otc_steps = [
            {"rank": 1, "label": "Wash face twice daily with a mild cleanser."},
            {"rank": 2, "label": "Apply an oil-free moisturizer."},
            {"rank": 3, "label": "Use SPF 30+ sunscreen during the day."}
        ]
    return description, otc_steps

# --- ADMIN ACCESS DECORATOR ---
def admin_required():
    def wrapper(fn):
        @wraps(fn)
        @jwt_required()
        def decorator(*args, **kwargs):
            try:
                current_user_id = int(get_jwt_identity())
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid token"}), 401
                
            user = User.query.get(current_user_id)
            if not user or user.role.lower() != 'admin':
                return jsonify({"error": "Admin privileges required"}), 403
            return fn(*args, **kwargs)
        return decorator
    return wrapper

# --- SYSTEM SETTINGS PERSISTENCE ---
SETTINGS_FILE = os.path.join(app.root_path, 'system_settings.json')

DEFAULT_SETTINGS = {
    "enableNewRegistrations": True,
    "defaultLanguage": "English",
    "modelVersion": "MobileNetV2 (8-Class Ultimate)",
    "confidenceThresholdPercent": 75
}

def load_system_settings():
    if os.path.exists(SETTINGS_FILE):
        try:
            with open(SETTINGS_FILE, 'r') as f:
                return {**DEFAULT_SETTINGS, **json.load(f)}
        except Exception:
            return DEFAULT_SETTINGS.copy()
    return DEFAULT_SETTINGS.copy()

def save_system_settings(data):
    current = load_system_settings()
    for k in ["enableNewRegistrations", "defaultLanguage", "modelVersion", "confidenceThresholdPercent"]:
        if k in data:
            current[k] = data[k]
    with open(SETTINGS_FILE, 'w') as f:
        json.dump(current, f, indent=2)
    return current

# ---------------------------------------------------------
# AUTHENTICATION ROUTES
# ---------------------------------------------------------

@app.route('/api/auth/register', methods=['POST'])
def register():
    settings = load_system_settings()
    if not settings.get('enableNewRegistrations', True):
        return jsonify({"error": "New user registrations are currently disabled by the administrator"}), 403

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
    new_user = User(email=email, password_hash=hashed_password, role='patient')
    
    db.session.add(new_user)
    db.session.commit()
    
    # Generate token
    access_token = create_access_token(identity=str(new_user.user_id))
    
    return jsonify({
        "user": {
            "id": str(new_user.user_id),
            "email": new_user.email,
            "role": new_user.role.lower() if new_user.role else 'patient'
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
            "role": user.role.lower() if user.role else 'patient'
        },
        "token": access_token
    }), 200


# --- ADMIN ROUTES ---

@app.route('/api/admin/treatments', methods=['GET'])
@admin_required()
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
@admin_required()
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
@admin_required()
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
@admin_required()
def delete_treatment(plan_id):
    plan = TreatmentPlan.query.get_or_404(plan_id)
    db.session.delete(plan)
    db.session.commit()
    return jsonify({"message": "Treatment plan deleted successfully"}), 200


@app.route('/api/admin/stats', methods=['GET'])
@admin_required()
def get_admin_stats():
    total_users = User.query.count()
    
    today_start = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    scans_today = ScanHistory.query.filter(ScanHistory.timestamp >= today_start).count()
    
    settings = load_system_settings()
    threshold = float(settings.get('confidenceThresholdPercent', 75))
    pending_reviews = ScanHistory.query.filter(ScanHistory.confidence < threshold).count()
    
    system_status = "active" if acne_model is not None else "degraded"
    
    return jsonify({
        "totalUsers": total_users,
        "scansToday": scans_today,
        "pendingReviews": pending_reviews,
        "systemStatus": system_status
    }), 200

@app.route('/api/admin/stats/acne-types', methods=['GET'])
@admin_required()
def get_acne_stats():
    days = request.args.get('days', default=30, type=int)
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=days)
    
    counts_query = db.session.query(
        ScanHistory.predicted_type, 
        db.func.count(ScanHistory.scan_id)
    ).filter(ScanHistory.timestamp >= cutoff).group_by(ScanHistory.predicted_type).all()
    
    counts_dict = {row[0]: row[1] for row in counts_query}
    
    data = []
    for label in CLASS_LABELS.values():
        data.append({
            "type": label,
            "count": counts_dict.get(label, 0)
        })
        
    for t, c in counts_dict.items():
        if t not in CLASS_LABELS.values():
            data.append({"type": t, "count": c})
            
    return jsonify(data), 200

@app.route('/api/admin/activity', methods=['GET'])
@admin_required()
def get_activity_log():
    recent_scans = db.session.query(ScanHistory, User).outerjoin(
        User, ScanHistory.user_id == User.user_id
    ).order_by(ScanHistory.timestamp.desc()).limit(20).all()
    
    activities = []
    for scan, user in recent_scans:
        user_identifier = user.email.split('@')[0] if user else f"User_{scan.user_id}"
        activities.append({
            "date": scan.timestamp.strftime("%Y-%m-%d %H:%M"),
            "userId": user_identifier,
            "action": f"Scan Classified ({scan.predicted_type})",
            "status": "Success" if float(scan.confidence) >= 50 else "Low Confidence"
        })
        
    return jsonify(activities), 200

@app.route('/api/admin/users', methods=['GET'])
@admin_required()
def get_admin_users():
    users_with_scans = db.session.query(
        User,
        db.func.count(ScanHistory.scan_id).label("total_scans")
    ).outerjoin(
        ScanHistory, User.user_id == ScanHistory.user_id
    ).group_by(
        User.user_id, User.email, User.password_hash, User.role
    ).order_by(User.user_id.asc()).all()
    
    result = []
    for user, total_scans in users_with_scans:
        display_name = user.email.split('@')[0].replace('.', ' ').title()
        result.append({
            "userId": f"USR-{user.user_id:03d}",
            "fullName": display_name,
            "email": user.email,
            "registrationDate": "Active Account",
            "totalScans": total_scans
        })
        
    return jsonify(result), 200

@app.route('/api/admin/users/<string:user_id>', methods=['DELETE'])
@admin_required()
def delete_admin_user(user_id):
    clean_id = user_id.replace("USR-", "").lstrip("0")
    if not clean_id:
        clean_id = "0"
    try:
        numeric_id = int(clean_id)
    except ValueError:
        return jsonify({"error": "Invalid user ID"}), 400
        
    current_admin_id = int(get_jwt_identity())
    if numeric_id == current_admin_id:
        return jsonify({"error": "Cannot delete your own admin account"}), 400
        
    user = User.query.get_or_404(numeric_id)
    ScanHistory.query.filter_by(user_id=numeric_id).delete()
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully"}), 200

@app.route('/api/admin/settings', methods=['GET'])
@admin_required()
def get_settings():
    settings = load_system_settings()
    return jsonify(settings), 200

@app.route('/api/admin/settings', methods=['PATCH'])
@admin_required()
def update_settings():
    data = request.get_json() or {}
    updated = save_system_settings(data)
    return jsonify(updated), 200

@app.route('/api/admin/backup', methods=['GET'])
@admin_required()
def download_backup():
    users = [{"user_id": u.user_id, "email": u.email, "role": u.role} for u in User.query.all()]
    plans = [{
        "plan_id": p.plan_id,
        "acne_type": p.acne_type,
        "severity": p.severity,
        "recommended_treatment": p.recommended_treatment
    } for p in TreatmentPlan.query.all()]
    scans = [{
        "scan_id": s.scan_id,
        "user_id": s.user_id,
        "image_url": s.image_url,
        "predicted_type": s.predicted_type,
        "confidence": float(s.confidence),
        "timestamp": s.timestamp.isoformat()
    } for s in ScanHistory.query.all()]
    
    backup_data = {
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "database": "acne_fyp_db",
        "tables": {
            "users": users,
            "treatment_plans": plans,
            "scan_history": scans
        }
    }
    
    backup_dir = os.path.join(app.root_path, 'static', 'backups')
    os.makedirs(backup_dir, exist_ok=True)
    filename = f"acne_fyp_backup_{datetime.datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.json"
    filepath = os.path.join(backup_dir, filename)
    with open(filepath, 'w') as f:
        json.dump(backup_data, f, indent=2)
        
    return jsonify({
        "message": "Full database backup generated successfully",
        "fileName": filename,
        "downloadUrl": f"{request.host_url}static/backups/{filename}",
        "recordCounts": {
            "users": len(users),
            "treatmentPlans": len(plans),
            "scanHistory": len(scans)
        }
    }), 200

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
    description, otc_steps = get_treatment_protocol(predicted_label, confidence_val)

    return jsonify({
        "scanId": str(new_scan.scan_id),
        "predictedLabel": predicted_label,
        "description": description,
        "imageUrl": image_url,
        "otcSteps": otc_steps
    }), 201

@app.route('/api/scans', methods=['GET'])
@jwt_required()
def get_scan_history():
    current_user_id = int(get_jwt_identity())
    # Fetch scans for this specific user, newest first
    scans = ScanHistory.query.filter_by(user_id=current_user_id).order_by(ScanHistory.timestamp.desc()).all()
    
    # Matches the ScanListItem interface perfectly
    result = [{
        "scanId": str(s.scan_id),
        "createdAt": s.timestamp.isoformat() + "Z",
        "predictedLabel": s.predicted_type
    } for s in scans]
    
    return jsonify(result), 200

@app.route('/api/scans/<int:scan_id>', methods=['GET'])
@jwt_required()
def get_single_scan(scan_id):
    current_user_id = int(get_jwt_identity())
    # Ensure the user can only fetch their own scans
    scan = ScanHistory.query.filter_by(scan_id=scan_id, user_id=current_user_id).first_or_404()
    
    confidence_val = float(scan.confidence)
    description, otc_steps = get_treatment_protocol(scan.predicted_type, confidence_val)
    
    # Matches the ScanResult interface perfectly
    return jsonify({
        "scanId": str(scan.scan_id),
        "predictedLabel": scan.predicted_type,
        "description": description,
        "imageUrl": scan.image_url,
        "otcSteps": otc_steps 
    }), 200

with app.app_context():
    db.create_all()
    print("--> [DATABASE] MS SQL Tables verified/created successfully!")


@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/static/backups/<filename>')
def downloaded_backup(filename):
    backup_dir = os.path.join(app.root_path, 'static', 'backups')
    return send_from_directory(backup_dir, filename, as_attachment=True)

if __name__ == '__main__':
    # Run the server on port 5000
    print("Starting Hollow Flask Backend on [http://127.0.0.1:5000](http://127.0.0.1:5000)")
    app.run(debug=True, port=5000)