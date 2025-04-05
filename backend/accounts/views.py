import threading

from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers.register_serializer import UserRegistrationSerializer
from accounts.utils.email import EmailService

User = get_user_model()


def get_user_from_uid(uidb64):
    uid = urlsafe_base64_decode(uidb64).decode()
    print("DEBUG - Generated UID:", uid)
    return get_object_or_404(User, pk=uid)


def send_email_async(user):
    EmailService.send_confirmation_email(user)


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
            user = serializer.save()
            response = Response({"message": "User created successfully"}, status=201)
            threading.Thread(target=send_email_async, args=(user,)).start()
            return response

        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class ConfirmEmailView(APIView):
    @staticmethod
    def get(request, uidb64, token):

        user = get_user_from_uid(uidb64)
        if not user:
            return Response({"error": _("Invalid user")}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": _("Invalid or expired token")}, status=status.HTTP_400_BAD_REQUEST)
        user.email_verified = True
        user.save()
        return Response({"message": _("Email confirmed successfully!")}, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    @staticmethod
    def post(request, uidb64, token):
        user = get_user_from_uid(uidb64)
        if not user:
            return Response({"error": _("Invalid user")}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": _("Invalid or expired token")}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        if not new_password:
            return Response({"error": _("New password is required")}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()
        return Response({"message": _("Password reset successfully")}, status=status.HTTP_200_OK)


class RequestPasswordResetView(APIView):
    @staticmethod
    def post(request):
        email = request.data.get("email")
        if not email:
            return Response({"error": _("Email is required")}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.filter(email=email).first()
        if not user:
            return Response({"error": _("User not found")}, status=status.HTTP_404_NOT_FOUND)

        EmailService.send_password_reset_email(user)
        return Response({"message": _("A link to reset your password has been sent to your email")}, status=status.HTTP_200_OK)
