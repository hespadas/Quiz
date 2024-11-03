import logging

from rest_framework_simplejwt.tokens import RefreshToken

logger = logging.getLogger(__name__)


class TokenBlacklistService:
    @staticmethod
    def blacklist_token(refresh_token):
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
        except Exception as e:
            logger.error(f"Blacklist Error: {e}")
            raise e
