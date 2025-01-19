from rest_framework import serializers

from ..models.game import Game
from ..models.quiz import Quiz
from .quiz_serializer import QuizSerializer


class GameSerializer(serializers.ModelSerializer):
    quiz = QuizSerializer(read_only=True)
    host = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'code', 'quiz', 'host', 'created_at']
        read_only_fields = ['code', 'host', 'created_at']


class GameCreateSerializer(serializers.ModelSerializer):
    quiz_id = serializers.PrimaryKeyRelatedField(
        queryset=Quiz.objects.all(),
        source='quiz',
        write_only=True
    )

    class Meta:
        model = Game
        fields = ['quiz_id']

    def create(self, validated_data):
        request = self.context.get('request')
        game_room = Game.objects.create(
            host=request.user,
            quiz=validated_data['quiz']
        )
        return game_room
