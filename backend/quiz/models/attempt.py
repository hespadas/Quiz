
from django.contrib.auth.models import User
from django.db import models

from quiz.models.option import AnswerOption
from quiz.models.question import Question


class Attempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(Question, on_delete=models.CASCADE)
    option = models.ForeignKey(AnswerOption, on_delete=models.SET_NULL, null=True)
    answered_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user} - {self.question}'
