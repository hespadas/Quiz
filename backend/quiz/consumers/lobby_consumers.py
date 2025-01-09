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

        if user.username != real_host_username:
            logger.info(f"Lobby {self.code}: {user.username} is not the host.")
        else:
            logger.info(f"Lobby {self.code}: {user.username} is the host.")

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

                await self.send_user_list()

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope['user']
        if not user.is_authenticated:
            logger.warning("Unauthenticated user sent a message, ignoring.")
            return

        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == "start_game":
                lobby_data = self.__class__.lobbies[self.code]
                if user.username == lobby_data["real_host"]:
                    logger.info(f"Lobby {self.code}: Start game triggered by {user.username}")
                    await self.channel_layer.group_send(
                        self.code,
                        {
                            "type": "game_started",
                            "quiz_id": data.get("quiz_id"),
                        }
                    )
                else:
                    logger.warning(f"Lobby {self.code}: Unauthorized start_game attempt by {user.username}")
            else:
                logger.warning(f"Lobby {self.code}: Unknown message_type {message_type}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def game_started(self, event):
        logger.info(f"Lobby {self.code}: Broadcasting 'game_started' to all.")
        await self.send_json({
            "type": "game_started",
            "quiz_id": event.get("quiz_id"),
        })

    async def send_user_list(self):
        lobby_data = self.__class__.lobbies[self.code]
        users_list = list(lobby_data["users"])
        current_host = lobby_data["real_host"]

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
