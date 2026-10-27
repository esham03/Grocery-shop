from django.contrib import admin
from django.utils.html import format_html
from .models import Category, Product


class LowStockFilter(admin.SimpleListFilter):
    title = 'Inventory Status'
    parameter_name = 'stock_status'

    def lookups(self, request, model_admin):
        return (
            ('out', 'Out of Stock (0)'),
            ('low', 'Low Stock (<= min level)'),
            ('in', 'In Stock'),
        )

    def queryset(self, request, queryset):
        if self.value() == 'out':
            return queryset.filter(stock_quantity=0)
        if self.value() == 'low':
            return queryset.filter(stock_quantity__gt=0, stock_quantity__lte=models.F('min_stock_level'))
        if self.value() == 'in':
            return queryset.filter(stock_quantity__gt=models.F('min_stock_level'))
        return queryset


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'display_order', 'is_active', 'product_count_display')
    list_editable = ('display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}
    search_fields = ('name', 'description')

    def product_count_display(self, obj):
        return obj.products.count()
    product_count_display.short_description = 'Products'


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'price_display', 'original_price_display',
        'unit', 'stock_badge', 'rating', 'is_featured', 'is_bestseller', 'is_active'
    )
    list_editable = ('is_featured', 'is_bestseller', 'is_active')
    list_filter = ('category', 'is_active', 'is_featured', 'is_bestseller', LowStockFilter)
    search_fields = ('name', 'description', 'category__name')
    prepopulated_fields = {'slug': ('name',)}
    readonly_fields = ('created_at', 'updated_at', 'discount_percentage')

    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'category', 'description', 'image_url')
        }),
        ('Pricing & Unit', {
            'fields': ('price', 'original_price', 'unit', 'discount_percentage')
        }),
        ('Inventory', {
            'fields': ('stock_quantity', 'min_stock_level')
        }),
        ('Promotions & Status', {
            'fields': ('rating', 'review_count', 'is_featured', 'is_bestseller', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )

    def price_display(self, obj):
        return f"₹{obj.price}"
    price_display.short_description = 'Price'

    def original_price_display(self, obj):
        return f"₹{obj.original_price}" if obj.original_price else "-"
    original_price_display.short_description = 'MSRP'

    def stock_badge(self, obj):
        if obj.stock_quantity == 0:
            return format_html('<span style="color:red;font-weight:bold;">Out of stock (0)</span>')
        elif obj.stock_quantity <= obj.min_stock_level:
            return format_html('<span style="color:orange;font-weight:bold;">Low ({} units)</span>', obj.stock_quantity)
        return format_html('<span style="color:green;">{} units</span>', obj.stock_quantity)
    stock_badge.short_description = 'Stock'
