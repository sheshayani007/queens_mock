console.log("Script loaded")


const boardSize = 5;
let board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
const regions = [
    [0, 0, 1, 1, 2],
    [0, 3, 3, 1, 2],
    [4, 3, 1, 1, 2],
    [4, 3, 3, 2, 2],
    [4, 4, 3, 2, 2],
];

const gameBoard = document.getElementById("game-board");

function createBoard() {
    gameBoard.innerHTML = "";
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement("div");
            cell.classList.add("cell", `region-${regions[row][col]}`);
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener("click", placeQueen);
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
    } else if (isValidMove(row, col)) {
        board[row][col] = "👑";
        event.target.textContent = "👑";
    }
}

function isValidMove(row, col) {
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

function resetGame() {
    board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    createBoard();
}

createBoard();
