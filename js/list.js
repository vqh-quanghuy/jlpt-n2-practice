// List Module - Shows all data without pagination

class ListManager {
    constructor() {
        this.currentTab = 'vocab';
        this.selectedChapters = {
            vocab: 'all',
            kanji: 'all',
            grammar: 'all'
        };
        this.vocabFilters = {
            chapter: 'all',
            type: 'all', // 'all', 'reduplicative', 'katakana'
            search: ''
        };
        this.kanjiSearch = '';
        this.grammarSearch = '';
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
        const vocabData = dataLoader.getVocabSortedByOrder();
        const personalOtherData = dataLoader.isInPersonalMode() ? dataLoader.getPersonalOtherWords() : [];
        const personalPastData = dataLoader.isInPersonalMode() ? dataLoader.getPersonalPastTestWords() : [];
        
        const totalCount = vocabData.length + personalOtherData.length + personalPastData.length;
        
        if (totalCount === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-list-ul"></i>
                    <h5>No vocabulary data loaded</h5>
                    <p>Please make sure the vocab TSV file is available</p>
                </div>
            `;
            return;
        }

        const chapters = dataLoader.getVocabChapters();
        
        const html = `
            <div class="mb-3">
                <div class="row g-2 align-items-center">
                    <div class="col-6 col-sm-3">
                        <label class="form-label small mb-1">Chương:</label>
                        <select class="form-select form-select-sm" id="list-vocab-chapter">
                            <option value="all">Tất cả</option>
                            ${chapters.map(chapter => `<option value="${chapter}">${chapter}</option>`).join('')}
                            ${dataLoader.isInPersonalMode() ? '<option value="personal">Cá nhân</option>' : ''}
                        </select>
                    </div>
                    <div class="col-6 col-sm-3">
                        <label class="form-label small mb-1">Loại:</label>
                        <select class="form-select form-select-sm" id="list-vocab-type">
                            <option value="all">Tất cả</option>
                            <option value="vocab">Từ vựng thường</option>
                            <option value="reduplicative">Hiragana</option>
                            <option value="katakana">Katakana</option>
                            ${dataLoader.isInPersonalMode() ? '<option value="personal_other">Từ mở rộng</option>' : ''}
                            ${dataLoader.isInPersonalMode() ? '<option value="personal_past">Từ các năm trước</option>' : ''}
                        </select>
                    </div>
                    <div class="col-12 col-sm-4">
                        <label class="form-label small mb-1">Tìm kiếm:</label>
                        <input type="text" class="form-control form-control-sm" id="list-vocab-search" placeholder="Nhập từ vựng...">
                    </div>
                    <div class="col-12 col-sm-2 text-end">
                        <span class="badge bg-primary fs-6" id="vocab-count">${totalCount} từ vựng</span>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-primary">
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 20%;">Từ vựng</th>
                            <th style="width: 65%;">Nghĩa</th>
                            <th style="width: 10%;">Ôn tập</th>
                        </tr>
                    </thead>
                    <tbody id="vocab-table-body">
                        ${this.renderAllVocabRows(vocabData, personalOtherData, personalPastData)}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
        
        // Add filter event listeners
        const chapterSelect = document.getElementById('list-vocab-chapter');
        const typeSelect = document.getElementById('list-vocab-type');
        const searchInput = document.getElementById('list-vocab-search');
        
        if (chapterSelect) {
            chapterSelect.value = this.vocabFilters.chapter;
            chapterSelect.addEventListener('change', (e) => {
                this.vocabFilters.chapter = e.target.value;
                this.filterVocab();
            });
        }
        
        if (typeSelect) {
            typeSelect.value = this.vocabFilters.type;
            typeSelect.addEventListener('change', (e) => {
                this.vocabFilters.type = e.target.value;
                this.filterVocab();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.vocabFilters.search = e.target.value.toLowerCase();
                this.filterVocab();
            });
        }
        
        // Apply initial filter
        this.filterVocab();
    }

    renderAllVocabRows(vocabData, personalOtherData, personalPastData) {
        let html = '';
        let rowIndex = 1;
        
        // Regular vocab
        vocabData.forEach((item) => {
            const originalIndex = dataLoader.getVocabData().indexOf(item);
            const isInReminds = localStorageUtils.isInReminds('vocab', originalIndex);
            html += `
                <tr data-chapter="${item[4] || ''}" data-original-index="${originalIndex}" data-type="vocab">
                    <td><span class="badge bg-light text-dark">${rowIndex++}</span></td>
                    <td><strong class="text-primary">${item[0] || ''}</strong></td>
                    <td>${dataLoader.formatVocabAnswer(item)}</td>
                    <td>
                        <button class="remind-btn ${isInReminds ? 'active' : ''}" onclick="listManager.toggleVocabRemind('vocab', ${originalIndex})">
                            <i class="bi bi-bookmark${isInReminds ? '-fill' : ''}"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        // Personal other words
        personalOtherData.forEach((item, index) => {
            const personalIndex = `personal_other_${index}`;
            const isInReminds = localStorageUtils.isInReminds('personal_other', personalIndex);
            html += `
                <tr data-chapter="personal" data-original-index="${personalIndex}" data-type="personal_other">
                    <td><span class="badge bg-light text-dark">${rowIndex++}</span></td>
                    <td><strong class="text-primary">${item[0] || ''}</strong> <small class="text-muted">(Từ mở rộng)</small></td>
                    <td>${item[2] || item[1] || ''}</td>
                    <td>
                        <button class="remind-btn ${isInReminds ? 'active' : ''}" onclick="listManager.toggleVocabRemind('personal_other', '${personalIndex}')">
                            <i class="bi bi-bookmark${isInReminds ? '-fill' : ''}"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        // Personal past test words
        personalPastData.forEach((item, index) => {
            const personalIndex = `personal_past_${index}`;
            const isInReminds = localStorageUtils.isInReminds('personal_past', personalIndex);
            const meaning = [item[1], item[2], item[3] ? `(${item[3]})` : '', item[4] && item[4].trim() ? item[4] : ''].filter(p => p).join(' - ');
            html += `
                <tr data-chapter="personal" data-original-index="${personalIndex}" data-type="personal_past">
                    <td><span class="badge bg-light text-dark">${rowIndex++}</span></td>
                    <td><strong class="text-primary">${item[0] || ''}</strong> <small class="text-muted">(Từ các năm trước)</small></td>
                    <td>${meaning}</td>
                    <td>
                        <button class="remind-btn ${isInReminds ? 'active' : ''}" onclick="listManager.toggleVocabRemind('personal_past', '${personalIndex}')">
                            <i class="bi bi-bookmark${isInReminds ? '-fill' : ''}"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        return html;
    }

    filterVocab() {
        const tbody = document.getElementById('vocab-table-body');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;
        
        rows.forEach((row, index) => {
            const chapter = row.getAttribute('data-chapter');
            const originalIndex = parseInt(row.getAttribute('data-original-index'));
            const vocabItem = dataLoader.getVocabByIndex(originalIndex);
            
            let shouldShow = true;
            
            // Filter by chapter (personal words are in 'personal' chapter)
            if (this.vocabFilters.chapter !== 'all') {
                if (this.vocabFilters.chapter === 'personal' && chapter !== 'personal') {
                    shouldShow = false;
                } else if (this.vocabFilters.chapter !== 'personal' && chapter !== this.vocabFilters.chapter) {
                    shouldShow = false;
                }
            }
            
            // Filter by type
            if (shouldShow && this.vocabFilters.type !== 'all') {
                const rowType = row.getAttribute('data-type');
                if (this.vocabFilters.type === 'personal_other' && rowType !== 'personal_other') {
                    shouldShow = false;
                } else if (this.vocabFilters.type === 'personal_past' && rowType !== 'personal_past') {
                    shouldShow = false;
                } else if (this.vocabFilters.type === 'vocab' && rowType !== 'vocab') {
                    shouldShow = false;
                } else if (this.vocabFilters.type === 'reduplicative' && rowType === 'vocab' && vocabItem && !dataLoader.isReducplicativeWord(vocabItem)) {
                    shouldShow = false;
                } else if (this.vocabFilters.type === 'katakana' && rowType === 'vocab' && vocabItem && !dataLoader.isKatakanaWord(vocabItem)) {
                    shouldShow = false;
                } else if (['reduplicative', 'katakana'].includes(this.vocabFilters.type) && rowType !== 'vocab') {
                    shouldShow = false;
                }
            }
            
            // Filter by search
            if (shouldShow && this.vocabFilters.search) {
                const rowType = row.getAttribute('data-type');
                let word = '';
                if (rowType === 'vocab' && vocabItem) {
                    word = vocabItem[0] || '';
                } else {
                    // For personal words, get from row text
                    const wordCell = row.querySelector('td:nth-child(2) strong');
                    word = wordCell ? wordCell.textContent : '';
                }
                if (!word.toLowerCase().includes(this.vocabFilters.search)) {
                    shouldShow = false;
                }
            }
            
            if (shouldShow) {
                row.style.display = '';
                visibleCount++;
                // Update row number
                const badge = row.querySelector('.badge');
                if (badge) badge.textContent = visibleCount;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Update count badge
        const countBadge = document.getElementById('vocab-count');
        if (countBadge) {
            let typeText = '';
            if (this.vocabFilters.type === 'vocab') {
                typeText = 'thường';
            } else if (this.vocabFilters.type === 'reduplicative') {
                typeText = 'chỉ hiragana';
            } else if (this.vocabFilters.type === 'katakana') {
                typeText = 'katakana';
            } else if (this.vocabFilters.type === 'personal_other') {
                typeText = 'mở rộng';
            } else if (this.vocabFilters.type === 'personal_past') {
                typeText = 'các năm trước';
            }
            countBadge.textContent = `${visibleCount} từ vựng ${typeText}`.trim();
        }
    }

    loadKanjiList() {
        const container = document.getElementById('list-kanji-table');
        const kanjiData = dataLoader.getKanjiSortedByOrder();
        
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

        const chapters = dataLoader.getKanjiChapters();

        const html = `
            <div class="mb-3">
                <div class="row g-2 align-items-center">
                    <div class="col-6 col-sm-4">
                        <label class="form-label small mb-1">Chương:</label>
                        <select class="form-select form-select-sm" id="list-kanji-chapter">
                            <option value="all">Tất cả</option>
                            ${chapters.map(chapter => `<option value="${chapter}">${chapter}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-6 col-sm-6">
                        <label class="form-label small mb-1">Tìm kiếm:</label>
                        <input type="text" class="form-control form-control-sm" id="list-kanji-search" placeholder="Nhập kanji...">
                    </div>
                    <div class="col-12 col-sm-2 text-end">
                        <span class="badge bg-primary fs-6" id="kanji-count">${kanjiData.length} kanji</span>
                    </div>
                </div>
            </div>
            
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-primary">
                        <tr>
                            <th style="width: 5%;">#</th>
                            <th style="width: 20%;">Kanji</th>
                            <th style="width: 65%;">Nghĩa</th>
                            <th style="width: 10%;">Ôn tập</th>
                        </tr>
                    </thead>
                    <tbody id="kanji-table-body">
                        ${this.renderKanjiRows(kanjiData)}
                    </tbody>
                </table>
            </div>
        `;

        container.innerHTML = html;
        
        // Add filter event listeners
        const chapterSelect = document.getElementById('list-kanji-chapter');
        const searchInput = document.getElementById('list-kanji-search');
        
        if (chapterSelect) {
            chapterSelect.value = this.selectedChapters.kanji;
            chapterSelect.addEventListener('change', (e) => {
                this.selectedChapters.kanji = e.target.value;
                this.filterKanjiByChapter();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.kanjiSearch = e.target.value.toLowerCase();
                this.filterKanjiByChapter();
            });
        }
        
        // Apply initial filter
        this.filterKanjiByChapter();
    }

    renderKanjiRows(kanjiData) {
        return kanjiData.map((item, index) => {
            const originalIndex = dataLoader.getKanjiData().indexOf(item);
            const isInReminds = localStorageUtils.isInReminds('kanji', originalIndex);
            return `
                <tr data-chapter="${item[3] || ''}" data-original-index="${originalIndex}">
                    <td><span class="badge bg-light text-dark">${index + 1}</span></td>
                    <td><strong class="text-primary">${item[0] || ''}</strong></td>
                    <td>${dataLoader.formatKanjiAnswer(item)}</td>
                    <td>
                        <button class="remind-btn ${isInReminds ? 'active' : ''}" onclick="listManager.toggleRemind('kanji', ${originalIndex})">
                            <i class="bi bi-bookmark${isInReminds ? '-fill' : ''}"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    filterKanjiByChapter() {
        const tbody = document.getElementById('kanji-table-body');
        if (!tbody) return;
        
        const rows = tbody.querySelectorAll('tr');
        let visibleCount = 0;
        
        rows.forEach((row, index) => {
            const chapter = row.getAttribute('data-chapter');
            const originalIndex = parseInt(row.getAttribute('data-original-index'));
            const kanjiItem = dataLoader.getKanjiByIndex(originalIndex);
            
            let shouldShow = this.selectedChapters.kanji === 'all' || chapter === this.selectedChapters.kanji;
            
            // Filter by search
            if (shouldShow && this.kanjiSearch && kanjiItem) {
                const kanji = kanjiItem[0] || '';
                if (!kanji.toLowerCase().includes(this.kanjiSearch)) {
                    shouldShow = false;
                }
            }
            
            if (shouldShow) {
                row.style.display = '';
                visibleCount++;
                // Update row number
                const badge = row.querySelector('.badge');
                if (badge) badge.textContent = visibleCount;
            } else {
                row.style.display = 'none';
            }
        });
        
        // Update count badge
        const countBadge = document.getElementById('kanji-count');
        if (countBadge) {
            countBadge.textContent = `${visibleCount} kanji`;
        }
    }

    loadGrammarList() {
        const container = document.getElementById('list-grammar-cards');
        const grammarData = dataLoader.getGrammarSortedByOrder();
        
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

        const chapters = dataLoader.getGrammarChapters();

        const html = `
            <div class="mb-3">
                <div class="row g-2 align-items-center">
                    <div class="col-6 col-sm-4">
                        <label class="form-label small mb-1">Chương:</label>
                        <select class="form-select form-select-sm" id="list-grammar-chapter">
                            <option value="all">Tất cả</option>
                            ${chapters.map(chapter => `<option value="${chapter}">${chapter}</option>`).join('')}
                        </select>
                    </div>
                    <div class="col-6 col-sm-6">
                        <label class="form-label small mb-1">Tìm kiếm:</label>
                        <input type="text" class="form-control form-control-sm" id="list-grammar-search" placeholder="Nhập ngữ pháp...">
                    </div>
                    <div class="col-12 col-sm-2 text-end">
                        <span class="badge bg-primary fs-6" id="grammar-count">${grammarData.length} ngữ pháp</span>
                    </div>
                </div>
            </div>
            
            <div id="grammar-cards-container">
                ${this.renderGrammarCards(grammarData)}
            </div>
        `;

        container.innerHTML = html;
        
        // Add filter event listeners
        const chapterSelect = document.getElementById('list-grammar-chapter');
        const searchInput = document.getElementById('list-grammar-search');
        
        if (chapterSelect) {
            chapterSelect.value = this.selectedChapters.grammar;
            chapterSelect.addEventListener('change', (e) => {
                this.selectedChapters.grammar = e.target.value;
                this.filterGrammarByChapter();
            });
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.grammarSearch = e.target.value.toLowerCase();
                this.filterGrammarByChapter();
            });
        }
        
        // Apply initial filter
        this.filterGrammarByChapter();
        
        // Auto-resize grammar structures
        this.autoResizeGrammarStructures();
    }

    renderGrammarCards(grammarData) {
        let html = '';
        let currentChapter = null;
        let cardIndex = 0;

        grammarData.forEach((item, index) => {
            const originalIndex = dataLoader.getGrammarData().indexOf(item);
            const chapter = parseInt(item[4]) || 0;
            
            // Add chapter separator if showing all chapters and chapter changes
            if (this.selectedChapters.grammar === 'all' && chapter !== currentChapter) {
                html += `<div class="chapter-header"><h4>Chương ${chapter}</h4><hr class="chapter-line"></div>`;
                currentChapter = chapter;
            }

            const [structure, meaning, notice, examples] = item;
            const processedStructure = dataLoader.processGrammarStructure(structure);
            const noticePoints = dataLoader.parseGrammarNotice(notice);
            const exampleList = dataLoader.parseGrammarExamples(examples);

            cardIndex++;
            html += `
                <div class="col-12 mb-3 grammar-card" data-chapter="${chapter}" data-original-index="${originalIndex}">
                    <div class="card border-0 shadow-sm">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-1">
                                <span class="badge bg-primary">#${cardIndex}</span>
                                <button class="remind-btn ${localStorageUtils.isInReminds('grammar', originalIndex) ? 'active' : ''}" onclick="listManager.toggleRemind('grammar', ${originalIndex})">
                                    <i class="bi bi-bookmark${localStorageUtils.isInReminds('grammar', originalIndex) ? '-fill' : ''}"></i>
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
        });

        return `<div class="row">${html}</div>`;
    }

    filterGrammarByChapter() {
        const container = document.getElementById('grammar-cards-container');
        if (!container) return;
        
        // Re-render cards with proper filtering and chapter separators
        const grammarData = dataLoader.getGrammarSortedByOrder();
        let filteredData = grammarData;
        
        if (this.selectedChapters.grammar !== 'all') {
            filteredData = grammarData.filter(item => {
                const chapter = parseInt(item[4]) || 0;
                return chapter === parseInt(this.selectedChapters.grammar);
            });
        }
        
        // Filter by search
        if (this.grammarSearch) {
            filteredData = filteredData.filter(item => {
                const structure = item[0] || '';
                return structure.toLowerCase().includes(this.grammarSearch);
            });
        }
        
        container.innerHTML = this.renderGrammarCards(filteredData);
        
        // Update count badge
        const countBadge = document.getElementById('grammar-count');
        if (countBadge) {
            countBadge.textContent = `${filteredData.length} ngữ pháp`;
        }
        
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
    
    toggleVocabRemind(type, index) {
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