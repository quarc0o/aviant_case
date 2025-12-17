import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Order, Item


def get_orders(request):
    """Simple GET endpoint - returns all orders as JSON"""
    orders = Order.objects.all().values('id', 'reference_id', 'created_at')
    return JsonResponse(list(orders), safe=False)


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
