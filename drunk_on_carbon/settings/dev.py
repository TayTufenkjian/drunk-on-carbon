from .base import *

SECRET_KEY = str(os.getenv('DEV_SECRET_KEY'))

DEBUG = True

ALLOWED_HOSTS = []