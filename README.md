# 🎯 Samurai Sudoku Solver

A web application for solving both Standard 9×9 and Samurai Sudoku puzzles using constraint propagation and backtracking algorithms.

![Version](https://img.shields.io/badge/version-2.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![HTML5](https://img.shields.io/badge/HTML5-CSS3-orange)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow)

## 📖 What is Samurai Sudoku?

Samurai Sudoku consists of **5 overlapping standard 9×9 Sudoku grids** arranged in a cross pattern:
- 4 corner grids (A, B, C, D)
- 1 central grid (S)
- Overlapping 3×3 regions that must satisfy rules for multiple grids simultaneously

## ✨ Features

### � Dual Mode Support
- **Standard 9×9** - Classic single Sudoku grid (default)
- **Samurai 5×9×9** - Five overlapping grids in cross pattern
- Easy toggle between modes

### 🌍 Multi-Language
- **English** and **Dutch** support
- Auto-detection based on browser language
- Easy language switcher (EN/NL buttons)

### �🎮 Solving Capabilities
- **Instant Solve** - Complete backtracking solver with constraint propagation
- **Step-by-Step** - See logical deductions one at a time
- **Fill Singles** - Automatically fill all cells with only one possible value
- **Fast Performance** - Typical solve time: 50-200ms
- **Empty Grid Validation** - Prevents solving empty puzzles

### 🎨 User Interface
- **Interactive Grid** - Click any cell and type 1-9
- **Visual Highlighting** - Overlap regions clearly marked in Samurai mode
- **Light Theme** - Clean, easy-to-read interface
- **Responsive Design** - Works on desktop and tablet
- **Status Messages** - Clear feedback for every action

### 💾 Data Management
- **Import/Export** - Text format for puzzle data
- **File Save/Load** - Save puzzles as .txt files
- **Copy to Clipboard** - Easy sharing
- **Format Validation** - Automatic error checking

### ⏮️ Undo/Redo
- **Full History** - Track all changes
- **Efficient Storage** - Only stores diffs
- **Unlimited Steps** - Undo/redo as much as needed

### ✅ Validation
- **Real-time Checking** - Detect conflicts instantly
- **Cross-board Validation** - Overlaps validated in all contexts (Samurai mode)
- **Rule Enforcement** - Standard Sudoku rules applied

## 🚀 Quick Start

### Option 1: Direct Open
1. Download the repository or files
2. Open `index.html` in any modern browser
3. Start solving!

### Option 2: Local Server
```bash
# Python 3
python -m http.server 8000

# Node.js
npx http-server

# Then open: http://localhost:8000
```

## 📝 How to Use

### Basic Workflow

#### Standard Mode (Default)
1. **Enter a Puzzle**
   - Click cells and type numbers 1-9, or
   - Paste a 9×9 grid in the text area (right panel)
   - Click "Load from text"

2. **Solve**
   - Click "Solve" for instant solution
   - Or use "Next step" for step-by-step solving
   - Or click "Fill singles" for naked singles

3. **Manual Entry**
   - Click any cell in the grid
   - Type a number 1-9
   - Use Tab to move between cells

#### Samurai Mode
1. **Switch to Samurai** - Click "Samurai 5×9×9" button at top
2. **Load Puzzle** - Paste 5 grids in text areas (A, B, C, D, S)
3. **Solve** - Same controls as Standard mode

### Common Actions
- **Validate** - Check for conflicts
- **Clear** - Clear non-fixed cells
- **Clear All** - Clear entire grid
- **Reset** - Return to initial values
- **Undo/Redo** - Navigate through history

### Text Format

Each grid should be 9 lines of 9 digits:
- Use `0` or `.` for empty cells
- Use `1-9` for filled cells

**Example:**
```
008000009
000000200
000005060
000060040
002003070
067010052
094050087
080190004
050004001
```

## 🎮 Controls Reference

| Button | Description |
|--------|-------------|
| **Clear** | Clear all non-fixed cells |
| **Solve** | Solve the entire puzzle instantly |
| **Validate** | Check current state for conflicts |
| **Load from text** | Import from text areas |
| **Export to text** | Export to text areas |
| **Reset** | Reset to initial values |
| **Clear All** | Clear entire grid |
| **Next step** | Perform one logical step |
| **Fill singles** | Fill all naked singles |
| **Undo** | Undo last change |
| **Redo** | Redo undone change |
| **Save file** | Save puzzle to file |
| **Load file** | Load puzzle from file |
| **Self-test** | Run automated tests |

## 🏗️ Architecture

### File Structure
```
samurai-sudoku-solver/
├── index.html              # Main HTML/CSS
├── assets/
│   ├── app.js              # Application logic
│   └── translations.js     # Language translations
├── tests/
│   ├── test-ui.js          # UI test script
│   └── *.md                # Documentation
└── README.md               # This file
```

### Data Structure
```javascript
// Board objects (1 for Standard, 5 for Samurai: A, B, C, D, S)
boards = {
  A: Board,  // Standard mode, or Top-left in Samurai
  B: Board,  // Top-right (Samurai only)
  C: Board,  // Bottom-left (Samurai only)
  D: Board,  // Bottom-right (Samurai only)
  S: Board   // Center/Star (Samurai only)
}

// Each Board contains 9×9 Cell objects
class Cell {
  v: number              // Current value (0 = empty)
  memberships: []        // Which boards this cell belongs to
  el: HTMLInputElement   // Linked input element
  fixed: boolean         // Is this an initial clue?
}
```

### Overlaps (Samurai Mode)
Overlap cells are **shared objects** between boards:
- A[6-8][6-8] ↔ S[0-2][0-2]
- B[6-8][0-2] ↔ S[0-2][6-8]
- C[0-2][6-8] ↔ S[6-8][0-2]
- D[0-2][0-2] ↔ S[6-8][6-8]

### Solving Algorithm
1. **Constraint Propagation**
   - Find cells with only one possible candidate
   - Fill all naked singles iteratively

2. **Backtracking Search**
   - Select cell with minimum remaining values (MRV heuristic)
   - Try each candidate value
   - Recurse with constraint propagation
   - Backtrack if invalid

## 🧪 Testing

### Built-in Self-Test
Click the "Self-test" button to run 26 automated tests:
- Data parsing and serialization
- Board initialization and overlaps
- Algorithm correctness
- UI integration
- Helper functions

### Test Files
- `tests/test-ui.js` - Automated UI testing script
- `tests/TEST-REPORT.md` - Comprehensive test documentation
- `tests/TEST-SUMMARY.md` - Quick test guide

## 📊 Performance

- **Solve Time:** 50-200ms (typical puzzle)
- **Grid Size:** 81 cells (Standard) or 369 distinct cells (Samurai)
- **Memory:** Lightweight modular app
- **Browser:** Works in all modern browsers

## 🎨 Visual Guide

### Samurai Grid Layout
```
┌─────────┐   ┌─────────┐
│    A    │   │    B    │
│         │   │         │
│      ┌──┼───┼──┐      │
│      │  │   │  │      │
└──────┼──┘   └──┼──────┘
       │    S    │
       │         │
┌──────┼──┐   ┌──┼──────┐
│      │  │   │  │      │
│      └──┼───┼──┘      │
│         │   │         │
│    C    │   │    D    │
└─────────┘   └─────────┘
```

### Color Coding
- **Main grids**: Light background
- **Overlapping center** (Samurai mode): Highlighted with subtle blue tint
- **Gap cells** (Samurai mode): Darker gray background (non-playable)

## 🔧 Technical Details

### Technologies
- Pure HTML5, CSS3, JavaScript (ES6+)
- No external dependencies
- No build process required
- Works offline

### Browser Compatibility
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Any ES6+ compliant browser

## 📚 Examples

### Standard Mode
The default mode starts with an empty 9×9 grid. Perfect for:
- Classic Sudoku puzzles
- Learning the interface
- Quick solving

### Samurai Mode
Switch to Samurai mode to solve the complex 5-grid puzzles. A complete example is available for testing.

## 🤝 Contributing

Feel free to:
- Fork and modify
- Create variants (different grid sizes, rules)
- Add features (hints, puzzle generator, etc.)
- Improve algorithms (better heuristics, pattern recognition)

## 📄 License

MIT License - Feel free to use, modify, and distribute.

## 🎓 Educational Use

Great for:
- Learning constraint satisfaction problems
- Understanding backtracking algorithms
- Studying Sudoku solving techniques
- Web development examples
- Algorithm visualization

## 🐛 Troubleshooting

### Puzzle Won't Solve
- Check for conflicts using "Validate"
- Ensure puzzle is valid and has a unique solution
- Some puzzles may take longer (>1 second)
- Make sure at least some values are entered

### Import Failed
- Verify exactly 9 lines per grid
- Each line must have exactly 9 characters
- Use only 0-9 or dots (.)
- No extra spaces or formatting

### Visual Issues
- Try refreshing the browser (Ctrl+R / Cmd+R)
- Check browser console for errors (F12)
- Ensure JavaScript is enabled
- Clear browser cache if needed

## 💡 Tips & Tricks

1. **Start with Standard Mode** - Get familiar with the interface
2. **Use Step-by-Step** for learning - See the logical progression
3. **Fill Singles First** - Quick way to make progress
4. **Undo/Redo** - Experiment without fear
5. **Export Often** - Save interesting puzzles
6. **Validate Frequently** - Catch mistakes early
7. **Switch Languages** - Use EN/NL buttons at top right

## 🔮 Recent Updates (v2.0.0)

✅ **New Features:**
- Standard 9×9 mode (now default)
- Dual-language support (English/Dutch)
- Mode toggle between Standard and Samurai
- Clear All button
- Empty grid validation
- Modular code structure (separated JS/translations)

✅ **Improvements:**
- Light theme for better readability
- Fixed grid bold lines for proper 3×3 boxes
- Text input overflow fixes
- Better code organization
- Enhanced user feedback

## 🔮 Future Enhancements

Potential additions (not yet implemented):
- [ ] Difficulty rating system
- [ ] Hint system with explanations
- [ ] Puzzle generator
- [ ] Timer and statistics
- [ ] Multiple themes
- [ ] Enhanced keyboard navigation
- [ ] URL-based puzzle sharing
- [ ] Mobile touch optimization
- [ ] Pattern detection explanations
- [ ] More language options

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Run the self-test to verify functionality
3. Check browser console for errors (F12)
4. Review test documentation in `tests/` folder

## 🌟 Credits

Created as a demonstration of constraint satisfaction problem solving using web technologies.

---

**Version:** 2.0.0  
**Last Updated:** October 24, 2025  
**Status:** Production Ready ✅

Enjoy solving Sudoku puzzles! 🎯
