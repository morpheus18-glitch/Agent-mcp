from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Embedding, VectorIndex
from .serializers import EmbeddingSerializer, VectorIndexSerializer, SearchQuerySerializer
from .embedding_service import EmbeddingService
from users.permissions import IsAdminUser, IsStandardOrAdmin
from conversations.permissions import HasConversationAccess
from conversations.models import Message, Conversation

class EmbeddingViewSet(viewsets.ModelViewSet):
    serializer_class = EmbeddingSerializer
    permission_classes = [permissions.IsAuthenticated, HasConversationAccess]
    
    def get_queryset(self):
        return Embedding.objects.all()
    
    def check_conversation_access(self, message_id):
        message = get_object_or_404(Message, id=message_id)
        conversation = message.conversation
        self.check_object_permissions(self.request, conversation)
        return conversation
    
    def create(self, request, *args, **kwargs):
        message_id = request.data.get('message')
        if not message_id:
            return Response(
                {"detail": "message is required"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check access to the conversation
        self.check_conversation_access(message_id)
        
        # Generate and store embedding
        try:
            embedding_service = EmbeddingService()
            embedding_id = embedding_service.store_message_embedding(message_id)
            
            embedding = get_object_or_404(Embedding, id=embedding_id)
            serializer = self.get_serializer(embedding)
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def search(self, request):
        serializer = SearchQuerySerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        query = serializer.validated_data['query']
        conversation_id = serializer.validated_data.get('conversation_id')
        top_k = serializer.validated_data.get('top_k', 10)
        
        # If conversation_id is provided, check access
        if conversation_id:
            conversation = get_object_or_404(Conversation, id=conversation_id)
            self.check_object_permissions(request, conversation)
        
        try:
            embedding_service = EmbeddingService()
            results = embedding_service.search_similar_messages(
                query, 
                top_k=top_k,
                conversation_id=conversation_id
            )
            
            return Response(results)
        except Exception as e:
            return Response(
                {"detail": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class VectorIndexViewSet(viewsets.ModelViewSet):
    serializer_class = VectorIndexSerializer
    permission_classes = [IsStandardOrAdmin]
    
    def get_queryset(self):
        return VectorIndex.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
