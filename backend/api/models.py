# backend/api/models.py

from uuid import uuid4
from django.db import models
from django.db.models import TextChoices


class Archivo(models.Model):
    """
    Representa un “corte” FONASA subido por el usuario.
    """
    class EstadoProcesamiento(TextChoices):
        PENDIENTE  = "pendiente",  "Pendiente"
        PROCESADO  = "procesado",  "Procesado"
        ERROR      = "error",      "Error"

    id               = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    filename         = models.CharField(max_length=255, verbose_name="Nombre original")
    fecha_corte      = models.DateField(verbose_name="Fecha de Corte", db_index=True)
    total_registros  = models.PositiveIntegerField(default=0, verbose_name="Total registros")
    estado           = models.CharField(
                          max_length=12,
                          choices=EstadoProcesamiento.choices,
                          default=EstadoProcesamiento.PENDIENTE,
                          verbose_name="Estado de Procesamiento"
                      )
    created_at       = models.DateTimeField(auto_now_add=True, verbose_name="Creado")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Archivo"
        verbose_name_plural = "Archivos"

    def __str__(self):
        return f"{self.filename} ({self.fecha_corte})"


class RegistroFonasa(models.Model):
    """
    Cada fila del archivo FONASA se almacena como un registro.
    """
    class Genero(TextChoices):
        MASCULINO = "M", "Masculino"
        FEMENINO  = "F", "Femenino"

    id                         = models.UUIDField(primary_key=True, default=uuid4, editable=False)
    archivo                    = models.ForeignKey(
                                     Archivo,
                                     on_delete=models.CASCADE,
                                     related_name="registros",
                                     verbose_name="Archivo"
                                 )
    run                        = models.CharField(max_length=12, verbose_name="RUN (sin DV)")
    dv                         = models.CharField(max_length=1,  verbose_name="Dígito verificador")
    nombres                    = models.CharField(max_length=255, verbose_name="Nombres")
    apellido_paterno           = models.CharField(max_length=100, verbose_name="Apellido paterno")
    apellido_materno           = models.CharField(max_length=100, blank=True, verbose_name="Apellido materno")
    fecha_nacimiento           = models.DateField(verbose_name="Fecha de nacimiento")
    genero                     = models.CharField(
                                     max_length=1,
                                     choices=Genero.choices,
                                     verbose_name="Género"
                                 )
    tramo                      = models.CharField(max_length=10, blank=True, verbose_name="Tramo FONASA")
    fecha_corte                = models.DateField(verbose_name="Fecha de Corte")
    cod_centro                 = models.CharField(max_length=10, verbose_name="Código centro")
    nombre_centro              = models.CharField(max_length=255, verbose_name="Nombre centro")
    codigo_centro_procedencia  = models.CharField(max_length=10, blank=True, verbose_name="Código centro procedencia")
    nombre_centro_procedencia  = models.CharField(max_length=255, blank=True, verbose_name="Nombre centro procedencia")
    codigo_comuna_procedencia  = models.CharField(max_length=10, blank=True, verbose_name="Código comuna procedencia")
    nombre_comuna_procedencia  = models.CharField(max_length=255, blank=True, verbose_name="Nombre comuna procedencia")
    codigo_centro_destino      = models.CharField(max_length=10, blank=True, verbose_name="Código centro destino")
    nombre_centro_destino      = models.CharField(max_length=255, blank=True, verbose_name="Nombre centro destino")
    codigo_comuna_destino      = models.CharField(max_length=10, blank=True, verbose_name="Código comuna destino")
    nombre_comuna_destino      = models.CharField(max_length=255, blank=True, verbose_name="Nombre comuna destino")
    traslado_positivo          = models.BooleanField(default=False, verbose_name="Traslado positivo")
    traslado_negativo          = models.BooleanField(default=False, verbose_name="Traslado negativo")
    nuevo_inscrito             = models.BooleanField(default=False, verbose_name="Nuevo inscrito")
    exbloqueado                = models.BooleanField(default=False, verbose_name="Ex-bloqueado")
    rechazado_previsional      = models.BooleanField(default=False, verbose_name="Rechazado previsional")
    rechazado_fallecido        = models.BooleanField(default=False, verbose_name="Rechazado fallecido")
    autorizado                 = models.BooleanField(default=False, verbose_name="Autorizado")
    aceptado_rechazado         = models.CharField(max_length=50, blank=True, verbose_name="Aceptado/Rechazado")
    motivo                     = models.TextField(blank=True, verbose_name="Motivo")
    created_at                 = models.DateTimeField(auto_now_add=True, verbose_name="Creado")

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Registro FONASA"
        verbose_name_plural = "Registros FONASA"
        indexes = [
            models.Index(fields=["run", "dv"]),
            models.Index(fields=["fecha_corte"]),
            models.Index(fields=["cod_centro"]),
            models.Index(fields=["nuevo_inscrito"]),
            models.Index(fields=["traslado_positivo"]),
            models.Index(fields=["traslado_negativo"]),
        ]

    def __str__(self):
        return f"{self.run}-{self.dv} ({self.nombres} {self.apellido_paterno})"
