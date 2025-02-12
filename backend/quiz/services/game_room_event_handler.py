import asyncio
import json

from quiz.services.score_manager import ScoreManager


class GameRoomEventHandler:
    def __init__(self, consumer):
        self.consumer = consumer
        self.room_code = consumer.room_code
        self.channel_layer = consumer.channel_layer
        self.room_group_name = consumer.room_group_name

    async def handle(self, data):
        event_type = data.get("type")
        if event_type == "advance_question":
            await self.handle_advance_question(data)
        elif event_type == "user_score":
            await self.handle_user_score(data)
        elif event_type == "quiz_finished":
            await self.handle_quiz_finished(data)

    async def handle_advance_question(self, data):
        score_manager = ScoreManager(self.room_code)
        score_manager.advance_question()
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "question_advanced", "question_index": data["question_index"]}
        )

    async def handle_user_score(self, data):
        score_manager = ScoreManager(self.room_code)
        username = data.get("username")
        score = data.get("score")
        total = data.get("total")

        if username:
            score_manager.update_user_score(username, score, total)

        if score_manager.submissions_complete():
            await self.broadcast_scores()

    async def handle_quiz_finished(self, data):
        score_manager = ScoreManager(self.room_code)
        score_manager.reset_on_quiz_finished()

        inactivity_timeout = 5
        interval = 1
        time_waited = 0

        while True:
            if score_manager.submissions_complete():
                break
            time_waited += interval
            if time_waited >= inactivity_timeout:
                break
            await asyncio.sleep(interval)

        await self.broadcast_scores()
        await self.consumer.delete_game_room()
        await self.consumer.send(text_data=json.dumps({"type": "quiz_finished"}))

    async def broadcast_scores(self):
        score_manager = ScoreManager(self.room_code)
        all_scores = score_manager.get_scores()

        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "scores_update_message", "scores": all_scores}
        )
