from .base import *

SECRET_KEY = str(os.getenv('PROD_SECRET_KEY'))

DEBUG = False

ALLOWED_HOSTS = ['.herokuapp.com']

# Settings to avoid transmitting sensitive cookies over HTTP accidentally
# For these settings to work, the web server must redirect all HTTP traffic to HTTPS, and only transmit HTTPS requests to Django
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
             'level': os.getenv('DJANGO_LOG_LEVEL', 'DEBUG'),
        },
    },
}