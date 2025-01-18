import asyncio
import json
import logging

from channels.generic.websocket import AsyncWebsocketConsumer

logger = logging.getLogger(__name__)


class GameRoomConsumer(AsyncWebsocketConsumer):
    scores = {}
    expected_submissions = {}
    user_count = {}
    submitted_users = {}

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['code']
        self.room_group_name = f"game_room_{self.room_code}"
        if self.room_code not in self.__class__.scores:
            self.__class__.scores[self.room_code] = {}
        if self.room_code not in self.__class__.user_count:
            self.__class__.user_count[self.room_code] = 0
        self.__class__.user_count[self.room_code] += 1
        if self.room_code not in self.__class__.expected_submissions:
            self.__class__.expected_submissions[self.room_code] = 0
        if self.room_code not in self.__class__.submitted_users:
            self.__class__.submitted_users[self.room_code] = set()
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if self.room_code in self.__class__.user_count:
            self.__class__.user_count[self.room_code] -= 1
        if self.room_code in self.__class__.expected_submissions:
            if self.__class__.expected_submissions[self.room_code] > 0:
                self.__class__.expected_submissions[self.room_code] -= 1
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        t = data.get('type')
        if t == 'advance_question':
            self.__class__.expected_submissions[self.room_code] = self.__class__.user_count[self.room_code]
            self.__class__.submitted_users[self.room_code] = set()
            await self.channel_layer.group_send(
                self.room_group_name,
                {'type': 'question_advanced', 'question_index': data['question_index']}
            )
        elif t == 'user_score':
            username = data["username"]
            score = data["score"]
            total = data["total"]
            if username:
                self.__class__.scores.setdefault(self.room_code, {})[username] = {"score": score, "total": total}
            if username not in self.__class__.submitted_users[self.room_code]:
                self.__class__.submitted_users[self.room_code].add(username)
                self.__class__.expected_submissions[self.room_code] -= 1
            if self.__class__.expected_submissions[self.room_code] <= 0:
                await self.broadcast_scores()
        elif t == 'quiz_finished':
            await self.channel_layer.group_send(self.room_group_name, {"type": "quiz_finished"})

    async def question_advanced(self, event):
        await self.send(text_data=json.dumps({
            'type': 'question_advanced',
            'question_index': event['question_index'],
        }))

    async def quiz_finished(self, event):
        max_wait_time = 5
        time_waited = 0
        interval = 1
        while time_waited < max_wait_time:
            if self.__class__.expected_submissions[self.room_code] <= 0:
                break
            await asyncio.sleep(interval)
            time_waited += interval
        await self.broadcast_scores()
        await self.send(text_data=json.dumps({"type": "quiz_finished"}))

    async def broadcast_scores(self):
        room_scores = self.__class__.scores.get(self.room_code, {})
        all_scores = [{"username": u, "score": d["score"], "total": d["total"]} for u, d in room_scores.items()]
        await self.send(text_data=json.dumps({"type": "scores_update", "scores": all_scores}))
