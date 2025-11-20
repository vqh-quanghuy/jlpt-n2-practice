// Kanji Quiz Module

class KanjiQuiz {
    constructor() {
        this.currentQuestion = null;
        this.currentIndex = -1;
        this.availableData = [];
        this.isRevertMode = false;
        this.useRemindsOnly = false;
        this.selectedChapter = 'all';
    }

    initialize() {
        const revertCheckbox = document.getElementById('kanji-revert');
        const remindsCheckbox = document.getElementById('kanji-reminds');
        const chapterSelect = document.getElementById('kanji-chapter');
        
        // Populate chapter dropdown
        this.populateChapterDropdown();
        
        // Restore checkbox states from localStorage
        const lastQuestion = localStorageUtils.getLastQuestion('kanji');
        if (lastQuestion.mode) {
            this.isRevertMode = lastQuestion.mode.is_revert === 1;
            this.useRemindsOnly = lastQuestion.mode.is_remind === 1;
            this.selectedChapter = lastQuestion.mode.chapter || 'all';
            
            if (revertCheckbox) revertCheckbox.checked = this.isRevertMode;
            if (remindsCheckbox) remindsCheckbox.checked = this.useRemindsOnly;
            if (chapterSelect) chapterSelect.value = this.selectedChapter;
        }
        
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
        
        if (chapterSelect) {
            chapterSelect.addEventListener('change', (e) => {
                this.selectedChapter = e.target.value;
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
    }

    populateChapterDropdown() {
        const chapterSelect = document.getElementById('kanji-chapter');
        if (!chapterSelect) return;
        
        const chapters = dataLoader.getKanjiChapters();
        chapterSelect.innerHTML = '<option value="all">Tất cả</option>';
        
        chapters.forEach(chapter => {
            const option = document.createElement('option');
            option.value = chapter;
            option.textContent = `${chapter}`;
            chapterSelect.appendChild(option);
        });
    }



    updateAvailableData() {
        if (this.useRemindsOnly) {
            const reminds = localStorageUtils.getRemindsByType('kanji');
            let filteredReminds = reminds;
            
            // Filter reminds by chapter if not 'all'
            if (this.selectedChapter !== 'all') {
                filteredReminds = reminds.filter(index => {
                    const chapter = dataLoader.getKanjiChapter(index);
                    return chapter === parseInt(this.selectedChapter);
                });
            }
            
            if (filteredReminds.length >= 4) {
                this.availableData = filteredReminds.map(index => ({
                    data: dataLoader.getKanjiByIndex(index),
                    originalIndex: index
                })).filter(item => item.data);
            } else {
                // Not enough reminds, use chapter data
                const chapterData = dataLoader.getKanjiByChapter(this.selectedChapter);
                this.availableData = chapterData.map((data) => ({
                    data,
                    originalIndex: dataLoader.getKanjiData().indexOf(data)
                }));
                document.getElementById('kanji-reminds').checked = false;
                this.useRemindsOnly = false;
                this.showNotification('Cần ít nhất 4 kanji trong danh sách ôn tập cho chương này', 'warning');
            }
        } else {
            const chapterData = dataLoader.getKanjiByChapter(this.selectedChapter);
            this.availableData = chapterData.map((data) => ({
                data,
                originalIndex: dataLoader.getKanjiData().indexOf(data)
            }));
        }
    }

    loadLastOrNewQuestion() {
        if (!dataLoader.isLoaded || this.availableData.length === 0) {
            this.updateAvailableData();
            return;
        }

        const lastQuestion = localStorageUtils.getLastQuestion('kanji');
        
        if (lastQuestion.questionIndex !== null && lastQuestion.mode) {
            const savedIsRevert = lastQuestion.mode.is_revert === 1;
            const savedIsRemind = lastQuestion.mode.is_remind === 1;
            const savedChapter = lastQuestion.mode.chapter || 'all';
            
            if (savedIsRevert === this.isRevertMode && savedIsRemind === this.useRemindsOnly && savedChapter === this.selectedChapter) {
                const questionItem = this.availableData.find(item => item.originalIndex === lastQuestion.questionIndex);
                if (questionItem) {
                    this.currentQuestion = questionItem.data;
                    this.currentIndex = questionItem.originalIndex;
                    
                    if (!this.isRevertMode) {
                        this.generateNormalMode();
                    } else {
                        this.generateRevertMode();
                    }
                    return;
                }
            }
        }
        
        this.generateNewQuestion();
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

        // Save current question state
        localStorageUtils.saveLastQuestion('kanji', this.currentIndex, {
            is_revert: this.isRevertMode ? 1 : 0,
            is_remind: this.useRemindsOnly ? 1 : 0,
            chapter: this.selectedChapter
        });

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
            // Remove encounter count for wrong answer
            const mode = this.isRevertMode ? 'revert' : 'normal';
            localStorageUtils.removeEncounter('kanji', mode, this.currentIndex.toString(), this.useRemindsOnly);
            
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
        // Check for last question first, then update data based on saved state
        const lastQuestion = localStorageUtils.getLastQuestion('kanji');
        
        if (lastQuestion.questionIndex !== null && lastQuestion.mode) {
            const savedIsRevert = lastQuestion.mode.is_revert === 1;
            const savedIsRemind = lastQuestion.mode.is_remind === 1;
            const savedChapter = lastQuestion.mode.chapter || 'all';
            
            // If modes match, update data and try to restore last question
            if (savedIsRevert === this.isRevertMode && savedIsRemind === this.useRemindsOnly && savedChapter === this.selectedChapter) {
                this.updateAvailableData();
                const questionItem = this.availableData.find(item => item.originalIndex === lastQuestion.questionIndex);
                if (questionItem) {
                    this.currentQuestion = questionItem.data;
                    this.currentIndex = questionItem.originalIndex;
                    
                    if (!this.isRevertMode) {
                        this.generateNormalMode();
                    } else {
                        this.generateRevertMode();
                    }
                    return;
                }
            }
        }
        
        // Fallback to normal flow
        this.updateAvailableData();
        this.generateNewQuestion();
    }
}

// Create global instance
const kanjiQuiz = new KanjiQuiz();