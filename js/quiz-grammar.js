// Grammar Quiz Module

class GrammarQuiz {
    constructor() {
        this.currentQuestion = null;
        this.currentIndex = -1;
        this.availableData = [];
        this.useRemindsOnly = false;
        this.infoCardVisible = false;
    }

    initialize() {
        const remindsCheckbox = document.getElementById('grammar-reminds');
        
        // Restore checkbox state from localStorage
        const lastQuestion = localStorageUtils.getLastQuestion('grammar');
        if (lastQuestion.mode) {
            this.useRemindsOnly = lastQuestion.mode.is_remind === 1;
            if (remindsCheckbox) remindsCheckbox.checked = this.useRemindsOnly;
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
            const reminds = localStorageUtils.getRemindsByType('grammar');
            if (reminds.length >= 4) {
                this.availableData = reminds.map(index => ({
                    data: dataLoader.getGrammarByIndex(index),
                    originalIndex: index
                })).filter(item => item.data && item.data[1] && item.data[1].trim() !== '');
            } else {
                // Not enough reminds, use all data
                this.availableData = dataLoader.getGrammarData().map((data, index) => ({
                    data,
                    originalIndex: index
                })).filter(item => item.data && item.data[1] && item.data[1].trim() !== '');
                document.getElementById('grammar-reminds').checked = false;
                this.useRemindsOnly = false;
                this.showNotification('Need at least 4 items in reminds list');
            }
        } else {
            this.availableData = dataLoader.getGrammarData().map((data, index) => ({
                data,
                originalIndex: index
            })).filter(item => item.data && item.data[1] && item.data[1].trim() !== '');
        }
    }

    loadLastOrNewQuestion() {
        if (!dataLoader.isLoaded || this.availableData.length === 0) {
            this.updateAvailableData();
            return;
        }

        const lastQuestion = localStorageUtils.getLastQuestion('grammar');
        
        if (lastQuestion.questionIndex !== null && lastQuestion.mode) {
            const savedIsRemind = lastQuestion.mode.is_remind === 1;
            
            if (savedIsRemind === this.useRemindsOnly) {
                const questionItem = this.availableData.find(item => item.originalIndex === lastQuestion.questionIndex);
                if (questionItem && questionItem.data[1] && questionItem.data[1].trim() !== '') {
                    this.currentQuestion = questionItem.data;
                    this.currentIndex = questionItem.originalIndex;
                    this.infoCardVisible = false;
                    
                    const grammarStructure = this.currentQuestion[0];
                    const validAnswerOptions = this.availableData.filter(item => 
                        item.originalIndex !== this.currentIndex && 
                        item.data[1] && 
                        item.data[1].trim() !== ''
                    );

                    if (validAnswerOptions.length >= 3) {
                        const wrongIndices = [];
                        while (wrongIndices.length < 3) {
                            const randomIndex = Math.floor(Math.random() * validAnswerOptions.length);
                            const item = validAnswerOptions[randomIndex];
                            if (!wrongIndices.some(wi => wi.originalIndex === item.originalIndex)) {
                                wrongIndices.push(item);
                            }
                        }

                        const correctAnswer = {
                            text: this.currentQuestion[1],
                            isCorrect: true,
                            data: this.currentQuestion
                        };

                        const wrongAnswers = wrongIndices.map(item => ({
                            text: item.data[1],
                            isCorrect: false,
                            data: item.data
                        }));

                        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);
                        this.displayQuestion(grammarStructure, allAnswers);
                        return;
                    }
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

        // Hide info card if visible
        this.infoCardVisible = false;

        // Get smart random question using encounter tracking
        const availableIndices = this.availableData.map(item => item.originalIndex);
        const smartIndex = localStorageUtils.getSmartRandomIndex(availableIndices, 'grammar', null, this.useRemindsOnly);
        
        const questionItem = this.availableData.find(item => item.originalIndex === smartIndex);
        const validMeaning = questionItem.data[1] && questionItem.data[1].trim() !== '';
        
        if (!validMeaning) {
            console.error('Could not find grammar item with valid meaning');
            return;
        }

        this.currentQuestion = questionItem.data;
        this.currentIndex = questionItem.originalIndex;

        // Save current question state
        localStorageUtils.saveLastQuestion('grammar', this.currentIndex, {
            is_remind: this.useRemindsOnly ? 1 : 0
        });

        const grammarStructure = this.currentQuestion[0];
        
        // Generate wrong answers - filter out items without Vietnamese meanings
        const validAnswerOptions = this.availableData.filter(item => 
            item.originalIndex !== this.currentIndex && 
            item.data[1] && 
            item.data[1].trim() !== ''
        );

        if (validAnswerOptions.length < 3) {
            console.warn('Not enough valid grammar options for quiz');
            // Regenerate with different question
            this.generateNewQuestion();
            return;
        }

        const wrongIndices = [];
        while (wrongIndices.length < 3 && wrongIndices.length < validAnswerOptions.length) {
            const randomIndex = Math.floor(Math.random() * validAnswerOptions.length);
            const item = validAnswerOptions[randomIndex];
            if (!wrongIndices.some(wi => wi.originalIndex === item.originalIndex)) {
                wrongIndices.push(item);
            }
        }

        // Create answer options (Vietnamese meanings)
        const correctAnswer = {
            text: this.currentQuestion[1], // Vietnamese meaning
            isCorrect: true,
            data: this.currentQuestion
        };

        const wrongAnswers = wrongIndices.map(item => ({
            text: item.data[1], // Vietnamese meaning
            isCorrect: false,
            data: item.data
        }));

        const allAnswers = dataLoader.shuffleArray([correctAnswer, ...wrongAnswers]);

        this.displayQuestion(grammarStructure, allAnswers);
    }

    displayQuestion(questionText, answers) {
        const quizContainer = document.getElementById('grammar-quiz');
        
        const processedQuestion = dataLoader.processGrammarStructure(questionText);
        
        const html = `
            <button class="new-quiz-btn" onclick="grammarQuiz.generateNewQuestion()">
                <i class="bi bi-arrow-clockwise me-2"></i>Câu hỏi khác
            </button>
            
            <div class="question-container">
                <div class="question-content">
                    <div class="question-text">
                        ${processedQuestion}
                        <i class="bi bi-bookmark bookmark-icon ${localStorageUtils.isInReminds('grammar', this.currentIndex) ? 'bookmarked' : ''}" 
                           onclick="grammarQuiz.toggleRemind()" title="Add to reminds"></i>
                    </div>
                </div>
            </div>
            
            <div class="answer-options">
                ${answers.map((answer, index) => `
                    <div class="answer-chip" onclick="grammarQuiz.selectAnswer(${index}, ${answer.isCorrect})">
                        ${answer.text || 'No meaning available'}
                    </div>
                `).join('')}
            </div>
            
            <div id="grammar-info-card"></div>
        `;

        quizContainer.innerHTML = html;
        this.currentAnswers = answers;
        
        // Auto-resize font to fit container
        const questionElement = quizContainer.querySelector('.question-text');
        const preElement = quizContainer.querySelector('.grammar-pre');
        if (questionElement && preElement) {
            this.autoResizeText(preElement);
        }
    }

    selectAnswer(answerIndex, isCorrect) {
        const answerChips = document.querySelectorAll('#grammar-quiz .answer-chip');
        
        // Disable all chips
        answerChips.forEach(chip => chip.classList.add('disabled'));
        
        // Mark selected answer
        const selectedChip = answerChips[answerIndex];
        if (isCorrect) {
            selectedChip.classList.add('correct');
        } else {
            selectedChip.classList.add('incorrect');
            // Add to reminds if wrong
            localStorageUtils.addToReminds('grammar', this.currentIndex);
            // Remove encounter count for wrong answer
            localStorageUtils.removeEncounter('grammar', null, this.currentIndex.toString(), this.useRemindsOnly);
            
            // Show correct answer
            answerChips.forEach((chip, index) => {
                if (this.currentAnswers[index].isCorrect) {
                    chip.classList.add('correct');
                }
            });
        }

        // Always show info card after answer selection
        this.showInfoCard();
    }

    showInfoCard() {
        const infoCardContainer = document.getElementById('grammar-info-card');
        if (!infoCardContainer) return;

        const meaning = this.currentQuestion[1]; // Vietnamese meaning
        const notice = this.currentQuestion[2]; // Notice points
        const examples = this.currentQuestion[3]; // Examples

        const noticePoints = dataLoader.parseGrammarNotice(notice);
        const exampleList = dataLoader.parseGrammarExamples(examples);

        const html = `
            <div class="grammar-info-card">
                <div class="grammar-meaning">
                    <i class="bi bi-translate me-2"></i>${meaning || 'No meaning available'}
                </div>
                
                ${noticePoints.length > 0 ? `
                    <div class="grammar-notice">
                        <h6><i class="bi bi-info-circle me-2"></i>Notice:</h6>
                        <ul>
                            ${noticePoints.map(point => `<li>${point}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                ${exampleList.length > 0 ? `
                    <div class="grammar-examples">
                        <h6><i class="bi bi-journal-text me-2"></i>Ví dụ:</h6>
                        <ul>
                            ${exampleList.map(example => `<li>${example}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;

        infoCardContainer.innerHTML = html;
        this.infoCardVisible = true;
    }

    toggleRemind() {
        const isCurrentlyInReminds = localStorageUtils.isInReminds('grammar', this.currentIndex);
        const bookmarkIcon = document.querySelector('#grammar-quiz .bookmark-icon');
        
        if (isCurrentlyInReminds) {
            localStorageUtils.removeFromReminds('grammar', this.currentIndex);
            bookmarkIcon.classList.remove('bookmarked');
            this.showNotification('Đã xoá khỏi danh sách ôn tập', 'info');
        } else {
            localStorageUtils.addToReminds('grammar', this.currentIndex);
            bookmarkIcon.classList.add('bookmarked');
            this.showNotification('Đã thêm vào danh sách ôn tập!', 'success');
        }
    }

    showNotification(message, type = 'success') {
        const toast = document.getElementById('notification-toast');
        const toastBody = toast.querySelector('.toast-body');
        
        // Update message and style
        toastBody.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle' : 'info-circle'} me-2"></i>${message}`;
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
    }

    autoResizeText(element) {
        const text = element.textContent.trim();
        const hasLineBreaks = text.includes('\n') || text.includes('\r');
        
        // Start with base font size
        let baseFontSize;
        let minFontSize;
        if (window.innerWidth <= 576) {
            baseFontSize = 16;
            minFontSize = 8;
        } else if (window.innerWidth <= 768) {
            baseFontSize = 20;
            minFontSize = 10;
        } else {
            baseFontSize = 24;
            minFontSize = 12;
        }
        
        let fontSize = baseFontSize;
        element.style.fontSize = fontSize + 'px';
        
        if (hasLineBreaks) {
            // Multi-line content: reduce font size to fit both width and height
            element.classList.remove('single-line');
            
            let attempts = 0;
            while ((element.scrollWidth > element.clientWidth || element.scrollHeight > element.clientHeight) && fontSize > minFontSize && attempts < 50) {
                fontSize -= 1;
                element.style.fontSize = fontSize + 'px';
                attempts++;
            }
        } else {
            // Single line content: keep on one line
            element.classList.add('single-line');
            
            let attempts = 0;
            while (element.scrollWidth > element.clientWidth && fontSize > minFontSize && attempts < 50) {
                fontSize -= 1;
                element.style.fontSize = fontSize + 'px';
                attempts++;
            }
        }
    }

    start() {
        this.updateAvailableData();
        this.loadLastOrNewQuestion();
    }
}

// Create global instance
const grammarQuiz = new GrammarQuiz();
