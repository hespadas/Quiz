from django.urls import path

from . import views
from .views import CustomTokenObtainPairView, CustomTokenRefreshView

app_name = "tokens"

urlpatterns = [
    path("token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", CustomTokenRefreshView.as_view(), name="token_refresh"),
    path("logout/", views.LogoutView.as_view(), name="logout"),
    path("check/", views.IsAuthConfirmed.as_view(), name="authcheck"),
]
