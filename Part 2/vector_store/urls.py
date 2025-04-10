from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmbeddingViewSet, VectorIndexViewSet

router = DefaultRouter()
router.register(r'embeddings', EmbeddingViewSet, basename='embedding')
router.register(r'indexes', VectorIndexViewSet, basename='vector-index')

urlpatterns = [
    path('', include(router.urls)),
]
