import logging
import requests
from django.conf import settings
from django.db.models.signals import pre_save, post_save
from django.dispatch import receiver
from .models import Preparation

logger = logging.getLogger(__name__)

# ANSI Colors
GREEN = '\033[92m'
YELLOW = '\033[93m'
RED = '\033[91m'
CYAN = '\033[96m'
RESET = '\033[0m'

EVENT_COLORS = {
    'preparation.accepted': GREEN,
    'preparation.completed': GREEN,
    'preparation.ready': GREEN,
    'preparation.delayed': YELLOW,
    'preparation.cancelled': RED,
    'preparation.rejected': RED,
    'preparation.updated': CYAN,
}

# Fields to track for webhook notifications
TRACKED_FIELDS = [
    'accepted_at',
    'ready_at',
    'rejected_at',
    'cancelled_at',
    'delayed_to',
    'completed_at',
]


def get_webhook_url():
    """Get webhook URL from settings."""
    return getattr(settings, 'PREPARATION_WEBHOOK_URL', None)


def send_webhook(event_type: str, preparation: Preparation, changed_fields: list):
    """Send webhook notification to external system."""
    webhook_url = get_webhook_url()
    if not webhook_url:
        logger.debug("No webhook URL configured, skipping notification")
        return

    payload = {
        'event': event_type,
        'preparation_id': preparation.id,
        'order_id': preparation.order_id,
        'changed_fields': changed_fields,
        'data': {
            'accepted_at': preparation.accepted_at.isoformat() if preparation.accepted_at else None,
            'ready_at': preparation.ready_at.isoformat() if preparation.ready_at else None,
            'rejected_at': preparation.rejected_at.isoformat() if preparation.rejected_at else None,
            'cancelled_at': preparation.cancelled_at.isoformat() if preparation.cancelled_at else None,
            'cancelled_by_customer': preparation.cancelled_by_customer,
            'delayed_to': preparation.delayed_to.isoformat() if preparation.delayed_to else None,
            'completed_at': preparation.completed_at.isoformat() if preparation.completed_at else None,
        }
    }

    try:
        response = requests.post(
            webhook_url,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=10
        )
        response.raise_for_status()
        color = EVENT_COLORS.get(event_type, CYAN)
        logger.info(f"{color}⚡ {event_type}{RESET} → {preparation.order_id}")
    except requests.exceptions.RequestException as e:
        logger.error(f"{RED}✗ Webhook failed:{RESET} {e}")


@receiver(pre_save, sender=Preparation)
def preparation_pre_save(sender, instance, **kwargs):
    """Store original field values before save."""
    if instance.pk:
        try:
            original = Preparation.objects.get(pk=instance.pk)
            instance._original_values = {
                field: getattr(original, field)
                for field in TRACKED_FIELDS
            }
        except Preparation.DoesNotExist:
            instance._original_values = {}
    else:
        instance._original_values = {}


@receiver(post_save, sender=Preparation)
def preparation_post_save(sender, instance, created, **kwargs):
    """Send webhook when tracked fields change."""
    logger.debug(f"post_save signal fired for Preparation {instance.pk} (created={created})")

    if created:
        logger.info(f"New preparation created: {instance.order_id}")
        return

    original_values = getattr(instance, '_original_values', {})
    changed_fields = []

    for field in TRACKED_FIELDS:
        original_value = original_values.get(field)
        current_value = getattr(instance, field)

        if original_value != current_value:
            changed_fields.append(field)
            logger.debug(f"Field '{field}' changed: {original_value} -> {current_value}")

    if not changed_fields:
        logger.debug("No tracked fields changed, skipping webhook")
        return

    # Determine event type based on what changed
    if 'completed_at' in changed_fields and instance.completed_at:
        event_type = 'preparation.completed'
    elif 'delayed_to' in changed_fields and instance.delayed_to:
        event_type = 'preparation.delayed'
    elif 'cancelled_at' in changed_fields and instance.cancelled_at:
        event_type = 'preparation.cancelled'
    elif 'rejected_at' in changed_fields and instance.rejected_at:
        event_type = 'preparation.rejected'
    elif 'accepted_at' in changed_fields and instance.accepted_at:
        event_type = 'preparation.accepted'
    else:
        event_type = 'preparation.updated'

    logger.info(f"Event '{event_type}' triggered for {instance.order_id}, changed fields: {changed_fields}")
    send_webhook(event_type, instance, changed_fields)
