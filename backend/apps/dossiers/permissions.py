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


class IsDossierOwnerOrRH(permissions.BasePermission):
    """
    Le salarié accède uniquement aux données qui lui appartiennent.
    Les RH et administrateurs accèdent à toutes les données.
    """

    message = (
        "Vous n’avez pas la permission d’accéder "
        "à ces informations."
    )

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):
        if is_rh_or_admin(request.user):
            return True

        salarie = get_user_salarie(request.user)

        if not salarie:
            return False

        return obj.salarie_id == salarie.id


class IsRHOrAdminForCreate(permissions.BasePermission):
    """
    Seuls les RH et administrateurs peuvent créer des données
    pour un autre salarié.
    """

    message = "Cette action est réservée aux RH et administrateurs."

    def has_permission(self, request, view):
        return is_rh_or_admin(request.user)
