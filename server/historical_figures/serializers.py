from rest_framework import serializers

from .models import ScienceField, HistoricalFigure
from shared.serializers import ImageSerializer


class ScienceFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScienceField
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class HistoricalFigureSerializer(serializers.ModelSerializer):
    science_fields = ScienceFieldSerializer(many=True, read_only=True)
    images = serializers.SerializerMethodField()
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = HistoricalFigure
        fields = [
            "id", "last_name", "first_name", "middle_name", "full_name",
            "birth_date", "death_date", "description", "biography",
            "science_fields", "images", "artifacts", "created_at", "updated_at"
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_images(self, obj):
        images = list(obj.images.all())
        if obj.primary_image_id:
            images.sort(key=lambda image: 0 if image.id == obj.primary_image_id else 1)
        return ImageSerializer(images, many=True, context={"request": None}).data


class HistoricalFigureCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricalFigure
        fields = [
            "last_name", "first_name", "middle_name",
            "birth_date", "death_date", "description", "biography",
            "science_fields", "images", "primary_image", "artifacts"
        ]
