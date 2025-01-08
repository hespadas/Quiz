# quiz/consumers/lobby_consumers.py
import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from quiz.models.game import Game

logger = logging.getLogger(__name__)


class LobbyConsumer(AsyncWebsocketConsumer):
    lobbies = {}

    @staticmethod
    @database_sync_to_async
    def get_game_and_host_username(code):
        game = Game.objects.get(code=code)
        return game.host.username

    async def connect(self):
        self.code = self.scope['url_route']['kwargs']['code']
        user = self.scope['user']

        if not user.is_authenticated:
            logger.warning("Unauthenticated user tried to connect. Closing.")
            await self.close()
            return

        await self.accept()
        logger.info(f"User {user.username} connected with code {self.code}")

        if self.code not in self.__class__.lobbies:
            self.__class__.lobbies[self.code] = {
                "users": set(),
                "host": None,
                "real_host": None,
            }

        lobby_data = self.__class__.lobbies[self.code]
        lobby_data["users"].add(user.username)

        try:
            real_host_username = await self.get_game_and_host_username(self.code)
        except Game.DoesNotExist:
            logger.error(f"Game with code {self.code} does not exist. Closing connection.")
            await self.close()
            return

        if lobby_data["real_host"] is None:
            lobby_data["real_host"] = real_host_username
            logger.info(f"Lobby {self.code}: real_host set to {real_host_username}")

        if user.username == real_host_username:
            logger.info(f"Lobby {self.code}: {user.username} is the real host, reassigning host.")
            lobby_data["host"] = user.username
        elif lobby_data["host"] is None:
            logger.info(f"Lobby {self.code}: No host, assigning {user.username} as temp host.")
            lobby_data["host"] = user.username

        await self.channel_layer.group_add(self.code, self.channel_name)
        await self.send_user_list()

    async def disconnect(self, close_code):
        user = self.scope['user']

        if user.is_authenticated:
            await self.channel_layer.group_discard(self.code, self.channel_name)

            lobby_data = self.__class__.lobbies.get(self.code)
            if lobby_data:
                if user.username in lobby_data["users"]:
                    lobby_data["users"].remove(user.username)
                    logger.info(f"User {user.username} disconnected from code {self.code}")

                if not lobby_data["users"]:
                    del self.__class__.lobbies[self.code]
                    logger.info(f"Lobby {self.code} empty, cleaning up.")
                else:
                    if lobby_data["host"] == user.username:
                        if lobby_data["real_host"] in lobby_data["users"]:
                            lobby_data["host"] = lobby_data["real_host"]
                        else:
                            new_temp_host = next(iter(lobby_data["users"]))
                            lobby_data["host"] = new_temp_host
                            logger.info(f"Lobby {self.code}: new temp host is {new_temp_host}")

                    await self.send_user_list()

    async def send_user_list(self):
        lobby_data = self.__class__.lobbies[self.code]
        users_list = list(lobby_data["users"])
        current_host = lobby_data["host"]

        await self.channel_layer.group_send(
            self.code,
            {
                "type": "user_list_message",
                "users": users_list,
                "host": current_host,
            }
        )

    async def user_list_message(self, event):
        await self.send_json({
            "type": "user_list",
            "users": event["users"],
            "host": event["host"],
        })

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content))
