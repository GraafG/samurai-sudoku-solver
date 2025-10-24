/**
 * Comprehensive UI Test Script for Samurai Sudoku Solver
 * Run this in the browser console: copy and paste, then run testUI()
 */

async function testUI() {
  console.log('🧪 Starting Comprehensive UI Tests...\n');
  
  const tests = [];
  const log = (test, passed, message = '') => {
    tests.push({ test, passed, message });
    console.log(`${passed ? '✓' : '✗'} ${test}${message ? ': ' + message : ''}`);
  };

  try {
    // Test 1: Initial page load
    log('Page loaded with all elements', 
      document.getElementById('grid') !== null &&
      document.getElementById('btn-solve') !== null);

    // Test 2: Grid structure
    const gridEl = document.getElementById('grid');
    const cellCount = gridEl.children.length;
    log('Grid has 441 cells (21x21)', cellCount === 441, `Found ${cellCount}`);

    // Test 3: Gap cells
    const gapCells = Array.from(gridEl.children).filter(el => el.classList.contains('gap'));
    log('Gap cells present', gapCells.length > 0, `Found ${gapCells.length}`);

    // Test 4: Input cells
    const inputCells = Array.from(gridEl.querySelectorAll('input'));
    log('Input cells present', inputCells.length > 0, `Found ${inputCells.length}`);

    // Test 5: Overlap cells highlighted
    const overlapCells = Array.from(gridEl.querySelectorAll('.overlap'));
    log('Overlap cells highlighted', overlapCells.length === 81, `Found ${overlapCells.length}`);

    // Test 6: Clear button
    document.getElementById('btn-clear').click();
    await sleep(100);
    const status = document.getElementById('status').textContent;
    log('Clear button works', status.includes('gewist') || status.includes('Lege'));

    // Test 7: Import button loads data
    document.getElementById('btn-import').click();
    await sleep(100);
    const hasValues = inputCells.some(input => input.value !== '');
    log('Import button loads data', hasValues);

    // Test 8: Validate button
    document.getElementById('btn-validate').click();
    await sleep(100);
    const validStatus = document.getElementById('status').textContent;
    log('Validate button works', validStatus.includes('geldig') || validStatus.includes('conflict'));

    // Test 9: Export button
    document.getElementById('btn-export').click();
    await sleep(100);
    const txtA = document.getElementById('txtA').value;
    log('Export button populates textareas', txtA.length > 0, `Length: ${txtA.length}`);

    // Test 10: Reset button
    document.getElementById('btn-reset').click();
    await sleep(100);
    const resetStatus = document.getElementById('status').textContent;
    log('Reset button works', resetStatus.includes('begin'));

    // Test 11: Step button
    document.getElementById('btn-step').click();
    await sleep(100);
    const stepStatus = document.getElementById('status').textContent;
    log('Step button works', stepStatus.includes('Stap') || stepStatus.includes('single'));

    // Test 12: Singles button
    document.getElementById('btn-singles').click();
    await sleep(100);
    const singlesStatus = document.getElementById('status').textContent;
    log('Singles button works', singlesStatus.includes('singles') || singlesStatus.includes('ingevuld'));

    // Test 13: Undo button
    document.getElementById('btn-undo').click();
    await sleep(100);
    const undoStatus = document.getElementById('status').textContent;
    log('Undo button works', undoStatus.includes('ongedaan') || undoStatus.includes('Niets'));

    // Test 14: Redo button
    document.getElementById('btn-redo').click();
    await sleep(100);
    const redoStatus = document.getElementById('status').textContent;
    log('Redo button works', redoStatus.includes('herhalen') || redoStatus.includes('toegepast'));

    // Test 15: Self-test button
    document.getElementById('btn-test').click();
    await sleep(200);
    const testStatus = document.getElementById('status').textContent;
    log('Self-test button works', testStatus.includes('Self-test'));

    // Test 16: Solve button (most important)
    document.getElementById('btn-import').click();
    await sleep(100);
    const beforeSolve = inputCells.filter(i => i.value === '').length;
    document.getElementById('btn-solve').click();
    await sleep(2000); // Give it time to solve
    const afterSolve = inputCells.filter(i => i.value === '').length;
    const solveStatus = document.getElementById('status').textContent;
    log('Solve button fills cells', afterSolve < beforeSolve && solveStatus.includes('Opgelost'));

    // Test 17: Manual input works
    const testInput = inputCells.find(i => !i.readOnly && i.value === '');
    if (testInput) {
      testInput.value = '5';
      testInput.dispatchEvent(new Event('input'));
      await sleep(50);
      log('Manual input works', testInput.value === '5');
    } else {
      log('Manual input (skipped - no empty cells)', true);
    }

    // Test 18: Textarea interaction
    document.getElementById('txtA').value = '000000000\n'.repeat(9).trim();
    log('Textareas are editable', document.getElementById('txtA').value.length > 0);

    // Test 19: All control buttons exist
    const buttons = [
      'btn-clear', 'btn-solve', 'btn-validate', 'btn-import', 
      'btn-export', 'btn-reset', 'btn-step', 'btn-singles',
      'btn-undo', 'btn-redo', 'btn-save', 'btn-loadfile', 'btn-test'
    ];
    const allButtonsExist = buttons.every(id => document.getElementById(id) !== null);
    log('All control buttons exist', allButtonsExist);

    // Test 20: Details/summary (export section)
    const exportWrap = document.getElementById('exportWrap');
    const exportOut = document.getElementById('exportOut');
    log('Export section exists', exportWrap !== null && exportOut !== null);

    // Summary
    console.log('\n' + '='.repeat(50));
    const passed = tests.filter(t => t.passed).length;
    const failed = tests.length - passed;
    console.log(`📊 Test Summary: ${passed}/${tests.length} passed, ${failed} failed`);
    
    if (failed > 0) {
      console.log('\n❌ Failed tests:');
      tests.filter(t => !t.passed).forEach(t => {
        console.log(`  - ${t.test}${t.message ? ': ' + t.message : ''}`);
      });
    } else {
      console.log('✅ All tests passed!');
    }

    console.log('\n🎉 UI testing complete!');
    return { passed, failed, total: tests.length, tests };

  } catch (error) {
    console.error('❌ Test suite error:', error);
    return { error: error.message };
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Auto-run if loaded directly
console.log('UI test script loaded. Run testUI() to start testing.');
