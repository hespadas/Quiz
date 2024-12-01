# quiz/consumers/lobby_consumers.py

import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        logger.info("LobbyConsumer connect chamado")
        user = self.scope['user']
        print(user)
        self.lobby_group_name = "lobby_static"

        await self.accept()
        logger.info(f"Conexão WebSocket aceita para o lobby {self.lobby_group_name}")

    async def disconnect(self, close_code):
        user = self.scope['user']
        if user.is_authenticated:
            await self.channel_layer.group_discard(
                self.lobby_group_name,
                self.channel_name
            )
            logger.info(f"User {user.username} disconnected from static lobby: {self.lobby_group_name}")
