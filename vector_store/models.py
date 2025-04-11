from django.db import models
from django.conf import settings
from conversations.models import Message

class Embedding(models.Model):
    id = models.CharField(max_length=255, primary_key=True)
    message = models.OneToOneField(
        Message,
        on_delete=models.CASCADE,
        related_name='embedding'
    )
    vector_id = models.CharField(max_length=255)
    dimensions = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Embedding for message {self.message.id}"

class VectorIndex(models.Model):
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(null=True, blank=True)
    dimensions = models.IntegerField()
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
