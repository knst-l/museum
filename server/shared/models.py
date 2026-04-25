from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator
from django.db import models


class TimeStampedModel(models.Model):
    """Abstract model with created/updated timestamps."""
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class Image(TimeStampedModel):
    """Model for uploaded images."""
    image = models.ImageField(
        upload_to='images/',
        verbose_name="Изображение",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'])]
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Описание изображения"
    )
    focus_x = models.PositiveSmallIntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Фокус по горизонтали",
        help_text="0 - левый край, 50 - центр, 100 - правый край."
    )
    focus_y = models.PositiveSmallIntegerField(
        default=50,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="Фокус по вертикали",
        help_text="0 - верх, 50 - центр, 100 - низ."
    )

    @property
    def object_position(self):
        return f"{self.focus_x}% {self.focus_y}%"

    class Meta:
        verbose_name = "Изображение"
        verbose_name_plural = "Изображения"
        ordering = ['-created_at']

    def __str__(self):
        return self.image.name if self.image else "Без изображения"


class Model3D(TimeStampedModel):
    """Model for uploaded 3D files."""
    model = models.FileField(
        upload_to='models3d/',
        verbose_name="3D модель",
        blank=True,
        null=True,
        validators=[FileExtensionValidator(allowed_extensions=['glb', 'gltf'])]
    )
    description = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Описание 3D модели"
    )

    class Meta:
        verbose_name = "3D модель"
        verbose_name_plural = "3D модели"
        ordering = ['-created_at']

    def __str__(self):
        return self.model.name if self.model else "Без модели"
