from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_standard_structure_and_testimonials'),
    ]

    operations = [
        migrations.AddField(
            model_name='about',
            name='about_text',
            field=models.TextField(blank=True),
        ),
        migrations.AlterField(
            model_name='about',
            name='bio',
            field=models.TextField(blank=True, default=''),
        ),
    ]
