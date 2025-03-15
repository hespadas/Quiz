from django.contrib.auth import get_user_model
from django.db import models

from quiz.models.category import Category

User = get_user_model()


class Quiz(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name='quizzes', null=False, blank=False
    )
    imagem = models.ImageField(upload_to='quiz/', null=True, blank=True)

    def __str__(self):
        return self.title
