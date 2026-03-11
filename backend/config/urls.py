"""
URL configuration for config project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.users.views import SalarieViewSet
from apps.dossiers.views import DossierViewSet
from apps.demandes.views import DemandeViewSet
from apps.documents.views import DocumentViewSet
from apps.planning.views import PlanningViewSet
from apps.pointage.views import PointageViewSet
from apps.paie.views import PaieViewSet
from apps.notifications.views import NotificationViewSet
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework import viewsets, permissions

router = DefaultRouter()
router.register(r'salaries', SalarieViewSet)
router.register(r'dossiers', DossierViewSet)
router.register(r'demandes', DemandeViewSet)
router.register(r'documents', DocumentViewSet)
router.register(r'planning', PlanningViewSet)
router.register(r'pointage', PointageViewSet)
router.register(r'paie', PaieViewSet)
router.register(r'notifications', NotificationViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
