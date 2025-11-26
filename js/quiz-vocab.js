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
        this.usePersonalOtherWords = false;
        this.usePersonalPastTestWords = false;
        this.usePersonalReducplicativeWords = false;
        this.selectedChapter = 'all';
    }

    initialize() {
        const revertCheckbox = document.getElementById('vocab-revert');
        const remindsCheckbox = document.getElementById('vocab-reminds');
        const reduplicativeCheckbox = document.getElementById('vocab-reduplicative');
        const katakanaCheckbox = document.getElementById('vocab-katakana');
        const personalOtherCheckbox = document.getElementById('vocab-personal-other');
        const personalPastCheckbox = document.getElementById('vocab-personal-past');
        const chapterSelect = document.getElementById('vocab-chapter');
        
        // Show personal mode options if in personal mode
        if (dataLoader.isInPersonalMode()) {
            const personalOtherContainer = document.getElementById('vocab-personal-other-container');
            const personalPastContainer = document.getElementById('vocab-personal-past-container');
            if (personalOtherContainer) personalOtherContainer.style.display = 'block';
            if (personalPastContainer) personalPastContainer.style.display = 'block';
        }
        
        // Populate chapter dropdown
        this.populateChapterDropdown();
        
        // Restore checkbox states from localStorage
        const lastQuestion = localStorageUtils.getLastQuestion('vocab');
        if (lastQuestion.mode) {
            this.isRevertMode = lastQuestion.mode.is_revert === 1;
            this.useRemindsOnly = lastQuestion.mode.is_remind === 1;
            this.useReducplicativeOnly = lastQuestion.mode.is_reduplicative === 1;
            this.useKatakanaOnly = lastQuestion.mode.is_katakana === 1;
            this.usePersonalOtherWords = lastQuestion.mode.is_personal_other === 1;
            this.usePersonalPastTestWords = lastQuestion.mode.is_personal_past === 1;
            this.usePersonalReducplicativeWords = lastQuestion.mode.is_personal_reduplicative === 1;
            this.selectedChapter = lastQuestion.mode.chapter || 'all';
            
            if (revertCheckbox) revertCheckbox.checked = this.isRevertMode;
            if (remindsCheckbox) remindsCheckbox.checked = this.useRemindsOnly;
            if (reduplicativeCheckbox) reduplicativeCheckbox.checked = this.useReducplicativeOnly;
            if (katakanaCheckbox) katakanaCheckbox.checked = this.useKatakanaOnly;
            if (personalOtherCheckbox) personalOtherCheckbox.checked = this.usePersonalOtherWords;
            if (personalPastCheckbox) personalPastCheckbox.checked = this.usePersonalPastTestWords;
            const personalReducplicativeCheckbox = document.getElementById('vocab-personal-reduplicative');
            if (personalReducplicativeCheckbox) personalReducplicativeCheckbox.checked = this.usePersonalReducplicativeWords;
            if (chapterSelect) {
                chapterSelect.value = this.selectedChapter;
                // Disable chapter select if special modes are active
                if (this.useReducplicativeOnly || this.useKatakanaOnly || this.usePersonalOtherWords || this.usePersonalPastTestWords || this.usePersonalReducplicativeWords) {
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
                // Don't disable personal modes when reminds is enabled - they should work together
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (reduplicativeCheckbox) {
            reduplicativeCheckbox.addEventListener('change', (e) => {
                this.useReducplicativeOnly = e.target.checked;
                if (e.target.checked) {
                    // Disable other filters when reduplicative is enabled (except reminds)
                    this.useKatakanaOnly = false;
                    this.usePersonalOtherWords = false;
                    this.usePersonalPastTestWords = false;
                    this.usePersonalReducplicativeWords = false;
                    if (katakanaCheckbox) katakanaCheckbox.checked = false;
                    if (personalOtherCheckbox) personalOtherCheckbox.checked = false;
                    if (personalPastCheckbox) personalPastCheckbox.checked = false;
                    const personalReducplicativeCheckbox = document.getElementById('vocab-personal-reduplicative');
                    if (personalReducplicativeCheckbox) personalReducplicativeCheckbox.checked = false;
                    
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
                    this.usePersonalOtherWords = false;
                    this.usePersonalPastTestWords = false;
                    if (remindsCheckbox) remindsCheckbox.checked = false;
                    if (reduplicativeCheckbox) reduplicativeCheckbox.checked = false;
                    if (personalOtherCheckbox) personalOtherCheckbox.checked = false;
                    if (personalPastCheckbox) personalPastCheckbox.checked = false;
                    
                    // Reset to all chapters and disable chapter select
                    this.selectedChapter = 'all';
                    if (chapterSelect) {
                        chapterSelect.value = 'all';
                        chapterSelect.disabled = true;
                    }
                } else {
                    // Re-enable chapter select when mode is disabled
                    if (chapterSelect) chapterSelect.disabled = this.useReducplicativeOnly || this.usePersonalOtherWords || this.usePersonalPastTestWords;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (personalOtherCheckbox && dataLoader.isInPersonalMode()) {
            personalOtherCheckbox.addEventListener('change', (e) => {
                this.usePersonalOtherWords = e.target.checked;
                if (e.target.checked) {
                    // Disable other filters when personal other words is enabled (except reminds)
                    this.useReducplicativeOnly = false;
                    this.useKatakanaOnly = false;
                    this.usePersonalPastTestWords = false;
                    this.usePersonalReducplicativeWords = false;
                    if (reduplicativeCheckbox) reduplicativeCheckbox.checked = false;
                    if (katakanaCheckbox) katakanaCheckbox.checked = false;
                    if (personalPastCheckbox) personalPastCheckbox.checked = false;
                    const personalReducplicativeCheckbox = document.getElementById('vocab-personal-reduplicative');
                    if (personalReducplicativeCheckbox) personalReducplicativeCheckbox.checked = false;
                    
                    // Reset to all chapters and disable chapter select
                    this.selectedChapter = 'all';
                    if (chapterSelect) {
                        chapterSelect.value = 'all';
                        chapterSelect.disabled = true;
                    }
                } else {
                    // Re-enable chapter select when mode is disabled
                    if (chapterSelect) chapterSelect.disabled = this.useReducplicativeOnly || this.useKatakanaOnly || this.usePersonalPastTestWords || this.usePersonalReducplicativeWords;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (personalPastCheckbox && dataLoader.isInPersonalMode()) {
            personalPastCheckbox.addEventListener('change', (e) => {
                this.usePersonalPastTestWords = e.target.checked;
                if (e.target.checked) {
                    // Disable other filters when personal past test words is enabled (except reminds)
                    this.useReducplicativeOnly = false;
                    this.useKatakanaOnly = false;
                    this.usePersonalOtherWords = false;
                    this.usePersonalReducplicativeWords = false;
                    if (reduplicativeCheckbox) reduplicativeCheckbox.checked = false;
                    if (katakanaCheckbox) katakanaCheckbox.checked = false;
                    if (personalOtherCheckbox) personalOtherCheckbox.checked = false;
                    const personalReducplicativeCheckbox = document.getElementById('vocab-personal-reduplicative');
                    if (personalReducplicativeCheckbox) personalReducplicativeCheckbox.checked = false;
                    
                    // Reset to all chapters and disable chapter select
                    this.selectedChapter = 'all';
                    if (chapterSelect) {
                        chapterSelect.value = 'all';
                        chapterSelect.disabled = true;
                    }
                } else {
                    // Re-enable chapter select when mode is disabled
                    if (chapterSelect) chapterSelect.disabled = this.useReducplicativeOnly || this.useKatakanaOnly || this.usePersonalOtherWords || this.usePersonalReducplicativeWords;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        const personalReducplicativeCheckbox = document.getElementById('vocab-personal-reduplicative');
        if (personalReducplicativeCheckbox && dataLoader.isInPersonalMode()) {
            personalReducplicativeCheckbox.addEventListener('change', (e) => {
                this.usePersonalReducplicativeWords = e.target.checked;
                if (e.target.checked) {
                    // Disable other filters when personal reduplicative words is enabled (except reminds)
                    this.useReducplicativeOnly = false;
                    this.useKatakanaOnly = false;
                    this.usePersonalOtherWords = false;
                    this.usePersonalPastTestWords = false;
                    if (reduplicativeCheckbox) reduplicativeCheckbox.checked = false;
                    if (katakanaCheckbox) katakanaCheckbox.checked = false;
                    if (personalOtherCheckbox) personalOtherCheckbox.checked = false;
                    if (personalPastCheckbox) personalPastCheckbox.checked = false;
                    
                    // Reset to all chapters and disable chapter select
                    this.selectedChapter = 'all';
                    if (chapterSelect) {
                        chapterSelect.value = 'all';
                        chapterSelect.disabled = true;
                    }
                } else {
                    // Re-enable chapter select when mode is disabled
                    if (chapterSelect) chapterSelect.disabled = this.useReducplicativeOnly || this.useKatakanaOnly || this.usePersonalOtherWords || this.usePersonalPastTestWords;
                }
                this.updateAvailableData();
                this.generateNewQuestion();
            });
        }
        
        if (chapterSelect) {
            chapterSelect.addEventListener('change', (e) => {
                // Prevent chapter changes when in special modes
                if (this.useReducplicativeOnly || this.useKatakanaOnly || this.usePersonalOtherWords || this.usePersonalPastTestWords || this.usePersonalReducplicativeWords) {
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
        // Handle personal modes with remind filtering
        if (this.usePersonalOtherWords && dataLoader.isInPersonalMode()) {
            const personalOtherData = dataLoader.getPersonalOtherWords();
            let availableIndices = personalOtherData.map((data, index) => `personal_other_${index}`);
            
            if (this.useRemindsOnly) {
                const reminds = localStorageUtils.getRemindsByType('personal_other');
                const remindIndices = reminds.map(index => localStorageUtils.convertFromShortKey(index));
                availableIndices = availableIndices.filter(index => remindIndices.includes(index));
                
                if (availableIndices.length < 4) {
                    document.getElementById('vocab-reminds').checked = false;
                    this.useRemindsOnly = false;
                    this.showNotification('Cần ít nhất 4 từ mở rộng trong danh sách ôn tập', 'warning');
                    availableIndices = personalOtherData.map((data, index) => `personal_other_${index}`);
                }
            }
            
            this.availableData = availableIndices.map(index => {
                const numIndex = parseInt(index.replace('personal_other_', ''));
                return {
                    data: personalOtherData[numIndex],
                    originalIndex: index
                };
            }).filter(item => item.data);
        } else if (this.usePersonalPastTestWords && dataLoader.isInPersonalMode()) {
            const personalPastData = dataLoader.getPersonalPastTestWords();
            let availableIndices = personalPastData.map((data, index) => `personal_past_${index}`);
            
            if (this.useRemindsOnly) {
                const reminds = localStorageUtils.getRemindsByType('personal_past');
                const remindIndices = reminds.map(index => localStorageUtils.convertFromShortKey(index));
                availableIndices = availableIndices.filter(index => remindIndices.includes(index));
                
                if (availableIndices.length < 4) {
                    document.getElementById('vocab-reminds').checked = false;
                    this.useRemindsOnly = false;
                    this.showNotification('Cần ít nhất 4 từ các năm trước trong danh sách ôn tập', 'warning');
                    availableIndices = personalPastData.map((data, index) => `personal_past_${index}`);
                }
            }
            
            this.availableData = availableIndices.map(index => {
                const numIndex = parseInt(index.replace('personal_past_', ''));
                return {
                    data: personalPastData[numIndex],
                    originalIndex: index
                };
            }).filter(item => item.data);
        } else if (this.usePersonalReducplicativeWords && dataLoader.isInPersonalMode()) {
            const personalReducplicativeData = dataLoader.getPersonalReducplicativeWords();
            let availableIndices = personalReducplicativeData.map((data, index) => `personal_reduplicative_${index}`);
            
            if (this.useRemindsOnly) {
                const reminds = localStorageUtils.getRemindsByType('personal_reduplicative');
                const remindIndices = reminds.map(index => localStorageUtils.convertFromShortKey(index));
                availableIndices = availableIndices.filter(index => remindIndices.includes(index));
                
                if (availableIndices.length < 4) {
                    document.getElementById('vocab-reminds').checked = false;
                    this.useRemindsOnly = false;
                    this.showNotification('Cần ít nhất 4 từ láy trong danh sách ôn tập', 'warning');
                    availableIndices = personalReducplicativeData.map((data, index) => `personal_reduplicative_${index}`);
                }
            }
            
            this.availableData = availableIndices.map(index => {
                const numIndex = parseInt(index.replace('personal_reduplicative_', ''));
                return {
                    data: personalReducplicativeData[numIndex],
                    originalIndex: index
                };
            }).filter(item => item.data);
        } else if (this.useRemindsOnly) {
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
            is_personal_other: this.usePersonalOtherWords ? 1 : 0,
            is_personal_past: this.usePersonalPastTestWords ? 1 : 0,
            is_personal_reduplicative: this.usePersonalReducplicativeWords ? 1 : 0,
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
            text: this.formatAnswerWithTestDate(this.currentQuestion),
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: this.formatAnswerWithTestDate(item.data),
            isCorrect: false,
            data: item.data
        }));

        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);

        this.displayQuestion(word, allAnswers, false);
    }

    generateRevertMode() {
        // For personal modes, get meaning from correct column
        let meaning;
        if (this.usePersonalReducplicativeWords) {
            meaning = this.currentQuestion[1]; // 2-column format: column 1 is meaning
        } else if (this.usePersonalOtherWords) {
            meaning = this.currentQuestion[2]; // 3-column format: column 2 is meaning
        } else {
            meaning = this.currentQuestion[2]; // Standard format: column 2 is meaning
        }
        
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
            text: this.formatWordWithTestDate(this.currentQuestion), // Kanji/hiragana/katakana with test date
            fullText: this.formatAnswerForRevertMode(this.currentQuestion), // Full format for result
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: this.formatWordWithTestDate(item.data), // Kanji/hiragana/katakana with test date
            fullText: this.formatAnswerForRevertMode(item.data), // Full format for result
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
                        <i class="bi bi-bookmark bookmark-icon ${this.isCurrentlyBookmarked() ? 'bookmarked' : ''}" 
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
            let remindType = 'vocab';
            if (this.usePersonalOtherWords) remindType = 'personal_other';
            else if (this.usePersonalPastTestWords) remindType = 'personal_past';
            else if (this.usePersonalReducplicativeWords) remindType = 'personal_reduplicative';
            localStorageUtils.addToReminds(remindType, this.currentIndex);
            // Remove encounter count for wrong answer
            const mode = this.isRevertMode ? 'revert' : 'normal';
            let specialMode = null;
            if (this.useReducplicativeOnly) specialMode = 'reduplicative';
            else if (this.useKatakanaOnly) specialMode = 'katakana';
            else if (this.usePersonalOtherWords) specialMode = 'personal_other';
            else if (this.usePersonalPastTestWords) specialMode = 'personal_past';
            else if (this.usePersonalReducplicativeWords) specialMode = 'personal_reduplicative';
            
            localStorageUtils.removeEncounter('vocab', mode, this.currentIndex.toString(), this.useRemindsOnly, specialMode);
            
            // Show correct answer
            answerChips.forEach((chip, index) => {
                if (this.currentAnswers[index].isCorrect) {
                    chip.classList.add('correct');
                }
            });
        }
        

    }

    isCurrentlyBookmarked() {
        let remindType = 'vocab';
        if (this.usePersonalOtherWords) remindType = 'personal_other';
        else if (this.usePersonalPastTestWords) remindType = 'personal_past';
        else if (this.usePersonalReducplicativeWords) remindType = 'personal_reduplicative';
        return localStorageUtils.isInReminds(remindType, this.currentIndex);
    }

    toggleRemind() {
        let remindType = 'vocab';
        
        // Use different remind types for personal modes
        if (this.usePersonalOtherWords) {
            remindType = 'personal_other';
        } else if (this.usePersonalPastTestWords) {
            remindType = 'personal_past';
        } else if (this.usePersonalReducplicativeWords) {
            remindType = 'personal_reduplicative';
        }
        
        const isCurrentlyInReminds = localStorageUtils.isInReminds(remindType, this.currentIndex);
        const bookmarkIcon = document.querySelector('#vocab-quiz .bookmark-icon');
        
        if (isCurrentlyInReminds) {
            localStorageUtils.removeFromReminds(remindType, this.currentIndex);
            bookmarkIcon.classList.remove('bookmarked');
            this.showNotification('Đã xoá khỏi danh sách ôn tập', 'info');
        } else {
            localStorageUtils.addToReminds(remindType, this.currentIndex);
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

    formatAnswerForRevertMode(questionData) {
        if (this.usePersonalPastTestWords) {
            // Special format for past test words: kanji/hiragana - pronunciation - meaning - example - time
            const parts = [questionData[0], questionData[1], questionData[2]];
            if (questionData[4] && questionData[4].trim() !== '') parts.push(questionData[4]); // example/same meaning words (can be null)
            if (questionData[3]) parts.push(questionData[3]); // test time
            return parts.filter(part => part && part.trim() !== '').join(' - ');
        } else if (this.usePersonalReducplicativeWords) {
            // 2-column format: hiragana - meaning
            return [questionData[0], questionData[1]].filter(part => part && part.trim() !== '').join(' - ');
        } else if (this.usePersonalOtherWords) {
            // 3-column format: hiragana - hiragana - meaning
            return [questionData[0], questionData[2]].filter(part => part && part.trim() !== '').join(' - ');
        } else {
            // Standard format for other modes
            return [questionData[0], questionData[1], questionData[2]].filter(part => part && part.trim() !== '').join(' - ');
        }
    }

    formatAnswerWithTestDate(questionData) {
        if (this.usePersonalPastTestWords && questionData[3]) {
            // For past test words, append test date to the formatted answer
            const baseAnswer = dataLoader.formatVocabAnswer(questionData);
            return `${baseAnswer} - ${questionData[3]}`;
        } else {
            // Standard format for other modes
            return dataLoader.formatVocabAnswer(questionData);
        }
    }

    formatWordWithTestDate(questionData) {
        if (this.usePersonalPastTestWords && questionData[3]) {
            // For revert mode past test words, append test date to the word
            return `${questionData[0]} - ${questionData[3]}`;
        } else {
            // Standard format for other modes
            return questionData[0];
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
            const savedIsPersonalOther = lastQuestion.mode.is_personal_other === 1;
            const savedIsPersonalPast = lastQuestion.mode.is_personal_past === 1;
            const savedChapter = lastQuestion.mode.chapter || 'all';
            
            // If modes match, update data and try to restore last question
            if (savedIsRevert === this.isRevertMode && 
                savedIsRemind === this.useRemindsOnly && 
                savedIsReducplicative === this.useReducplicativeOnly &&
                savedIsKatakana === this.useKatakanaOnly &&
                savedIsPersonalOther === this.usePersonalOtherWords &&
                savedIsPersonalPast === this.usePersonalPastTestWords &&
                (lastQuestion.mode.is_personal_reduplicative === 1) === this.usePersonalReducplicativeWords &&
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