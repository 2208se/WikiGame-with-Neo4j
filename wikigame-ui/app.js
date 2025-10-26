class WikiGameUI {
    constructor() {
        this.apiBase = 'http://localhost:3000/api';
        this.icons = {
            game: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 12h12M12 6v12"/><circle cx="12" cy="12" r="10"/>
            </svg>`,
            search: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>`,
            swap: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m17 2 4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/>
            </svg>`,
            target: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
            </svg>`,
            link: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>`,
            book: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
            </svg>`,
            connections: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="5" r="1"/><circle cx="19" cy="5" r="1"/><circle cx="5" cy="5" r="1"/>
                <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
                <circle cx="12" cy="19" r="1"/><circle cx="19" cy="19" r="1"/><circle cx="5" cy="19" r="1"/>
            </svg>`,
            star: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>`,
            error: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
            </svg>`,
            step: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
            </svg>`,
            loading: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>`
        };
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadStats();
        this.injectIcons();
    }

    injectIcons() {
        // Injecter les icônes dans le HTML initial
        document.querySelector('.title').innerHTML = `${this.icons.game} WikiGame`;
    }

    bindEvents() {
        document.getElementById('findPath').addEventListener('click', () => this.findPath());
        document.getElementById('searchBtn').addEventListener('click', () => this.searchPages());
        document.getElementById('swapBtn').innerHTML = this.icons.swap;
        document.getElementById('swapBtn').addEventListener('click', () => this.swapPages());
        
        // Enter key support
        document.getElementById('startPage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findPath();
        });
        document.getElementById('endPage').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.findPath();
        });
        document.getElementById('searchKeyword').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchPages();
        });
    }

    async findPath() {
        const start = document.getElementById('startPage').value.trim();
        const end = document.getElementById('endPage').value.trim();

        if (!start || !end) {
            this.showError('Veuillez remplir les deux pages');
            return;
        }

        this.showLoading();
        this.hideResults();
        this.hideError();

        try {
            const response = await fetch(`${this.apiBase}/path`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ start, end })
            });

            const data = await response.json();

            if (data.success) {
                this.displayPath(data.path, data.hops);
            } else {
                this.showError(data.error || 'Aucun chemin trouvé');
            }
        } catch (error) {
            this.showError('Erreur de connexion au serveur');
        } finally {
            this.hideLoading();
        }
    }

    async searchPages() {
        const keyword = document.getElementById('searchKeyword').value.trim();

        if (!keyword) {
            this.showError('Veuillez entrer un mot-clé');
            return;
        }

        this.showLoading();
        this.hideResults();
        this.hideError();

        try {
            const response = await fetch(`${this.apiBase}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword })
            });

            const data = await response.json();

            if (data.success) {
                this.displaySearchResults(data.results, keyword);
            } else {
                this.showError(data.error || 'Aucun résultat trouvé');
            }
        } catch (error) {
            this.showError('Erreur de connexion au serveur');
        } finally {
            this.hideLoading();
        }
    }

    swapPages() {
        const startField = document.getElementById('startPage');
        const endField = document.getElementById('endPage');
        const temp = startField.value;
        startField.value = endField.value;
        endField.value = temp;
    }

    displayPath(path, hops) {
        const container = document.getElementById('pathContainer');
        const title = document.getElementById('resultsTitle');
        
        title.innerHTML = `${this.icons.target} Chemin trouvé en ${hops} sauts`;
        container.innerHTML = '';

        path.forEach((node, index) => {
            const step = document.createElement('div');
            step.className = 'path-step';
            step.innerHTML = `
                <div>
                    <span class="step-number">${this.icons.step}</span>
                    <strong>${node.title}</strong>
                    <a href="https://fr.wikipedia.org/?curid=${node.id}" 
                       target="_blank" class="wiki-link">
                       ${this.icons.link} Ouvrir sur Wikipedia (ID: ${node.id})
                    </a>
                </div>
            `;
            container.appendChild(step);
        });

        this.showResults();
    }

    displaySearchResults(results, keyword) {
        const container = document.getElementById('searchResults');
        const title = document.getElementById('resultsTitle');
        
        title.innerHTML = `${this.icons.search} ${results.length} résultats pour "${keyword}"`;
        container.innerHTML = '';

        if (results.length === 0) {
            container.innerHTML = '<p>Aucun résultat trouvé.</p>';
        } else {
            results.forEach(result => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.innerHTML = `
                    <strong>${result.title}</strong>
                    <div style="margin-top: 5px; font-size: 0.9rem; color: #666;">
                        ID: ${result.id}
                    </div>
                `;
                container.appendChild(item);
            });
        }

        this.showResults();
    }

    async loadStats() {
        try {
            const response = await fetch(`${this.apiBase}/stats`);
            const data = await response.json();
            
            if (data.success) {
                document.getElementById('statsContent').innerHTML = `
                    <p>${this.icons.book} Pages: ${data.stats.nodes.toLocaleString()}</p>
                    <p>${this.icons.connections} Liens: ${data.stats.relationships.toLocaleString()}</p>
                    <p>${this.icons.star} PageRank max: ${data.stats.maxPagerank?.toFixed(4) || 'N/A'}</p>
                `;
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        }
    }

    showLoading() {
        const loadingEl = document.getElementById('loading');
        loadingEl.innerHTML = `
            <div class="spinner">${this.icons.loading}</div>
            <p>Recherche du chemin optimal...</p>
        `;
        loadingEl.classList.remove('hidden');
    }

    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }

    showResults() {
        document.getElementById('results').classList.remove('hidden');
    }

    hideResults() {
        document.getElementById('results').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('errorMessage').innerHTML = `
            ${this.icons.error} ${message}
        `;
        document.getElementById('error').classList.remove('hidden');
    }

    hideError() {
        document.getElementById('error').classList.add('hidden');
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WikiGameUI();
});