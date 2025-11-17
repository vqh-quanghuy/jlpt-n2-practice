// Kanji Quiz Module

class KanjiQuiz {
    constructor() {
        this.currentQuestion = null;
        this.currentIndex = -1;
        this.availableData = [];
        this.isRevertMode = false;
        this.useRemindsOnly = false;
    }

    initialize() {
        const revertCheckbox = document.getElementById('kanji-revert');
        const remindsCheckbox = document.getElementById('kanji-reminds');
        
        if (revertCheckbox) {
            revertCheckbox.addEventListener('change', (e) => {
                this.isRevertMode = e.target.checked;
                this.generateNewQuestion();
            });
        }
        
        if (remindsCheckbox) {
            remindsCheckbox.addEventListener('change', (e) => {
                this.useRemindsOnly = e.target.checked;
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
    }

    updateAvailableData() {
        if (this.useRemindsOnly) {
            const reminds = localStorageUtils.getRemindsByType('kanji');
            if (reminds.length >= 4) {
                this.availableData = reminds.map(index => ({
                    data: dataLoader.getKanjiByIndex(index),
                    originalIndex: index
                })).filter(item => item.data);
            } else {
                // Not enough reminds, use all data
                this.availableData = dataLoader.getKanjiData().map((data, index) => ({
                    data,
                    originalIndex: index
                }));
                document.getElementById('kanji-reminds').checked = false;
                this.useRemindsOnly = false;
                this.showNotification('Need at least 4 items in reminds list', 'warning');
            }
        } else {
            this.availableData = dataLoader.getKanjiData().map((data, index) => ({
                data,
                originalIndex: index
            }));
        }
    }

    generateNewQuestion() {
        if (!dataLoader.isLoaded || this.availableData.length === 0) {
            this.updateAvailableData();
            return;
        }

        // Get smart random question using encounter tracking
        const availableIndices = this.availableData.map(item => item.originalIndex);
        const mode = this.isRevertMode ? 'revert' : 'normal';
        const smartIndex = localStorageUtils.getSmartRandomIndex(availableIndices, 'kanji', mode, this.useRemindsOnly);
        
        const questionItem = this.availableData.find(item => item.originalIndex === smartIndex);
        this.currentQuestion = questionItem.data;
        this.currentIndex = questionItem.originalIndex;

        if (!this.isRevertMode) {
            this.generateNormalMode();
        } else {
            this.generateRevertMode();
        }
    }

    generateNormalMode() {
        const kanji = this.currentQuestion[0];
        
        // Generate wrong answers
        const wrongIndices = [];
        while (wrongIndices.length < 3) {
            const randomIndex = Math.floor(Math.random() * this.availableData.length);
            const item = this.availableData[randomIndex];
            if (item.originalIndex !== this.currentIndex && !wrongIndices.some(wi => wi.originalIndex === item.originalIndex)) {
                wrongIndices.push(item);
            }
        }

        // Create answer options
        const correctAnswer = {
            text: dataLoader.formatKanjiAnswer(this.currentQuestion),
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: dataLoader.formatKanjiAnswer(item.data),
            isCorrect: false,
            data: item.data
        }));

        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);

        this.displayQuestion(kanji, allAnswers, false);
    }

    generateRevertMode() {
        const pronounce = this.currentQuestion[1]; // Japanese pronounce
        
        if (!pronounce || pronounce === '') {
            this.generateNewQuestion();
            return;
        }

        // Generate wrong answers
        const wrongIndices = [];
        while (wrongIndices.length < 3) {
            const randomIndex = Math.floor(Math.random() * this.availableData.length);
            const item = this.availableData[randomIndex];
            if (item.originalIndex !== this.currentIndex && !wrongIndices.some(wi => wi.originalIndex === item.originalIndex)) {
                wrongIndices.push(item);
            }
        }

        // Create answer options with full format for revert mode
        const correctAnswer = {
            text: this.currentQuestion[0], // Kanji for selection
            fullText: `${this.currentQuestion[0]} - ${this.currentQuestion[1]} - ${this.currentQuestion[2]}`, // Full format for result
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: item.data[0], // Kanji for selection
            fullText: `${item.data[0]} - ${item.data[1]} - ${item.data[2]}`, // Full format for result
            isCorrect: false,
            data: item.data
        }));

        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);

        this.displayQuestion(pronounce, allAnswers, true);
    }

    displayQuestion(questionText, answers, isRevertMode) {
        const quizContainer = document.getElementById('kanji-quiz');
        
        const html = `
            <div class="question-container">
                <div class="question-content">
                    <div class="question-text">
                        ${questionText}
                        <i class="bi bi-bookmark bookmark-icon ${localStorageUtils.isInReminds('kanji', this.currentIndex) ? 'bookmarked' : ''}" 
                           onclick="kanjiQuiz.toggleRemind()" title="Add to reminds"></i>
                    </div>
                </div>
            </div>
            
            <div class="answer-options">
                ${answers.map((answer, index) => `
                    <div class="answer-chip" onclick="kanjiQuiz.selectAnswer(${index}, ${answer.isCorrect})">
                        ${answer.text}
                    </div>
                `).join('')}
            </div>
            
            <button class="new-quiz-btn" onclick="kanjiQuiz.generateNewQuestion()">
                <i class="bi bi-arrow-clockwise me-2"></i>Câu hỏi khác
            </button>
        `;

        quizContainer.innerHTML = html;
        this.currentAnswers = answers;
        
        // Auto-resize font to fit container
        const questionElement = quizContainer.querySelector('.question-text');
        if (questionElement) {
            this.autoResizeText(questionElement);
        }
    }

    selectAnswer(answerIndex, isCorrect) {
        const answerChips = document.querySelectorAll('#kanji-quiz .answer-chip');
        
        // Disable all chips
        answerChips.forEach(chip => chip.classList.add('disabled'));
        
        // Show full format for all answers in revert mode
        if (this.isRevertMode) {
            answerChips.forEach((chip, index) => {
                if (this.currentAnswers[index].fullText) {
                    chip.innerHTML = this.currentAnswers[index].fullText;
                }
            });
        }
        
        // Mark selected answer
        const selectedChip = answerChips[answerIndex];
        if (isCorrect) {
            selectedChip.classList.add('correct');
        } else {
            selectedChip.classList.add('incorrect');
            // Add to reminds if wrong
            localStorageUtils.addToReminds('kanji', this.currentIndex);
            
            // Show correct answer
            answerChips.forEach((chip, index) => {
                if (this.currentAnswers[index].isCorrect) {
                    chip.classList.add('correct');
                }
            });
        }
    }

    toggleRemind() {
        const isCurrentlyInReminds = localStorageUtils.isInReminds('kanji', this.currentIndex);
        const bookmarkIcon = document.querySelector('#kanji-quiz .bookmark-icon');
        
        if (isCurrentlyInReminds) {
            localStorageUtils.removeFromReminds('kanji', this.currentIndex);
            bookmarkIcon.classList.remove('bookmarked');
            this.showNotification('Đã xoá khỏi danh sách ôn tập', 'info');
        } else {
            localStorageUtils.addToReminds('kanji', this.currentIndex);
            bookmarkIcon.classList.add('bookmarked');
            this.showNotification('Đã thêm vào danh sách ôn tập!', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const toast = document.getElementById('notification-toast');
        const toastBody = toast.querySelector('.toast-body');
        
        // Update message and style
        toastBody.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>${message}`;
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    autoResizeText(element) {
        let fontSize = 28; // Start with 1.75rem (28px)
        element.style.fontSize = fontSize + 'px';
        
        while (element.scrollHeight > element.clientHeight && fontSize > 12) {
            fontSize -= 2;
            element.style.fontSize = fontSize + 'px';
        }
    }

    start() {
        this.updateAvailableData();
        this.generateNewQuestion();
    }
}

// Create global instance
const kanjiQuiz = new KanjiQuiz();
