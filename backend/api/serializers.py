from rest_framework import serializers
from .models import Theme, Project, ProjectImage, Skill, Experience, About, SocialLink, Contact


class ThemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Theme
        fields = [
            'id', 'season', 'name', 'primary_color', 'secondary_color',
            'accent_color', 'background_color', 'text_color', 'background_image',
            'gradient_enabled', 'gradient_angle', 'shadow_intensity', 'border_radius', 'blur_effect',
            'animation_type', 'animation_duration', 'animation_delay',
            'use_particles', 'particle_type', 'use_hover_effects', 'card_style',
            'is_active', 'created_at'
        ]


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ['id', 'image', 'caption', 'order', 'created_at']


class ProjectSerializer(serializers.ModelSerializer):
    image_items = serializers.SerializerMethodField()

    def get_image_items(self, obj):
        items = getattr(obj, 'image_items', None)
        if items is None:
            return []
        return ProjectImageSerializer(items.all(), many=True, context=self.context).data

    class Meta:
        model = Project
        fields = [
            'id', 'title', 'slug', 'description', 'project_type',
            'thumbnail', 'images', 'image_items', 'url', 'github_url',
            'order', 'is_featured', 'is_published', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'slug': {'required': False, 'allow_blank': True},
            'images': {'read_only': True},
        }


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'proficiency', 'icon', 'order', 'created_at']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = [
            'id', 'title', 'company', 'description',
            'start_date', 'end_date', 'is_current', 'order', 'created_at'
        ]


class AboutSerializer(serializers.ModelSerializer):
    class Meta:
        model = About
        fields = [
            'id', 'title',
            'hero_heading', 'hero_subheading', 'hero_name', 'hero_role', 'hero_tagline',
            'hero_cta_primary_text', 'hero_cta_primary_link',
            'hero_cta_secondary_text', 'hero_cta_secondary_link',
            'about_intro', 'about_background', 'about_specialization',
            'about_text', 'bio', 'profile_image', 'resume_file',
            'email', 'phone', 'location', 'updated_at', 'created_at'
        ]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ['id', 'platform', 'url', 'icon', 'order', 'is_visible', 'created_at']


class ContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contact
        fields = ['id', 'name', 'email', 'subject', 'message', 'is_read', 'created_at']
        read_only_fields = ['id', 'created_at', 'is_read']


# Combined portfolio data serializer for public view
class PortfolioPublicSerializer(serializers.Serializer):
    about = AboutSerializer()
    projects = ProjectSerializer(many=True)
    skills = SkillSerializer(many=True)
    experiences = ExperienceSerializer(many=True)
    social_links = SocialLinkSerializer(many=True)
    current_theme = ThemeSerializer()
