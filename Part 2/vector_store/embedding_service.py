import numpy as np
import uuid
from django.conf import settings
import groq
from .upstash_client import UpstashVectorClient
from .models import Embedding, VectorIndex
from conversations.models import Message

class EmbeddingService:
    def __init__(self):
        self.upstash_client = UpstashVectorClient()
        self.groq_client = groq.Client(api_key=settings.GROQ_API_KEY)
        self.default_index = "message_embeddings"
        self.dimensions = 1536  # Default for most embedding models
    
    def _ensure_index_exists(self, index_name=None):
        """Ensure the vector index exists, creating it if necessary."""
        index_name = index_name or self.default_index
        
        try:
            # Check if index exists in database
            VectorIndex.objects.get(name=index_name)
        except VectorIndex.DoesNotExist:
            # Create index in Upstash
            self.upstash_client.create_index(index_name, self.dimensions)
            
            # Create index record in database
            VectorIndex.objects.create(
                name=index_name,
                description=f"Index for {index_name}",
                dimensions=self.dimensions
            )
    
    def generate_embedding(self, text):
        """Generate embedding vector for text using Groq."""
        response = self.groq_client.embeddings.create(
            model="llama3-embedding-v1",
            input=text
        )
        return response.data[0].embedding
    
    def store_message_embedding(self, message_id):
        """Generate and store embedding for a message."""
        try:
            message = Message.objects.get(id=message_id)
            
            # Generate embedding
            text = message.content
            if message.thinking:
                text += f" {message.thinking}"
            
            embedding_vector = self.generate_embedding(text)
            
            # Ensure index exists
            self._ensure_index_exists()
            
            # Create metadata
            metadata = {
                "message_id": message.id,
                "conversation_id": message.conversation.id,
                "agent_id": message.agent.id,
                "timestamp": message.timestamp.isoformat(),
                "content": message.content[:1000]  # Truncate for metadata
            }
            
            # Store in Upstash
            vector_id = str(uuid.uuid4())
            self.upstash_client.upsert_vector(
                self.default_index,
                vector_id,
                embedding_vector,
                metadata
            )
            
            # Store in database
            embedding_id = str(uuid.uuid4())
            Embedding.objects.create(
                id=embedding_id,
                message=message,
                vector_id=vector_id,
                dimensions=self.dimensions
            )
            
            # Update message with embedding ID
            message.embedding_id = embedding_id
            message.save(update_fields=['embedding_id'])
            
            return embedding_id
        except Exception as e:
            raise Exception(f"Error storing message embedding: {str(e)}")
    
    def search_similar_messages(self, text, top_k=10, conversation_id=None):
        """Search for messages similar to the given text."""
        try:
            # Generate embedding for query text
            query_vector = self.generate_embedding(text)
            
            # Prepare filter if conversation_id is provided
            filter_obj = None
            if conversation_id:
                filter_obj = {
                    "field": "conversation_id",
                    "value": conversation_id
                }
            
            # Query Upstash
            results = self.upstash_client.query(
                self.default_index,
                query_vector,
                top_k=top_k,
                include_vectors=False,
                include_metadata=True,
                filter=filter_obj
            )
            
            # Format results
            formatted_results = []
            for match in results.get("matches", []):
                formatted_results.append({
                    "message_id": match["metadata"]["message_id"],
                    "content": match["metadata"]["content"],
                    "conversation_id": match["metadata"]["conversation_id"],
                    "agent_id": match["metadata"]["agent_id"],
                    "timestamp": match["metadata"]["timestamp"],
                    "score": match["score"]
                })
            
            return formatted_results
        except Exception as e:
            raise Exception(f"Error searching similar messages: {str(e)}")
