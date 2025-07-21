from rest_framework.routers import DefaultRouter
from django.urls import path, include
from .views import ArchivoViewSet, RegistroFonasaViewSet

router = DefaultRouter()
router.register("archivos",   ArchivoViewSet, basename="archivos")
router.register("registros",  RegistroFonasaViewSet, basename="registros")

urlpatterns = [
    path("", include(router.urls)),
]
