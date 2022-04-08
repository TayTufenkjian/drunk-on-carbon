from .base import *

SECRET_KEY = str(os.getenv('PROD_SECRET_KEY'))

DEBUG = False

ALLOWED_HOSTS = ['.herokuapp.com']