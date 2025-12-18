from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .models import Order, OrderItem, OrderEvent
from .serializers import OrderSerializer


# ============ RESTAURANT STAFF ENDPOINTS ============

@api_view(['GET'])
def order_list(request):
    """List all orders for the restaurant (excluding cancelled/rejected)"""
    orders = Order.objects.exclude(
        status__in=['CANCELLED', 'REJECTED']
    ).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)


@api_view(['GET'])
def order_detail(request, order_id):
    """Get single order with items and events"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    serializer = OrderSerializer(order)
    return Response(serializer.data)


@api_view(['POST'])
def accept_order(request, order_id):
    """Restaurant accepts order and sets prep time"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    # Validate state transition
    if order.status != Order.Status.CREATED:
        return Response(
            {'error': f'Cannot accept order with status {order.status}'},
            status=400
        )
    
    # Get prep time from request
    prep_time = request.data.get('estimated_prep_time')
    if not prep_time:
        return Response({'error': 'estimated_prep_time required'}, status=400)
    
    # Update order
    order.status = Order.Status.ACCEPTED
    order.estimated_prep_time = prep_time
    order.save()
    
    # Log event
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.PREPARATION_ACCEPTED,
        source=OrderEvent.Source.RESTAURANT,
        metadata={'estimated_prep_time': prep_time}
    )
    
    # TODO: Notify Kyte backend
    
    return Response(OrderSerializer(order).data)


@api_view(['POST'])
def reject_order(request, order_id):
    """Restaurant rejects order"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    if order.status != Order.Status.CREATED:
        return Response(
            {'error': f'Cannot reject order with status {order.status}'},
            status=400
        )
    
    reason = request.data.get('reason', '')
    
    order.status = Order.Status.REJECTED
    order.save()
    
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.PREPARATION_REJECTED,
        source=OrderEvent.Source.RESTAURANT,
        metadata={'reason': reason}
    )
    
    return Response(OrderSerializer(order).data)


@api_view(['POST'])
def delay_order(request, order_id):
    """Restaurant marks order as delayed"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    if order.status not in [Order.Status.ACCEPTED, Order.Status.DELAYED]:
        return Response(
            {'error': f'Cannot delay order with status {order.status}'},
            status=400
        )
    
    new_prep_time = request.data.get('estimated_prep_time')
    reason = request.data.get('reason', '')
    
    old_prep_time = order.estimated_prep_time
    order.status = Order.Status.DELAYED
    order.estimated_prep_time = new_prep_time
    order.delay_reason = reason
    order.save()
    
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.PREPARATION_DELAYED,
        source=OrderEvent.Source.RESTAURANT,
        metadata={
            'reason': reason,
            'old_prep_time': old_prep_time,
            'new_prep_time': new_prep_time
        }
    )
    
    return Response(OrderSerializer(order).data)


@api_view(['POST'])
def complete_order(request, order_id):
    """Restaurant marks preparation as done"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    if order.status not in [Order.Status.ACCEPTED, Order.Status.DELAYED]:
        return Response(
            {'error': f'Cannot complete order with status {order.status}'},
            status=400
        )
    
    order.status = Order.Status.DONE
    order.save()
    
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.PREPARATION_DONE,
        source=OrderEvent.Source.RESTAURANT,
        metadata={}
    )
    
    return Response(OrderSerializer(order).data)

@api_view(['POST'])
def cancel_preparation(request, order_id):
    """Restaurant cancels preparation (e.g., ran out of ingredients)"""
    try:
        order = Order.objects.get(id=order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    # Can only cancel if in progress
    if order.status not in [Order.Status.ACCEPTED, Order.Status.DELAYED]:
        return Response(
            {'error': f'Cannot cancel preparation with status {order.status}'},
            status=400
        )
    
    reason = request.data.get('reason', '')
    
    order.status = Order.Status.CANCELLED
    order.save()
    
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.PREPARATION_CANCELLED,
        source=OrderEvent.Source.RESTAURANT, 
        metadata={'reason': reason}
    )
    
    # TODO: Notify Kyte backend that restaurant cancelled
    
    return Response(OrderSerializer(order).data)


# ============ KYTE WEBHOOK ENDPOINTS ============

@api_view(['POST'])
def webhook_order_created(request):
    """Receive new order from Kyte backend"""
    data = request.data
    
    # Check if order already exists (idempotency)
    if Order.objects.filter(external_kyte_id=data['kyte_order_id']).exists():
        return Response({'status': 'already exists'}, status=200)
    
    # Create order
    order = Order.objects.create(
        external_kyte_id=data['kyte_order_id'],
        restaurant_id=data['restaurant_id'],
        customer_name=data['customer_name'],
        delivery_address=data['delivery_address'],
        status=Order.Status.CREATED
    )
    
    # Create order items
    for item in data['items']:
        OrderItem.objects.create(
            order=order,
            name=item['name'],
            quantity=item['quantity'],
            unit_price=item['unit_price'],
            notes=item.get('notes', '')
        )
    
    # Log event
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.ORDER_CREATED,
        source=OrderEvent.Source.KYTE_BACKEND,
        metadata=data
    )
    
    return Response({'status': 'created', 'order_id': order.id}, status=201)


@api_view(['POST'])
def webhook_order_cancelled(request):
    """Receive cancellation from Kyte backend"""
    kyte_order_id = request.data.get('kyte_order_id')
    
    try:
        order = Order.objects.get(external_kyte_id=kyte_order_id)
    except Order.DoesNotExist:
        return Response({'error': 'Order not found'}, status=404)
    
    order.status = Order.Status.CANCELLED
    order.save()
    
    OrderEvent.objects.create(
        order=order,
        event_type=OrderEvent.EventType.ORDER_CANCELLED,
        source=OrderEvent.Source.KYTE_BACKEND,
        metadata=request.data
    )
    
    return Response({'status': 'cancelled'})