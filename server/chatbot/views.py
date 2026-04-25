"""
Views для API чата с виртуальным ассистентом.
"""

import uuid
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from .models import ChatSession, ChatMessage
from .serializers import (
    ChatRequestSerializer,
    ChatResponseSerializer,
    ChatSessionSerializer,
    ChatMessageSerializer
)
from .llm_service import get_llm_service
from .search_service import get_search_service


class ChatViewSet(viewsets.ViewSet):
    """ViewSet для работы с чатом."""
    permission_classes = [AllowAny]  # Разрешаем анонимный доступ
    
    @action(detail=False, methods=['post'], url_path='message')
    def send_message(self, request):
        """
        Отправка сообщения в чат и получение ответа от бота.
        
        POST /api/chatbot/message/
        {
            "message": "Расскажи об экспонатах музея",
            "session_id": "optional-session-id"
        }
        """
        serializer = ChatRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
        
        user_message = serializer.validated_data['message']
        session_id = serializer.validated_data.get('session_id')
        
        # Получаем или создаем сессию
        if session_id:
            session, created = ChatSession.objects.get_or_create(
                session_id=session_id
            )
        else:
            # Создаем новую сессию
            session_id = str(uuid.uuid4())
            session = ChatSession.objects.create(session_id=session_id)
        
        # Сохраняем сообщение пользователя
        user_msg = ChatMessage.objects.create(
            session=session,
            role='user',
            content=user_message
        )
        
        # Получаем контекст из базы данных
        search_service = get_search_service()
        context, has_db_data = search_service.get_relevant_context(user_message)
        
        # Если данных в БД нет, получаем внешний контекст с привязкой к ИрНИТУ
        external_context = ""
        if not has_db_data:
            external_context = self._get_external_context(user_message)
        
        # Получаем историю диалога
        previous_messages = ChatMessage.objects.filter(
            session=session
        ).exclude(id=user_msg.id).order_by('created_at')
        
        conversation_history = [
            {
                'role': msg.role,
                'content': msg.content
            }
            for msg in previous_messages
        ]
        
        # Генерируем ответ от бота
        llm_service = get_llm_service()
        bot_response = llm_service.generate_response(
            user_message=user_message,
            context=context,
            conversation_history=conversation_history,
            has_db_data=has_db_data,
            external_context=external_context
        )
        
        # Сохраняем ответ бота
        bot_msg = ChatMessage.objects.create(
            session=session,
            role='bot',
            content=bot_response
        )
        
        # Извлекаем ссылки из ответа (экспонаты и личности, упомянутые в контексте)
        # Используем оригинальный контекст для извлечения ссылок
        links = self._extract_links(user_message)
        
        # Формируем ответ
        response_data = {
            'message': bot_response,
            'session_id': session_id,
            'links': links
        }
        
        response_serializer = ChatResponseSerializer(data=response_data)
        response_serializer.is_valid(raise_exception=True)
        
        return Response(response_serializer.validated_data, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'], url_path='session/(?P<session_id>[^/.]+)')
    def get_session(self, request, session_id=None):
        """
        Получение истории диалога по ID сессии.
        
        GET /api/chatbot/session/{session_id}/
        """
        try:
            session = ChatSession.objects.get(session_id=session_id)
            serializer = ChatSessionSerializer(session)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ChatSession.DoesNotExist:
            return Response(
                {'error': 'Сессия не найдена'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['post'], url_path='session')
    def create_session(self, request):
        """
        Создание новой сессии чата.
        
        POST /api/chatbot/session/
        """
        session_id = str(uuid.uuid4())
        session = ChatSession.objects.create(session_id=session_id)
        serializer = ChatSessionSerializer(session)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    def _extract_links(self, user_message: str) -> list:
        """
        Извлекает ссылки на экспонаты и личности из результатов поиска.
        
        Args:
            user_message: Сообщение пользователя
        
        Returns:
            Список ссылок в формате [{'type': 'artifact', 'id': 1, 'name': '...', 'url': '...'}, ...]
        """
        links = []
        
        # Получаем релевантные экспонаты и личности
        search_service = get_search_service()
        artifacts = search_service.search_artifacts(user_message, limit=3)
        figures = search_service.search_historical_figures(user_message, limit=3)
        
        for artifact in artifacts:
            links.append({
                'type': 'artifact',
                'id': artifact.get('id'),
                'name': artifact.get('name'),
                'url': f"/artifact/{artifact.get('id')}"
            })
        
        for figure in figures:
            full_name = f"{figure.get('last_name', '')} {figure.get('first_name', '')} {figure.get('middle_name', '')}".strip()
            links.append({
                'type': 'historical_figure',
                'id': figure.get('id'),
                'name': full_name,
                'url': f"/historical_figures/{figure.get('id')}"
            })
        
        return links
    
    def _get_external_context(self, user_message: str) -> str:
        """
        Получает внешний контекст через GigaChat с привязкой к ИрНИТУ.
        Используется, когда данных в БД нет.
        
        Args:
            user_message: Сообщение пользователя
        
        Returns:
            Строка с внешним контекстом
        """
        try:
            llm_service = get_llm_service()
            access_token = llm_service._get_access_token()
            if not access_token:
                return ""
            
            # Формируем запрос для получения информации с привязкой к ИрНИТУ
            search_prompt = f"""Найди информацию о следующем запросе, но ТОЛЬКО если это связано с ИрНИТУ (Иркутский национальный исследовательский технический университет), его деятелями, преподавателями, выпускниками или историей университета.

Запрос: {user_message}

ВАЖНО:
- Если запрос НЕ связан с ИрНИТУ, верни пустой ответ
- Если связан с ИрНИТУ, предоставь краткую релевантную информацию
- Фокусируйся на конкретных фактах о людях, связанных с ИрНИТУ
- Если информации о связи с ИрНИТУ нет, верни пустой ответ

Ответ (только если есть связь с ИрНИТУ):"""
            
            import requests
            import urllib3
            urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
            
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
            
            payload = {
                "model": "GigaChat",
                "messages": [
                    {"role": "user", "content": search_prompt}
                ],
                "temperature": 0.5,
                "max_tokens": 500
            }
            
            response = requests.post(
                "https://gigachat.devices.sberbank.ru/api/v1/chat/completions",
                headers=headers,
                json=payload,
                verify=llm_service._get_access_token() is not None,  # Используем настройку из llm_service
                timeout=30
            )
            
            if response.status_code == 200:
                response_data = response.json()
                choices = response_data.get('choices', [])
                if choices and len(choices) > 0:
                    message = choices[0].get('message', {})
                    content = message.get('content', '').strip()
                    # Если ответ пустой или слишком короткий, возвращаем пустую строку
                    if content and len(content) > 20:
                        return content
            
            return ""
        except Exception as e:
            print(f"ERROR: Ошибка при получении внешнего контекста: {e}")
            return ""
