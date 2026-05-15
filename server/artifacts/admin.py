from django.contrib import admin
from django.utils.html import format_html

from .models import (
    Artifact,
    ArtifactCategory,
    GalleryFolder,
    Hall,
    HallCategory,
    MediaArchiveItem,
)


@admin.register(HallCategory)
class HallCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["name"]


@admin.register(Hall)
class HallAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "image_preview", "created_at"]
    list_filter = ["category", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at", "image_preview"]
    ordering = ["name"]

    def image_preview(self, obj):
        if obj.image and obj.image.image:
            return format_html(
                '<img src="{}" style="max-height: 50px; max-width: 50px;" />',
                obj.image.image.url,
            )
        return "Нет изображения"

    image_preview.short_description = "Превью зала"


@admin.register(ArtifactCategory)
class ArtifactCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["name"]


@admin.register(Artifact)
class ArtifactAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "hall", "creation_year", "has_3d_model", "images_count", "created_at"]
    list_filter = ["category", "hall", "creation_year", "created_at"]
    search_fields = ["name", "description"]
    filter_horizontal = ["images"]
    readonly_fields = ["created_at", "updated_at", "has_3d_model", "images_count"]
    ordering = ["name"]

    fieldsets = (
        ("Основная информация", {"fields": ("name", "description", "creation_year")}),
        ("Классификация", {"fields": ("category", "hall")}),
        ("Медиа", {"fields": ("model_3d", "images", "primary_image"), "classes": ("collapse",)}),
        (
            "Системная информация",
            {"fields": ("created_at", "updated_at", "has_3d_model", "images_count"), "classes": ("collapse",)},
        ),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "primary_image":
            kwargs["queryset"] = db_field.remote_field.model.objects.order_by("-created_at")
            kwargs["help_text"] = "Выберите фото, которое должно отображаться первым на сайте."
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def has_3d_model(self, obj):
        return "Да" if obj.model_3d else "Нет"

    has_3d_model.short_description = "Есть 3D модель"

    def images_count(self, obj):
        return obj.images.count()

    images_count.short_description = "Количество изображений"


@admin.register(GalleryFolder)
class GalleryFolderAdmin(admin.ModelAdmin):
    list_display = ["name", "display_order", "is_published", "items_count", "created_at"]
    list_filter = ["is_published", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at", "updated_at", "items_count"]
    ordering = ["display_order", "id"]

    fieldsets = (
        ("Раздел фотоархива", {"fields": ("name", "description", "display_order", "is_published")}),
        ("Системная информация", {"fields": ("created_at", "updated_at", "items_count"), "classes": ("collapse",)}),
    )

    def items_count(self, obj):
        return obj.items.count()

    items_count.short_description = "Количество снимков"


@admin.register(MediaArchiveItem)
class MediaArchiveItemAdmin(admin.ModelAdmin):
    list_display = ["title", "folder", "year_label", "display_order", "is_published", "image_preview", "created_at"]
    list_filter = ["folder", "is_published", "created_at"]
    search_fields = ["title", "description", "year_label"]
    readonly_fields = ["created_at", "updated_at", "image_preview"]
    ordering = ["folder", "display_order", "id"]

    fieldsets = (
        ("Основная информация", {"fields": ("title", "year_label", "description", "folder", "image")}),
        ("Публикация", {"fields": ("display_order", "is_published")}),
        ("Предпросмотр", {"fields": ("image_preview",), "classes": ("collapse",)}),
        ("Системная информация", {"fields": ("created_at", "updated_at"), "classes": ("collapse",)}),
    )

    def image_preview(self, obj):
        if obj.image and obj.image.image:
            return format_html(
                '<img src="{}" style="max-height: 80px; max-width: 120px; object-fit: cover;" />',
                obj.image.image.url,
            )
        return "Нет изображения"

    image_preview.short_description = "Превью"
