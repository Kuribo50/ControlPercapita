from django.contrib import admin

# Register your models here.
from .models import Archivo, RegistroFonasa

admin.site.register(Archivo)
admin.site.register(RegistroFonasa)
