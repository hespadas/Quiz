import os

from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode


def generate_email_verification_link(user, request):
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    domain = request.get_host()
    return f"http://{domain}/confirm-email/{uid}/{token}/"


def send_confirmation_email(user, request):
    link = generate_email_verification_link(user, request)

    send_mail(
        'Confirme seu e-mail',
        f'Clique no link para confirmar seu e-mail: {link}',
         os.getenv("EMAIL_BACKEND"),
        [user.email],
        fail_silently=False,
    )
