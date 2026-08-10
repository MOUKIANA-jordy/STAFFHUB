from rest_framework import permissions

from apps.users.models import Salarie


def is_rh_or_admin(user):
    if not user or not user.is_authenticated:
        return False

    if user.is_superuser:
        return True

    salarie = getattr(
        user,
        "salarie",
        None,
    )

    return bool(
        salarie
        and salarie.role in [
            Salarie.Role.RH,
            Salarie.Role.ADMIN,
        ]
    )


class IsPointageOwnerOrRH(
    permissions.BasePermission
):
    message = (
        "Vous n’avez pas la permission "
        "d’accéder à ce pointage."
    )

    def has_permission(
        self,
        request,
        view,
    ):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        if is_rh_or_admin(
            request.user
        ):
            return True

        salarie = getattr(
            request.user,
            "salarie",
            None,
        )

        if not salarie:
            return False

        return (
            obj.salarie_id
            == salarie.id
        )
