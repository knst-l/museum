from rest_framework import serializers
from .models import ScienceField, HistoricalFigure
from shared.serializers import ImageSerializer


class ScienceFieldSerializer(serializers.ModelSerializer):
    """Сериализатор для модели ScienceField."""
    
    class Meta:
        model = ScienceField
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HistoricalFigureSerializer(serializers.ModelSerializer):
    """Сериализатор для модели HistoricalFigure."""
    science_fields = ScienceFieldSerializer(many=True, read_only=True)
    images = ImageSerializer(many=True, read_only=True, context={'request': None})
    full_name = serializers.ReadOnlyField()
    
    class Meta:
        model = HistoricalFigure
        fields = [
            'id', 'last_name', 'first_name', 'middle_name', 'full_name',
            'birth_date', 'death_date', 'description', 'biography',
            'science_fields', 'images', 'artifacts', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class HistoricalFigureCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления HistoricalFigure."""
    
    class Meta:
        model = HistoricalFigure
        fields = [
            'last_name', 'first_name', 'middle_name',
            'birth_date', 'death_date', 'description', 'biography',
            'science_fields', 'images', 'artifacts'
        ]
