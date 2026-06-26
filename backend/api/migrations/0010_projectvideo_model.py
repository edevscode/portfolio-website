from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_project_project_type_alter_project_thumbnail'),
    ]

    operations = [
        migrations.CreateModel(
            name='ProjectVideo',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('video', models.FileField(upload_to='project_videos/')),
                ('caption', models.CharField(blank=True, default='', max_length=180)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('project', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='video_items',
                    to='api.project',
                )),
            ],
            options={
                'db_table': 'project_videos',
                'ordering': ['order', 'created_at'],
            },
        ),
    ]
