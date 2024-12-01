import os

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

import django
import quiz.routing
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from quiz.middleware import CookieMiddleware, TokenAuthMiddleware

django.setup()


application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": CookieMiddleware(
        TokenAuthMiddleware(
            AuthMiddlewareStack(
                URLRouter(
                    quiz.routing.websocket_urlpatterns
                )
            )
        )
    ),
})
