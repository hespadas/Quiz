from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def send_confirmation_email(user):
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    confirmation_url = f"{settings.FRONTEND_URL}/confirm-email/{uid}/{token}"
    send_mail(
        "Confirm your email",
        f"Click the link below to confirm your email:\n{confirmation_url}",
        "noreply@seuprojeto.com",
        [user.email],
        fail_silently=False,
    )
