const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let lastMoveStone = null;

let currentPlayer = BLACK;
let board = [];

const boardElement = document.getElementById('board');

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
    const cell = event.target;
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (board[row][col] === EMPTY) {
        board[row][col] = currentPlayer;
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
}

initializeBoard();