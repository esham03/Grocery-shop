from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from decimal import Decimal
import uuid
from products.models import Product


class Coupon(models.Model):
    DISCOUNT_TYPES = (
        ('PERCENTAGE', 'Percentage Discount'),
        ('FIXED', 'Fixed Amount Discount'),
    )

    code = models.CharField(max_length=50, unique=True)
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPES, default='FIXED')
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, help_text="Amount in ₹ or percentage")
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField(default=timezone.now)
    valid_until = models.DateTimeField(null=True, blank=True)
    usage_limit = models.PositiveIntegerField(null=True, blank=True)
    times_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.code} ({self.discount_value}{'%' if self.discount_type == 'PERCENTAGE' else '₹'})"

    def save(self, *args, **kwargs):
        self.code = self.code.upper().strip()
        super().save(*args, **kwargs)

    def is_valid(self, order_amount: Decimal) -> tuple[bool, str]:
        now = timezone.now()
        if not self.is_active:
            return False, "This coupon is currently inactive."
        if self.valid_until and now > self.valid_until:
            return False, "This coupon has expired."
        if now < self.valid_from:
            return False, "This coupon is not yet valid."
        if self.usage_limit and self.times_used >= self.usage_limit:
            return False, "This coupon has reached its maximum usage limit."
        if order_amount < self.min_order_amount:
            return False, f"Minimum order amount of ₹{self.min_order_amount} is required for this coupon."
        return True, "Coupon applied successfully."

    def calculate_discount(self, order_amount: Decimal) -> Decimal:
        if self.discount_type == 'PERCENTAGE':
            discount = (order_amount * self.discount_value) / Decimal('100.00')
            if self.max_discount_amount and discount > self.max_discount_amount:
                discount = self.max_discount_amount
        else:
            discount = min(self.discount_value, order_amount)
        return round(discount, 2)


class DeliverySlot(models.Model):
    name = models.CharField(max_length=100, help_text="e.g. Morning Express")
    time_window = models.CharField(max_length=100, help_text="e.g. 7:00 AM - 10:00 AM")
    is_active = models.BooleanField(default=True)
    display_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['display_order', 'id']

    def __str__(self):
        return f"{self.name} ({self.time_window})"


class Order(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending'),
        ('CONFIRMED', 'Confirmed'),
        ('PROCESSING', 'Processing'),
        ('OUT_FOR_DELIVERY', 'Out for Delivery'),
        ('DELIVERED', 'Delivered'),
        ('CANCELLED', 'Cancelled'),
    )

    PAYMENT_METHODS = (
        ('COD', 'Cash on Delivery'),
        ('ONLINE', 'Online Payment'),
    )

    PAYMENT_STATUS = (
        ('PENDING', 'Payment Pending'),
        ('PAID', 'Paid'),
        ('REFUNDED', 'Refunded'),
    )

    order_number = models.CharField(max_length=64, unique=True, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    status = models.CharField(max_length=25, choices=STATUS_CHOICES, default='CONFIRMED')
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    coupon_code = models.CharField(max_length=50, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, default='COD')
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS, default='PENDING')

    # Delivery slot snapshot
    delivery_slot_name = models.CharField(max_length=100)
    delivery_slot_window = models.CharField(max_length=100)

    # Shipping address snapshot (historical immutability)
    shipping_full_name = models.CharField(max_length=150)
    shipping_phone = models.CharField(max_length=20)
    shipping_address_line1 = models.CharField(max_length=255)
    shipping_address_line2 = models.CharField(max_length=255, blank=True)
    shipping_city = models.CharField(max_length=100)
    shipping_state = models.CharField(max_length=100)
    shipping_postal_code = models.CharField(max_length=20)
    delivery_instructions = models.TextField(blank=True)

    cancellation_reason = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Order #{self.order_number} by {self.user.username} (₹{self.total_amount})"

    def save(self, *args, **kwargs):
        if not self.order_number:
            date_prefix = timezone.now().strftime('%Y%m%d')
            rand_suffix = uuid.uuid4().hex[:6].upper()
            self.order_number = f"FG-{date_prefix}-{rand_suffix}"
        super().save(*args, **kwargs)

    @property
    def can_cancel(self) -> bool:
        return self.status in ('PENDING', 'CONFIRMED')


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True)

    # Immutable historical snapshots
    product_name = models.CharField(max_length=200)
    product_unit = models.CharField(max_length=50)
    product_image = models.TextField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.PositiveIntegerField()
    subtotal = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ['id']

    def __str__(self):
        return f"{self.quantity}x {self.product_name} in {self.order.order_number}"
