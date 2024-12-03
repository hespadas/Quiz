import logging

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser, User
from django.http import parse_cookie
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_key):
    try:
        valid_data = AccessToken(token_key)
        user_id = valid_data["user_id"]
        return User.objects.get(id=user_id)
    except Exception as e:
        logger.error(f"Token validation failed: {e}")
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        headers = dict(scope["headers"])
        cookies = {}
        if b"cookie" in headers:
            cookies = parse_cookie(headers[b"cookie"].decode())
        token = cookies.get("access_token")

        if token:
            scope["user"] = await get_user_from_token(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
