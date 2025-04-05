import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode

logger = logging.getLogger(__name__)


class EmailService:
    @staticmethod
    def send_confirmation_email(user):
        try:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            confirmation_url = f"{settings.FRONTEND_URL}/confirm-email/{uid}/{token}/"

            logger.info(f"Enviando e-mail de confirmação para {user.email}")
            logger.info(f"URL de confirmação: {confirmation_url}")

            logger.info(settings.DEFAULT_FROM_EMAIL)

            send_mail("Confirm Your Email", f"Click the link to confirm your email: {confirmation_url}",
                      settings.DEFAULT_FROM_EMAIL, [user.email])

            logger.info(f"E-mail de confirmação enviado com sucesso para {user.email}")

        except Exception as e:
            logger.error(f"Erro ao enviar e-mail de confirmação para {user.email}: {e}")

    @staticmethod
    def send_password_reset_email(user):
        try:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

            logger.info(f"Enviando e-mail de redefinição de senha para {user.email}")
            logger.info(f"URL de redefinição: {reset_url}")

            send_mail("Password Reset", f"Click the link to reset your password: {reset_url}",
                      settings.DEFAULT_FROM_EMAIL, [user.email])

            logger.info(f"E-mail de redefinição enviado com sucesso para {user.email}")

        except Exception as e:
            logger.error(f"Erro ao enviar e-mail de redefinição de senha para {user.email}: {e}")
