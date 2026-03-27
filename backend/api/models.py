from django.db import models
from django.contrib.auth.models import User
from django.core.validators import URLValidator
from django.utils.text import slugify

class Theme(models.Model):
    SEASON_CHOICES = [
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('autumn', 'Autumn'),
        ('winter', 'Winter'),
        ('new_year', 'New Year'),
        ('valentine', "Valentine's Day"),
        ('easter', 'Easter'),
        ('halloween', 'Halloween'),
        ('thanksgiving', 'Thanksgiving'),
        ('christmas', 'Christmas'),
        ('cny', 'Chinese New Year'),
        ('default', 'Default'),
    ]
    
    ANIMATION_CHOICES = [
        ('none', 'None'),
        ('fade', 'Fade In'),
        ('slide', 'Slide In'),
        ('bounce', 'Bounce'),
        ('glow', 'Glow Effect'),
        ('float', 'Float'),
        ('pulse', 'Pulse'),
        ('gradient', 'Gradient Shift'),
    ]
    
    season = models.CharField(max_length=20, choices=SEASON_CHOICES)
    name = models.CharField(max_length=100)
    
    # Colors
    primary_color = models.CharField(max_length=7, default='#000000')
    secondary_color = models.CharField(max_length=7, default='#ffffff')
    accent_color = models.CharField(max_length=7, default='#0066cc')
    background_color = models.CharField(max_length=7, default='#f5f5f5')
    text_color = models.CharField(max_length=7, default='#333333')
    
    # Visual Effects
    background_image = models.ImageField(upload_to='theme_backgrounds/', blank=True, null=True)
    gradient_enabled = models.BooleanField(default=False)
    gradient_angle = models.IntegerField(default=45)  # 0-360 degrees
    shadow_intensity = models.IntegerField(default=0)  # 0-10 shadow strength
    border_radius = models.IntegerField(default=0)  # 0-50 for border roundness
    blur_effect = models.IntegerField(default=0)  # 0-20px blur
    
    # Animations
    animation_type = models.CharField(max_length=20, choices=ANIMATION_CHOICES, default='none')
    animation_duration = models.IntegerField(default=1)  # 0.5-5 seconds
    animation_delay = models.IntegerField(default=0)  # 0-2 seconds
    
    # Design Elements
    use_particles = models.BooleanField(default=False)  # Particle effects
    particle_type = models.CharField(max_length=20, default='none')  # snow, stars, leaves, etc.
    use_hover_effects = models.BooleanField(default=True)  # Enable hover animations
    card_style = models.CharField(max_length=20, default='flat')  # flat, elevated, outlined
    
    # Status
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'themes'
        ordering = ['season']
    
    def __str__(self):
        return f"{self.name} ({self.season})"


class Project(models.Model):
    PROJECT_TYPES = [
        ('live', 'Live Site / Web App'),
        ('local', 'Local Project / Gallery'),
    ]
    
    title = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField()
    project_type = models.CharField(max_length=20, choices=PROJECT_TYPES, default='live')
    thumbnail = models.ImageField(upload_to='project_thumbnails/', blank=True, null=True)
    images = models.JSONField(default=list, blank=True)  # List of image paths
    url = models.URLField(blank=True, null=True)
    github_url = models.URLField(blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    is_featured = models.BooleanField(default=False)
    is_published = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        ordering = ['order', '-created_at']
    
    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(self.title) or 'project'
            candidate = base_slug
            suffix = 1
            while Project.objects.filter(slug=candidate).exclude(pk=self.pk).exists():
                suffix += 1
                candidate = f"{base_slug}-{suffix}"
            self.slug = candidate
        super().save(*args, **kwargs)


class ProjectImage(models.Model):
    project = models.ForeignKey(Project, related_name='image_items', on_delete=models.CASCADE)
    image = models.ImageField(upload_to='project_images/')
    caption = models.CharField(max_length=180, blank=True, default='')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'project_images'
        ordering = ['order', 'created_at']

    def __str__(self):
        return f"{self.project.title} image #{self.order}"


class Skill(models.Model):
    name = models.CharField(max_length=100)
    proficiency = models.PositiveIntegerField(default=80)  # 0-100
    icon = models.ImageField(upload_to='skill_icons/', blank=True, null=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'skills'
        ordering = ['order']
    
    def __str__(self):
        return self.name


class Experience(models.Model):
    title = models.CharField(max_length=200)
    company = models.CharField(max_length=200, blank=True, default='')
    description = models.TextField()
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    is_current = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'experiences'
        ordering = ['order', '-start_date']
    
    def __str__(self):
        return f"{self.title} at {self.company}" if self.company else self.title


class About(models.Model):
    title = models.CharField(max_length=200)
    hero_heading = models.CharField(max_length=200, blank=True)
    hero_subheading = models.CharField(max_length=200, blank=True)
    hero_name = models.CharField(max_length=200, blank=True)
    hero_role = models.CharField(max_length=200, blank=True)
    hero_tagline = models.CharField(max_length=300, blank=True)
    hero_cta_primary_text = models.CharField(max_length=100, blank=True)
    hero_cta_primary_link = models.CharField(max_length=300, blank=True)
    hero_cta_secondary_text = models.CharField(max_length=100, blank=True)
    hero_cta_secondary_link = models.CharField(max_length=300, blank=True)
    about_intro = models.TextField(blank=True)
    about_background = models.TextField(blank=True)
    about_specialization = models.TextField(blank=True)
    about_text = models.TextField(blank=True)
    bio = models.TextField(blank=True, default='')
    profile_image = models.ImageField(upload_to='profile/')
    resume_file = models.FileField(upload_to='resume/', blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=200, blank=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'about'
    
    def __str__(self):
        return self.title


class SocialLink(models.Model):
    platform = models.CharField(max_length=50)
    url = models.URLField()
    icon = models.CharField(max_length=50, blank=True)  # Icon class name
    order = models.PositiveIntegerField(default=0)
    is_visible = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'social_links'
        ordering = ['order']
    
    def __str__(self):
        return f"{self.platform} - {self.url}"


class Contact(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=300)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'contacts'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.subject}"


