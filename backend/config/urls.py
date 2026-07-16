from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter

# AUTH
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

# USERS
from apps.users.views import SalarieViewSet, current_user, admin_stats

# MODULES
from apps.dossiers.views import DossierViewSet, AdresseViewSet, EtatCivilViewSet, FamilleViewSet, IbanViewSet
from apps.demandes.views import DemandeViewSet
from apps.documents.views import DocumentViewSet
from apps.planning.views import PlanningViewSet
from apps.pointage.views import PointageViewSet
from apps.paie.views import PaieViewSet, generate_fiche_paie
from apps.notifications.views import NotificationViewSet

# DOCS
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# STATIC
from django.conf import settings
from django.conf.urls.static import static


# ===== ROUTER =====
router = DefaultRouter()
router.register(r'salaries', SalarieViewSet)
router.register(r'dossiers', DossierViewSet)
router.register(r'demandes', DemandeViewSet, basename="demande")
router.register(r'documents', DocumentViewSet)
router.register(r'planning', PlanningViewSet)
router.register(r'pointage', PointageViewSet)
router.register(r'paie', PaieViewSet)
router.register(r'adresses', AdresseViewSet)
router.register(r'etatcivil', EtatCivilViewSet)
router.register(r'famille', FamilleViewSet)
router.register(r'iban', IbanViewSet)
router.register(r'notifications', NotificationViewSet)


# ===== URLS =====
urlpatterns = [
    path('admin/', admin.site.urls),

    # API
    path('api/', include(router.urls)),

    # AUTH
    path('api/token/', TokenObtainPairView.as_view()),
    path('api/token/refresh/', TokenRefreshView.as_view()),

    # USER
    path('api/me/', current_user),

    # ADMIN
    path('api/admin/stats/', admin_stats),

    # PAIE PDF
    path('api/paie/<int:pk>/pdf/', generate_fiche_paie),

    # DOCS
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),
]


# MEDIA
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
