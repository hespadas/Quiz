from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()  # Suporta modelo customizado


class TokenObtainTests(APITestCase):
    def setUp(self):
        # Criando usuário não verificado
        self.user = User.objects.create_user(
            username="testuser",
            password="testpassword",
            email="test@example.com",
            email_verified=False
        )
        self.url = reverse('tokens:token_obtain_pair')
        self.refresh_url = reverse('tokens:token_refresh')
        self.logout_url = reverse('tokens:logout')

    def authenticate_user(self):
        return self.client.post(self.url, {'username': 'testuser', 'password': 'testpassword'})

    def test_obtain_token_with_verified_email(self):
        self.user.email_verified = True
        self.user.save()

        response = self.authenticate_user()
        assert response.status_code == status.HTTP_200_OK
        assert 'access_token' in response.cookies
        assert 'refresh_token' in response.cookies

    def test_obtain_token_with_unverified_email(self):
        response = self.authenticate_user()
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['detail'] == 'Email not verified'

    def test_obtain_token_with_invalid_credentials(self):
        response = self.client.post(self.url, {'username': 'wronguser', 'password': 'wrongpassword'})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.data['detail'] == 'No active account found with the given credentials'

    def test_refresh_token_with_valid_token(self):
        self.user.email_verified = True
        self.user.save()

        refresh_token = self.authenticate_user().cookies.get('refresh_token').value
        self.client.cookies['refresh_token'] = refresh_token

        response = self.client.post(self.refresh_url, {'refresh': refresh_token})
        assert response.status_code == status.HTTP_200_OK
        assert 'access_token' in response.cookies

    def test_refresh_token_without_token(self):
        self.client.cookies.clear()
        response = self.client.post(self.refresh_url)
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json().get('detail') == 'Refresh token not found'

    def test_logout_and_blacklist_token(self):
        self.user.email_verified = True
        self.user.save()

        refresh_token = self.authenticate_user().cookies.get('refresh_token').value
        self.client.cookies['refresh_token'] = refresh_token

        response = self.client.post(self.logout_url)
        assert response.status_code == status.HTTP_205_RESET_CONTENT
        assert response.cookies['access_token']['max-age'] == 0
        assert response.cookies['refresh_token']['max-age'] == 0

        response = self.client.post(self.refresh_url, {'refresh': refresh_token})
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json().get('detail') in {'Token is blacklisted', 'Token is invalid or expired'}
