"""
WSGI configuration for PythonAnywhere deployment
"""
import sys
import os
from pathlib import Path

# Add project directory to sys.path
project_home = str(Path(__file__).resolve().parent)
if project_home not in sys.path:
    sys.path.insert(0, project_home)

# Import and configure the Flask app
from app import app, init_db

# Initialize database on first run
with app.app_context():
    init_db()

# The application object for WSGI
application = app

if __name__ == "__main__":
    app.run()