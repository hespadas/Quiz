from rest_framework import serializers

from quiz.models import Option, Question


class OptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']


class QuestionSerializer(serializers.ModelSerializer):
    options = OptionSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'quiz', 'order', 'question_type', 'options']

    def create(self, validated_data):  # noqa: PLR6301
        options_data = validated_data.pop('options', [])
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
        instance.options.all().delete()
        for option_data in options_data:
            Option.objects.create(question=instance, **option_data)

        return instance
