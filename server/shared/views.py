from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from .models import Image, Model3D
from .serializers import ImageSerializer, Model3DSerializer


class ImageViewSet(viewsets.ModelViewSet):
    """ViewSet для модели Image."""
    queryset = Image.objects.all()
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_context(self):
        """Добавляет контекст запроса для генерации URL."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class Model3DViewSet(viewsets.ModelViewSet):
    """ViewSet для модели Model3D."""
    queryset = Model3D.objects.all()
    serializer_class = Model3DSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['description']
    ordering_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']
    
    def get_serializer_context(self):
        """Добавляет контекст запроса для генерации URL."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context