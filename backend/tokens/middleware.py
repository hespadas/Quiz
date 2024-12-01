import logging

from django.contrib.auth.models import AnonymousUser, User
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)


class JWTAuthCookieMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        access_token = request.COOKIES.get("access_token")
        if access_token:
            request.META["HTTP_AUTHORIZATION"] = f"Bearer {access_token}"
            request.user = self.get_user(access_token)
        return self.get_response(request)

    @staticmethod
    def get_user(token_key):
        try:
            valid_data = AccessToken(token_key)
            user_id = valid_data["user_id"]
            return User.objects.get(id=user_id)
        except Exception:
            return AnonymousUser()
