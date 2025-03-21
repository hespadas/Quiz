from rest_framework import filters, generics, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from quiz.models import Quiz
from quiz.serializers.quiz_serializer import QuizSerializer


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100


@permission_classes([IsAuthenticated])
class QuizCreateView(generics.CreateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)


@permission_classes([IsAuthenticated])
class QuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        return Quiz.objects.filter(created_by=self.request.user).order_by('-created_at')


@permission_classes([IsAuthenticated])
class GeneralQuizListView(generics.ListAPIView):
    serializer_class = QuizSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category__name']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):  # noqa: PLR6301
        return Quiz.objects.filter(is_general=True).order_by('-created_at')


@permission_classes([IsAuthenticated])
class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


@permission_classes([IsAuthenticated])
class QuizUpdateView(generics.UpdateAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
    parser_classes = [MultiPartParser, FormParser]

    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)


@permission_classes([IsAuthenticated])
class QuizStartView(APIView):
    @staticmethod
    def get(request, quiz_id: int):
        quiz = Quiz.objects.get(id=quiz_id)
        quiz.questions.all()
        QuizSerializer(quiz)
        return Response({"message": "Starting quiz"})


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
class QuizViewSet(viewsets.ModelViewSet):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
