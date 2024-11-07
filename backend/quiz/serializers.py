# quiz/serializers.py

from rest_framework import serializers

from .models.category import Category
from .models.option import Option
from .models.question import Question
from .models.quiz import Quiz


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']


class OptionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)
    options = OptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'order', 'question_type', 'options']

    def create(self, validated_data):  # noqa: PLR6301
        options_data = validated_data.pop('options')
        question = Question.objects.create(**validated_data)
        for option_data in options_data:
            Option.objects.create(question=question, **option_data)
        return question

    def update(self, instance, validated_data):  # noqa: PLR6301
        options_data = validated_data.pop('options', [])

        instance.text = validated_data.get('text', instance.text)
        instance.order = validated_data.get('order', instance.order)
        instance.question_type = validated_data.get('question_type', instance.question_type)
        instance.save()

        existing_option_ids = [option.id for option in instance.options.all()]

        for option_data in options_data:
            option_id = option_data.get('id', None)
            if option_id:
                try:
                    option = Option.objects.get(id=option_id, question=instance)
                    option.text = option_data.get('text', option.text)
                    option.is_correct = option_data.get('is_correct', option.is_correct)
                    option.save()
                    existing_option_ids.remove(option_id)
                except Option.DoesNotExist:

                    continue
            else:
                Option.objects.create(question=instance, **option_data)

        Option.objects.filter(id__in=existing_option_ids, question=instance).delete()

        return instance


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

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'category', 'category_id', 'created_at', 'questions']

    def create(self, validated_data):  # noqa: PLR6301
        questions_data = validated_data.pop('questions')
        quiz = Quiz.objects.create(**validated_data)
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

        return instance
