from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0004_about_text_and_bio_optional'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='skill',
            name='category',
        ),
        migrations.RemoveField(
            model_name='project',
            name='category',
        ),
        migrations.RemoveField(
            model_name='project',
            name='short_description',
        ),
        migrations.RemoveField(
            model_name='project',
            name='technologies',
        ),
        migrations.RemoveField(
            model_name='experience',
            name='location',
        ),
        migrations.AlterField(
            model_name='experience',
            name='company',
            field=models.CharField(blank=True, default='', max_length=200),
        ),
        migrations.AlterModelOptions(
            name='skill',
            options={'ordering': ['order']},
        ),
        migrations.DeleteModel(
            name='Testimonial',
        ),
    ]
