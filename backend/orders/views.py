from rest_framework import generics, viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.decorators import action
from decimal import Decimal
from .models import Order, DeliverySlot, Coupon
from .serializers import OrderSerializer, CreateOrderSerializer, DeliverySlotSerializer, CouponSerializer


class DeliverySlotListView(generics.ListAPIView):
    queryset = DeliverySlot.objects.filter(is_active=True)
    serializer_class = DeliverySlotSerializer
    permission_classes = (permissions.AllowAny,)
    pagination_class = None


class CouponValidateView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        code = request.data.get('code', '').strip().upper()
        order_amount_raw = request.data.get('order_amount', 0)

        try:
            order_amount = Decimal(str(order_amount_raw))
        except (ValueError, TypeError):
            return Response({'valid': False, 'message': 'Invalid order amount.'}, status=status.HTTP_400_BAD_REQUEST)

        coupon = Coupon.objects.filter(code=code).first()
        if not coupon:
            return Response({'valid': False, 'message': f"Coupon '{code}' does not exist."}, status=status.HTTP_404_NOT_FOUND)

        is_valid, msg = coupon.is_valid(order_amount)
        if not is_valid:
            return Response({'valid': False, 'message': msg}, status=status.HTTP_400_BAD_REQUEST)

        discount = coupon.calculate_discount(order_amount)
        return Response({
            'valid': True,
            'coupon': CouponSerializer(coupon).data,
            'discount_amount': float(discount),
            'message': msg
        }, status=status.HTTP_200_OK)


class OrderViewSet(viewsets.ModelViewSet):
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'id'

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateOrderSerializer
        return OrderSerializer

    def get_queryset(self):
        # Users can only see their own orders
        return Order.objects.filter(user=self.request.user).prefetch_related('items')

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def cancel(self, request, id=None):
        order = self.get_object()
        if not order.can_cancel:
            return Response(
                {'error': f"Order cannot be cancelled in '{order.get_status_display()}' status."},
                status=status.HTTP_400_BAD_REQUEST
            )

        reason = request.data.get('reason', 'Cancelled by customer')
        order.status = 'CANCELLED'
        order.cancellation_reason = reason
        order.save()

        # Restore inventory
        for item in order.items.all():
            if item.product:
                item.product.stock_quantity += item.quantity
                item.product.save()

        return Response(OrderSerializer(order).data)
