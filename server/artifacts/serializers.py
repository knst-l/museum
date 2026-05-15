from rest_framework import serializers

from shared.serializers import ImageSerializer, Model3DSerializer

from .models import Artifact, ArtifactCategory, GalleryFolder, Hall, HallCategory, MediaArchiveItem


class HallCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = HallCategory
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class HallSerializer(serializers.ModelSerializer):
    category = HallCategorySerializer(read_only=True)
    image = ImageSerializer(read_only=True, context={"request": None})

    class Meta:
        model = Hall
        fields = ["id", "name", "category", "image", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class HallCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hall
        fields = ["name", "category", "image"]


class ArtifactCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtifactCategory
        fields = ["id", "name", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]


class ArtifactSerializer(serializers.ModelSerializer):
    category = ArtifactCategorySerializer(read_only=True)
    hall = HallSerializer(read_only=True)
    model_3d = Model3DSerializer(read_only=True, context={"request": None})
    images = serializers.SerializerMethodField()

    class Meta:
        model = Artifact
        fields = [
            "id",
            "name",
            "description",
            "creation_year",
            "category",
            "hall",
            "model_3d",
            "images",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_images(self, obj):
        images = list(obj.images.all())
        if obj.primary_image_id:
            images.sort(key=lambda image: 0 if image.id == obj.primary_image_id else 1)
        return ImageSerializer(images, many=True, context={"request": None}).data


class ArtifactCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Artifact
        fields = ["name", "description", "creation_year", "category", "hall", "model_3d", "images", "primary_image"]


class GalleryFolderSerializer(serializers.ModelSerializer):
    items_count = serializers.IntegerField(source="items.count", read_only=True)

    class Meta:
        model = GalleryFolder
        fields = [
            "id",
            "name",
            "description",
            "display_order",
            "is_published",
            "items_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "items_count"]


class MediaArchiveItemSerializer(serializers.ModelSerializer):
    image = ImageSerializer(read_only=True, context={"request": None})
    folder = serializers.SerializerMethodField()

    class Meta:
        model = MediaArchiveItem
        fields = [
            "id",
            "title",
            "year_label",
            "description",
            "image",
            "folder",
            "display_order",
            "is_published",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_folder(self, obj):
        return {"id": obj.folder_id, "name": obj.folder.name}


class MediaArchiveItemCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = MediaArchiveItem
        fields = ["title", "year_label", "description", "image", "folder", "display_order", "is_published"]
