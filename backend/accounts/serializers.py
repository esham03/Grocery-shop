from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Address, UserProfile


class UserSerializer(serializers.ModelSerializer):
    phone_number = serializers.CharField(source='profile.phone_number', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone_number', 'is_staff')
        read_only_fields = ('id', 'is_staff')

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        phone_number = profile_data.get('phone_number')

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if phone_number is not None:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.phone_number = phone_number
            profile.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6, style={'input_type': 'password'})
    phone_number = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone_number')

    def validate_username(self, value):
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("A user with that username already exists.")
        return value

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with that email already exists.")
        return value

    def create(self, validated_data):
        phone_number = validated_data.pop('phone_number', '')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        if phone_number:
            profile, _ = UserProfile.objects.get_or_create(user=user)
            profile.phone_number = phone_number
            profile.save()
        return user


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = (
            'id', 'full_name', 'phone_number', 'address_line1',
            'address_line2', 'city', 'state', 'postal_code',
            'delivery_instructions', 'is_default', 'created_at'
        )
        read_only_fields = ('id', 'created_at')

    def create(self, validated_data):
        user = self.context['request'].user
        # If this is user's first address, make it default
        if not Address.objects.filter(user=user).exists():
            validated_data['is_default'] = True
        return Address.objects.create(user=user, **validated_data)
