from django.urls import path
from .views import CartView, CartItemAddView, CartItemDetailView, CartClearView, CartMergeGuestView

urlpatterns = [
    path('cart/', CartView.as_view(), name='cart_detail'),
    path('cart/items/', CartItemAddView.as_view(), name='cart_item_add'),
    path('cart/items/<int:product_id>/', CartItemDetailView.as_view(), name='cart_item_detail'),
    path('cart/clear/', CartClearView.as_view(), name='cart_clear'),
    path('cart/merge/', CartMergeGuestView.as_view(), name='cart_merge'),
]
