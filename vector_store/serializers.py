from rest_framework import serializers
from .models import Embedding, VectorIndex

class EmbeddingSerializer(serializers.ModelSerializer):
    message_content = serializers.CharField(source='message.content', read_only=True)
    conversation_id = serializers.CharField(source='message.conversation.id', read_only=True)
    
    class Meta:
        model = Embedding
        fields = (
            'id', 'message', 'message_content', 'conversation_id',
            'vector_id', 'dimensions', 'created_at'
        )
        read_only_fields = ('vector_id', 'dimensions', 'created_at')

class VectorIndexSerializer(serializers.ModelSerializer):
    created_by_email = serializers.CharField(source='created_by.email', read_only=True)
    
    class Meta:
        model = VectorIndex
        fields = (
            'id', 'name', 'description', 'dimensions',
            'created_by', 'created_by_email', 'created_at', 'updated_at'
        )
        read_only_fields = ('created_at', 'updated_at')

class SearchQuerySerializer(serializers.Serializer):
    query = serializers.CharField(required=True)
    conversation_id = serializers.CharField(required=False)
    top_k = serializers.IntegerField(required=False, default=10)
