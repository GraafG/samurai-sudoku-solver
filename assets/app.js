/*
  Sudoku Solver (Standard 9×9 and Samurai modes)
  - Mode: Standard (single 9x9) or Samurai (5 overlapping 9x9)
  - Multilingual: Dutch and English
  - Import/export text format
*/

let currentLang = 'en';
let currentMode = 'standard'; // 'standard' or 'samurai'

// Detect browser language
function detectLanguage() {
  const browserLang = navigator.language || navigator.userLanguage;
  return browserLang.startsWith('nl') ? 'nl' : 'en';
}

// Translate text
function t(key, replacements = {}) {
  let text = translations[currentLang][key] || key;
  for (const [k, v] of Object.entries(replacements)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

// Update all translations
function updateTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.getElementById('app-title').textContent = t('app-title');
  document.getElementById('mode-standard-text').textContent = t('mode-standard-text');
  document.getElementById('mode-samurai-text').textContent = t('mode-samurai-text');
  document.getElementById('legend-main').textContent = t('legend-main');
  document.getElementById('legend-overlap').textContent = t('legend-overlap');
}

// Switch language
function setLanguage(lang) {
  currentLang = lang;
  updateTranslations();
  document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('lang-' + lang).classList.add('active');
}

// Switch mode
function setMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('mode-' + mode).classList.add('active');
  
  const gridEl = document.getElementById('grid');
  const legendEl = document.getElementById('legend-area');
  const textInputArea = document.getElementById('text-input-area');
  const standardInputArea = document.getElementById('standard-input-area');
  const samuraiInputs = textInputArea.querySelectorAll('.pair, #txtS').length > 0 ? 
    Array.from(textInputArea.querySelectorAll('.pair')).concat([textInputArea.querySelector('.block:has(#txtS)')]) : [];
  
  if (mode === 'standard') {
    gridEl.className = 'standard';
    legendEl.style.display = 'none';
    samuraiInputs.forEach(el => el.style.display = 'none');
    standardInputArea.style.display = 'block';
  } else {
    gridEl.className = 'samurai';
    legendEl.style.display = 'flex';
    samuraiInputs.forEach(el => el.style.display = '');
    standardInputArea.style.display = 'none';
  }
  
  // Rebuild the grid
  initBoards();
  buildUI();
}

const boards = {};

class Cell {
  constructor(val = 0) {
    this.v = Number(val) || 0; // 0 = leeg
    this.memberships = [];      // lijst van {board,r,c}
    this.el = null;             // gekoppeld input element
    this.fixed = false;         // onthoud oorspronkelijke startwaarden
  }
}

class Board {
  constructor(name) {
    this.name = name;
    this.cells = Array.from({length:9}, _ => Array.from({length:9}, _ => new Cell()));
  }
  forEach(cb){ for(let r=0;r<9;r++) for(let c=0;c<9;c++) cb(this.cells[r][c], r, c); }
}

function initBoards(){
  // Clear existing boards
  for (const key in boards) delete boards[key];
  
  if (currentMode === 'standard') {
    // Single 9x9 board
    boards.A = new Board('A');
    boards.A.forEach((cell,r,c)=> cell.memberships.push({board:boards.A, r, c}));
  } else {
    // Samurai mode: 5 overlapping boards
    boards.A = new Board('A');
    boards.B = new Board('B');
    boards.C = new Board('C');
    boards.D = new Board('D');
    boards.S = new Board('S'); // Ster

    // koppel memberships
    for (const key of Object.keys(boards)){
      const b = boards[key];
      b.forEach((cell,r,c)=> cell.memberships.push({board:b, r, c}));
    }

    // Overlap-koppelingen: laat hoekcellen verwijzen naar dezelfde Cell als de Ster
    // A lr 3x3 -> S ul 3x3
    for(let r=6;r<9;r++) for(let c=6;c<9;c++) linkCell(boards.A, r, c, boards.S, r-6, c-6);
    // B ll 3x3 -> S ur 3x3
    for(let r=6;r<9;r++) for(let c=0;c<3;c++) linkCell(boards.B, r, c, boards.S, r-6, c+6);
    // C ur 3x3 -> S ll 3x3
    for(let r=0;r<3;r++) for(let c=6;c<9;c++) linkCell(boards.C, r, c, boards.S, r+6, c-6);
    // D ul 3x3 -> S lr 3x3
    for(let r=0;r<3;r++) for(let c=0;c<3;c++) linkCell(boards.D, r, c, boards.S, r+6, c+6);
  }
}

function linkCell(b1, r1, c1, b2, r2, c2){
  const shared = b2.cells[r2][c2];
  // vervang verwijzing en voeg membership toe zodat de cel ook regels van b1 volgt
  b1.cells[r1][c1] = shared;
  shared.memberships.push({board:b1, r:r1, c:c1});
}

// Kandidaten voor 1 cel: intersectie van wat in elke betrokken board kan
function candidates(cell){
  let allowed = new Set([1,2,3,4,5,6,7,8,9]);
  for(const m of cell.memberships){
    const b = m.board; const r = m.r; const c = m.c;
    // verwijder alles wat al in rij, kolom of box staat
    for(let i=0;i<9;i++){
      const vr = b.cells[r][i].v; if(vr) allowed.delete(vr);
      const vc = b.cells[i][c].v; if(vc) allowed.delete(vc);
    }
    const br = Math.floor(r/3)*3, bc = Math.floor(c/3)*3;
    for(let rr=br; rr<br+3; rr++) for(let cc=bc; cc<bc+3; cc++){
      const vb = b.cells[rr][cc].v; if(vb) allowed.delete(vb);
    }
  }
  return [...allowed];
}

function isValidAll(){
  // controleer alle borden op dubbele waarden
  const all = Object.values(boards);
  for(const b of all){
    // rijen en kolommen
    for(let i=0;i<9;i++){
      if(!noDup(b.cells[i].map(c=>c.v))) return false;
      const col = []; for(let r=0;r<9;r++) col.push(b.cells[r][i].v);
      if(!noDup(col)) return false;
    }
    // boxen
    for(let br=0;br<9;br+=3){
      for(let bc=0;bc<9;bc+=3){
        const arr=[]; for(let r=br;r<br+3;r++) for(let c=bc;c<bc+3;c++) arr.push(b.cells[r][c].v);
        if(!noDup(arr)) return false;
      }
    }
  }
  return true;
}
function noDup(arr){
  const s=new Set();
  for(const v of arr){ if(v===0) continue; if(s.has(v)) return false; s.add(v); }
  return true;
}

function getAllDistinctCells(){
  const set = new Set();
  for(const b of Object.values(boards)){
    b.forEach(cell => set.add(cell));
  }
  return [...set];
}

function fillSingles(){
  let progress=false;
  const cells=getAllDistinctCells();
  for(const cell of cells){
    if(cell.v) continue;
    const cand=candidates(cell);
    if(cand.length===1){ cell.v=cand[0]; progress=true; }
  }
  return progress;
}

function solveBacktrack(){
  // snelle propagation tot stilstand
  while(fillSingles()){}
  const cells=getAllDistinctCells();
  const empties=cells.filter(c=>!c.v);
  if(empties.length===0) return true;
  // kies cel met minste kandidaten
  let best=null, bestCand=null;
  for(const cell of empties){
    const cand=candidates(cell);
    if(cand.length===0) return false;
    if(!best || cand.length<bestCand.length){ best=cell; bestCand=cand; if(cand.length===2) break; }
  }
  for(const val of bestCand){
    best.v=val;
    if(isValidAll() && solveBacktrack()) return true;
    best.v=0;
  }
  return false;
}

// UI bouw: 21x21 global grid for Samurai or 9x9 for Standard
const gridEl = document.getElementById('grid');
let globalCells = []; // 21x21 or 9x9 references to Cell or null

function buildUI(){
  gridEl.innerHTML = '';
  
  if (currentMode === 'standard') {
    // Build 9x9 standard grid
    globalCells = Array.from({length:9}, _ => Array(9).fill(null));
    for(let r=0;r<9;r++){
      for(let c=0;c<9;c++){
        const cellObj = boards.A.cells[r][c];
        const cellDiv = document.createElement('div');
        cellDiv.className = 'cell';
        
        // Thick lines at 3x3 box boundaries (after cells 2, 5)
        const vline = (c === 3 || c === 6);
        const hline = (r === 3 || r === 6);
        const cross = vline && hline;
        if(vline) cellDiv.dataset.vline = 'true';
        if(hline) cellDiv.dataset.hline = 'true';
        if(cross) cellDiv.dataset.cross = 'true';

        const input = document.createElement('input');
        input.inputMode = 'numeric';
        input.maxLength = 1;
        input.placeholder = '';
        input.addEventListener('input', (e)=>{
          const val = e.target.value.replace(/[^1-9]/g,'');
          e.target.value = val;
          cellObj.v = val ? Number(val) : 0;
        });
        cellObj.el = input;
        applyCellToInput(cellObj);
        cellDiv.appendChild(input);
        gridEl.appendChild(cellDiv);
        globalCells[r][c] = cellObj;
      }
    }
  } else {
    // Build 21x21 Samurai grid
    globalCells = Array.from({length:21}, _ => Array(21).fill(null));
    for(let r=0;r<21;r++){
      for(let c=0;c<21;c++){
        const cellObj = cellAtGlobal(r,c); // Cell or null
        const cellDiv = document.createElement('div');
        if(!cellObj){
          cellDiv.className = 'gap';
          gridEl.appendChild(cellDiv);
          continue;
        }
        cellDiv.className = 'cell';
        
        // Bold lines at 3x3 box boundaries within each 9x9 block
        // Determine which 9x9 block this cell belongs to and its local position
        let localR = -1, localC = -1;
        
        // Map global coordinates to local 9x9 coordinates
        if (r >= 0 && r < 9 && c >= 0 && c < 9) {
          // Block A (top-left)
          localR = r; localC = c;
        } else if (r >= 0 && r < 9 && c >= 12 && c < 21) {
          // Block B (top-right)
          localR = r; localC = c - 12;
        } else if (r >= 12 && r < 21 && c >= 0 && c < 9) {
          // Block C (bottom-left)
          localR = r - 12; localC = c;
        } else if (r >= 12 && r < 21 && c >= 12 && c < 21) {
          // Block D (bottom-right)
          localR = r - 12; localC = c - 12;
        } else if (r >= 6 && r < 15 && c >= 6 && c < 15) {
          // Block S (center)
          localR = r - 6; localC = c - 6;
        }
        
        // Apply bold lines based on 3x3 box boundaries in local coordinates (after cells 2, 5)
        const vline = (localC === 3 || localC === 6);
        const hline = (localR === 3 || localR === 6);
        const cross = vline && hline;
        
        if(vline) cellDiv.dataset.vline = 'true';
        if(hline) cellDiv.dataset.hline = 'true';
        if(cross) cellDiv.dataset.cross = 'true';

        // overlap highlight
        if(r>=6 && r<=14 && c>=6 && c<=14) cellDiv.classList.add('overlap');

        const input = document.createElement('input');
        input.inputMode = 'numeric';
        input.maxLength = 1; 
        input.placeholder = '';
        input.addEventListener('input', (e)=>{
          const val = e.target.value.replace(/[^1-9]/g,'');
          e.target.value = val;
          cellObj.v = val ? Number(val) : 0;
        });
        cellObj.el = input;
        applyCellToInput(cellObj);
        cellDiv.appendChild(input);
        gridEl.appendChild(cellDiv);
        globalCells[r][c] = cellObj;
      }
    }
  }
}

function cellAtGlobal(r,c){
  // ster voorrang zodat overlap 1 object blijft
  if(r>=6 && r<15 && c>=6 && c<15) return boards.S.cells[r-6][c-6];
  if(r>=0 && r<9 && c>=0 && c<9) return boards.A.cells[r][c];
  if(r>=0 && r<9 && c>=12 && c<21) return boards.B.cells[r][c-12];
  if(r>=12 && r<21 && c>=0 && c<9) return boards.C.cells[r-12][c];
  if(r>=12 && r<21 && c>=12 && c<21) return boards.D.cells[r-12][c-12];
  return null;
}

function applyCellToInput(cell){
  if(!cell || !cell.el) return;
  cell.el.value = cell.v ? String(cell.v) : '';
  cell.el.readOnly = cell.fixed; // startpos niet per se readOnly, maar handig voor zichtbaarheid
  cell.el.style.opacity = cell.fixed ? .9 : 1;
}

function syncAllInputs(){
  const cells = getAllDistinctCells();
  for(const c of cells) applyCellToInput(c);
}

function clearAll(){
  for(const b of Object.values(boards)) b.forEach(cell=>{ if(!cell.fixed) cell.v=0; });
  syncAllInputs();
}

function clearEverything(){
  for(const b of Object.values(boards)) b.forEach(cell=>{ cell.v=0; cell.fixed=false; });
  syncAllInputs();
}

function resetAll(){
  for(const b of Object.values(boards)) b.forEach(cell=>{ cell.v = cell.fixed ? cell.v : 0; });
  syncAllInputs();
}

function setFixedFromCurrent(){
  for(const b of Object.values(boards)) b.forEach(cell=> cell.fixed = !!cell.v);
}

// Historie en stap-voor-stap
let history = []; // array van diffs
let redoStack = [];

function snapshotState(){
  const cells = getAllDistinctCells();
  return cells.map(c => c.v);
}
function diffStates(before, after){
  const cells = getAllDistinctCells();
  const diffs = [];
  for(let i=0;i<cells.length;i++) if(before[i] !== after[i]) diffs.push({cell: cells[i], prev: before[i], next: after[i]});
  return diffs;
}
function applyDiff(diff, reverse=false){
  for(const d of diff){ d.cell.v = reverse ? d.prev : d.next; }
  syncAllInputs();
}
function withHistory(action){
  const snap = snapshotState();
  const ok = action();
  const diff = diffStates(snap, snapshotState());
  if(diff.length){ history.push(diff); redoStack = []; }
  return ok;
}

function stepOnce(){
  // zoek een cel met precies 1 kandidaat
  const cells = getAllDistinctCells().filter(c=>!c.v);
  let target = null, cand = null;
  for(const cell of cells){
    const c = candidates(cell);
    if(c.length === 1){ target = cell; cand = c; break; }
  }
  if(!target){ return false; }
  target.v = cand[0];
  return true;
}
function fillAllSingles(){
  let did=false, loop=0;
  while(fillSingles()){ did=true; if(++loop>400) break; }
  return did;
}

// Import en export
function parseBlock(text){
  const lines = text.trim().split(/\n+/);
  if(lines.length !== 9) throw new Error('blok verwacht 9 regels');
  const grid = lines.map(line => {
    const cleaned = line.replace(/[^0-9.]/g,'');
    if(cleaned.length !== 9) throw new Error('regel heeft geen 9 tekens');
    return cleaned.split('').map(ch => ch==='.'?0:Number(ch));
  });
  return grid;
}

function loadFromTextareas(){
  try{
    if (currentMode === 'standard') {
      const gA = parseBlock(document.getElementById('txtStandard').value || '');
      boards.A.forEach((cell,r,c)=> cell.v = gA[r][c]);
    } else {
      const gA = parseBlock(document.getElementById('txtA').value || '');
      const gB = parseBlock(document.getElementById('txtB').value || '');
      const gC = parseBlock(document.getElementById('txtC').value || '');
      const gD = parseBlock(document.getElementById('txtD').value || '');
      const gS = parseBlock(document.getElementById('txtS').value || '');
      // Vul
      boards.A.forEach((cell,r,c)=> cell.v = gA[r][c]);
      boards.B.forEach((cell,r,c)=> cell.v = gB[r][c]);
      boards.C.forEach((cell,r,c)=> cell.v = gC[r][c]);
      boards.D.forEach((cell,r,c)=> cell.v = gD[r][c]);
      boards.S.forEach((cell,r,c)=> cell.v = gS[r][c]);
    }
    setFixedFromCurrent();
    syncAllInputs();
    setStatus(t('status-imported'));
  }catch(e){ setStatus(t('error-import', {msg: e.message}), true); }
}

function exportToTextareas(){
  const dump = b => boards[b].cells.map(row => row.map(c=>c.v||0).join('')).join('\n');
  if (currentMode === 'standard') {
    document.getElementById('txtStandard').value = dump('A');
  } else {
    document.getElementById('txtA').value = dump('A');
    document.getElementById('txtB').value = dump('B');
    document.getElementById('txtC').value = dump('C');
    document.getElementById('txtD').value = dump('D');
    document.getElementById('txtS').value = dump('S');
  }
  setStatus(t('status-exported'));
}

function setStatus(msg, error=false){
  const el = document.getElementById('status');
  el.textContent = msg;
  el.style.color = error ? 'var(--err)' : 'var(--muted)';
}

// Bestandsopslag en tekstformaat
function dumpBlock(b){ return boards[b].cells.map(row=>row.map(c=>c.v||0).join('')).join('\n'); }
function exportAllString(){
  return (
    'A\n' + dumpBlock('A') + '\n\n' +
    'B\n' + dumpBlock('B') + '\n\n' +
    'C\n' + dumpBlock('C') + '\n\n' +
    'D\n' + dumpBlock('D') + '\n\n' +
    'S\n' + dumpBlock('S') + '\n'
  );
}
function download(filename, text){
  try{
    const blob = new Blob([text], {type: 'text/plain;charset=utf-8'});
    if(window.navigator && window.navigator.msSaveOrOpenBlob){
      window.navigator.msSaveOrOpenBlob(blob, filename);
      return true;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 0);
    return true;
  }catch(e){
    return false;
  }
}
async function copyToClipboard(text){
  try{
    if(navigator.clipboard && navigator.clipboard.writeText){
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position='fixed'; ta.style.opacity='0';
    document.body.appendChild(ta); ta.focus(); ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  }catch{ return false; }
}
function parseFileText(text){
  const lines = text.split(/\r?\n/).map(l=>l.trim());
  const nine = lines.filter(l=>/^[0-9.]{9}$/.test(l));
  if(nine.length === 45){
    const blocks = {A:[],B:[],C:[],D:[],S:[]};
    const keys = ['A','B','C','D','S'];
    for(let k=0;k<5;k++) blocks[keys[k]] = nine.slice(k*9,(k+1)*9).join('\n');
    return blocks;
  }
  throw new Error('Kon geen 45 regels van 9 tekens vinden.');
}

// Demo: vul met het voorbeeld van de vraag
function seedExample(){
  const A=`008000009\n000000200\n000005060\n000060040\n002003070\n067010052\n094050087\n080190004\n050004001`;
  const B=`000000000\n060090000\n740050001\n000000000\n520004603\n100000280\n201030800\n607980020\n400007039`;
  const C=`072081065\n091000030\n506430100\n700650010\n000090500\n000000003\n040000620\n200010050\n000200000`;
  const D=`080507009\n009030502\n002800030\n300900801\n026018750\n005040000\n400050060\n001600905\n000000000`;
  const S=`087004201\n004108607\n001060400\n006030070\n040700800\n000000300\n065070080\n030400009\n100000002`;
  document.getElementById('txtA').value=A;
  document.getElementById('txtB').value=B;
  document.getElementById('txtC').value=C;
  document.getElementById('txtD').value=D;
  document.getElementById('txtS').value=S;
}

// Self tests
function runSelfTests(){
  const results = [];
  const assert = (name, cond) => results.push({name, ok: !!cond});

  // Test 1: parseBlock valid
  let ok1=false; try{ const g=parseBlock('123456789\n000000000\n000000000\n000000000\n000000000\n000000000\n000000000\n000000000\n000000000'); ok1 = g.length===9 && g[0][0]===1; }catch(e){ ok1=false; }
  assert('parseBlock valid 9x9', ok1);

  // Test 2: parseBlock invalid line count
  let ok2=false; try{ parseBlock('000000000\n000000000'); }catch(e){ ok2=true; }
  assert('parseBlock rejects wrong line count', ok2);

  // Test 3: dumpBlock returns 9 lines of 9 chars
  const dumpA = dumpBlock('A');
  const linesA = dumpA.split(/\n/);
  assert('dumpBlock has 9 lines', linesA.length===9);
  assert('each line 9 chars', linesA.every(l=>/^\d{9}$/.test(l)));

  // Test 4: export + parse roundtrip
  let ok4=false; try{ const txt=exportAllString(); const b=parseFileText(txt); ok4 = ['A','B','C','D','S'].every(k=>/^([0-9.]{9}\n){8}[0-9.]{9}$/.test(b[k])); }catch(e){ ok4=false; }
  assert('exportAllString roundtrip via parseFileText', ok4);

  // Test 5: Board initialization
  assert('5 boards created', Object.keys(boards).length === 5);
  assert('Board A has 9x9 cells', boards.A.cells.length === 9 && boards.A.cells[0].length === 9);

  // Test 6: Overlap cells are shared
  const cellAS = boards.A.cells[6][6];
  const cellS0 = boards.S.cells[0][0];
  assert('A[6][6] === S[0][0] (overlap)', cellAS === cellS0);
  assert('Overlap cell has multiple memberships', cellAS.memberships.length > 1);

  // Test 7: Candidates function
  clearAll();
  boards.A.cells[0][0].v = 1;
  const cand = candidates(boards.A.cells[0][1]);
  assert('Candidates exclude row values', !cand.includes(1));

  // Test 8: Validation detects duplicates
  clearAll();
  boards.A.cells[0][0].v = 5;
  boards.A.cells[0][1].v = 5; // duplicate in row
  assert('isValidAll detects row duplicates', !isValidAll());
  clearAll();

  // Test 9: Clear function
  boards.A.cells[0][0].v = 9;
  boards.A.cells[0][0].fixed = false;
  clearAll();
  assert('clearAll clears non-fixed cells', boards.A.cells[0][0].v === 0);

  // Test 10: Reset function preserves fixed cells
  boards.B.cells[0][0].v = 7;
  boards.B.cells[0][0].fixed = true;
  boards.B.cells[0][1].v = 3;
  boards.B.cells[0][1].fixed = false;
  resetAll();
  assert('resetAll preserves fixed cells', boards.B.cells[0][0].v === 7);
  assert('resetAll clears non-fixed cells', boards.B.cells[0][1].v === 0);

  // Test 11: UI grid has correct dimensions
  assert('Grid contains 441 divs (21x21)', gridEl.children.length === 441);

  // Test 12: Cell elements are linked
  const distinctCells = getAllDistinctCells();
  const cellsWithElements = distinctCells.filter(c => c.el !== null);
  assert('All distinct cells have input elements', cellsWithElements.length === distinctCells.length);

  // Test 13: Singles filling works
  clearAll();
  boards.A.cells[0][0].v = 1;
  boards.A.cells[0][1].v = 2;
  boards.A.cells[0][2].v = 3;
  boards.A.cells[0][3].v = 4;
  boards.A.cells[0][4].v = 5;
  boards.A.cells[0][5].v = 6;
  boards.A.cells[0][6].v = 7;
  boards.A.cells[0][7].v = 8;
  // Now [0][8] must be 9
  const progress = fillSingles();
  assert('fillSingles finds naked singles', progress && boards.A.cells[0][8].v === 9);

  // Test 14: Snapshot and diff work
  clearAll();
  const snap1 = snapshotState();
  boards.C.cells[0][0].v = 5;
  const snap2 = snapshotState();
  const diff = diffStates(snap1, snap2);
  assert('diffStates captures changes', diff.length > 0);

  // Test 15: History tracking
  clearAll();
  history = [];
  redoStack = [];
  withHistory(() => { boards.D.cells[0][0].v = 4; return true; });
  assert('withHistory records changes', history.length === 1);

  // Test 16: Gap cells detection
  const gapCount = Array.from(gridEl.children).filter(el => el.className === 'gap').length;
  assert('Grid has gap cells', gapCount > 0);

  // Test 17: Overlap highlighting
  const overlapCells = Array.from(gridEl.querySelectorAll('.overlap'));
  assert('Overlap cells are marked', overlapCells.length === 81); // 9x9 center

  // Test 18: Input validation
  clearAll();
  const testCell = boards.A.cells[1][1];
  testCell.el.value = '5';
  testCell.el.dispatchEvent(new Event('input'));
  assert('Input updates cell value', testCell.v === 5);

  // Test 19: noDup function
  assert('noDup allows zeros', noDup([0, 0, 0, 1, 2, 3]));
  assert('noDup detects duplicates', !noDup([1, 2, 3, 3, 4]));
  assert('noDup passes unique values', noDup([1, 2, 3, 4, 5]));

  // Test 20: getAllDistinctCells count
  const distinctCount = getAllDistinctCells().length;
  assert('Correct distinct cell count', distinctCount === 369); // 5*81 - 12 overlaps = 405-36 = 369

  // Restore state
  clearAll();
  seedExample();
  loadFromTextareas();

  const passed = results.filter(r=>r.ok).length;
  const failed = results.length - passed;
  return {passed, failed, results};
}

// Event handlers
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('btn-import').addEventListener('click', ()=>{ loadFromTextareas(); });
  document.getElementById('btn-export').addEventListener('click', ()=>{ exportToTextareas(); });
  document.getElementById('btn-clear').addEventListener('click', ()=>{ clearAll(); setStatus(t('status-cleared')); });
  document.getElementById('btn-clearall').addEventListener('click', ()=>{ clearEverything(); setStatus(t('status-cleared-all')); });
  document.getElementById('btn-reset').addEventListener('click', ()=>{ resetAll(); setStatus(t('status-reset')); });
  document.getElementById('btn-validate').addEventListener('click', ()=>{
    setStatus(isValidAll() ? t('status-valid') : t('status-invalid'), !isValidAll());
  });
  document.getElementById('btn-solve').addEventListener('click', ()=>{
    // Check if grid has any values
    const cells = getAllDistinctCells();
    const hasValues = cells.some(c => c.v !== 0);
    if (!hasValues) {
      setStatus(t('error-empty-grid'), true);
      return;
    }
    const t0 = performance.now();
    const ok = withHistory(()=> solveBacktrack());
    const t1 = performance.now();
    syncAllInputs();
    setStatus(ok ? t('status-solved', {time: (t1-t0).toFixed(1)}) : t('status-no-solution'), !ok);
  });
  document.getElementById('btn-step').addEventListener('click', ()=>{
    const ok = withHistory(()=> stepOnce());
    syncAllInputs();
    setStatus(ok ? t('status-step') : t('status-no-step'));
  });
  document.getElementById('btn-singles').addEventListener('click', ()=>{
    const ok = withHistory(()=> fillAllSingles());
    syncAllInputs();
    setStatus(ok ? t('status-singles') : t('status-no-singles'));
  });
  document.getElementById('btn-undo').addEventListener('click', ()=>{
    if(!history.length){ setStatus(t('status-no-undo')); return; }
    const diff = history.pop();
    redoStack.push(diff);
    applyDiff(diff, true);
    setStatus(t('status-undo'));
  });
  document.getElementById('btn-redo').addEventListener('click', ()=>{
    if(!redoStack.length){ setStatus(t('status-no-redo')); return; }
    const diff = redoStack.pop();
    history.push(diff);
    applyDiff(diff, false);
    setStatus(t('status-redo'));
  });
  document.getElementById('btn-save').addEventListener('click', async ()=>{
    exportToTextareas();
    const text = exportAllString();
    const ok = download('samurai-sudoku.txt', text);
    if(ok){ setStatus('Bestand opgeslagen.'); return; }
    const out = document.getElementById('exportOut');
    const wrap = document.getElementById('exportWrap');
    out.value = text; wrap.open = true;
    const copied = await copyToClipboard(text);
    setStatus(copied ? 'Kon niet downloaden, tekst naar klembord gekopieerd.' : 'Kon niet downloaden, tekst hieronder staat klaar om te kopiëren.', true);
  });
  document.getElementById('btn-loadfile').addEventListener('click', ()=> document.getElementById('fileLoad').click());
  document.getElementById('fileLoad').addEventListener('change', async (e)=>{
    const file = e.target.files && e.target.files[0];
    if(!file) return;
    const text = await file.text();
    try{
      const blocks = parseFileText(text);
      document.getElementById('txtA').value = blocks.A;
      document.getElementById('txtB').value = blocks.B;
      document.getElementById('txtC').value = blocks.C;
      document.getElementById('txtD').value = blocks.D;
      document.getElementById('txtS').value = blocks.S;
      loadFromTextareas();
      setStatus('Bestand geladen.');
    }catch(err){ setStatus('Fout bij laden: '+err.message, true); }
    finally{ e.target.value=''; }
  });
  document.getElementById('btn-test').addEventListener('click', ()=>{
    const {passed, failed, results} = runSelfTests();
    setStatus(t('status-test', {passed, failed}), failed>0);
    console.log('=== SUDOKU SOLVER TEST RESULTS ===');
    console.table(results);
    
    // Create detailed output
    let output = '=== Test Results ===\n\n';
    results.forEach((r, i) => {
      output += `${i+1}. ${r.ok ? '✓' : '✗'} ${r.name}\n`;
    });
    output += `\nTotal: ${passed}/${results.length} passed`;
    
    const exportOut = document.getElementById('exportOut');
    const exportWrap = document.getElementById('exportWrap');
    exportOut.value = output;
    exportWrap.open = true;
  });

  // Language switchers
  document.getElementById('lang-nl').addEventListener('click', () => setLanguage('nl'));
  document.getElementById('lang-en').addEventListener('click', () => setLanguage('en'));

  // Mode switchers
  document.getElementById('mode-standard').addEventListener('click', () => setMode('standard'));
  document.getElementById('mode-samurai').addEventListener('click', () => setMode('samurai'));

  // Boot
  currentLang = detectLanguage();
  setLanguage(currentLang);
  currentMode = 'standard'; // Default to standard mode
  initBoards();
  buildUI();
  // Only load example in samurai mode
  if (currentMode === 'samurai') {
    seedExample();
    loadFromTextareas();
  }
});
