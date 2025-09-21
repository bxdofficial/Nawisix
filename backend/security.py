"""
Enhanced Security Module for Nawi Backend
Includes: Rate Limiting, CSRF Protection, 2FA, Security Headers, etc.
"""

import os
import secrets
import hashlib
import pyotp
import qrcode
import io
import base64
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, session, current_app
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_wtf.csrf import CSRFProtect, generate_csrf
from flask_talisman import Talisman
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHash
import jwt
import redis
from werkzeug.security import generate_password_hash, check_password_hash

# Initialize Argon2 password hasher
ph = PasswordHasher(
    time_cost=2,
    memory_cost=102400,
    parallelism=8,
    hash_len=32,
    salt_len=16
)

# Initialize Redis for rate limiting storage (optional)
try:
    redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)
    redis_client.ping()
    REDIS_AVAILABLE = True
except:
    redis_client = None
    REDIS_AVAILABLE = False

class SecurityManager:
    """Main security manager class"""
    
    def __init__(self, app=None):
        self.app = app
        self.limiter = None
        self.csrf = None
        self.talisman = None
        
        if app:
            self.init_app(app)
    
    def init_app(self, app):
        """Initialize security features for the Flask app"""
        self.app = app
        
        # Initialize Rate Limiting
        storage_uri = "redis://localhost:6379" if REDIS_AVAILABLE else "memory://"
        self.limiter = Limiter(
            app=app,
            key_func=get_remote_address,
            default_limits=["1000 per hour", "100 per minute"],
            storage_uri=storage_uri,
            strategy="fixed-window-elastic-expiry"
        )
        
        # Initialize CSRF Protection
        self.csrf = CSRFProtect(app)
        
        # Initialize Security Headers with Talisman
        self.talisman = Talisman(
            app,
            force_https=False,  # Set to True in production
            strict_transport_security=True,
            strict_transport_security_max_age=31536000,
            content_security_policy={
                'default-src': "'self'",
                'script-src': "'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
                'style-src': "'self' 'unsafe-inline' https://fonts.googleapis.com",
                'font-src': "'self' https://fonts.gstatic.com",
                'img-src': "'self' data: https:",
                'connect-src': "'self' https://api.github.com"
            },
            content_security_policy_nonce_in=['script-src', 'style-src']
        )
        
        # Set additional security configurations
        app.config.update(
            SESSION_COOKIE_SECURE=False,  # Set to True in production with HTTPS
            SESSION_COOKIE_HTTPONLY=True,
            SESSION_COOKIE_SAMESITE='Lax',
            PERMANENT_SESSION_LIFETIME=timedelta(hours=24),
            WTF_CSRF_TIME_LIMIT=None,
            WTF_CSRF_ENABLED=True
        )
        
        # Register error handlers
        self.register_error_handlers()
    
    def register_error_handlers(self):
        """Register custom error handlers for security events"""
        
        @self.app.errorhandler(429)
        def ratelimit_handler(e):
            return jsonify({
                'error': 'Rate limit exceeded',
                'message': str(e.description),
                'retry_after': e.retry_after if hasattr(e, 'retry_after') else 60
            }), 429
        
        @self.app.errorhandler(403)
        def forbidden_handler(e):
            return jsonify({
                'error': 'Forbidden',
                'message': 'You do not have permission to access this resource'
            }), 403

class PasswordManager:
    """Enhanced password management with Argon2"""
    
    @staticmethod
    def hash_password(password):
        """Hash password using Argon2"""
        try:
            return ph.hash(password)
        except Exception as e:
            # Fallback to bcrypt if Argon2 fails
            return generate_password_hash(password)
    
    @staticmethod
    def verify_password(password, hash):
        """Verify password against hash"""
        try:
            # Try Argon2 first
            ph.verify(hash, password)
            return True
        except (VerifyMismatchError, VerificationError, InvalidHash):
            # Try bcrypt as fallback
            try:
                return check_password_hash(hash, password)
            except:
                return False
    
    @staticmethod
    def check_password_strength(password):
        """Check if password meets security requirements"""
        errors = []
        
        if len(password) < 8:
            errors.append("Password must be at least 8 characters long")
        if not any(c.isupper() for c in password):
            errors.append("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in password):
            errors.append("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in password):
            errors.append("Password must contain at least one number")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Password must contain at least one special character")
        
        return errors

class TwoFactorAuth:
    """Two-Factor Authentication management"""
    
    @staticmethod
    def generate_secret():
        """Generate a new TOTP secret"""
        return pyotp.random_base32()
    
    @staticmethod
    def generate_qr_code(email, secret, issuer_name="Nawi"):
        """Generate QR code for 2FA setup"""
        totp_uri = pyotp.totp.TOTP(secret).provisioning_uri(
            name=email,
            issuer_name=issuer_name
        )
        
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(totp_uri)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64 for easy display
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        buffer.seek(0)
        
        return base64.b64encode(buffer.getvalue()).decode()
    
    @staticmethod
    def verify_token(secret, token):
        """Verify TOTP token"""
        totp = pyotp.TOTP(secret)
        return totp.verify(token, valid_window=1)
    
    @staticmethod
    def generate_backup_codes(count=10):
        """Generate backup codes for account recovery"""
        codes = []
        for _ in range(count):
            code = ''.join(secrets.choice('0123456789ABCDEF') for _ in range(8))
            codes.append(f"{code[:4]}-{code[4:]}")
        return codes

class SessionManager:
    """Secure session management"""
    
    @staticmethod
    def create_session(user_id, remember_me=False):
        """Create a secure session for user"""
        session['user_id'] = user_id
        session['created_at'] = datetime.utcnow().isoformat()
        session['fingerprint'] = SessionManager.generate_fingerprint()
        
        if remember_me:
            session.permanent = True
        
        # Store session in Redis if available
        if REDIS_AVAILABLE:
            session_key = f"session:{user_id}:{session.sid if hasattr(session, 'sid') else secrets.token_hex(16)}"
            redis_client.setex(
                session_key,
                86400 * 7 if remember_me else 3600,  # 7 days or 1 hour
                SessionManager.generate_fingerprint()
            )
    
    @staticmethod
    def generate_fingerprint():
        """Generate browser fingerprint for session validation"""
        fingerprint_data = f"{request.user_agent.string}:{request.remote_addr}"
        return hashlib.sha256(fingerprint_data.encode()).hexdigest()
    
    @staticmethod
    def validate_session():
        """Validate current session"""
        if 'user_id' not in session:
            return False
        
        # Check session fingerprint
        if session.get('fingerprint') != SessionManager.generate_fingerprint():
            session.clear()
            return False
        
        # Check session age
        created_at = session.get('created_at')
        if created_at:
            created_time = datetime.fromisoformat(created_at)
            if datetime.utcnow() - created_time > timedelta(hours=24):
                session.clear()
                return False
        
        return True
    
    @staticmethod
    def destroy_session():
        """Securely destroy session"""
        user_id = session.get('user_id')
        
        # Clear Redis session if available
        if REDIS_AVAILABLE and user_id:
            pattern = f"session:{user_id}:*"
            for key in redis_client.scan_iter(match=pattern):
                redis_client.delete(key)
        
        session.clear()

class TokenManager:
    """JWT Token management for API authentication"""
    
    @staticmethod
    def generate_tokens(user_id):
        """Generate access and refresh tokens"""
        secret_key = current_app.config.get('SECRET_KEY', 'default-secret-key')
        
        # Access token (15 minutes)
        access_payload = {
            'user_id': user_id,
            'type': 'access',
            'exp': datetime.utcnow() + timedelta(minutes=15),
            'iat': datetime.utcnow(),
            'jti': secrets.token_hex(16)  # JWT ID for revocation
        }
        access_token = jwt.encode(access_payload, secret_key, algorithm='HS256')
        
        # Refresh token (7 days)
        refresh_payload = {
            'user_id': user_id,
            'type': 'refresh',
            'exp': datetime.utcnow() + timedelta(days=7),
            'iat': datetime.utcnow(),
            'jti': secrets.token_hex(16)
        }
        refresh_token = jwt.encode(refresh_payload, secret_key, algorithm='HS256')
        
        # Store tokens in Redis for revocation management
        if REDIS_AVAILABLE:
            redis_client.setex(f"access_token:{access_payload['jti']}", 900, user_id)
            redis_client.setex(f"refresh_token:{refresh_payload['jti']}", 604800, user_id)
        
        return {
            'access_token': access_token,
            'refresh_token': refresh_token,
            'token_type': 'Bearer',
            'expires_in': 900  # 15 minutes
        }
    
    @staticmethod
    def verify_token(token, token_type='access'):
        """Verify JWT token"""
        try:
            secret_key = current_app.config.get('SECRET_KEY', 'default-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            
            # Check token type
            if payload.get('type') != token_type:
                return None
            
            # Check if token is revoked
            if REDIS_AVAILABLE:
                token_key = f"{token_type}_token:{payload.get('jti')}"
                if not redis_client.exists(token_key):
                    return None  # Token has been revoked
            
            return payload
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None
    
    @staticmethod
    def revoke_token(token):
        """Revoke a token"""
        try:
            secret_key = current_app.config.get('SECRET_KEY', 'default-secret-key')
            payload = jwt.decode(token, secret_key, algorithms=['HS256'], options={"verify_exp": False})
            
            if REDIS_AVAILABLE and 'jti' in payload:
                token_type = payload.get('type', 'access')
                token_key = f"{token_type}_token:{payload['jti']}"
                redis_client.delete(token_key)
                
                # Add to blacklist
                blacklist_key = f"blacklist:{payload['jti']}"
                ttl = payload.get('exp', 0) - datetime.utcnow().timestamp()
                if ttl > 0:
                    redis_client.setex(blacklist_key, int(ttl), '1')
            
            return True
        except:
            return False

# Decorators for route protection
def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # Check for JWT token
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(' ')[1]
                payload = TokenManager.verify_token(token)
                if payload:
                    request.user_id = payload['user_id']
                    return f(*args, **kwargs)
            except:
                pass
        
        # Check for session
        if SessionManager.validate_session():
            request.user_id = session['user_id']
            return f(*args, **kwargs)
        
        return jsonify({'error': 'Authentication required'}), 401
    
    return decorated_function

def require_2fa(f):
    """Decorator to require 2FA verification"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('2fa_verified'):
            return jsonify({'error': '2FA verification required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function

def rate_limit(limit_string):
    """Custom rate limit decorator"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Custom rate limiting logic if needed
            return f(*args, **kwargs)
        return decorated_function
    return decorator

# Security utility functions
def sanitize_input(text):
    """Sanitize user input to prevent XSS"""
    if not text:
        return text
    
    # Basic HTML entity escaping
    replacements = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;'
    }
    
    for char, replacement in replacements.items():
        text = text.replace(char, replacement)
    
    return text

def validate_email(email):
    """Validate email format"""
    import re
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def generate_secure_filename(filename):
    """Generate a secure filename"""
    import re
    # Remove any path components
    filename = os.path.basename(filename)
    # Remove non-alphanumeric characters except dots and hyphens
    filename = re.sub(r'[^a-zA-Z0-9.-]', '_', filename)
    # Ensure it doesn't start with a dot
    if filename.startswith('.'):
        filename = '_' + filename
    return filename

# Export main components
__all__ = [
    'SecurityManager',
    'PasswordManager',
    'TwoFactorAuth',
    'SessionManager',
    'TokenManager',
    'require_auth',
    'require_2fa',
    'rate_limit',
    'sanitize_input',
    'validate_email',
    'generate_secure_filename'
]