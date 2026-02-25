from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from datetime import datetime
from django.db.models import Q
from .models import Theme, Project, ProjectImage, Skill, Experience, About, SocialLink, Contact
from .serializers import (
    ThemeSerializer, ProjectSerializer, SkillSerializer,
    ExperienceSerializer, AboutSerializer, SocialLinkSerializer,
    ContactSerializer, PortfolioPublicSerializer
)


class IsAdminOrReadOnly(permissions.BasePermission):
    """Custom permission to allow admins to edit but allow read-only access to others."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


class ThemeViewSet(viewsets.ModelViewSet):
    queryset = Theme.objects.all()
    serializer_class = ThemeSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    @action(detail=False, methods=['get'])
    def current(self, request):
        """Get the currently active theme or auto-detect seasonal theme."""
        # First check if there's an explicitly set active theme
        active_theme = Theme.objects.filter(is_active=True).first()
        
        if not active_theme:
            # Auto-detect seasonal theme
            active_theme = self.get_seasonal_theme()
        
        if not active_theme:
            # Fallback to default theme
            active_theme = Theme.objects.filter(season='default').first()
        
        serializer = self.get_serializer(active_theme)
        return Response(serializer.data)

    def get_seasonal_theme(self):
        """Auto-detect theme based on current date."""
        today = datetime.now()
        month = today.month
        day = today.day

        if month == 1 and day <= 7:
            season = 'new_year'
        elif month == 2 and 10 <= day <= 18:
            season = 'valentine'
        elif month == 3 and day >= 20:
            season = 'spring'
        elif month == 4 or (month == 5 and day < 20):
            season = 'easter'
        elif month == 6 or (month == 5 and day >= 20) or month == 7 or month == 8:
            season = 'summer'
        elif month == 9 or (month == 10 and day < 25):
            season = 'autumn'
        elif month == 10 and day >= 25:
            season = 'halloween'
        elif month == 11:
            season = 'thanksgiving' if day >= 20 else 'autumn'
        elif month == 12:
            season = 'christmas' if day >= 20 else 'autumn'
        else:
            season = 'spring'

        return Theme.objects.filter(season=season).first()
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate a specific theme."""
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Deactivate all other themes
        Theme.objects.exclude(pk=pk).update(is_active=False)
        
        # Activate this theme
        theme = self.get_object()
        theme.is_active = True
        theme.save()
        
        serializer = self.get_serializer(theme)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def auto(self, request):
        """Switch back to automatic seasonal theme selection (clear manual override)."""
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )

        Theme.objects.update(is_active=False)
        theme = self.get_seasonal_theme() or Theme.objects.filter(season='default').first()
        serializer = self.get_serializer(theme)
        return Response(serializer.data)


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_field = 'slug'
    parser_classes = (JSONParser, MultiPartParser, FormParser)

    def _save_project_images(self, project, request, replace=False):
        if replace:
            ProjectImage.objects.filter(project=project).delete()

        files = []
        captions = []

        if hasattr(request, 'FILES'):
            files = request.FILES.getlist('images') or []

        if hasattr(request, 'data') and hasattr(request.data, 'getlist'):
            captions = request.data.getlist('captions') or []
        else:
            captions_value = request.data.get('captions') if hasattr(request, 'data') else None
            if isinstance(captions_value, list):
                captions = captions_value
            elif captions_value:
                captions = [captions_value]

        if not files:
            return

        start_order = ProjectImage.objects.filter(project=project).count()

        for idx, f in enumerate(files):
            caption = captions[idx] if idx < len(captions) else ''
            ProjectImage.objects.create(
                project=project,
                image=f,
                caption=caption,
                order=start_order + idx,
            )

        project.images = [img.image.url for img in project.image_items.all()]
        project.save(update_fields=['images'])

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)

        try:
            project = Project.objects.get(pk=response.data.get('id'))
        except Exception:
            return response

        self._save_project_images(project, request, replace=False)
        serializer = self.get_serializer(project)
        return Response(serializer.data, status=response.status_code)

    def update(self, request, *args, **kwargs):
        replace = str(request.data.get('replace_images', '')).lower() in ('1', 'true', 'yes')

        response = super().update(request, *args, **kwargs)

        try:
            project = self.get_object()
        except Exception:
            return response

        self._save_project_images(project, request, replace=replace)
        serializer = self.get_serializer(project)
        return Response(serializer.data, status=response.status_code)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)
    
    def get_queryset(self):
        queryset = Project.objects.all()
        # Only admins can see unpublished projects
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_published=True)
        return queryset
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get only featured projects."""
        featured = Project.objects.filter(is_featured=True, is_published=True)
        serializer = self.get_serializer(featured, many=True)
        return Response(serializer.data)


class SkillViewSet(viewsets.ModelViewSet):
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = (JSONParser, MultiPartParser, FormParser)


class ExperienceViewSet(viewsets.ModelViewSet):
    queryset = Experience.objects.all()
    serializer_class = ExperienceSerializer
    permission_classes = [IsAdminOrReadOnly]


class AboutViewSet(viewsets.ModelViewSet):
    queryset = About.objects.all()
    serializer_class = AboutSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = (MultiPartParser, FormParser)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        """Get the about information."""
        about = About.objects.first()
        if about:
            serializer = self.get_serializer(about)
            return Response([serializer.data])
        return Response({'detail': 'About information not found.'}, status=status.HTTP_404_NOT_FOUND)


class SocialLinkViewSet(viewsets.ModelViewSet):
    queryset = SocialLink.objects.filter(is_visible=True)
    serializer_class = SocialLinkSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        if self.request.user.is_staff:
            return SocialLink.objects.all()
        return SocialLink.objects.filter(is_visible=True)


class ContactViewSet(viewsets.ModelViewSet):
    queryset = Contact.objects.all()
    serializer_class = ContactSerializer
    parser_classes = (MultiPartParser, FormParser)
    
    def get_permissions(self):
        if self.action == 'create':
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark a contact message as read."""
        if not request.user.is_staff:
            return Response(
                {'detail': 'You do not have permission to perform this action.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        contact = self.get_object()
        contact.is_read = True
        contact.save()
        serializer = self.get_serializer(contact)
        return Response(serializer.data)


class PortfolioPublicView(viewsets.ViewSet):
    """Combined view for all public portfolio data."""
    permission_classes = [permissions.AllowAny]
    
    @action(detail=False, methods=['get'])
    def all(self, request):
        """Get all public portfolio data."""
        about = About.objects.first()
        projects = Project.objects.filter(is_published=True)
        skills = Skill.objects.all()
        experiences = Experience.objects.all()
        social_links = SocialLink.objects.filter(is_visible=True)
        
        # Get current theme
        active_theme = Theme.objects.filter(is_active=True).first()
        if not active_theme:
            active_theme = self.get_seasonal_theme()
        if not active_theme:
            active_theme = Theme.objects.filter(season='default').first()
        
        data = {
            'about': AboutSerializer(about).data if about else None,
            'projects': ProjectSerializer(projects, many=True).data,
            'skills': SkillSerializer(skills, many=True).data,
            'experiences': ExperienceSerializer(experiences, many=True).data,
            'social_links': SocialLinkSerializer(social_links, many=True).data,
            'current_theme': ThemeSerializer(active_theme).data if active_theme else None,
        }
        return Response(data)
    
    def get_seasonal_theme(self):
        """Auto-detect theme based on current date."""
        today = datetime.now()
        month = today.month
        day = today.day
        
        if month == 1 and day <= 7:
            season = 'new_year'
        elif month == 2 and 10 <= day <= 18:
            season = 'valentine'
        elif month == 3 and day >= 20:
            season = 'spring'
        elif month == 4 or (month == 5 and day < 20):
            season = 'easter'
        elif month == 6 or (month == 5 and day >= 20) or month == 7 or month == 8:
            season = 'summer'
        elif month == 9 or (month == 10 and day < 25):
            season = 'autumn'
        elif month == 10 and day >= 25:
            season = 'halloween'
        elif month == 11:
            season = 'thanksgiving' if day >= 20 else 'autumn'
        elif month == 12:
            season = 'christmas' if day >= 20 else 'autumn'
        else:
            season = 'spring'
        
        return Theme.objects.filter(season=season).first()

