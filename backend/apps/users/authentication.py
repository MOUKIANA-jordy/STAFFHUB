from rest_framework.authentication import CSRFCheck
from rest_framework.exceptions import PermissionDenied
from rest_framework_simplejwt.authentication import JWTAuthentication


def enforce_csrf(request):
    """
    Vérifie le token CSRF pour les requêtes authentifiées
    avec les cookies HttpOnly.
    """

    check = CSRFCheck(lambda request: None)

    check.process_request(request)

    reason = check.process_view(
        request,
        None,
        (),
        {},
    )

    if reason:
        raise PermissionDenied(
            f"CSRF Failed: {reason}"
        )


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT pour StaffHub.

    1. Cherche d'abord le JWT dans :
       Authorization: Bearer <token>

    2. Sinon cherche le JWT dans le cookie HttpOnly :
       access_token

    3. Lorsque l'authentification utilise le cookie,
       applique également la protection CSRF.
    """

    def authenticate(self, request):

        # =====================================================
        # 1. AUTHENTIFICATION PAR HEADER BEARER
        # =====================================================

        header = self.get_header(request)

        if header is not None:

            raw_token = self.get_raw_token(
                header
            )

            if raw_token is not None:

                validated_token = (
                    self.get_validated_token(
                        raw_token
                    )
                )

                return (
                    self.get_user(
                        validated_token
                    ),
                    validated_token,
                )


        # =====================================================
        # 2. AUTHENTIFICATION PAR COOKIE HTTPONLY
        # =====================================================

        raw_token = request.COOKIES.get(
            "access_token"
        )

        if raw_token is None:
            return None


        validated_token = (
            self.get_validated_token(
                raw_token
            )
        )


        # =====================================================
        # 3. PROTECTION CSRF
        # =====================================================

        enforce_csrf(request)


        # =====================================================
        # 4. UTILISATEUR AUTHENTIFIÉ
        # =====================================================

        return (
            self.get_user(
                validated_token
            ),
            validated_token,
        )
