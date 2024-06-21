const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let currentPlayer = BLACK;
let board = [];
let gameFinished = false;

const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const resetButton = document.getElementById('reset');

function initializeBoard() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    renderBoard();
    updateStatus();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', handleCellClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleCellClick(event) {
    if (gameFinished) return;

    const row = parseInt(event.target.dataset.row);
    const col = parseInt(event.target.dataset.col);

    if (board[row][col] === EMPTY) {
        board[row][col] = currentPlayer;
        event.target.classList.add(currentPlayer === BLACK ? 'black' : 'white');

        if (checkWin(row, col)) {
            gameFinished = true;
            updateStatus(`Player ${currentPlayer === BLACK ? 'Black' : 'White'} wins!`);
            disableBoard();
        } else if (checkDraw()) {
            gameFinished = true;
            updateStatus("It's a draw!");
            disableBoard();
        } else {
            currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
            updateStatus(`Current player: ${currentPlayer === BLACK ? 'Black' : 'White'}`);
        }
    }
}

function checkDraw() {
    return board.every(row => row.every(cell => cell !== EMPTY));
}

function checkWin(row, col) {
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]
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

function updateStatus(message) {
    statusElement.textContent = message;
}

function disableBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => cell.removeEventListener('click', handleCellClick));
}

function resetGame() {
    initializeBoard();
    currentPlayer = BLACK;
    gameFinished = false;
    updateStatus(`Current player: Black`);
}

resetButton.addEventListener('click', resetGame);

initializeBoard();