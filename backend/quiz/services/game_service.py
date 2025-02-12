from channels.db import database_sync_to_async

from quiz.models.game import Game


class GameService:
    @staticmethod
    @database_sync_to_async
    def get_game_host_username(code):
        try:
            game = Game.objects.get(code=code)
            return game.host.username
        except Game.DoesNotExist:
            return None
