import pytest
from decimal import Decimal
from django.contrib.auth.models import User
from rest_framework.test import APIClient
from products.models import Category, Product
from cart.models import Cart, CartItem
from orders.models import DeliverySlot, Coupon, Order
from accounts.models import Address


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def test_user(db):
    user = User.objects.create_user(
        username='testshopper',
        email='shopper@example.com',
        password='Password123!',
        first_name='Rahul',
        last_name='Verma'
    )
    return user


@pytest.fixture
def auth_client(api_client, test_user):
    api_client.force_authenticate(user=test_user)
    return api_client


@pytest.fixture
def sample_catalog(db):
    category = Category.objects.create(
        name='Organic Fruits',
        slug='organic-fruits',
        description='Delicious fruits',
        image='https://example.com/fruits.jpg'
    )
    apple = Product.objects.create(
        name='Fresh Apples',
        slug='fresh-apples',
        category=category,
        description='Crisp royal gala apples',
        price=Decimal('149.00'),
        original_price=Decimal('189.00'),
        unit='1 kg',
        stock_quantity=50,
        min_stock_level=10,
        image_url='https://example.com/apple.jpg',
        rating=Decimal('4.8'),
        is_featured=True,
    )
    banana = Product.objects.create(
        name='Bananas',
        slug='bananas',
        category=category,
        description='Fresh ripe bananas',
        price=Decimal('49.00'),
        original_price=Decimal('60.00'),
        unit='1 kg',
        stock_quantity=3,
        min_stock_level=5,
        image_url='https://example.com/banana.jpg',
        rating=Decimal('4.5'),
    )
    return {'category': category, 'apple': apple, 'banana': banana}


@pytest.fixture
def sample_checkout_data(db, test_user):
    address = Address.objects.create(
        user=test_user,
        full_name='Rahul Verma',
        phone_number='+91 9988776655',
        address_line1='101 Sunrise Villa',
        city='Mumbai',
        state='Maharashtra',
        postal_code='400001',
        is_default=True
    )
    slot = DeliverySlot.objects.create(
        name='Morning Slot',
        time_window='7:00 AM - 10:00 AM',
        is_active=True
    )
    coupon = Coupon.objects.create(
        code='TEST50',
        discount_type='FIXED',
        discount_value=Decimal('50.00'),
        min_order_amount=Decimal('100.00'),
        is_active=True
    )
    return {'address': address, 'slot': slot, 'coupon': coupon}


@pytest.mark.django_db
class TestAuthentication:
    def test_user_registration(self, api_client):
        response = api_client.post('/api/v1/auth/register/', {
            'username': 'newuser1',
            'email': 'newuser1@example.com',
            'password': 'StrongPassword123!',
            'first_name': 'Anita',
            'last_name': 'Desai',
            'phone_number': '9876543210'
        }, format='json')

        assert response.status_code == 201
        assert response.data['user']['username'] == 'newuser1'
        assert 'tokens' in response.data
        assert 'access' in response.data['tokens']
        assert 'refresh' in response.data['tokens']

    def test_user_login(self, api_client, test_user):
        response = api_client.post('/api/v1/auth/login/', {
            'username': 'testshopper',
            'password': 'Password123!'
        }, format='json')

        assert response.status_code == 200
        assert 'tokens' in response.data
        assert response.data['user']['email'] == 'shopper@example.com'


@pytest.mark.django_db
class TestProductCatalog:
    def test_get_categories(self, api_client, sample_catalog):
        response = api_client.get('/api/v1/categories/')
        assert response.status_code == 200
        assert len(response.data) >= 1
        assert response.data[0]['slug'] == 'organic-fruits'

    def test_get_products_list_and_search(self, api_client, sample_catalog):
        response = api_client.get('/api/v1/products/?search=Apples')
        assert response.status_code == 200
        assert response.data['count'] == 1
        assert response.data['results'][0]['name'] == 'Fresh Apples'
        assert response.data['results'][0]['discount_percentage'] == 21

    def test_product_detail_by_slug(self, api_client, sample_catalog):
        response = api_client.get('/api/v1/products/fresh-apples/')
        assert response.status_code == 200
        assert response.data['price'] == '149.00'
        assert response.data['is_in_stock'] is True


@pytest.mark.django_db
class TestCartOperations:
    def test_add_to_cart_and_subtotal(self, auth_client, sample_catalog):
        apple = sample_catalog['apple']
        response = auth_client.post('/api/v1/cart/items/', {
            'product_id': apple.id,
            'quantity': 2
        }, format='json')

        assert response.status_code == 200
        assert response.data['total_items'] == 2
        assert Decimal(response.data['subtotal']) == Decimal('298.00')

    def test_stock_limit_enforced_in_cart(self, auth_client, sample_catalog):
        banana = sample_catalog['banana']  # stock is 3
        response = auth_client.post('/api/v1/cart/items/', {
            'product_id': banana.id,
            'quantity': 5  # exceeds 3
        }, format='json')

        assert response.status_code == 400
        assert 'available' in response.data['error']


@pytest.mark.django_db
class TestCheckoutAndOrders:
    def test_atomic_order_creation_and_stock_decrement(self, auth_client, test_user, sample_catalog, sample_checkout_data):
        apple = sample_catalog['apple']
        initial_stock = apple.stock_quantity  # 50

        # Add to cart
        auth_client.post('/api/v1/cart/items/', {'product_id': apple.id, 'quantity': 2}, format='json')

        # Place order with coupon TEST50
        checkout_payload = {
            'address_id': sample_checkout_data['address'].id,
            'delivery_slot_id': sample_checkout_data['slot'].id,
            'payment_method': 'COD',
            'coupon_code': 'TEST50',
            'delivery_instructions': 'Leave with security guard'
        }
        response = auth_client.post('/api/v1/orders/', checkout_payload, format='json')

        assert response.status_code == 201
        assert response.data['status'] == 'CONFIRMED'
        # Subtotal: 2 * 149 = 298. Below 499, delivery fee = 40. Discount = 50. Total = 288.
        assert Decimal(response.data['subtotal']) == Decimal('298.00')
        assert Decimal(response.data['delivery_fee']) == Decimal('40.00')
        assert Decimal(response.data['discount_amount']) == Decimal('50.00')
        assert Decimal(response.data['total_amount']) == Decimal('288.00')
        assert response.data['can_cancel'] is True

        # Verify stock was decremented in database
        apple.refresh_from_db()
        assert apple.stock_quantity == initial_stock - 2

        # Verify cart was cleared
        cart = Cart.objects.get(user=test_user)
        assert cart.items.count() == 0

    def test_order_cancellation_restores_stock(self, auth_client, test_user, sample_catalog, sample_checkout_data):
        apple = sample_catalog['apple']
        initial_stock = apple.stock_quantity

        # Add to cart and checkout
        auth_client.post('/api/v1/cart/items/', {'product_id': apple.id, 'quantity': 1}, format='json')
        order_res = auth_client.post('/api/v1/orders/', {
            'address_id': sample_checkout_data['address'].id,
            'delivery_slot_id': sample_checkout_data['slot'].id,
            'payment_method': 'COD'
        }, format='json')
        order_id = order_res.data['id']

        apple.refresh_from_db()
        assert apple.stock_quantity == initial_stock - 1

        # Cancel the order
        cancel_res = auth_client.post(f'/api/v1/orders/{order_id}/cancel/', {'reason': 'Changed mind'}, format='json')
        assert cancel_res.status_code == 200
        assert cancel_res.data['status'] == 'CANCELLED'

        # Verify stock was restored
        apple.refresh_from_db()
        assert apple.stock_quantity == initial_stock
