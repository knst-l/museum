from django.db import models
from shared.models import TimeStampedModel, Image, Model3D


class HallCategory(TimeStampedModel):
    """Модель категории зала."""
    name = models.CharField(
        max_length=255,
        verbose_name="Название категории"
    )

    class Meta:
        verbose_name = "Категория зала"
        verbose_name_plural = "Категории залов"
        ordering = ['name']

    def __str__(self):
        return self.name


class Hall(TimeStampedModel):
    """Модель зала музея."""
    name = models.CharField(
        max_length=255,
        verbose_name="Название зала"
    )
    image = models.ForeignKey(
        Image, 
        on_delete=models.PROTECT,
        verbose_name="Изображение зала"
    )
    category = models.ForeignKey(
        HallCategory, 
        on_delete=models.PROTECT,
        verbose_name="Категория зала"
    )

    class Meta:
        verbose_name = "Зал"
        verbose_name_plural = "Залы"
        ordering = ['name']

    def __str__(self):
        return self.name


class ArtifactCategory(TimeStampedModel):
    """Модель категории артефакта."""
    name = models.CharField(
        max_length=255,
        verbose_name="Название категории"
    )

    class Meta:
        verbose_name = "Категория артефакта"
        verbose_name_plural = "Категории артефактов"
        ordering = ['name']

    def __str__(self):
        return self.name


class Artifact(TimeStampedModel):
    """Модель артефакта."""
    name = models.CharField(
        max_length=255,
        verbose_name="Название артефакта"
    )
    description = models.TextField(
        verbose_name="Описание артефакта"
    )
    creation_year = models.IntegerField(
        verbose_name="Год создания"
    )
    category = models.ForeignKey(
        ArtifactCategory, 
        on_delete=models.PROTECT,
        verbose_name="Категория артефакта"
    )
    hall = models.ForeignKey(
        Hall, 
        on_delete=models.PROTECT,
        verbose_name="Зал"
    )
    model_3d = models.ForeignKey(
        Model3D, 
        null=True, 
        blank=True, 
        on_delete=models.SET_NULL,
        verbose_name="3D модель"
    )
    images = models.ManyToManyField(
        Image, 
        related_name='artifacts', 
        blank=True,
        verbose_name="Изображения"
    )
    # Связь с историческими личностями будет добавлена после создания модели HistoricalFigure

    class Meta:
        verbose_name = "Артефакт"
        verbose_name_plural = "Артефакты"
        ordering = ['name']

    def __str__(self):
        return self.name