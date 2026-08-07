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
from apps.messagerie.views import (
    ConversationViewSet,
    MessageViewSet,
    PieceJointeViewSet,
)

# DOCS
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

# STATIC
from django.conf import settings
from django.conf.urls.static import static


# ===== ROUTER =====
router = DefaultRouter()
router.register(r'salaries', SalarieViewSet, basename="salarie")
router.register(r'dossiers', DossierViewSet, basename="dossier")
router.register(r'demandes', DemandeViewSet, basename="demande")
router.register(r'documents', DocumentViewSet, basename="document")
router.register(r'planning', PlanningViewSet, basename="planning")
router.register(r'pointage', PointageViewSet, basename="pointage")
router.register(r'paie', PaieViewSet, basename="paie")
router.register(r'adresses', AdresseViewSet, basename="adresse")
router.register(r'etatcivil', EtatCivilViewSet, basename="etatcivil")
router.register(r'famille', FamilleViewSet, basename="famille")
router.register(r'iban', IbanViewSet, basename="iban")
router.register(r'notifications', NotificationViewSet, basename="notification")
router.register(r'conversations', ConversationViewSet, basename="conversation")
router.register(r'messages', MessageViewSet, basename="message")
router.register(r'pieces-jointes', PieceJointeViewSet, basename="piece-jointe")

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
