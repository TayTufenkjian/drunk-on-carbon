from .base import *

SECRET_KEY = str(os.getenv('PROD_SECRET_KEY'))

DEBUG = False

ALLOWED_HOSTS = ['.herokuapp.com']

# Settings to avoid transmitting sensitive cookies over HTTP accidentally
# For these settings to work, the web server must redirect all HTTP traffic to HTTPS, and only transmit HTTPS requests to Django
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True