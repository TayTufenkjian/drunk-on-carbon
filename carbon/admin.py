from django.contrib import admin
from .models import User, SavedEstimate

# Register your models here.
admin.site.register(User)
admin.site.register(SavedEstimate)