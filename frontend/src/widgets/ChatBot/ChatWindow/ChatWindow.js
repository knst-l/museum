import React, { useState, useRef, useEffect } from 'react';
import Styles from './ChatWindow.module.css';
import { apiClient } from '../../../shared/const/api';

export function ChatWindow({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: 'Здравствуйте! 👋 Я ваш цифровой гид по Музею вычислительной техники ИрНИТУ. Могу рассказать об экспонатах, исторических личностях, экскурсиях и ответить на ваши вопросы. С чего начнём?',
      sender: 'bot',
      timestamp: new Date(),
      links: [],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Фокус на поле ввода при открытии
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen, messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessageText = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    // Добавляем сообщение пользователя
    const userMessage = {
      id: Date.now(),
      text: userMessageText,
      sender: 'user',
      timestamp: new Date(),
      links: [],
    };

    setMessages((prev) => [...prev, userMessage]);

    try {
      // Отправляем запрос к API
      const requestData = {
        message: userMessageText,
      };
      
      // Добавляем session_id только если он есть
      if (sessionId) {
        requestData.session_id = sessionId;
      }
      
      console.log('Sending request:', requestData);
      const response = await apiClient.post('/chatbot/message/', requestData);

      const { message: botResponse, session_id: newSessionId, links = [] } = response.data;

      // Сохраняем session_id
      if (newSessionId && newSessionId !== sessionId) {
        setSessionId(newSessionId);
      }

      // Добавляем ответ бота
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date(),
        links: links,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      // Добавляем сообщение об ошибке с деталями
      let errorText = 'Извините, произошла ошибка при обработке вашего запроса. Пожалуйста, попробуйте еще раз.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          const errorMessages = Object.values(errorData).flat();
          if (errorMessages.length > 0) {
            errorText = `Ошибка: ${errorMessages.join(', ')}`;
          }
        } else if (typeof errorData === 'string') {
          errorText = `Ошибка: ${errorData}`;
        }
      }
      
      const errorMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: 'bot',
        timestamp: new Date(),
        links: [],
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMessage = (text) => {
    if (!text) return '';
    
    // Экранируем HTML для безопасности
    const escapeHtml = (str) => {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    // Сначала обрабатываем ссылки в формате [текст](/url) ДО экранирования
    // Это позволяет правильно обработать ссылки
    let formatted = text;
    
    // Обрабатываем ссылки в формате [текст](/url)
    formatted = formatted.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      (match, linkText, linkUrl) => {
        // Исправляем неправильные форматы ссылок
        let correctedUrl = linkUrl;
        // Исправляем /historical-figures/ на /historical_figures/
        correctedUrl = correctedUrl.replace(/\/historical-figures\//g, '/historical_figures/');
        // Исправляем /artifacts/ на /artifact/
        correctedUrl = correctedUrl.replace(/\/artifacts\/(\d+)/g, '/artifact/$1');
        
        // Экранируем текст ссылки и URL
        const escapedText = escapeHtml(linkText);
        const escapedUrl = escapeHtml(correctedUrl);
        
        return `<a href="${escapedUrl}" class="${Styles.InlineLink}" onclick="event.preventDefault(); window.location.href='${escapedUrl}'; return false;">${escapedText}</a>`;
      }
    );
    
    // Обрабатываем ссылки без текста в квадратных скобках: текст [/url]
    // Находим паттерн: текст [/historical-figures/6] и преобразуем в ссылку
    // Используем более широкий паттерн для захвата текста перед ссылкой
    formatted = formatted.replace(
      /([А-Яа-яёЁA-Za-z\s]{2,}?)\s+\[(\/[^\]]+)\]/g,
      (match, linkText, linkUrl) => {
        // Пропускаем, если это уже обработанная ссылка
        if (match.includes('<a')) {
          return match;
        }
        
        // Исправляем формат ссылки
        let correctedUrl = linkUrl;
        correctedUrl = correctedUrl.replace(/\/historical-figures\//g, '/historical_figures/');
        correctedUrl = correctedUrl.replace(/\/artifacts\/(\d+)/g, '/artifact/$1');
        
        // Берем последние слова как текст ссылки (до 5 слов)
        const words = linkText.trim().split(/\s+/);
        const lastWords = words.slice(-3).join(' '); // Берем последние 3 слова
        
        const escapedText = escapeHtml(lastWords);
        const escapedUrl = escapeHtml(correctedUrl);
        
        // Заменяем только последние слова на ссылку, остальной текст оставляем
        const prefix = words.slice(0, -3).join(' ');
        const prefixText = prefix ? escapeHtml(prefix) + ' ' : '';
        
        return `${prefixText}<a href="${escapedUrl}" class="${Styles.InlineLink}" onclick="event.preventDefault(); window.location.href='${escapedUrl}'; return false;">${escapedText}</a>`;
      }
    );
    
    // Теперь экранируем весь остальной текст (но не уже обработанные ссылки)
    // Разделяем на части: ссылки и обычный текст
    const parts = formatted.split(/(<a[^>]*>.*?<\/a>)/g);
    formatted = parts.map(part => {
      // Если это уже ссылка, не экранируем
      if (part.startsWith('<a')) {
        return part;
      }
      // Иначе экранируем
      return escapeHtml(part);
    }).join('');
    
    // Заменяем переносы строк на <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Заменяем **текст** на <strong>текст</strong> (жирный)
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Заменяем *текст* на <em>текст</em> (курсив), но только если это не часть **текст**
    // Используем более простой подход без lookbehind (для совместимости)
    formatted = formatted.replace(/(^|[^*])\*([^*]+)\*([^*]|$)/g, '$1<em>$2</em>$3');
    
    return formatted;
  };

  if (!isOpen) return null;

  return (
    <div className={Styles.ChatWindow}>
      <div className={Styles.ChatHeader}>
        <div className={Styles.ChatHeaderInfo}>
          <div className={Styles.ChatHeaderAvatar}>
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z"
                fill="currentColor"
              />
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3"/>
              <path
                d="M8 10C8 8.89543 8.89543 8 10 8H14C15.1046 8 16 8.89543 16 10V14C16 15.1046 15.1046 16 14 16H10C8.89543 16 8 15.1046 8 14V10Z"
                fill="currentColor"
                opacity="0.2"
              />
            </svg>
          </div>
          <div className={Styles.ChatHeaderText}>
            <div className={Styles.ChatHeaderTitle}>Цифровой гид музея</div>
            <span className={Styles.ChatStatus}>Онлайн • Готов помочь</span>
          </div>
        </div>
        <button
          className={Styles.CloseButton}
          onClick={onClose}
          aria-label="Закрыть чат"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      <div className={Styles.ChatMessages}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`${Styles.Message} ${
              message.sender === 'user' ? Styles.UserMessage : Styles.BotMessage
            }`}
          >
            <div className={Styles.MessageContent}>
              <div dangerouslySetInnerHTML={{ __html: formatMessage(message.text) }} />
              {message.links && message.links.length > 0 && (
                <div className={Styles.MessageLinks}>
                  {message.links.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      className={Styles.MessageLink}
                      onClick={(e) => {
                        e.preventDefault();
                        // Используем window.location для навигации
                        window.location.href = link.url;
                      }}
                    >
                      {link.name}
                    </a>
                  ))}
                </div>
              )}
              <span className={Styles.MessageTime}>
                {formatTime(message.timestamp)}
              </span>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className={`${Styles.Message} ${Styles.BotMessage}`}>
            <div className={Styles.MessageContent}>
              <p className={Styles.TypingIndicator}>Бот печатает...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className={Styles.ChatInput} onSubmit={handleSendMessage}>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Введите ваше сообщение..."
          className={Styles.Input}
        />
        <button
          type="submit"
          className={Styles.SendButton}
          disabled={!inputValue.trim() || isLoading}
          aria-label="Отправить сообщение"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </form>
    </div>
  );
}

