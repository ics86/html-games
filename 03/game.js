class Tetris {
    constructor() {
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.nextCanvas = document.getElementById('next-piece');
        this.nextCtx = this.nextCanvas.getContext('2d');
        this.scoreElement = document.getElementById('score');
        
        // 下落速度控制
        this.dropInterval = 1000; // 初始下落间隔1秒
        this.lastDrop = Date.now();
        this.dropAcceleration = 50; // 每消除一行加速50ms
        
        this.BLOCK_SIZE = 30;
        this.BOARD_WIDTH = 10;
        this.BOARD_HEIGHT = 20;
        this.score = 0;
        
        this.shapes = [
            [[1,1,1,1]], // I
            [[1,1],[1,1]], // O
            [[1,1,1],[0,1,0]], // T
            [[1,1,1],[1,0,0]], // L
            [[1,1,1],[0,0,1]], // J
            [[1,1,0],[0,1,1]], // S
            [[0,1,1],[1,1,0]]  // Z
        ];
        
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.currentPiece = null;
        this.nextPiece = null;
        this.gameLoop = null;
        
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleInput(e));
    }

    startGame() {
        this.resetGame();
        this.nextPiece = this.createRandomPiece();
        this.spawnNewPiece();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    /**
     * 创建一个随机的拼图块
     *
     * @returns 返回一个包含拼图块形状、颜色、起始位置的对象
     */
    createRandomPiece() {
        const shape = this.shapes[Math.floor(Math.random() * this.shapes.length)];
        return {
            shape,
            color: `hsl(${Math.random() * 360}, 70%, 60%)`,
            x: Math.floor((this.BOARD_WIDTH - shape[0].length) / 2),
            y: 0
        };
    }

    /**
     * 生成新方块
     *
     * 当游戏开始或当前方块落到底部时，会调用此方法生成新的方块
     */
    spawnNewPiece() {
        this.currentPiece = this.nextPiece || this.createRandomPiece();
        this.nextPiece = this.createRandomPiece();
        this.drawNextPiece();
    }

    drawNextPiece() {
        this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);
        this.nextCtx.fillStyle = this.nextPiece.color;
        this.nextPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.nextCtx.fillRect(
                        x * this.BLOCK_SIZE,
                        y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE - 1,
                        this.BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    update() {
        const now = Date.now();
        // 自动下落逻辑
        if (now - this.lastDrop > this.dropInterval) {
            if (!this.movePiece(0, 1)) {
                this.mergePiece();
                this.clearLines();
                if (this.currentPiece.y === 0) {
                    this.gameOver();
                    return;
                }
                this.spawnNewPiece();
            }
            this.lastDrop = now;
        }
        this.draw();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw board
        this.board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.ctx.fillStyle = value;
                    this.ctx.fillRect(
                        x * this.BLOCK_SIZE,
                        y * this.BLOCK_SIZE,
                        this.BLOCK_SIZE - 1,
                        this.BLOCK_SIZE - 1
                    );
                }
            });
        });

        // Draw current piece
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            this.currentPiece.shape.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.BLOCK_SIZE,
                            (this.currentPiece.y + y) * this.BLOCK_SIZE,
                            this.BLOCK_SIZE - 1,
                            this.BLOCK_SIZE - 1
                        );
                    }
                });
            });
        }
    }

    handleInput(e) {
        if (!this.currentPiece) return;
        
        switch(e.key) {
            case 'ArrowLeft':
                this.movePiece(-1, 0);
                break;
            case 'ArrowRight':
                this.movePiece(1, 0);
                break;
            case 'ArrowDown':
                this.movePiece(0, 1);
                break;
            case 'ArrowUp':
                this.rotatePiece();
                break;
        }
    }

    movePiece(dx, dy) {
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.isValidMove(newX, newY, this.currentPiece.shape)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            this.draw();
            return true;
        }
        return false;
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) =>
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        if (this.isValidMove(this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
            this.draw();
        }
    }

    isValidMove(x, y, shape) {
        return shape.every((row, dy) => 
            row.every((value, dx) => {
                const newX = x + dx;
                const newY = y + dy;
                return (
                    value === 0 ||
                    (newX >= 0 && newX < this.BOARD_WIDTH &&
                     newY >= 0 && newY < this.BOARD_HEIGHT &&
                     !this.board[newY][newX])
                );
            })
        );
    }

    mergePiece() {
        this.currentPiece.shape.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value) {
                    this.board[this.currentPiece.y + y][this.currentPiece.x + x] = this.currentPiece.color;
                }
            });
        });
    }

    clearLines() {
        let linesCleared = 0;
        
        for (let y = this.BOARD_HEIGHT - 1; y >= 0; y--) {
            if (this.board[y].every(cell => cell)) {
                this.board.splice(y, 1);
                this.board.unshift(Array(this.BOARD_WIDTH).fill(0));
                linesCleared++;
                y++;
            }
        }
        
        if (linesCleared > 0) {
            this.score += linesCleared * 100;
            this.scoreElement.textContent = this.score;
            // 每消除一行加速下落
            this.dropInterval = Math.max(50, this.dropInterval - (linesCleared * this.dropAcceleration));
        }
    }

    gameOver() {
        cancelAnimationFrame(this.gameLoop);
        alert(`游戏结束！得分：${this.score}`);
    }

    resetGame() {
        this.board = Array(this.BOARD_HEIGHT).fill().map(() => Array(this.BOARD_WIDTH).fill(0));
        this.score = 0;
        this.scoreElement.textContent = this.score;
        this.currentPiece = null;
        this.nextPiece = null;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// 初始化游戏
new Tetris();
