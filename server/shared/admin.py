from django.contrib import admin
from django.utils.html import format_html

from .models import Image, Model3D


@admin.register(Image)
class ImageAdmin(admin.ModelAdmin):
    list_display = ['image_preview', 'description', 'focus_point', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['description']
    readonly_fields = ['created_at', 'updated_at', 'image_preview']
    ordering = ['-created_at']
    fields = ['image', 'description', 'focus_x', 'focus_y', 'image_preview', 'created_at', 'updated_at']

    def image_preview(self, obj):
        if obj and obj.image:
            return format_html(
                '<div class="image-focus-preview" data-focus-x="{}" data-focus-y="{}">'
                '<img src="{}" alt="" />'
                '<span class="image-focus-marker"></span>'
                '</div>'
                '<p class="help">Кликните по превью, чтобы выбрать центр видимой области. Потом сохраните изображение.</p>',
                obj.focus_x,
                obj.focus_y,
                obj.image.url,
            )
        return "Выберите файл изображения. После выбора появится превью для настройки фокуса."

    image_preview.short_description = "Превью и фокус"

    def focus_point(self, obj):
        return obj.object_position

    focus_point.short_description = "Фокус"

    class Media:
        css = {
            'all': ('admin/css/image_focus.css',)
        }
        js = ('admin/js/image_focus.js',)


@admin.register(Model3D)
class Model3DAdmin(admin.ModelAdmin):
    list_display = ['model_name', 'description', 'created_at']
    list_filter = ['created_at', 'updated_at']
    search_fields = ['description']
    readonly_fields = ['created_at', 'updated_at']
    ordering = ['-created_at']

    def model_name(self, obj):
        if obj.model:
            return obj.model.name.split('/')[-1]
        return "Нет модели"

    model_name.short_description = "Файл модели"
