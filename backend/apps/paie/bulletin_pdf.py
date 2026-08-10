from calendar import monthrange
from decimal import Decimal
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from apps.paie.models import Paie
from apps.pointage.models import Pointage
from apps.remunerations.models import Remuneration


def money(value):
    if value is None:
        return "0,00"

    value = Decimal(str(value))

    return (
        f"{value:,.2f}"
        .replace(",", " ")
        .replace(".", ",")
    )


def get_bulletin_data(
    salarie,
    annee,
    mois,
):
    remuneration = (
        Remuneration.objects
        .filter(
            salarie=salarie,
            actif=True,
        )
        .order_by("-date_debut")
        .first()
    )

    paiements = (
        Paie.objects
        .filter(
            salarie=salarie,
            date_paiement__year=annee,
            date_paiement__month=mois,
        )
        .exclude(
            type_paiement=Paie.TypePaiement.FICHE_PAIE
        )
        .order_by(
            "date_paiement",
            "created_at",
        )
    )

    pointages = (
        Pointage.objects
        .filter(
            salarie=salarie,
            date__year=annee,
            date__month=mois,
        )
        .order_by("date")
    )

    salaire_base = Decimal("0.00")

    if (
        remuneration
        and remuneration.salaire_mensuel_brut
    ):
        salaire_base = Decimal(
            str(
                remuneration.salaire_mensuel_brut
            )
        )

    taux_horaire = Decimal("0.00")

    if remuneration:
        taux_horaire = Decimal(
            str(
                remuneration.taux_horaire
                or 0
            )
        )

    heures_normales = Decimal("0.00")
    heures_sup = Decimal("0.00")

    for pointage in pointages:
        heures_normales += Decimal(
            str(
                pointage.heures_travaillees
                or 0
            )
        )

        heures_sup += Decimal(
            str(
                pointage.heures_sup
                or 0
            )
        )

    lignes_revenus = []

    if salaire_base > 0:
        lignes_revenus.append({
            "designation": "Salaire de base",
            "base": "",
            "taux": "",
            "montant": salaire_base,
            "sens": "PLUS",
        })

    for paiement in paiements:
        montant = Decimal(
            str(
                paiement.montant
                or 0
            )
        )

        if (
            paiement.type_paiement
            == Paie.TypePaiement.HEURES_SUP
        ):
            lignes_revenus.append({
                "designation": (
                    "Heures supplémentaires"
                ),
                "base": (
                    f"{heures_sup:.2f} h"
                ),
                "taux": (
                    f"{taux_horaire:.2f}"
                ),
                "montant": montant,
                "sens": "PLUS",
            })

        elif (
            paiement.type_paiement
            == Paie.TypePaiement.CET
        ):
            lignes_revenus.append({
                "designation": "Paiement CET",
                "base": "",
                "taux": "",
                "montant": montant,
                "sens": "PLUS",
            })

        elif (
            paiement.type_paiement
            == Paie.TypePaiement.ACOMPTE
        ):
            lignes_revenus.append({
                "designation": "Acompte",
                "base": "",
                "taux": "",
                "montant": montant,
                "sens": "MOINS",
            })

        elif (
            paiement.type_paiement
            == Paie.TypePaiement.AVANCE
        ):
            lignes_revenus.append({
                "designation": "Avance",
                "base": "",
                "taux": "",
                "montant": montant,
                "sens": "MOINS",
            })

        elif (
            paiement.type_paiement
            == Paie.TypePaiement.SALAIRE
        ):
            # Évite de doubler le salaire si le brut
            # mensuel est déjà renseigné dans Remuneration.
            if salaire_base <= 0:
                lignes_revenus.append({
                    "designation": "Salaire",
                    "base": "",
                    "taux": "",
                    "montant": montant,
                    "sens": "PLUS",
                })

    total_plus = sum(
        (
            ligne["montant"]
            for ligne in lignes_revenus
            if ligne["sens"] == "PLUS"
        ),
        Decimal("0.00"),
    )

    total_moins = sum(
        (
            ligne["montant"]
            for ligne in lignes_revenus
            if ligne["sens"] == "MOINS"
        ),
        Decimal("0.00"),
    )

    # StaffHub ne gère pas encore les vraies
    # cotisations sociales.
    cotisations_salariales = Decimal("0.00")
    cotisations_employeur = Decimal("0.00")

    brut = total_plus

    net_avant_impot = (
        brut
        - cotisations_salariales
        - total_moins
    )

    net_social = (
        brut
        - cotisations_salariales
    )

    return {
        "remuneration": remuneration,
        "paiements": paiements,
        "pointages": pointages,
        "lignes_revenus": lignes_revenus,
        "salaire_base": salaire_base,
        "taux_horaire": taux_horaire,
        "heures_normales": heures_normales,
        "heures_sup": heures_sup,
        "brut": brut,
        "retenues": total_moins,
        "cotisations_salariales":
            cotisations_salariales,
        "cotisations_employeur":
            cotisations_employeur,
        "net_social": net_social,
        "net_avant_impot":
            net_avant_impot,
    }


def generate_staffhub_bulletin(
    salarie,
    annee,
    mois,
):
    data = get_bulletin_data(
        salarie,
        annee,
        mois,
    )

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=12 * mm,
        leftMargin=12 * mm,
        topMargin=10 * mm,
        bottomMargin=10 * mm,
    )

    styles = getSampleStyleSheet()

    small = ParagraphStyle(
        "small",
        parent=styles["Normal"],
        fontSize=7.5,
        leading=9,
    )

    small_bold = ParagraphStyle(
        "small_bold",
        parent=small,
        fontName="Helvetica-Bold",
    )

    title = ParagraphStyle(
        "title_staffhub",
        parent=styles["Heading1"],
        fontSize=17,
        leading=19,
        alignment=TA_RIGHT,
        spaceAfter=2,
    )

    right_small = ParagraphStyle(
        "right_small",
        parent=small,
        alignment=TA_RIGHT,
    )

    center_small = ParagraphStyle(
        "center_small",
        parent=small,
        alignment=TA_CENTER,
    )

    elements = []

    dernier_jour = monthrange(
        annee,
        mois,
    )[1]

    periode = (
        f"01/{mois:02d}/{annee} "
        f"au "
        f"{dernier_jour:02d}/{mois:02d}/{annee}"
    )

    # ======================================================
    # EN-TÊTE
    # ======================================================

    entreprise = [
        Paragraph(
            "<b>STAFFHUB</b>",
            styles["Heading2"],
        ),
        Paragraph(
            "Plateforme de gestion RH",
            small,
        ),
        Paragraph(
            "Document de démonstration",
            small,
        ),
    ]

    bulletin_header = [
        Paragraph(
            "<b>BULLETIN DE PAIE</b>",
            title,
        ),
        Paragraph(
            f"Période de paie : {periode}",
            right_small,
        ),
        Paragraph(
            (
                f"Bulletin du "
                f"{mois:02d}/{annee}"
            ),
            right_small,
        ),
    ]

    header = Table(
        [
            [
                entreprise,
                bulletin_header,
            ]
        ],
        colWidths=[
            90 * mm,
            90 * mm,
        ],
    )

    header.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP",
            ),
        ])
    )

    elements.append(header)

    elements.append(
        Spacer(1, 7 * mm)
    )

    # ======================================================
    # IDENTITÉ SALARIÉ
    # ======================================================

    infos_gauche = [
        Paragraph(
            (
                f"<b>Matricule :</b> "
                f"{salarie.matricule}"
            ),
            small,
        ),
        Paragraph(
            (
                f"<b>Type contrat :</b> "
                f"{salarie.get_type_contrat_display()}"
            ),
            small,
        ),
        Paragraph(
            (
                f"<b>Poste :</b> "
                f"{salarie.poste}"
            ),
            small,
        ),
        Paragraph(
            (
                f"<b>Établissement :</b> "
                f"{salarie.etablissement}"
            ),
            small,
        ),
        Paragraph(
            (
                f"<b>Date début contrat :</b> "
                f"{salarie.date_debut_contrat.strftime('%d/%m/%Y')}"
            ),
            small,
        ),
    ]

    infos_droite = [
        Paragraph(
            (
                f"<b>{salarie.prenom} "
                f"{salarie.nom.upper()}</b>"
            ),
            small_bold,
        ),
        Paragraph(
            (
                f"Email : "
                f"{salarie.email_personnel}"
            ),
            small,
        ),
        Paragraph(
            (
                f"Téléphone : "
                f"{salarie.telephone or '-'}"
            ),
            small,
        ),
    ]

    identity = Table(
        [
            [
                infos_gauche,
                infos_droite,
            ]
        ],
        colWidths=[
            90 * mm,
            90 * mm,
        ],
    )

    identity.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP",
            ),
        ])
    )

    elements.append(identity)

    elements.append(
        Spacer(1, 6 * mm)
    )

    # ======================================================
    # TABLEAU PRINCIPAL
    # ======================================================

    main_rows = [
        [
            Paragraph(
                "<b>Désignation</b>",
                center_small,
            ),
            Paragraph(
                "<b>Base</b>",
                center_small,
            ),
            Paragraph(
                "<b>Taux</b>",
                center_small,
            ),
            Paragraph(
                "<b>Part salarié</b>",
                center_small,
            ),
            Paragraph(
                "<b>Part employeur</b>",
                center_small,
            ),
        ],
        [
            Paragraph(
                "<b>Éléments de revenu</b>",
                small_bold,
            ),
            "",
            "",
            "",
            "",
        ],
    ]

    for ligne in data["lignes_revenus"]:
        montant = ligne["montant"]

        if ligne["sens"] == "MOINS":
            montant_texte = (
                f"-{money(montant)}"
            )
        else:
            montant_texte = (
                money(montant)
            )

        main_rows.append([
            Paragraph(
                ligne["designation"],
                small,
            ),
            Paragraph(
                str(ligne["base"]),
                right_small,
            ),
            Paragraph(
                str(ligne["taux"]),
                right_small,
            ),
            Paragraph(
                montant_texte,
                right_small,
            ),
            "",
        ])

    main_rows.append([
        Paragraph(
            "<b>TOTAL BRUT</b>",
            small_bold,
        ),
        "",
        "",
        Paragraph(
            f"<b>{money(data['brut'])}</b>",
            right_small,
        ),
        "",
    ])

    main_rows.append([
        Paragraph(
            "<b>Cotisations et contributions sociales</b>",
            small_bold,
        ),
        "",
        "",
        "",
        "",
    ])

    main_rows.append([
        Paragraph(
            (
                "Cotisations non calculées "
                "dans cette version de démonstration."
            ),
            small,
        ),
        "",
        "",
        Paragraph(
            money(
                data["cotisations_salariales"]
            ),
            right_small,
        ),
        Paragraph(
            money(
                data["cotisations_employeur"]
            ),
            right_small,
        ),
    ])

    main_table = Table(
        main_rows,
        colWidths=[
            78 * mm,
            25 * mm,
            25 * mm,
            28 * mm,
            28 * mm,
        ],
        repeatRows=1,
    )

    main_table.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.black,
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.lightgrey,
            ),
            (
                "BACKGROUND",
                (0, 1),
                (-1, 1),
                colors.whitesmoke,
            ),
            (
                "SPAN",
                (0, 1),
                (-1, 1),
            ),
            (
                "SPAN",
                (0, -2),
                (-1, -2),
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE",
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                3,
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                3,
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                3,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                3,
            ),
        ])
    )

    elements.append(main_table)

    elements.append(
        Spacer(1, 4 * mm)
    )

    # ======================================================
    # CALENDRIER
    # ======================================================

    pointages_par_jour = {
        p.date.day: p
        for p in data["pointages"]
    }

    calendrier = [
        [
            Paragraph(
                "<b>Jour</b>",
                center_small,
            ),
            Paragraph(
                "<b>Heures</b>",
                center_small,
            ),
        ]
    ]

    for jour in range(
        1,
        dernier_jour + 1,
    ):
        pointage = (
            pointages_par_jour.get(
                jour
            )
        )

        heures = ""

        if pointage:
            heures = (
                f"{pointage.heures_travaillees:.2f}"
                if pointage.heures_travaillees
                is not None
                else ""
            )

        calendrier.append([
            f"{jour:02d}/{mois:02d}",
            heures,
        ])

    calendrier_table = Table(
        calendrier,
        colWidths=[
            22 * mm,
            22 * mm,
        ],
    )

    calendrier_table.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.4,
                colors.grey,
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.lightgrey,
            ),
            (
                "FONTSIZE",
                (0, 0),
                (-1, -1),
                6.5,
            ),
            (
                "ALIGN",
                (0, 0),
                (-1, -1),
                "CENTER",
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                1,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                1,
            ),
        ])
    )

    # ======================================================
    # NET
    # ======================================================

    resume = [
        [
            Paragraph(
                "<b>MONTANT NET SOCIAL</b>",
                small_bold,
            ),
            Paragraph(
                (
                    f"<b>"
                    f"{money(data['net_social'])} €"
                    f"</b>"
                ),
                right_small,
            ),
        ],
        [
            Paragraph(
                (
                    "<b>NET À PAYER "
                    "AVANT IMPÔT SUR LE REVENU</b>"
                ),
                small_bold,
            ),
            Paragraph(
                (
                    f"<b>"
                    f"{money(data['net_avant_impot'])} €"
                    f"</b>"
                ),
                right_small,
            ),
        ],
        [
            Paragraph(
                "Prélèvement à la source",
                small,
            ),
            Paragraph(
                "Non calculé",
                right_small,
            ),
        ],
        [
            Paragraph(
                "<b>NET À PAYER</b>",
                small_bold,
            ),
            Paragraph(
                (
                    f"<b>"
                    f"{money(data['net_avant_impot'])} €"
                    f"</b>"
                ),
                right_small,
            ),
        ],
    ]

    resume_table = Table(
        resume,
        colWidths=[
            105 * mm,
            31 * mm,
        ],
    )

    resume_table.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.6,
                colors.black,
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.whitesmoke,
            ),
            (
                "BACKGROUND",
                (0, 1),
                (-1, 1),
                colors.lightgrey,
            ),
            (
                "BACKGROUND",
                (0, 3),
                (-1, 3),
                colors.lightgrey,
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE",
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                4,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                4,
            ),
        ])
    )

    bottom = Table(
        [
            [
                resume_table,
                calendrier_table,
            ]
        ],
        colWidths=[
            138 * mm,
            44 * mm,
        ],
    )

    bottom.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP",
            ),
        ])
    )

    elements.append(bottom)

    elements.append(
        Spacer(1, 4 * mm)
    )

    # ======================================================
    # RÉCAPITULATIF
    # ======================================================

    recap = Table(
        [
            [
                "Brut",
                "Retenues",
                "Heures payées",
                "Net à payer",
            ],
            [
                money(data["brut"]),
                money(data["retenues"]),
                (
                    f"{data['heures_normales']:.2f}"
                ),
                money(
                    data["net_avant_impot"]
                ),
            ],
        ],
        colWidths=[
            45 * mm,
            45 * mm,
            45 * mm,
            45 * mm,
        ],
    )

    recap.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.black,
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.lightgrey,
            ),
            (
                "ALIGN",
                (0, 0),
                (-1, -1),
                "CENTER",
            ),
            (
                "FONTSIZE",
                (0, 0),
                (-1, -1),
                7,
            ),
        ])
    )

    elements.append(recap)

    elements.append(
        Spacer(1, 4 * mm)
    )

    # ======================================================
    # PIED DE PAGE
    # ======================================================

    footer = Paragraph(
        (
            "<b>Document de démonstration StaffHub.</b><br/>"
            "Ce document est généré à partir des données "
            "présentes dans l'application et ne constitue "
            "pas un bulletin de paie officiel."
        ),
        ParagraphStyle(
            "footer",
            parent=small,
            alignment=TA_CENTER,
            fontSize=6.5,
            leading=8,
        ),
    )

    elements.append(footer)

    doc.build(
        elements
    )

    pdf_content = (
        buffer.getvalue()
    )

    buffer.close()

    return pdf_content
