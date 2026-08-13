from calendar import monthrange
from decimal import Decimal
from io import BytesIO

from reportlab.lib import colors
from reportlab.lib.enums import (
    TA_CENTER,
    TA_RIGHT,
)
from datetime import date

from apps.paie.services import (
    calculer_cotisations,
)
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
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


# ============================================================
# FORMAT MONÉTAIRE
# ============================================================

def money(value):
    if value is None:
        value = Decimal("0.00")

    value = Decimal(str(value))

    return (
        f"{value:,.2f}"
        .replace(",", " ")
        .replace(".", ",")
    )


# ============================================================
# DONNÉES DU BULLETIN
# ============================================================

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
            type_paiement=(
                Paie.TypePaiement.FICHE_PAIE
            )
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
            mois_paie__year=annee,
            mois_paie__month=mois,
        )
        .order_by(
            "date",
            "heure_arrivee",
        )
    )

    salaire_base = Decimal("0.00")
    taux_horaire = Decimal("0.00")
    majoration_heures_sup = Decimal("0.00")

    if remuneration:
        salaire_base = Decimal(
            str(
                remuneration.salaire_mensuel_brut
                or 0
            )
        )

        taux_horaire = Decimal(
            str(
                remuneration.taux_horaire
                or 0
            )
        )

        majoration_heures_sup = Decimal(
            str(
                remuneration.majoration_heures_sup
                or 0
            )
        )

    heures_travaillees = Decimal("0.00")
    heures_sup = Decimal("0.00")

    for pointage in pointages:
        heures_travaillees += Decimal(
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

    if salaire_base > Decimal("0.00"):
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
                "designation":
                    "Heures supplémentaires",

                "base":
                    f"{heures_sup:.2f} h",

                "taux":
                    f"{taux_horaire:.2f}",

                "montant":
                    montant,

                "sens":
                    "PLUS",
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
            if salaire_base <= Decimal("0.00"):
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

    retenues = sum(
        (
            ligne["montant"]
            for ligne in lignes_revenus
            if ligne["sens"] == "MOINS"
        ),
        Decimal("0.00"),
    )

    brut = total_plus

dernier_jour = monthrange(
    annee,
    mois,
)[1]

date_reference = date(
    annee,
    mois,
    dernier_jour,
)

resultat_cotisations = (
    calculer_cotisations(
        brut=brut,
        date_reference=date_reference,
    )
)

cotisations = (
    resultat_cotisations[
        "lignes"
    ]
)

cotisations_salariales = (
    resultat_cotisations[
        "total_salarial"
    ]
)

cotisations_employeur = (
    resultat_cotisations[
        "total_employeur"
    ]
)

net_social = (
    brut
    - cotisations_salariales
)

net_avant_impot = (
    net_social
    - retenues
)

    return {
        "remuneration": remuneration,
        "paiements": paiements,
        "pointages": pointages,
        "lignes_revenus": lignes_revenus,
        "cotisations": cotisations,
        "salaire_base": salaire_base,
        "taux_horaire": taux_horaire,
        "majoration_heures_sup":
            majoration_heures_sup,
        "heures_travaillees":
            heures_travaillees,
        "heures_sup":
            heures_sup,
        "brut":
            brut,
        "retenues":
            retenues,
        "cotisations_salariales":
            cotisations_salariales,
        "cotisations_employeur":
            cotisations_employeur,
        "net_social":
            net_social,
        "net_avant_impot":
            net_avant_impot,
    }


# ============================================================
# GÉNÉRATION PDF
# ============================================================

def generate_staffhub_bulletin(
    salarie,
    annee,
    mois,
):
    data = get_bulletin_data(
        salarie=salarie,
        annee=annee,
        mois=mois,
    )

    buffer = BytesIO()

    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=8 * mm,
        rightMargin=8 * mm,
        topMargin=6 * mm,
        bottomMargin=6 * mm,
    )

    styles = getSampleStyleSheet()

    # ========================================================
    # COULEURS
    # ========================================================

    green = colors.HexColor("#166534")
    green_light = colors.HexColor("#DCFCE7")
    green_very_light = colors.HexColor("#F0FDF4")

    dark = colors.HexColor("#111827")
    grey = colors.HexColor("#6B7280")
    grey_light = colors.HexColor("#E5E7EB")
    grey_very_light = colors.HexColor("#F9FAFB")
    border = colors.HexColor("#9CA3AF")

    # ========================================================
    # STYLES
    # ========================================================

    normal = ParagraphStyle(
        "normal_staffhub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=6.7,
        leading=8,
        textColor=dark,
    )

    bold = ParagraphStyle(
        "bold_staffhub",
        parent=normal,
        fontName="Helvetica-Bold",
    )

    small = ParagraphStyle(
        "small_staffhub",
        parent=normal,
        fontSize=5.9,
        leading=7,
    )

    center = ParagraphStyle(
        "center_staffhub",
        parent=normal,
        alignment=TA_CENTER,
    )

    right = ParagraphStyle(
        "right_staffhub",
        parent=normal,
        alignment=TA_RIGHT,
    )

    company = ParagraphStyle(
        "company_staffhub",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=19,
        leading=20,
        textColor=green,
    )

    bulletin_title = ParagraphStyle(
        "bulletin_title",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=17,
        alignment=TA_RIGHT,
        textColor=dark,
    )

    employee_name = ParagraphStyle(
        "employee_name",
        parent=normal,
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=10,
    )

    net_label = ParagraphStyle(
        "net_label",
        parent=normal,
        fontName="Helvetica-Bold",
        fontSize=8,
        leading=9,
    )

    net_amount = ParagraphStyle(
        "net_amount",
        parent=normal,
        fontName="Helvetica-Bold",
        fontSize=12,
        leading=13,
        alignment=TA_RIGHT,
        textColor=green,
    )

    footer_style = ParagraphStyle(
        "footer",
        parent=small,
        alignment=TA_CENTER,
        textColor=grey,
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

    # ========================================================
    # EN-TÊTE
    # ========================================================

    header_left = [
        Paragraph(
            "STAFFHUB",
            company,
        ),
        Paragraph(
            "<b>Plateforme de gestion RH</b>",
            normal,
        ),
        Paragraph(
            "Document de démonstration",
            small,
        ),
    ]

    header_right = [
        Paragraph(
            "BULLETIN DE PAIE",
            bulletin_title,
        ),
        Paragraph(
            (
                "<b>Période :</b> "
                f"{periode}"
            ),
            right,
        ),
        Paragraph(
            (
                "<b>Bulletin :</b> "
                f"{mois:02d}/{annee}"
            ),
            right,
        ),
    ]

    header = Table(
        [
            [
                header_left,
                header_right,
            ]
        ],
        colWidths=[
            95 * mm,
            98 * mm,
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

    ligne = Table(
        [[""]],
        colWidths=[
            193 * mm,
        ],
        rowHeights=[
            1.4 * mm,
        ],
    )

    ligne.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                green,
            )
        ])
    )

    elements.append(ligne)

    elements.append(
        Spacer(
            1,
            2.5 * mm,
        )
    )

    # ========================================================
    # IDENTITÉ SALARIÉ
    # ========================================================

    infos_contrat = [
        Paragraph(
            (
                "<b>Matricule :</b> "
                f"{salarie.matricule}"
            ),
            normal,
        ),
        Paragraph(
            (
                "<b>Contrat :</b> "
                f"{salarie.get_type_contrat_display()}"
            ),
            normal,
        ),
        Paragraph(
            (
                "<b>Poste :</b> "
                f"{salarie.poste}"
            ),
            normal,
        ),
        Paragraph(
            (
                "<b>Établissement :</b> "
                f"{salarie.etablissement}"
            ),
            normal,
        ),
        Paragraph(
            (
                "<b>Date d'entrée :</b> "
                f"{salarie.date_debut_contrat.strftime('%d/%m/%Y')}"
            ),
            normal,
        ),
    ]

    infos_salarie = [
        Paragraph(
            (
                f"{salarie.prenom} "
                f"{salarie.nom.upper()}"
            ),
            employee_name,
        ),
        Paragraph(
            (
                f"<b>Email :</b> "
                f"{salarie.email_personnel}"
            ),
            normal,
        ),
        Paragraph(
            (
                f"<b>Téléphone :</b> "
                f"{salarie.telephone or '-'}"
            ),
            normal,
        ),
    ]

    identity = Table(
        [
            [
                infos_contrat,
                infos_salarie,
            ]
        ],
        colWidths=[
            96 * mm,
            97 * mm,
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
            (
                "BOX",
                (0, 0),
                (-1, -1),
                0.6,
                border,
            ),
            (
                "LINEBEFORE",
                (1, 0),
                (1, 0),
                0.6,
                border,
            ),
            (
                "BACKGROUND",
                (0, 0),
                (-1, -1),
                grey_very_light,
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                6,
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                5,
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                5,
            ),
        ])
    )

    elements.append(identity)

    elements.append(
        Spacer(
            1,
            2.5 * mm,
        )
    )

    # ========================================================
    # TABLEAU PRINCIPAL
    # ========================================================

    rows = [
        [
            Paragraph(
                "<b>Désignation</b>",
                center,
            ),
            Paragraph(
                "<b>Base</b>",
                center,
            ),
            Paragraph(
                "<b>Taux</b>",
                center,
            ),
            Paragraph(
                "<b>Salarié</b>",
                center,
            ),
            Paragraph(
                "<b>Employeur</b>",
                center,
            ),
        ],

        [
            Paragraph(
                "<b>ÉLÉMENTS DE RÉMUNÉRATION</b>",
                bold,
            ),
            "",
            "",
            "",
            "",
        ],
    ]

    for ligne_revenu in data[
        "lignes_revenus"
    ]:
        montant = money(
            ligne_revenu["montant"]
        )

        if (
            ligne_revenu["sens"]
            == "MOINS"
        ):
            montant = (
                f"-{montant}"
            )

        rows.append([
            Paragraph(
                ligne_revenu["designation"],
                normal,
            ),
            Paragraph(
                str(
                    ligne_revenu["base"]
                ),
                right,
            ),
            Paragraph(
                str(
                    ligne_revenu["taux"]
                ),
                right,
            ),
            Paragraph(
                montant,
                right,
            ),
            "",
        ])

    rows.append([
        Paragraph(
            "<b>TOTAL BRUT</b>",
            bold,
        ),
        "",
        "",
        Paragraph(
            (
                "<b>"
                f"{money(data['brut'])}"
                "</b>"
            ),
            right,
        ),
        "",
    ])

    index_cotisations = len(rows)

    rows.append([
        Paragraph(
            (
                "<b>COTISATIONS ET "
                "CONTRIBUTIONS SOCIALES</b>"
            ),
            bold,
        ),
        "",
        "",
        "",
        "",
    ])

    for cotisation in data[
    "cotisations"
]:
    taux_salarial = (
        cotisation[
            "taux_salarial"
        ]
    )

    taux_employeur = (
        cotisation[
            "taux_employeur"
        ]
    )

    part_salariale = (
        cotisation[
            "part_salariale"
        ]
    )

    part_employeur = (
        cotisation[
            "part_employeur"
        ]
    )

    rows.append([
        Paragraph(
            cotisation["libelle"],
            normal,
        ),

        Paragraph(
            money(
                cotisation["base"]
            ),
            right,
        ),

        Paragraph(
            (
                f"{taux_salarial} %"
                if taux_salarial
                else ""
            ),
            right,
        ),

        Paragraph(
            money(
                part_salariale
            ),
            right,
        ),

        Paragraph(
            money(
                part_employeur
            ),
            right,
        ),
    ])
        rows.append([
            Paragraph(
                libelle,
                normal,
            ),
            Paragraph(
                money(
                    data["brut"]
                ),
                right,
            ),
            "",
            Paragraph(
                "—",
                center,
            ),
            Paragraph(
                "—",
                center,
            ),
        ])

    rows.append([
        Paragraph(
            "<b>TOTAL COTISATIONS</b>",
            bold,
        ),
        "",
        "",
        Paragraph(
            money(
                data[
                    "cotisations_salariales"
                ]
            ),
            right,
        ),
        Paragraph(
            money(
                data[
                    "cotisations_employeur"
                ]
            ),
            right,
        ),
    ])

    table_paie = Table(
        rows,
        colWidths=[
            78 * mm,
            28 * mm,
            26 * mm,
            31 * mm,
            30 * mm,
        ],
    )

    table_paie.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.35,
                border,
            ),

            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                grey_light,
            ),

            (
                "BACKGROUND",
                (0, 1),
                (-1, 1),
                grey_very_light,
            ),

            (
                "SPAN",
                (0, 1),
                (-1, 1),
            ),

            (
                "BACKGROUND",
                (0, index_cotisations),
                (-1, index_cotisations),
                grey_very_light,
            ),

            (
                "SPAN",
                (0, index_cotisations),
                (-1, index_cotisations),
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
                2.2,
            ),

            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                2.2,
            ),
        ])
    )

    elements.append(table_paie)

    elements.append(
        Spacer(
            1,
            2.2 * mm,
        )
    )

    # ========================================================
    # NET SOCIAL / NET À PAYER
    # ========================================================

    net_rows = [
        [
            Paragraph(
                "MONTANT NET SOCIAL",
                net_label,
            ),
            Paragraph(
                (
                    f"{money(data['net_social'])} €"
                ),
                net_amount,
            ),
        ],

        [
            Paragraph(
                (
                    "NET À PAYER AVANT "
                    "IMPÔT SUR LE REVENU"
                ),
                net_label,
            ),
            Paragraph(
                (
                    f"{money(data['net_avant_impot'])} €"
                ),
                net_amount,
            ),
        ],

        [
            Paragraph(
                "Prélèvement à la source",
                normal,
            ),
            Paragraph(
                "Non calculé",
                right,
            ),
        ],

        [
            Paragraph(
                "NET À PAYER",
                net_label,
            ),
            Paragraph(
                (
                    f"{money(data['net_avant_impot'])} €"
                ),
                net_amount,
            ),
        ],
    ]

    net_table = Table(
        net_rows,
        colWidths=[
            145 * mm,
            48 * mm,
        ],
    )

    net_table.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                grey,
            ),

            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                green_very_light,
            ),

            (
                "BACKGROUND",
                (0, 1),
                (-1, 1),
                grey_light,
            ),

            (
                "BACKGROUND",
                (0, 3),
                (-1, 3),
                green_light,
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

            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                5,
            ),

            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                5,
            ),
        ])
    )

    elements.append(net_table)

    elements.append(
        Spacer(
            1,
            2.2 * mm,
        )
    )

    # ========================================================
    # CALENDRIER COMPACT
    # ========================================================

    pointages_par_jour = {}

    for pointage in data[
        "pointages"
    ]:
        jour = pointage.date.day

        if jour not in pointages_par_jour:
            pointages_par_jour[
                jour
            ] = Decimal("0.00")

        pointages_par_jour[
            jour
        ] += Decimal(
            str(
                pointage.heures_travaillees
                or 0
            )
        )

    jours_1 = list(
        range(
            1,
            min(
                16,
                dernier_jour + 1,
            ),
        )
    )

    jours_2 = list(
        range(
            16,
            dernier_jour + 1,
        )
    )

    def calendrier_bloc(jours):
        header_row = [
            Paragraph(
                "<b>Jour</b>",
                small,
            )
        ]

        heures_row = [
            Paragraph(
                "<b>H.</b>",
                small,
            )
        ]

        for jour in jours:
            header_row.append(
                Paragraph(
                    str(jour),
                    center,
                )
            )

            heures = (
                pointages_par_jour.get(
                    jour,
                    Decimal("0.00"),
                )
            )

            heures_row.append(
                Paragraph(
                    (
                        f"{heures:.2f}"
                        if heures > 0
                        else ""
                    ),
                    center,
                )
            )

        # Première colonne plus large
        # pour éviter le "Heure / s".
        nombre_jours = len(jours)

        largeur_restante = (
            193 * mm
            - 13 * mm
        )

        largeur_jour = (
            largeur_restante
            / nombre_jours
        )

        table = Table(
            [
                header_row,
                heures_row,
            ],
            colWidths=[
                13 * mm,
                *[
                    largeur_jour
                    for _ in jours
                ],
            ],
        )

        table.setStyle(
            TableStyle([
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.3,
                    border,
                ),

                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    grey_light,
                ),

                (
                    "BACKGROUND",
                    (0, 0),
                    (0, -1),
                    grey_very_light,
                ),

                (
                    "ALIGN",
                    (0, 0),
                    (-1, -1),
                    "CENTER",
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
                    2,
                ),

                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    2,
                ),
            ])
        )

        return table

    elements.append(
        Paragraph(
            "<b>CALENDRIER DES HEURES</b>",
            bold,
        )
    )

    elements.append(
        calendrier_bloc(
            jours_1
        )
    )

    if jours_2:
        elements.append(
            calendrier_bloc(
                jours_2
            )
        )

    elements.append(
        Spacer(
            1,
            2.2 * mm,
        )
    )

    # ========================================================
    # RÉCAPITULATIF
    # ========================================================

    recap = Table(
        [
            [
                Paragraph(
                    "<b>Brut</b>",
                    center,
                ),
                Paragraph(
                    "<b>Retenues</b>",
                    center,
                ),
                Paragraph(
                    "<b>Heures</b>",
                    center,
                ),
                Paragraph(
                    "<b>H. sup.</b>",
                    center,
                ),
                Paragraph(
                    "<b>Net à payer</b>",
                    center,
                ),
            ],

            [
                money(
                    data["brut"]
                ),

                money(
                    data["retenues"]
                ),

                (
                    f"{data['heures_travaillees']:.2f}"
                ),

                (
                    f"{data['heures_sup']:.2f}"
                ),

                money(
                    data[
                        "net_avant_impot"
                    ]
                ),
            ],
        ],
        colWidths=[
            38.6 * mm,
            38.6 * mm,
            38.6 * mm,
            38.6 * mm,
            38.6 * mm,
        ],
    )

    recap.setStyle(
        TableStyle([
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.4,
                border,
            ),

            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                grey_light,
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
                6.4,
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

    elements.append(recap)

    elements.append(
        Spacer(
            1,
            2 * mm,
        )
    )

    # ========================================================
    # PIED DE PAGE
    # ========================================================

    elements.append(
        Paragraph(
            (
                "<b>Document de démonstration StaffHub</b>"
                "<br/>"
                "Les cotisations sociales et le "
                "prélèvement à la source ne sont "
                "pas encore calculés automatiquement. "
                "Ce document ne constitue pas un "
                "bulletin de paie officiel."
            ),
            footer_style,
        )
    )

    # ========================================================
    # BUILD
    # ========================================================

    doc.build(
        elements
    )

    pdf_content = (
        buffer.getvalue()
    )

    buffer.close()

    return pdf_content
