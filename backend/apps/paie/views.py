from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Paie
from django.http import HttpResponse
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet
from rest_framework.decorators import api_view, permission_classes
from .serializers import PaieSerializer
from apps.users.permissions import IsOwnerOrRH

class PaieViewSet(viewsets.ModelViewSet):
    queryset = Paie.objects.all()
    serializer_class = PaieSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrRH]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["RH", "ADMIN"]:
            return Paie.objects.all()
        return Paie.objects.filter(salarie=user)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def generate_fiche_paie(request, pk):

    fiche = Paie.objects.get(id=pk)

    response = HttpResponse(content_type="application/pdf")

    # 🔥 preview dans navigateur
    response["Content-Disposition"] = f'inline; filename="fiche_{pk}.pdf"'

    doc = SimpleDocTemplate(response)
    styles = getSampleStyleSheet()

    elements = []

    # ===== TITRE =====
    elements.append(Paragraph("FICHE DE PAIE", styles["Title"]))
    elements.append(Spacer(1, 20))

    # ===== INFOS =====
    elements.append(Paragraph(f"Nom: {fiche.salarie.nom}", styles["Normal"]))
    elements.append(Paragraph(f"Prénom: {fiche.salarie.prenom}", styles["Normal"]))
    elements.append(Paragraph(f"Mois: {fiche.mois}", styles["Normal"]))
    elements.append(Spacer(1, 20))

    # ===== TABLE SALAIRE =====
    data = [
        ["Désignation", "Montant (€)"],
        ["Salaire Brut", fiche.salaire],
        ["Cotisations (-)", "-300"],
        ["Net à payer", fiche.salaire - 300],
    ]

    table = Table(data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.grey),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 1, colors.black),
    ]))

    elements.append(table)

    doc.build(elements)

    return response
