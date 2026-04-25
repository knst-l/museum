from rest_framework import serializers
from .models import ChatSession, ChatMessage


class ChatMessageSerializer(serializers.ModelSerializer):
    """Сериализатор для сообщений чата."""
    
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']


class ChatSessionSerializer(serializers.ModelSerializer):
    """Сериализатор для сессии чата."""
    messages = ChatMessageSerializer(many=True, read_only=True)
    
    class Meta:
        model = ChatSession
        fields = ['id', 'session_id', 'created_at', 'updated_at', 'messages']
        read_only_fields = ['id', 'created_at', 'updated_at']


class ChatRequestSerializer(serializers.Serializer):
    """Сериализатор для запроса в чат."""
    message = serializers.CharField(required=True, help_text="Сообщение пользователя", allow_blank=False)
    session_id = serializers.CharField(required=False, allow_blank=True, allow_null=True, help_text="ID сессии (необязательно)")
    
    def validate_message(self, value):
        """Проверка сообщения."""
        if not value or not value.strip():
            raise serializers.ValidationError("Сообщение не может быть пустым")
        return value.strip()
    
    def validate_session_id(self, value):
        """Проверка session_id."""
        if value:
            return value.strip()
        return None


class ChatResponseSerializer(serializers.Serializer):
    """Сериализатор для ответа чата."""
    message = serializers.CharField(help_text="Ответ бота")
    session_id = serializers.CharField(help_text="ID сессии")
    links = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        help_text="Ссылки на экспонаты/личности, упомянутые в ответе"
    )
