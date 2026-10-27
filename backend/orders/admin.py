from django.contrib import admin
from django.utils.html import format_html
from .models import Order, OrderItem, Coupon, DeliverySlot


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('product_name', 'product_unit', 'unit_price', 'quantity', 'subtotal')
    can_delete = False

    def has_add_permission(self, request, obj=None):
        return False


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = (
        'order_number', 'user_email', 'status_badge', 'total_display',
        'payment_method', 'delivery_slot_display', 'created_at'
    )
    list_filter = ('status', 'payment_method', 'payment_status', 'created_at')
    search_fields = ('order_number', 'user__username', 'user__email', 'shipping_phone', 'shipping_full_name')
    readonly_fields = (
        'order_number', 'user', 'subtotal', 'delivery_fee', 'discount_amount',
        'total_amount', 'coupon_code', 'delivery_slot_name', 'delivery_slot_window',
        'shipping_full_name', 'shipping_phone', 'shipping_address_line1',
        'shipping_address_line2', 'shipping_city', 'shipping_state',
        'shipping_postal_code', 'delivery_instructions', 'created_at', 'updated_at'
    )
    inlines = [OrderItemInline]

    fieldsets = (
        ('Order Overview', {
            'fields': ('order_number', 'user', 'status', 'cancellation_reason')
        }),
        ('Financial Summary', {
            'fields': ('subtotal', 'delivery_fee', 'discount_amount', 'total_amount', 'coupon_code', 'payment_method', 'payment_status')
        }),
        ('Delivery Slot', {
            'fields': ('delivery_slot_name', 'delivery_slot_window')
        }),
        ('Customer Shipping Details', {
            'fields': (
                'shipping_full_name', 'shipping_phone', 'shipping_address_line1',
                'shipping_address_line2', 'shipping_city', 'shipping_state',
                'shipping_postal_code', 'delivery_instructions'
            )
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def user_email(self, obj):
        return obj.user.email or obj.user.username
    user_email.short_description = 'Customer'

    def total_display(self, obj):
        return f"₹{obj.total_amount}"
    total_display.short_description = 'Total'

    def delivery_slot_display(self, obj):
        return f"{obj.delivery_slot_name} ({obj.delivery_slot_window})"
    delivery_slot_display.short_description = 'Slot'

    def status_badge(self, obj):
        colors = {
            'PENDING': '#f59e0b',
            'CONFIRMED': '#3b82f6',
            'PROCESSING': '#8b5cf6',
            'OUT_FOR_DELIVERY': '#06b6d4',
            'DELIVERED': '#10b981',
            'CANCELLED': '#ef4444',
        }
        color = colors.get(obj.status, '#6b7280')
        return format_html(
            '<span style="background-color:{}; color:white; padding:3px 8px; border-radius:12px; font-size:11px; font-weight:600;">{}</span>',
            color, obj.get_status_display()
        )
    status_badge.short_description = 'Status'


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ('code', 'discount_display', 'min_order_amount', 'times_used', 'usage_limit', 'is_active', 'valid_until')
    list_filter = ('discount_type', 'is_active')
    search_fields = ('code', 'description')

    def discount_display(self, obj):
        if obj.discount_type == 'PERCENTAGE':
            return f"{obj.discount_value}% (max ₹{obj.max_discount_amount or 'Unlimited'})"
        return f"₹{obj.discount_value} FLAT"
    discount_display.short_description = 'Discount'


@admin.register(DeliverySlot)
class DeliverySlotAdmin(admin.ModelAdmin):
    list_display = ('name', 'time_window', 'display_order', 'is_active')
    list_editable = ('display_order', 'is_active')
