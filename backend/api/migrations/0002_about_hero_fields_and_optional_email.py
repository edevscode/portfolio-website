from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='about',
            name='hero_heading',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_subheading',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AlterField(
            model_name='about',
            name='email',
            field=models.EmailField(blank=True, max_length=254, null=True),
        ),
    ]
