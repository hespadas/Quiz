from django.urls import path

from . import views
from .views import QuizCreateView, QuizDetailView, QuizListView

app_name = "quiz"

urlpatterns = [path("home/", views.HomeView.as_view(), name="home"),
               path('quizzes/', QuizListView.as_view(), name='quiz-list'),
               path('quizzes/create/', QuizCreateView.as_view(), name='quiz-create'),
               path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
               ]
