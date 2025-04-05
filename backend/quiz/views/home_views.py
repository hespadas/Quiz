from rest_framework.response import Response
from rest_framework.views import APIView


class HomeView(APIView):
    @staticmethod
    def get(request):
        return Response()
