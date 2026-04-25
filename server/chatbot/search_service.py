"""
Сервис для поиска экспонатов и исторических личностей для RAG.
"""

from typing import List, Dict, Optional
from artifacts.models import Artifact
from artifacts.serializers import ArtifactSerializer
from historical_figures.models import HistoricalFigure
from historical_figures.serializers import HistoricalFigureSerializer
from django.db.models import Q


class MuseumSearchService:
    """Сервис для поиска релевантной информации в базе данных музея."""
    
    def search_artifacts(
        self,
        query: str,
        limit: int = 5
    ) -> List[Dict]:
        """
        Поиск экспонатов по запросу.
        
        Args:
            query: Поисковый запрос
            limit: Максимальное количество результатов
        
        Returns:
            Список экспонатов в формате словарей
        """
        if not query or not query.strip():
            return []
        
        query = query.strip()
        
        # Поиск по названию, описанию, категории
        artifacts = Artifact.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__name__icontains=query) |
            Q(hall__name__icontains=query)
        ).select_related('category', 'hall', 'model_3d').prefetch_related('images')[:limit]
        
        serializer = ArtifactSerializer(artifacts, many=True, context={'request': None})
        return serializer.data
    
    def search_historical_figures(
        self,
        query: str,
        limit: int = 5
    ) -> List[Dict]:
        """
        Поиск исторических личностей по запросу.
        Приоритет: точное совпадение имени > частичное совпадение имени > поиск в биографии.
        
        Args:
            query: Поисковый запрос
            limit: Максимальное количество результатов
        
        Returns:
            Список исторических личностей в формате словарей
        """
        if not query or not query.strip():
            return []
        
        original_query = query.strip()
        query = original_query.lower()
        
        # Извлекаем ключевые слова из запроса (убираем стоп-слова)
        stop_words = {'кто', 'такой', 'такая', 'такое', 'расскажи', 'про', 'об', 'о', 'что', 'это', 'какой', 'какая', 'какое'}
        words = [w for w in query.split() if w not in stop_words and len(w) > 2]
        
        # Сначала пытаемся найти точное совпадение по полному имени
        # Ищем комбинации: ФИО, ФИ, Ф+О, только Фамилия
        figures_exact = HistoricalFigure.objects.none()
        
        # Поиск по полному имени (Фамилия Имя Отчество)
        full_name_match = HistoricalFigure.objects.filter(
            Q(last_name__iexact=words[0]) if words else Q()
        )
        if len(words) >= 2:
            full_name_match = full_name_match.filter(
                Q(first_name__iexact=words[1])
            )
        if len(words) >= 3:
            full_name_match = full_name_match.filter(
                Q(middle_name__iexact=words[2])
            )
        
        if full_name_match.exists():
            figures_exact = full_name_match
        
        # Поиск по комбинации Фамилия + Имя (точное совпадение)
        if not figures_exact.exists() and len(words) >= 2:
            figures_exact = HistoricalFigure.objects.filter(
                Q(last_name__iexact=words[0]) &
                Q(first_name__iexact=words[1])
            )
        
        # Поиск по фамилии (точное совпадение)
        if not figures_exact.exists() and words:
            figures_exact = HistoricalFigure.objects.filter(
                Q(last_name__iexact=words[0])
            )
        
        # Если нашли точное совпадение, возвращаем его
        if figures_exact.exists():
            figures = figures_exact.distinct().prefetch_related('science_fields', 'images', 'artifacts')[:limit]
            serializer = HistoricalFigureSerializer(figures, many=True, context={'request': None})
            return serializer.data
        
        # Если точного совпадения нет, ищем частичные совпадения по именам
        q_objects = Q()
        if words:
            for term in words:
                q_objects |= (
                    Q(last_name__icontains=term) |
                    Q(first_name__icontains=term) |
                    Q(middle_name__icontains=term)
                )
        
        # Также ищем по полному запросу в именах
        q_objects |= (
            Q(last_name__icontains=original_query) |
            Q(first_name__icontains=original_query) |
            Q(middle_name__icontains=original_query)
        )
        
        figures_partial = HistoricalFigure.objects.filter(q_objects).distinct()
        
        # Если нашли частичные совпадения по именам, возвращаем их
        if figures_partial.exists():
            figures = figures_partial.prefetch_related('science_fields', 'images', 'artifacts')[:limit]
            serializer = HistoricalFigureSerializer(figures, many=True, context={'request': None})
            return serializer.data
        
        # В последнюю очередь ищем в описании и биографии
        q_objects = Q()
        if words:
            for term in words:
                q_objects |= (
                    Q(description__icontains=term) |
                    Q(biography__icontains=term) |
                    Q(science_fields__name__icontains=term)
                )
        
        q_objects |= (
            Q(description__icontains=original_query) |
            Q(biography__icontains=original_query) |
            Q(science_fields__name__icontains=original_query)
        )
        
        figures = HistoricalFigure.objects.filter(q_objects).distinct().prefetch_related('science_fields', 'images', 'artifacts')[:limit]
        
        serializer = HistoricalFigureSerializer(figures, many=True, context={'request': None})
        return serializer.data
    
    def get_relevant_context(
        self,
        user_message: str,
        artifact_limit: int = 3,
        figure_limit: int = 3
    ) -> tuple[str, bool]:
        """
        Получает релевантный контекст на основе сообщения пользователя.
        
        Args:
            user_message: Сообщение пользователя
            artifact_limit: Максимум экспонатов
            figure_limit: Максимум исторических личностей
        
        Returns:
            Кортеж (форматированная строка с контекстом, флаг наличия данных в БД)
        """
        artifacts = self.search_artifacts(user_message, limit=artifact_limit)
        figures = self.search_historical_figures(user_message, limit=figure_limit)
        
        from .prompts import format_artifact_context, format_historical_figure_context
        
        context_parts = []
        has_data = False
        
        artifact_context = format_artifact_context(artifacts)
        if artifact_context:
            context_parts.append(artifact_context)
            has_data = True
        
        figure_context = format_historical_figure_context(figures)
        if figure_context:
            context_parts.append(figure_context)
            has_data = True
        
        return "\n".join(context_parts), has_data


# Глобальный экземпляр сервиса
_search_service = None


def get_search_service() -> MuseumSearchService:
    """Получить глобальный экземпляр сервиса поиска."""
    global _search_service
    if _search_service is None:
        _search_service = MuseumSearchService()
    return _search_service
