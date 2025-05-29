from django.db import models

class Lien(models.Model):
    url = models.URLField()
    titre = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.titre or self.url

class FichierExcel(models.Model):
    fichier = models.FileField(upload_to='excels/')
    nom = models.CharField(max_length=255)

    def __str__(self):
        return self.nom
# viewer_app/models.py

class FastaFile(models.Model):
    ALIGNED = 'AL'
    UNALIGNED = 'UN'
    FILE_TYPES = [
        (ALIGNED, 'Aligned'),
        (UNALIGNED, 'Unaligned'),
    ]
      
