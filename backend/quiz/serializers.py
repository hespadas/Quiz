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
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)
    id = serializers.IntegerField(required=False)

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

        for option_data in options_data:
            option_id = option_data.get('id', None)
            if option_id:
                option = Option.objects.get(id=option_id, question=instance)
                option.text = option_data.get('text', option.text)
                option.is_correct = option_data.get('is_correct', option.is_correct)
                option.save()
            else:
                Option.objects.create(question=instance, **option_data)

        return instance


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    category = CategorySerializer(read_only=True)
    category_id = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        allow_null=True
    )

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
        instance.save()

        for question_data in questions_data:
            question_id = question_data.get('id', None)
            if question_id:
                question = Question.objects.get(id=question_id, quiz=instance)
                question.text = question_data.get('text', question.text)
                question.order = question_data.get('order', question.order)
                question.question_type = question_data.get('question_type', question.question_type)
                question.save()

                options_data = question_data.get('options', [])
                for option_data in options_data:
                    option_id = option_data.get('id', None)
                    if option_id:
                        option = Option.objects.get(id=option_id, question=question)
                        option.text = option_data.get('text', option.text)
                        option.is_correct = option_data.get('is_correct', option.is_correct)
                        option.save()
                    else:
                        Option.objects.create(question=question, **option_data)
            else:
                options_data = question_data.pop('options', [])
                new_question = Question.objects.create(quiz=instance, **question_data)
                for option_data in options_data:
                    Option.objects.create(question=new_question, **option_data)

        return instance
