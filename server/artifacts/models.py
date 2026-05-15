from django.db import models

from shared.models import Image, Model3D, TimeStampedModel


class HallCategory(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Название категории")

    class Meta:
        verbose_name = "Категория зала"
        verbose_name_plural = "Категории залов"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Hall(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Название зала")
    image = models.ForeignKey(Image, on_delete=models.PROTECT, verbose_name="Изображение зала")
    category = models.ForeignKey(HallCategory, on_delete=models.PROTECT, verbose_name="Категория зала")

    class Meta:
        verbose_name = "Зал"
        verbose_name_plural = "Залы"
        ordering = ["name"]

    def __str__(self):
        return self.name


class ArtifactCategory(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Название категории")

    class Meta:
        verbose_name = "Категория артефакта"
        verbose_name_plural = "Категории артефактов"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Artifact(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Название артефакта")
    description = models.TextField(verbose_name="Описание артефакта")
    creation_year = models.IntegerField(verbose_name="Год создания")
    category = models.ForeignKey(ArtifactCategory, on_delete=models.PROTECT, verbose_name="Категория артефакта")
    hall = models.ForeignKey(Hall, on_delete=models.PROTECT, verbose_name="Зал")
    model_3d = models.ForeignKey(
        Model3D,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        verbose_name="3D модель",
    )
    images = models.ManyToManyField(Image, related_name="artifacts", blank=True, verbose_name="Изображения")
    primary_image = models.ForeignKey(
        Image,
        related_name="artifacts_primary",
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        verbose_name="Главное изображение",
    )

    class Meta:
        verbose_name = "Артефакт"
        verbose_name_plural = "Артефакты"
        ordering = ["name"]

    def __str__(self):
        return self.name


class GalleryFolder(TimeStampedModel):
    name = models.CharField(max_length=255, verbose_name="Название раздела")
    description = models.TextField(blank=True, default="", verbose_name="Описание раздела")
    display_order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_published = models.BooleanField(default=True, verbose_name="Опубликовано")

    class Meta:
        verbose_name = "Раздел фотоархива"
        verbose_name_plural = "Разделы фотоархива"
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.name


class MediaArchiveItem(TimeStampedModel):
    title = models.CharField(max_length=255, verbose_name="Название")
    year_label = models.CharField(max_length=64, blank=True, default="", verbose_name="Год или период")
    description = models.TextField(blank=True, default="", verbose_name="Описание")
    image = models.ForeignKey(
        Image,
        on_delete=models.PROTECT,
        related_name="media_archive_items",
        verbose_name="Изображение",
    )
    folder = models.ForeignKey(
        GalleryFolder,
        on_delete=models.CASCADE,
        related_name="items",
        verbose_name="Раздел",
    )
    display_order = models.PositiveIntegerField(default=0, verbose_name="Порядок отображения")
    is_published = models.BooleanField(default=True, verbose_name="Опубликовано")

    class Meta:
        verbose_name = "Элемент фотоархива"
        verbose_name_plural = "Элементы фотоархива"
        ordering = ["display_order", "id"]

    def __str__(self):
        return self.title
