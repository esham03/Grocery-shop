from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from decimal import Decimal
from django.utils import timezone
from datetime import timedelta
from products.models import Category, Product
from orders.models import DeliverySlot, Coupon
from accounts.models import Address


class Command(BaseCommand):
    help = 'Seeds database with grocery categories, products, coupons, and delivery slots.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.NOTICE("Seeding FreshGrocer database..."))

        # 1. Create Default Admin & Customer User
        admin_user, admin_created = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@freshgrocer.com',
                'first_name': 'FreshGrocer',
                'last_name': 'Admin',
                'is_staff': True,
                'is_superuser': True,
            }
        )
        if admin_created:
            admin_user.set_password('admin123')
            admin_user.save()
            self.stdout.write(self.style.SUCCESS("Created admin user: admin / admin123"))

        demo_user, demo_created = User.objects.get_or_create(
            username='demouser',
            defaults={
                'email': 'demo@example.com',
                'first_name': 'Priya',
                'last_name': 'Sharma',
            }
        )
        if demo_created:
            demo_user.set_password('demo123')
            demo_user.save()
            Address.objects.create(
                user=demo_user,
                full_name='Priya Sharma',
                phone_number='+91 98765 43210',
                address_line1='Flat 402, Green Valley Apartments',
                address_line2='Near Central Park, Indiranagar',
                city='Bengaluru',
                state='Karnataka',
                postal_code='560038',
                delivery_instructions='Ring bell twice and leave near doorstep.',
                is_default=True
            )
            self.stdout.write(self.style.SUCCESS("Created demo user: demouser / demo123 with sample address"))

        # 2. Seed Delivery Slots
        slots_data = [
            ("Morning Express", "07:00 AM - 10:00 AM", 1),
            ("Afternoon Slot", "12:00 PM - 03:00 PM", 2),
            ("Evening Prime", "06:00 PM - 09:00 PM", 3),
        ]
        for name, window, order in slots_data:
            DeliverySlot.objects.get_or_create(
                name=name,
                defaults={'time_window': window, 'display_order': order, 'is_active': True}
            )
        self.stdout.write(self.style.SUCCESS("Seeded delivery slots"))

        # 3. Seed Promotional Coupons
        coupons_data = [
            {
                'code': 'FRESH50',
                'discount_type': 'FIXED',
                'discount_value': Decimal('50.00'),
                'min_order_amount': Decimal('299.00'),
                'description': 'Flat ₹50 OFF on orders above ₹299',
            },
            {
                'code': 'WELCOME100',
                'discount_type': 'FIXED',
                'discount_value': Decimal('100.00'),
                'min_order_amount': Decimal('499.00'),
                'description': '₹100 OFF on your fresh grocery order above ₹499',
            },
            {
                'code': 'ORGANIC15',
                'discount_type': 'PERCENTAGE',
                'discount_value': Decimal('15.00'),
                'min_order_amount': Decimal('699.00'),
                'max_discount_amount': Decimal('150.00'),
                'description': '15% OFF (up to ₹150) on healthy organic essentials above ₹699',
            },
        ]
        now = timezone.now()
        for c in coupons_data:
            Coupon.objects.update_or_create(
                code=c['code'],
                defaults={
                    'discount_type': c['discount_type'],
                    'discount_value': c['discount_value'],
                    'min_order_amount': c['min_order_amount'],
                    'max_discount_amount': c.get('max_discount_amount'),
                    'description': c['description'],
                    'valid_from': now,
                    'valid_until': now + timedelta(days=365),
                    'is_active': True,
                }
            )
        self.stdout.write(self.style.SUCCESS("Seeded coupons (FRESH50, WELCOME100, ORGANIC15)"))

        # 4. Seed Categories
        categories_data = [
            {
                'name': 'Fruits',
                'slug': 'fruits',
                'description': 'Fresh, juicy, and naturally ripened seasonal fruits.',
                'image': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Apple',
                'display_order': 1,
            },
            {
                'name': 'Vegetables',
                'slug': 'vegetables',
                'description': 'Crisp farm-fresh vegetables delivered straight from growers.',
                'image': 'https://images.unsplash.com/photo-1597362925123-77861d3fbac7?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Carrot',
                'display_order': 2,
            },
            {
                'name': 'Dairy & Eggs',
                'slug': 'dairy-eggs',
                'description': 'Pure milk, yogurt, butter, paneer, and farm-fresh organic eggs.',
                'image': 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Milk',
                'display_order': 3,
            },
            {
                'name': 'Bakery',
                'slug': 'bakery',
                'description': 'Artisan breads, buns, croissants, and morning bakes.',
                'image': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Croissant',
                'display_order': 4,
            },
            {
                'name': 'Beverages',
                'slug': 'beverages',
                'description': 'Cold pressed juices, organic teas, artisanal coffees, and coconut water.',
                'image': 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Coffee',
                'display_order': 5,
            },
            {
                'name': 'Snacks',
                'slug': 'snacks',
                'description': 'Roasted nuts, healthy granola bars, and wholesome snack cravings.',
                'image': 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Cookie',
                'display_order': 6,
            },
            {
                'name': 'Grains',
                'slug': 'grains',
                'description': 'Organic basmati rice, whole wheat flour, lentils, and cold-pressed oils.',
                'image': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Wheat',
                'display_order': 7,
            },
            {
                'name': 'Household Essentials',
                'slug': 'household-essentials',
                'description': 'Eco-friendly cleaners, tissues, dishwashing liquids, and daily hygiene.',
                'image': 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=80',
                'icon_name': 'Sparkles',
                'display_order': 8,
            },
        ]

        category_objs = {}
        for cat_info in categories_data:
            cat_obj, _ = Category.objects.update_or_create(
                slug=cat_info['slug'],
                defaults=cat_info
            )
            category_objs[cat_info['slug']] = cat_obj
        self.stdout.write(self.style.SUCCESS("Seeded 8 categories"))

        # 5. Seed Products (Including Original 4: Apples, Bananas, Carrots, Tomatoes)
        # Note: Original dollar values mapped directly into realistic INR pricing:
        # Apples ($3.99 -> ₹149.00 / 1 kg)
        # Bananas ($1.49 -> ₹49.00 / 1 kg)
        # Carrots ($2.29 -> ₹69.00 / 1 kg)
        # Tomatoes ($2.99 -> ₹59.00 / 1 kg)
        products_data = [
            # Original 4 Products
            {
                'name': 'Fresh Apples',
                'slug': 'fresh-apples',
                'category': category_objs['fruits'],
                'description': 'Crisp, sweet, and juicy handpicked Royal Gala apples. Packed with dietary fiber and natural antioxidants.',
                'price': Decimal('149.00'),
                'original_price': Decimal('189.00'),
                'unit': '1 kg',
                'stock_quantity': 100,
                'min_stock_level': 15,
                'image_url': 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.8'),
                'review_count': 124,
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Bananas',
                'slug': 'bananas',
                'category': category_objs['fruits'],
                'description': 'Naturally ripened Robusta bananas rich in potassium and quick natural energy. Perfect for breakfast or smoothies.',
                'price': Decimal('49.00'),
                'original_price': Decimal('60.00'),
                'unit': '1 kg (approx 6-8 pcs)',
                'stock_quantity': 80,
                'min_stock_level': 20,
                'image_url': 'https://images.unsplash.com/photo-1574226516831-e1dff420e13c?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.6'),
                'review_count': 95,
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Carrots',
                'slug': 'carrots',
                'category': category_objs['vegetables'],
                'description': 'Tender, sweet orange carrots harvested fresh from local farms. Great for salads, cooking, or fresh juicing.',
                'price': Decimal('69.00'),
                'original_price': Decimal('85.00'),
                'unit': '1 kg',
                'stock_quantity': 65,
                'min_stock_level': 15,
                'image_url': 'https://images.unsplash.com/photo-1605456799124-6641a5fcf0f4?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.7'),
                'review_count': 82,
                'is_featured': False,
                'is_bestseller': True,
            },
            {
                'name': 'Tomatoes',
                'slug': 'tomatoes',
                'category': category_objs['vegetables'],
                'description': 'Plump, ripe hybrid red tomatoes bursting with rich savory flavor and vitamin C.',
                'price': Decimal('59.00'),
                'original_price': Decimal('75.00'),
                'unit': '1 kg',
                'stock_quantity': 90,
                'min_stock_level': 20,
                'image_url': 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.5'),
                'review_count': 110,
                'is_featured': True,
                'is_bestseller': True,
            },
            # Additional Catalog Products
            {
                'name': 'Alphonso Mangoes',
                'slug': 'alphonso-mangoes',
                'category': category_objs['fruits'],
                'description': 'Naturally sweetened Ratnagiri Alphonso mangoes with exquisite aroma and golden pulpy sweetness.',
                'price': Decimal('499.00'),
                'original_price': Decimal('599.00'),
                'unit': '1 box (6 pcs)',
                'stock_quantity': 40,
                'min_stock_level': 10,
                'image_url': 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.9'),
                'review_count': 210,
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Organic Spinach (Palak)',
                'slug': 'organic-spinach',
                'category': category_objs['vegetables'],
                'description': 'Hydroponically grown pesticide-free tender green spinach leaves washed and ready to cook.',
                'price': Decimal('35.00'),
                'original_price': Decimal('45.00'),
                'unit': '250 g bunch',
                'stock_quantity': 50,
                'min_stock_level': 12,
                'image_url': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.7'),
                'review_count': 64,
                'is_featured': False,
                'is_bestseller': False,
            },
            {
                'name': 'Fresh Farm Whole Milk',
                'slug': 'fresh-farm-whole-milk',
                'category': category_objs['dairy-eggs'],
                'description': 'Homogenized and pasteurized pure whole cow milk, delivered fresh daily within hours of milking.',
                'price': Decimal('68.00'),
                'original_price': Decimal('75.00'),
                'unit': '1 Litre pouch',
                'stock_quantity': 120,
                'min_stock_level': 30,
                'image_url': 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.8'),
                'review_count': 185,
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Organic Free-Range Brown Eggs',
                'slug': 'organic-free-range-brown-eggs',
                'category': category_objs['dairy-eggs'],
                'description': 'Nutrient-rich free-range brown eggs from grain-fed hens. High in natural protein and omega-3.',
                'price': Decimal('115.00'),
                'original_price': Decimal('135.00'),
                'unit': '6 eggs pack',
                'stock_quantity': 75,
                'min_stock_level': 15,
                'image_url': 'https://images.unsplash.com/photo-1516448620398-c5f44bf9f441?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.9'),
                'review_count': 142,
                'is_featured': False,
                'is_bestseller': True,
            },
            {
                'name': 'Artisan Whole Wheat Sourdough Bread',
                'slug': 'artisan-whole-wheat-sourdough',
                'category': category_objs['bakery'],
                'description': 'Slow-fermented artisan sourdough crafted with 100% whole stoneground wheat flour and no preservatives.',
                'price': Decimal('120.00'),
                'original_price': Decimal('145.00'),
                'unit': '400 g loaf',
                'stock_quantity': 35,
                'min_stock_level': 8,
                'image_url': 'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.6'),
                'review_count': 56,
                'is_featured': True,
                'is_bestseller': False,
            },
            {
                'name': 'Cold Pressed Orange Juice',
                'slug': 'cold-pressed-orange-juice',
                'category': category_objs['beverages'],
                'description': '100% raw cold-pressed Valencia orange juice without added sugar, water, or artificial preservatives.',
                'price': Decimal('99.00'),
                'original_price': Decimal('120.00'),
                'unit': '300 ml bottle',
                'stock_quantity': 45,
                'min_stock_level': 10,
                'image_url': 'https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.7'),
                'review_count': 78,
                'is_featured': True,
                'is_bestseller': False,
            },
            {
                'name': 'Roasted California Almonds',
                'slug': 'roasted-california-almonds',
                'category': category_objs['snacks'],
                'description': 'Lightly salted and slow-roasted premium California almonds. A heart-healthy wholesome crunch.',
                'price': Decimal('289.00'),
                'original_price': Decimal('349.00'),
                'unit': '250 g pouch',
                'stock_quantity': 60,
                'min_stock_level': 15,
                'image_url': 'https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.8'),
                'review_count': 130,
                'is_featured': False,
                'is_bestseller': True,
            },
            {
                'name': 'Aged Royal Basmati Rice',
                'slug': 'aged-royal-basmati-rice',
                'category': category_objs['grains'],
                'description': '2-year aged long-grain fragrant royal basmati rice for royal biryanis and aromatic daily meals.',
                'price': Decimal('245.00'),
                'original_price': Decimal('290.00'),
                'unit': '1 kg pack',
                'stock_quantity': 80,
                'min_stock_level': 20,
                'image_url': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.9'),
                'review_count': 175,
                'is_featured': True,
                'is_bestseller': True,
            },
            {
                'name': 'Eco Plant-Based Dishwashing Gel',
                'slug': 'eco-plant-based-dishwashing-gel',
                'category': category_objs['household-essentials'],
                'description': 'Biodegradable, hypoallergenic dishwashing gel infused with natural lime and neem extracts. Gentle on hands.',
                'price': Decimal('165.00'),
                'original_price': Decimal('199.00'),
                'unit': '500 ml bottle',
                'stock_quantity': 50,
                'min_stock_level': 10,
                'image_url': 'https://images.unsplash.com/photo-1585421514738-01798e348b17?auto=format&fit=crop&w=800&q=80',
                'rating': Decimal('4.5'),
                'review_count': 42,
                'is_featured': False,
                'is_bestseller': False,
            },
        ]

        for p_info in products_data:
            Product.objects.update_or_create(
                slug=p_info['slug'],
                defaults=p_info
            )
        self.stdout.write(self.style.SUCCESS(f"Seeded {len(products_data)} products including original Apples, Bananas, Carrots, Tomatoes"))

        self.stdout.write(self.style.SUCCESS("Database seeding completed successfully!"))
