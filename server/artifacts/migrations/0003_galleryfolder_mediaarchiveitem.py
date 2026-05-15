from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0003_image_focus_point"),
        ("artifacts", "0002_artifact_primary_image"),
    ]

    operations = [
        migrations.CreateModel(
            name="GalleryFolder",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("name", models.CharField(max_length=255, verbose_name="Название раздела")),
                ("description", models.TextField(blank=True, default="", verbose_name="Описание раздела")),
                ("display_order", models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")),
                ("is_published", models.BooleanField(default=True, verbose_name="Опубликовано")),
            ],
            options={
                "verbose_name": "Раздел фотоархива",
                "verbose_name_plural": "Разделы фотоархива",
                "ordering": ["display_order", "id"],
            },
        ),
        migrations.CreateModel(
            name="MediaArchiveItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("title", models.CharField(max_length=255, verbose_name="Название")),
                ("year_label", models.CharField(blank=True, default="", max_length=64, verbose_name="Год или период")),
                ("description", models.TextField(blank=True, default="", verbose_name="Описание")),
                ("display_order", models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")),
                ("is_published", models.BooleanField(default=True, verbose_name="Опубликовано")),
                (
                    "folder",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="items",
                        to="artifacts.galleryfolder",
                        verbose_name="Раздел",
                    ),
                ),
                (
                    "image",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.PROTECT,
                        related_name="media_archive_items",
                        to="shared.image",
                        verbose_name="Изображение",
                    ),
                ),
            ],
            options={
                "verbose_name": "Элемент фотоархива",
                "verbose_name_plural": "Элементы фотоархива",
                "ordering": ["display_order", "id"],
            },
        ),
    ]
