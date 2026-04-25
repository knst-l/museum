from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("shared", "0003_image_focus_point"),
        ("historical_figures", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="historicalfigure",
            name="primary_image",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="historical_figures_primary",
                to="shared.image",
                verbose_name="Главное изображение",
            ),
        ),
    ]
