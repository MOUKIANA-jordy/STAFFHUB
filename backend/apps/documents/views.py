from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .serializers import DocumentSerializer
from .models import Document
from apps.users.permissions import IsOwnerOrRH

class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated, IsOwnerOrRH]

    def get_queryset(self):
        user = self.request.user
        if user.role in ["RH", "ADMIN"]:
            return Document.objects.all()
        return Document.objects.filter(salarie=user)
