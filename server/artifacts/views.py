from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as filters
from .models import HallCategory, Hall, ArtifactCategory, Artifact
from .serializers import (
    HallCategorySerializer,
    HallSerializer,
    HallCreateUpdateSerializer,
    ArtifactCategorySerializer,
    ArtifactSerializer,
    ArtifactCreateUpdateSerializer
)


class HallCategoryFilter(filters.FilterSet):
    """Фильтр для HallCategory."""
    name = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = HallCategory
        fields = ['name']


class HallFilter(filters.FilterSet):
    """Фильтр для Hall."""
    name = filters.CharFilter(lookup_expr='icontains')
    category = filters.ModelChoiceFilter(queryset=HallCategory.objects.all())
    
    class Meta:
        model = Hall
        fields = ['name', 'category']


class ArtifactCategoryFilter(filters.FilterSet):
    """Фильтр для ArtifactCategory."""
    name = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = ArtifactCategory
        fields = ['name']


class ArtifactFilter(filters.FilterSet):
    """Фильтр для Artifact."""
    name = filters.CharFilter(lookup_expr='icontains')
    category = filters.ModelChoiceFilter(queryset=ArtifactCategory.objects.all())
    hall = filters.ModelChoiceFilter(queryset=Hall.objects.all())
    creation_year = filters.NumberFilter()
    creation_year_from = filters.NumberFilter(field_name='creation_year', lookup_expr='gte')
    creation_year_to = filters.NumberFilter(field_name='creation_year', lookup_expr='lte')
    
    class Meta:
        model = Artifact
        fields = ['name', 'category', 'hall', 'creation_year', 'creation_year_from', 'creation_year_to']


class HallCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet для модели HallCategory."""
    queryset = HallCategory.objects.all()
    serializer_class = HallCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HallCategoryFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class HallViewSet(viewsets.ModelViewSet):
    """ViewSet для модели Hall."""
    queryset = Hall.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HallFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Возвращает соответствующий сериализатор в зависимости от действия."""
        if self.action in ['create', 'update', 'partial_update']:
            return HallCreateUpdateSerializer
        return HallSerializer
    
    def get_serializer_context(self):
        """Добавляет контекст запроса для генерации URL."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class ArtifactCategoryViewSet(viewsets.ModelViewSet):
    """ViewSet для модели ArtifactCategory."""
    queryset = ArtifactCategory.objects.all()
    serializer_class = ArtifactCategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ArtifactCategoryFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class ArtifactViewSet(viewsets.ModelViewSet):
    """ViewSet для модели Artifact."""
    queryset = Artifact.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ArtifactFilter
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'creation_year', 'created_at']
    ordering = ['name']
    
    def get_serializer_class(self):
        """Возвращает соответствующий сериализатор в зависимости от действия."""
        if self.action in ['create', 'update', 'partial_update']:
            return ArtifactCreateUpdateSerializer
        return ArtifactSerializer
    
    def get_serializer_context(self):
        """Добавляет контекст запроса для генерации URL."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context