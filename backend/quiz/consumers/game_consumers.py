import json
import logging

from channels.db import database_sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from quiz.models.game import Game
from quiz.services.game_connection_manager import ConnectionManager
from quiz.services.game_room_cache import GameRoomCache
from quiz.services.game_room_event_handler import GameRoomEventHandler

logger = logging.getLogger(__name__)


class GameRoomConsumer(AsyncWebsocketConsumer):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.connection_manager = None
        self.cache_manager = None
        self.room_group_name = None
        self.room_code = None

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f"game_room_{self.room_code}"
        username = self.scope["user"].username

        logger.info(f"User {username} connecting to room {self.room_code}")

        self.cache_manager = GameRoomCache(self.room_code)
        self.cache_manager.initialize()

        self.connection_manager = ConnectionManager(self.room_code, self.cache_manager)
        await self.connection_manager.add_connection(
            username,
            self.channel_layer,
            self.room_group_name,
            self.channel_name
        )
        await self.accept()

        logger.info(f"WebSocket connection accepted for room {self.room_code}")

    async def disconnect(self, close_code):
        username = self.scope["user"].username
        logger.info(f"User {username} disconnecting from room {self.room_code}")

        if self.connection_manager:
            await self.connection_manager.remove_connection(
                username,
                self.channel_layer,
                self.room_group_name,
                self.channel_name
            )

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        logger.info(f"Received message of type '{data.get('type')}' in room {self.room_code}")

        event_handler = GameRoomEventHandler(self)
        await event_handler.handle(data)

    async def question_advanced(self, event):
        logger.info(f"Processing question advancement in room {self.room_code}, new index: {event['question_index']}")
        await self.send(text_data=json.dumps({
            "type": "question_advanced",
            "question_index": event["question_index"],
        }))

    async def quiz_finished(self):
        logger.info(f"Received group quiz_finished event in room {self.room_code}")
        await self.send(text_data=json.dumps({"type": "quiz_finished"}))

    async def scores_update_message(self, event):
        logger.info(f"Sending scores update to client in room {self.room_code}")
        await self.send(text_data=json.dumps({
            "type": "scores_update",
            "scores": event["scores"]
        }))

    async def delete_game_room(self):
        async_delete = database_sync_to_async(Game.objects.filter(code=self.room_code).delete)
        await async_delete()
