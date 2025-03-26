import json

from channels.generic.websocket import AsyncWebsocketConsumer

from quiz.services.lobby_manager import LobbyManager


class LobbyConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.code = None

    async def connect(self):
        self.code = self.scope["url_route"]["kwargs"]["code"]
        user = self.scope["user"]
        if not user.is_authenticated:
            await self.close()
            return

        await self.accept()

        LobbyManager.add_user(self.code, user.username)

        real_host_username = await LobbyManager.initialize_real_host(self.code)
        if not real_host_username:
            await self.close()
            return

        await self.channel_layer.group_add(self.code, self.channel_name)

        await self.send_user_list()

    async def disconnect(self, close_code):
        user = self.scope["user"]
        if user.is_authenticated:
            await self.channel_layer.group_discard(self.code, self.channel_name)

            if LobbyManager.has_lobby(self.code):
                LobbyManager.remove_user(self.code, user.username)

                if LobbyManager.has_lobby(self.code):
                    await self.send_user_list(safe=True)

    async def receive(self, text_data=None, bytes_data=None):
        user = self.scope["user"]
        if not user.is_authenticated:
            return

        data = json.loads(text_data)
        message_type = data.get("type")

        if message_type == "start_game":
            if LobbyManager.user_is_host(self.code, user):
                await self.channel_layer.group_send(
                    self.code,
                    {
                        "type": "game_started",
                        "quiz_id": data.get("quiz_id"),
                    }
                )

    async def game_started(self, event):
        await self.send_json({
            "type": "game_started",
            "quiz_id": event.get("quiz_id"),
        })
        await self.close(code=4000)

    async def send_user_list(self, safe=False):
        if not LobbyManager.has_lobby(self.code):
            if not safe:
                raise KeyError(f"No lobby data for code {self.code}")
            return

        users_list = LobbyManager.get_users(self.code)
        current_host = LobbyManager.get_real_host(self.code)

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
