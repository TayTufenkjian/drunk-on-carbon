from django.test import Client, TestCase
from django.urls import reverse

from ..models import User, SavedEstimate


class CreateAccountTestCase(TestCase):

    def test_create_account_get(self):
        """Sending a GET request loads the create_account template"""
        c = Client()
        response = c.get(reverse("create_account"))
        self.assertTemplateUsed(response, "create_account.html")

    def test_create_account(self):
        """Can create a new user account via POST when password and confirmation match"""
        user_data = {
            "username": "kangaroo123",
            "email": "kanga@roo.notreal",
            "password": "hoppingAlong456",
            "confirmation": "hoppingAlong456"
        }
        c = Client()
        c.post(reverse("create_account"), data = user_data)
        assert User.objects.get(username = "kangaroo123")

    def test_password_confirmation_does_not_match(self):
        """Error message is displayed if the confirmation does not match the password"""
        user_data = {
            "username": "kangaroo123",
            "email": "kanga@roo.notreal",
            "password": "hello",
            "confirmation": "nothello"
        }
        c = Client()
        response = c.post(reverse("create_account"), data = user_data)
        assert response.context["message"] == "Passwords must match. Please check your password and confirmation password, then try again."


class LoginTestCase(TestCase):

    @classmethod
    def setUpTestData(cls):
        User.objects.create_user(username="helloworld", email="hello@world.net", password="pass123word456")

    def test_login_success(self):
        """User can log in when username and password match"""
        login_data = {
            "username": "helloworld", 
            "password": "pass123word456"
        }
        c = Client()
        result = c.post(reverse("login"), data = login_data)
        self.assertTrue(result)
    
    def test_login_failure(self):
        """User cannot log in when username and password do not match"""
        login_data = {
            "username": "helloworld", 
            "password": "badpassword"
        }
        c = Client()
        response = c.post(reverse("login"), data = login_data)
        assert response.context["message"] == "Invalid username and/or password."