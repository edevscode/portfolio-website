import logging
import traceback
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate
from datetime import datetime
from django.db.models import Q

logger = logging.getLogger(__name__)
from .models import Theme, Project, ProjectImage, ProjectVideo, Certificate, CertificateFile, Skill, Experience, About, SocialLink, Contact
from .serializers import (
    ThemeSerializer, ProjectSerializer, CertificateSerializer, CertificateFileSerializer,
    SkillSerializer, ExperienceSerializer, AboutSerializer, SocialLinkSerializer,
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

    def _save_project_videos(self, project, request, replace=False):
        files = []
        captions = []

        if hasattr(request, 'FILES'):
            files = request.FILES.getlist('videos') or []

        if hasattr(request, 'data') and hasattr(request.data, 'getlist'):
            captions = request.data.getlist('video_captions') or []
        else:
            captions_value = request.data.get('video_captions') if hasattr(request, 'data') else None
            if isinstance(captions_value, list):
                captions = captions_value
            elif captions_value:
                captions = [captions_value]

        if not files:
            return

        # Only delete existing videos once we know new ones are actually coming
        if replace:
            ProjectVideo.objects.filter(project=project).delete()

        start_order = ProjectVideo.objects.filter(project=project).count()

        for idx, f in enumerate(files):
            caption = captions[idx] if idx < len(captions) else ''
            try:
                ProjectVideo.objects.create(
                    project=project,
                    video=f,
                    caption=caption,
                    order=start_order + idx,
                )
            except Exception as exc:
                logger.error('[video] upload failed: %s\n%s', exc, traceback.format_exc())
                raise

    def create(self, request, *args, **kwargs):
        try:
            response = super().create(request, *args, **kwargs)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error('ProjectViewSet.create super() failed: %s\n%s', exc, tb)
            return Response({'detail': str(exc), 'traceback': tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            project = Project.objects.get(pk=response.data.get('id'))
        except Exception:
            return response

        try:
            self._save_project_images(project, request, replace=False)
            self._save_project_videos(project, request, replace=False)
            serializer = self.get_serializer(project)
            return Response(serializer.data, status=response.status_code)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error('ProjectViewSet.create post-save failed: %s\n%s', exc, tb)
            return Response({'detail': str(exc), 'traceback': tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        replace_img = str(request.data.get('replace_images', '')).lower() in ('1', 'true', 'yes')
        replace_vid = str(request.data.get('replace_videos', '')).lower() in ('1', 'true', 'yes')

        try:
            response = super().update(request, *args, **kwargs)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error('ProjectViewSet.update super() failed: %s\n%s', exc, tb)
            return Response({'detail': str(exc), 'traceback': tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        try:
            project = self.get_object()
        except Exception:
            return response

        try:
            self._save_project_images(project, request, replace=replace_img)
            self._save_project_videos(project, request, replace=replace_vid)
            serializer = self.get_serializer(project)
            return Response(serializer.data, status=response.status_code)
        except Exception as exc:
            tb = traceback.format_exc()
            logger.error('ProjectViewSet.update post-save failed: %s\n%s', exc, tb)
            return Response({'detail': str(exc), 'traceback': tb}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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


class CertificateViewSet(viewsets.ModelViewSet):
    queryset = Certificate.objects.all()
    serializer_class = CertificateSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def _save_files(self, certificate, request, replace=False):
        all_file_keys = list(request.FILES.keys()) if hasattr(request, 'FILES') else []
        files = request.FILES.getlist('files') if hasattr(request, 'FILES') else []
        logger.info('[cert] _save_files called: cert_id=%s replace=%s file_keys=%s files_count=%s',
                    certificate.id, replace, all_file_keys, len(files))
        captions = (request.data.getlist('file_captions')
                    if hasattr(request, 'data') and hasattr(request.data, 'getlist')
                    else [])
        if not files:
            logger.warning('[cert] no files received for cert_id=%s (file_keys=%s)', certificate.id, all_file_keys)
            return
        if replace:
            CertificateFile.objects.filter(certificate=certificate).delete()
        start = CertificateFile.objects.filter(certificate=certificate).count()
        for idx, f in enumerate(files):
            caption = captions[idx] if idx < len(captions) else ''
            try:
                obj = CertificateFile.objects.create(
                    certificate=certificate, file=f, caption=caption, order=start + idx
                )
                logger.info('[cert] saved file #%s: id=%s name=%s url=%s', idx, obj.id, f.name, obj.file.name)
            except Exception as exc:
                logger.error('[cert] failed to save file #%s name=%s: %s\n%s',
                             idx, f.name, exc, traceback.format_exc())
                raise

    def create(self, request, *args, **kwargs):
        logger.info('[cert] create called, FILES keys=%s', list(request.FILES.keys()) if hasattr(request, 'FILES') else [])
        try:
            response = super().create(request, *args, **kwargs)
        except Exception as exc:
            logger.error('[cert] create super() failed: %s\n%s', exc, traceback.format_exc())
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            cert = Certificate.objects.get(pk=response.data.get('id'))
            self._save_files(cert, request)
            return Response(self.get_serializer(cert).data, status=response.status_code)
        except Exception as exc:
            logger.error('[cert] create post-save failed: %s\n%s', exc, traceback.format_exc())
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def update(self, request, *args, **kwargs):
        logger.info('[cert] update called, FILES keys=%s', list(request.FILES.keys()) if hasattr(request, 'FILES') else [])
        replace = str(request.data.get('replace_files', '')).lower() in ('1', 'true', 'yes')
        try:
            response = super().update(request, *args, **kwargs)
        except Exception as exc:
            logger.error('[cert] update super() failed: %s\n%s', exc, traceback.format_exc())
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        try:
            cert = self.get_object()
            self._save_files(cert, request, replace=replace)
            return Response(self.get_serializer(cert).data, status=response.status_code)
        except Exception as exc:
            logger.error('[cert] update post-save failed: %s\n%s', exc, traceback.format_exc())
            return Response({'detail': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class CertificateFileViewSet(viewsets.ModelViewSet):
    queryset = CertificateFile.objects.all()
    serializer_class = CertificateFileSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes = (MultiPartParser, FormParser, JSONParser)


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
        certificates = Certificate.objects.all()
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
            'certificates': CertificateSerializer(certificates, many=True, context={'request': request}).data,
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

