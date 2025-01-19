
from rest_framework import serializers

from quiz.models.category import Category
from quiz.models.option import Option
from quiz.models.question import Question
from quiz.models.quiz import Quiz
from quiz.serializers.category_serializer import CategorySerializer
from quiz.serializers.question_serializer import QuestionSerializer


class QuizSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        allow_null=True
    )
    category = CategorySerializer(read_only=True)
    questions = QuestionSerializer(many=True)
    created_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'category', 'category_id', 'created_at',
                  'questions', 'created_by']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions')
        request = self.context.get('request')
        quiz = Quiz.objects.create(created_by=request.user, **validated_data)
        for question_data in questions_data:
            options_data = question_data.pop('options')
            question = Question.objects.create(quiz=quiz, **question_data)
            for option_data in options_data:
                Option.objects.create(question=question, **option_data)
        return quiz

    def update(self, instance, validated_data):  # noqa: PLR6301
        questions_data = validated_data.pop('questions', [])

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.save()

        existing_question_ids = [question.id for question in instance.questions.all()]

        for question_data in questions_data:
            question_id = question_data.get('id', None)
            if question_id:
                try:
                    question = Question.objects.get(id=question_id, quiz=instance)
                    existing_question_ids.remove(question_id)
                except Question.DoesNotExist:
                    continue

                question_serializer = QuestionSerializer(instance=question, data=question_data)
                if question_serializer.is_valid():
                    question_serializer.save()
            else:
                options_data = question_data.pop('options', [])
                new_question = Question.objects.create(quiz=instance, **question_data)
                for option_data in options_data:
                    Option.objects.create(question=new_question, **option_data)

        if existing_question_ids:
            Question.objects.filter(id__in=existing_question_ids, quiz=instance).delete()

        return instance
