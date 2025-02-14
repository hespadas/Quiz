from django.urls import path

from .views import RegisterUserView, check_email

urlpatterns = [
    path('register/', RegisterUserView.as_view(), name='register'),
    path("check-email/", check_email, name="check_email"),
]
