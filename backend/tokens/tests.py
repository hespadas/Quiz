# from django.contrib.auth.models import User
# from django.urls import reverse
# from rest_framework import status
# from rest_framework.test import APITestCase
#
#
# class TokenObtainTests(APITestCase):
#     def setUp(self):
#         self.user = User.objects.create_user(username="testuser", password="testpassword")
#         self.url = reverse('tokens:token_obtain_pair')
#         self.refresh_url = reverse('tokens:token_refresh')
#         self.logout_url = reverse('tokens:logout')
#         self.refresh_token = self.authenticate_user().cookies['refresh_token'].value
#
#     def authenticate_user(self):
#         return self.client.post(self.url, {'username': 'testuser', 'password': 'testpassword'})
#
#     def set_refresh_token_cookie(self, token):
#         self.client.cookies['refresh_token'] = token
#
#     def test_obtain_token_with_valid_credentials(self):
#         response = self.authenticate_user()
#         assert response.status_code == status.HTTP_200_OK
#         assert 'access_token' in response.cookies
#         assert 'refresh_token' in response.cookies
#
#     def test_obtain_token_with_invalid_credentials(self):
#         response = self.client.post(self.url, {'username': 'wronguser', 'password': 'wrongpassword'})
#         assert response.status_code == status.HTTP_401_UNAUTHORIZED
#         assert response.data['detail'] == 'No active account found with the given credentials'
#
#     def test_refresh_token_with_valid_token(self):
#         self.set_refresh_token_cookie(self.refresh_token)
#         response = self.client.post(self.refresh_url, {'refresh': self.refresh_token})
#         assert response.status_code == status.HTTP_200_OK
#         assert 'access_token' in response.cookies
#
#     def test_refresh_token_without_token(self):
#         self.client.cookies.clear()
#         response = self.client.post(self.refresh_url)
#         assert response.status_code == status.HTTP_400_BAD_REQUEST
#         assert response.json().get('detail') == 'Refresh token not found'
#
#     def test_logout_and_blacklist_token(self):
#         refresh_token = self.authenticate_user().cookies['refresh_token'].value
#         self.set_refresh_token_cookie(refresh_token)
#         response = self.client.post(self.logout_url)
#         assert response.status_code == status.HTTP_205_RESET_CONTENT
#         assert response.cookies['access_token']['max-age'] == 0
#         assert response.cookies['refresh_token']['max-age'] == 0
#         response = self.client.post(self.refresh_url, {'refresh': refresh_token})
#         assert response.status_code == status.HTTP_400_BAD_REQUEST
#         assert response.json().get('detail') in {'Token is blacklisted', 'Token is invalid or expired'}
