import logging
from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from django.http import parse_cookie
from rest_framework_simplejwt.tokens import AccessToken

User = get_user_model()

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_token(token_key):
    try:
        valid_data = AccessToken(token_key)
        user_id = valid_data["user_id"]
        return User.objects.get(id=user_id)
    except Exception as e:
        logger.error(f"TokenAuthMiddleware: Token validation failed: {e}")
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]
        if not token:
            headers = dict(scope["headers"])
            cookies = {}
            if b"cookie" in headers:
                cookies = parse_cookie(headers[b"cookie"].decode())
            token = cookies.get("access_token")

        if token:
            user = await get_user_from_token(token)
            scope["user"] = user
            logger.info(f"TokenAuthMiddleware: Authenticated user {user.username}")
        else:
            scope["user"] = AnonymousUser()
            logger.info("TokenAuthMiddleware: No token found. User set to AnonymousUser.")

        return await super().__call__(scope, receive, send)


class UsernameQueryMiddleware:
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        username = query_params.get("username", [None])[0]
        scope["username"] = username or "Guest"
        # Opcional: define scope["user"] também, se necessário
        scope["user"] = AnonymousUser()
        return await self.app(scope, receive, send)


class UsernameQueryMiddlewareInstance:
    def __init__(self, scope, middleware):
        self.scope = dict(scope)
        self.middleware = middleware

    async def __call__(self, receive, send):
        query_string = self.scope["query_string"].decode()
        query_params = parse_qs(query_string)
        username = query_params.get("username", [None])[0]

        self.scope["user"] = AnonymousUser()
        self.scope["username"] = username or "Guest"

        inner = self.middleware.inner(self.scope)
        return await inner(receive, send)
