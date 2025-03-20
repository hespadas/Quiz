from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from quiz.models import Question, Quiz
from quiz.serializers.question_serializer import QuestionSerializer


@permission_classes([IsAuthenticated])
class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        quiz_id = self.kwargs.get("quiz_id")
        if not quiz_id:
            return Question.objects.none()
        return Question.objects.filter(quiz_id=quiz_id)


@permission_classes([IsAuthenticated])
class QuestionCreateView(generics.CreateAPIView):
    serializer_class = QuestionSerializer

    def perform_create(self, serializer):
        quiz_id = self.kwargs.get("quiz_id")
        quiz = Quiz.objects.get(id=quiz_id)
        serializer.save(quiz=quiz)


@permission_classes([IsAuthenticated])
class QuestionDetailView(generics.RetrieveAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


@permission_classes([IsAuthenticated])
class QuestionUpdateView(generics.UpdateAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


@permission_classes([IsAuthenticated])
class QuestionDeleteView(generics.DestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def bulk_update_questions(request, quiz_id):
    questions_data = request.data.get("questions", [])

    if not questions_data:
        return Response({"error": "No questions provided."}, status=status.HTTP_400_BAD_REQUEST)

    for question_data in questions_data:
        question_id = question_data.get("id")
        if question_id:
            try:
                question = Question.objects.get(id=question_id, quiz_id=quiz_id)
                serializer = QuestionSerializer(instance=question, data=question_data, partial=True)
                if serializer.is_valid():
                    serializer.save()
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            except Question.DoesNotExist:
                return Response({"error": f"Question ID {question_id} not found"}, status=status.HTTP_404_NOT_FOUND)
        else:
            question_data["quiz"] = quiz_id
            serializer = QuestionSerializer(data=question_data)
            if serializer.is_valid():
                serializer.save()
            else:
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    return Response({"message": "Questions updated successfully"}, status=status.HTTP_200_OK)
