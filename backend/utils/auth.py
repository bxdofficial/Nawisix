from functools import wraps
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity, get_jwt, create_access_token, create_refresh_token
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import timedelta
import secrets
import string
from flask import jsonify, current_app
import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

def hash_password(password):
    """Hash a password for storing."""
    return generate_password_hash(password, method='pbkdf2:sha256')

def verify_password(stored_password, provided_password):
    """Check a stored password against a provided password."""
    return check_password_hash(stored_password, provided_password)

def generate_tokens(identity, is_admin=False, user_role=None, additional_claims=None):
    """Generate access and refresh tokens."""
    claims = {
        'is_admin': is_admin,
        'user_role': user_role
    }
    
    if additional_claims:
        claims.update(additional_claims)
    
    access_token = create_access_token(
        identity=identity,
        expires_delta=timedelta(hours=24),
        additional_claims=claims
    )
    
    refresh_token = create_refresh_token(
        identity=identity,
        expires_delta=timedelta(days=30),
        additional_claims=claims
    )
    
    return {
        'access_token': access_token,
        'refresh_token': refresh_token,
        'token_type': 'Bearer'
    }

def admin_required(f):
    """Decorator to require admin privileges."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        
        if not claims.get('is_admin', False):
            return jsonify({'error': 'Admin privileges required'}), 403
            
        return f(*args, **kwargs)
    return decorated_function

def user_required(f):
    """Decorator to require authenticated user."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        verify_jwt_in_request()
        return f(*args, **kwargs)
    return decorated_function

def role_required(*allowed_roles):
    """Decorator to require specific user roles."""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            verify_jwt_in_request()
            claims = get_jwt()
            
            user_role = claims.get('user_role')
            is_admin = claims.get('is_admin', False)
            
            # Admins always have access
            if is_admin:
                return f(*args, **kwargs)
            
            # Check if user has one of the allowed roles
            if user_role not in allowed_roles:
                return jsonify({
                    'error': f'Access denied. Required roles: {", ".join(allowed_roles)}'
                }), 403
                
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def generate_random_password(length=12):
    """Generate a random password."""
    characters = string.ascii_letters + string.digits + string.punctuation
    return ''.join(secrets.choice(characters) for _ in range(length))

def verify_google_token(token):
    """Verify Google OAuth token and return user info."""
    try:
        # Get the Google OAuth client ID from config
        client_id = current_app.config.get('GOOGLE_CLIENT_ID')
        
        if not client_id:
            return None, 'Google OAuth not configured'
        
        # Verify the token with Google
        idinfo = id_token.verify_oauth2_token(
            token, 
            google_requests.Request(), 
            client_id
        )
        
        # Token is valid, extract user information
        if idinfo['iss'] not in ['accounts.google.com', 'https://accounts.google.com']:
            return None, 'Invalid token issuer'
        
        user_info = {
            'google_id': idinfo['sub'],
            'email': idinfo.get('email'),
            'email_verified': idinfo.get('email_verified', False),
            'name': idinfo.get('name'),
            'picture': idinfo.get('picture'),
            'given_name': idinfo.get('given_name'),
            'family_name': idinfo.get('family_name'),
            'locale': idinfo.get('locale', 'en')
        }
        
        return user_info, None
        
    except ValueError as e:
        # Invalid token
        return None, f'Invalid token: {str(e)}'
    except Exception as e:
        return None, f'Error verifying token: {str(e)}'

def get_google_oauth_url():
    """Generate Google OAuth authorization URL."""
    client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    redirect_uri = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/auth/google/callback"
    
    if not client_id:
        return None
    
    # Google OAuth 2.0 authorization endpoint
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?"
        f"client_id={client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=openid email profile"
        f"&access_type=offline"
        f"&prompt=consent"
    )
    
    return auth_url

def exchange_google_code(code):
    """Exchange Google authorization code for tokens."""
    client_id = current_app.config.get('GOOGLE_CLIENT_ID')
    client_secret = current_app.config.get('GOOGLE_CLIENT_SECRET')
    redirect_uri = f"{current_app.config.get('FRONTEND_URL', 'http://localhost:3000')}/auth/google/callback"
    
    if not client_id or not client_secret:
        return None, 'Google OAuth not configured'
    
    # Exchange code for tokens
    token_url = 'https://oauth2.googleapis.com/token'
    
    data = {
        'code': code,
        'client_id': client_id,
        'client_secret': client_secret,
        'redirect_uri': redirect_uri,
        'grant_type': 'authorization_code'
    }
    
    try:
        response = requests.post(token_url, data=data)
        response.raise_for_status()
        
        tokens = response.json()
        
        # Verify the ID token
        user_info, error = verify_google_token(tokens['id_token'])
        
        if error:
            return None, error
            
        return user_info, None
        
    except requests.exceptions.RequestException as e:
        return None, f'Error exchanging code: {str(e)}'

def check_user_permissions(user_id, resource_type, action):
    """Check if a user has permission to perform an action on a resource."""
    from models import User, db
    
    user = User.query.get(user_id)
    if not user:
        return False
    
    # Admins have all permissions
    if user.is_admin:
        return True
    
    # Check resource-specific permissions
    permissions = {
        'design_request': {
            'view': ['student', 'teacher', 'content_creator', 'company'],
            'create': ['student', 'teacher', 'content_creator', 'company'],
            'edit': [],  # Users can only edit their own
            'delete': []  # Users can only delete their own
        },
        'portfolio': {
            'view': ['student', 'teacher', 'content_creator', 'company'],
            'create': [],
            'edit': [],
            'delete': []
        },
        'user': {
            'view': [],  # Users can only view their own profile
            'edit': [],  # Users can only edit their own profile
            'delete': []
        }
    }
    
    # Check if user's role has permission
    if resource_type in permissions and action in permissions[resource_type]:
        allowed_roles = permissions[resource_type][action]
        if user.user_role in allowed_roles:
            return True
    
    return False

def log_user_action(user_id, action, resource_type=None, resource_id=None, details=None, request=None):
    """Log user actions for audit trail."""
    from models import AuditLog, db
    
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=request.remote_addr if request else None,
        user_agent=request.user_agent.string if request else None
    )
    
    db.session.add(log_entry)
    db.session.commit()
    
    return log_entry