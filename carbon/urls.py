from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("usa_simple", views.usa_simple, name="usa_simple"),
    path("usa_advanced", views.usa_advanced, name="usa_advanced"),

    # API Routes
    path("estimate/<int:miles>", views.estimate, name="estimate")
]