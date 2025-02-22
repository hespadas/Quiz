from channels.db import database_sync_to_async

from quiz.models import Game


class LobbyManager:
    _lobbies = {}

    @classmethod
    def get_or_create_lobby(cls, code):
        if code not in cls._lobbies:
            cls._lobbies[code] = {
                "users": set(),
                "real_host": None,
            }
        return cls._lobbies[code]

    @classmethod
    def add_user(cls, code, username):
        lobby_data = cls.get_or_create_lobby(code)
        lobby_data["users"].add(username)

    @classmethod
    def remove_user(cls, code, username):
        lobby_data = cls._lobbies.get(code)
        if lobby_data and username in lobby_data["users"]:
            lobby_data["users"].remove(username)
            if not lobby_data["users"]:
                del cls._lobbies[code]

    @classmethod
    def set_real_host(cls, code, host_username):
        lobby_data = cls.get_or_create_lobby(code)
        if not lobby_data["real_host"]:
            lobby_data["real_host"] = host_username

    @classmethod
    def get_real_host(cls, code):
        lobby_data = cls._lobbies.get(code) or cls.get_or_create_lobby(code)
        return lobby_data["real_host"]

    @classmethod
    def get_users(cls, code):
        lobby_data = cls._lobbies.get(code)
        if lobby_data:
            return list(lobby_data["users"])
        return []

    @classmethod
    def has_lobby(cls, code):
        return code in cls._lobbies

    @classmethod
    async def initialize_real_host(cls, code):
        real_host_username = await cls.get_game_host_username(code)
        if real_host_username:
            cls.set_real_host(code, real_host_username)
        return real_host_username

    @classmethod
    def user_is_host(cls, code, user):
        return user.username == cls.get_real_host(code)

    @staticmethod
    @database_sync_to_async
    def get_game_host_username(code):
        game = Game.objects.get(code=code)
        return game.host.username
