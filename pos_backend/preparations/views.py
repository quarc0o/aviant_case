import json
from django.http import JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from .models import Preparation, Item


def get_preparations(request):
    """Simple GET endpoint - returns all preparations with items as JSON"""
    preparations = Preparation.objects.prefetch_related('items').all()

    result = []
    for preparation in preparations:
        result.append({
            'id': preparation.id,
            'order_id': preparation.order_id,
            'created_at': preparation.created_at,
            'accepted_at': preparation.accepted_at,
            'ready_at': preparation.ready_at,
            'rejected_at': preparation.rejected_at,
            'cancelled_at': preparation.cancelled_at,
            'delayed_to': preparation.delayed_to,
            'completed_at': preparation.completed_at,
            'items': list(preparation.items.values('id', 'name', 'quantity', 'notes', 'completed_at'))
        })

    return JsonResponse(result, safe=False)


@csrf_exempt
@require_POST
def preparation_created(request):
    """
    Webhook endpoint for receiving new preparations from external systems.

    Expected payload:
    {
        "order_id": "ORD-12345",
        "items": [
            {"name": "Burger", "quantity": 2, "notes": "No onions"},
            {"name": "Fries", "quantity": 1, "notes": ""}
        ]
    }
    """
    try:
        data = json.loads(request.body)

        preparation = Preparation.objects.create(
            order_id=data['order_id']
        )

        for item_data in data.get('items', []):
            Item.objects.create(
                preparation=preparation,
                name=item_data['name'],
                quantity=item_data.get('quantity', 1),
                notes=item_data.get('notes', '')
            )

        return JsonResponse({
            'status': 'success',
            'preparation_id': preparation.id,
            'order_id': preparation.order_id
        }, status=201)

    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def preparation_cancelled(request):
    """
    Webhook endpoint for cancelling a preparation.

    Expected payload:
    {
        "preparation_id": 1
    }
    """
    try:
        data = json.loads(request.body)
        preparation_id = data['preparation_id']

        preparation = Preparation.objects.get(id=preparation_id)
        preparation.cancelled_at = timezone.now()
        preparation.save()

        return JsonResponse({
            'status': 'success',
            'preparation_id': preparation.id,
            'cancelled_at': preparation.cancelled_at
        })

    except Preparation.DoesNotExist:
        return JsonResponse({'error': 'Preparation not found'}, status=404)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def complete_item(request):
    """
    API endpoint for marking an item as completed.
    When all items in a preparation are completed, the preparation is also marked as completed.

    Expected payload:
    {
        "item_id": 3
    }
    """
    try:
        data = json.loads(request.body)
        item_id = data['item_id']

        item = Item.objects.get(id=item_id)
        item.completed_at = timezone.now()
        item.save()

        preparation = item.preparation
        preparation_completed = False

        # Check if all items are now completed
        if preparation.all_items_completed() and not preparation.completed_at:
            preparation.completed_at = timezone.now()
            preparation.save()
            preparation_completed = True

        return JsonResponse({
            'status': 'success',
            'item_id': item.id,
            'preparation_id': preparation.id,
            'completed_at': item.completed_at,
            'preparation_completed': preparation_completed,
            'preparation_completed_at': preparation.completed_at
        })

    except Item.DoesNotExist:
        return JsonResponse({'error': 'Item not found'}, status=404)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def accept_preparation(request):
    """
    API endpoint for accepting a preparation.

    Expected payload:
    {
        "preparation_id": 1,
        "ready_at": "2025-12-17T17:00:00Z"
    }
    """
    try:
        data = json.loads(request.body)
        preparation_id = data['preparation_id']
        ready_at = data['ready_at']

        preparation = Preparation.objects.get(id=preparation_id)
        preparation.accepted_at = timezone.now()
        preparation.ready_at = ready_at
        preparation.save()

        return JsonResponse({
            'status': 'success',
            'preparation_id': preparation.id,
            'accepted_at': preparation.accepted_at,
            'ready_at': preparation.ready_at
        })

    except Preparation.DoesNotExist:
        return JsonResponse({'error': 'Preparation not found'}, status=404)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)


@csrf_exempt
@require_POST
def reject_preparation(request):
    """
    API endpoint for rejecting a preparation.

    Expected payload:
    {
        "preparation_id": 1
    }
    """
    try:
        data = json.loads(request.body)
        preparation_id = data['preparation_id']

        preparation = Preparation.objects.get(id=preparation_id)
        preparation.rejected_at = timezone.now()
        preparation.save()

        return JsonResponse({
            'status': 'success',
            'preparation_id': preparation.id,
            'rejected_at': preparation.rejected_at
        })

    except Preparation.DoesNotExist:
        return JsonResponse({'error': 'Preparation not found'}, status=404)
    except KeyError as e:
        return JsonResponse({'error': f'Missing field: {e}'}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
