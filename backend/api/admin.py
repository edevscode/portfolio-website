from django.contrib import admin
from .models import Theme, Project, Skill, Experience, About, SocialLink, Contact


@admin.register(Theme)
class ThemeAdmin(admin.ModelAdmin):
    list_display = ['name', 'season', 'is_active', 'created_at']
    list_filter = ['season', 'is_active', 'created_at']
    search_fields = ['name', 'season']
    ordering = ['-created_at']


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ['title', 'is_featured', 'is_published', 'order', 'created_at']
    list_filter = ['is_featured', 'is_published', 'created_at']
    search_fields = ['title', 'description']
    prepopulated_fields = {'slug': ('title',)}
    ordering = ['order', '-created_at']


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ['name', 'proficiency', 'order']
    search_fields = ['name']
    ordering = ['order']


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ['title', 'company', 'is_current', 'order', 'start_date']
    list_filter = ['is_current', 'start_date']
    search_fields = ['title', 'company']
    ordering = ['order', '-start_date']


@admin.register(About)
class AboutAdmin(admin.ModelAdmin):
    list_display = ['title', 'email', 'updated_at']
    search_fields = ['title', 'email']


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ['platform', 'is_visible', 'order']
    list_filter = ['platform', 'is_visible']
    ordering = ['order']


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ['name', 'email', 'subject', 'is_read', 'created_at']
    list_filter = ['is_read', 'created_at']
    search_fields = ['name', 'email', 'subject']
    readonly_fields = ['name', 'email', 'subject', 'message', 'created_at']
    ordering = ['-created_at']


