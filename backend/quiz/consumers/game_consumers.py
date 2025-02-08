import asyncio
import json
import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

from quiz.models.game import Game

logger = logging.getLogger(__name__)


def initialize_cache(key, default_value, room_code):
    value = cache.get(key, None)
    if value is None:
        cache.set(key, default_value)
        logger.debug(f"[initialize_cache] Initialized {key} with default: {default_value} for room {room_code}")
        return default_value
    return value


class GameRoomConsumer(AsyncWebsocketConsumer):
    scores = {}
    expected_submissions = {}
    user_count = {}
    submitted_users = {}
    room_user_connections = {}

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.room_code = None
        self.scores_key = None
        self.expected_submissions_key = None
        self.user_count_key = None
        self.submitted_users_key = None
        self.room_user_connections_key = None

    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f"game_room_{self.room_code}"
        username = self.scope["user"].username
        logger.info(f"User {username} connecting to room {self.room_code}.")

        self.scores_key = f"game_room:{self.room_code}:scores"
        self.expected_submissions_key = f"game_room:{self.room_code}:expected_submissions"
        self.user_count_key = f"game_room:{self.room_code}:user_count"
        self.submitted_users_key = f"game_room:{self.room_code}:submitted_users"
        self.room_user_connections_key = f"game_room:{self.room_code}:user_connections"

        initialize_cache(self.scores_key, {}, self.room_code)
        initialize_cache(self.expected_submissions_key, 0, self.room_code)
        initialize_cache(self.user_count_key, 0, self.room_code)
        initialize_cache(self.submitted_users_key, set(), self.room_code)
        initialize_cache(self.room_user_connections_key, {}, self.room_code)

        room_connections = cache.get(self.room_user_connections_key)
        if username in room_connections:
            room_connections[username] += 1
            logger.info(f"User {username} already connected. Count: {room_connections[username]}.")
        else:
            room_connections[username] = 1
            user_count = cache.get(self.user_count_key) + 1
            cache.set(self.user_count_key, user_count)
            logger.info(f"User {username} joined room. New user count: {user_count}.")

        cache.set(self.room_user_connections_key, room_connections)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"WebSocket connection accepted for room {self.room_code}.")

    async def disconnect(self, close_code):
        username = self.scope["user"].username
        logger.info(f"User {username} disconnecting from room {self.room_code} with close code {close_code}.")

        room_user_connections_key = f"game_room:{self.room_code}:user_connections"
        user_count_key = f"game_room:{self.room_code}:user_count"
        expected_submissions_key = f"game_room:{self.room_code}:expected_submissions"

        room_connections = cache.get(room_user_connections_key, {})

        if username in room_connections:
            room_connections[username] -= 1
            if room_connections[username] <= 0:
                del room_connections[username]
                cache.decr(user_count_key)
                logger.info(
                    f"User {username} left room {self.room_code}. "
                    f"Current user count: {cache.get(user_count_key, 0)}."
                )
            else:
                logger.info(
                    f"User {username} still has {room_connections[username]} "
                    f"connection(s) in room {self.room_code}."
                )

        cache.set(room_user_connections_key, room_connections)

        if cache.get(expected_submissions_key, 0) > 0:
            cache.decr(expected_submissions_key)
            logger.info(
                f"Decremented expected_submissions for room {self.room_code}. "
                f"Current value: {cache.get(expected_submissions_key, 0)}."
            )

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"User {username} removed from room {self.room_code} group.")

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        t = data.get("type")
        logger.info(f"Received message of type '{t}' in room {self.room_code}.")

        scores_key = f"game_room:{self.room_code}:scores"
        expected_submissions_key = f"game_room:{self.room_code}:expected_submissions"
        submitted_users_key = f"game_room:{self.room_code}:submitted_users"
        user_count_key = f"game_room:{self.room_code}:user_count"

        if t == "advance_question":
            user_count = cache.get(user_count_key, 0)
            cache.set(expected_submissions_key, user_count)
            cache.set(submitted_users_key, set())

            logger.info(f"Advanced question in room {self.room_code}. Expected submissions: {user_count}.")

            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "question_advanced", "question_index": data["question_index"]}
            )

        elif t == "user_score":
            username = data.get("username")
            score = data.get("score")
            total = data.get("total")

            if username:
                scores = cache.get(scores_key, {})
                scores[username] = {"score": score, "total": total}
                cache.set(scores_key, scores)

                logger.info(f"Updated score for user {username} in room {self.room_code}: {score}/{total}.")

                submitted_users = cache.get(submitted_users_key, set())
                if username not in submitted_users:
                    submitted_users.add(username)
                    cache.set(submitted_users_key, submitted_users)
                    cache.decr(expected_submissions_key)

                    logger.info(
                        f"User {username} submitted in room {self.room_code}. "
                        f"Remaining submissions: {cache.get(expected_submissions_key, 0)}."
                    )

            if cache.get(expected_submissions_key, 0) <= 0:
                logger.info(f"All submissions received for room {self.room_code}. Broadcasting scores.")
                await self.broadcast_scores()

        elif t == "quiz_finished":
            logger.info(f"Quiz finished in room {self.room_code}. Keeping previous scores.")
            await self.channel_layer.group_send(self.room_group_name, {"type": "quiz_finished"})

    async def question_advanced(self, event):
        logger.info(f"Question advanced in room {self.room_code}. New index: {event['question_index']}.")
        await self.send(text_data=json.dumps({
            "type": "question_advanced",
            "question_index": event["question_index"],
        }))

    async def quiz_finished(self, event):
        expected_submissions_key = f"game_room:{self.room_code}:expected_submissions"
        submitted_users_key = f"game_room:{self.room_code}:submitted_users"
        user_count_key = f"game_room:{self.room_code}:user_count"

        user_count = cache.get(user_count_key, 0)
        cache.set(expected_submissions_key, user_count)
        cache.set(submitted_users_key, set())

        max_wait_time = 5
        interval = 1
        time_waited = 0

        logger.info(
            f"Quiz finished event received in room {self.room_code}. "
            f"Waiting for {user_count} submissions..."
        )

        while time_waited < max_wait_time:
            if cache.get(expected_submissions_key, 0) <= 0:
                logger.info(f"All submissions received for room {self.room_code}.")
                break
            time_waited += interval
            logger.debug(f"Waiting for submissions in room {self.room_code}. Time waited: {time_waited}s.")
            await asyncio.sleep(interval)

        await self.broadcast_scores()
        await self.delete_game_room()

        await self.send(text_data=json.dumps({"type": "quiz_finished"}))
        logger.info(f"Quiz finished in room {self.room_code}. Scores broadcasted and game room deleted.")

    async def broadcast_scores(self):
        scores_key = f"game_room:{self.room_code}:scores"
        room_scores = cache.get(scores_key, {})

        all_scores = [
            {"username": username, "score": data["score"], "total": data["total"]}
            for username, data in room_scores.items()
        ]

        logger.info(f"Broadcasting scores for room {self.room_code}: {all_scores}.")

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "scores_update_message", "scores": all_scores}
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
