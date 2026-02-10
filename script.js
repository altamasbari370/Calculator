const display = document.getElementById('display');
const buttons = document.querySelectorAll('.btn');
const equalsBtn = document.getElementById('equals');
const clearBtn = document.getElementById('clear');
const historyList = document.getElementById('history-list');
const clearHistoryBtn = document.getElementById('clear-history');
const themeSwitch = document.getElementById('theme-switch');
const logBtn = document.getElementById('log');
const percentBtn = document.getElementById('percent');

let currentInput = '';
let history = [];

// Update the display
function updateDisplay() {
  display.value = currentInput || '0';
}

// Add calculation to history (max 5 items)
function addToHistory(calc) {
  history.unshift(calc);
  if (history.length > 5) {
    history.pop();
  }
  renderHistory();
}

// Render history list
function renderHistory() {
  historyList.innerHTML = '';
  history.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    historyList.appendChild(li);
  });
}

// Clear history event
clearHistoryBtn.addEventListener('click', () => {
  history = [];
  renderHistory();
});

// Handle button clicks
buttons.forEach(button => {
  button.addEventListener('click', () => {
    const val = button.getAttribute('data-value');

    if (button.id === 'clear') {
      currentInput = '';
      updateDisplay();
    } else if (button.id === 'equals') {
      calculateResult();
    } else if (button.id === 'log') {
      applyLog();
    } else if (button.id === 'percent') {
      applyPercent();
    } else if (val !== null) {
      // Prevent multiple decimals in one number
      if (val === '.') {
        const parts = currentInput.split(/[\+\-\*\/]/);
        const lastPart = parts[parts.length - 1];
        if (lastPart.includes('.')) return;
      }
      currentInput += val;
      updateDisplay();
    }
  });
});

// Calculate the expression safely
function calculateResult() {
  if (!currentInput) return;

  try {
    const sanitized = currentInput.replace(/[^-()\d/*+.]/g, '');
    let result = Function(`"use strict"; return (${sanitized})`)();

    if (result === Infinity || result === -Infinity || isNaN(result)) {
      display.value = "Error";
      currentInput = '';
      return;
    }

    result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

    addToHistory(`${currentInput} = ${result}`);
    currentInput = result.toString();
    updateDisplay();
  } catch (e) {
    display.value = "Error";
    currentInput = '';
  }
}

// Apply log function to current input
function applyLog() {
  if (!currentInput) return;

  try {
    const sanitized = currentInput.replace(/[^-()\d/*+.]/g, '');
    let val = Function(`"use strict"; return (${sanitized})`)();

    if (val <= 0 || isNaN(val)) {
      display.value = "Error";
      currentInput = '';
      return;
    }

    let result = Math.log10(val);
    result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

    addToHistory(`log(${currentInput}) = ${result}`);
    currentInput = result.toString();
    updateDisplay();
  } catch (e) {
    display.value = "Error";
    currentInput = '';
  }
}

// Apply percentage function to current input
function applyPercent() {
  if (!currentInput) return;

  try {
    const sanitized = currentInput.replace(/[^-()\d/*+.]/g, '');
    let val = Function(`"use strict"; return (${sanitized})`)();

    if (isNaN(val)) {
      display.value = "Error";
      currentInput = '';
      return;
    }

    let result = val / 100;
    result = Math.round((result + Number.EPSILON) * 100000000) / 100000000;

    addToHistory(`${currentInput}% = ${result}`);
    currentInput = result.toString();
    updateDisplay();
  } catch (e) {
    display.value = "Error";
    currentInput = '';
  }
}

// Theme toggle handler
themeSwitch.addEventListener('change', () => {
  if (themeSwitch.checked) {
    document.body.classList.add('dark');
  } else {
    document.body.classList.remove('dark');
  }
});

// Keyboard input support
document.addEventListener('keydown', (e) => {
  const allowedKeys = '0123456789+-/*.'; // allowed characters

  if (allowedKeys.includes(e.key)) {
    // Prevent multiple decimals in last number segment
    if (e.key === '.') {
      const parts = currentInput.split(/[\+\-\*\/]/);
      const lastPart = parts[parts.length - 1];
      if (lastPart.includes('.')) return;
    }
    currentInput += e.key;
    updateDisplay();
  } else if (e.key === 'Enter' || e.key === '=') {
    e.preventDefault();
    calculateResult();
  } else if (e.key === 'Backspace') {
    currentInput = currentInput.slice(0, -1);
    updateDisplay();
  } else if (e.key === 'Escape') {
    currentInput = '';
    updateDisplay();
  } else if (e.key.toLowerCase() === 'l') {
    // log function triggered by 'l' key
    applyLog();
  } else if (e.key === '%') {
    applyPercent();
  }
});

// Initialize display and history
updateDisplay();
renderHistory();
