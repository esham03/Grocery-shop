from django.contrib import admin
from .models import Cart, CartItem


class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0


@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'total_items', 'subtotal_display', 'updated_at')
    inlines = [CartItemInline]

    def subtotal_display(self, obj):
        return f"₹{obj.subtotal}"
    subtotal_display.short_description = 'Subtotal'
