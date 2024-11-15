from logging import getLogger

from rest_framework import status
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .managers import CookieManager
from .services import TokenBlacklistService

logger = getLogger(__name__)


class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        try:
            response = super().post(request, *args, **kwargs)
            if response.status_code == status.HTTP_200_OK:
                access_token = response.data.pop("access", None)
                refresh_token = response.data.pop("refresh", None)
                decoded_access_token = AccessToken(access_token)
                access_token_exp = decoded_access_token.get("exp")
                CookieManager.set_access_token_cookie(response, access_token)
                CookieManager.set_refresh_token_cookie(response, refresh_token)
                response.data["access_token_exp"] = access_token_exp
            return response
        except Exception as e:
            logger.error(f"Login Error: {e}")
            return Response(
                {"detail": "No active account found with the given credentials"},
                status=status.HTTP_401_UNAUTHORIZED
            )


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token") or request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "Refresh token not found"},
                            status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data={"refresh": refresh_token})
        try:
            serializer.is_valid(raise_exception=True)
        except TokenError as e:
            error_message = str(e)
            if "blacklisted" in error_message:
                return Response({"detail": "Token is blacklisted"}, status=status.HTTP_400_BAD_REQUEST)
            else:
                return Response({"detail": error_message}, status=status.HTTP_400_BAD_REQUEST)

        access_token = serializer.validated_data["access"]
        new_refresh_token = serializer.validated_data.get("refresh")
        decoded_access_token = AccessToken(access_token)
        access_token_exp = decoded_access_token["exp"]
        response = Response(status=status.HTTP_200_OK)
        CookieManager.set_access_token_cookie(response, access_token)
        if new_refresh_token:
            CookieManager.set_refresh_token_cookie(response, new_refresh_token)
        response.data = {"access_token_exp": access_token_exp}
        return response


@permission_classes([IsAuthenticated])
class LogoutView(APIView):
    @staticmethod
    def post(request):
        try:
            refresh_token = request.COOKIES.get("refresh_token")
            if refresh_token:
                try:
                    TokenBlacklistService.blacklist_token(refresh_token)
                except Exception:
                    logger.info("Token at blacklist, continuing.")

            response = Response(status=status.HTTP_205_RESET_CONTENT)
            CookieManager.delete_token_cookies(response)
            return response
        except Exception as e:
            logger.error(f"Logout Error: {e}")
            return Response({"detail": "Logout Error"},
                            status=status.HTTP_400_BAD_REQUEST)


@permission_classes([IsAuthenticated])
class IsAuthConfirmed(APIView):
    @staticmethod
    def get(request):
        return Response({"detail": "Authenticated"}, status=status.HTTP_200_OK)
