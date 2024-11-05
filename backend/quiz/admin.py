from django.contrib import admin

from quiz.models.attempt import Attempt
from quiz.models.category import Category
from quiz.models.option import Option
from quiz.models.question import Question
from quiz.models.quiz import Quiz

admin.site.register(Category)
admin.site.register(Quiz)
admin.site.register(Question)
admin.site.register(Option)
admin.site.register(Attempt)
