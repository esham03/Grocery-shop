from rest_framework import serializers
from django.db import transaction
from django.conf import settings
from decimal import Decimal
from .models import Order, OrderItem, Coupon, DeliverySlot
from accounts.models import Address
from cart.models import Cart
from products.models import Product


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = ('id', 'code', 'discount_type', 'discount_value', 'min_order_amount', 'max_discount_amount', 'description')


class DeliverySlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeliverySlot
        fields = ('id', 'name', 'time_window', 'is_active')


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ('id', 'product_name', 'product_unit', 'product_image', 'unit_price', 'quantity', 'subtotal')


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    can_cancel = serializers.BooleanField(read_only=True)

    class Meta:
        model = Order
        fields = (
            'id', 'order_number', 'status', 'subtotal', 'delivery_fee',
            'discount_amount', 'total_amount', 'coupon_code', 'payment_method',
            'payment_status', 'delivery_slot_name', 'delivery_slot_window',
            'shipping_full_name', 'shipping_phone', 'shipping_address_line1',
            'shipping_address_line2', 'shipping_city', 'shipping_state',
            'shipping_postal_code', 'delivery_instructions', 'cancellation_reason',
            'can_cancel', 'created_at', 'items'
        )
        read_only_fields = ('id', 'order_number', 'status', 'created_at', 'items', 'can_cancel')


class CreateOrderSerializer(serializers.Serializer):
    address_id = serializers.IntegerField()
    delivery_slot_id = serializers.IntegerField()
    payment_method = serializers.ChoiceField(choices=['COD', 'ONLINE'], default='COD')
    coupon_code = serializers.CharField(required=False, allow_blank=True)
    delivery_instructions = serializers.CharField(required=False, allow_blank=True)

    def validate_address_id(self, value):
        user = self.context['request'].user
        address = Address.objects.filter(id=value, user=user).first()
        if not address:
            raise serializers.ValidationError("Selected address does not exist or does not belong to you.")
        return address

    def validate_delivery_slot_id(self, value):
        slot = DeliverySlot.objects.filter(id=value, is_active=True).first()
        if not slot:
            raise serializers.ValidationError("Selected delivery slot is currently unavailable.")
        return slot

    def create(self, validated_data):
        user = self.context['request'].user
        address = validated_data['address_id']
        delivery_slot = validated_data['delivery_slot_id']
        payment_method = validated_data.get('payment_method', 'COD')
        coupon_code = validated_data.get('coupon_code', '').strip().upper()
        delivery_instructions = validated_data.get('delivery_instructions', '') or address.delivery_instructions

        with transaction.atomic():
            cart = Cart.objects.filter(user=user).prefetch_related('items__product').first()
            if not cart or not cart.items.exists():
                raise serializers.ValidationError({'error': "Your cart is empty. Please add items before placing an order."})

            cart_items = list(cart.items.select_related('product').all())

            # Validate stock availability with row locking
            product_ids = [item.product_id for item in cart_items]
            locked_products = {
                p.id: p for p in Product.objects.select_for_update().filter(id__in=product_ids)
            }

            subtotal = Decimal('0.00')
            for item in cart_items:
                product = locked_products.get(item.product_id)
                if not product or not product.is_active:
                    raise serializers.ValidationError({'error': f"Product '{item.product.name}' is no longer available."})
                if product.stock_quantity < item.quantity:
                    raise serializers.ValidationError({
                        'error': f"Insufficient stock for '{product.name}'. Only {product.stock_quantity} remaining."
                    })
                subtotal += (product.price * item.quantity)

            # Delivery Fee Calculation
            free_threshold = Decimal(str(getattr(settings, 'FRESHGROCER_FREE_DELIVERY_THRESHOLD', 499.00)))
            standard_fee = Decimal(str(getattr(settings, 'FRESHGROCER_STANDARD_DELIVERY_FEE', 40.00)))
            delivery_fee = Decimal('0.00') if subtotal >= free_threshold else standard_fee

            # Coupon Discount Calculation
            discount_amount = Decimal('0.00')
            applied_coupon = None
            if coupon_code:
                coupon = Coupon.objects.filter(code=coupon_code).first()
                if coupon:
                    is_valid, msg = coupon.is_valid(subtotal)
                    if not is_valid:
                        raise serializers.ValidationError({'coupon_code': msg})
                    discount_amount = coupon.calculate_discount(subtotal)
                    coupon.times_used += 1
                    coupon.save()
                    applied_coupon = coupon
                else:
                    raise serializers.ValidationError({'coupon_code': "Invalid coupon code."})

            total_amount = max(Decimal('0.00'), subtotal + delivery_fee - discount_amount)

            # Create Order
            order = Order.objects.create(
                user=user,
                status='CONFIRMED',
                subtotal=subtotal,
                delivery_fee=delivery_fee,
                discount_amount=discount_amount,
                total_amount=total_amount,
                coupon_code=applied_coupon.code if applied_coupon else '',
                payment_method=payment_method,
                payment_status='PENDING',
                delivery_slot_name=delivery_slot.name,
                delivery_slot_window=delivery_slot.time_window,
                shipping_full_name=address.full_name,
                shipping_phone=address.phone_number,
                shipping_address_line1=address.address_line1,
                shipping_address_line2=address.address_line2,
                shipping_city=address.city,
                shipping_state=address.state,
                shipping_postal_code=address.postal_code,
                delivery_instructions=delivery_instructions,
            )

            # Create Order Items and Decrement Inventory
            for item in cart_items:
                product = locked_products[item.product_id]
                item_subtotal = product.price * item.quantity

                OrderItem.objects.create(
                    order=order,
                    product=product,
                    product_name=product.name,
                    product_unit=product.unit,
                    product_image=product.image_url,
                    unit_price=product.price,
                    quantity=item.quantity,
                    subtotal=item_subtotal,
                )

                product.stock_quantity -= item.quantity
                product.save()

            # Clear user's cart
            cart.items.all().delete()

            return order
