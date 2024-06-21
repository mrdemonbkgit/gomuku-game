const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let lastMoveStone = null;
let currentPlayer = BLACK;
let board = [];
let isAIMode = false;
let playerIsWhite = false;
let aiTurn = false;

let logListElement = document.getElementById('log-list');

const boardElement = document.getElementById('board');
const aiToggle = document.getElementById('ai-toggle');

const openingBook = [
    // Center opening
    { moves: [[7, 7]], score: 100 },
    { moves: [[7, 7], [7, 8], [8, 7]], score: 95 },
    { moves: [[7, 7], [8, 8], [6, 6]], score: 90 },
    { moves: [[7, 7], [8, 7], [7, 8]], score: 95 },
    { moves: [[7, 7], [7, 6], [8, 7]], score: 85 },
    { moves: [[7, 7], [6, 7], [7, 8]], score: 80 },

    // Slightly off-center openings
    { moves: [[7, 6]], score: 85 },
    { moves: [[7, 8]], score: 85 },
    { moves: [[6, 7]], score: 85 },
    { moves: [[8, 7]], score: 85 },

    // Diagonal openings
    { moves: [[7, 7], [8, 8], [6, 6], [9, 9]], score: 88 },
    { moves: [[7, 7], [6, 6], [8, 8], [5, 5]], score: 86 },
    { moves: [[7, 7], [8, 6], [6, 8], [9, 5]], score: 87 },
    { moves: [[7, 7], [6, 8], [8, 6], [5, 9]], score: 85 },

    // Extended sequences
    { moves: [[7, 7], [7, 8], [8, 7], [8, 8], [6, 6]], score: 92 },
    { moves: [[7, 7], [8, 7], [7, 8], [6, 7], [9, 7]], score: 91 },
    { moves: [[7, 7], [7, 8], [7, 6], [8, 7], [6, 7]], score: 89 },
    { moves: [[7, 7], [8, 8], [6, 6], [9, 9], [5, 5]], score: 88 },

    // Defensive openings
    { moves: [[7, 7], [7, 8], [7, 6]], score: 82 },
    { moves: [[7, 7], [8, 7], [6, 7]], score: 81 },
    { moves: [[7, 7], [8, 8], [6, 6], [8, 6]], score: 84 },
    { moves: [[7, 7], [6, 6], [8, 8], [6, 8]], score: 83 },

    // Aggressive openings
    { moves: [[7, 7], [7, 8], [8, 7], [9, 6]], score: 86 },
    { moves: [[7, 7], [8, 7], [7, 8], [6, 9]], score: 85 },
    { moves: [[7, 7], [7, 6], [8, 7], [9, 8]], score: 87 },
    { moves: [[7, 7], [6, 7], [7, 8], [8, 9]], score: 84 },

    // Alternative center approaches
    { moves: [[7, 7], [8, 8], [7, 9]], score: 88 },
    { moves: [[7, 7], [6, 6], [5, 7]], score: 87 },
    { moves: [[7, 7], [8, 6], [9, 5]], score: 86 },
    { moves: [[7, 7], [6, 8], [5, 9]], score: 85 },

    // Complex patterns
    { moves: [[7, 7], [7, 8], [8, 7], [8, 8], [6, 6], [9, 9]], score: 93 },
    { moves: [[7, 7], [8, 7], [7, 8], [6, 7], [9, 7], [5, 7]], score: 92 },
    { moves: [[7, 7], [7, 8], [7, 6], [8, 7], [6, 7], [9, 7]], score: 91 },
    { moves: [[7, 7], [8, 8], [6, 6], [9, 9], [5, 5], [10, 10]], score: 90 },
];

function getOpeningMove() {
    const logItem = document.createElement('li');
    logItem.textContent = "AI: Checking opening book...";
    logListElement.appendChild(logItem);

    const currentBoardState = board.flat().filter(cell => cell !== EMPTY).length;
    const matchingOpenings = openingBook.filter(opening => 
        matchesOpeningLoosely(opening.moves.slice(0, currentBoardState))
    );
    
    if (matchingOpenings.length > 0) {
        // Add a small random factor to the score
        const randomFactor = 5; // Adjust this value to change the randomness
        const openingWithRandomScore = matchingOpenings.map(opening => ({
            ...opening,
            randomScore: opening.score + Math.random() * randomFactor
        }));

        // Sort by the random score and select the top one
        openingWithRandomScore.sort((a, b) => b.randomScore - a.randomScore);
        const selectedOpening = openingWithRandomScore[0];

        const nextMove = selectedOpening.moves[currentBoardState];
        if (nextMove) {
            logItem.textContent += " Found suitable opening move.";
            return { row: nextMove[0], col: nextMove[1], score: selectedOpening.score };
        }
    }
    
    logItem.textContent += " No suitable opening move found.";
    return null;
}

function matchesOpening(moves) {
    return moves.every((move, index) => 
        board[move[0]][move[1]] === (index % 2 === 0 ? BLACK : WHITE)
    );
}

function matchesOpeningLoosely(moves) {
    return moves.every((move, index) => {
        const [row, col] = move;
        const playerStone = board[row][col];
        const expectedStone = index % 2 === 0 ? BLACK : WHITE;
        return playerStone === expectedStone || playerStone === EMPTY;
    });
}

function initializeBoard() {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    renderBoard();
    logListElement.innerHTML = '';  // Clear the log
    logGameStart();  // Log the initial game start
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

    if (board[row][col] === EMPTY && (!isAIMode || !aiTurn)) {
        placeStone(row, col);
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

    // Log the move
    logMove(row, col);

    if (checkWin(row, col)) {
        setTimeout(() => {
            alert(`Player ${currentPlayer === BLACK ? 'Black' : 'White'} wins!`);
            resetGame(true);
        }, 100);
    } else {
        currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
        updateBoardEvaluation();
        
        if (isAIMode) {
            aiTurn = !aiTurn;
            if (aiTurn) {
                setTimeout(makeAIMove, 500);
            }
        }
    }
}

function logGameStart() {
    const logItem = document.createElement('li');
    logItem.textContent = "New game started";
    if (isAIMode) {
        logItem.textContent += playerIsWhite ? " - Player (White) vs AI (Black)" : " - Player (Black) vs AI (White)";
    } else {
        logItem.textContent += " - Player vs Player";
    }
    logListElement.appendChild(logItem);
    logListElement.scrollTop = logListElement.scrollHeight;
}

function logAIMove(moveType, row, col) {
    const logItem = document.createElement('li');
    logItem.textContent = `AI (${currentPlayer === BLACK ? 'Black' : 'White'}) ${moveType} at (${row + 1}, ${col + 1})`;
    logListElement.appendChild(logItem);
    logListElement.scrollTop = logListElement.scrollHeight;
}

function logMove(row, col) {
    const playerColor = currentPlayer === BLACK ? 'Black' : 'White';
    const logItem = document.createElement('li');
    logItem.textContent = `${playerColor} placed stone at (${row + 1}, ${col + 1})`;
    logListElement.appendChild(logItem);

    // Scroll to the bottom of the log
    logListElement.scrollTop = logListElement.scrollHeight;
}

function makeAIMove() {
    const logItem = document.createElement('li');
    logItem.textContent = "AI: Deciding on move...";
    logListElement.appendChild(logItem);

    const openingMove = getOpeningMove();
    let move;
    
    if (openingMove) {
        move = openingMove;
        logAIMove("used opening book move", move.row, move.col);
    } else {
        logItem.textContent = "AI: No suitable opening move found, using minimax algorithm";
        logListElement.appendChild(logItem);

        const moveCount = board.flat().filter(cell => cell !== EMPTY).length;
        const depth = moveCount < 6 ? 2 : 2; // Use deeper search for early game
        move = minimax(depth, currentPlayer, -Infinity, Infinity);
        logAIMove("used minimax algorithm", move.row, move.col);
    }

    if (!move && board.flat().filter(cell => cell !== EMPTY).length === 1) {
        // If it's the first AI move and no move was found, play near the player's stone
        const playerMove = board.flat().indexOf(BLACK);
        const playerRow = Math.floor(playerMove / BOARD_SIZE);
        const playerCol = playerMove % BOARD_SIZE;
        const possibleMoves = [
            [playerRow - 1, playerCol], [playerRow + 1, playerCol],
            [playerRow, playerCol - 1], [playerRow, playerCol + 1],
            [playerRow - 1, playerCol - 1], [playerRow - 1, playerCol + 1],
            [playerRow + 1, playerCol - 1], [playerRow + 1, playerCol + 1]
        ];
        move = possibleMoves.find(([r, c]) => r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE);
        logAIMove("used first move heuristic", move[0], move[1]);
    }

    if (move) {
        placeStone(move.row, move.col);
    }
    aiTurn = false;
}

function minimax(depth, player, alpha, beta) {
    if (depth === 0) {
        return { score: evaluateBoard() };
    }

    let bestMove = player === WHITE ? { score: -Infinity } : { score: Infinity };
    const moves = getPrioritizedMoves();

    const logItem = document.createElement('li');
    logItem.textContent = `Minimax (depth ${depth}, player ${player === WHITE ? 'White' : 'Black'}):`;
    logListElement.appendChild(logItem);

    for (const [i, j] of moves) {
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

            const moveLogItem = document.createElement('li');
            moveLogItem.textContent = `  Evaluating move (${i + 1},${j + 1}) - Score: ${score}`;
            logListElement.appendChild(moveLogItem);

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
                const pruneLogItem = document.createElement('li');
                pruneLogItem.textContent = `  Pruning at (${i + 1},${j + 1})`;
                logListElement.appendChild(pruneLogItem);
                break;
            }
        }
    }

    const bestMoveLogItem = document.createElement('li');
    bestMoveLogItem.textContent = `Best move at depth ${depth}: (${bestMove.row + 1},${bestMove.col + 1}) - Score: ${bestMove.score}`;
    logListElement.appendChild(bestMoveLogItem);

    return bestMove;
}

function getPrioritizedMoves() {
    const logItem = document.createElement('li');
    logItem.textContent = "AI: Calculating prioritized moves...";
    logListElement.appendChild(logItem);

    const center = Math.floor(BOARD_SIZE / 2);
    const moves = [];
    let lastPlayerMove = null;

    // Find the last player move
    for (let i = BOARD_SIZE - 1; i >= 0; i--) {
        for (let j = BOARD_SIZE - 1; j >= 0; j--) {
            if (board[i][j] !== EMPTY && board[i][j] !== currentPlayer) {
                lastPlayerMove = [i, j];
                break;
            }
        }
        if (lastPlayerMove) break;
    }

    // Log the last player move
    const lastMoveLogItem = document.createElement('li');
    if (lastPlayerMove) {
        lastMoveLogItem.textContent = `Last player move: (${lastPlayerMove[0] + 1}, ${lastPlayerMove[1] + 1})`;
    } else {
        lastMoveLogItem.textContent = "No last player move found (first move of the game)";
    }
    logListElement.appendChild(lastMoveLogItem);

    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                let score = 0;
                const distanceToCenter = Math.max(Math.abs(i - center), Math.abs(j - center));
                score -= distanceToCenter * 2; // Prefer center

                if (lastPlayerMove) {
                    const [lastRow, lastCol] = lastPlayerMove;
                    const distanceToLastMove = Math.max(Math.abs(i - lastRow), Math.abs(j - lastCol));
                    score -= distanceToLastMove * 3; // Strongly prefer moves near the last player move
                }

                moves.push([i, j, score]);
            }
        }
    }

    moves.sort((a, b) => b[2] - a[2]); // Sort by score in descending order
    const prioritizedMoves = moves.map(move => [move[0], move[1], move[2]]);

    // Log all prioritized moves
    const movesLogItem = document.createElement('li');
    movesLogItem.textContent = "All prioritized moves:";
    logListElement.appendChild(movesLogItem);

    const movesList = document.createElement('ul');
    prioritizedMoves.forEach(([row, col, score]) => {
        const moveItem = document.createElement('li');
        moveItem.textContent = `(${row + 1},${col + 1}) - Score: ${score}`;
        movesList.appendChild(moveItem);
    });
    logListElement.appendChild(movesList);

    return prioritizedMoves.map(move => [move[0], move[1]]); // Return without scores
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

    return playerIsWhite ? score : -score;
}

function evaluatePositionalAdvantage() {
    let score = 0;
    const center = Math.floor(BOARD_SIZE / 2);
    const moveCount = board.flat().filter(cell => cell !== EMPTY).length;
    
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] !== EMPTY) {
                // Prefer center and near-center positions, especially in early game
                const distanceToCenter = Math.max(Math.abs(i - center), Math.abs(j - center));
                const positionScore = (10 - distanceToCenter) * Math.max(1, 20 - moveCount);
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

function updateBoardEvaluation() {
    const evaluation = evaluateBoard();
    const evaluationElement = document.getElementById('board-evaluation');
    evaluationElement.textContent = `Board Evaluation: ${evaluation}`;
    
    // Add color coding for easier interpretation
    if (evaluation > 0) {
        evaluationElement.style.color = 'green';
    } else if (evaluation < 0) {
        evaluationElement.style.color = 'red';
    } else {
        evaluationElement.style.color = 'black';
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

function resetGame(startAIMove = true) {
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    currentPlayer = BLACK;
    aiTurn = isAIMode && playerIsWhite;
    
    // Clear the board visually
    boardElement.innerHTML = '';
    renderBoard();
    
    // Reset the last move stone
    if (lastMoveStone) {
        lastMoveStone.classList.remove('last-move');
    }
    lastMoveStone = null;

    updateBoardEvaluation();

    // Clear the log and add the game start log
    logListElement.innerHTML = '';
    logGameStart();

    if (aiTurn && startAIMove) {
        setTimeout(makeAIMove, 500);
    }
}


// Update the event listeners
document.addEventListener('DOMContentLoaded', (event) => {
    const aiToggle = document.getElementById('ai-toggle');
    const colorRadios = document.querySelectorAll('input[name="player-color"]');
    const resetBtn = document.getElementById('reset-btn');

    aiToggle.addEventListener('change', toggleAI);
    colorRadios.forEach(radio => radio.addEventListener('change', handleColorChange));
    resetBtn.addEventListener('click', () => resetGame(true));

    initializeBoard();
});

function handleColorChange(event) {
    playerIsWhite = event.target.value === 'white';
    resetGame(true);
}


function toggleAI(event) {
    isAIMode = event.target.checked;
    aiTurn = isAIMode && playerIsWhite;
    resetGame(!aiTurn);

    if (aiTurn) {
        setTimeout(makeAIMove, 500);
    }
}
