"""
Сервис для работы с GigaChat через прямые HTTP-запросы.
"""

import os
import time
import uuid
import base64
from typing import List, Dict, Optional
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
import environ
import requests
import urllib3

# Отключаем предупреждения о небезопасных запросах
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

env = environ.Env()

# Получение credentials из переменных окружения
GIGACHAT_AUTH_KEY = env('GIGACHAT_AUTH_KEY', default='')
GIGACHAT_SCOPE = env('SCOPE', default='GIGACHAT_API_PERS')
GIGACHAT_VERIFY_SSL_CERTS = env.bool('GIGACHAT_VERIFY_SSL_CERTS', default=False)

# URL для получения токена
OAUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
# URL для запросов к GigaChat API
GIGACHAT_API_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"


class MuseumLLMService:
    """Сервис для работы с LLM для музея через прямые HTTP-запросы."""
    
    def __init__(self):
        """Инициализация LLM сервиса."""
        self.auth_key = None
        self.access_token = None
        self.token_expires_at = 0
        self._initialize_auth()
    
    def _initialize_auth(self):
        """Инициализация авторизации."""
        if not GIGACHAT_AUTH_KEY:
            print("GIGACHAT_AUTH_KEY не установлен в переменных окружения.")
            return
        
        # Убираем префикс "Basic " если он есть
        self.auth_key = GIGACHAT_AUTH_KEY.strip()
        if self.auth_key.startswith('Basic '):
            self.auth_key = self.auth_key[6:].strip()
    
    def _get_access_token(self) -> Optional[str]:
        """
        Получает Access token от GigaChat OAuth API.
        Токен действует 30 минут.
        """
        # Если токен еще действителен, возвращаем его
        if self.access_token and time.time() < self.token_expires_at:
            return self.access_token
        
        if not self.auth_key:
            print("ERROR: Auth key не установлен")
            return None
        
        try:
            # Генерируем уникальный RqUID
            rquid = str(uuid.uuid4())
            
            # Формируем заголовки
            headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
                'RqUID': rquid,
                'Authorization': f'Basic {self.auth_key}'
            }
            
            # Данные для запроса
            data = {
                'scope': GIGACHAT_SCOPE
            }
            
            # Отправляем запрос на получение токена
            response = requests.post(
                OAUTH_URL,
                headers=headers,
                data=data,
                verify=GIGACHAT_VERIFY_SSL_CERTS,
                timeout=30  # Таймаут 30 секунд
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data.get('access_token')
                expires_in = token_data.get('expires_at', 1800)  # По умолчанию 30 минут
                
                # Устанавливаем время истечения токена (с запасом в 5 минут)
                self.token_expires_at = time.time() + expires_in - 300
                
                return self.access_token
            else:
                print(f"ERROR: Ошибка получения токена: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"ERROR: Исключение при получении токена: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def generate_response(
        self,
        user_message: str,
        context: str = "",
        conversation_history: Optional[List[Dict[str, str]]] = None,
        has_db_data: bool = False,
        external_context: str = ""
    ) -> str:
        """
        Генерирует ответ бота на основе сообщения пользователя и контекста.
        
        Args:
            user_message: Сообщение пользователя
            context: Контекстная информация об экспонатах, личностях и т.д. из БД
            conversation_history: История диалога в формате [{'role': 'user', 'content': '...'}, ...]
            has_db_data: Флаг, указывающий, есть ли данные в БД
            external_context: Внешний контекст (если данных в БД нет)
        
        Returns:
            Ответ бота
        """
        # Получаем токен доступа
        access_token = self._get_access_token()
        if not access_token:
            return "Извините, проблема с авторизацией. Обратитесь к администратору."
        
        try:
            from .prompts import get_chat_prompt
            
            # Формируем системный промпт с контекстом
            system_prompt = get_chat_prompt(context, has_db_data=has_db_data, external_context=external_context)
            
            # Формируем сообщения для API
            messages = [
                {
                    "role": "system",
                    "content": system_prompt
                }
            ]
            
            # Добавляем историю диалога
            if conversation_history:
                for msg in conversation_history[-10:]:  # Берем последние 10 сообщений
                    role = msg.get('role', 'user')
                    content = msg.get('content', '')
                    if role == 'user':
                        messages.append({"role": "user", "content": content})
                    elif role in ('bot', 'assistant'):
                        messages.append({"role": "assistant", "content": content})
            
            # Добавляем текущее сообщение пользователя
            messages.append({"role": "user", "content": user_message})
            
            # Формируем запрос к API
            # Снижаем temperature для более точных ответов, особенно при наличии данных из БД
            temperature = 0.3 if has_db_data else 0.7
            payload = {
                "model": "GigaChat",
                "messages": messages,
                "temperature": temperature,
                "max_tokens": 2000
            }
            
            headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': f'Bearer {access_token}'
            }
            
            # Отправляем запрос к GigaChat API с таймаутом
            response = requests.post(
                GIGACHAT_API_URL,
                headers=headers,
                json=payload,
                verify=GIGACHAT_VERIFY_SSL_CERTS,
                timeout=60  # Таймаут 60 секунд для генерации ответа
            )
            
            if response.status_code == 200:
                response_data = response.json()
                
                # Извлекаем ответ из структуры ответа GigaChat
                choices = response_data.get('choices', [])
                if choices and len(choices) > 0:
                    message = choices[0].get('message', {})
                    content = message.get('content', '')
                    
                    if content:
                        # Убираем лишние пробелы и переносы
                        content = content.strip()
                        
                        # Исправляем неправильные ссылки и форматы
                        import re
                        
                        # КРИТИЧЕСКИ ВАЖНО: Сначала исправляем ссылки без текста в квадратных скобках
                        # Паттерн: текст [/historical-figures/6] -> [текст](/historical_figures/6)
                        def fix_bare_link(match):
                            text = match.group(1).strip()
                            link = match.group(2)
                            # Исправляем формат ссылки
                            link = re.sub(r'/historical-figures/(\d+)', r'/historical_figures/\1', link)
                            link = re.sub(r'/artifacts/(\d+)', r'/artifact/\1', link)
                            return f'[{text}]({link})'
                        
                        # Исправляем ссылки типа: "Говорков Алексей Сергеевич [/historical-figures/6]"
                        # Берем последние слова (имя или название) перед ссылкой как текст ссылки
                        # Ищем паттерн: слова (минимум 2 слова или одно длинное слово), затем пробел, затем [/link]
                        content = re.sub(r'([А-Яа-яёЁA-Za-z]{2,}(?:\s+[А-Яа-яёЁA-Za-z]{2,}){0,3}?)\s+\[(/[^\]]+)\]', fix_bare_link, content)
                        
                        # Также исправляем если ссылка идет сразу после текста без пробела
                        content = re.sub(r'([А-Яа-яёЁA-Za-z]{2,})\[(/[^\]]+)\]', fix_bare_link, content)
                        
                        # Исправляем неправильные форматы в ссылках Markdown
                        # /historical-figures/ -> /historical_figures/ в ссылках
                        content = re.sub(r'\[([^\]]+)\]\(/historical-figures/(\d+)\)', r'[\1](/historical_figures/\2)', content)
                        # /artifacts/ -> /artifact/ в ссылках
                        content = re.sub(r'\[([^\]]+)\]\(/artifacts/(\d+)\)', r'[\1](/artifact/\2)', content)
                        
                        # Исправляем ссылки в скобках после текста: текст ([/link]) -> [текст](/link)
                        def fix_brackets_link(match):
                            text = match.group(1).strip()
                            link = match.group(2)
                            # Исправляем формат ссылки
                            link = re.sub(r'/historical-figures/(\d+)', r'/historical_figures/\1', link)
                            link = re.sub(r'/artifacts/(\d+)', r'/artifact/\1', link)
                            return f'[{text}]({link})'
                        
                        content = re.sub(r'([А-Яа-яёЁA-Za-z\s]+)\s*\(\[(/[^\]]+)\]\)', fix_brackets_link, content)
                        
                        # Исправляем ссылки в скобках без квадратных скобок: текст (/link) -> [текст](/link)
                        def fix_parentheses_link(match):
                            text = match.group(1).strip()
                            link = match.group(2)
                            # Исправляем формат ссылки
                            link = re.sub(r'/historical-figures/(\d+)', r'/historical_figures/\1', link)
                            link = re.sub(r'/artifacts/(\d+)', r'/artifact/\1', link)
                            return f'[{text}]({link})'
                        
                        # Исправляем только если это не уже правильная ссылка Markdown
                        content = re.sub(r'([А-Яа-яёЁA-Za-z\s]+)\s*\((/[^)]+)\)(?!\])', fix_parentheses_link, content)
                        
                        # Удаляем ссылки без текста: [/], [/halls], [/artifacts] и т.д.
                        content = re.sub(r'\s*\[/\]\s*', ' ', content)
                        content = re.sub(r'\s*\[/halls\]\s*', ' ', content)
                        content = re.sub(r'\s*\[/artifacts\]\s*', ' ', content)
                        content = re.sub(r'\s*\[/historical-figures\]\s*', ' ', content)
                        content = re.sub(r'\s*\[/historical_figures\]\s*', ' ', content)
                        
                        # Удаляем ссылки с пустым текстом: [](/link)
                        content = re.sub(r'\[\]\(/[^)]+\)', '', content)
                        
                        # Удаляем ссылки только с слэшем: [/link] без квадратных скобок с текстом
                        content = re.sub(r'\s+\[/[^\]]+\]\s+', ' ', content)
                        
                        # Исправляем неполные ответы, которые обрываются на " - это..." или подобных фразах
                        # Если ответ заканчивается на незавершенную фразу, удаляем её
                        content = re.sub(r'\s+-\s+это\.\.\.?\s*$', '', content, flags=re.IGNORECASE)
                        content = re.sub(r'\s+-\s+это\s*$', '.', content, flags=re.IGNORECASE)
                        
                        # Если ответ слишком короткий или похож на список, добавляем пояснение
                        if len(content) < 50 and '\n' in content:
                            content = f"Вот информация, которую я нашел:\n\n{content}\n\nМогу рассказать подробнее о любом из этих объектов. О чем именно вы хотите узнать?"
                        
                        return content
                    else:
                        print(f"WARNING: Пустой ответ от GigaChat: {response_data}")
                        return "Извините, не удалось получить ответ. Пожалуйста, попробуйте еще раз."
                else:
                    print(f"WARNING: Нет choices в ответе: {response_data}")
                    return "Извините, не удалось получить ответ. Пожалуйста, попробуйте еще раз."
            else:
                error_msg = f"Ошибка API: {response.status_code} - {response.text}"
                print(f"ERROR: {error_msg}")
                
                # Если токен истек, пробуем получить новый и повторить запрос
                if response.status_code == 401:
                    self.access_token = None
                    self.token_expires_at = 0
                    access_token = self._get_access_token()
                    
                    if access_token:
                        headers['Authorization'] = f'Bearer {access_token}'
                        retry_response = requests.post(
                            GIGACHAT_API_URL,
                            headers=headers,
                            json=payload,
                            verify=GIGACHAT_VERIFY_SSL_CERTS,
                            timeout=60
                        )
                        
                        if retry_response.status_code == 200:
                            response_data = retry_response.json()
                            choices = response_data.get('choices', [])
                            if choices and len(choices) > 0:
                                message = choices[0].get('message', {})
                                content = message.get('content', '')
                                if content:
                                    return content.strip()
                
                return "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз."
            
        except requests.exceptions.Timeout:
            print("ERROR: Таймаут при запросе к GigaChat API")
            return "Извините, запрос занял слишком много времени. Пожалуйста, попробуйте еще раз."
        except requests.exceptions.RequestException as e:
            error_msg = str(e)
            print(f"ERROR: Ошибка при запросе к GigaChat API: {error_msg}")
            import traceback
            traceback.print_exc()
            
            # Более понятное сообщение об ошибке для пользователя
            if 'SSL' in error_msg or 'certificate' in error_msg.lower():
                return "Извините, возникла проблема с подключением к сервису. Пожалуйста, попробуйте еще раз через несколько секунд."
            else:
                return "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз."
        except Exception as e:
            error_msg = str(e)
            print(f"ERROR: Неожиданная ошибка: {error_msg}")
            import traceback
            traceback.print_exc()
            return "Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз."


# Глобальный экземпляр сервиса
_llm_service = None


def get_llm_service() -> MuseumLLMService:
    """Получить глобальный экземпляр LLM сервиса."""
    global _llm_service
    if _llm_service is None:
        _llm_service = MuseumLLMService()
    return _llm_service
