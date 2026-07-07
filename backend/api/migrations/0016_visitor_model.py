from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_certificatefile_add_file_type'),
    ]

    operations = [
        migrations.CreateModel(
            name='Visitor',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ip_address', models.GenericIPAddressField(blank=True, null=True)),
                ('country', models.CharField(blank=True, default='', max_length=100)),
                ('country_code', models.CharField(blank=True, default='', max_length=10)),
                ('city', models.CharField(blank=True, default='', max_length=100)),
                ('region', models.CharField(blank=True, default='', max_length=100)),
                ('user_agent', models.TextField(blank=True, default='')),
                ('device_type', models.CharField(blank=True, default='', max_length=20)),
                ('browser', models.CharField(blank=True, default='', max_length=100)),
                ('referrer', models.CharField(blank=True, default='', max_length=500)),
                ('visited_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'visitors',
                'ordering': ['-visited_at'],
            },
        ),
    ]
