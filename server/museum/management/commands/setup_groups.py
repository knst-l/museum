from django.core.management.base import BaseCommand
from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType


class Command(BaseCommand):
    help = 'Создает группы пользователей и назначает права доступа'

    def handle(self, *args, **options):
        # Создаем группу "Администраторы"
        admin_group, created = Group.objects.get_or_create(name='Администраторы')
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Группа "Администраторы" создана')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Группа "Администраторы" уже существует')
            )

        # Получаем все права доступа для всех моделей
        content_types = ContentType.objects.all()
        permissions = Permission.objects.filter(content_type__in=content_types)
        
        # Назначаем все права группе администраторов
        admin_group.permissions.set(permissions)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Группе "Администраторы" назначено {permissions.count()} прав доступа'
            )
        )

        # Создаем группу "Редакторы" с ограниченными правами
        editor_group, created = Group.objects.get_or_create(name='Редакторы')
        
        if created:
            self.stdout.write(
                self.style.SUCCESS('Группа "Редакторы" создана')
            )
        else:
            self.stdout.write(
                self.style.WARNING('Группа "Редакторы" уже существует')
            )

        # Назначаем права на добавление, изменение и просмотр (но не удаление)
        editor_permissions = Permission.objects.filter(
            codename__in=['add_', 'change_', 'view_'],
            content_type__in=content_types
        )
        
        # Добавляем права на добавление, изменение и просмотр для всех моделей
        for content_type in content_types:
            add_perm = Permission.objects.filter(
                codename=f'add_{content_type.model}',
                content_type=content_type
            ).first()
            change_perm = Permission.objects.filter(
                codename=f'change_{content_type.model}',
                content_type=content_type
            ).first()
            view_perm = Permission.objects.filter(
                codename=f'view_{content_type.model}',
                content_type=content_type
            ).first()
            
            if add_perm:
                editor_group.permissions.add(add_perm)
            if change_perm:
                editor_group.permissions.add(change_perm)
            if view_perm:
                editor_group.permissions.add(view_perm)

        self.stdout.write(
            self.style.SUCCESS(
                f'Группе "Редакторы" назначены права на добавление, изменение и просмотр'
            )
        )

        self.stdout.write(
            self.style.SUCCESS('Настройка групп и прав доступа завершена')
        )

