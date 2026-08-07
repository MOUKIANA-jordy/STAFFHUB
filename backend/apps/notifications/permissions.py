from rest_framework import permissions

from apps.users.models import Salarie


def get_user_salarie(user):
    if not user or not user.is_authenticated:
        return None

    return getattr(user, "salarie", None)


def is_rh_or_admin(user):
    salarie = get_user_salarie(user)

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


class IsNotificationOwnerOrRH(permissions.BasePermission):
    message = (
        "Vous n’avez pas la permission d’accéder "
        "à cette notification."
    )

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if view.action in ["create", "destroy"]:
            return is_rh_or_admin(request.user)

        return True

    def has_object_permission(self, request, view, obj):
        if is_rh_or_admin(request.user):
            return True

        salarie = get_user_salarie(request.user)

        if not salarie:
            return False

        return obj.salarie_id == salarie.id
