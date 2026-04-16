from django.urls import path
from .views import current_user, admin_stats

urlpatterns = [
    path("current_user/", current_user),
    path("api/admin/stats/", admin_stats),
]
