from django.urls import path

from .views import ConfirmEmailView, RegisterUserView, check_email

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path("check-email/", check_email, name="check_email"),
    path('confirm-email/<uidb64>/<token>/', ConfirmEmailView.as_view(), name='confirm_email'),
]
