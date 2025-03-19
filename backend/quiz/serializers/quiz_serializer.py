import json

from rest_framework import serializers

from quiz.models.category import Category
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
    questions = QuestionSerializer(many=True, required=False)
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

    def create(self, validated_data):
        request = self.context.get('request')
        quiz = Quiz.objects.create(created_by=request.user, **validated_data)
        return quiz

    def update(self, instance, validated_data):  # noqa: PLR6301
        if 'imagem' in validated_data:
            instance.imagem = validated_data['imagem']
        instance.title = validated_data.get('title', instance.title)
        instance.description = validated_data.get('description', instance.description)
        instance.category = validated_data.get('category', instance.category)
        instance.save()
        return instance
