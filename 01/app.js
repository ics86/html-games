const GRID_SIZE = 10;
const MINES_COUNT = 10;

let grid = [];
let gameOver = false;
let firstClick = true;
let flagsCount = 0;
let timer = 0;
let timerInterval;

const gridElement = document.getElementById('grid');
const minesCountElement = document.getElementById('mines-count');
const resetBtn = document.getElementById('reset-btn');
const timeElement = document.getElementById('time');

function createGrid(firstClickX, firstClickY) {
    grid = Array(GRID_SIZE).fill().map(() => 
        Array(GRID_SIZE).fill().map(() => ({
            isMine: false,
            revealed: false,
            flagged: false,
            neighborMines: 0
        }))
    );

    // Place mines
    let minesPlaced = 0;
    while (minesPlaced < MINES_COUNT) {
        const x = Math.floor(Math.random() * GRID_SIZE);
        const y = Math.floor(Math.random() * GRID_SIZE);
        
        // Ensure first click position is safe
        if (firstClick && x === firstClickX && y === firstClickY) continue;
        
        if (!grid[x][y].isMine) {
            grid[x][y].isMine = true;
            minesPlaced++;
        }
    }

    // Calculate neighbor mines
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (!grid[x][y].isMine) {
                grid[x][y].neighborMines = countNeighborMines(x, y);
            }
        }
    }
}

function countNeighborMines(x, y) {
    let count = 0;
    for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < GRID_SIZE && ny >= 0 && ny < GRID_SIZE) {
                if (grid[nx][ny].isMine) count++;
            }
        }
    }
    return count;
}

function reveal(x, y) {
    if (x < 0 || x >= GRID_SIZE || y < 0 || y >= GRID_SIZE) return;
    const cell = grid[x][y];
    if (cell.revealed || cell.flagged) return;

    cell.revealed = true;
    
    if (cell.isMine) {
        gameOver = true;
        showAllMines();
        alert('游戏结束！你踩到雷了！');
        clearInterval(timerInterval);
        return;
    }

    if (cell.neighborMines === 0) {
        // Reveal neighbors recursively
        for (let dx = -1; dx <= 1; dx++) {
            for (let dy = -1; dy <= 1; dy++) {
                reveal(x + dx, y + dy);
            }
        }
    }

    checkWin();
}

function toggleFlag(x, y) {
    const cell = grid[x][y];
    if (cell.revealed) return;

    cell.flagged = !cell.flagged;
    flagsCount += cell.flagged ? 1 : -1;
    minesCountElement.textContent = MINES_COUNT - flagsCount;
    checkWin();
}

function checkWin() {
    let win = true;
    
    // Check all mines are flagged and non-mines revealed
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const cell = grid[x][y];
            if (cell.isMine && !cell.flagged) win = false;
            if (!cell.isMine && !cell.revealed) win = false;
        }
    }

    if (win) {
        gameOver = true;
        clearInterval(timerInterval);
        alert('恭喜！你赢了！');
    }
}

function showAllMines() {
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            if (grid[x][y].isMine) {
                grid[x][y].revealed = true;
            }
        }
    }
    renderGrid();
}

function renderGrid() {
    gridElement.innerHTML = '';
    for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
            const cell = grid[x][y];
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.x = x;
            cellElement.dataset.y = y;

            if (cell.revealed) {
                cellElement.classList.add('revealed');
                if (cell.isMine) {
                    cellElement.classList.add('mine');
                } else if (cell.neighborMines > 0) {
                    cellElement.textContent = cell.neighborMines;
                }
            }

            if (cell.flagged) {
                cellElement.classList.add('flagged');
            }

            cellElement.addEventListener('click', handleLeftClick);
            cellElement.addEventListener('contextmenu', handleRightClick);

            gridElement.appendChild(cellElement);
        }
    }
}

function handleLeftClick(e) {
    if (gameOver) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    
    if (firstClick) {
        firstClick = false;
        createGrid(x, y);
        startTimer();
    }
    
    reveal(x, y);
    renderGrid();
}

function handleRightClick(e) {
    e.preventDefault();
    if (gameOver || firstClick) return;
    const x = parseInt(e.target.dataset.x);
    const y = parseInt(e.target.dataset.y);
    toggleFlag(x, y);
    renderGrid();
}

function startTimer() {
    clearInterval(timerInterval);
    timer = 0;
    timeElement.textContent = timer;
    timerInterval = setInterval(() => {
        timer++;
        timeElement.textContent = timer;
    }, 1000);
}

function resetGame() {
    gameOver = false;
    firstClick = true;
    flagsCount = 0;
    minesCountElement.textContent = MINES_COUNT;
    clearInterval(timerInterval);
    timeElement.textContent = 0;
    createGrid();
    renderGrid();
}

resetBtn.addEventListener('click', resetGame);

// Initial setup
resetGame();
