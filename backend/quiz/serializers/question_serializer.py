from rest_framework import serializers

from quiz.models.option import Option
from quiz.models.question import Question
from quiz.serializers.option_serializer import OptionSerializer


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

    def validate(self, data):  # noqa: PLR6301
        options = data.get('options', [])
        correct_options = [option for option in options if option.get('is_correct')]
        if len(correct_options) != 1:
            raise serializers.ValidationError("There must be exactly one correct option per question.")
        return data
