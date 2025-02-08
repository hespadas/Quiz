import asyncio
import json
import logging

from asgiref.sync import sync_to_async
from channels.generic.websocket import AsyncWebsocketConsumer
from django.core.cache import cache

from quiz.models.game import Game
from quiz.services.game_room_cache import GameRoomCache

logger = logging.getLogger(__name__)


class ConnectionManager:
    def __init__(self, room_code, cache_manager):
        self.room_code = room_code
        self.cache_manager = cache_manager

    def add_connection(self, username):
        room_connections = self.cache_manager.get_room_user_connections()
        if username in room_connections:
            room_connections[username] += 1
            logger.info(f"User {username} já conectado. Count: {room_connections[username]}.")
        else:
            room_connections[username] = 1
            user_count = self.cache_manager.get_user_count() + 1
            self.cache_manager.set_user_count(user_count)
            logger.info(f"User {username} entrou na sala. Nova contagem: {user_count}.")
        self.cache_manager.set_room_user_connections(room_connections)

    def remove_connection(self, username):
        room_connections = self.cache_manager.get_room_user_connections()
        if username in room_connections:
            room_connections[username] -= 1
            if room_connections[username] <= 0:
                del room_connections[username]
                new_count = max(self.cache_manager.get_user_count() - 1, 0)
                self.cache_manager.set_user_count(new_count)
                logger.info(f"User {username} saiu da sala {self.room_code}. "
                            f"Contagem atual: {new_count}.")
            else:
                logger.info(f"User {username} ainda possui {room_connections[username]} conexão(ões) "
                            f"na sala {self.room_code}.")
        self.cache_manager.set_room_user_connections(room_connections)

        expected_submissions = self.cache_manager.get_expected_submissions()
        if expected_submissions > 0:
            self.cache_manager.set_expected_submissions(expected_submissions - 1)
            logger.info(f"Submissions esperadas decrementadas para a sala {self.room_code}. "
                        f"Valor atual: {self.cache_manager.get_expected_submissions()}.")


class ScoreManager:
    def __init__(self, room_code):
        self.room_code = room_code
        self.scores_key = f"game_room:{room_code}:scores"
        self.expected_submissions_key = f"game_room:{room_code}:expected_submissions"
        self.submitted_users_key = f"game_room:{room_code}:submitted_users"
        self.user_count_key = f"game_room:{room_code}:user_count"

    def advance_question(self):
        user_count = cache.get(self.user_count_key, 0)
        cache.set(self.expected_submissions_key, user_count)
        cache.set(self.submitted_users_key, set())
        logger.info(f"Pergunta avançada na sala {self.room_code}. "
                    f"Submissões esperadas: {user_count}.")

    def update_user_score(self, username, score, total):
        scores = cache.get(self.scores_key, {})
        scores[username] = {"score": score, "total": total}
        cache.set(self.scores_key, scores)
        logger.info(f"Pontuação atualizada para {username} na sala {self.room_code}: {score}/{total}.")

        submitted_users = cache.get(self.submitted_users_key, set())
        if username not in submitted_users:
            submitted_users.add(username)
            cache.set(self.submitted_users_key, submitted_users)
            cache.decr(self.expected_submissions_key)
            remaining = cache.get(self.expected_submissions_key, 0)
            logger.info(f"Usuário {username} submeteu na sala {self.room_code}. "
                        f"Submissões restantes: {remaining}.")

    def submissions_complete(self):
        return cache.get(self.expected_submissions_key, 0) <= 0

    def get_scores(self):
        scores = cache.get(self.scores_key, {})
        return [
            {"username": username, "score": data["score"], "total": data["total"]}
            for username, data in scores.items()
        ]

    def reset_on_quiz_finished(self):
        user_count = cache.get(self.user_count_key, 0)
        cache.set(self.expected_submissions_key, user_count)
        cache.set(self.submitted_users_key, set())
        logger.info(f"Estado resetado para quiz finalizado na sala {self.room_code}. "
                    f"Aguardando {user_count} submissões...")


class GameRoomConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_code = self.scope["url_route"]["kwargs"]["code"]
        self.room_group_name = f"game_room_{self.room_code}"
        username = self.scope["user"].username

        logger.info(f"Usuário {username} conectando na sala {self.room_code}.")

        self.cache_manager = GameRoomCache(self.room_code)
        self.cache_manager.initialize()

        self.connection_manager = ConnectionManager(self.room_code, self.cache_manager)
        self.connection_manager.add_connection(username)

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        logger.info(f"Conexão WebSocket aceita para a sala {self.room_code}.")

    async def disconnect(self, close_code):
        username = self.scope["user"].username
        logger.info(f"Usuário {username} desconectando da sala {self.room_code} com código {close_code}.")

        self.connection_manager.remove_connection(username)

        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        logger.info(f"Usuário {username} removido do grupo da sala {self.room_code}.")

    async def receive(self, text_data=None, bytes_data=None):
        data = json.loads(text_data)
        t = data.get("type")
        logger.info(f"Mensagem recebida do tipo '{t}' na sala {self.room_code}.")

        score_manager = ScoreManager(self.rooZm_code)

        if t == "advance_question":
            score_manager.advance_question()
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "question_advanced", "question_index": data["question_index"]}
            )

        elif t == "user_score":
            username = data.get("username")
            score = data.get("score")
            total = data.get("total")
            if username:
                score_manager.update_user_score(username, score, total)

            if score_manager.submissions_complete():
                logger.info(f"Todas as submissões recebidas na sala {self.room_code}. "
                            "Enviando pontuações.")
                await self.broadcast_scores()

        elif t == "quiz_finished":
            logger.info(f"Quiz finalizado na sala {self.room_code}. Pontuações anteriores mantidas.")
            await self.channel_layer.group_send(
                self.room_group_name,
                {"type": "quiz_finished"}
            )

    async def question_advanced(self, event):
        logger.info(f"Pergunta avançada na sala {self.room_code}. Índice: {event['question_index']}.")
        await self.send(text_data=json.dumps({
            "type": "question_advanced",
            "question_index": event["question_index"],
        }))

    async def quiz_finished(self, event):
        score_manager = ScoreManager(self.room_code)
        score_manager.reset_on_quiz_finished()

        max_wait_time = 5
        interval = 1
        time_waited = 0

        logger.info(f"Evento de quiz finalizado recebido na sala {self.room_code}. "
                    f"Aguardando submissões dos usuários...")

        while time_waited < max_wait_time:
            if score_manager.submissions_complete():
                logger.info(f"Todas as submissões recebidas na sala {self.room_code}.")
                break
            time_waited += interval
            logger.debug(f"Aguardando submissões na sala {self.room_code}. "
                         f"Tempo aguardado: {time_waited}s.")
            await asyncio.sleep(interval)

        await self.broadcast_scores()
        await self.delete_game_room()

        await self.send(text_data=json.dumps({"type": "quiz_finished"}))
        logger.info(f"Quiz finalizado na sala {self.room_code}. Pontuações enviadas e sala deletada.")

    async def broadcast_scores(self):
        score_manager = ScoreManager(self.room_code)
        all_scores = score_manager.get_scores()

        logger.info(f"Enviando pontuações para a sala {self.room_code}: {all_scores}.")

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "scores_update_message", "scores": all_scores}
        )

    async def scores_update_message(self, event):
        logger.info(f"Enviando atualização de pontuações para o cliente na sala {self.room_code}.")
        await self.send(text_data=json.dumps({
            "type": "scores_update",
            "scores": event["scores"]
        }))

    async def delete_game_room(self):
        async_delete = sync_to_async(Game.objects.filter(code=self.room_code).delete)
        try:
            await async_delete()
            logger.info(f"Sala de jogo {self.room_code} deletada com sucesso.")
        except Exception as e:
            logger.error(f"Falha ao deletar a sala {self.room_code}: {e}")
