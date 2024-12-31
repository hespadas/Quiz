# quiz/consumers/lobby_consumers.py

import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class LobbyConsumer(AsyncWebsocketConsumer):
    lobbies = {}

    async def connect(self):
        self.code = self.scope['url_route']['kwargs']['code']
        if self.code not in self.__class__.lobbies:
            self.__class__.lobbies[self.code] = {
                "users": set(),
                "host": None,
            }

        user = self.scope['user']
        if user.is_authenticated:
            await self.accept()
            logger.info(f"User {user.username} connected to lobby code {self.code}")

            await self.channel_layer.group_add(
                self.code,
                self.channel_name
            )

            self.__class__.lobbies[self.code]["users"].add(user.username)

            if self.__class__.lobbies[self.code]["host"] is None:
                logger.info(f"Lobby {self.code}: Assigning host to {user.username}")
                self.__class__.lobbies[self.code]["host"] = user.username

            await self.send_user_list()
        else:
            logger.warning("Unauthenticated user attempted to connect, closing.")
            await self.close()

    async def disconnect(self, close_code):
        user = self.scope['user']
        if user.is_authenticated:
            await self.channel_layer.group_discard(
                self.code,
                self.channel_name
            )

            lobby_data = self.__class__.lobbies.get(self.code)
            if lobby_data and user.username in lobby_data["users"]:
                lobby_data["users"].remove(user.username)
                logger.info(f"User {user.username} disconnected from {self.code}")

                if lobby_data["host"] == user.username:
                    if lobby_data["users"]:
                        new_host = next(iter(lobby_data["users"]))
                        lobby_data["host"] = new_host
                        logger.info(f"Lobby {self.code}: New host is {new_host}")
                    else:
                        lobby_data["host"] = None
                        logger.info(f"Lobby {self.code}: No users left, host is None.")

                if not lobby_data["users"]:
                    logger.info(f"Lobby {self.code}: cleaning up empty lobby.")
                    del self.__class__.lobbies[self.code]
                else:
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
                if lobby_data["host"] == user.username:
                    logger.info(f"Lobby {self.code}: {user.username} started the game.")
                    await self.channel_layer.group_send(
                        self.code,
                        {
                            "type": "game_started",
                            "quiz_id": data.get("quiz_id"),
                        }
                    )
                else:
                    logger.warning(f"User {user.username} is not the host, ignoring start_game.")
            else:
                logger.warning(f"Lobby {self.code}: Unknown message type: {message_type}")
        except json.JSONDecodeError as e:
            logger.error(f"Lobby {self.code}: JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Lobby {self.code}: Error processing received message: {e}")

    async def game_started(self, event):
        logger.info(f"Lobby {self.code}: Broadcasting 'game_started' to all.")
        await self.send_json({
            "type": "game_started",
            "quiz_id": event.get("quiz_id"),
        })

    async def send_user_list(self):
        lobby_data = self.__class__.lobbies[self.code]
        users_list = list(lobby_data["users"])
        host_user = lobby_data["host"]

        logger.debug(f"Lobby {self.code}: Broadcasting user list {users_list}, host={host_user}")

        await self.channel_layer.group_send(
            self.code,
            {
                "type": "user_list_message",
                "users": users_list,
                "host": host_user
            }
        )

    async def user_list_message(self, event):
        await self.send_json({
            "type": "user_list",
            "users": event["users"],
            "host": event["host"]
        })

    async def send_json(self, content):
        await self.send(text_data=json.dumps(content))
