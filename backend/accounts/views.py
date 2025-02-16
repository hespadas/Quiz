from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404, render
from django.utils.http import urlsafe_base64_decode
from django.utils.translation import gettext_lazy as _
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.serializers.register_serializer import UserRegistrationSerializer
from accounts.utils.email import send_confirmation_email

User = get_user_model()


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
            send_confirmation_email(user)
            return Response(
                {"message": _("User created successfully, confirm your email")},
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_422_UNPROCESSABLE_ENTITY)


class ConfirmEmailView(APIView):
    @staticmethod
    def get(request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_object_or_404(User, pk=uid)

            if default_token_generator.check_token(user, token):
                user.is_active = True
                user.save()
                return Response({"message": _("Email confirmed successfully")}, status=status.HTTP_200_OK)
            return Response({"error": _("Invalid or expired token")}, status=status.HTTP_400_BAD_REQUEST)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"error": _("Error confirming email")}, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordView(APIView):
    @staticmethod
    def post(request, uidb64, token):
        try:
            uid = urlsafe_base64_decode(uidb64).decode()
            user = get_object_or_404(User, pk=uid)
        except (ValueError, TypeError):
            return Response({"error": _("Invalid user")}, status=status.HTTP_400_BAD_REQUEST)

        if not default_token_generator.check_token(user, token):
            return Response({"error": _("Invalid or expired token")}, status=status.HTTP_400_BAD_REQUEST)

        new_password = request.data.get("password")
        if not new_password:
            return Response({"error": _("New password is required")}, status=status.HTTP_400_BAD_REQUEST)

        user.password = make_password(new_password)
        user.save()

        return Response({"message": _("Password reset successfully")}, status=status.HTTP_200_OK)


def check_email(request):
    return render(request, "check_email.html")
