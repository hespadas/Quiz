from rest_framework import serializers

from ..models.game import Game
from ..models.quiz import Quiz


class LobbyCreateSerializer(serializers.ModelSerializer):
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
