from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from django.contrib.auth.models import AnonymousUser, User
from rest_framework_simplejwt.tokens import AccessToken


@database_sync_to_async
def get_user(token_key):
    try:
        valid_data = AccessToken(token_key)
        user_id = valid_data['user_id']
        return User.objects.get(id=user_id)
    except Exception:
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        token = None
        query_string = scope['query_string'].decode()
        if 'token=' in query_string:
            token = query_string.split('token=')[1]
        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
        return await super().__call__(scope, receive, send)
