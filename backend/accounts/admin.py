from django.contrib import admin
from .models import Address, UserProfile


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'phone_number', 'city', 'state', 'postal_code', 'is_default')
    list_filter = ('is_default', 'city', 'state')
    search_fields = ('full_name', 'phone_number', 'address_line1', 'city', 'postal_code', 'user__username')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'phone_number', 'created_at')
    search_fields = ('user__username', 'user__email', 'phone_number')
