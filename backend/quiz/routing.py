from django.urls import re_path

from .consumers.game_consumers import GameRoomConsumer
from .consumers.lobby_consumers import LobbyConsumer

websocket_urlpatterns = [
    re_path(r'ws/game_rooms/(?P<code>\w+)/$', GameRoomConsumer.as_asgi()),
    re_path(r'^ws/lobby/(?P<code>\w+)/?$', LobbyConsumer.as_asgi())
]
