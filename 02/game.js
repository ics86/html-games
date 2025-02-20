const canvas = document.getElementById('chessboard');
const ctx = canvas.getContext('2d');
const statusDiv = document.getElementById('status');
const restartBtn = document.getElementById('restart');

const BOARD_SIZE = 15;
const CELL_SIZE = 30;
let currentPlayer = 1; // 1: 黑棋, 2: 白棋
let gameOver = false;
let board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));

// 初始化棋盘
function initBoard() {
    ctx.strokeStyle = '#666';
    for (let i = 0; i < BOARD_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE/2 + i*CELL_SIZE, CELL_SIZE/2);
        ctx.lineTo(CELL_SIZE/2 + i*CELL_SIZE, canvas.height - CELL_SIZE/2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(CELL_SIZE/2, CELL_SIZE/2 + i*CELL_SIZE);
        ctx.lineTo(canvas.width - CELL_SIZE/2, CELL_SIZE/2 + i*CELL_SIZE);
        ctx.stroke();
    }
}

// 绘制棋子
function drawPiece(x, y) {
    ctx.beginPath();
    ctx.arc(CELL_SIZE/2 + x*CELL_SIZE, CELL_SIZE/2 + y*CELL_SIZE, 13, 0, Math.PI*2);
    ctx.fillStyle = currentPlayer === 1 ? '#000' : '#fff';
    ctx.fill();
    ctx.strokeStyle = '#666';
    ctx.stroke();
}

// 检查胜利
function checkWin(x, y) {
    const directions = [
        [[-1, 0], [1, 0]],  // 水平
        [[0, -1], [0, 1]],  // 垂直
        [[-1, -1], [1, 1]], // 主对角线
        [[-1, 1], [1, -1]]  // 副对角线
    ];

    for (let [dir1, dir2] of directions) {
        let count = 1;
        let i = x + dir1[0], j = y + dir1[1];
        while (i >= 0 && i < BOARD_SIZE && j >= 0 && j < BOARD_SIZE && board[i][j] === currentPlayer) {
            count++;
            i += dir1[0];
            j += dir1[1];
        }
        
        i = x + dir2[0];
        j = y + dir2[1];
        while (i >= 0 && i < BOARD_SIZE && j >= 0 && j < BOARD_SIZE && board[i][j] === currentPlayer) {
            count++;
            i += dir2[0];
            j += dir2[1];
        }
        
        if (count >= 5) return true;
    }
    return false;
}

// 处理点击事件
canvas.addEventListener('click', (e) => {
    if (gameOver) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
    const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
    
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === 0) {
        board[x][y] = currentPlayer;
        drawPiece(x, y);
        
        if (checkWin(x, y)) {
            statusDiv.textContent = `${currentPlayer === 1 ? '黑方' : '白方'}获胜！`;
            gameOver = true;
        } else {
            currentPlayer = currentPlayer === 1 ? 2 : 1;
            statusDiv.textContent = `${currentPlayer === 1 ? '黑方' : '白方'}回合`;
        }
    }
});

// 重新开始游戏
restartBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(0));
    currentPlayer = 1;
    gameOver = false;
    statusDiv.textContent = '黑方回合';
    initBoard();
});

// 初始化游戏
initBoard();
