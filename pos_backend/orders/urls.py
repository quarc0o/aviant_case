from django.urls import path
from . import views

urlpatterns = [
    # Restaurant staff endpoints
    path('orders/', views.order_list, name='order-list'),
    path('orders/<int:order_id>/', views.order_detail, name='order-detail'),
    path('orders/<int:order_id>/accept/', views.accept_order, name='order-accept'),
    path('orders/<int:order_id>/reject/', views.reject_order, name='order-reject'),
    path('orders/<int:order_id>/delay/', views.delay_order, name='order-delay'),
    path('orders/<int:order_id>/done/', views.complete_order, name='order-done'),
    path('orders/<int:order_id>/cancel/', views.cancel_preparation, name='order-cancel'),
    
    # Kyte webhooks
    path('webhooks/order-created/', views.webhook_order_created, name='webhook-order-created'),
    path('webhooks/order-cancelled/', views.webhook_order_cancelled, name='webhook-order-cancelled'),
]