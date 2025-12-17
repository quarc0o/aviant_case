import json
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Order, Item


def get_orders(request):
    """Simple GET endpoint - returns all orders with items as JSON"""
    orders = Order.objects.prefetch_related('items').all()

    result = []
    for order in orders:
        result.append({
            'id': order.id,
            'reference_id': order.reference_id,
            'created_at': order.created_at,
            'accepted_at': order.accepted_at,
            'rejected_at': order.rejected_at,
            'cancelled_at': order.cancelled_at,
            'items': list(order.items.values('id', 'name', 'quantity', 'notes', 'completed_at'))
        })

    return JsonResponse(result, safe=False)


@csrf_exempt
@require_POST
def order_created(request):
    """
    Webhook endpoint for receiving new orders from external systems.

    Expected payload:
    {
        "reference_id": "ORD-12345",
        "items": [
            {"name": "Burger", "quantity": 2, "notes": "No onions"},
            {"name": "Fries", "quantity": 1, "notes": ""}
        ]
    }
    """
    try:
        data = json.loads(request.body)

        order = Order.objects.create(
            reference_id=data['reference_id']
        )

        for item_data in data.get('items', []):
            Item.objects.create(
                order=order,
                name=item_data['name'],
                quantity=item_data.get('quantity', 1),
                notes=item_data.get('notes', '')
            )

        return JsonResponse({
            'status': 'success',
            'order_id': order.id,
            'reference_id': order.reference_id
        }, status=201)

    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def order_cancelled(request):
    """
    Webhook endpoint for cancelling an order.

    Expected payload:
    {
        "order_id": 1
    }
    """
    try:
        data = json.loads(request.body)
        order_id = data['order_id']

        order = Order.objects.get(id=order_id)
        order.cancelled_at = timezone.now()
        order.save()

        return JsonResponse({
            'status': 'success',
            'order_id': order.id,
            'cancelled_at': order.cancelled_at
        })

    except Order.DoesNotExist:
        return JsonResponse({'error': 'Order not found'}, status=404)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
