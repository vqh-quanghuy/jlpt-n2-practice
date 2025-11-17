# JLPT N2 Practice App

A comprehensive frontend-only quiz application for JLPT N2 practice, featuring vocabulary, kanji, and grammar exercises with reminder functionality.

## Features

### Quiz Types
1. **Vocabulary Quiz (語彙)** - Practice Japanese vocabulary with multiple modes
2. **Kanji Quiz (漢字)** - Learn kanji characters and their readings  
3. **Grammar Quiz (文法)** - Master N2 grammar patterns with detailed explanations
4. **Reminds** - Review items you've marked or gotten wrong
5. **List (まとめ)** - Browse complete database of all items

### Key Functionality

#### Vocabulary Quiz
- **Normal Mode**: Show kanji/hiragana/katakana → choose meaning + pronunciation
- **Revert Mode**: Show Vietnamese meaning → choose kanji/hiragana/katakana
- **Smart Filtering**: Questions and answers are filtered by type (hiragana/katakana/kanji/special patterns starting with 〜)
- **Auto-categorization**: Wrong answers automatically added to reminds

#### Kanji Quiz  
- **Normal Mode**: Show kanji → choose pronunciation + meaning
- **Revert Mode**: Show pronunciation → choose kanji
- **Wrong answers automatically added to reminds

#### Grammar Quiz
- **Question**: Grammar structure with strikethrough formatting support
- **Answers**: Vietnamese meanings
- **Info Cards**: After each answer, displays detailed explanation with:
  - Vietnamese meaning (larger text)
  - Notice points (bulleted list)
  - Usage examples (bulleted list)
- **Wrong answers automatically added to reminds

#### Reminds System
- **Pin Feature**: Click pin icon next to any question to add to reminds
- **Auto-add**: Wrong answers automatically added to reminds
- **Reminds-only Mode**: Practice only from your reminds list (requires minimum 4 items)
- **Management**: View and remove items from reminds lists
- **Persistent Storage**: Uses localStorage to maintain reminds across sessions

#### List View
- **Complete Database**: Browse all vocabulary, kanji, and grammar items
- **Pagination**: Efficiently handles large datasets (50 items per page for vocab/kanji, 20 for grammar)
- **No Edit Function**: Read-only view of complete data

## Data Format

### Vocabulary TSV (n2-vocab.tsv)
Format: `kanji/hiragana/katakana | pronunciation | vietnamese_meaning | sino_vietnamese`
- Column 1: Japanese word (any script)
- Column 2: Pronunciation (can be empty for hiragana/katakana)
- Column 3: Vietnamese meaning
- Column 4: Sino-Vietnamese equivalent (optional)
- Column 5+: Ignored

### Kanji TSV (n2-kanji.tsv)  
Format: `kanji | pronunciation | vietnamese_meaning`
- Column 1: Kanji character
- Column 2: Japanese pronunciation  
- Column 3: Vietnamese meaning

### Grammar TSV (n2-grammar.tsv)
Format: `structure | vietnamese_meaning | notice_points | examples`
- Column 1: Grammar structure (supports ~strikethrough~ and \n line breaks)
- Column 2: Vietnamese meaning
- Column 3: Notice points (separated by ; or 。)
- Column 4: Usage examples (separated by ; or 。)

## Technical Details

### Architecture
- **Frontend-only**: No backend required, runs entirely in browser
- **Bootstrap 5**: Responsive design for mobile and desktop
- **Modular JavaScript**: Clean separation of concerns
- **LocalStorage**: Persistent reminds system
- **TSV Data**: Simple tab-separated value files for easy editing

### File Structure
```
n2-practice/
├── index.html              # Main application
├── css/
│   └── style.css          # Custom styles
├── js/
│   ├── app.js            # Main application controller
│   ├── data-loader.js    # TSV file loader and parser
│   ├── local-storage-utils.js  # LocalStorage management
│   ├── quiz-vocab.js     # Vocabulary quiz logic
│   ├── quiz-kanji.js     # Kanji quiz logic  
│   ├── quiz-grammar.js   # Grammar quiz logic
│   ├── reminds.js        # Reminds management
│   └── list.js           # List view functionality
└── data/
    ├── n2-vocab.tsv      # Vocabulary data
    ├── n2-kanji.tsv      # Kanji data
    └── n2-grammar.tsv    # Grammar data
```

## Setup Instructions

1. **Add Your Data**: Place your TSV files in the `data/` folder:
   - `n2-vocab.tsv` - Vocabulary data
   - `n2-kanji.tsv` - Kanji data  
   - `n2-grammar.tsv` - Grammar data

2. **Deploy**: Upload to any static hosting service:
   - GitHub Pages
   - Netlify
   - Vercel
   - Or run locally with a simple HTTP server

3. **Access**: Open `index.html` in a web browser

## Usage

### Navigation
- **Top Buttons**: Click round buttons to switch between sections
- **Keyboard Shortcuts**: 
  - `1` - Vocabulary Quiz
  - `2` - Kanji Quiz
  - `3` - Grammar Quiz  
  - `4` - Reminds
  - `5` - List
  - `Space` - New question (in quiz modes)

### Quiz Controls
- **Revert Mode**: Toggle to reverse question/answer format
- **Reminds Only**: Practice only items in your reminds list
- **Pin Icon**: Add current item to reminds list
- **Answer Chips**: Click anywhere on answer to select

### Reminds Management
- Items automatically added when answered incorrectly
- Manually add items using pin icon next to questions
- Remove items from reminds using trash button
- Switch between vocab/kanji/grammar tabs

## Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile and desktop responsive

## Data Management
- **LocalStorage**: Reminds data stored locally in browser
- **Export/Import**: Can be extended for backup functionality
- **Reset**: Clear browser data to reset all reminds

## Customization
The app can be easily customized by:
- Modifying CSS for different themes
- Adjusting quiz logic in respective JS files
- Adding new data types by extending the architecture
- Customizing UI text and labels
