// Vocabulary Quiz Module

class VocabQuiz {
    constructor() {
        this.currentQuestion = null;
        this.currentIndex = -1;
        this.availableData = [];
        this.isRevertMode = false;
        this.useRemindsOnly = false;
        this.useReducplicativeOnly = false;
        this.useKatakanaOnly = false;
        this.selectedChapter = 'all';
    }

    initialize() {
        const revertCheckbox = document.getElementById('vocab-revert');
        const remindsCheckbox = document.getElementById('vocab-reminds');
        const reduplicativeCheckbox = document.getElementById('vocab-reduplicative');
        const katakanaCheckbox = document.getElementById('vocab-katakana');
        const chapterSelect = document.getElementById('vocab-chapter');
        
        // Populate chapter dropdown
        this.populateChapterDropdown();
        
        // Restore checkbox states from localStorage
        const lastQuestion = localStorageUtils.getLastQuestion('vocab');
        if (lastQuestion.mode) {
            this.isRevertMode = lastQuestion.mode.is_revert === 1;
            this.useRemindsOnly = lastQuestion.mode.is_remind === 1;
            this.useReducplicativeOnly = lastQuestion.mode.is_reduplicative === 1;
            this.useKatakanaOnly = lastQuestion.mode.is_katakana === 1;
            this.selectedChapter = lastQuestion.mode.chapter || 'all';
            
            if (revertCheckbox) revertCheckbox.checked = this.isRevertMode;
            if (remindsCheckbox) remindsCheckbox.checked = this.useRemindsOnly;
            if (reduplicativeCheckbox) reduplicativeCheckbox.checked = this.useReducplicativeOnly;
            if (katakanaCheckbox) katakanaCheckbox.checked = this.useKatakanaOnly;
            if (chapterSelect) {
                chapterSelect.value = this.selectedChapter;
                // Disable chapter select if special modes are active
                if (this.useReducplicativeOnly || this.useKatakanaOnly) {
                    chapterSelect.disabled = true;
                }
            }
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
                if (e.target.checked) {
                    // Disable other filters when reminds is enabled
                    this.useReducplicativeOnly = false;
                    this.useKatakanaOnly = false;
                    if (reduplicativeCheckbox) reduplicativeCheckbox.checked = false;
                    if (katakanaCheckbox) katakanaCheckbox.checked = false;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (reduplicativeCheckbox) {
            reduplicativeCheckbox.addEventListener('change', (e) => {
                this.useReducplicativeOnly = e.target.checked;
                if (e.target.checked) {
                    // Disable other filters when reduplicative is enabled
                    this.useRemindsOnly = false;
                    this.useKatakanaOnly = false;
                    if (remindsCheckbox) remindsCheckbox.checked = false;
                    if (katakanaCheckbox) katakanaCheckbox.checked = false;
                    
                    // Reset to all chapters and disable chapter select
                    this.selectedChapter = 'all';
                    if (chapterSelect) {
                        chapterSelect.value = 'all';
                        chapterSelect.disabled = true;
                    }
                } else {
                    // Re-enable chapter select when mode is disabled
                    if (chapterSelect) chapterSelect.disabled = false;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (katakanaCheckbox) {
            katakanaCheckbox.addEventListener('change', (e) => {
                this.useKatakanaOnly = e.target.checked;
                if (e.target.checked) {
                    // Disable other filters when katakana is enabled
                    this.useRemindsOnly = false;
                    this.useReducplicativeOnly = false;
                    if (remindsCheckbox) remindsCheckbox.checked = false;
                    if (reduplicativeCheckbox) reduplicativeCheckbox.checked = false;
                    
                    // Reset to all chapters and disable chapter select
                    this.selectedChapter = 'all';
                    if (chapterSelect) {
                        chapterSelect.value = 'all';
                        chapterSelect.disabled = true;
                    }
                } else {
                    // Re-enable chapter select when mode is disabled
                    if (chapterSelect) chapterSelect.disabled = false;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (chapterSelect) {
            chapterSelect.addEventListener('change', (e) => {
                // Prevent chapter changes when in special modes
                if (this.useReducplicativeOnly || this.useKatakanaOnly) {
                    e.target.value = 'all';
                    return;
                }
                
                this.selectedChapter = e.target.value;
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
    }

    populateChapterDropdown() {
        const chapterSelect = document.getElementById('vocab-chapter');
        if (!chapterSelect) return;
        
        const chapters = dataLoader.getVocabChapters();
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
            const reminds = localStorageUtils.getRemindsByType('vocab');
            let filteredReminds = reminds;
            
            // Filter reminds by chapter if not 'all'
            if (this.selectedChapter !== 'all') {
                filteredReminds = reminds.filter(index => {
                    const chapter = dataLoader.getVocabChapter(index);
                    return chapter === parseInt(this.selectedChapter);
                });
            }
            
            if (filteredReminds.length >= 4) {
                this.availableData = filteredReminds.map(index => ({
                    data: dataLoader.getVocabByIndex(index),
                    originalIndex: index
                })).filter(item => item.data);
            } else {
                // Not enough reminds, use chapter data
                const chapterData = dataLoader.getVocabByChapter(this.selectedChapter);
                this.availableData = chapterData.map((data) => ({
                    data,
                    originalIndex: dataLoader.getVocabData().indexOf(data)
                }));
                document.getElementById('vocab-reminds').checked = false;
                this.useRemindsOnly = false;
                this.showNotification('Cần ít nhất 4 từ vựng trong danh sách ôn tập cho chương này', 'warning');
            }
        } else if (this.useReducplicativeOnly) {
            // Always use all chapters for reduplicative mode
            this.availableData = dataLoader.getReducplicativeWords('all');
        } else if (this.useKatakanaOnly) {
            // Always use all chapters for katakana mode
            this.availableData = dataLoader.getKatakanaWords('all');
        } else {
            const chapterData = dataLoader.getVocabByChapter(this.selectedChapter);
            this.availableData = chapterData.map((data) => ({
                data,
                originalIndex: dataLoader.getVocabData().indexOf(data)
            }));
        }
    }

    loadLastOrNewQuestion() {
        if (!dataLoader.isLoaded || this.availableData.length === 0) {
            this.updateAvailableData();
            return;
        }

        const lastQuestion = localStorageUtils.getLastQuestion('vocab');
        
        if (lastQuestion.questionIndex !== null && lastQuestion.mode) {
            // Restore last question if modes match
            const savedIsRevert = lastQuestion.mode.is_revert === 1;
            const savedIsRemind = lastQuestion.mode.is_remind === 1;
            const savedIsReducplicative = lastQuestion.mode.is_reduplicative === 1;
            const savedIsKatakana = lastQuestion.mode.is_katakana === 1;
            const savedChapter = lastQuestion.mode.chapter || 'all';
            
            if (savedIsRevert === this.isRevertMode && 
                savedIsRemind === this.useRemindsOnly && 
                savedIsReducplicative === this.useReducplicativeOnly &&
                savedIsKatakana === this.useKatakanaOnly &&
                savedChapter === this.selectedChapter) {
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
        
        // Generate new question if no valid last question
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
        let specialMode = null;
        if (this.useReducplicativeOnly) specialMode = 'reduplicative';
        else if (this.useKatakanaOnly) specialMode = 'katakana';
        
        const smartIndex = localStorageUtils.getSmartRandomIndex(availableIndices, 'vocab', mode, this.useRemindsOnly, specialMode);
        
        const questionItem = this.availableData.find(item => item.originalIndex === smartIndex);
        this.currentQuestion = questionItem.data;
        this.currentIndex = questionItem.originalIndex;

        // Save current question state
        localStorageUtils.saveLastQuestion('vocab', this.currentIndex, {
            is_revert: this.isRevertMode ? 1 : 0,
            is_remind: this.useRemindsOnly ? 1 : 0,
            is_reduplicative: this.useReducplicativeOnly ? 1 : 0,
            is_katakana: this.useKatakanaOnly ? 1 : 0,
            chapter: this.selectedChapter
        });

        if (!this.isRevertMode) {
            this.generateNormalMode();
        } else {
            this.generateRevertMode();
        }
    }

    generateNormalMode() {
        const word = this.currentQuestion[0];
        const questionType = this.getWordType(word);
        
        // Filter available data based on question type
        let filteredData = this.availableData.filter(item => {
            const itemWord = item.data[0];
            if (questionType === 'special') {
                return itemWord.startsWith('〜');
            } else if (questionType === 'hiragana') {
                return dataLoader.isHiragana(itemWord);
            } else if (questionType === 'katakana') {
                return dataLoader.isKatakana(itemWord);
            } else {
                return !dataLoader.isHiragana(itemWord) && !dataLoader.isKatakana(itemWord) && !itemWord.startsWith('〜');
            }
        });

        if (filteredData.length < 4) {
            filteredData = this.availableData;
        }

        // Generate wrong answers
        const wrongIndices = [];
        while (wrongIndices.length < 3) {
            const randomIndex = Math.floor(Math.random() * filteredData.length);
            const item = filteredData[randomIndex];
            if (item.originalIndex !== this.currentIndex && !wrongIndices.some(wi => wi.originalIndex === item.originalIndex)) {
                wrongIndices.push(item);
            }
        }

        // Create answer options
        const correctAnswer = {
            text: dataLoader.formatVocabAnswer(this.currentQuestion),
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: dataLoader.formatVocabAnswer(item.data),
            isCorrect: false,
            data: item.data
        }));

        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);

        this.displayQuestion(word, allAnswers, false);
    }

    generateRevertMode() {
        const meaning = this.currentQuestion[2]; // Vietnamese meaning
        
        if (!meaning || meaning === '') {
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
            text: this.currentQuestion[0], // Kanji/hiragana/katakana for selection
            fullText: [this.currentQuestion[0], this.currentQuestion[1], this.currentQuestion[2]].filter(part => part && part.trim() !== '').join(' - '), // Full format for result
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: item.data[0], // Kanji/hiragana/katakana for selection
            fullText: [item.data[0], item.data[1], item.data[2]].filter(part => part && part.trim() !== '').join(' - '), // Full format for result
            isCorrect: false,
            data: item.data
        }));

        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);

        this.displayQuestion(meaning, allAnswers, true);
    }

    getWordType(word) {
        if (word.startsWith('〜')) return 'special';
        if (dataLoader.isHiragana(word)) return 'hiragana';
        if (dataLoader.isKatakana(word)) return 'katakana';
        return 'kanji';
    }

    displayQuestion(questionText, answers, isRevertMode) {
        const quizContainer = document.getElementById('vocab-quiz');
        
        const html = `
            <div class="question-container">
                <div class="question-content">
                    <div class="question-text">
                        ${questionText}
                        <i class="bi bi-bookmark bookmark-icon ${localStorageUtils.isInReminds('vocab', this.currentIndex) ? 'bookmarked' : ''}" 
                           onclick="vocabQuiz.toggleRemind()" title="Add to reminds"></i>
                    </div>
                </div>
            </div>
            
            <div class="answer-options">
                ${answers.map((answer, index) => `
                    <div class="answer-chip" onclick="vocabQuiz.selectAnswer(${index}, ${answer.isCorrect})">
                        ${answer.text}
                    </div>
                `).join('')}
            </div>
            
            <button class="new-quiz-btn" onclick="vocabQuiz.generateNewQuestion()">
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
        const answerChips = document.querySelectorAll('#vocab-quiz .answer-chip');
        
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
            localStorageUtils.addToReminds('vocab', this.currentIndex);
            // Remove encounter count for wrong answer
            const mode = this.isRevertMode ? 'revert' : 'normal';
            let specialMode = null;
            if (this.useReducplicativeOnly) specialMode = 'reduplicative';
            else if (this.useKatakanaOnly) specialMode = 'katakana';
            
            localStorageUtils.removeEncounter('vocab', mode, this.currentIndex.toString(), this.useRemindsOnly, specialMode);
            
            // Show correct answer
            answerChips.forEach((chip, index) => {
                if (this.currentAnswers[index].isCorrect) {
                    chip.classList.add('correct');
                }
            });
        }
    }

    toggleRemind() {
        const isCurrentlyInReminds = localStorageUtils.isInReminds('vocab', this.currentIndex);
        const bookmarkIcon = document.querySelector('#vocab-quiz .bookmark-icon');
        
        if (isCurrentlyInReminds) {
            localStorageUtils.removeFromReminds('vocab', this.currentIndex);
            bookmarkIcon.classList.remove('bookmarked');
            this.showNotification('Đã xoá khỏi danh sách ôn tập', 'info');
        } else {
            localStorageUtils.addToReminds('vocab', this.currentIndex);
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
        const lastQuestion = localStorageUtils.getLastQuestion('vocab');
        
        if (lastQuestion.questionIndex !== null && lastQuestion.mode) {
            const savedIsRevert = lastQuestion.mode.is_revert === 1;
            const savedIsRemind = lastQuestion.mode.is_remind === 1;
            const savedIsReducplicative = lastQuestion.mode.is_reduplicative === 1;
            const savedIsKatakana = lastQuestion.mode.is_katakana === 1;
            const savedChapter = lastQuestion.mode.chapter || 'all';
            
            // If modes match, update data and try to restore last question
            if (savedIsRevert === this.isRevertMode && 
                savedIsRemind === this.useRemindsOnly && 
                savedIsReducplicative === this.useReducplicativeOnly &&
                savedIsKatakana === this.useKatakanaOnly &&
                savedChapter === this.selectedChapter) {
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
const vocabQuiz = new VocabQuiz();