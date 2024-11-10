

from rest_framework import serializers

from quiz.models.option import Option


class OptionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Option
        fields = ['id', 'text', 'is_correct']
