from rest_framework import serializers

from .models import Image, Model3D


class ImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    object_position = serializers.ReadOnlyField()

    class Meta:
        model = Image
        fields = [
            'id', 'image', 'image_url', 'description',
            'focus_x', 'focus_y', 'object_position',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class Model3DSerializer(serializers.ModelSerializer):
    model_url = serializers.SerializerMethodField()

    class Meta:
        model = Model3D
        fields = ['id', 'model', 'model_url', 'description', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_model_url(self, obj):
        if obj.model:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.model.url)
            return obj.model.url
        return None
