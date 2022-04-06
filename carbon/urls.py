from unicodedata import name
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("about", views.about, name="about"),
    path("create_account", views.create_account, name="create_account"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("user_account", views.user_account, name="user_account"),
    path("change_password", views.change_password, name="change_password"),
    path("usa_travel_miles", views.usa_travel_miles, name="usa_travel_miles"),
    path("usa_travel_places", views.usa_travel_places, name="usa_travel_places"),
    path("save_estimate/<int:miles>", views.save_estimate, name="save_estimate_simple"),
    path("save_estimate/<int:miles>&<str:origin>&<str:destination>&<str:origin_formatted>&<str:destination_formatted>", views.save_estimate, name="save_estimate_advanced"),
    path("saved_estimates", views.saved_estimates_view, name="saved_estimates_view"),

    # API Routes
    path("estimate/<int:miles>", views.estimate, name="estimate"),
    path("request_distance/<str:origin>&<str:destination>", views.request_distance, name="request_distance"),
    path("delete/<int:id>", views.delete_saved_estimate, name="delete_saved_estimate"),
    path("load/<int:id>", views.load_saved_estimate, name="load_saved_estimate")
]