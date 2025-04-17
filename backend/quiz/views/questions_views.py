import json
import os

import openai
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from quiz.models import Question
from quiz.serializers.question_serializer import QuestionSerializer


@permission_classes([IsAuthenticated])
class QuestionListView(generics.ListAPIView):
    serializer_class = QuestionSerializer

    def get_queryset(self):
        quiz_id = self.kwargs.get("quiz_id")
        if not quiz_id:
            return Question.objects.none()
        return Question.objects.filter(quiz_id=quiz_id)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def bulk_update_questions(request, quiz_id):
    questions_data = request.data.get("questions", [])
    if not questions_data:
        return Response({"error": "No questions provided."}, status=status.HTTP_400_BAD_REQUEST)
    sent_ids = {q.get("id") for q in questions_data if q.get("id")}
    current_questions = Question.objects.filter(quiz_id=quiz_id)
    set(current_questions.values_list("id", flat=True))
    for question in current_questions:
        if question.id not in sent_ids:
            question.delete()
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


@api_view(["POST"])
def generate_questions(request):
    openai.api_key = os.getenv("OPENAI_API_KEY")
    quiz_topic = request.data.get("quiz_topic")
    question_count = request.data.get("question_count", 10)
    if not quiz_topic:
        return Response(
            {"detail": "quiz_topic is required"},
            status=status.HTTP_400_BAD_REQUEST,
        )
    completion = openai.chat.completions.create(
        model="gpt-4.1-mini",
        temperature=0.2,
        max_tokens=question_count * 120,
        messages=[
            {"role": "user",
  "content": (
      f"Generate {question_count} multiple-choice questions about:{quiz_topic}. "
       "The questions should be language from topics like: "
      "Each question must have four options, with exactly one correct option. "
      "Return the result as pure JSON, with no markdown, code blocks, or additional text. "
      "Example format:\n"
      "[\n"
      "  {\n"
      "    \"text\": \"Question 1?\",\n"
      "    \"question_type\": \"MC\",\n"
      "    \"options\": [\n"
      "      {\"text\": \"Option 1\", \"is_correct\": false},\n"
      "      {\"text\": \"Option 2\", \"is_correct\": true},\n"
      "      {\"text\": \"Option 3\", \"is_correct\": false},\n"
      "      {\"text\": \"Option 4\", \"is_correct\": false}\n"
      "    ]\n"
      "  },\n"
      "  ...\n"
      "]"
  )
            },
        ],
    )

    generated_content = completion.choices[0].message.content
    questions = json.loads(generated_content)

    return Response(questions)
