// List Module - Shows all data without pagination

class ListManager {
    constructor() {
        this.currentTab = 'vocab';
    }

    initialize() {
        // Initialize tab switching
        const tabButtons = document.querySelectorAll('#list-tabs button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                if (target) {
                    const tab = target.replace('#list-', '');
                    this.switchToTab(tab);
                }
            });
        });
    }

    show() {
        this.loadAllTabs();
    }

    loadAllTabs() {
        this.loadVocabList();
        this.loadKanjiList();
        this.loadGrammarList();
    }

    loadTabContent() {
        switch (this.currentTab) {
            case 'vocab':
                this.loadVocabList();
                break;
            case 'kanji':
                this.loadKanjiList();
                break;
            case 'grammar':
                this.loadGrammarList();
                break;
        }
    }

    loadVocabList() {
        const container = document.getElementById('list-vocab-table');
        const vocabData = dataLoader.getVocabData();
        
        if (vocabData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-list-ul"></i>
                    <h5>No vocabulary data loaded</h5>
                    <p>Please make sure the vocab TSV file is available</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5><i class="bi bi-book me-2"></i>Danh sách từ vựng đầy đủ</h5>
                <span class="badge bg-primary fs-6">${vocabData.length} từ vựng</span>
            </div>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-primary">
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 20%;">Từ vựng</th>
                            <th style="width: 65%;">Nghĩa</th>
                            <th style="width: 10%;">Ôn tập</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${vocabData.map((item, index) => {
                            const isInReminds = localStorageUtils.isInReminds('vocab', index);
                            return `
                                <tr>
                                    <td><span class="badge bg-light text-dark">${index + 1}</span></td>
                                    <td><strong class="text-primary">${item[0] || ''}</strong></td>
                                    <td>${dataLoader.formatVocabAnswer(item)}</td>
                                    <td>
                                        <button class="remind-btn ${isInReminds ? 'active' : ''}" onclick="listManager.toggleRemind('vocab', ${index})">
                                            <i class="bi bi-bookmark${isInReminds ? '-fill' : ''}"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    loadKanjiList() {
        const container = document.getElementById('list-kanji-table');
        const kanjiData = dataLoader.getKanjiData();
        
        if (kanjiData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-list-ul"></i>
                    <h5>No kanji data loaded</h5>
                    <p>Please make sure the kanji TSV file is available</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5><i class="bi bi-translate me-2"></i>Danh sách Kanji đầy đủ</h5>
                <span class="badge bg-primary fs-6">${kanjiData.length} kanji</span>
            </div>
            
            <div class="table-responsive">
                <table class="table table-striped table-hover">
                    <thead class="table-primary">
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 20%;">Kanji</th>
                            <th style="width: 65%;">Nghĩa</th>
                            <th style="width: 10%;">Ôn tập</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${kanjiData.map((item, index) => {
                            const isInReminds = localStorageUtils.isInReminds('kanji', index);
                            return `
                                <tr>
                                    <td><span class="badge bg-light text-dark">${index + 1}</span></td>
                                    <td><strong class="text-primary">${item[0] || ''}</strong></td>
                                    <td>${dataLoader.formatKanjiAnswer(item)}</td>
                                    <td>
                                        <button class="remind-btn ${isInReminds ? 'active' : ''}" onclick="listManager.toggleRemind('kanji', ${index})">
                                            <i class="bi bi-bookmark${isInReminds ? '-fill' : ''}"></i>
                                        </button>
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
    }

    loadGrammarList() {
        const container = document.getElementById('list-grammar-cards');
        const grammarData = dataLoader.getGrammarData();
        
        if (grammarData.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-list-ul"></i>
                    <h5>No grammar data loaded</h5>
                    <p>Please make sure the grammar TSV file is available</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5><i class="bi bi-journal-text me-2"></i>Danh sách ngữ pháp đầy đủ</h5>
                <span class="badge bg-primary fs-6">${grammarData.length} ngữ pháp</span>
            </div>
            
            <div class="row">
                ${grammarData.map((item, index) => {
                    const [structure, meaning, notice, examples] = item;
                    const processedStructure = dataLoader.processGrammarStructure(structure);
                    const noticePoints = dataLoader.parseGrammarNotice(notice);
                    const exampleList = dataLoader.parseGrammarExamples(examples);

                    return `
                        <div class="col-12 mb-3">
                            <div class="card border-0 shadow-sm">
                                <div class="card-body">
                                    <div class="d-flex justify-content-between align-items-start mb-1">
                                        <span class="badge bg-primary">#${index + 1}</span>
                                        <button class="remind-btn ${localStorageUtils.isInReminds('grammar', index) ? 'active' : ''}" onclick="listManager.toggleRemind('grammar', ${index})">
                                            <i class="bi bi-bookmark${localStorageUtils.isInReminds('grammar', index) ? '-fill' : ''}"></i>
                                        </button>
                                    </div>
                                    
                                    <div class="grammar-structure mb-3">
                                        ${processedStructure}
                                    </div>
                                    
                                    <div class="grammar-meaning mb-3 p-3 bg-light rounded">
                                        <i class="bi bi-translate me-2 text-primary"></i>
                                        <strong>${meaning || 'No meaning available'}</strong>
                                    </div>
                                    
                                    ${noticePoints.length > 0 ? `
                                        <div class="grammar-notice mb-1">
                                            <h6 class="text-info">
                                                <i class="bi bi-info-circle me-2"></i>Notice:
                                            </h6>
                                            <ul class="list-group list-group-flush">
                                                ${noticePoints.map(point => `
                                                    <li class="list-group-item border-0 ps-0 pe-0 py-1">
                                                        <i class="bi bi-arrow-right me-2 text-muted"></i>${point}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                    
                                    ${exampleList.length > 0 ? `
                                        <div class="grammar-examples">
                                            <h6 class="text-success">
                                                <i class="bi bi-journal-text me-2"></i>Ví dụ:
                                            </h6>
                                            <ul class="list-group list-group-flush">
                                                ${exampleList.map(example => `
                                                    <li class="list-group-item border-0 ps-0 pe-0 py-1">
                                                        <i class="bi bi-arrow-right me-2 text-muted"></i>
                                                        <span class="font-monospace text-dark">${example}</span>
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;

        container.innerHTML = html;
        
        // Auto-resize grammar structures
        this.autoResizeGrammarStructures();
    }

    autoResizeGrammarStructures() {
        const grammarStructures = document.querySelectorAll('.grammar-structure .grammar-pre');
        grammarStructures.forEach(element => {
            this.autoResizeText(element);
        });
    }

    autoResizeText(element) {
        const text = element.textContent.trim();
        const hasLineBreaks = text.includes('\n') || text.includes('\r');
        
        let baseFontSize;
        let minFontSize;
        if (window.innerWidth <= 576) {
            baseFontSize = 14;
            minFontSize = 8;
        } else if (window.innerWidth <= 768) {
            baseFontSize = 16;
            minFontSize = 10;
        } else {
            baseFontSize = 20;
            minFontSize = 12;
        }
        
        let fontSize = baseFontSize;
        element.style.fontSize = fontSize + 'px';
        
        let attempts = 0;
        while (element.scrollWidth > element.clientWidth && fontSize > minFontSize && attempts < 50) {
            fontSize -= 1;
            element.style.fontSize = fontSize + 'px';
            attempts++;
        }
    }
    
    toggleRemind(type, index) {
        const isInReminds = localStorageUtils.isInReminds(type, index);
        
        if (isInReminds) {
            localStorageUtils.removeFromReminds(type, index);
            this.showNotification(`Đã xóa khỏi danh sách ôn tập`);
        } else {
            localStorageUtils.addToReminds(type, index);
            this.showNotification(`Đã thêm vào danh sách ôn tập`);
        }
        
        // Reload current tab to update UI
        this.loadTabContent();
    }

    switchToTab(tab) {
        this.currentTab = tab;
        window.location.hash = `list-${tab}`;
        
        // Activate Bootstrap tab
        const tabButton = document.querySelector(`#list-tabs button[data-bs-target="#list-${tab}"]`);
        if (tabButton) {
            const bsTab = new bootstrap.Tab(tabButton);
            bsTab.show();
        }
        
        this.loadTabContent();
    }

    showNotification(message) {
        const toast = document.getElementById('notification-toast');
        const toastBody = toast.querySelector('.toast-body');
        toastBody.textContent = message;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }
}

// Create global instance
const listManager = new ListManager();
