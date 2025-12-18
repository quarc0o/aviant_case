from django.contrib import admin
from .models import Order, OrderItem, OrderEvent


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderEventInline(admin.TabularInline):
    model = OrderEvent
    extra = 0
    readonly_fields = ['event_type', 'source', 'metadata', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'customer_name', 'status', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['customer_name']
    inlines = [OrderItemInline, OrderEventInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'name', 'quantity', 'unit_price']


@admin.register(OrderEvent)
class OrderEventAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'event_type', 'source', 'created_at']
    list_filter = ['event_type', 'source']