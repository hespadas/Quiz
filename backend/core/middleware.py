import logging

from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser, User
from rest_framework_simplejwt.tokens import AccessToken

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user(token_key):
    try:
        valid_data = AccessToken(token_key)
        user_id = valid_data['user_id']
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    def __init__(self, inner):
        super().__init__(inner)

    @database_sync_to_async
    def get_user(token_key):
        try:
            valid_data = AccessToken(token_key)
            user_id = valid_data["user_id"]
            return User.objects.get(id=user_id)
        except Exception:
            return AnonymousUser()

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", "").decode()
        token = None
        if "token=" in query_string:
            token = query_string.split("token=")[1]

        if token:
            scope["user"] = await self.get_user(token)
        else:
            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)
