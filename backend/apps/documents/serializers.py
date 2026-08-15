import os

from rest_framework import serializers

from .models import Document


class DocumentSerializer(
    serializers.ModelSerializer
):
    salarie_nom = (
        serializers.SerializerMethodField()
    )

    type_document_display = (
        serializers.CharField(
            source="get_type_document_display",
            read_only=True,
        )
    )

    nom_fichier = (
        serializers.CharField(
            read_only=True,
        )
    )

    extension = (
        serializers.CharField(
            read_only=True,
        )
    )

    taille = (
        serializers.IntegerField(
            read_only=True,
        )
    )

    est_expire = (
        serializers.BooleanField(
            read_only=True,
        )
    )

    uploaded_by_username = (
        serializers.CharField(
            source="uploaded_by.username",
            read_only=True,
            allow_null=True,
        )
    )

    fichier_url = (
        serializers.SerializerMethodField()
    )

    class Meta:
        model = Document

        fields = [
            "id",
            "salarie",
            "salarie_nom",
            "type_document",
            "type_document_display",
            "titre",
            "fichier",
            "fichier_url",
            "nom_fichier",
            "extension",
            "taille",
            "numero",
            "date_emission",
            "date_expiration",
            "description",
            "archive",
            "est_expire",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "salarie",
            "salarie_nom",
            "type_document_display",
            "fichier_url",
            "nom_fichier",
            "extension",
            "taille",
            "est_expire",
            "uploaded_by",
            "uploaded_by_username",
            "uploaded_at",
            "updated_at",
        ]

    def get_salarie_nom(
        self,
        obj,
    ):
        return str(
            obj.salarie
        )

    def get_fichier_url(
        self,
        obj,
    ):
        if not obj.fichier:
            return None

        request = (
            self.context.get(
                "request"
            )
        )

        try:
            url = (
                obj.fichier.url
            )

        except ValueError:
            return None

        if request:
            return (
                request
                .build_absolute_uri(
                    url
                )
            )

        return url

    def validate_fichier(
        self,
        fichier,
    ):
        max_size = (
            10
            * 1024
            * 1024
        )

        if fichier.size > max_size:
            raise serializers.ValidationError(
                "Le fichier ne doit pas "
                "dépasser 10 Mo."
            )

        extension = (
            os.path.splitext(
                fichier.name
            )[1]
            .lower()
        )

        allowed_extensions = {
            ".pdf",
            ".jpg",
            ".jpeg",
            ".png",
            ".doc",
            ".docx",
        }

        if (
            extension
            not in allowed_extensions
        ):
            raise serializers.ValidationError(
                "Formats autorisés : "
                "PDF, JPG, JPEG, PNG, "
                "DOC et DOCX."
            )

        content_type = getattr(
            fichier,
            "content_type",
            "",
        )

        allowed_content_types = {
            "application/pdf",
            "image/jpeg",
            "image/png",
            "application/msword",
            (
                "application/"
                "vnd.openxmlformats-officedocument."
                "wordprocessingml.document"
            ),
        }

        if (
            content_type
            and content_type
            not in allowed_content_types
        ):
            raise serializers.ValidationError(
                "Le type réel du fichier "
                "n’est pas autorisé."
            )

        return fichier

    def validate(
        self,
        attrs,
    ):
        date_emission = attrs.get(
            "date_emission",
            getattr(
                self.instance,
                "date_emission",
                None,
            ),
        )

        date_expiration = attrs.get(
            "date_expiration",
            getattr(
                self.instance,
                "date_expiration",
                None,
            ),
        )

        if (
            date_emission
            and date_expiration
            and date_expiration
            < date_emission
        ):
            raise serializers.ValidationError({
                "date_expiration": (
                    "La date d’expiration "
                    "ne peut pas être "
                    "antérieure à la date "
                    "d’émission."
                )
            })

        return attrs
