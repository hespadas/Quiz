# services/game_room_cache.py
import logging

from django.core.cache import cache

logger = logging.getLogger(__name__)


class GameRoomCache:
    def __init__(self, room_code: str):
        self.room_code = room_code
        self.scores_key = f"game_room:{room_code}:scores"
        self.expected_submissions_key = f"game_room:{room_code}:expected_submissions"
        self.user_count_key = f"game_room:{room_code}:user_count"
        self.submitted_users_key = f"game_room:{room_code}:submitted_users"
        self.room_user_connections_key = f"game_room:{room_code}:user_connections"

    def initialize(self):
        self._initialize_cache(self.scores_key, {})
        self._initialize_cache(self.expected_submissions_key, 0)
        self._initialize_cache(self.user_count_key, 0)
        self._initialize_cache(self.submitted_users_key, set())
        self._initialize_cache(self.room_user_connections_key, {})

    def _initialize_cache(self, key, default_value):
        if cache.get(key) is None:
            cache.set(key, default_value)
            logger.debug(f"Initialized {key} with default: {default_value} for room {self.room_code}")

    def get_scores(self):
        return cache.get(self.scores_key, {})

    def set_scores(self, scores):
        cache.set(self.scores_key, scores)

    def get_expected_submissions(self):
        return cache.get(self.expected_submissions_key, 0)

    def set_expected_submissions(self, value):
        cache.set(self.expected_submissions_key, value)

    def get_user_count(self):
        return cache.get(self.user_count_key, 0)

    def set_user_count(self, value):
        cache.set(self.user_count_key, value)

    def get_submitted_users(self):
        return cache.get(self.submitted_users_key, set())

    def set_submitted_users(self, users):
        cache.set(self.submitted_users_key, users)

    def get_room_user_connections(self):
        return cache.get(self.room_user_connections_key, {})

    def set_room_user_connections(self, connections):
        cache.set(self.room_user_connections_key, connections)
