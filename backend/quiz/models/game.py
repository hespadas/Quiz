# quiz/models/game_room.py

import random
import string

from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


def generate_unique_code():
    while True:
        code = ''.join(random.choices(string.digits, k=6))
        if not Game.objects.filter(code=code).exists():
            return code


class Game(models.Model):
    code = models.CharField(max_length=6, unique=True, default=generate_unique_code)
    quiz = models.ForeignKey('Quiz', on_delete=models.CASCADE)
    host = models.ForeignKey(User, on_delete=models.CASCADE)
    participants = models.ManyToManyField(User, related_name='game_rooms', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Game{self.code} for quiz {self.quiz.title}"
