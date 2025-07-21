from rest_framework import serializers
from .models import Archivo, RegistroFonasa


class ArchivoSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Archivo
        fields = "__all__"


class RegistroFonasaSerializer(serializers.ModelSerializer):
    archivo_filename = serializers.CharField(source="archivo.filename", read_only=True)

    class Meta:
        model  = RegistroFonasa
        fields = "__all__"
