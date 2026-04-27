from rest_framework import permissions


class IsRHOrAdmin(permissions.BasePermission):
    """
    Accès uniquement pour RH ou Admin
    """

    def has_permission(self, request, view):
        return (
            hasattr(request.user, "salarie") and
            request.user.salarie.role in ["RH", "ADMIN"]
        )


class IsOwnerOrRH(permissions.BasePermission):
    """
    Accès si :
    - RH/Admin
    - ou propriétaire
    """

    def has_object_permission(self, request, view, obj):

        # RH/Admin
        if hasattr(request.user, "salarie") and request.user.salarie.role in ["RH", "ADMIN"]:
            return True

        # Propriétaire
        return obj.user == request.user


# NOUVELLE PERMISSION (celle qui manque)
class IsAdminOrRH(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            hasattr(request.user, "salarie") and
            request.user.salarie.role in ["ADMIN", "RH"]
        )
