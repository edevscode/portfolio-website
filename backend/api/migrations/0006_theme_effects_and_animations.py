# Generated migration for Theme model updates

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_schema_cleanup_remove_testimonials_and_categories'),
    ]

    operations = [
        migrations.AddField(
            model_name='theme',
            name='gradient_enabled',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='theme',
            name='gradient_angle',
            field=models.IntegerField(default=45),
        ),
        migrations.AddField(
            model_name='theme',
            name='shadow_intensity',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='theme',
            name='border_radius',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='theme',
            name='blur_effect',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='theme',
            name='animation_type',
            field=models.CharField(
                choices=[('none', 'None'), ('fade', 'Fade In'), ('slide', 'Slide In'), 
                        ('bounce', 'Bounce'), ('glow', 'Glow Effect'), ('float', 'Float'), 
                        ('pulse', 'Pulse'), ('gradient', 'Gradient Shift')],
                default='none',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='theme',
            name='animation_duration',
            field=models.IntegerField(default=1),
        ),
        migrations.AddField(
            model_name='theme',
            name='animation_delay',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='theme',
            name='use_particles',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='theme',
            name='particle_type',
            field=models.CharField(default='none', max_length=20),
        ),
        migrations.AddField(
            model_name='theme',
            name='use_hover_effects',
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name='theme',
            name='card_style',
            field=models.CharField(default='flat', max_length=20),
        ),
    ]
