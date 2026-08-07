from rest_framework import permissions


def get_salarie(user):
    if not user or not user.is_authenticated:
        return None

    return getattr(user, "salarie", None)


def is_rh_or_admin(user):
    salarie = get_salarie(user)

    return bool(
        salarie
        and salarie.role in [
            salarie.Role.RH,
            salarie.Role.ADMIN,
        ]
    )


class IsRHOrAdmin(permissions.BasePermission):
    message = "Cette action est réservée aux RH et administrateurs."

    def has_permission(self, request, view):
        return is_rh_or_admin(request.user)


class IsAdminOrRH(IsRHOrAdmin):
    pass


class IsOwnerOrRH(permissions.BasePermission):
    message = "Vous ne pouvez accéder qu’à votre propre profil."

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
        )

    def has_object_permission(self, request, view, obj):
        if is_rh_or_admin(request.user):
            return True

        return obj.user_id == request.user.id
