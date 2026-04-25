from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User, Group
from django.utils.html import format_html


# Настройка заголовков админ-панели
admin.site.site_header = "Музей вычислительной техники ИрНИТУ"
admin.site.site_title = "Музей вычислительной техники ИрНИТУ"
admin.site.index_title = "Панель управления"


class CustomUserAdmin(UserAdmin):
    """Кастомная админ-панель для пользователей."""
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser', 'date_joined')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'date_joined', 'groups')
    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Персональная информация', {'fields': ('first_name', 'last_name', 'email')}),
        ('Права доступа', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'),
        }),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )


class CustomGroupAdmin(admin.ModelAdmin):
    """Кастомная админ-панель для групп."""
    list_display = ('name', 'get_user_count')
    search_fields = ('name',)
    filter_horizontal = ('permissions',)
    
    def get_user_count(self, obj):
        """Возвращает количество пользователей в группе."""
        return obj.user_set.count()
    get_user_count.short_description = 'Количество пользователей'


# Перерегистрируем стандартные модели с кастомными админ-панелями
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

admin.site.unregister(Group)
admin.site.register(Group, CustomGroupAdmin)

