from django.urls import path
from . import views

urlpatterns = [
    path('', views.get_preparations, name='get_preparations'),
    path('complete_item/', views.complete_item, name='complete_item'),
    path('accept_preparation/', views.accept_preparation, name='accept_preparation'),
    path('reject_preparation/', views.reject_preparation, name='reject_preparation'),
    path('webhook/preparation_created/', views.preparation_created, name='preparation_created'),
    path('webhook/preparation_cancelled/', views.preparation_cancelled, name='preparation_cancelled'),
]
