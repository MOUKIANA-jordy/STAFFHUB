from rest_framework_simplejwt.authentication import JWTAuthentication


class CookieJWTAuthentication(JWTAuthentication):
    """
    Authentification JWT pour StaffHub.

    Cherche d'abord le token dans le header Authorization.
    S'il n'existe pas, cherche le token dans le cookie HttpOnly.
    """

    def authenticate(self, request):
        # 1. Essayer d'abord Authorization: Bearer <token>
        header = self.get_header(request)

        if header is not None:
            raw_token = self.get_raw_token(header)

            if raw_token is not None:
                validated_token = self.get_validated_token(raw_token)

                return self.get_user(validated_token), validated_token

        # 2. Sinon chercher dans le cookie HttpOnly
        raw_token = request.COOKIES.get("access_token")

        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)

        return self.get_user(validated_token), validated_token
