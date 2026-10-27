from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DeliverySlotListView, CouponValidateView, OrderViewSet

router = DefaultRouter()
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('delivery-slots/', DeliverySlotListView.as_view(), name='delivery_slot_list'),
    path('coupons/validate/', CouponValidateView.as_view(), name='coupon_validate'),
    path('', include(router.urls)),
]
