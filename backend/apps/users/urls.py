from django.urls import path

from .views import (
    admin_stats,
    current_user,
    password_reset_confirm,
    password_reset_request,
)


urlpatterns = [

    # ========================================================
    # UTILISATEUR CONNECTÉ
    # ========================================================

    path(
        "current_user/",
        current_user,
        name="current-user",
    ),


    # ========================================================
    # ADMINISTRATION
    # ========================================================

    path(
        "api/admin/stats/",
        admin_stats,
        name="admin-stats",
    ),


    # ========================================================
    # MOT DE PASSE OUBLIÉ
    # ========================================================

    path(
        "password-reset/",
        password_reset_request,
        name="password-reset",
    ),

    path(
        "password-reset-confirm/",
        password_reset_confirm,
        name="password-reset-confirm",
    ),

]
