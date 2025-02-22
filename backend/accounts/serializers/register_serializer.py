from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = get_user_model()
        fields = ['username', 'email', 'password', 'password2']

    def validate(self, data):  # noqa: PLR6301
        if data['password'] != data['password2']:
            raise serializers.ValidationError({"password2": "password fields didn't match"})
        validate_password(data['password'])
        return data

    def create(self, validated_data):  # noqa: PLR6301
        validated_data.pop('password2')
        user = get_user_model().objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
        )
        user.set_password(validated_data['password'])
        user.save()
        return user
