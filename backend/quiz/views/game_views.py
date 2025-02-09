from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from quiz.models import Game
from quiz.serializers.game_room_serializer import GameCreateSerializer, GameSerializer


class GameCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GameCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.context['request'] = request
        serializer.is_valid(raise_exception=True)
        game_room = serializer.save()
        data = GameSerializer(game_room).data
        return Response(data, status=status.HTTP_201_CREATED)


class GameRetrieveView(generics.RetrieveAPIView):
    queryset = Game.objects.all()
    serializer_class = GameSerializer
    lookup_field = 'code'
    permission_classes = [IsAuthenticated]
