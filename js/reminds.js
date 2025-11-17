// Reminds Module

class RemindsManager {
    constructor() {
        this.currentTab = 'vocab';
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
        const reminds = localStorageUtils.getRemindsByType('vocab');
        
        if (reminds.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bookmark"></i>
                    <h5>No vocabulary reminds yet</h5>
                    <p>Words you get wrong or pin will appear here</p>
                </div>
            `;
            return;
        }

        const vocabData = reminds.map(index => ({
            index,
            data: dataLoader.getVocabByIndex(index)
        })).filter(item => item.data);

        const html = `
            <table class="table table-striped remind-table">
                <thead>
                    <tr>
                        <th style="width: 25%;">Từ vựng</th>
                        <th style="width: 65%;">Nghĩa</th>
                        <th style="width: 10%;"></th>
                    </tr>
                </thead>
                <tbody>
                    ${vocabData.map(item => `
                        <tr>
                            <td><strong>${item.data[0]}</strong></td>
                            <td>${dataLoader.formatVocabAnswer(item.data)}</td>
                            <td>
                                <button class="remind-btn" onclick="remindsManager.removeVocabRemind(${item.index})">
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

    loadKanjiReminds() {
        const container = document.getElementById('reminds-kanji-table');
        const reminds = localStorageUtils.getRemindsByType('kanji');
        
        if (reminds.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bookmark"></i>
                    <h5>No kanji reminds yet</h5>
                    <p>Kanji you get wrong or pin will appear here</p>
                </div>
            `;
            return;
        }

        const kanjiData = reminds.map(index => ({
            index,
            data: dataLoader.getKanjiByIndex(index)
        })).filter(item => item.data);

        const html = `
            <table class="table table-striped remind-table">
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
        const reminds = localStorageUtils.getRemindsByType('grammar');
        
        if (reminds.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-bookmark"></i>
                    <h5>No grammar reminds yet</h5>
                    <p>Grammar points you get wrong or pin will appear here</p>
                </div>
            `;
            return;
        }

        const grammarData = reminds.map(index => ({
            index,
            data: dataLoader.getGrammarByIndex(index)
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

    removeVocabRemind(index) {
        this.showConfirmModal('Bạn có chắc muốn xóa từ vựng này khỏi danh sách ôn tập?', () => {
            localStorageUtils.removeFromReminds('vocab', index);
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