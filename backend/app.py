from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity, get_jwt
from datetime import datetime
import os
from werkzeug.utils import secure_filename

from config import Config
from models import db, User, Service, Portfolio, DesignRequest, Design, ContactMessage
from utils.auth import hash_password, verify_password, generate_tokens, admin_required, user_required
from utils.email import mail, send_contact_form_email, send_design_request_confirmation

app = Flask(__name__, static_folder='build', static_url_path='')
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
mail.init_app(app)
jwt = JWTManager(app)
CORS(app)

# Create upload directory
os.makedirs(os.path.join(app.root_path, app.config['UPLOAD_FOLDER']), exist_ok=True)

# Initialize database and seed data
def init_db():
    with app.app_context():
        db.create_all()
        
        # Create admin user if not exists
        admin = User.query.filter_by(email=app.config['ADMIN_EMAIL']).first()
        if not admin:
            admin = User(
                email=app.config['ADMIN_EMAIL'],
                username='admin',
                password_hash=hash_password(app.config['ADMIN_PASSWORD']),
                is_admin=True
            )
            db.session.add(admin)
        
        # Seed services if empty
        if Service.query.count() == 0:
            services = [
                {
                    'title': 'Logo Design',
                    'title_ar': 'تصميم الشعارات',
                    'description': 'Professional logo design that captures your brand identity',
                    'description_ar': 'تصميم شعار احترافي يعكس هوية علامتك التجارية',
                    'icon': 'brush',
                    'price_range': '$200 - $500',
                    'order_num': 1
                },
                {
                    'title': 'Social Media Design',
                    'title_ar': 'تصميم السوشيال ميديا',
                    'description': 'Eye-catching posts, stories, and reels for all platforms',
                    'description_ar': 'منشورات وستوريز وريلز جذابة لجميع المنصات',
                    'icon': 'share',
                    'price_range': '$100 - $300',
                    'order_num': 2
                },
                {
                    'title': 'Brand Identity',
                    'title_ar': 'الهوية البصرية',
                    'description': 'Complete brand identity package including guidelines',
                    'description_ar': 'حزمة هوية بصرية كاملة مع دليل الاستخدام',
                    'icon': 'palette',
                    'price_range': '$500 - $1500',
                    'order_num': 3
                },
                {
                    'title': 'Print Design',
                    'title_ar': 'تصميم المطبوعات',
                    'description': 'Business cards, flyers, brochures, and marketing materials',
                    'description_ar': 'كروت شخصية، فلايرز، بروشورات، ومواد تسويقية',
                    'icon': 'print',
                    'price_range': '$150 - $400',
                    'order_num': 4
                }
            ]
            
            for service_data in services:
                service = Service(**service_data)
                db.session.add(service)
        
        # Seed sample portfolio items if empty
        if Portfolio.query.count() == 0:
            portfolio_items = [
                {
                    'title': 'Tech Startup Brand Identity',
                    'title_ar': 'هوية بصرية لشركة تقنية ناشئة',
                    'description': 'Complete brand identity for innovative tech startup',
                    'description_ar': 'هوية بصرية كاملة لشركة تقنية ناشئة مبتكرة',
                    'category': 'branding',
                    'image_url': '/static/uploads/portfolio1.jpg',
                    'client_name': 'TechVision Inc.',
                    'tags': 'branding,logo,identity',
                    'is_featured': True,
                    'order_num': 1
                },
                {
                    'title': 'Restaurant Social Media Campaign',
                    'title_ar': 'حملة سوشيال ميديا لمطعم',
                    'description': 'Creative social media designs for restaurant launch',
                    'description_ar': 'تصاميم سوشيال ميديا إبداعية لافتتاح مطعم',
                    'category': 'social',
                    'image_url': '/static/uploads/portfolio2.jpg',
                    'client_name': 'Taste Paradise',
                    'tags': 'social,instagram,posts',
                    'is_featured': True,
                    'order_num': 2
                }
            ]
            
            for item_data in portfolio_items:
                portfolio = Portfolio(**item_data)
                db.session.add(portfolio)
        
        db.session.commit()

# API Routes

@app.route('/api/health')
def health_check():
    return jsonify({'status': 'healthy', 'timestamp': datetime.utcnow().isoformat()})

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['email', 'username', 'password']
        for field in required:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Check if user exists
        if User.query.filter_by(email=data['email']).first():
            return jsonify({'message': 'Email already registered'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'message': 'Username already taken'}), 400
        
        # Create new user
        user = User(
            email=data['email'],
            username=data['username'],
            password_hash=hash_password(data['password']),
            is_admin=False
        )
        
        db.session.add(user)
        db.session.commit()
        
        # Generate tokens
        tokens = generate_tokens(user)
        
        return jsonify({
            'message': 'Registration successful',
            **tokens
        }), 201
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        if not data.get('email') or not data.get('password'):
            return jsonify({'message': 'Email and password required'}), 400
        
        # Find user by email
        user = User.query.filter_by(email=data['email']).first()
        
        if not user or not verify_password(user.password_hash, data['password']):
            return jsonify({'message': 'Invalid email or password'}), 401
        
        # Generate tokens
        tokens = generate_tokens(user)
        
        return jsonify({
            'message': 'Login successful',
            **tokens
        }), 200
        
    except Exception as e:
        return jsonify({'message': str(e)}), 500

@app.route('/api/auth/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    current_user = get_jwt_identity()
    user = User.query.get(current_user)
    if not user:
        return jsonify({'message': 'User not found'}), 404
    
    tokens = generate_tokens(user)
    return jsonify(tokens), 200

# Services Routes
@app.route('/api/services')
def get_services():
    services = Service.query.filter_by(is_active=True).order_by(Service.order_num).all()
    return jsonify([{
        'id': s.id,
        'title': s.title,
        'title_ar': s.title_ar,
        'description': s.description,
        'description_ar': s.description_ar,
        'icon': s.icon,
        'price_range': s.price_range
    } for s in services])

@app.route('/api/services', methods=['POST'])
@admin_required()
def create_service():
    data = request.get_json()
    service = Service(**data)
    db.session.add(service)
    db.session.commit()
    return jsonify({'message': 'Service created', 'id': service.id}), 201

# Portfolio Routes
@app.route('/api/portfolio')
def get_portfolio():
    category = request.args.get('category')
    query = Portfolio.query.filter_by(is_active=True)
    
    if category:
        query = query.filter_by(category=category)
    
    portfolio = query.order_by(Portfolio.order_num, Portfolio.created_at.desc()).all()
    
    return jsonify([{
        'id': p.id,
        'title': p.title,
        'title_ar': p.title_ar,
        'description': p.description,
        'description_ar': p.description_ar,
        'category': p.category,
        'image_url': p.image_url,
        'thumbnail_url': p.thumbnail_url or p.image_url,
        'client_name': p.client_name,
        'tags': p.tags.split(',') if p.tags else [],
        'is_featured': p.is_featured
    } for p in portfolio])

@app.route('/api/portfolio', methods=['POST'])
@admin_required()
def create_portfolio():
    data = request.get_json()
    portfolio = Portfolio(**data)
    db.session.add(portfolio)
    db.session.commit()
    return jsonify({'message': 'Portfolio item created', 'id': portfolio.id}), 201

# Contact Routes
@app.route('/api/contact', methods=['POST'])
def contact():
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('name') or not data.get('email') or not data.get('message'):
            return jsonify({'message': 'Name, email, and message are required'}), 400
        
        # Save to database
        contact_msg = ContactMessage(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            subject=data.get('subject'),
            message=data['message']
        )
        db.session.add(contact_msg)
        db.session.commit()
        
        # Send email
        send_contact_form_email(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            subject=data.get('subject'),
            message=data['message']
        )
        
        return jsonify({
            'message': 'Thank you for your message. We will get back to you soon!',
            'success': True
        }), 200
        
    except Exception as e:
        app.logger.error(f"Contact form error: {str(e)}")
        return jsonify({'message': 'An error occurred. Please try again later.'}), 500

# Design Request Routes
@app.route('/api/requests', methods=['POST'])
def create_design_request():
    try:
        data = request.get_json()
        
        # Validate required fields
        required = ['name', 'email', 'service_type', 'project_description']
        for field in required:
            if field not in data:
                return jsonify({'message': f'{field} is required'}), 400
        
        # Create request
        design_request = DesignRequest(
            name=data['name'],
            email=data['email'],
            phone=data.get('phone'),
            company=data.get('company'),
            service_type=data['service_type'],
            project_description=data['project_description'],
            budget_range=data.get('budget_range'),
            deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None,
            user_id=get_jwt_identity() if request.headers.get('Authorization') else None
        )
        
        db.session.add(design_request)
        db.session.commit()
        
        # Send confirmation email
        send_design_request_confirmation(
            name=data['name'],
            email=data['email'],
            service_type=data['service_type']
        )
        
        return jsonify({
            'message': 'Your design request has been submitted successfully!',
            'request_id': design_request.id
        }), 201
        
    except Exception as e:
        app.logger.error(f"Design request error: {str(e)}")
        return jsonify({'message': 'An error occurred. Please try again.'}), 500

@app.route('/api/requests')
@user_required()
def get_my_requests():
    user_id = get_jwt_identity()
    requests = DesignRequest.query.filter_by(user_id=user_id).order_by(DesignRequest.created_at.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'service_type': r.service_type,
        'project_description': r.project_description,
        'status': r.status,
        'created_at': r.created_at.isoformat(),
        'deadline': r.deadline.isoformat() if r.deadline else None
    } for r in requests])

# Admin Routes
@app.route('/api/admin/requests')
@admin_required()
def get_all_requests():
    requests = DesignRequest.query.order_by(DesignRequest.created_at.desc()).all()
    
    return jsonify([{
        'id': r.id,
        'name': r.name,
        'email': r.email,
        'phone': r.phone,
        'company': r.company,
        'service_type': r.service_type,
        'project_description': r.project_description,
        'budget_range': r.budget_range,
        'deadline': r.deadline.isoformat() if r.deadline else None,
        'status': r.status,
        'notes': r.notes,
        'created_at': r.created_at.isoformat()
    } for r in requests])

@app.route('/api/admin/requests/<int:request_id>', methods=['PATCH'])
@admin_required()
def update_request_status(request_id):
    design_request = DesignRequest.query.get_or_404(request_id)
    data = request.get_json()
    
    if 'status' in data:
        design_request.status = data['status']
    if 'notes' in data:
        design_request.notes = data['notes']
    
    design_request.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Request updated successfully'})

@app.route('/api/admin/messages')
@admin_required()
def get_contact_messages():
    messages = ContactMessage.query.order_by(ContactMessage.created_at.desc()).all()
    
    return jsonify([{
        'id': m.id,
        'name': m.name,
        'email': m.email,
        'phone': m.phone,
        'subject': m.subject,
        'message': m.message,
        'is_read': m.is_read,
        'is_replied': m.is_replied,
        'created_at': m.created_at.isoformat()
    } for m in messages])

@app.route('/api/admin/messages/<int:message_id>/read', methods=['PATCH'])
@admin_required()
def mark_message_read(message_id):
    message = ContactMessage.query.get_or_404(message_id)
    message.is_read = True
    db.session.commit()
    return jsonify({'message': 'Message marked as read'})

# File Upload Routes
@app.route('/api/upload', methods=['POST'])
@admin_required()
def upload_file():
    if 'file' not in request.files:
        return jsonify({'message': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'message': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{filename}"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(os.path.join(app.root_path, filepath))
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename,
            'url': f'/static/uploads/{filename}'
        }), 200
    
    return jsonify({'message': 'Invalid file type'}), 400

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

# Serve React App
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)