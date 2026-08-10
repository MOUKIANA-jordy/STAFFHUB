from rest_framework import permissions

from apps.users.models import Salarie


def is_rh_or_admin(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    salarie = getattr(user, "salarie", None)

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


class IsRemunerationOwnerOrRH(permissions.BasePermission):

    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False

        # Seuls RH/Admin créent/suppriment
        if view.action in ["create", "destroy"]:
            return is_rh_or_admin(request.user)

        return True

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if is_rh_or_admin(request.user):
            return True

        salarie = getattr(
            request.user,
            "salarie",
            None,
        )

        if not salarie:
            return False

        # Le salarié peut consulter sa rémunération,
        # mais pas la modifier.
        if request.method in permissions.SAFE_METHODS:
            return obj.salarie_id == salarie.id

        return False
