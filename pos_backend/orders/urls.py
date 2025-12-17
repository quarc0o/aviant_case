from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_orders, name='get_orders'),
    path('webhook/order_created/', views.order_created, name='order_created'),
]
