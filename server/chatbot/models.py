from django.db import models
from shared.models import TimeStampedModel


class ChatSession(TimeStampedModel):
    """Модель для хранения сессии чата."""
    session_id = models.CharField(
        max_length=255,
        unique=True,
        verbose_name="ID сессии"
    )
    
    class Meta:
        verbose_name = "Сессия чата"
        verbose_name_plural = "Сессии чата"
        ordering = ['-created_at']

    def __str__(self):
        return f"Сессия {self.session_id}"


class ChatMessage(TimeStampedModel):
    """Модель для хранения сообщений чата."""
    ROLE_CHOICES = [
        ('user', 'Пользователь'),
        ('bot', 'Бот'),
        ('system', 'Система'),
    ]
    
    session = models.ForeignKey(
        ChatSession,
        on_delete=models.CASCADE,
        related_name='messages',
        verbose_name="Сессия"
    )
    role = models.CharField(
        max_length=10,
        choices=ROLE_CHOICES,
        verbose_name="Роль"
    )
    content = models.TextField(
        verbose_name="Содержание сообщения"
    )
    
    class Meta:
        verbose_name = "Сообщение чата"
        verbose_name_plural = "Сообщения чата"
        ordering = ['created_at']

    def __str__(self):
        return f"{self.get_role_display()}: {self.content[:50]}"
