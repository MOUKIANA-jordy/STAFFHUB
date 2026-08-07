from rest_framework.permissions import BasePermission, SAFE_METHODS


class DemandePermission(BasePermission):
    message = "Vous n’avez pas la permission d’effectuer cette action."

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if view.action in ["update", "partial_update", "destroy"]:
            return request.user.is_staff or request.user.is_superuser

        return True

    def has_object_permission(self, request, view, obj):
        user = request.user

        if user.is_staff or user.is_superuser:
            return True

        salarie = getattr(user, "salarie", None)

        if not salarie or obj.salarie_id != salarie.id:
            return False

        return request.method in SAFE_METHODS
