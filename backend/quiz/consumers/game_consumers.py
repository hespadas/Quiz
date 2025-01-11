

import asyncio
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class GameRoomConsumer(AsyncWebsocketConsumer):
    scores = {}

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['code']
        self.room_group_name = f"game_room_{self.room_code}"

        if self.room_code not in self.__class__.scores:
            self.__class__.scores[self.room_code] = {}

        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        logger.info(f"WebSocket connected to room: {self.room_group_name}")

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )
        logger.info(f"WebSocket disconnected from room: {self.room_group_name}")

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        message_type = data.get('type')

        if message_type == 'advance_question':
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'question_advanced', 'question_index': data['question_index']}
            )

        elif message_type == 'user_score':
            username = data["username"]
            score = data["score"]
            total = data["total"]
            if username:
                self.__class__.scores.setdefault(self.room_code, {})[username] = {
                    "score": score,
                    "total": total
                }

            logger.info(f"Updated scores for room {self.room_code}: {self.__class__.scores}")

        elif message_type == 'quiz_finished':
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "quiz_finished"}
            )
            logger.info("Broadcasted 'quiz_finished' to group")

    async def question_advanced(self, event):
        question_index = event['question_index']
        await self.send(text_data=json.dumps({
            'type': 'question_advanced',
            'question_index': question_index,
        }))

    async def quiz_finished(self, event):
        await self.send(text_data=json.dumps({"type": "quiz_finished"}))
        await asyncio.sleep(5)
        room_scores = self.__class__.scores.get(self.room_code, {})
        all_scores = [
            {"username": username, "score": stats["score"], "total": stats["total"]}
            for username, stats in room_scores.items()
        ]
        await self.send(text_data=json.dumps({"type": "scores_update", "scores": all_scores}))
        logger.info(f"Sent scores_update: {all_scores}")
