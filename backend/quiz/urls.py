from django.urls import path

from . import views
from .views.game_views import GameCreateView, GameRetrieveView
from .views.quiz_views import GeneralQuizListView, QuizCreateView, QuizDetailView, QuizListView, QuizUpdateView
from .views.user_views import UserInfoView

app_name = "quiz"

urlpatterns = [
    path("home/", views.home_views.HomeView.as_view(), name="home"),
    path('quizzes/', QuizListView.as_view(), name='quiz-list'),
    path('quizzes/general/', GeneralQuizListView.as_view(), name='quiz-list-general'),
    path('quizzes/create/', QuizCreateView.as_view(), name='quiz-create'),
    path('quizzes/<int:pk>/', QuizDetailView.as_view(), name='quiz-detail'),
    path('quiz/edit/<int:pk>', QuizUpdateView.as_view(), name='quiz-edit'),
    path('categories/', views.category_views.CategoryListView.as_view(), name='category-list'),
    path('start/', views.quiz_views.QuizStartView.as_view(), name='quiz-start'),
    path('game_rooms/create/', GameCreateView.as_view(), name='game_room_create'),
    path('game_rooms/<str:code>/', GameRetrieveView.as_view(), name='game_room_detail'),
    path('user-info/', UserInfoView.as_view(), name='user_info'),
    path('quizzes/submit/<int:quiz_id>/', views.quiz_views.submit_quiz, name='quiz-submit'),
]
