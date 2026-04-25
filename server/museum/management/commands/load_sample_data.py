from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from shared.models import Image, Model3D
from historical_figures.models import ScienceField, HistoricalFigure
from artifacts.models import HallCategory, Hall, ArtifactCategory, Artifact


class Command(BaseCommand):
    help = 'Загружает примеры данных для тестирования'

    def handle(self, *args, **options):
        self.stdout.write('Загрузка примеров данных...')

        # Создаем области науки
        computer_science, _ = ScienceField.objects.get_or_create(
            name='Информатика'
        )
        mathematics, _ = ScienceField.objects.get_or_create(
            name='Математика'
        )
        physics, _ = ScienceField.objects.get_or_create(
            name='Физика'
        )

        # Создаем изображения (без файлов, только описания)
        image1, _ = Image.objects.get_or_create(
            description='Портрет Алана Тьюринга'
        )
        image2, _ = Image.objects.get_or_create(
            description='Портрет Чарльза Бэббиджа'
        )

        # Создаем 3D модели (без файлов, только описания)
        model3d1, _ = Model3D.objects.get_or_create(
            description='3D модель аналитической машины Бэббиджа'
        )

        # Создаем категории залов
        hall_category1, _ = HallCategory.objects.get_or_create(
            name='История вычислительной техники'
        )
        hall_category2, _ = HallCategory.objects.get_or_create(
            name='Современные компьютеры'
        )

        # Создаем залы
        hall1, _ = Hall.objects.get_or_create(
            name='Зал пионеров информатики',
            category=hall_category1,
            image=image1
        )
        hall2, _ = Hall.objects.get_or_create(
            name='Зал современных технологий',
            category=hall_category2,
            image=image2
        )

        # Создаем категории артефактов
        artifact_category1, _ = ArtifactCategory.objects.get_or_create(
            name='Вычислительные машины'
        )
        artifact_category2, _ = ArtifactCategory.objects.get_or_create(
            name='Персональные компьютеры'
        )

        # Создаем исторические личности
        turing, _ = HistoricalFigure.objects.get_or_create(
            last_name='Тьюринг',
            first_name='Алан',
            middle_name='Мэтисон',
            birth_date='1912-06-23',
            death_date='1954-06-07',
            description='Британский математик, логик, криптограф и информатик',
            biography='Алан Тьюринг - один из основоположников информатики и искусственного интеллекта. Разработал концепцию машины Тьюринга и внес значительный вклад в расшифровку кода "Энигма" во время Второй мировой войны.'
        )
        turing.science_fields.add(computer_science, mathematics)

        babbage, _ = HistoricalFigure.objects.get_or_create(
            last_name='Бэббидж',
            first_name='Чарльз',
            middle_name='',
            birth_date='1791-12-26',
            death_date='1871-10-18',
            description='Английский математик, изобретатель первой аналитической машины',
            biography='Чарльз Бэббидж - английский математик и изобретатель, создатель концепции программируемого компьютера. Разработал разностную машину и аналитическую машину - предшественников современных компьютеров.'
        )
        babbage.science_fields.add(mathematics, computer_science)

        # Создаем артефакты
        artifact1, _ = Artifact.objects.get_or_create(
            name='Аналитическая машина Бэббиджа',
            description='Первая в истории концепция программируемого компьютера',
            creation_year=1837,
            category=artifact_category1,
            hall=hall1,
            model_3d=model3d1
        )
        artifact1.historical_figures.add(babbage)

        artifact2, _ = Artifact.objects.get_or_create(
            name='Машина Тьюринга',
            description='Теоретическая модель вычислительной машины',
            creation_year=1936,
            category=artifact_category1,
            hall=hall1
        )
        artifact2.historical_figures.add(turing)

        self.stdout.write(
            self.style.SUCCESS('Примеры данных успешно загружены!')
        )
        self.stdout.write(f'Создано:')
        self.stdout.write(f'- Областей науки: {ScienceField.objects.count()}')
        self.stdout.write(f'- Исторических личностей: {HistoricalFigure.objects.count()}')
        self.stdout.write(f'- Залов: {Hall.objects.count()}')
        self.stdout.write(f'- Артефактов: {Artifact.objects.count()}')
        self.stdout.write(f'- Изображений: {Image.objects.count()}')
        self.stdout.write(f'- 3D моделей: {Model3D.objects.count()}')

