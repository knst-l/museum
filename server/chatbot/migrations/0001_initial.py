# Generated manually for chatbot app

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='ChatSession',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('session_id', models.CharField(max_length=255, unique=True, verbose_name='ID сессии')),
            ],
            options={
                'verbose_name': 'Сессия чата',
                'verbose_name_plural': 'Сессии чата',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='ChatMessage',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('role', models.CharField(choices=[('user', 'Пользователь'), ('bot', 'Бот'), ('system', 'Система')], max_length=10, verbose_name='Роль')),
                ('content', models.TextField(verbose_name='Содержание сообщения')),
                ('session', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chatbot.chatsession', verbose_name='Сессия')),
            ],
            options={
                'verbose_name': 'Сообщение чата',
                'verbose_name_plural': 'Сообщения чата',
                'ordering': ['created_at'],
            },
        ),
    ]
