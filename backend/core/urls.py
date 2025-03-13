from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

schema_view = get_schema_view(
    openapi.Info(
        title="API Documentation",
        default_version='v1',
        description="API documentation for the project",
    ),
    public=True,
    permission_classes=[permissions.AllowAny,],
)


urlpatterns = [
    path("auth/", include("tokens.urls")),
    path("accounts/", include("accounts.urls")),
    path('admin/', admin.site.urls),
    path("", include("quiz.urls")),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
