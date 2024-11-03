from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserRegistrationSerializer


class RegisterUserView(APIView):
    @staticmethod
    @swagger_auto_schema(
        request_body=UserRegistrationSerializer,
        responses={
            status.HTTP_201_CREATED: "User created successfully",
            status.HTTP_422_UNPROCESSABLE_ENTITY: "Invalid data"
        }
    )
    def post(request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)
