from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_nested.routers import NestedDefaultRouter

from . import views
from .views.game_views import GameCreateView, GameRetrieveView
from .views.quiz_views import (
    GeneralQuizListView,
    QuestionViewSet,
    QuizCreateView,
    QuizDetailView,
    QuizListView,
    QuizUpdateView,
    QuizViewSet,
)
from .views.user_views import UserInfoView

app_name = "quiz"

# Router para os endpoints da API
router = DefaultRouter()
router.register(r'quizzes', QuizViewSet, basename='quiz')

quiz_router = NestedDefaultRouter(router, r'quizzes', lookup='quiz')
quiz_router.register(r'questions', QuestionViewSet, basename='quiz-questions')

urlpatterns = [
    path("home/", views.home_views.HomeView.as_view(), name="home"),
    path('api/', include(router.urls)),
    path('api/', include(quiz_router.urls)),
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
