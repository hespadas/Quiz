from rest_framework import generics, status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from quiz.serializers.game_room_serializer import GameSerializer
from quiz.serializers.lobby_serializer import LobbyCreateSerializer


@permission_classes([IsAuthenticated])
class LobbyCreateView(generics.CreateAPIView):
    serializer_class = LobbyCreateSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.context['request'] = request
        serializer.is_valid(raise_exception=True)
        game_room = serializer.save()
        data = GameSerializer(game_room).data
        return Response(data, status=status.HTTP_201_CREATED)
