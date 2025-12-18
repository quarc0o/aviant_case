from django.db import models
from restaurants.models import Restaurant

# Create your models here.
class Order(models.Model):
    class Status(models.TextChoices):
        CREATED = 'CREATED'
        ACCEPTED = 'ACCEPTED'
        REJECTED = 'REJECTED'
        DELAYED = 'DELAYED'
        DONE = 'DONE'
        CANCELLED = 'CANCELLED'
    
    restaurant = models.ForeignKey(Restaurant, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.CREATED)
    customer_name = models.CharField(max_length=255)
    delivery_address = models.TextField()
    estimated_prep_time = models.PositiveIntegerField(null=True, blank=True) 
    delayed = models.BooleanField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    notes = models.TextField(null=True, blank=True)

class OrderEvent(models.Model):
    class EventType(models.TextChoices):
        ORDER_CREATED = 'order_created'
        ORDER_CANCELLED = 'order_cancelled'
        PREPARATION_ACCEPTED = 'preparation_accepted'
        PREPARATION_REJECTED = 'preparation_rejected'
        PREPARATION_DELAYED = 'preparation_delayed'
        PREPARATION_CANCELLED = 'preparation_cancelled'
        PREPARATION_DONE = 'preparation_done'
    
    class Source(models.TextChoices):
        KYTE_BACKEND = 'kyte_backend'
        RESTAURANT = 'restaurant'
    
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=30, choices=EventType.choices)
    source = models.CharField(max_length=20, choices=Source.choices)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)