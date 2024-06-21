const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let lastMoveStone = null;
let currentPlayer = BLACK;
let board = [];
let isAIMode = false;

const boardElement = document.getElementById('board');
const resetButton = document.getElementById('reset-btn');
const aiToggle = document.getElementById('ai-toggle');

function initializeBoard() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (isStarPoint(i, j)) {
                cell.classList.add('star-point');
            }
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            cell.addEventListener('mouseover', handleCellHover);
            cell.addEventListener('mouseout', handleCellMouseOut);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellHover(event) {
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (board[row][col] === EMPTY) {
        const ghostStone = document.createElement('div');
        ghostStone.classList.add('ghost-stone');
        ghostStone.classList.add(currentPlayer === BLACK ? 'black' : 'white');
        cell.appendChild(ghostStone);
    }
}

function handleCellMouseOut(event) {
    const cell = event.target;
    const ghostStone = cell.querySelector('.ghost-stone');
    if (ghostStone) {
        cell.removeChild(ghostStone);
    }
}

function isStarPoint(row, col) {
    const starPoints = [3, 7, 11];
    return starPoints.includes(row) && starPoints.includes(col);
}

function handleCellClick(event) {
    if (isAIMode && currentPlayer === WHITE) return; // Prevent clicks during AI turn

    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (board[row][col] === EMPTY) {
        placeStone(row, col);
        
        if (isAIMode && !checkWin(row, col)) {
            currentPlayer = WHITE;
            setTimeout(makeAIMove, 500); // Delay AI move for better UX
        }
    }
}

function placeStone(row, col) {
    board[row][col] = currentPlayer;
    const cell = boardElement.children[row * BOARD_SIZE + col];
    const stone = document.createElement('div');
    stone.classList.add('stone');
    stone.classList.add(currentPlayer === BLACK ? 'black' : 'white');
    cell.appendChild(stone);

    // Remove ghost stone if it exists
    const ghostStone = cell.querySelector('.ghost-stone');
    if (ghostStone) {
        cell.removeChild(ghostStone);
    }

    // Remove glow from the previous last move
    if (lastMoveStone) {
        lastMoveStone.classList.remove('last-move');
    }

    // Add glow to the current move
    stone.classList.add('last-move');
    lastMoveStone = stone;

    if (checkWin(row, col)) {
        setTimeout(() => {
            alert(`Player ${currentPlayer === BLACK ? 'Black' : 'White'} wins!`);
            resetGame();
        }, 100);
    } else {
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    }
}

function makeAIMove() {
    const depth = 3; // Adjust this for difficulty (higher is harder but slower)
    const bestMove = minimax(depth, WHITE, -Infinity, Infinity);
    placeStone(bestMove.row, bestMove.col);
}

function minimax(depth, player, alpha, beta) {
    if (depth === 0) {
        return { score: evaluateBoard() };
    }

    let bestMove = player === WHITE ? { score: -Infinity } : { score: Infinity };

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                board[i][j] = player;
                let score;

                if (checkWin(i, j)) {
                    score = player === WHITE ? 10000 : -10000;
                } else {
                    const nextPlayer = player === WHITE ? BLACK : WHITE;
                    score = minimax(depth - 1, nextPlayer, alpha, beta).score;
                }

                board[i][j] = EMPTY;

                if (player === WHITE) {
                    if (score > bestMove.score) {
                        bestMove = { row: i, col: j, score: score };
                    }
                    alpha = Math.max(alpha, score);
                } else {
                    if (score < bestMove.score) {
                        bestMove = { row: i, col: j, score: score };
                    }
                    beta = Math.min(beta, score);
                }

                if (beta <= alpha) {
                    break;
                }
            }
        }
    }

    return bestMove;
}

function evaluateBoard() {
    let score = 0;
    const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== EMPTY) {
                for (const [dx, dy] of directions) {
                    score += evaluateDirection(i, j, dx, dy);
                }
            }
        }
    }

    // Add positional scoring
    score += evaluatePositionalAdvantage();

    return score;
}

function evaluatePositionalAdvantage() {
    let score = 0;
    const center = Math.floor(BOARD_SIZE / 2);
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== EMPTY) {
                // Prefer center and near-center positions
                const distanceToCenter = Math.max(Math.abs(i - center), Math.abs(j - center));
                const positionScore = 5 - distanceToCenter;
                score += board[i][j] === WHITE ? positionScore : -positionScore;
            }
        }
    }

    return score;
}

function evaluateDirection(row, col, dx, dy) {
    const player = board[row][col];
    let count = 1;
    let open = 0;
    let score = 0;

    // Count in positive direction
    let x = row + dx;
    let y = col + dy;
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
        count++;
        x += dx;
        y += dy;
    }
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === EMPTY) open++;

    // Count in negative direction
    x = row - dx;
    y = col - dy;
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
        count++;
        x -= dx;
        y -= dy;
    }
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === EMPTY) open++;

    // Evaluate the sequence
    if (count >= 5) score = 100000;
    else if (count === 4) {
        if (open === 2) score = 10000;
        else if (open === 1) score = 1000;
    }
    else if (count === 3) {
        if (open === 2) score = 500;
        else if (open === 1) score = 100;
    }
    else if (count === 2) {
        if (open === 2) score = 50;
        else if (open === 1) score = 10;
    }
    else if (count === 1 && open > 0) {
        score = 1;
    }

    return player === WHITE ? score : -score;
}

function findBestMove() {
    // Simple AI: Find the first empty cell that's adjacent to a player's stone
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY && hasAdjacentStone(i, j)) {
                return { row: i, col: j };
            }
        }
    }
    // If no adjacent moves, place in the center or nearby
    const center = Math.floor(BOARD_SIZE / 2);
    for (let i = center - 1; i <= center + 1; i++) {
        for (let j = center - 1; j <= center + 1; j++) {
            if (board[i][j] === EMPTY) {
                return { row: i, col: j };
            }
        }
    }
    // If center area is filled, choose first empty cell
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                return { row: i, col: j };
            }
        }
    }
}

function hasAdjacentStone(row, col) {
    for (let i = Math.max(0, row - 1); i <= Math.min(BOARD_SIZE - 1, row + 1); i++) {
        for (let j = Math.max(0, col - 1); j <= Math.min(BOARD_SIZE - 1, col + 1); j++) {
            if (board[i][j] !== EMPTY) {
                return true;
            }
        }
    }
    return false;
}

function checkWin(row, col) {
    const directions = [
        [1, 0],  // horizontal
        [0, 1],  // vertical
        [1, 1],  // diagonal \
        [1, -1]  // diagonal /
    ];

    for (const [dx, dy] of directions) {
        let count = 1;
        count += countDirection(row, col, dx, dy);
        count += countDirection(row, col, -dx, -dy);

        if (count >= 5) {
            return true;
        }
    }

    return false;
}

function countDirection(row, col, dx, dy) {
    let count = 0;
    let x = row + dx;
    let y = col + dy;

    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === currentPlayer) {
        count++;
        x += dx;
        y += dy;
    }

    return count;
}

function resetGame() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    currentPlayer = BLACK;
    
    // Clear the board visually
    boardElement.innerHTML = '';
    renderBoard();
    
    // Reset the last move stone
    if (lastMoveStone) {
        lastMoveStone.classList.remove('last-move');
    }
    lastMoveStone = null;

    if (isAIMode && currentPlayer === WHITE) {
        setTimeout(makeAIMove, 500);
    }
}

resetButton.addEventListener('click', resetGame);

aiToggle.addEventListener('change', (e) => {
    isAIMode = e.target.checked;
    resetGame();
});

initializeBoard();