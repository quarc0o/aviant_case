from django.db import models


class Preparation(models.Model):
    order_id = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    accepted_at = models.DateTimeField(null=True, blank=True)
    ready_at = models.DateTimeField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    delayed_to = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Preparation {self.id} - {self.order_id}"

    def all_items_completed(self):
        """Check if all items in this preparation are completed."""
        return self.items.exists() and not self.items.filter(completed_at__isnull=True).exists()


class Item(models.Model):
    preparation = models.ForeignKey(Preparation, on_delete=models.CASCADE, related_name='items')
    name = models.CharField(max_length=255)
    quantity = models.PositiveIntegerField(default=1)
    notes = models.TextField(blank=True, default='')
    completed_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.name} (x{self.quantity})"
