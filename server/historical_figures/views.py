from rest_framework import viewsets, permissions
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters import rest_framework as filters
from .models import ScienceField, HistoricalFigure
from .serializers import (
    ScienceFieldSerializer, 
    HistoricalFigureSerializer,
    HistoricalFigureCreateUpdateSerializer
)


class ScienceFieldFilter(filters.FilterSet):
    """Фильтр для ScienceField."""
    name = filters.CharFilter(lookup_expr='icontains')
    
    class Meta:
        model = ScienceField
        fields = ['name']


class HistoricalFigureFilter(filters.FilterSet):
    """Фильтр для HistoricalFigure."""
    last_name = filters.CharFilter(lookup_expr='icontains')
    first_name = filters.CharFilter(lookup_expr='icontains')
    science_fields = filters.ModelMultipleChoiceFilter(
        queryset=ScienceField.objects.all()
    )
    birth_year = filters.NumberFilter(field_name='birth_date__year')
    death_year = filters.NumberFilter(field_name='death_date__year')
    
    class Meta:
        model = HistoricalFigure
        fields = ['last_name', 'first_name', 'science_fields', 'birth_year', 'death_year']


class ScienceFieldViewSet(viewsets.ModelViewSet):
    """ViewSet для модели ScienceField."""
    queryset = ScienceField.objects.all()
    serializer_class = ScienceFieldSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ScienceFieldFilter
    search_fields = ['name']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']


class HistoricalFigureViewSet(viewsets.ModelViewSet):
    """ViewSet для модели HistoricalFigure."""
    queryset = HistoricalFigure.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = HistoricalFigureFilter
    search_fields = ['last_name', 'first_name', 'middle_name', 'description']
    ordering_fields = ['last_name', 'first_name', 'birth_date', 'created_at']
    ordering = ['last_name', 'first_name']
    
    def get_serializer_class(self):
        """Возвращает соответствующий сериализатор в зависимости от действия."""
        if self.action in ['create', 'update', 'partial_update']:
            return HistoricalFigureCreateUpdateSerializer
        return HistoricalFigureSerializer
    
    def get_serializer_context(self):
        """Добавляет контекст запроса для генерации URL."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context