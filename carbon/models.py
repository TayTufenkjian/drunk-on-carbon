from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import ModelForm, widgets
from django import forms

class User(AbstractUser):
    pass

class SavedEstimate(models.Model):
    user = models.ForeignKey(User, on_delete=models.PROTECT, related_name="saved_estimates")
    miles = models.IntegerField
    origin = models.TextField(max_length=500)
    destination = models.TextField(max_length=500)