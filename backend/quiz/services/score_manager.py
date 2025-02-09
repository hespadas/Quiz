from django.core.cache import cache


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

    def update_user_score(self, username, score, total):
        scores = cache.get(self.scores_key, {})
        scores[username] = {"score": score, "total": total}
        cache.set(self.scores_key, scores)

        submitted_users = cache.get(self.submitted_users_key, set())
        if username not in submitted_users:
            submitted_users.add(username)
            cache.set(self.submitted_users_key, submitted_users)
            cache.decr(self.expected_submissions_key)

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
