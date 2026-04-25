from rest_framework import serializers
from .models import HallCategory, Hall, ArtifactCategory, Artifact
from shared.serializers import ImageSerializer, Model3DSerializer


class HallCategorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели HallCategory."""
    
    class Meta:
        model = HallCategory
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HallSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Hall."""
    category = HallCategorySerializer(read_only=True)
    image = ImageSerializer(read_only=True, context={'request': None})
    
    class Meta:
        model = Hall
        fields = ['id', 'name', 'category', 'image', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class HallCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления Hall."""
    
    class Meta:
        model = Hall
        fields = ['name', 'category', 'image']


class ArtifactCategorySerializer(serializers.ModelSerializer):
    """Сериализатор для модели ArtifactCategory."""
    
    class Meta:
        model = ArtifactCategory
        fields = ['id', 'name', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ArtifactSerializer(serializers.ModelSerializer):
    """Сериализатор для модели Artifact."""
    category = ArtifactCategorySerializer(read_only=True)
    hall = HallSerializer(read_only=True)
    model_3d = Model3DSerializer(read_only=True, context={'request': None})
    images = ImageSerializer(many=True, read_only=True, context={'request': None})
    
    class Meta:
        model = Artifact
        fields = [
            'id', 'name', 'description', 'creation_year',
            'category', 'hall', 'model_3d', 'images',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ArtifactCreateUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания и обновления Artifact."""
    
    class Meta:
        model = Artifact
        fields = [
            'name', 'description', 'creation_year',
            'category', 'hall', 'model_3d', 'images'
        ]

