from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import get_jwt_identity
from datetime import datetime, timedelta
from io import BytesIO, StringIO
import csv
import pandas as pd
from models import db, User, DesignRequest, Portfolio, Service, ContactMessage, AuditLog, SystemSettings
from utils.auth import admin_required, log_user_action

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

@admin_bp.route('/dashboard/stats', methods=['GET'])
@admin_required
def get_dashboard_stats():
    """Get dashboard statistics."""
    try:
        # User statistics
        total_users = User.query.count()
        new_users_this_month = User.query.filter(
            User.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count()
        
        users_by_role = db.session.query(
            User.user_role, 
            db.func.count(User.id)
        ).group_by(User.user_role).all()
        
        # Design request statistics
        total_requests = DesignRequest.query.count()
        new_requests = DesignRequest.query.filter_by(status='new').count()
        in_progress_requests = DesignRequest.query.filter_by(status='in_progress').count()
        completed_requests = DesignRequest.query.filter_by(status='completed').count()
        
        # Revenue statistics (if applicable)
        total_revenue = db.session.query(
            db.func.sum(DesignRequest.final_price)
        ).filter(DesignRequest.is_paid == True).scalar() or 0
        
        # Contact messages
        unread_messages = ContactMessage.query.filter_by(is_read=False).count()
        
        stats = {
            'users': {
                'total': total_users,
                'new_this_month': new_users_this_month,
                'by_role': dict(users_by_role)
            },
            'design_requests': {
                'total': total_requests,
                'new': new_requests,
                'in_progress': in_progress_requests,
                'completed': completed_requests
            },
            'revenue': {
                'total': float(total_revenue),
                'currency': 'USD'
            },
            'messages': {
                'unread': unread_messages
            }
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users', methods=['GET'])
@admin_required
def get_users():
    """Get all users with filtering and pagination."""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        role_filter = request.args.get('role', '')
        status_filter = request.args.get('status', '')
        
        # Build query
        query = User.query
        
        # Apply search filter
        if search:
            query = query.filter(
                db.or_(
                    User.email.contains(search),
                    User.username.contains(search),
                    User.full_name.contains(search)
                )
            )
        
        # Apply role filter
        if role_filter:
            query = query.filter_by(user_role=role_filter)
        
        # Apply status filter
        if status_filter == 'active':
            query = query.filter_by(is_active=True, is_banned=False)
        elif status_filter == 'banned':
            query = query.filter_by(is_banned=True)
        elif status_filter == 'inactive':
            query = query.filter_by(is_active=False)
        
        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        users = [user.to_dict(is_admin_view=True) for user in pagination.items]
        
        return jsonify({
            'users': users,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@admin_required
def get_user_details(user_id):
    """Get detailed user information including phone number."""
    try:
        user = User.query.get_or_404(user_id)
        
        # Get user's design requests
        requests = DesignRequest.query.filter_by(user_id=user_id).all()
        
        # Get user's messages
        messages = ContactMessage.query.filter_by(user_id=user_id).all()
        
        user_data = user.to_dict(is_admin_view=True)
        user_data['design_requests'] = [req.to_dict() for req in requests]
        user_data['contact_messages'] = [msg.to_dict(include_private=True) for msg in messages]
        
        # Log the action
        log_user_action(
            get_jwt_identity(),
            'view_user_details',
            'user',
            user_id,
            {'viewed_user': user.username},
            request
        )
        
        return jsonify(user_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['PUT'])
@admin_required
def update_user(user_id):
    """Update user information."""
    try:
        user = User.query.get_or_404(user_id)
        data = request.get_json()
        
        # Update allowed fields
        if 'is_active' in data:
            user.is_active = data['is_active']
        if 'is_banned' in data:
            user.is_banned = data['is_banned']
        if 'phone_visible' in data:
            user.phone_visible = data['phone_visible']
        if 'user_role' in data:
            user.user_role = data['user_role']
        
        db.session.commit()
        
        # Log the action
        log_user_action(
            get_jwt_identity(),
            'update_user',
            'user',
            user_id,
            data,
            request
        )
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict(is_admin_view=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/export', methods=['GET'])
@admin_required
def export_users():
    """Export users to CSV."""
    try:
        # Get all users
        users = User.query.all()
        
        # Create CSV
        output = StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow([
            'ID', 'Username', 'Email', 'Full Name', 'Role', 'Phone',
            'Languages', 'Profile Completed', 'Created At', 'Last Login'
        ])
        
        # Write user data
        for user in users:
            writer.writerow([
                user.id,
                user.username,
                user.email,
                user.full_name or '',
                user.user_role,
                user.phone or '',  # Phone included for admin
                ', '.join(user.languages or []),
                'Yes' if user.profile_completed else 'No',
                user.created_at.strftime('%Y-%m-%d') if user.created_at else '',
                user.last_login.strftime('%Y-%m-%d') if user.last_login else ''
            ])
        
        # Create response
        output.seek(0)
        response = send_file(
            BytesIO(output.getvalue().encode()),
            mimetype='text/csv',
            as_attachment=True,
            download_name=f'users_export_{datetime.now().strftime("%Y%m%d_%H%M%S")}.csv'
        )
        
        # Log the action
        log_user_action(
            get_jwt_identity(),
            'export_users',
            'user',
            None,
            {'count': len(users)},
            request
        )
        
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/design-requests', methods=['GET'])
@admin_required
def get_design_requests():
    """Get all design requests with filtering."""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        status_filter = request.args.get('status', '')
        
        # Build query
        query = DesignRequest.query
        
        # Apply status filter
        if status_filter:
            query = query.filter_by(status=status_filter)
        
        # Order by created date (newest first)
        query = query.order_by(DesignRequest.created_at.desc())
        
        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        requests = [req.to_dict(include_private=True) for req in pagination.items]
        
        return jsonify({
            'requests': requests,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/design-requests/<int:request_id>', methods=['PUT'])
@admin_required
def update_design_request(request_id):
    """Update design request status and details."""
    try:
        design_request = DesignRequest.query.get_or_404(request_id)
        data = request.get_json()
        
        # Update fields
        if 'status' in data:
            design_request.status = data['status']
            
            # Update timestamps based on status
            if data['status'] == 'in_progress':
                design_request.started_at = datetime.utcnow()
            elif data['status'] == 'completed':
                design_request.completed_at = datetime.utcnow()
            elif data['status'] == 'delivered':
                design_request.delivered_at = datetime.utcnow()
        
        if 'assigned_to' in data:
            design_request.assigned_to = data['assigned_to']
        if 'priority' in data:
            design_request.priority = data['priority']
        if 'admin_notes' in data:
            design_request.admin_notes = data['admin_notes']
        if 'estimated_price' in data:
            design_request.estimated_price = data['estimated_price']
        if 'final_price' in data:
            design_request.final_price = data['final_price']
        
        db.session.commit()
        
        # Log the action
        log_user_action(
            get_jwt_identity(),
            'update_design_request',
            'design_request',
            request_id,
            data,
            request
        )
        
        return jsonify({
            'message': 'Design request updated successfully',
            'request': design_request.to_dict(include_private=True)
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['GET'])
@admin_required
def get_settings():
    """Get system settings."""
    try:
        settings = SystemSettings.query.all()
        
        settings_dict = {
            setting.key: {
                'value': setting.value,
                'description': setting.description
            }
            for setting in settings
        }
        
        # Add default settings if not present
        default_settings = {
            'particles_enabled': True,
            'particles_max': 150,
            'particles_per_second': 20,
            'particles_decay_time': 5,
            'registration_enabled': True,
            'google_auth_enabled': True,
            'email_notifications': True,
            'contact_email': 'nawicompany@gmail.com',
            'reply_within_hours': 48
        }
        
        for key, value in default_settings.items():
            if key not in settings_dict:
                settings_dict[key] = {'value': value, 'description': ''}
        
        return jsonify(settings_dict), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/settings', methods=['PUT'])
@admin_required
def update_settings():
    """Update system settings."""
    try:
        data = request.get_json()
        
        for key, value in data.items():
            SystemSettings.set_setting(key, value)
        
        # Log the action
        log_user_action(
            get_jwt_identity(),
            'update_settings',
            'settings',
            None,
            data,
            request
        )
        
        return jsonify({
            'message': 'Settings updated successfully',
            'settings': data
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/audit-logs', methods=['GET'])
@admin_required
def get_audit_logs():
    """Get audit logs."""
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 50, type=int)
        user_id = request.args.get('user_id', type=int)
        action = request.args.get('action')
        
        # Build query
        query = AuditLog.query
        
        if user_id:
            query = query.filter_by(user_id=user_id)
        if action:
            query = query.filter_by(action=action)
        
        # Order by newest first
        query = query.order_by(AuditLog.created_at.desc())
        
        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        logs = [log.to_dict() for log in pagination.items]
        
        return jsonify({
            'logs': logs,
            'total': pagination.total,
            'page': page,
            'per_page': per_page,
            'total_pages': pagination.pages
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500