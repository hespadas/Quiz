# quiz/views.py

from rest_framework import filters, generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models.category import Category
from .models.game import Game
from .models.quiz import Quiz
from .serializers.category_serializer import CategorySerializer
from .serializers.game_room_serializer import GameCreateSerializer, GameSerializer
from .serializers.lobby_serializer import LobbyCreateSerializer
from .serializers.quiz_serializer import QuizSerializer


@permission_classes([IsAuthenticated])
class HomeView(APIView):
    @staticmethod
    def get(request):
        content = {"message": "Welcome to home of your new project!"}
        return Response(content)


@permission_classes([IsAuthenticated])
class QuizCreateView(generics.CreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@permission_classes([IsAuthenticated])
class QuizListView(generics.ListAPIView):
    queryset = Quiz.objects.all().order_by('-created_at')
    serializer_class = QuizSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'title']


@permission_classes([IsAuthenticated])
class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


@permission_classes([IsAuthenticated])
class QuizUpdateView(generics.UpdateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


@permission_classes([IsAuthenticated])
class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


@permission_classes([IsAuthenticated])
class QuizStartView(APIView):
    @staticmethod
    def get(request, quiz_id: int):
        quiz = Quiz.objects.get(id=quiz_id)
        quiz.questions.all()
        QuizSerializer(quiz)


class GameCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GameCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.context['request'] = request
        serializer.is_valid(raise_exception=True)
        game_room = serializer.save()
        data = GameSerializer(game_room).data
        return Response(data, status=status.HTTP_201_CREATED)


class GameRetrieveView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    lookup_field = 'code'
    permission_classes = [IsAuthenticated]


class UserInfoView(APIView):
    permission_classes = [IsAuthenticated]

    @staticmethod
    def get(request):
        user = request.user
        data = {
            'username': user.username,
            'email': user.email,
        }
        return Response(data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_quiz(request, quiz_id):
    try:
        answers = request.data.get('answers', {})
        quiz = Quiz.objects.prefetch_related('questions__options').get(id=quiz_id)
        questions = quiz.questions.all()
        score = 0
        total = questions.count()

        for question in questions:
            correct_option = question.options.filter(is_correct=True).first()
            user_answer_id = answers.get(str(question.id))
            if user_answer_id and str(correct_option.id) == str(user_answer_id):
                score += 1

        return Response({'score': score, 'total': total})
    except Quiz.DoesNotExist:
        return Response({'error': 'Quiz not found.'}, status=404)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


@permission_classes([IsAuthenticated])
class LobbyCreateView(generics.CreateAPIView):
    serializer_class = LobbyCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.context['request'] = request
        serializer.is_valid(raise_exception=True)
        game_room = serializer.save()
        data = GameSerializer(game_room).data
        return Response(data, status=status.HTTP_201_CREATED)
