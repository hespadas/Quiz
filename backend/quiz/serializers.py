# quiz/serializers.py

from rest_framework import serializers

from quiz.models.category import Category
from quiz.models.option import Option
from quiz.models.question import Question
from quiz.models.quiz import Quiz


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
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


class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True)
    category = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), allow_null=True)

    class Meta:
        model = Quiz
        fields = ['id', 'title', 'description', 'category', 'created_at', 'questions']

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
        category = validated_data.pop('category', None)

        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = category if category else instance.category
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
