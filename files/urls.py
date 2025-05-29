from django.urls import path
from django.shortcuts import redirect
from . import views

urlpatterns = [
    path('', views.index, name=' index'),
    path('get-fasta-content/<str:filename>/', views.get_fasta_content, name='get_fasta_content'),
    path('scores/', views.scores, name='scores'),
    path('fichiers/', views.fichiers, name='fichiers'),
    path('telecharger/', views.telecharger_fichier, name='telecharger_fichier'),
    path('download-all/', views.download_all_files, name='download_all_files'),
]