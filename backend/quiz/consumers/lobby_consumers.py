# quiz/consumers/lobby_consumers.py

import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class LobbyConsumer(AsyncWebsocketConsumer):
    connected_users = set()
    host_user = None

    async def connect(self):
        user = self.scope['user']
        lobby_group_name = "static_lobby"

        if user.is_authenticated:
            LobbyConsumer.connected_users.add(user.username)
            logger.info(f"User {user.username} connected to static lobby.")

            await self.channel_layer.group_add(
                lobby_group_name,
                self.channel_name
            )

            await self.accept()

            if LobbyConsumer.host_user is None:
                LobbyConsumer.host_user = user.username
                logger.info(f"User {LobbyConsumer.host_user} has been assigned as the host.")

            await self.send_user_list()

            is_host = user.username == LobbyConsumer.host_user
            await self.send_host_status(is_host)
        else:
            logger.warning("Unauthenticated user attempted to connect. Connection closed.")
            await self.close()

    async def send_user_list(self):
        lobby_group_name = "static_lobby"
        logger.debug(f"Broadcasting user list: {LobbyConsumer.connected_users}, Host: {LobbyConsumer.host_user}")

        await self.channel_layer.group_send(
            lobby_group_name,
            {
                "type": "user_list_message",
                "users": list(LobbyConsumer.connected_users),
                "host": LobbyConsumer.host_user
            }
        )

    async def user_list_message(self, event):
        users = event["users"]
        host = event["host"]
        logger.debug(f"Sending user list to client: {users}, Host: {host}")

        await self.send(text_data=json.dumps({
            "type": "user_list",
            "users": users,
            "host": host
        }))

    async def disconnect(self, close_code):
        user = self.scope['user']
        lobby_group_name = "static_lobby"

        if user.is_authenticated and user.username in LobbyConsumer.connected_users:
            LobbyConsumer.connected_users.remove(user.username)
            logger.info(f"User {user.username} disconnected from static lobby.")

            await self.channel_layer.group_discard(
                lobby_group_name,
                self.channel_name
            )

            if user.username == LobbyConsumer.host_user:
                if LobbyConsumer.connected_users:
                    LobbyConsumer.host_user = next(iter(LobbyConsumer.connected_users))
                    logger.info(f"New host assigned: {LobbyConsumer.host_user}")
                else:
                    LobbyConsumer.host_user = None
                    logger.info("No users left in the lobby. Host reset to None.")

            await self.send_user_list()

            if LobbyConsumer.host_user:
                await self.channel_layer.group_send(
                    lobby_group_name,
                    {
                        "type": "host_change",
                        "host": LobbyConsumer.host_user
                    }
                )

    async def host_change(self, event):
        host = event["host"]
        logger.debug(f"Host change detected. New Host: {host}")

        is_host = self.scope['user'].username == host if host else False

        await self.send(text_data=json.dumps({
            "type": "host_status",
            "isHost": is_host
        }))

    async def send_host_status(self, is_host):
        logger.debug(f"Sending host status to user. Is Host: {is_host}")

        await self.send(text_data=json.dumps({
            "type": "host_status",
            "isHost": is_host
        }))

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope['user']

        if not user.is_authenticated:
            logger.warning("Unauthenticated user sent a message. Ignoring.")
            return

        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            logger.debug(f"Received message type: {message_type} with data: {data}")

            if message_type == "start_game" and user.username == LobbyConsumer.host_user:
                logger.info(f"Host {user.username} initiated the game.")
                await self.channel_layer.group_send(
                    "static_lobby",
                    {
                        "type": "game_started",
                    }
                )
            else:
                logger.warning(f"Unauthorized or unknown message type: {message_type}")
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {e}")
        except Exception as e:
            logger.error(f"Error processing received message: {e}")

    async def game_started(self, event):
        logger.info("Broadcasting 'game_started' to all clients.")

        await self.send(text_data=json.dumps({
            "type": "game_started",
        }))
