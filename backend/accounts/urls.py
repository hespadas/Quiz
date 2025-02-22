from django.urls import path

from .views import ConfirmEmailView, RegisterUserView, RequestPasswordResetView, ResetPasswordView

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path('confirm-email/<uidb64>/<token>/', ConfirmEmailView.as_view(), name='confirm_email'),
    path("request-password-reset/", RequestPasswordResetView.as_view(), name="request_password_reset"),
    path("reset-password/<uidb64>/<token>/", ResetPasswordView.as_view(), name="reset_password"),
]
