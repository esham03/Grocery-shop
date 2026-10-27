from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Cart, CartItem
from .serializers import CartSerializer
from products.models import Product


class CartView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        cart, _ = Cart.objects.get_or_create(user=request.user)
        return Response(CartSerializer(cart).data)


class CartItemAddView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        product_id = request.data.get('product_id')
        quantity = int(request.data.get('quantity', 1))

        if not product_id or quantity <= 0:
            return Response({'error': 'Valid product_id and positive quantity are required.'}, status=status.HTTP_400_BAD_REQUEST)

        product = get_object_or_404(Product, id=product_id, is_active=True)

        if product.stock_quantity < quantity:
            return Response(
                {'error': f"Only {product.stock_quantity} units available for {product.name}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        cart, _ = Cart.objects.get_or_create(user=request.user)
        item, created = CartItem.objects.get_or_create(cart=cart, product=product)

        if not created:
            new_quantity = item.quantity + quantity
            if product.stock_quantity < new_quantity:
                return Response(
                    {'error': f"Cannot add {quantity} more. Current stock limit is {product.stock_quantity}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            item.quantity = new_quantity
        else:
            item.quantity = quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartItemDetailView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def patch(self, request, product_id):
        quantity = int(request.data.get('quantity', 1))
        cart = get_object_or_404(Cart, user=request.user)
        product = get_object_or_404(Product, id=product_id)

        if quantity <= 0:
            CartItem.objects.filter(cart=cart, product=product).delete()
            return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

        if product.stock_quantity < quantity:
            return Response(
                {'error': f"Only {product.stock_quantity} units available for {product.name}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        item = get_object_or_404(CartItem, cart=cart, product=product)
        item.quantity = quantity
        item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)

    def delete(self, request, product_id):
        cart = get_object_or_404(Cart, user=request.user)
        CartItem.objects.filter(cart=cart, product_id=product_id).delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartClearView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        cart = get_object_or_404(Cart, user=request.user)
        cart.items.all().delete()
        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)


class CartMergeGuestView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        items = request.data.get('items', [])
        cart, _ = Cart.objects.get_or_create(user=request.user)

        for item_data in items:
            product_id = item_data.get('product_id')
            quantity = int(item_data.get('quantity', 1))
            if not product_id or quantity <= 0:
                continue

            product = Product.objects.filter(id=product_id, is_active=True).first()
            if not product or product.stock_quantity <= 0:
                continue

            item, created = CartItem.objects.get_or_create(cart=cart, product=product)
            capped_qty = min(product.stock_quantity, (item.quantity + quantity) if not created else quantity)
            item.quantity = capped_qty
            item.save()

        return Response(CartSerializer(cart).data, status=status.HTTP_200_OK)
