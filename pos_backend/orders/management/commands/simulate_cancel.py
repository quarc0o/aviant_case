from django.core.management.base import BaseCommand
from orders.models import Order, OrderEvent


class Command(BaseCommand):
    help = 'Simulate Kyte cancelling an order'

    def add_arguments(self, parser):
        parser.add_argument(
            'order_id',
            type=int,
            nargs='?',  # Makes it optional
            help='Order ID to cancel (optional - cancels most recent if not specified)'
        )

    def handle(self, *args, **options):
        order_id = options['order_id']
        
        if order_id:
            # Cancel specific order
            try:
                order = Order.objects.get(id=order_id)
            except Order.DoesNotExist:
                self.stdout.write(self.style.ERROR(f'Order {order_id} not found'))
                return
        else:
            # Cancel most recent cancellable order
            order = Order.objects.exclude(
                status__in=[Order.Status.DONE, Order.Status.CANCELLED, Order.Status.REJECTED]
            ).order_by('-created_at').first()
            
            if not order:
                self.stdout.write(self.style.ERROR('No active orders to cancel'))
                return
        
        # Check if cancellable
        if order.status in [Order.Status.DONE, Order.Status.CANCELLED, Order.Status.REJECTED]:
            self.stdout.write(
                self.style.ERROR(f'Cannot cancel order #{order.id} with status {order.status}')
            )
            return
        
        # Cancel it
        order.status = Order.Status.CANCELLED
        order.save()
        
        OrderEvent.objects.create(
            order=order,
            event_type=OrderEvent.EventType.ORDER_CANCELLED,
            source=OrderEvent.Source.KYTE_BACKEND,
            metadata={'reason': 'Customer cancelled', 'simulated': True}
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'Cancelled order #{order.id} ({order.customer_name})')
        )