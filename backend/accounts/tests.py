from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class RegisterUserViewTests(APITestCase):
    def setUp(self):
        self.url = reverse("register")
        self.valid_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "!Password123",
            "password2": "!Password123"
        }
        self.invalid_data = {
            "username": "",
            "email": "invalid-email",
            "password": "short",
            "password2": "short"
        }

    def test_register_user_successfully(self):
        response = self.client.post(self.url, self.valid_data, format="json")
        assert response.status_code == status.HTTP_201_CREATED
        assert response.data["message"] == "User created successfully, confirm your email"
        user = User.objects.get(username="testuser")
        assert user is not None
        assert user.email == "test@example.com"
        assert user.email_verified is False

    def test_register_user_with_invalid_data(self):
        response = self.client.post(self.url, self.invalid_data, format="json")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "username" in response.data
        assert "email" in response.data
        assert "password" not in response.data

    def test_passwords_didnt_match(self):
        data = self.valid_data.copy()
        data["password2"] = "!Password1234"
        response = self.client.post(self.url, data, format="json")
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert "password2" in response.data
        assert response.data["password2"][0] == "password fields didn't match"
