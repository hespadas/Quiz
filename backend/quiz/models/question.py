from django.db import models

from quiz.models.quiz import Quiz


class Question(models.Model):
    QUESTION_TYPE_CHOICES = [
        ('MC', 'Multiple Choice'),
        ('TF', 'True/False'),
    ]

    text = models.CharField(max_length=500)
    quiz = models.ForeignKey(Quiz, related_name='questions',
                             on_delete=models.CASCADE)
    order = models.PositiveIntegerField()
    question_type = models.CharField(max_length=2, default='MC',
                                     choices=QUESTION_TYPE_CHOICES)

    def __str__(self):
        return self.text
