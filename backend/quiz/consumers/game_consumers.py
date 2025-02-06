import json
import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer

from quiz.models.game import Game

logger = logging.getLogger(__name__)


class GameRoomConsumer(AsyncWebsocketConsumer):
    scores = {}
    expected_submissions = {}
    user_count = {}
    submitted_users = {}
    room_user_connections = {}

    def __init__(self, *args, **kwargs):
        super().__init__(args, kwargs)
        self.room_group_name = None
        self.room_code = None

    async def connect(self):
        self.room_code = self.scope['url_route']['kwargs']['code']
        self.room_group_name = f"game_room_{self.room_code}"
        username = self.scope["user"].username
        logger.info(f"User {username} connecting to room {self.room_code}.")

        if self.room_code not in self.__class__.scores:
            self.__class__.scores[self.room_code] = {}
            logger.debug(f"Initialized scores for room {self.room_code}.")
        if self.room_code not in self.__class__.user_count:
            self.__class__.user_count[self.room_code] = 0
            logger.debug(f"Initialized user_count for room {self.room_code}.")
        if self.room_code not in self.__class__.expected_submissions:
            self.__class__.expected_submissions[self.room_code] = 0
            logger.debug(f"Initialized expected_submissions for room {self.room_code}.")
        if self.room_code not in self.__class__.submitted_users:
            self.__class__.submitted_users[self.room_code] = set()
            logger.debug(f"Initialized submitted_users for room {self.room_code}.")
        if self.room_code not in self.__class__.room_user_connections:
            self.__class__.room_user_connections[self.room_code] = {}

        if username in self.__class__.room_user_connections[self.room_code]:
            self.__class__.room_user_connections[self.room_code][username] += 1
            logger.info(
                f"User {username} already connected to room {self.room_code} "
                f"(connection count: {self.__class__.room_user_connections[self.room_code][username]})."
            )
        else:
            self.__class__.room_user_connections[self.room_code][username] = 1
            self.__class__.user_count[self.room_code] += 1
            logger.info(
                f"User {username} joined room {self.room_code}. "
                f"Current user count: {self.__class__.user_count[self.room_code]}."
            )

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"WebSocket connection accepted for room {self.room_code}.")

    async def disconnect(self, close_code):
        username = self.scope["user"].username
        logger.info(f"User {username} disconnecting from room {self.room_code} with close code {close_code}.")

        if (
            self.room_code in self.__class__.room_user_connections and
            username in self.__class__.room_user_connections[self.room_code]
        ):
            self.__class__.room_user_connections[self.room_code][username] -= 1
            if self.__class__.room_user_connections[self.room_code][username] <= 0:
                del self.__class__.room_user_connections[self.room_code][username]
                self.__class__.user_count[self.room_code] -= 1
                logger.info(
                    f"User {username} left room {self.room_code}. "
                    f"Current user count: {self.__class__.user_count[self.room_code]}."
                )
            else:
                logger.info(
                    f"User {username} still has "
                    f"{self.__class__.room_user_connections[self.room_code][username]} "
                    f"connection(s) in room {self.room_code}."
                )
        if self.room_code in self.__class__.expected_submissions:
            if self.__class__.expected_submissions[self.room_code] > 0:
                self.__class__.expected_submissions[self.room_code] -= 1
                logger.info(
                    f"Decremented expected_submissions for room {self.room_code}. "
                    f"Current value: {self.__class__.expected_submissions[self.room_code]}."
                )

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"User {username} removed from room {self.room_code} group.")

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        t = data.get('type')
        logger.info(f"Received message of type '{t}' in room {self.room_code}.")

        if t == 'advance_question':
            self.__class__.expected_submissions[self.room_code] = self.__class__.user_count[self.room_code]
            self.__class__.submitted_users[self.room_code].clear()
            logger.info(
                f"Advanced question in room {self.room_code}. Expected submissions: "
                f"{self.__class__.expected_submissions[self.room_code]}."
            )
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
                logger.info(f"Updated score for user {username} in room {self.room_code}: {score}/{total}.")
            if username not in self.__class__.submitted_users[self.room_code]:
                self.__class__.submitted_users[self.room_code].add(username)
                self.__class__.expected_submissions[self.room_code] -= 1
                logger.info(
                    f"User {username} submitted in room {self.room_code}. "
                    f"Remaining submissions: {self.__class__.expected_submissions[self.room_code]}."
                )
            if self.__class__.expected_submissions[self.room_code] <= 0:
                logger.info(f"All submissions received for room {self.room_code}. Broadcasting scores.")
                await self.broadcast_scores()
        elif t == 'quiz_finished':
            logger.info(f"Quiz finished in room {self.room_code}. Not resetting submissions so that received scores "
                        f"remain.")
            await self.channel_layer.group_send(self.room_group_name, {"type": "quiz_finished"})

    async def question_advanced(self, event):
        logger.info(f"Question advanced in room {self.room_code}. New index: {event['question_index']}.")
        await self.send(text_data=json.dumps({
            'type': 'question_advanced',
            'question_index': event['question_index'],
        }))

    async def quiz_finished(self, event):
        self.__class__.expected_submissions[self.room_code] = self.__class__.user_count[self.room_code]
        self.__class__.submitted_users[self.room_code].clear()
        max_wait_time = 5
        time_waited = 0
        interval = 1
        logger.info(
            f"Quiz finished event received in room {self.room_code}. "
            f"Waiting for {self.__class__.expected_submissions[self.room_code]} submissions..."
        )

        while time_waited < max_wait_time:
            if self.__class__.expected_submissions[self.room_code] <= 0:
                logger.info(f"All submissions received for room {self.room_code}.")
                break
            time_waited += interval
            logger.debug(f"Waiting for submissions in room {self.room_code}. Time waited: {time_waited}s.")

        await self.broadcast_scores()
        await self.delete_game_room()
        await self.send(text_data=json.dumps({"type": "quiz_finished"}))
        logger.info(f"Quiz finished in room {self.room_code}. Scores broadcasted and game room deleted.")

    async def broadcast_scores(self):
        room_scores = self.__class__.scores.get(self.room_code, {})
        all_scores = [{"username": u, "score": d["score"], "total": d["total"]} for u, d in room_scores.items()]
        logger.info(f"Broadcasting scores for room {self.room_code}: {all_scores}.")
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "scores_update_message",
                "scores": all_scores
            }
        )

    async def scores_update_message(self, event):
        logger.info(f"Sending scores update to client in room {self.room_code}.")
        await self.send(text_data=json.dumps({
            "type": "scores_update",
            "scores": event["scores"]
        }))

    async def delete_game_room(self):
        async_delete = sync_to_async(Game.objects.filter(code=self.room_code).delete)
        try:
            await async_delete()
            logger.info(f"Game room {self.room_code} deleted successfully.")
        except Exception as e:
            logger.error(f"Failed to delete game room {self.room_code}: {e}")
