from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.TextField(help_text="Category banner or representative image URL")
    icon_name = models.CharField(max_length=50, blank=True, help_text="Lucide icon name identifier")
    display_order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['display_order', 'name']
        verbose_name_plural = 'Categories'

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)


class Product(models.Model):
    name = models.CharField(max_length=200)
    slug = models.SlugField(max_length=220, unique=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2, help_text="Current selling price in INR")
    original_price = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True,
        help_text="Original MSRP in INR for discount calculations"
    )
    unit = models.CharField(max_length=50, help_text="e.g., 1 kg, 500 g, 6 pcs, 1 L, 250 g")
    stock_quantity = models.PositiveIntegerField(default=50)
    min_stock_level = models.PositiveIntegerField(default=10, help_text="Threshold to alert low inventory")
    image_url = models.TextField(help_text="Product image URL")
    rating = models.DecimalField(max_digits=3, decimal_places=2, default=4.5)
    review_count = models.PositiveIntegerField(default=15)
    is_featured = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_featured', '-is_bestseller', '-created_at']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['category', 'is_active']),
            models.Index(fields=['price']),
        ]

    def __str__(self):
        return f"{self.name} ({self.unit}) - ₹{self.price}"

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.name)
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    @property
    def is_in_stock(self) -> bool:
        return self.stock_quantity > 0

    @property
    def discount_percentage(self) -> int:
        if self.original_price and self.original_price > self.price:
            discount = ((self.original_price - self.price) / self.original_price) * 100
            return round(discount)
        return 0

    @property
    def is_low_stock(self) -> bool:
        return 0 < self.stock_quantity <= self.min_stock_level
