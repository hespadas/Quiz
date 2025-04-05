import json

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from quiz.models.game import Game
from quiz.services.game_connection_manager import ConnectionManager
from quiz.services.game_room_cache import GameRoomCache
from quiz.services.game_room_event_handler import GameRoomEventHandler


class GameRoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.connection_manager = None
        self.cache_manager = None
        self.room_group_name = None
        self.room_code = None
        self.username = None
        self.scores_sent = False

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f"game_room_{self.room_code}"
        self.username = self.scope.get("username")
        self.scores_sent = False

        self.cache_manager = GameRoomCache(self.room_code)
        self.cache_manager.initialize()

        self.connection_manager = ConnectionManager(self.room_code, self.cache_manager)
        await self.connection_manager.add_connection(
            self.username,
            self.channel_layer,
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, close_code):
        if self.connection_manager:
            await self.connection_manager.remove_connection(
                self.username,
                self.channel_layer,
                self.room_group_name,
                self.channel_name
            )

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        event_handler = GameRoomEventHandler(self)
        await event_handler.handle(data)

    async def question_advanced(self, event):
        await self.send(text_data=json.dumps({
            "type": "question_advanced",
            "question_index": event["question_index"],
        }))

    async def scores_update_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "scores_update",
            "scores": event["scores"]
        }))

    async def delete_game_room(self):
        async_delete = database_sync_to_async(Game.objects.filter(code=self.room_code).delete)
        await async_delete()

    async def quiz_finished(self, event):
        await self.send(text_data=json.dumps({
            "type": "quiz_finished"
        }))

    async def close_connection_message(self, event):
        await self.send(text_data=json.dumps({
            "type": "close_connection"
        }))
