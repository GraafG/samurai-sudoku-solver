# 🎯 Samurai Sudoku Solver - Quick Reference Card

## 🚀 Getting Started (30 seconds)
1. Open `index.html` in browser
2. Pre-loaded example ready to solve
3. Click "Los op" (Solve) to see solution
4. Or click "Volgende stap" (Next step) for hints

## 🎮 Main Controls

| NL Text | English | What It Does |
|---------|---------|-------------|
| **Leeg** | Clear | Removes all non-fixed values |
| **Los op** | Solve | Solves entire puzzle (~50-200ms) |
| **Controleer** | Validate | Checks for rule violations |
| **Volgende stap** | Next step | Shows one logical deduction |
| **Vul alle singles** | Fill singles | Fills obvious cells |
| **Undo** | Undo | Reverses last change |
| **Redo** | Redo | Reapplies undone change |
| **Herstel begin** | Reset | Back to starting clues |

## 📥 Import/Export

### Quick Import
1. Paste 9 lines × 9 chars into each text area (A, B, C, D, S)
2. Use `0` or `.` for empty cells
3. Click "Laad uit tekst"

### Quick Export
1. Click "Exporteer naar tekst"
2. Copy from text areas
3. Or click "Opslaan bestand" to download

## 🎨 Visual Guide

```
Legend (above grid):
┌─────────────────────────────────────┐
│ ■ Hoofdroosters    ■ Overlappend    │
│ (corners)          (center 9×9)     │
└─────────────────────────────────────┘

Grid Layout:
     A          B
      \  S  /
      /  S  \
     C          D
```

## ⚡ Keyboard Shortcuts
- Click cell + type `1-9`: Enter value
- `Tab`: Next cell
- `0` or `Delete`: Clear cell
- `Ctrl+Z` / `Cmd+Z`: Undo (via button)

## 🧪 Testing
- Click **"Self-test"** → Runs 26 automated tests
- Check console (F12) for detailed results

## 📝 Text Format Example

```
A (top-left):
008000009
000000200
000005060
000060040
002003070
067010052
094050087
080190004
050004001

(Repeat for B, C, D, S)
```

## ✅ Validation Rules
Each 9×9 grid must have:
- ✓ Digits 1-9 in each row
- ✓ Digits 1-9 in each column  
- ✓ Digits 1-9 in each 3×3 box
- ✓ Overlap cells satisfy BOTH grids

## 💾 File Format
Save/Load uses `.txt` with 5 blocks:
```
A
008000009
...

B
000000000
...

(etc.)
```

## 🐛 Common Issues

**Won't Solve?**
- Click "Controleer" to find conflicts
- Verify puzzle is valid
- Check for typos in input

**Import Failed?**
- Exactly 9 lines per grid
- Exactly 9 chars per line
- Only use 0-9 and dots

**Visual Problems?**
- Refresh browser (Ctrl+R)
- Clear cache
- Enable JavaScript

## 📊 Performance
- Typical solve: 50-200ms
- Hard puzzles: <2 seconds
- 369 cells (441 with gaps)
- Works offline

## 🎓 Learning Features
1. **Step-by-step**: See logic unfold
2. **Singles only**: Learn naked singles
3. **Undo/Redo**: Experiment safely
4. **Validation**: Catch mistakes early

## 🌟 Pro Tips
1. Use "Vul alle singles" first for quick progress
2. Export often to save interesting states
3. Use step-by-step mode to learn techniques
4. Validate frequently to avoid backtracking

## 📁 Files
- `index.html` - Main app (open this)
- `README.md` - Full documentation
- `test-ui.js` - Automated tests
- `TEST-*.md` - Test reports

## 🔗 Resources
- Full README: See `README.md`
- Visual updates: See `VISUAL-UPDATES.md`
- Test docs: See `TEST-REPORT.md`

## ⚙️ Technical
- Pure HTML/CSS/JS
- No dependencies
- No build required
- Works in all modern browsers
- Single file: ~750 lines

---

**Need Help?**
1. Run Self-test
2. Check README.md
3. Press F12 for console errors

**Version:** 1.0.0 | **Status:** Production Ready ✅
