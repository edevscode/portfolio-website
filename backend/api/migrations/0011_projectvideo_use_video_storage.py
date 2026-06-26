import api.models
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0010_projectvideo_model'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectvideo',
            name='video',
            field=models.FileField(
                storage=api.models._video_storage,
                upload_to='project_videos/',
            ),
        ),
    ]
