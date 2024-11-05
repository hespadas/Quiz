from rest_framework import generics
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models.quiz import Quiz
from .serializers import QuizSerializer


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


@permission_classes([IsAuthenticated])
class QuizListView(generics.ListAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer


@permission_classes([IsAuthenticated])
class QuizDetailView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizSerializer
