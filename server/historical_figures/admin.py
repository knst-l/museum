from django.contrib import admin

from .models import ScienceField, HistoricalFigure


@admin.register(ScienceField)
class ScienceFieldAdmin(admin.ModelAdmin):
    list_display = ["name", "created_at"]
    search_fields = ["name"]
    readonly_fields = ["created_at", "updated_at"]
    ordering = ["name"]


@admin.register(HistoricalFigure)
class HistoricalFigureAdmin(admin.ModelAdmin):
    list_display = ["last_name", "first_name", "middle_name", "birth_date", "death_date", "images_count"]
    list_filter = ["birth_date", "death_date", "science_fields", "created_at"]
    search_fields = ["last_name", "first_name", "middle_name", "description"]
    filter_horizontal = ["science_fields", "images", "artifacts"]
    readonly_fields = ["created_at", "updated_at", "images_count"]
    ordering = ["last_name", "first_name"]

    fieldsets = (
        ("Основная информация", {
            "fields": ("last_name", "first_name", "middle_name")
        }),
        ("Даты", {
            "fields": ("birth_date", "death_date")
        }),
        ("Описание", {
            "fields": ("description", "biography")
        }),
        ("Связи", {
            "fields": ("science_fields", "images", "primary_image", "artifacts"),
            "classes": ("collapse",)
        }),
        ("Системная информация", {
            "fields": ("created_at", "updated_at", "images_count"),
            "classes": ("collapse",)
        }),
    )

    def formfield_for_foreignkey(self, db_field, request, **kwargs):
        if db_field.name == "primary_image":
            kwargs["queryset"] = db_field.remote_field.model.objects.order_by("-created_at")
            kwargs["help_text"] = "Выберите фото, которое должно отображаться первым на сайте."
        return super().formfield_for_foreignkey(db_field, request, **kwargs)

    def images_count(self, obj):
        return obj.images.count()

    images_count.short_description = "Количество изображений"
