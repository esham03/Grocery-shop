from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = ('id', 'name', 'slug', 'description', 'image', 'icon_name', 'display_order', 'product_count')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    is_in_stock = serializers.BooleanField(read_only=True)
    discount_percentage = serializers.IntegerField(read_only=True)
    is_low_stock = serializers.BooleanField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'name', 'slug', 'category', 'category_name',
            'description', 'price', 'original_price', 'unit',
            'stock_quantity', 'min_stock_level', 'image_url',
            'rating', 'review_count', 'is_featured', 'is_bestseller',
            'is_active', 'is_in_stock', 'discount_percentage', 'is_low_stock',
            'created_at', 'updated_at'
        )
