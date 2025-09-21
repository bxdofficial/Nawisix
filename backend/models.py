from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum
import json

db = SQLAlchemy()

# User roles enum
class UserRole(Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    CONTENT_CREATOR = "content_creator"
    COMPANY = "company"
    OTHER = "other"
    ADMIN = "admin"

# User model with enhanced fields
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255))  # Nullable for OAuth users
    
    # OAuth fields
    google_id = db.Column(db.String(100), unique=True)
    oauth_provider = db.Column(db.String(50))  # 'google', 'facebook', etc.
    
    # Role and permissions
    user_role = db.Column(db.String(50), default=UserRole.OTHER.value)
    is_admin = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    is_banned = db.Column(db.Boolean, default=False)
    
    # Profile information
    full_name = db.Column(db.String(150))
    phone = db.Column(db.String(20))  # Private, only visible to admin
    phone_visible = db.Column(db.Boolean, default=False)  # Admin can toggle
    profile_picture = db.Column(db.String(255))
    bio = db.Column(db.Text)
    
    # Profile completion tracking
    profile_completed = db.Column(db.Boolean, default=False)
    profile_completion_percentage = db.Column(db.Integer, default=0)
    
    # Role-specific fields (stored as JSON)
    # Student: major, year, classes
    # Teacher: subjects, level, institution
    # Content Creator: content_type, channels, followers
    # Company: company_name, position, website
    role_data = db.Column(db.JSON, default={})
    
    # Social media links
    social_links = db.Column(db.JSON, default={})  # {platform: url}
    
    # Languages spoken
    languages = db.Column(db.JSON, default=[])  # ['ar', 'en', etc.]
    
    # Preferences
    theme_preference = db.Column(db.String(10), default='light')  # 'light' or 'dark'
    language_preference = db.Column(db.String(5), default='ar')  # 'ar' or 'en'
    reduce_motion = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    
    # Relationships
    design_requests = db.relationship('DesignRequest', backref='user', lazy=True)
    messages = db.relationship('ContactMessage', backref='user', lazy=True)
    
    def to_dict(self, include_private=False, is_admin_view=False):
        data = {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'user_role': self.user_role,
            'is_admin': self.is_admin,
            'is_active': self.is_active,
            'full_name': self.full_name,
            'profile_picture': self.profile_picture,
            'bio': self.bio,
            'profile_completed': self.profile_completed,
            'profile_completion_percentage': self.profile_completion_percentage,
            'role_data': self.role_data or {},
            'social_links': self.social_links or {},
            'languages': self.languages or [],
            'theme_preference': self.theme_preference,
            'language_preference': self.language_preference,
            'reduce_motion': self.reduce_motion,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'last_login': self.last_login.isoformat() if self.last_login else None,
        }
        
        # Include private data only for admin or self
        if is_admin_view or include_private:
            data['phone'] = self.phone
            data['phone_visible'] = self.phone_visible
            data['is_banned'] = self.is_banned
            data['oauth_provider'] = self.oauth_provider
            
        return data

# Service model
class Service(db.Model):
    __tablename__ = 'services'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    title_ar = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    description_ar = db.Column(db.Text)
    icon = db.Column(db.String(50))  # Icon name or path
    price_range = db.Column(db.String(50))
    order_num = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'title_ar': self.title_ar,
            'description': self.description,
            'description_ar': self.description_ar,
            'icon': self.icon,
            'price_range': self.price_range,
            'order_num': self.order_num,
            'is_active': self.is_active,
        }

# Portfolio model
class Portfolio(db.Model):
    __tablename__ = 'portfolio'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    title_ar = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text)
    description_ar = db.Column(db.Text)
    category = db.Column(db.String(50))
    image_url = db.Column(db.String(255))
    images = db.Column(db.JSON, default=[])  # Multiple images
    client_name = db.Column(db.String(100))
    project_date = db.Column(db.Date)
    tags = db.Column(db.String(255))
    is_featured = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    order_num = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'title_ar': self.title_ar,
            'description': self.description,
            'description_ar': self.description_ar,
            'category': self.category,
            'image_url': self.image_url,
            'images': self.images or [],
            'client_name': self.client_name,
            'project_date': self.project_date.isoformat() if self.project_date else None,
            'tags': self.tags.split(',') if self.tags else [],
            'is_featured': self.is_featured,
        }

# Design Request Status enum
class RequestStatus(Enum):
    NEW = "new"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Design Request model with enhanced fields
class DesignRequest(db.Model):
    __tablename__ = 'design_requests'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    
    # Request details
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50))
    
    # Design specifications
    design_type = db.Column(db.String(50))  # facebook_post, instagram_story, etc.
    width = db.Column(db.Integer)  # in pixels
    height = db.Column(db.Integer)  # in pixels
    dpi = db.Column(db.Integer, default=72)
    file_format = db.Column(db.JSON, default=['jpg', 'png'])  # Requested formats
    
    # Options
    include_source = db.Column(db.Boolean, default=False)  # Include PSD/AI
    expedited = db.Column(db.Boolean, default=False)  # Rush delivery
    
    # Files
    reference_files = db.Column(db.JSON, default=[])  # Uploaded reference files
    delivered_files = db.Column(db.JSON, default=[])  # Final delivered files
    
    # Status and tracking
    status = db.Column(db.String(20), default=RequestStatus.NEW.value)
    assigned_to = db.Column(db.String(100))  # Designer name/id
    priority = db.Column(db.String(20), default='normal')  # low, normal, high, urgent
    
    # Pricing
    estimated_price = db.Column(db.Float)
    final_price = db.Column(db.Float)
    is_paid = db.Column(db.Boolean, default=False)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    started_at = db.Column(db.DateTime)
    completed_at = db.Column(db.DateTime)
    delivered_at = db.Column(db.DateTime)
    due_date = db.Column(db.DateTime)
    
    # Admin notes (private)
    admin_notes = db.Column(db.Text)
    
    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'design_type': self.design_type,
            'width': self.width,
            'height': self.height,
            'dpi': self.dpi,
            'file_format': self.file_format,
            'include_source': self.include_source,
            'expedited': self.expedited,
            'reference_files': self.reference_files or [],
            'delivered_files': self.delivered_files or [],
            'status': self.status,
            'priority': self.priority,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'user': self.user.username if self.user else None,
        }
        
        if include_private:
            data.update({
                'assigned_to': self.assigned_to,
                'estimated_price': self.estimated_price,
                'final_price': self.final_price,
                'is_paid': self.is_paid,
                'admin_notes': self.admin_notes,
                'started_at': self.started_at.isoformat() if self.started_at else None,
                'completed_at': self.completed_at.isoformat() if self.completed_at else None,
                'delivered_at': self.delivered_at.isoformat() if self.delivered_at else None,
            })
        
        return data

# Design model (for completed designs)
class Design(db.Model):
    __tablename__ = 'designs'
    
    id = db.Column(db.Integer, primary_key=True)
    request_id = db.Column(db.Integer, db.ForeignKey('design_requests.id'))
    title = db.Column(db.String(200))
    description = db.Column(db.Text)
    files = db.Column(db.JSON, default=[])
    thumbnail = db.Column(db.String(255))
    is_public = db.Column(db.Boolean, default=False)  # Can be shown in portfolio
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    request = db.relationship('DesignRequest', backref='designs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'request_id': self.request_id,
            'title': self.title,
            'description': self.description,
            'files': self.files or [],
            'thumbnail': self.thumbnail,
            'is_public': self.is_public,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }

# Contact Message model
class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    
    # Contact info
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))  # Optional, hidden from public
    subject = db.Column(db.String(200))
    message = db.Column(db.Text, nullable=False)
    
    # Attachments
    attachments = db.Column(db.JSON, default=[])
    
    # Status
    is_read = db.Column(db.Boolean, default=False)
    is_replied = db.Column(db.Boolean, default=False)
    replied_at = db.Column(db.DateTime)
    reply_message = db.Column(db.Text)
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'name': self.name,
            'email': self.email,
            'subject': self.subject,
            'message': self.message,
            'attachments': self.attachments or [],
            'is_read': self.is_read,
            'is_replied': self.is_replied,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
        
        if include_private:
            data['phone'] = self.phone
            data['replied_at'] = self.replied_at.isoformat() if self.replied_at else None
            data['reply_message'] = self.reply_message
            
        return data

# System Settings model (for admin configuration)
class SystemSettings(db.Model):
    __tablename__ = 'system_settings'
    
    id = db.Column(db.Integer, primary_key=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.JSON)
    description = db.Column(db.String(255))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    @classmethod
    def get_setting(cls, key, default=None):
        setting = cls.query.filter_by(key=key).first()
        return setting.value if setting else default
    
    @classmethod
    def set_setting(cls, key, value, description=None):
        setting = cls.query.filter_by(key=key).first()
        if setting:
            setting.value = value
            if description:
                setting.description = description
        else:
            setting = cls(key=key, value=value, description=description)
            db.session.add(setting)
        db.session.commit()
        return setting

# Audit Log model (for tracking admin actions)
class AuditLog(db.Model):
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    action = db.Column(db.String(100), nullable=False)
    resource_type = db.Column(db.String(50))  # user, request, portfolio, etc.
    resource_id = db.Column(db.Integer)
    details = db.Column(db.JSON)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='audit_logs')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user': self.user.username if self.user else 'System',
            'action': self.action,
            'resource_type': self.resource_type,
            'resource_id': self.resource_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }