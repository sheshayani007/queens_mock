let boardSize = 5;
let board, solution, regions;
let score = 0;
let timer = 0;
let timerInterval;
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

function startTimer() {
    timer = 0;
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timer++;
        timerDisplay.textContent = timer;
    }, 1000);
}

function randomSeed() {
    return Math.random();
}

function generateRegions() {
    const regionCount = boardSize;
    let newRegions = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    let availableCells = [];

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            availableCells.push({ row, col });
        }
    }

    for (let region = 0; region < regionCount; region++) {
        for (let i = 0; i < boardSize; i++) {
            if (availableCells.length === 0) break;
            let randIndex = Math.floor(randomSeed() * availableCells.length);
            let { row, col } = availableCells.splice(randIndex, 1)[0];
            newRegions[row][col] = region;
        }
    }

    return newRegions;
}

function solveBoard(board, row = 0) {
    if (row >= boardSize) return true;

    for (let col = 0; col < boardSize; col++) {
        if (isValidMove(board, row, col)) {
            board[row][col] = "👑";
            if (solveBoard(board, row + 1)) return true;
            board[row][col] = null;
        }
    }
    return false;
}

function isValidMove(board, row, col) {
    for (let i = 0; i < boardSize; i++) {
        if (board[row][i] === "👑" || board[i][col] === "👑") return false;
    }

    const currentRegion = regions[row][col];
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) {
            if (regions[r][c] === currentRegion && board[r][c] === "👑") return false;
        }
    }
    return true;
}

function generatePuzzle() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    solution = JSON.parse(JSON.stringify(board));
    solveBoard(solution);

    let clues = Math.floor(boardSize * 1.5);
    while (clues > 0) {
        let row = Math.floor(randomSeed() * boardSize);
        let col = Math.floor(randomSeed() * boardSize);
        if (solution[row][col] !== null && board[row][col] === null) {
            board[row][col] = solution[row][col];
            clues--;
        }
    }
}

function createBoard() {
    gameBoard.innerHTML = "";
    gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 60px)`;
    gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 60px)`;

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell", `region-${regions[row][col] % 4 + 1}`);
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", placeQueen);
            cell.textContent = board[row][col] === "👑" ? "👑" : "";
            gameBoard.appendChild(cell);
        }
    }
}

function placeQueen(event) {
    const row = event.target.dataset.row;
    const col = event.target.dataset.col;

    if (board[row][col] === "👑") {
        board[row][col] = null;
        event.target.textContent = "";
    } else if (isValidMove(board, row, col)) {
        board[row][col] = "👑";
        event.target.textContent = "👑";
    }

    if (checkWin()) {
        clearInterval(timerInterval);
        setTimeout(() => {
            alert(`🎉 You solved it in ${timer} seconds! Generating a new puzzle...`);
            score++;
            scoreDisplay.textContent = score;
            if (score % 3 === 0) boardSize++; // Increase difficulty every 3 levels
            startNewGame();
        }, 300);
    }
}

function checkWin() {
    let placedQueens = 0;
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            if (board[row][col] === "👑") placedQueens++;
        }
    }
    return placedQueens === boardSize;
}

function startNewGame() {
    regions = generateRegions();
    generatePuzzle();
    createBoard();
    startTimer();
}

function resetGame() {
    score = 0;
    boardSize = 5;
    scoreDisplay.textContent = score;
    startNewGame();
}

startNewGame();
