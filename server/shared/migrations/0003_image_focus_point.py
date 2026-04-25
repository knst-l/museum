from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0002_remove_image_url_remove_model3d_url_image_image_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="image",
            name="focus_x",
            field=models.PositiveSmallIntegerField(
                default=50,
                help_text="0 - левый край, 50 - центр, 100 - правый край.",
                validators=[MinValueValidator(0), MaxValueValidator(100)],
                verbose_name="Фокус по горизонтали",
            ),
        ),
        migrations.AddField(
            model_name="image",
            name="focus_y",
            field=models.PositiveSmallIntegerField(
                default=50,
                help_text="0 - верх, 50 - центр, 100 - низ.",
                validators=[MinValueValidator(0), MaxValueValidator(100)],
                verbose_name="Фокус по вертикали",
            ),
        ),
    ]
