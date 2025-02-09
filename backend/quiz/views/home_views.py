from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


@permission_classes([IsAuthenticated])
class HomeView(APIView):
    @staticmethod
    def get(request):
        return Response()
