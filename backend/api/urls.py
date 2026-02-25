from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views
from .views_login import login_view
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({'status': 'healthy', 'database': 'connected'})

router = DefaultRouter()
router.register(r'themes', views.ThemeViewSet)
router.register(r'projects', views.ProjectViewSet)
router.register(r'skills', views.SkillViewSet)
router.register(r'experiences', views.ExperienceViewSet)
router.register(r'about', views.AboutViewSet)
router.register(r'social-links', views.SocialLinkViewSet)
router.register(r'contacts', views.ContactViewSet)
router.register(r'portfolio', views.PortfolioPublicView, basename='portfolio')

urlpatterns = [
    path('health/', health_check, name='health_check'),
    path('auth/login/', login_view, name='login'),
    path('', include(router.urls)),
]
