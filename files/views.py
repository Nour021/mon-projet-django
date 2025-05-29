from django.shortcuts import render
from django.http import HttpResponse, FileResponse
import os
import mimetypes
import zipfile
from io import BytesIO
from django.conf import settings
import zipfile
from pathlib import Path

def download_all_files(request):
    # Construire le bon chemin
    files_dir = Path(settings.BASE_DIR) / 'files' / 'static' / 'files'

    # Pour déboguer
    print("Chemin à zipper :", files_dir)
    if not files_dir.exists():
        return HttpResponse(f"Dossier introuvable : {files_dir}", status=404)

    # Chemin du ZIP temporaire
    temp_zip = Path(settings.BASE_DIR) / 'fichiers.zip'

    # Créer l'archive ZIP
    with zipfile.ZipFile(temp_zip, 'w') as zipf:
        for file_path in files_dir.rglob('*'):
            if file_path.is_file():
                arcname = file_path.relative_to(files_dir.parent)
                zipf.write(file_path, arcname)

    # Retourner le ZIP au navigateur
    return FileResponse(open(temp_zip, 'rb'), as_attachment=True, filename='fichiers.zip')
def index(request):
    """Vue principale qui affiche la page d'accueil avec la liste des fichiers"""
    return render(request, 'index.html')

def scores(request):
    """Vue qui affiche la page des résultats d'analyse"""
    return render(request, 'scores.html')

def telecharger_fichier(request):
    """Vue pour télécharger ou afficher un fichier"""
    filename = request.GET.get('filename', '')
    file_type = request.GET.get('type', '')  # 'aligned' ou 'unaligned'
    
    # Vérifier les paramètres
    if not filename or not file_type:
        return HttpResponse(f"Paramètres manquants: filename={filename}, type={file_type}", status=400)
    
    # Déterminer le chemin du fichier
    if file_type == 'aligned':
        file_path = os.path.join(settings.BASE_DIR, 'static', 'files', 'aligned', filename)
    else:
        file_path = os.path.join(settings.BASE_DIR, 'static', 'files', 'unaligned', filename)
    
    # Vérifier si le fichier existe
    if not os.path.exists(file_path):
        return HttpResponse(f"Fichier non trouvé: {file_path}", status=404)
    
    # Lire le contenu du fichier
    try:
        with open(file_path, 'r') as file:
            content = file.read()
        
        # Si c'est pour télécharger
        if 'download' in request.GET:
            response = HttpResponse(content, content_type='application/octet-stream')
            response['Content-Disposition'] = f'attachment; filename="{filename}"'
            return response
        
        # Si c'est pour afficher
        else:
            # Pour les fichiers FASTA, utilisez un formatage HTML simple
            formatted_content = content.replace('\n', '<br>').replace('>', '<br><b>>')
            html = f'''
            <!DOCTYPE html>
            <html>
            <head>
                <title>{filename}</title>
                <style>
                    body {{ font-family: monospace; padding: 20px; }}
                    b {{ color: #3498db; }}
                </style>
            </head>
            <body>
                <h2>{filename}</h2>
                <div>{formatted_content}</div>
            </body>
            </html>
            '''
            return HttpResponse(html)
    
    except Exception as e:
        return HttpResponse(f"Erreur lors de la lecture du fichier: {str(e)}", status=500)

def fichiers(request):
    """Vue qui renvoie la liste des fichiers au format JSON"""
    aligned_files = []
    unaligned_files = []
    
    # Chemin vers les dossiers de fichiers
    aligned_path = os.path.join(settings.BASE_DIR, 'static', 'files', 'aligned')
    unaligned_path = os.path.join(settings.BASE_DIR, 'static', 'files', 'unaligned')
    
    # Lister les fichiers alignés
    if os.path.exists(aligned_path):
        aligned_files = [f for f in os.listdir(aligned_path) if f.endswith('.fa')]
    
    # Lister les fichiers non alignés
    if os.path.exists(unaligned_path):
        unaligned_files = [f for f in os.listdir(unaligned_path) if f.endswith('.unaligned')]
    
    # Préparer les données
    files_data = []
    
    for file in aligned_files:
        files_data.append({
            'name': file,
            'isAligned': True
        })
    
    for file in unaligned_files:
        files_data.append({
            'name': file,
            'isAligned': False
        })
    
    # Trier les fichiers par ID numérique
    def extract_id(file_name):
        try:
            # Extrait l'ID du nom de fichier (supposé être après "ID_" et avant "_N")
            id_str = file_name.split('ID_')[1].split('_N')[0]
            return int(id_str)
        except (IndexError, ValueError):
            return 0
    
    files_data.sort(key=lambda x: extract_id(x['name']))
    
    # Retourner les données au format JSON
    from django.http import JsonResponse
    return JsonResponse({'files': files_data})




import os
from django.conf import settings
from django.http import JsonResponse, Http404

def get_fasta_content(request, filename):
    # Chemin où se trouvent tes fichiers FASTA
    # Modifie ce chemin selon ton projet!
    base_dir = os.path.join(settings.BASE_DIR, 'static', 'files', 'aligned')
    file_path_aligned = os.path.join(base_dir, filename)
    unaligned_dir = os.path.join(settings.BASE_DIR, 'static', 'files', 'unaligned')
    file_path_unaligned = os.path.join(unaligned_dir, filename)

    if os.path.exists(file_path_aligned):
        filepath = file_path_aligned
    elif os.path.exists(file_path_unaligned):
        filepath = file_path_unaligned
    else:
        raise Http404("Fichier non trouvé")

    with open(filepath, "r") as f:
        content = f.read()
    return JsonResponse({"content": content})
