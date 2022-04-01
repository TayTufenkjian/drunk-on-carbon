from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("create_account", views.create_account, name="create_account"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("usa_simple", views.usa_simple, name="usa_simple"),
    path("usa_advanced", views.usa_advanced, name="usa_advanced"),
    path("save_estimate/<int:miles>", views.save_estimate, name="save_estimate_simple"),
    path("save_estimate/<int:miles>&<str:origin>&<str:destination>", views.save_estimate, name="save_estimate_advanced"),
    path("saved_estimates", views.saved_estimates_view, name="saved_estimates_view"),

    # API Routes
    path("estimate/<int:miles>", views.estimate, name="estimate"),
    path("request_distance/<str:origin>&<str:destination>", views.request_distance, name="request_distance"),
    path("delete/<int:id>", views.delete_saved_estimate, name="delete_saved_estimate")
]