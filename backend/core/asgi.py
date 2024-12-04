import os

import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

import quiz.routing # noqa
from channels.auth import AuthMiddlewareStack # noqa
from channels.routing import ProtocolTypeRouter, URLRouter # noqa
from django.core.asgi import get_asgi_application # noqa
from quiz.middleware import TokenAuthMiddleware # noqa

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddleware(
        AuthMiddlewareStack(
            URLRouter(
                quiz.routing.websocket_urlpatterns
            )
        )
    ),
})
