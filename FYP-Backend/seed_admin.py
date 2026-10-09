from app import app, db, User
from werkzeug.security import generate_password_hash

def create_admin():
    with app.app_context():
        # Check if admin already exists
        admin = User.query.filter_by(email='admin@test.com').first()
        if admin:
            print("Admin already exists!")
            return

        # Create a new admin user with a securely hashed password
        hashed_password = generate_password_hash('admin123')
        new_admin = User(email='admin@test.com', password_hash=hashed_password, role='admin')
        
        db.session.add(new_admin)
        db.session.commit()
        print("Admin user created successfully! (email: admin@test.com, password: admin123)")

if __name__ == '__main__':
    create_admin()