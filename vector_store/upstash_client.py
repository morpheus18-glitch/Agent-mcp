import json
import requests
from django.conf import settings

class UpstashVectorClient:
    def __init__(self):
        self.base_url = settings.UPSTASH_VECTOR_URL
        self.token = settings.UPSTASH_VECTOR_TOKEN
        
        if not self.base_url or not self.token:
            raise ValueError("Upstash Vector URL and token must be configured")
    
    def _make_request(self, endpoint, method="GET", data=None):
        """Make a request to the Upstash Vector API."""
        url = f"{self.base_url}/{endpoint}"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json"
        }
        
        if method == "GET":
            response = requests.get(url, headers=headers)
        elif method == "POST":
            response = requests.post(url, headers=headers, json=data)
        elif method == "PUT":
            response = requests.put(url, headers=headers, json=data)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        if response.status_code >= 400:
            raise Exception(f"Upstash Vector API error: {response.status_code} - {response.text}")
        
        return response.json()
    
    def create_index(self, name, dimensions):
        """Create a new vector index."""
        data = {
            "name": name,
            "dimensions": dimensions
        }
        return self._make_request("indexes", method="POST", data=data)
    
    def list_indexes(self):
        """List all vector indexes."""
        return self._make_request("indexes")
    
    def delete_index(self, index_name):
        """Delete a vector index."""
        return self._make_request(f"indexes/{index_name}", method="DELETE")
    
    def upsert_vector(self, index_name, id, vector, metadata=None):
        """Insert or update a vector in an index."""
        data = {
            "id": id,
            "vector": vector,
            "metadata": metadata or {}
        }
        return self._make_request(f"indexes/{index_name}/vectors", method="POST", data=data)
    
    def upsert_vectors(self, index_name, vectors):
        """Insert or update multiple vectors in an index."""
        data = {"vectors": vectors}
        return self._make_request(f"indexes/{index_name}/vectors/batch", method="POST", data=data)
    
    def get_vector(self, index_name, id):
        """Get a vector by ID."""
        return self._make_request(f"indexes/{index_name}/vectors/{id}")
    
    def delete_vector(self, index_name, id):
        """Delete a vector by ID."""
        return self._make_request(f"indexes/{index_name}/vectors/{id}", method="DELETE")
    
    def query(self, index_name, vector, top_k=10, include_vectors=False, include_metadata=True, filter=None):
        """Query vectors by similarity."""
        data = {
            "vector": vector,
            "top_k": top_k,
            "include_vectors": include_vectors,
            "include_metadata": include_metadata
        }
        
        if filter:
            data["filter"] = filter
        
        return self._make_request(f"indexes/{index_name}/query", method="POST", data=data)
