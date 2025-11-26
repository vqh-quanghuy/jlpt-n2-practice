// Reminds Module

class RemindsManager {
    constructor() {
        this.currentTab = 'vocab';
        this.selectedChapters = {
            vocab: 'all',
            kanji: 'all',
            grammar: 'all'
        };
        this.vocabRemindType = 'all';
    }

    initialize() {
        // Initialize tab switching
        const tabButtons = document.querySelectorAll('#reminds-tabs button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target.getAttribute('data-bs-target');
                if (target) {
                    const tab = target.replace('#reminds-', '');
                    this.switchToTab(tab);
                }
            });
        });

        // Initialize chapter dropdowns
        this.initializeChapterDropdowns();
    }

    initializeChapterDropdowns() {
        // Vocab filters are now handled in setupVocabRemindFilters

        // Kanji chapter dropdown
        const kanjiChapterSelect = document.getElementById('reminds-kanji-chapter');
        if (kanjiChapterSelect) {
            this.populateChapterDropdown(kanjiChapterSelect, dataLoader.getKanjiChapters());
            kanjiChapterSelect.addEventListener('change', (e) => {
                this.selectedChapters.kanji = e.target.value;
                this.loadKanjiReminds();
            });
        }

        // Grammar chapter dropdown
        const grammarChapterSelect = document.getElementById('reminds-grammar-chapter');
        if (grammarChapterSelect) {
            this.populateChapterDropdown(grammarChapterSelect, dataLoader.getGrammarChapters());
            grammarChapterSelect.addEventListener('change', (e) => {
                this.selectedChapters.grammar = e.target.value;
                this.loadGrammarReminds();
            });
        }
    }

    populateChapterDropdown(selectElement, chapters) {
        selectElement.innerHTML = '<option value="all">Tất cả</option>';
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = ` ${chapter}`;
            selectElement.appendChild(option);
        });
    }

    show() {
        this.loadAllTabs();
    }

    loadAllTabs() {
        this.loadVocabReminds();
        this.loadKanjiReminds();
        this.loadGrammarReminds();
    }

    loadTabContent() {
        switch (this.currentTab) {
            case 'vocab':
                this.loadVocabReminds();
                break;
            case 'kanji':
                this.loadKanjiReminds();
                break;
            case 'grammar':
                this.loadGrammarReminds();
                break;
        }
    }

    loadVocabReminds() {
        const container = document.getElementById('reminds-vocab-table');
        
        // Add type selector with cross-loading support
        const typeSelector = dataLoader.isInPersonalMode() ? `
            <div class="mb-3">
                <div class="row g-2 align-items-center">
                    <div class="col-6">
                        <label class="me-2">Chương:</label>
                        <select class="form-select form-select-sm" id="reminds-vocab-chapter" style="max-width: 150px;">
                            <option value="all">Tất cả</option>
                        </select>
                    </div>
                    <div class="col-6">
                        <label class="me-2">Loại:</label>
                        <select class="form-select form-select-sm" id="reminds-vocab-type" style="max-width: 150px;">
                            <option value="all">Tất cả</option>
                            <option value="vocab">Từ vựng thường</option>
                            <option value="personal_other">Từ mở rộng</option>
                            <option value="personal_past">Từ các năm trước</option>
                            <option value="personal_reduplicative">Từ láy</option>
                        </select>
                    </div>
                </div>
            </div>
        ` : `
            <div class="mb-3">
                <div class="d-flex align-items-center">
                    <label class="me-2">Chương:</label>
                    <select class="form-select form-select-sm" id="reminds-vocab-chapter" style="max-width: 150px;">
                        <option value="all">Tất cả</option>
                    </select>
                </div>
            </div>
        `;
        
        // Get reminds (same storage for both modes)
        const regularReminds = localStorageUtils.getRemindsByType('vocab');
        const personalOtherReminds = dataLoader.isInPersonalMode() ? localStorageUtils.getRemindsByType('personal_other') : [];
        const personalPastReminds = dataLoader.isInPersonalMode() ? localStorageUtils.getRemindsByType('personal_past') : [];
        const personalReducplicativeReminds = dataLoader.isInPersonalMode() ? localStorageUtils.getRemindsByType('personal_reduplicative') : [];
        
        const selectedType = this.vocabRemindType || 'all';
        
        // Filter by type first
        let filteredRegularReminds = selectedType === 'all' || selectedType === 'vocab' ? regularReminds : [];
        let filteredPersonalOther = selectedType === 'all' || selectedType === 'personal_other' ? personalOtherReminds : [];
        let filteredPersonalPast = selectedType === 'all' || selectedType === 'personal_past' ? personalPastReminds : [];
        let filteredPersonalReducplicative = selectedType === 'all' || selectedType === 'personal_reduplicative' ? personalReducplicativeReminds : [];
        
        // Filter regular reminds by chapter if not 'all' and chapter selector is enabled
        const chapterDisabled = selectedType === 'personal_other' || selectedType === 'personal_past' || selectedType === 'personal_reduplicative';
        if (!chapterDisabled && this.selectedChapters.vocab !== 'all') {
            filteredRegularReminds = filteredRegularReminds.filter(index => {
                const chapter = dataLoader.getVocabChapter(index);
                return chapter === parseInt(this.selectedChapters.vocab);
            });
        }
        
        const totalReminds = filteredRegularReminds.length + filteredPersonalOther.length + filteredPersonalPast.length + filteredPersonalReducplicative.length;
        
        if (totalReminds === 0) {
            container.innerHTML = typeSelector + `
                <div class="empty-state">
                    <i class="bi bi-bookmark"></i>
                    <h5>No vocabulary reminds yet</h5>
                    <p>Words you get wrong or pin will appear here</p>
                </div>
            `;
            this.setupVocabRemindFilters(chapterDisabled);
            return;
        }

        // Regular vocab data
        const regularVocabData = filteredRegularReminds.map(index => ({
            index,
            data: dataLoader.getVocabByIndex(index),
            type: 'vocab',
            typeLabel: dataLoader.isInPersonalMode() ? 'Từ vựng thường' : null
        })).filter(item => item.data);
        
        // Personal other words data
        const personalOtherData = filteredPersonalOther.map(index => {
            // Convert back from short key if needed
            const longIndex = localStorageUtils.convertFromShortKey(index);
            const numIndex = parseInt(String(longIndex).replace('personal_other_', ''));
            return {
                index,
                data: dataLoader.getPersonalOtherWords()[numIndex],
                type: 'personal_other',
                typeLabel: 'Từ mở rộng'
            };
        }).filter(item => item.data);
        
        // Personal past test words data
        const personalPastData = filteredPersonalPast.map(index => {
            // Convert back from short key if needed
            const longIndex = localStorageUtils.convertFromShortKey(index);
            const numIndex = parseInt(String(longIndex).replace('personal_past_', ''));
            return {
                index,
                data: dataLoader.getPersonalPastTestWords()[numIndex],
                type: 'personal_past',
                typeLabel: 'Từ các năm trước'
            };
        }).filter(item => item.data);
        
        // Personal reduplicative words data
        const personalReducplicativeData = filteredPersonalReducplicative.map(index => {
            // Convert back from short key if needed
            const longIndex = localStorageUtils.convertFromShortKey(index);
            const numIndex = parseInt(String(longIndex).replace('personal_reduplicative_', ''));
            return {
                index,
                data: dataLoader.getPersonalReducplicativeWords()[numIndex],
                type: 'personal_reduplicative',
                typeLabel: 'Từ láy'
            };
        }).filter(item => item.data);
        
        const allVocabData = [...regularVocabData, ...personalOtherData, ...personalPastData, ...personalReducplicativeData];

        const html = typeSelector + `
            <table class="table remind-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Từ vựng</th>
                        <th style="width: 65%;">Nghĩa</th>
                        <th style="width: 10%;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${allVocabData.map(item => `
                        <tr>
                            <td><strong>${item.data[0]}</strong>${dataLoader.isInPersonalMode() && item.typeLabel ? ` <small class="text-muted">(${item.typeLabel})</small>` : ''}</td>
                            <td>${this.formatVocabAnswerForRemind(item.data, item.type)}</td>
                            <td>
                                <button class="remind-btn" onclick="remindsManager.removeVocabRemind('${item.index}', '${item.type}')">
                                    <i class="bi bi-x"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
        this.setupVocabRemindFilters(chapterDisabled);
    }
    
    setupVocabRemindFilters(chapterDisabled) {
        const chapterSelect = document.getElementById('reminds-vocab-chapter');
        const typeSelect = document.getElementById('reminds-vocab-type');
        
        if (chapterSelect) {
            // Populate chapter dropdown
            const chapters = dataLoader.getVocabChapters();
            chapterSelect.innerHTML = '<option value="all">Tất cả</option>';
            chapters.forEach(chapter => {
                const option = document.createElement('option');
                option.value = chapter;
                option.textContent = ` ${chapter}`;
                chapterSelect.appendChild(option);
            });
            
            chapterSelect.value = this.selectedChapters.vocab;
            chapterSelect.disabled = chapterDisabled;
            
            chapterSelect.addEventListener('change', (e) => {
                this.selectedChapters.vocab = e.target.value;
                this.loadVocabReminds();
            });
        }
        
        if (typeSelect) {
            typeSelect.value = this.vocabRemindType || 'all';
            typeSelect.addEventListener('change', (e) => {
                this.vocabRemindType = e.target.value;
                // Update chapter selector state based on type
                if (chapterSelect) {
                    const isPersonalType = ['personal_other', 'personal_past', 'personal_reduplicative'].includes(e.target.value);
                    chapterSelect.disabled = isPersonalType;
                    if (isPersonalType) {
                        this.selectedChapters.vocab = 'all';
                        chapterSelect.value = 'all';
                    }
                }
                this.loadVocabReminds();
            });
        }
    }
    
    formatVocabAnswerForRemind(vocabItem, type) {
        if (type === 'personal_other') {
            return vocabItem[2] || vocabItem[1] || ''; // meaning only
        } else if (type === 'personal_past') {
            const parts = [];
            if (vocabItem[1]) parts.push(vocabItem[1]); // pronunciation
            if (vocabItem[2]) parts.push(vocabItem[2]); // meaning
            if (vocabItem[3]) parts.push(`(${vocabItem[3]})`); // test time
            return parts.join(' - ');
        } else if (type === 'personal_reduplicative') {
            return vocabItem[1] || ''; // meaning only for reduplicative
        } else {
            return dataLoader.formatVocabAnswer(vocabItem);
        }
    }

    loadKanjiReminds() {
        const container = document.getElementById('reminds-kanji-table');
        
        // Get reminds (same storage for both modes)
        const reminds = localStorageUtils.getRemindsByType('kanji');
        
        // Filter by chapter if not 'all'
        let filteredReminds = reminds;
        if (this.selectedChapters.kanji !== 'all') {
            filteredReminds = reminds.filter(index => {
                const chapter = dataLoader.getKanjiChapter(index);
                return chapter === parseInt(this.selectedChapters.kanji);
            });
        }
        
        const totalReminds = filteredReminds.length;
        
        if (totalReminds === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bookmark"></i>
                    <h5>No kanji reminds yet</h5>
                    <p>Kanji you get wrong or pin will appear here</p>
                </div>
            `;
            return;
        }

        // Kanji data
        const kanjiData = filteredReminds.map(index => ({
            index,
            data: dataLoader.getKanjiByIndex(index),
            type: 'kanji'
        })).filter(item => item.data);

        const html = `
            <table class="table remind-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Kanji</th>
                        <th style="width: 65%;">Nghĩa</th>
                        <th style="width: 10%;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${kanjiData.map(item => `
                        <tr>
                            <td><strong>${item.data[0]}</strong></td>
                            <td>${dataLoader.formatKanjiAnswer(item.data)}</td>
                            <td>
                                <button class="remind-btn" onclick="remindsManager.removeKanjiRemind(${item.index})">
                                    <i class="bi bi-x"></i>
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    }

    loadGrammarReminds() {
        const container = document.getElementById('reminds-grammar-cards');
        
        // Get reminds (same storage for both modes)
        const reminds = localStorageUtils.getRemindsByType('grammar');
        
        // Filter by chapter if not 'all'
        let filteredReminds = reminds;
        if (this.selectedChapters.grammar !== 'all') {
            filteredReminds = reminds.filter(index => {
                const chapter = dataLoader.getGrammarChapter(index);
                return chapter === parseInt(this.selectedChapters.grammar);
            });
        }
        
        const totalReminds = filteredReminds.length;
        
        if (totalReminds === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bookmark"></i>
                    <h5>No grammar reminds yet</h5>
                    <p>Grammar points you get wrong or pin will appear here</p>
                </div>
            `;
            return;
        }

        // Grammar data
        const grammarData = filteredReminds.map(index => ({
            index,
            data: dataLoader.getGrammarByIndex(index),
            type: 'grammar'
        })).filter(item => item.data);

        const html = grammarData.map(item => {
            const [structure, meaning, notice, examples] = item.data;
            const processedStructure = dataLoader.processGrammarStructure(structure);
            const noticePoints = dataLoader.parseGrammarNotice(notice);
            const exampleList = dataLoader.parseGrammarExamples(examples);

            return `
                <div class="grammar-remind-card">
                    <button class="close-btn" onclick="remindsManager.removeGrammarRemind(${item.index})">
                        <i class="bi bi-x"></i>
                    </button>
                    <div class="card-body">
                        <div class="grammar-structure">${processedStructure}</div>
                        <div class="grammar-meaning">${meaning}</div>
                        
                        ${noticePoints.length > 0 ? `
                            <div class="grammar-notice">
                                <strong>Notice:</strong>
                                <ul>
                                    ${noticePoints.map(point => `<li>${point}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                        
                        ${exampleList.length > 0 ? `
                            <div class="grammar-examples">
                                <strong>Ví dụ:</strong>
                                <ul>
                                    ${exampleList.map(example => `<li>${example}</li>`).join('')}
                                </ul>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

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

    showConfirmModal(message, callback) {
        document.getElementById('confirmMessage').textContent = message;
        const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
        modal.show();
        
        const confirmBtn = document.getElementById('confirmDelete');
        const newConfirmBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        
        newConfirmBtn.addEventListener('click', () => {
            callback();
            modal.hide();
        });
    }

    removeVocabRemind(index, type = 'vocab') {
        this.showConfirmModal('Bạn có chắc muốn xóa từ vựng này khỏi danh sách ôn tập?', () => {
            localStorageUtils.removeFromReminds(type, index);
            this.loadVocabReminds();
            this.showNotification('Đã xoá từ vựng khỏi danh sách ôn tập');
        });
    }

    removeKanjiRemind(index) {
        this.showConfirmModal('Bạn có chắc muốn xóa kanji này khỏi danh sách ôn tập?', () => {
            localStorageUtils.removeFromReminds('kanji', index);
            this.loadKanjiReminds();
            this.showNotification('Đã xoá kanji khỏi danh sách ôn tập');
        });
    }

    removeGrammarRemind(index) {
        this.showConfirmModal('Bạn có chắc muốn xóa ngữ pháp này khỏi danh sách ôn tập?', () => {
            localStorageUtils.removeFromReminds('grammar', index);
            this.loadGrammarReminds();
            this.showNotification('Đã xoá ngữ pháp khỏi danh sách ôn tập');
        });
    }

    switchToTab(tab) {
        this.currentTab = tab;
        window.location.hash = `reminds-${tab}`;
        
        // Activate Bootstrap tab
        const tabButton = document.querySelector(`#reminds-tabs button[data-bs-target="#reminds-${tab}"]`);
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
const remindsManager = new RemindsManager();