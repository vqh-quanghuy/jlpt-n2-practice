// Data Loader for TSV files

class DataLoader {
    constructor() {
        this.vocabData = [];
        this.kanjiData = [];
        this.grammarData = [];
        this.isLoaded = false;
    }

    async loadAllData() {
        try {
            console.log('Starting to load data files...');
            
            const [vocabResponse, kanjiResponse, grammarResponse] = await Promise.all([
                fetch('data/n2-vocab.tsv'),
                fetch('data/n2-kanji.tsv'),
                fetch('data/n2-grammar.tsv')
            ]);

            console.log('Fetch responses:', {
                vocab: vocabResponse.ok,
                kanji: kanjiResponse.ok,
                grammar: grammarResponse.ok
            });

            if (!vocabResponse.ok || !kanjiResponse.ok || !grammarResponse.ok) {
                throw new Error('One or more data files could not be loaded');
            }

            const vocabText = await vocabResponse.text();
            const kanjiText = await kanjiResponse.text();
            const grammarText = await grammarResponse.text();

            console.log('Text lengths:', {
                vocab: vocabText.length,
                kanji: kanjiText.length,
                grammar: grammarText.length
            });

            this.vocabData = this.parseTSV(vocabText);
            this.kanjiData = this.parseTSV(kanjiText);
            this.grammarData = this.parseTSV(grammarText);

            this.isLoaded = true;
            console.log('Data loaded successfully:', {
                vocab: this.vocabData.length,
                kanji: this.kanjiData.length,
                grammar: this.grammarData.length
            });

            return true;
        } catch (error) {
            console.error('Error loading data:', error);
            this.isLoaded = false;
            return false;
        }
    }

    parseTSV(text) {
        const data = [];
        let currentRow = [];
        let currentField = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < text.length) {
            const char = text[i];
            
            if (char === '"' && !inQuotes) {
                // Start of quoted field
                inQuotes = true;
            } else if (char === '"' && inQuotes) {
                // Check if it's escaped quote or end of quote
                if (i + 1 < text.length && text[i + 1] === '"') {
                    // Escaped quote
                    currentField += '"';
                    i++; // Skip next quote
                } else {
                    // End of quoted field
                    inQuotes = false;
                }
            } else if (char === '\t' && !inQuotes) {
                // Field separator - trim only leading/trailing spaces, preserve internal formatting
                currentRow.push(currentField.replace(/^\s+|\s+$/g, ''));
                currentField = '';
            } else if (char === '\n' && !inQuotes) {
                // End of row
                if (currentField || currentRow.length > 0) {
                    currentRow.push(currentField.replace(/^\s+|\s+$/g, ''));
                    if (currentRow.some(field => field !== '')) {
                        data.push(currentRow);
                    }
                }
                currentRow = [];
                currentField = '';
            } else {
                // Regular character
                currentField += char;
            }
            
            i++;
        }
        
        // Handle last row
        if (currentField || currentRow.length > 0) {
            currentRow.push(currentField.replace(/^\s+|\s+$/g, ''));
            if (currentRow.some(field => field !== '')) {
                data.push(currentRow);
            }
        }
        
        return data;
    }

    getVocabData() {
        return this.vocabData;
    }

    getKanjiData() {
        return this.kanjiData;
    }

    getGrammarData() {
        return this.grammarData;
    }

    // Get unique chapters for each data type
    getVocabChapters() {
        const chapters = new Set();
        this.vocabData.forEach(item => {
            if (item[4] && item[4].trim() !== '') {
                chapters.add(parseInt(item[4]));
            }
        });
        return Array.from(chapters).sort((a, b) => a - b);
    }

    getKanjiChapters() {
        const chapters = new Set();
        this.kanjiData.forEach(item => {
            if (item[3] && item[3].trim() !== '') {
                chapters.add(parseInt(item[3]));
            }
        });
        return Array.from(chapters).sort((a, b) => a - b);
    }

    getGrammarChapters() {
        const chapters = new Set();
        this.grammarData.forEach(item => {
            if (item[4] && item[4].trim() !== '') {
                chapters.add(parseInt(item[4]));
            }
        });
        return Array.from(chapters).sort((a, b) => a - b);
    }

    // Get data filtered by chapter
    getVocabByChapter(chapter) {
        if (chapter === 'all') return this.vocabData;
        return this.vocabData.filter(item => item[4] && parseInt(item[4]) === parseInt(chapter));
    }

    getKanjiByChapter(chapter) {
        if (chapter === 'all') return this.kanjiData;
        return this.kanjiData.filter(item => item[3] && parseInt(item[3]) === parseInt(chapter));
    }

    getGrammarByChapter(chapter) {
        if (chapter === 'all') return this.grammarData;
        return this.grammarData.filter(item => item[4] && parseInt(item[4]) === parseInt(chapter));
    }

    // Get data sorted by display order
    getVocabSortedByOrder() {
        return [...this.vocabData].sort((a, b) => {
            const orderA = parseInt(a[5]) || 0;
            const orderB = parseInt(b[5]) || 0;
            return orderA - orderB;
        });
    }

    getKanjiSortedByOrder() {
        return [...this.kanjiData].sort((a, b) => {
            const orderA = parseInt(a[4]) || 0;
            const orderB = parseInt(b[4]) || 0;
            return orderA - orderB;
        });
    }

    getGrammarSortedByOrder() {
        return [...this.grammarData].sort((a, b) => {
            const orderA = parseInt(a[5]) || 0;
            const orderB = parseInt(b[5]) || 0;
            return orderA - orderB;
        });
    }

    // Get chapter of an item
    getVocabChapter(index) {
        const item = this.vocabData[index];
        return item && item[4] ? parseInt(item[4]) : null;
    }

    getKanjiChapter(index) {
        const item = this.kanjiData[index];
        return item && item[3] ? parseInt(item[3]) : null;
    }

    getGrammarChapter(index) {
        const item = this.grammarData[index];
        return item && item[4] ? parseInt(item[4]) : null;
    }

    getVocabByIndex(index) {
        return this.vocabData[index] || null;
    }

    getKanjiByIndex(index) {
        return this.kanjiData[index] || null;
    }

    getGrammarByIndex(index) {
        return this.grammarData[index] || null;
    }

    // Get vocab items by type (hiragana, katakana, kanji, or special)
    getVocabByType(type, chapter = 'all') {
        let filteredData = this.vocabData;
        if (chapter !== 'all') {
            filteredData = this.getVocabByChapter(chapter);
        }
        
        return filteredData.filter((item, index) => {
            if (!item[0]) return false;
            
            const word = item[0];
            switch (type) {
                case 'hiragana':
                    return this.isHiragana(word);
                case 'katakana':
                    return this.isKatakana(word);
                case 'special':
                    return word.startsWith('〜');
                case 'kanji':
                default:
                    return !this.isHiragana(word) && !this.isKatakana(word) && !word.startsWith('〜');
            }
        }).map((item) => ({
            data: item,
            originalIndex: this.vocabData.indexOf(item)
        }));
    }

    isHiragana(text) {
        return /^[\u3040-\u309F]+$/.test(text);
    }

    isKatakana(text) {
        return /^[\u30A0-\u30FF]+$/.test(text);
    }

    hasKanji(text) {
        return /[\u4E00-\u9FAF]/.test(text);
    }

    // Format vocab answer based on available data
    formatVocabAnswer(vocabItem) {
        const [word, pronounce, meaning, sinoVietnamese] = vocabItem;
        let answer = '';
        
        if (pronounce && pronounce !== '') {
            answer += pronounce;
        }
        
        if (meaning && meaning !== '') {
            if (answer) answer += ' - ';
            answer += meaning;
        }
        
        if (sinoVietnamese && sinoVietnamese !== '') {
            if (answer) answer += ' - ';
            answer += sinoVietnamese;
        }
        
        return answer || word;
    }

    // Format kanji answer
    formatKanjiAnswer(kanjiItem) {
        const [kanji, pronounce, meaning] = kanjiItem;
        let answer = '';
        
        if (pronounce && pronounce !== '') {
            answer += pronounce;
        }
        
        if (meaning && meaning !== '') {
            if (answer) answer += ' - ';
            answer += meaning;
        }
        
        return answer || kanji;
    }

    // Process grammar structure for display (wrap in pre tag)
    processGrammarStructure(structure) {
        if (!structure) return '';
        
        let processed = structure;
        
        // Remove leading whitespace from the very first line only
        processed = processed.replace(/^\s+/, '');
        
        // Handle strikethrough - assuming format like ~text~ for strikethrough
        processed = processed.replace(/~([^~]+)~/g, '<span class="strikethrough">$1</span>');
        
        // Handle (bỏ...) pattern for strikethrough
        processed = processed.replace(/\(bỏ([^)]+)\)/g, '<span class="strikethrough">($1)</span>');
        
        // Remove only escaped HTML tags that appear as text, not actual HTML tags
        processed = processed.replace(/&lt;\/?[^&gt;]*&gt;/g, '');
        
        // Wrap in pre tag for proper whitespace handling
        return `<pre class="grammar-pre">${processed}</pre>`;
    }

    // Parse grammar notice points into array
    parseGrammarNotice(notice) {
        if (!notice || notice === '') return [];
        
        // Split by common separators and clean up
        const points = notice.split(/[;。；\n]/).filter(point => point.trim() !== '');
        return points.map(point => point.trim());
    }

    // Parse grammar examples into array
    parseGrammarExamples(examples) {
        if (!examples || examples === '') return [];
        
        // Split by semicolons and numbers at start, but NOT by Japanese periods
        const exampleList = examples.split(/[;；]|(?=\d+[,.])/g).filter(example => {
            const cleaned = example.trim();
            return cleaned !== '' && cleaned.length > 1;
        });
        return exampleList.map(example => example.trim().replace(/^\d+[,.]?\s*/, ''));
    }

    // Get random indices for quiz options
    getRandomIndices(maxIndex, count, excludeIndex = -1) {
        const indices = [];
        
        while (indices.length < count) {
            const randomIndex = Math.floor(Math.random() * maxIndex);
            if (randomIndex !== excludeIndex && !indices.includes(randomIndex)) {
                indices.push(randomIndex);
            }
        }
        
        return indices;
    }

    // Shuffle array
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // Remove leading whitespace from DOM element manually
    removeLeadingWhitespace(element) {
        if (!element) return;
        
        const textContent = element.textContent || element.innerText;
        if (textContent) {
            // Remove leading whitespace from the text content
            const trimmedContent = textContent.replace(/^\s+/, '');
            // Replace the content while preserving HTML structure
            if (trimmedContent !== textContent) {
                element.innerHTML = element.innerHTML.replace(/^\s+/, '');
            }
        }
    }
}

// Create global instance
const dataLoader = new DataLoader();
