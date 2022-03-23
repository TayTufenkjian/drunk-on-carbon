from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("usa_simple", views.usa_simple, name="usa_simple"),
    path("usa_advanced", views.usa_advanced, name="usa_advanced"),

    # API Routes
    path("estimate/<int:miles>", views.estimate, name="estimate"),
    path("request_distance/<str:origin>&<str:destination>", views.request_distance, name="request_distance")
]