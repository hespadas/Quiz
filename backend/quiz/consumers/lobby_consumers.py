# quiz/consumers/lobby_consumers.py

import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)
connected_users = set()


class LobbyConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        user = self.scope['user']
        lobby_group_name = "static_lobby"
        if user.is_authenticated:
            connected_users.add(user.username)
            await self.channel_layer.group_add(
                lobby_group_name,
                self.channel_name
            )
            await self.accept()
            await self.send_user_list()
        else:

            await self.close()

    async def send_user_list(self):
        await self.channel_layer.group_send(
            "static_lobby",
            {
                "type": "user_list_message",
                "users": list(connected_users)
            }
        )

    async def user_list_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "user_list",
            "users": event["users"]
        }))

    async def disconnect(self, close_code):
        user = self.scope['user']
        if user.is_authenticated and user.username in connected_users:
            connected_users.remove(user.username)
            await self.send_user_list()
