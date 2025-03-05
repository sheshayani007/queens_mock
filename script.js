// Set the board size (5x5 grid)
const boardSize = 5;
let board = [];

/**
 * Initializes the game by creating a blank board and rendering it.
 */
function initGame() {
  console.log("Initializing game...");
  // Create a 2D array (board) filled with null values
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  createBoard();
}

/**
 * Creates the game board grid in the DOM.
 */
function createBoard() {
  console.log("Generating game board...");
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  // Adjust grid template dynamically based on boardSize
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 60px)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 60px)`;

  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      // Attach click handler for each cell
      cell.addEventListener("click", () => handleCellClick(row, col, cell));
      cell.textContent = board[row][col] ? board[row][col] : "";
      gameBoard.appendChild(cell);
    }
  }
}

/**
 * Handles a click on a cell.
 * Toggles a queen in the cell if the move is valid.
 */
function handleCellClick(row, col, cell) {
  // If a queen is already present, remove it
  if (board[row][col] === "👑") {
    board[row][col] = null;
    cell.textContent = "";
  } 
  // Otherwise, check if placing a queen is a valid move
  else if (isValidMove(row, col)) {
    board[row][col] = "👑";
    cell.textContent = "👑";
  } else {
    alert("Invalid move! A queen already exists in the same row, column, or diagonal.");
  }
}

/**
 * Checks if placing a queen at (row, col) is valid.
 * Ensures no queen exists in the same row, column, or diagonals.
 */
function isValidMove(row, col) {
  // Check the row and column
  for (let i = 0; i < boardSize; i++) {
    if (board[row][i] === "👑" || board[i][col] === "👑") return false;
  }
  // Check the diagonals
  // Upper-left diagonal
  for (let r = row, c = col; r >= 0 && c >= 0; r--, c--) {
    if (board[r][c] === "👑") return false;
  }
  // Upper-right diagonal
  for (let r = row, c = col; r >= 0 && c < boardSize; r--, c++) {
    if (board[r][c] === "👑") return false;
  }
  // Lower-left diagonal
  for (let r = row, c = col; r < boardSize && c >= 0; r++, c--) {
    if (board[r][c] === "👑") return false;
  }
  // Lower-right diagonal
  for (let r = row, c = col; r < boardSize && c < boardSize; r++, c++) {
    if (board[r][c] === "👑") return false;
  }
  return true;
}

/**
 * Resets the game by reinitializing the board.
 */
function resetGame() {
  console.log("Resetting game...");
  initGame();
  console.log("Game has been reset!");
}

// Expose resetGame to the global scope so that it can be called from the HTML button.
window.resetGame = resetGame;

// Start the game when the page loads.
document.addEventListener("DOMContentLoaded", initGame);
