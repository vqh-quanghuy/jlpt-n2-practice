# JLPT N2 Practice App

A comprehensive frontend-only quiz application for JLPT N2 practice, featuring vocabulary, kanji, and grammar exercises with smart encounter tracking and reminder functionality.

## 🌟 Features

### Quiz Types
1. **📚 Vocabulary Quiz (語彙)** - Practice Japanese vocabulary with multiple modes
2. **🈳 Kanji Quiz (漢字)** - Learn kanji characters and their readings  
3. **📝 Grammar Quiz (文法)** - Master N2 grammar patterns with detailed explanations
4. **🔖 Reminds** - Review items you've marked or gotten wrong
5. **📋 List (まとめ)** - Browse complete database of all items

### 🎯 Key Functionality

#### Vocabulary Quiz
- **Normal Mode**: Show kanji/hiragana/katakana → choose meaning + pronunciation
- **Revert Mode**: Show Vietnamese meaning → choose kanji/hiragana/katakana
- **Smart Filtering**: Questions and answers are filtered by type (hiragana/katakana/kanji/special patterns starting with 〜)
- **Auto-categorization**: Wrong answers automatically added to reminds
- **Smart Encounter System**: Balanced question distribution prevents repetition

#### Kanji Quiz  
- **Normal Mode**: Show kanji → choose pronunciation + meaning
- **Revert Mode**: Show pronunciation → choose kanji
- **Smart Selection**: Prioritizes unencountered questions
- **Auto-remind**: Wrong answers automatically added to reminds

#### Grammar Quiz
- **Question**: Grammar structure with strikethrough formatting support for (bỏ...) patterns
- **Answers**: Vietnamese meanings
- **Auto-resize Text**: Questions automatically resize to fit screen without horizontal scrolling
- **Info Cards**: After each answer, displays detailed explanation with:
  - Vietnamese meaning (larger text)
  - Notice points (bulleted list)
  - Usage examples (bulleted list)
- **Smart Tracking**: Encounter-based question selection

#### 🧠 Smart Encounter System
- **Balanced Distribution**: Tracks how many times each question has been shown
- **Priority System**: Unencountered questions shown first, then least-encountered ones
- **Mode-Specific**: Separate tracking for normal/revert modes
- **Session-Aware**: Different tracking for regular vs remind-only sessions
- **Performance Optimized**: Handles 1947+ vocabulary items efficiently

#### Reminds System
- **Pin Feature**: Click bookmark icon next to any question to add to reminds
- **Auto-add**: Wrong answers automatically added to reminds
- **Reminds-only Mode**: Practice only from your reminds list (requires minimum 4 items)
- **Management**: View and remove items from reminds lists with X button
- **Persistent Storage**: Uses localStorage to maintain reminds across sessions

#### List View
- **Complete Database**: Browse all vocabulary, kanji, and grammar items
- **Bookmark Integration**: Add/remove items from reminds directly from lists
- **Responsive Design**: Auto-resizing text prevents horizontal scrolling
- **Read-only**: Complete view of all data without editing capability

## 📊 Data Format

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
- Column 1: Grammar structure (supports ~strikethrough~ and (bỏ...) patterns)
- Column 2: Vietnamese meaning
- Column 3: Notice points (separated by ; or 。)
- Column 4: Usage examples (separated by ; or 。)

## 🏗️ Technical Details

### Architecture
- **Frontend-only**: No backend required, runs entirely in browser
- **Bootstrap 5**: Responsive design for mobile and desktop
- **Modular JavaScript**: Clean separation of concerns
- **LocalStorage**: Persistent reminds and encounter tracking
- **TSV Data**: Simple tab-separated value files for easy editing

### Advanced Features
- **Smart Encounter Tracking**: Prevents question repetition using localStorage
- **Auto-resizing Text**: Dynamic font sizing prevents horizontal scrolling
- **URL-based Navigation**: Hash-based navigation remembers current page
- **Bootstrap Modals**: Enhanced UX with confirmation dialogs
- **Responsive Design**: Works seamlessly on mobile and desktop

### File Structure
```
n2-practice/
├── index.html              # Main application
├── css/
│   └── style.css          # Custom styles with responsive design
├── js/
│   ├── app.js            # Main application controller with hash navigation
│   ├── data-loader.js    # TSV file loader with strikethrough processing
│   ├── local-storage-utils.js  # LocalStorage with encounter tracking
│   ├── quiz-vocab.js     # Vocabulary quiz with smart selection
│   ├── quiz-kanji.js     # Kanji quiz with encounter tracking
│   ├── quiz-grammar.js   # Grammar quiz with auto-resize text
│   ├── reminds.js        # Reminds management with Bootstrap modals
│   └── list.js           # List view with bookmark integration
└── data/
    ├── n2-vocab.tsv      # Vocabulary data (1947+ items)
    ├── n2-kanji.tsv      # Kanji data
    └── n2-grammar.tsv    # Grammar data with special formatting
```

## 🚀 Setup Instructions

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

## 📱 Usage Guide

### Navigation
- **Top Buttons**: Click navigation buttons to switch between sections
- **Keyboard Shortcuts**: 
  - `1` - Vocabulary Quiz
  - `2` - Kanji Quiz
  - `3` - Grammar Quiz  
  - `4` - Reminds
  - `5` - List
  - `Space` - New question (in quiz modes)

### Quiz Controls
- **Revert Mode**: Toggle to reverse question/answer format
- **Reminds Only**: Practice only items in your reminds list (minimum 4 items required)
- **Bookmark Icon**: Add current item to reminds list
- **Answer Selection**: Click anywhere on answer chip to select

### Smart Features
- **Auto-resize**: Text automatically adjusts to prevent horizontal scrolling
- **Smart Questions**: Unencountered questions prioritized, then least-encountered
- **Mode Tracking**: Normal and revert modes tracked separately
- **Session Memory**: URL remembers your current page after refresh

### Reminds Management
- **Auto-add**: Wrong answers automatically added to reminds
- **Manual Add**: Use bookmark icon next to questions
- **Remove Items**: Use X button to remove from reminds
- **Tab Navigation**: Switch between vocab/kanji/grammar tabs

### List Features
- **Complete View**: Browse all items in the database
- **Direct Bookmarking**: Add/remove reminds directly from lists
- **Responsive Display**: Auto-sizing prevents text overflow
- **Search-friendly**: Easy to browse large datasets

## 🌐 Browser Compatibility
- Modern browsers with ES6+ support
- Chrome, Firefox, Safari, Edge
- Mobile and desktop responsive
- LocalStorage support required

## 💾 Data Management
- **LocalStorage**: Reminds and encounter data stored locally
- **Persistent**: Data survives browser restarts
- **Privacy**: All data stays on your device
- **Reset**: Clear browser data to reset all progress

## 🎨 Customization Options
The app can be easily customized by:
- **Themes**: Modify CSS variables for different color schemes
- **Languages**: Update UI text in JavaScript files
- **Data Sources**: Replace TSV files with your own content
- **Features**: Extend quiz logic for additional question types
- **Styling**: Adjust responsive breakpoints and layouts

## 🔧 Performance Notes
- **Optimized for Large Datasets**: Efficiently handles 1947+ vocabulary items
- **Smart Caching**: Encounter tracking uses minimal storage
- **Fast Loading**: Frontend-only architecture ensures quick startup
- **Memory Efficient**: Lazy loading and smart data management

## 📈 Analytics & Tracking
- **Encounter Counts**: Track how often each question appears
- **Progress Monitoring**: See which items need more practice
- **Mode Statistics**: Separate tracking for different quiz modes
- **Session Data**: Distinguish between regular and remind-only practice