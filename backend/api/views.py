# backend/api/views.py

import pandas as pd
from datetime import datetime
from io import TextIOWrapper

from rest_framework import viewsets, permissions, status
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.decorators import action  # ← IMPORTAR AQUÍ
from django.db.models import Count

from .models import Archivo, RegistroFonasa
from .serializers import ArchivoSerializer, RegistroFonasaSerializer


class ArchivoViewSet(viewsets.ModelViewSet):
    """
    ViewSet para subir y procesar un archivo FONASA.
    """
    queryset = Archivo.objects.all()
    serializer_class = ArchivoSerializer
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser]

    def create(self, request, *args, **kwargs):
        file = request.FILES.get("file")
        if not file:
            return Response({"detail": "No se proporcionó archivo."},
                            status=status.HTTP_400_BAD_REQUEST)

        txt = TextIOWrapper(file.file, encoding="utf-8")
        try:
            df = pd.read_csv(txt, sep=",", engine="python")
        except Exception as e:
            return Response({"detail": f"Error al parsear: {e}"},
                            status=status.HTTP_400_BAD_REQUEST)

        fecha_corte = datetime.today().date()
        archivo = Archivo.objects.create(
            filename=file.name,
            fecha_corte=fecha_corte,
            total_registros=len(df),
            estado=Archivo.EstadoProcesamiento.PROCESADO,
        )

        bool_cols = [
            "TRASLADO_POSITIVO", "TRASLADO_NEGATIVO", "NUEVO_INSCRITO",
            "EXBLOQUEADO", "RECHAZADO_PREVISIONAL", "RECHAZADO_FALLECIDO",
            "AUTORIZADO",
        ]
        for col in bool_cols:
            df[col] = df.get(col, "").astype(str).str.strip().str.upper() == "X"

        registros = []
        for _, row in df.iterrows():
            dv_raw = str(row.get("DV", "")).strip()
            dv = dv_raw[:1]
            gen_raw = str(row.get("GENERO", "")).strip().upper()
            genero = gen_raw[:1]

            fn = row.get("FECHA_NACIMIENTO", "")
            try:
                fecha_nac = datetime.strptime(str(fn), "%d-%m-%Y").date()
            except Exception:
                fecha_nac = fecha_corte

            registros.append(
                RegistroFonasa(
                    archivo=archivo,
                    run=str(row.get("RUN", "")).strip(),
                    dv=dv,
                    nombres=row.get("NOMBRES", ""),
                    apellido_paterno=row.get("APELLIDO_PATERNO", ""),
                    apellido_materno=row.get("APELLIDO_MATERNO", ""),
                    fecha_nacimiento=fecha_nac,
                    genero=genero,
                    tramo=row.get("TRAMO", ""),
                    fecha_corte=fecha_corte,
                    cod_centro=row.get("COD_CENTRO", ""),
                    nombre_centro=row.get("NOMBRE_CENTRO", ""),
                    codigo_centro_procedencia=row.get("CODIGO_CENTRO_PROCEDENCIA", ""),
                    nombre_centro_procedencia=row.get("NOMBRE_CENTRO_PROCEDENCIA", ""),
                    codigo_comuna_procedencia=row.get("CODIGO_COMUNA_PROCEDENCIA", ""),
                    nombre_comuna_procedencia=row.get("NOMBRE_COMUNA_PROCEDENCIA", ""),
                    codigo_centro_destino=row.get("CODIGO_CENTRO_DESTINO", ""),
                    nombre_centro_destino=row.get("NOMBRE_CENTRO_DESTINO", ""),
                    codigo_comuna_destino=row.get("CODIGO_COMUNA_DESTINO", ""),
                    nombre_comuna_destino=row.get("NOMBRE_COMUNA_DESTINO", ""),
                    traslado_positivo=row["TRASLADO_POSITIVO"],
                    traslado_negativo=row["TRASLADO_NEGATIVO"],
                    nuevo_inscrito=row["NUEVO_INSCRITO"],
                    exbloqueado=row["EXBLOQUEADO"],
                    rechazado_previsional=row["RECHAZADO_PREVISIONAL"],
                    rechazado_fallecido=row["RECHAZADO_FALLECIDO"],
                    autorizado=row["AUTORIZADO"],
                    aceptado_rechazado=row.get("ACEPTADO_RECHAZADO", ""),
                    motivo=row.get("MOTIVO", ""),
                )
            )

        RegistroFonasa.objects.bulk_create(registros)

        return Response(
            ArchivoSerializer(archivo).data,
            status=status.HTTP_201_CREATED
        )


class RegistroFonasaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet para listar y obtener estadísticas de registros.
    """
    queryset = RegistroFonasa.objects.select_related("archivo").all()
    serializer_class = RegistroFonasaSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = [
        "fecha_corte", "cod_centro",
        "nuevo_inscrito", "traslado_positivo", "traslado_negativo"
    ]
    search_fields = ["run", "nombres", "apellido_paterno"]
    ordering = ["-created_at"]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """
        Retorna conteo de registros aceptados vs rechazados.
        """
        qs = self.get_queryset()
        aceptados = qs.filter(aceptado_rechazado__icontains="acept").count()
        rechazados = qs.filter(aceptado_rechazado__icontains="rechaz").count()
        return Response({"aceptados": aceptados, "rechazados": rechazados})

    @action(detail=False, methods=["get"])
    def motivos(self, request):
        """
        Devuelve lista de motivos y su conteo ordenados de mayor a menor.
        """
        qs = (
            RegistroFonasa.objects
            .values("motivo")
            .exclude(motivo__exact="")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        return Response(list(qs))

    @action(detail=False, methods=["get"], url_path="all")
    def all_records(self, request):
        """
        Devuelve todos los registros sin paginación (¡usar solo para dashboards o admin!).
        """
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
