// Local Storage Utilities for JLPT N2 Practice

class LocalStorageUtils {
    constructor() {
        this.REMINDS_KEY = 'reminds';
        this.ENCOUNTERS_KEY = 'encounter_times';
        this.initializeReminds();
        this.initializeEncounters();
    }

    // Initialize reminds structure if it doesn't exist
    initializeReminds() {
        if (!this.getReminds()) {
            const initialReminds = {
                vocab: [],
                kanji: [],
                grammar: []
            };
            localStorage.setItem(this.REMINDS_KEY, JSON.stringify(initialReminds));
        }
    }

    // Get all reminds
    getReminds() {
        try {
            const reminds = localStorage.getItem(this.REMINDS_KEY);
            return reminds ? JSON.parse(reminds) : null;
        } catch (error) {
            console.error('Error parsing reminds from localStorage:', error);
            return null;
        }
    }

    // Get reminds for specific type (vocab, kanji, grammar)
    getRemindsByType(type) {
        const reminds = this.getReminds();
        return reminds && reminds[type] ? reminds[type] : [];
    }

    // Add item to reminds
    addToReminds(type, index) {
        const reminds = this.getReminds();
        if (!reminds) return false;

        if (!reminds[type]) {
            reminds[type] = [];
        }

        // Check if already exists
        if (!reminds[type].includes(index)) {
            reminds[type].push(index);
            localStorage.setItem(this.REMINDS_KEY, JSON.stringify(reminds));
            return true;
        }
        return false;
    }

    // Remove item from reminds
    removeFromReminds(type, index) {
        const reminds = this.getReminds();
        if (!reminds || !reminds[type]) return false;

        const indexPos = reminds[type].indexOf(index);
        if (indexPos > -1) {
            reminds[type].splice(indexPos, 1);
            localStorage.setItem(this.REMINDS_KEY, JSON.stringify(reminds));
            return true;
        }
        return false;
    }

    // Check if item is in reminds
    isInReminds(type, index) {
        const reminds = this.getRemindsByType(type);
        return reminds.includes(index);
    }

    // Get count of reminds by type
    getRemindCount(type) {
        const reminds = this.getRemindsByType(type);
        return reminds.length;
    }

    // Clear all reminds for a specific type
    clearRemindsByType(type) {
        const reminds = this.getReminds();
        if (!reminds) return false;

        reminds[type] = [];
        localStorage.setItem(this.REMINDS_KEY, JSON.stringify(reminds));
        return true;
    }

    // Clear all reminds
    clearAllReminds() {
        const initialReminds = {
            vocab: [],
            kanji: [],
            grammar: []
        };
        localStorage.setItem(this.REMINDS_KEY, JSON.stringify(initialReminds));
        return true;
    }

    // Export reminds data (for backup)
    exportReminds() {
        const reminds = this.getReminds();
        return JSON.stringify(reminds, null, 2);
    }

    // Import reminds data (for restore)
    importReminds(data) {
        try {
            const reminds = JSON.parse(data);
            if (reminds && typeof reminds === 'object' && reminds.vocab && reminds.kanji && reminds.grammar) {
                localStorage.setItem(this.REMINDS_KEY, JSON.stringify(reminds));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error importing reminds data:', error);
            return false;
        }
    }

    // Initialize encounter tracking
    initializeEncounters() {
        if (!this.getEncounters()) {
            const initialEncounters = {
                encounter_vocab: { normal: {}, revert: {} },
                encounter_kanji: { normal: {}, revert: {} },
                encounter_grammar: {},
                encounter_vocab_remind: { normal: {}, revert: {} },
                encounter_kanji_remind: { normal: {}, revert: {} },
                encounter_grammar_remind: {}
            };
            localStorage.setItem(this.ENCOUNTERS_KEY, JSON.stringify(initialEncounters));
        }
    }

    // Get encounter data
    getEncounters() {
        try {
            const encounters = localStorage.getItem(this.ENCOUNTERS_KEY);
            return encounters ? JSON.parse(encounters) : null;
        } catch (error) {
            console.error('Error parsing encounters from localStorage:', error);
            return null;
        }
    }

    // Record encounter for a question
    recordEncounter(quizType, mode, questionId, isRemindMode = false) {
        const encounters = this.getEncounters();
        if (!encounters) return;

        const key = isRemindMode ? `encounter_${quizType}_remind` : `encounter_${quizType}`;
        
        if (quizType === 'grammar') {
            if (!encounters[key][questionId]) {
                encounters[key][questionId] = 0;
            }
            encounters[key][questionId]++;
        } else {
            if (!encounters[key][mode]) {
                encounters[key][mode] = {};
            }
            if (!encounters[key][mode][questionId]) {
                encounters[key][mode][questionId] = 0;
            }
            encounters[key][mode][questionId]++;
        }

        localStorage.setItem(this.ENCOUNTERS_KEY, JSON.stringify(encounters));
    }

    // Get smart random question index
    getSmartRandomIndex(availableIndices, quizType, mode, isRemindMode = false) {
        if (availableIndices.length === 0) return -1;
        if (availableIndices.length === 1) {
            this.recordEncounter(quizType, mode, availableIndices[0].toString(), isRemindMode);
            return availableIndices[0];
        }

        const encounters = this.getEncounters();
        if (!encounters) {
            const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            this.recordEncounter(quizType, mode, randomIndex.toString(), isRemindMode);
            return randomIndex;
        }

        const key = isRemindMode ? `encounter_${quizType}_remind` : `encounter_${quizType}`;
        let encounterData;
        
        if (quizType === 'grammar') {
            encounterData = encounters[key] || {};
        } else {
            encounterData = encounters[key] && encounters[key][mode] ? encounters[key][mode] : {};
        }

        // Find unencountered questions first
        const unencountered = availableIndices.filter(index => !encounterData[index.toString()]);
        
        if (unencountered.length > 0) {
            const randomIndex = unencountered[Math.floor(Math.random() * unencountered.length)];
            this.recordEncounter(quizType, mode, randomIndex.toString(), isRemindMode);
            return randomIndex;
        }

        // All questions encountered, find minimum encounter count
        const encounterCounts = availableIndices.map(index => ({
            index,
            count: encounterData[index.toString()] || 0
        }));
        
        const minCount = Math.min(...encounterCounts.map(item => item.count));
        const leastEncountered = encounterCounts.filter(item => item.count === minCount);
        
        const randomItem = leastEncountered[Math.floor(Math.random() * leastEncountered.length)];
        this.recordEncounter(quizType, mode, randomItem.index.toString(), isRemindMode);
        return randomItem.index;
    }

    // Decrease encounter count for wrong answers
    removeEncounter(quizType, mode, questionId, isRemindMode = false) {
        const encounters = this.getEncounters();
        if (!encounters) return;

        const key = isRemindMode ? `encounter_${quizType}_remind` : `encounter_${quizType}`;
        
        if (quizType === 'grammar') {
            if (encounters[key] && encounters[key][questionId] && encounters[key][questionId] > 0) {
                encounters[key][questionId]--;
                if (encounters[key][questionId] === 0) {
                    delete encounters[key][questionId];
                }
            }
        } else {
            if (encounters[key] && encounters[key][mode] && encounters[key][mode][questionId] && encounters[key][mode][questionId] > 0) {
                encounters[key][mode][questionId]--;
                if (encounters[key][mode][questionId] === 0) {
                    delete encounters[key][mode][questionId];
                }
            }
        }

        localStorage.setItem(this.ENCOUNTERS_KEY, JSON.stringify(encounters));
    }

    // Clear encounter data
    clearEncounters() {
        this.initializeEncounters();
    }

    // Last question storage
    saveLastQuestion(quizType, questionIndex, mode = {}) {
        const lastQuestions = this.getLastQuestions();
        lastQuestions[quizType] = questionIndex;
        lastQuestions[`${quizType}_mode`] = mode;
        localStorage.setItem('last_questions', JSON.stringify(lastQuestions));
    }

    getLastQuestions() {
        try {
            const data = localStorage.getItem('last_questions');
            return data ? JSON.parse(data) : {};
        } catch (error) {
            return {};
        }
    }

    getLastQuestion(quizType) {
        const lastQuestions = this.getLastQuestions();
        return {
            questionIndex: lastQuestions[quizType] || null,
            mode: lastQuestions[`${quizType}_mode`] || {}
        };
    }

    clearLastQuestion(quizType) {
        const lastQuestions = this.getLastQuestions();
        delete lastQuestions[quizType];
        delete lastQuestions[`${quizType}_mode`];
        localStorage.setItem('last_questions', JSON.stringify(lastQuestions));
    }
}

// Create global instance
const localStorageUtils = new LocalStorageUtils();
