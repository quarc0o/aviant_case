from rest_framework import serializers
from .models import Order, OrderItem, OrderEvent


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'name', 'quantity', 'unit_price', 'notes']


class OrderEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderEvent
        fields = ['id', 'event_type', 'source', 'metadata', 'created_at']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    events = OrderEventSerializer(many=True, read_only=True)
    total_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Order
        fields = [
            'id', 'status', 'customer_name',
            'delivery_address', 'estimated_prep_time', 'delayed',
            'created_at', 'updated_at', 'items', 'events', 'total_price'
        ]
    
    def get_total_price(self, obj):
        return sum(item.quantity * item.unit_price for item in obj.items.all())