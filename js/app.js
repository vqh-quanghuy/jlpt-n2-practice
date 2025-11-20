// Main Application Controller

class App {
    constructor() {
        this.currentSection = 'vocab';
        this.isLoading = true;
    }

    async initialize() {
        console.log('Initializing JLPT N2 Practice App...');
        
        // Show loading screen
        this.showLoading(true);
        
        try {
            // Load data
            const success = await dataLoader.loadAllData();
            
            if (!success) {
                throw new Error('Failed to load data files');
            }

            // Initialize all modules
            if (typeof vocabQuiz !== 'undefined') vocabQuiz.initialize();
            if (typeof kanjiQuiz !== 'undefined') kanjiQuiz.initialize();
            if (typeof grammarQuiz !== 'undefined') grammarQuiz.initialize();
            if (typeof remindsManager !== 'undefined') remindsManager.initialize();
            if (typeof listManager !== 'undefined') listManager.initialize();
            
            // Initialize chapter dropdowns after data is loaded
            this.initializeChapterDropdowns();

            // Set up navigation
            this.initializeNavigation();

            // Hide loading screen
            this.showLoading(false);

            // Restore state from URL or start with vocab
            this.restoreStateFromURL();
            
            console.log('App initialized successfully');

        } catch (error) {
            console.error('Error initializing app:', error);
            this.showError('Failed to load application. Please check if data files are available.');
        }
    }

    initializeNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const section = e.target.getAttribute('data-tab');
                if (section) {
                    this.switchToSection(section);
                }
            });
        });
    }

    switchToSection(section, tab = null) {
        // Update navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeButton = document.querySelector(`.nav-btn[data-tab="${section}"]`);
        if (activeButton) {
            activeButton.classList.add('active');
        }

        // Hide all sections
        document.querySelectorAll('.quiz-section').forEach(sec => {
            sec.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update URL hash
        const hash = tab ? `${section}-${tab}` : section;
        window.location.hash = hash;

        // Initialize section content
        this.currentSection = section;
        this.initializeSection(section, tab);
    }

    initializeSection(section, tab = null) {
        switch (section) {
            case 'vocab':
                if (typeof vocabQuiz !== 'undefined') vocabQuiz.start();
                break;
            case 'kanji':
                if (typeof kanjiQuiz !== 'undefined') kanjiQuiz.start();
                break;
            case 'grammar':
                if (typeof grammarQuiz !== 'undefined') grammarQuiz.start();
                break;
            case 'reminds':
                if (typeof remindsManager !== 'undefined') {
                    remindsManager.show();
                    if (tab) remindsManager.switchToTab(tab);
                }
                break;
            case 'list':
                if (typeof listManager !== 'undefined') {
                    listManager.show();
                    if (tab) listManager.switchToTab(tab);
                }
                break;
        }
    }

    showLoading(show) {
        const loadingElement = document.getElementById('loading');
        const quizSections = document.getElementById('quiz-sections');
        
        if (show) {
            loadingElement.classList.remove('d-none');
            quizSections.classList.remove('show');
        } else {
            loadingElement.classList.add('d-none');
            quizSections.classList.add('show');
        }
        
        this.isLoading = show;
    }

    showError(message) {
        const loadingElement = document.getElementById('loading');
        loadingElement.innerHTML = `
            <div class="alert alert-danger" role="alert">
                <h4 class="alert-heading">Error!</h4>
                <p>${message}</p>
                <hr>
                <p class="mb-0">
                    Please make sure the following TSV files are available in the 'data' folder:
                    <ul class="mt-2">
                        <li>n2-vocab.tsv</li>
                        <li>n2-kanji.tsv</li>
                        <li>n2-grammar.tsv</li>
                    </ul>
                </p>
                <button class="btn btn-outline-danger mt-3" onclick="app.initialize()">
                    Try Again
                </button>
            </div>
        `;
    }

    // Utility method to show notifications
    showNotification(message, type = 'success') {
        const toast = document.getElementById('notification-toast');
        const toastBody = toast.querySelector('.toast-body');
        
        // Update message and style
        toastBody.textContent = message;
        toast.className = `toast ${type === 'success' ? 'bg-success' : 'bg-danger'} text-white`;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    // Get current section
    getCurrentSection() {
        return this.currentSection;
    }

    // Check if app is loading
    isAppLoading() {
        return this.isLoading;
    }

    // Initialize chapter dropdowns
    initializeChapterDropdowns() {
        // This will be called after data is loaded to populate chapter dropdowns
        if (typeof vocabQuiz !== 'undefined' && vocabQuiz.populateChapterDropdown) {
            vocabQuiz.populateChapterDropdown();
        }
        if (typeof kanjiQuiz !== 'undefined' && kanjiQuiz.populateChapterDropdown) {
            kanjiQuiz.populateChapterDropdown();
        }
        if (typeof grammarQuiz !== 'undefined' && grammarQuiz.populateChapterDropdown) {
            grammarQuiz.populateChapterDropdown();
        }
        if (typeof remindsManager !== 'undefined' && remindsManager.initializeChapterDropdowns) {
            remindsManager.initializeChapterDropdowns();
        }
    }

    // Restore state from URL hash
    restoreStateFromURL() {
        const hash = window.location.hash.slice(1); // Remove #
        if (hash) {
            const parts = hash.split('-');
            const section = parts[0];
            const tab = parts[1];
            this.switchToSection(section, tab);
        } else {
            this.switchToSection('vocab');
        }
    }
}

// Create global app instance
const app = new App();

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    app.initialize();
});

// Handle browser back/forward buttons and hash changes
window.addEventListener('hashchange', () => {
    app.restoreStateFromURL();
});

// Add some global keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Only handle shortcuts when not in loading state and not typing in inputs
    if (app.isAppLoading() || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
    }

    switch (e.key) {
        case '1':
            app.switchToSection('vocab');
            break;
        case '2':
            app.switchToSection('kanji');
            break;
        case '3':
            app.switchToSection('grammar');
            break;
        case '4':
            app.switchToSection('reminds');
            break;
        case '5':
            app.switchToSection('list');
            break;
        case ' ': // Spacebar for new question
            e.preventDefault();
            const currentSection = app.getCurrentSection();
            if (currentSection === 'vocab' && typeof vocabQuiz !== 'undefined') {
                vocabQuiz.generateNewQuestion();
            } else if (currentSection === 'kanji' && typeof kanjiQuiz !== 'undefined') {
                kanjiQuiz.generateNewQuestion();
            } else if (currentSection === 'grammar' && typeof grammarQuiz !== 'undefined') {
                grammarQuiz.generateNewQuestion();
            }
            break;
    }
});
