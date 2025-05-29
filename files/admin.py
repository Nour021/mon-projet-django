from django.contrib import admin
from .models import FichierExcel

@admin.register(FichierExcel)
class FichierExcelAdmin(admin.ModelAdmin):
    list_display = ('nom', 'fichier')