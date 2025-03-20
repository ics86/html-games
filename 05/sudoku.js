// 数独生成和验证逻辑
let selectedCell = null;
let timerInterval = null;
let startTime = 0;
let isTimerRunning = false;

function updateTimer() {
    const now = Date.now();
    const elapsed = new Date(now - startTime);
    const minutes = String(elapsed.getUTCMinutes()).padStart(2, '0');
    const seconds = String(elapsed.getUTCSeconds()).padStart(2, '0');
    document.getElementById('timer').textContent = `${minutes}:${seconds}`;
}

function startTimer() {
    if (!isTimerRunning) {
        startTime = Date.now();
        isTimerRunning = true;
        timerInterval = setInterval(updateTimer, 1000);
    }
}

function generateSudoku() {
    // 初始化9x9数组
    const grid = Array(9).fill().map(() => Array(9).fill(0));
    
    // 递归填充数字
    function fillGrid(row, col) {
        if (row === 9) return true;
        if (col === 9) return fillGrid(row + 1, 0);
        
        const numbers = shuffle([1,2,3,4,5,6,7,8,9]);
        for (let num of numbers) {
            if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (fillGrid(row, col + 1)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }
    
    fillGrid(0, 0);
    
    // 挖空格子
    for (let i = 0; i < 30; i++) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        grid[row][col] = 0;
    }
    
    return grid;
}

function isValid(grid, row, col, num) {
    // 检查行和列
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
    }
    
    // 检查3x3宫格
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[startRow + i][startCol + j] === num) return false;
        }
    }
    return true;
}

function newGame() {
    if (timerInterval) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
    document.getElementById('timer').textContent = '00:00';
    window.currentGrid = generateSudoku();
    const container = document.getElementById('sudoku-grid');
    container.innerHTML = '';
    
    window.currentGrid.forEach((row, i) => {
        row.forEach((num, j) => {
            const cell = document.createElement('div');
            cell.className = `sudoku-cell ${num !== 0 ? 'fixed' : ''}`;
            cell.textContent = num !== 0 ? num : '';
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => selectCell(cell));
            container.appendChild(cell);
        });
    });
}

function selectCell(cell) {
    if (cell.classList.contains('fixed')) return;
    selectedCell?.classList.remove('selected');
    selectedCell = cell;
    cell.classList.add('selected');
}

function fillNumber(n) {
    if (!selectedCell) return;
    startTimer();
    selectedCell.textContent = n;
}

function checkSolution() {
    if (timerInterval) {
        clearInterval(timerInterval);
        isTimerRunning = false;
    }
    const cells = document.getElementsByClassName('sudoku-cell');
    const messageEl = document.getElementById('message');
    
    let valid = true;
    Array.from(cells).forEach(cell => {
        if (cell.classList.contains('fixed')) return;
        const num = parseInt(cell.textContent) || 0;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        if (!isValid(window.currentGrid, row, col, num)) {
            valid = false;
            cell.style.backgroundColor = '#ffebee';
        } else {
            cell.style.backgroundColor = '#e8f5e9';
        }
    });
    
    if (valid) {
        Array.from(cells).forEach(cell => {
            cell.style.backgroundColor = '';
        });
    }
    
    messageEl.textContent = valid ? '恭喜，答案正确！' : '存在错误，请检查！';
}

// 辅助函数
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 初始化游戏
newGame();

// 添加键盘事件监听
document.addEventListener('keydown', (e) => {
    if (!selectedCell || selectedCell.classList.contains('fixed')) return;
    
    const keyValue = parseInt(e.key.replace(/[^0-9]/g, ''));
    if (keyValue >= 1 && keyValue <= 9) {
        fillNumber(keyValue);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
        selectedCell.textContent = '';
    }
});