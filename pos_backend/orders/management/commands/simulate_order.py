import random
from django.core.management.base import BaseCommand
from orders.models import Order, OrderItem, OrderEvent
from restaurants.models import Restaurant


class Command(BaseCommand):
    help = 'Simulate an incoming order from Kyte'

    # Sample data for realistic orders
    CUSTOMERS = [
        ('Ola Nordmann', 'Parkveien 12, Trondheim'),
        ('Kari Hansen', 'Munkegata 5, Trondheim'),
        ('Erik Larsen', 'Solsiden 8, Trondheim'),
        ('Ingrid Berg', 'Bakklandet 22, Trondheim'),
        ('Magnus Olsen', 'Lade Allé 15, Trondheim'),
    ]

    MENU_ITEMS = [
        ('Cheeseburger', 149),
        ('Crispy Chicken Burger', 159),
        ('Veggie Wrap', 129),
        ('Fish & Chips', 179),
        ('Caesar Salad', 139),
        ('Fries', 49),
        ('Onion Rings', 59),
        ('Cola', 35),
        ('Sprite', 35),
        ('Milkshake', 65),
    ]

    def handle(self, *args, **options):
        # Get or create a default restaurant
        restaurant, _ = Restaurant.objects.get_or_create(
            defaults={'name': 'Demo Restaurant'}
        )

        # Random customer
        customer_name, address = random.choice(self.CUSTOMERS)

        # Generate unique Kyte order ID
        kyte_order_id = f'kyte-{random.randint(10000, 99999)}'

        # Create order
        order = Order.objects.create(
            restaurant=restaurant,
            customer_name=customer_name,
            delivery_address=address,
            status=Order.Status.CREATED
        )

        # Add 2-4 random items
        num_items = random.randint(2, 4)
        selected_items = random.sample(self.MENU_ITEMS, num_items)
        
        for name, price in selected_items:
            OrderItem.objects.create(
                order=order,
                name=name,
                quantity=random.randint(1, 2),
                unit_price=price
            )

        # Log the event
        OrderEvent.objects.create(
            order=order,
            event_type=OrderEvent.EventType.ORDER_CREATED,
            source=OrderEvent.Source.KYTE_BACKEND,
            metadata={'simulated': True}
        )

        self.stdout.write(
            self.style.SUCCESS(
                f'Created order #{order.id} for {customer_name} ({len(selected_items)} items)'
            )
        )