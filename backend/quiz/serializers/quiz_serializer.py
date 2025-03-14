import json
import logging

from rest_framework import serializers

from quiz.models.category import Category
from quiz.models.option import Option
from quiz.models.question import Question
from quiz.models.quiz import Quiz
from quiz.serializers.category_serializer import CategorySerializer
from quiz.serializers.question_serializer import QuestionSerializer

logger = logging.getLogger(__name__)


class QuizSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        allow_null=True
    )
    category = CategorySerializer(read_only=True)
    questions = QuestionSerializer(many=True, required=False, default=list)  # 🔹 Garante que sempre terá um valor
    created_by = serializers.StringRelatedField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Quiz
        fields = [
            'id', 'title', 'description',
            'category', 'category_id',
            'created_at', 'questions', 'created_by',
            'imagem'
        ]

    def to_internal_value(self, data):
        data = data.copy()
        if isinstance(data.get("questions"), str):
            try:
                data["questions"] = json.loads(data["questions"])
            except json.JSONDecodeError:
                raise serializers.ValidationError({"questions": "Invalid JSON format."})
        print("DEBUG after JSON parse =>", data.get("questions"))

        return super().to_internal_value(data)

    def create(self, validated_data):

        logger.debug(f"🔍 Criando quiz com dados -> {validated_data}")  # 🚀 LOG
        questions_data = validated_data.pop('questions', [])
        request = self.context.get('request')
        quiz = Quiz.objects.create(created_by=request.user, **validated_data)

        for question_data in questions_data:
            options_data = question_data.pop('options', [])
            question = Question.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)

        return quiz

    def update(self, instance, validated_data):
        logger.debug(f"✏️ Atualizando quiz {instance.id} com dados -> {validated_data}")  # 🚀 LOG
        if 'imagem' in validated_data:
            instance.imagem = validated_data['imagem']
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.save()
        questions_data = self.initial_data.get('questions', None)
        if questions_data:
            if isinstance(questions_data, str):
                try:
                    questions_data = json.loads(questions_data)
                except json.JSONDecodeError:
                    raise serializers.ValidationError({"questions": "Invalid JSON format."})
        else:
            questions_data = []

        existing_question_ids = [q.id for q in instance.questions.all()]

        for question_data in questions_data:
            question_id = question_data.get('id', None)
            if question_id and question_id in existing_question_ids:
                existing_question_ids.remove(question_id)
                question = Question.objects.get(id=question_id, quiz=instance)
                question_serializer = QuestionSerializer(instance=question, data=question_data)
                question_serializer.is_valid(raise_exception=True)
                question_serializer.save()
            else:
                options_data = question_data.pop('options', [])
                new_question = Question.objects.create(quiz=instance, **question_data)
                for opt_data in options_data:
                    Option.objects.create(question=new_question, **opt_data)

        if existing_question_ids:
            Question.objects.filter(id__in=existing_question_ids, quiz=instance).delete()

        return instance
