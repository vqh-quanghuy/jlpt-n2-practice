// Local Storage Utilities for JLPT N2 Practice

class LocalStorageUtils {
    constructor() {
        this.isPersonalMode = window.location.pathname.includes('/personal');
        this.REMINDS_KEY = 'reminds';
        this.ENCOUNTERS_KEY = 'encounter_times';
        this.LAST_QUESTIONS_KEY = 'last_questions';
        this.initializeReminds();
        this.initializeEncounters();
    }

    // Initialize reminds structure if it doesn't exist
    initializeReminds() {
        if (!this.getReminds()) {
            const initialReminds = {
                vocab: [],
                kanji: [],
                grammar: [],
                personal_other: [],
                personal_past: [],
                personal_reduplicative: []
            };
            localStorage.setItem(this.REMINDS_KEY, JSON.stringify(initialReminds));
        } else {
            // Ensure personal keys exist in existing reminds
            const reminds = this.getReminds();
            let updated = false;
            if (!reminds.personal_other) {
                reminds.personal_other = [];
                updated = true;
            }
            if (!reminds.personal_past) {
                reminds.personal_past = [];
                updated = true;
            }
            if (!reminds.personal_reduplicative) {
                reminds.personal_reduplicative = [];
                updated = true;
            }
            if (updated) {
                localStorage.setItem(this.REMINDS_KEY, JSON.stringify(reminds));
            }
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

    // Get reminds by type (same as getRemindsByType)
    getCrossRemindsByType(type) {
        return this.getRemindsByType(type);
    }

    // Get all remind types for personal mode
    getAllRemindTypes() {
        const reminds = this.getReminds();
        if (!reminds) return {};
        
        return {
            vocab: reminds.vocab || [],
            kanji: reminds.kanji || [],
            grammar: reminds.grammar || [],
            personal_other: reminds.personal_other || [],
            personal_past: reminds.personal_past || [],
            personal_reduplicative: reminds.personal_reduplicative || []
        };
    }

    // Get reminds (same storage for both modes)
    getCrossReminds() {
        return this.getReminds() || {};
    }

    // Add item to reminds
    addToReminds(type, index) {
        const reminds = this.getReminds();
        if (!reminds) return false;

        if (!reminds[type]) {
            reminds[type] = [];
        }

        // Convert long personal keys to short format
        const shortIndex = this.convertToShortKey(type, index);
        
        // Check if already exists
        if (!reminds[type].includes(shortIndex)) {
            reminds[type].push(shortIndex);
            localStorage.setItem(this.REMINDS_KEY, JSON.stringify(reminds));
            return true;
        }
        return false;
    }

    // Remove item from reminds
    removeFromReminds(type, index) {
        const reminds = this.getReminds();
        if (!reminds || !reminds[type]) return false;

        // Convert long personal keys to short format
        const shortIndex = this.convertToShortKey(type, index);
        
        const indexPos = reminds[type].indexOf(shortIndex);
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
        const shortIndex = this.convertToShortKey(type, index);
        return reminds.includes(shortIndex);
    }

    // Get count of reminds by type
    getRemindCount(type) {
        const reminds = this.getRemindsByType(type);
        return reminds.length;
    }

    // Get total count of all reminds
    getTotalRemindCount() {
        const allReminds = this.getAllRemindTypes();
        return Object.values(allReminds).reduce((total, arr) => total + arr.length, 0);
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
            grammar: [],
            personal_other: [],
            personal_past: [],
            personal_reduplicative: []
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
                // Ensure personal keys exist
                if (!reminds.personal_other) reminds.personal_other = [];
                if (!reminds.personal_past) reminds.personal_past = [];
                if (!reminds.personal_reduplicative) reminds.personal_reduplicative = [];
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

    // Record encounter for a question with special mode support
    recordEncounter(quizType, mode, questionId, isRemindMode = false, specialMode = null) {
        const encounters = this.getEncounters();
        if (!encounters) return;

        let key = isRemindMode ? `encounter_${quizType}_remind` : `encounter_${quizType}`;
        if (specialMode) {
            key += `_${specialMode}`;
        }
        
        // Convert long personal keys to short format
        const shortQuestionId = this.convertToShortKey(specialMode, questionId);
        
        // Initialize key if it doesn't exist
        if (!encounters[key]) {
            encounters[key] = quizType === 'grammar' ? {} : { normal: {}, revert: {} };
        }
        
        if (quizType === 'grammar') {
            if (!encounters[key][shortQuestionId]) {
                encounters[key][shortQuestionId] = 0;
            }
            encounters[key][shortQuestionId]++;
        } else {
            if (!encounters[key][mode]) {
                encounters[key][mode] = {};
            }
            if (!encounters[key][mode][shortQuestionId]) {
                encounters[key][mode][shortQuestionId] = 0;
            }
            encounters[key][mode][shortQuestionId]++;
        }

        localStorage.setItem(this.ENCOUNTERS_KEY, JSON.stringify(encounters));
    }

    // Get smart random question index with support for special modes
    getSmartRandomIndex(availableIndices, quizType, mode, isRemindMode = false, specialMode = null) {
        if (availableIndices.length === 0) return -1;
        if (availableIndices.length === 1) {
            this.recordEncounter(quizType, mode, availableIndices[0].toString(), isRemindMode, specialMode);
            return availableIndices[0];
        }

        const encounters = this.getEncounters();
        if (!encounters) {
            const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
            this.recordEncounter(quizType, mode, randomIndex.toString(), isRemindMode, specialMode);
            return randomIndex;
        }

        let key = isRemindMode ? `encounter_${quizType}_remind` : `encounter_${quizType}`;
        if (specialMode) {
            key += `_${specialMode}`;
        }
        
        let encounterData;
        
        if (quizType === 'grammar') {
            encounterData = encounters[key] || {};
        } else {
            encounterData = encounters[key] && encounters[key][mode] ? encounters[key][mode] : {};
        }

        // Find unencountered questions first
        const unencountered = availableIndices.filter(index => {
            const shortKey = this.convertToShortKey(specialMode, index.toString());
            return !encounterData[shortKey];
        });
        
        if (unencountered.length > 0) {
            const randomIndex = unencountered[Math.floor(Math.random() * unencountered.length)];
            this.recordEncounter(quizType, mode, randomIndex.toString(), isRemindMode, specialMode);
            return randomIndex;
        }

        // All questions encountered, find minimum encounter count
        const encounterCounts = availableIndices.map(index => {
            const shortKey = this.convertToShortKey(specialMode, index.toString());
            return {
                index,
                count: encounterData[shortKey] || 0
            };
        });
        
        const minCount = Math.min(...encounterCounts.map(item => item.count));
        const leastEncountered = encounterCounts.filter(item => item.count === minCount);
        
        const randomItem = leastEncountered[Math.floor(Math.random() * leastEncountered.length)];
        this.recordEncounter(quizType, mode, randomItem.index.toString(), isRemindMode, specialMode);
        return randomItem.index;
    }

    // Decrease encounter count for wrong answers with special mode support
    removeEncounter(quizType, mode, questionId, isRemindMode = false, specialMode = null) {
        const encounters = this.getEncounters();
        if (!encounters) return;

        let key = isRemindMode ? `encounter_${quizType}_remind` : `encounter_${quizType}`;
        if (specialMode) {
            key += `_${specialMode}`;
        }
        
        // Convert long personal keys to short format
        const shortQuestionId = this.convertToShortKey(specialMode, questionId);
        
        if (quizType === 'grammar') {
            if (encounters[key] && encounters[key][shortQuestionId] && encounters[key][shortQuestionId] > 0) {
                encounters[key][shortQuestionId]--;
                if (encounters[key][shortQuestionId] === 0) {
                    delete encounters[key][shortQuestionId];
                }
            }
        } else {
            if (encounters[key] && encounters[key][mode] && encounters[key][mode][shortQuestionId] && encounters[key][mode][shortQuestionId] > 0) {
                encounters[key][mode][shortQuestionId]--;
                if (encounters[key][mode][shortQuestionId] === 0) {
                    delete encounters[key][mode][shortQuestionId];
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
        localStorage.setItem(this.LAST_QUESTIONS_KEY, JSON.stringify(lastQuestions));
    }

    getLastQuestions() {
        try {
            const data = localStorage.getItem(this.LAST_QUESTIONS_KEY);
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
        localStorage.setItem(this.LAST_QUESTIONS_KEY, JSON.stringify(lastQuestions));
    }

    // Convert long personal keys to short format
    convertToShortKey(type, index) {
        if (typeof index !== 'string') return index;
        
        // Convert personal mode keys to short format
        if (index.startsWith('personal_past_')) {
            return `tv-${index.replace('personal_past_', '')}`;
        } else if (index.startsWith('personal_reduplicative_')) {
            return `rv-${index.replace('personal_reduplicative_', '')}`;
        } else if (index.startsWith('personal_other_')) {
            return `ov-${index.replace('personal_other_', '')}`;
        }
        
        return index;
    }

    // Convert short keys back to long format for internal use
    convertFromShortKey(shortKey) {
        if (typeof shortKey !== 'string') return shortKey;
        
        if (shortKey.startsWith('tv-')) {
            return `personal_past_${shortKey.replace('tv-', '')}`;
        } else if (shortKey.startsWith('rv-')) {
            return `personal_reduplicative_${shortKey.replace('rv-', '')}`;
        } else if (shortKey.startsWith('ov-')) {
            return `personal_other_${shortKey.replace('ov-', '')}`;
        }
        
        return shortKey;
    }
}

// Create global instance
const localStorageUtils = new LocalStorageUtils();
