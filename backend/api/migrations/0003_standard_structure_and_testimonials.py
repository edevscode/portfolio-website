from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_about_hero_fields_and_optional_email'),
    ]

    operations = [
        migrations.AddField(
            model_name='about',
            name='about_background',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='about',
            name='about_intro',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='about',
            name='about_specialization',
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_cta_primary_link',
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_cta_primary_text',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_cta_secondary_link',
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_cta_secondary_text',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_name',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_role',
            field=models.CharField(blank=True, max_length=200),
        ),
        migrations.AddField(
            model_name='about',
            name='hero_tagline',
            field=models.CharField(blank=True, max_length=300),
        ),
        migrations.AddField(
            model_name='project',
            name='category',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AlterField(
            model_name='project',
            name='slug',
            field=models.SlugField(blank=True, unique=True),
        ),
        migrations.CreateModel(
            name='Testimonial',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('client_name', models.CharField(max_length=200)),
                ('quote', models.TextField()),
                ('rating', models.PositiveSmallIntegerField(blank=True, null=True)),
                ('client_photo', models.ImageField(blank=True, null=True, upload_to='testimonials/')),
                ('order', models.PositiveIntegerField(default=0)),
                ('is_visible', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'db_table': 'testimonials',
                'ordering': ['order', '-created_at'],
            },
        ),
    ]
