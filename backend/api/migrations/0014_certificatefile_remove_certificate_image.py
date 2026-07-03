import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0013_certificate_image_filefield'),
    ]

    operations = [
        migrations.CreateModel(
            name='CertificateFile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('file', models.FileField(upload_to='certificates/')),
                ('caption', models.CharField(blank=True, default='', max_length=200)),
                ('order', models.PositiveIntegerField(default=0)),
                ('certificate', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='files',
                    to='api.certificate',
                )),
            ],
            options={
                'db_table': 'certificate_files',
                'ordering': ['order', 'id'],
            },
        ),
        migrations.RemoveField(
            model_name='certificate',
            name='image',
        ),
    ]
