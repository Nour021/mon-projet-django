
function downloadAllFiles() {
    window.location.href = '{% url "download_all_files" %}';
}
        // Configuration
        const ITEMS_PER_PAGE = 20;
        
        // Variables d'état
        let currentPage = 1;
        let files = [];
        let filteredFiles = [];
        
        // Fonction pour obtenir l'URL du fichier
        function getFileUrl(file) {
            const subfolder = file.isAligned ? 'aligned' : 'unaligned';
            return `/static/files/${subfolder}/${file.name}`;
        }
        
        // Fonction pour extraire les paramètres du nom de fichier
        function parseFileName(fileName) {
            const regex = /Sequences_ID_(\d+)_N_(\d+)_Len_(\d+)_Ins_([\d.]+)_Del_([\d.]+)\.(\w+)/;
            const match = fileName.match(regex);
            
            if (match) {
                return {
                    id: parseInt(match[1]),
                    n: parseInt(match[2]),
                    len: parseInt(match[3]),
                    ins: parseFloat(match[4]),
                    del: parseFloat(match[5]),
                    type: match[6],
                    isAligned: match[6] === 'fa'
                };
            }
            return null;
        }
        
        // Générer la liste des fichiers
        function generateFileList() {
            const fileList = [];
            // Modifier cette ligne dans la fonction generateFileList()
            const nValues = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40];  // Génère [1, 2, 3, ..., 40]
            const lenValues = [100, 200, 300, 400, 500]; // Valeurs pour Len
            const indelValues = [0.001, 0.006, 0.011, 0.016, 0.021]; // Valeurs pour Ins/Del
            
            let fileId = 1;
            const maxFiles = 950;
            for (const n of nValues) {
                for (const len of lenValues) {
                    for (const indel of indelValues) {
                        // Fichier aligné
                        const alignedFile = `Sequences_ID_${fileId}_N_${n}_Len_${len}_Ins_${indel}_Del_${indel}.fa`;
                        fileList.push(alignedFile);
                        
                        // Fichier non aligné
                        const unalignedFile = `Sequences_ID_${fileId}_N_${n}_Len_${len}_Ins_${indel}_Del_${indel}.unaligned.fa`;
                        fileList.push(unalignedFile);
                        
                        fileId++;
                    }
                }
            }
            
            return fileList;
        }
        
        // Charger les fichiers
        function loadFiles() {
            const fileNames = generateFileList();
            const uniqueN = new Set();
            const uniqueLen = new Set();
            const uniqueInsDel = new Set();
            
            files = fileNames.map(fileName => {
                const fileInfo = parseFileName(fileName);
                if (!fileInfo) return null;
                
                // Ajouter aux ensembles de filtres
                uniqueN.add(fileInfo.n);
                uniqueLen.add(fileInfo.len);
                uniqueInsDel.add(fileInfo.ins);
                
                return {
                    name: fileName,
                    ...fileInfo,
                    path: getFileUrl({name: fileName, isAligned: fileInfo.isAligned})
                };
            }).filter(Boolean);
            
            // Remplir les filtres
            populateFilter('filterN', uniqueN, 'N=');
            populateFilter('filterLen', uniqueLen, 'Len=');
            populateFilter('filterInsDel', uniqueInsDel, 'Ins/Del=');
            
            filteredFiles = [...files];
            displayFiles(currentPage);
        }
        
        // Remplir un sélecteur de filtre
        function populateFilter(selectId, values, prefix = '') {
            const select = document.getElementById(selectId);
            const sortedValues = Array.from(values).sort((a, b) => a - b);
            
            sortedValues.forEach(value => {
                const option = document.createElement('option');
                option.value = value;
                option.textContent = prefix + value;
                select.appendChild(option);
            });
        }
        
        // Fonction pour ouvrir un fichier
       function openFile(file) {
    const fileUrl = getFileUrl(file);
    fetch(fileUrl)
        .then(response => response.text())
        .then(content => {
            const win = window.open('', '_blank');
            win.document.write(`<pre>${content}</pre>`);
        });
}
        
        // Fonction pour télécharger un fichier
        function downloadFile(file) {
            const fileUrl = getFileUrl(file);
            const a = document.createElement('a');
            a.href = fileUrl;
            a.download = file.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        
        // Fonction pour filtrer les fichiers
        function filterFiles() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            const showAligned = document.getElementById('filterAligned').checked;
            const showUnaligned = document.getElementById('filterUnaligned').checked;
            const filterN = document.getElementById('filterN').value;
            const filterLen = document.getElementById('filterLen').value;
            const filterInsDel = document.getElementById('filterInsDel').value;
            
            filteredFiles = files.filter(file => {
                const matchesSearch = file.name.toLowerCase().includes(searchTerm);
                const matchesType = (file.isAligned && showAligned) || (!file.isAligned && showUnaligned);
                const matchesN = filterN ? file.n == filterN : true;
                const matchesLen = filterLen ? file.len == filterLen : true;
                const matchesInsDel = filterInsDel ? file.ins == filterInsDel : true;
                
                return matchesSearch && matchesType && matchesN && matchesLen && matchesInsDel;
            });
            
            currentPage = 1;
            displayFiles(currentPage);
        }
        
        // Fonction pour afficher les fichiers
        function displayFiles(page) {
            const container = document.getElementById('fileListContainer');
            container.innerHTML = '';
            
            const startIndex = (page - 1) * ITEMS_PER_PAGE;
            const endIndex = startIndex + ITEMS_PER_PAGE;
            const filesToShow = filteredFiles.slice(startIndex, endIndex);
            
            if (filesToShow.length === 0) {
                container.innerHTML = '<div class="text-center p-4">Aucun fichier trouvé</div>';
                return;
            }
            
            filesToShow.forEach(file => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                
                const badgeClass = file.isAligned ? 'file-badge aligned' : 'file-badge unaligned';
                const badgeText = file.isAligned ? 'ALIGNÉ' : 'NON-ALIGNÉ';
                
                fileItem.innerHTML = `
                    <div class="file-name">
                        <span class="${badgeClass}">${badgeText}</span>
                        ${file.name}
                        <div class="text-muted small mt-1">
                            N=${file.n}, Len=${file.len}, Ins/Del=${file.ins}
                        </div>
                    </div>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-primary open-btn">
                            <i class="bi bi-eye"></i> Ouvrir
                        </button>
                        <button class="btn btn-sm btn-success download-btn">
                            <i class="bi bi-download"></i> Télécharger
                        </button>
                    </div>
                `;
                
                fileItem.querySelector('.open-btn').addEventListener('click', () => openFile(file));
                fileItem.querySelector('.download-btn').addEventListener('click', () => downloadFile(file));
                
                container.appendChild(fileItem);
            });
            
            updatePagination();
            updateFileCounter();
        }
        
        // Mise à jour du compteur de fichiers
        function updateFileCounter() {
            const fileCounter = document.getElementById('fileCounter');
            if (fileCounter) {
                fileCounter.textContent = `${filteredFiles.length} fichiers`;
            }
        }
        
        // Mise à jour de la pagination
        function updatePagination() {
            const paginationElement = document.getElementById('pagination');
            paginationElement.innerHTML = '';
            
            const totalPages = Math.ceil(filteredFiles.length / ITEMS_PER_PAGE);
            
            // Bouton précédent
            const prevLi = document.createElement('li');
            prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
            prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous">
                <i class="bi bi-chevron-left"></i>
            </a>`;
            prevLi.addEventListener('click', e => {
                e.preventDefault();
                if (currentPage > 1) {
                    currentPage--;
                    displayFiles(currentPage);
                }
            });
            paginationElement.appendChild(prevLi);
            
            // Pages numérotées
            const maxPageButtons = 5;
            const startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
            const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
            
            for (let i = startPage; i <= endPage; i++) {
                const li = document.createElement('li');
                li.className = `page-item ${i === currentPage ? 'active' : ''}`;
                li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
                li.addEventListener('click', e => {
                    e.preventDefault();
                    currentPage = i;
                    displayFiles(currentPage);
                });
                paginationElement.appendChild(li);
            }
            
            // Bouton suivant
            const nextLi = document.createElement('li');
            nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
            nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next">
                <i class="bi bi-chevron-right"></i>
            </a>`;
            nextLi.addEventListener('click', e => {
                e.preventDefault();
                if (currentPage < totalPages) {
                    currentPage++;
                    displayFiles(currentPage);
                }
            });
            paginationElement.appendChild(nextLi);
        }
        
        // Initialisation
        document.addEventListener('DOMContentLoaded', () => {
            loadFiles();
            
            document.getElementById('searchInput').addEventListener('input', filterFiles);
            document.getElementById('filterAligned').addEventListener('change', filterFiles);
            document.getElementById('filterUnaligned').addEventListener('change', filterFiles);
            document.getElementById('filterN').addEventListener('change', filterFiles);
            document.getElementById('filterLen').addEventListener('change', filterFiles);
            document.getElementById('filterInsDel').addEventListener('change', filterFiles);
            
            document.getElementById('toggleAdvancedFilters').addEventListener('click', () => {
                document.getElementById('advancedFilters').classList.toggle('show');
                const icon = document.querySelector('#toggleAdvancedFilters i');
                if (icon.classList.contains('bi-chevron-down')) {
                    icon.classList.replace('bi-chevron-down', 'bi-chevron-up');
                } else {
                    icon.classList.replace('bi-chevron-up', 'bi-chevron-down');
                }
            });
        });
