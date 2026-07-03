from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_certificate_project_project_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='certificate',
            name='image',
            field=models.FileField(blank=True, null=True, upload_to='certificates/'),
        ),
    ]
