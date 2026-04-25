from django.db import models
from shared.models import TimeStampedModel, Image


class ScienceField(TimeStampedModel):
    """Модель области науки."""
    name = models.CharField(
        max_length=255, 
        unique=True,
        verbose_name="Название области науки"
    )

    class Meta:
        verbose_name = "Область науки"
        verbose_name_plural = "Области науки"
        ordering = ['name']

    def __str__(self):
        return self.name


class HistoricalFigure(TimeStampedModel):
    """Модель исторической личности."""
    last_name = models.CharField(
        max_length=255,
        verbose_name="Фамилия"
    )
    first_name = models.CharField(
        max_length=255,
        verbose_name="Имя"
    )
    middle_name = models.CharField(
        max_length=255,
        verbose_name="Отчество"
    )
    birth_date = models.DateField(
        verbose_name="Дата рождения"
    )
    death_date = models.DateField(
        blank=True, 
        null=True,
        verbose_name="Дата смерти"
    )
    description = models.TextField(
        verbose_name="Краткое описание"
    )
    biography = models.TextField(
        verbose_name="Биография"
    )
    science_fields = models.ManyToManyField(
        ScienceField, 
        related_name='historical_figures',
        verbose_name="Области науки"
    )
    images = models.ManyToManyField(
        Image, 
        related_name='historical_figures', 
        blank=True,
        verbose_name="Изображения"
    )
    artifacts = models.ManyToManyField(
        'artifacts.Artifact', 
        related_name='historical_figures', 
        blank=True,
        verbose_name="Артефакты"
    )

    class Meta:
        verbose_name = "Историческая личность"
        verbose_name_plural = "Исторические личности"
        ordering = ['last_name', 'first_name']

    def __str__(self):
        return f"{self.last_name} {self.first_name}"

    @property
    def full_name(self):
        """Возвращает полное имя исторической личности."""
        return f"{self.last_name} {self.first_name} {self.middle_name}".strip()