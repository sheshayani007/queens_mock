// Global variables
const boardSize = 5; // 5x5 grid
let board = [];      // 2D array to store queen placements

/**
 * Initializes the game by creating an empty 5x5 board and rendering it.
 */
function initGame() {
  // Create a 5x5 array filled with null (no queens)
  board = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));

  createBoard();
}

/**
 * Dynamically creates the HTML for the board and appends it to #game-board.
 */
function createBoard() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = ""; // Clear any previous cells

  // Set the CSS grid dimensions (in case you change boardSize)
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 60px)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 60px)`;

  // Generate cells
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      // Click event to handle placing/removing a queen
      cell.addEventListener("click", () => handleCellClick(row, col, cell));

      // If there's a queen in this position, display it
      cell.textContent = board[row][col] === "👑" ? "👑" : "";

      gameBoard.appendChild(cell);
    }
  }
}

/**
 * Handles a click on a cell:
 * - If there's a queen, remove it.
 * - Otherwise, place a queen if valid (no conflict).
 */
function handleCellClick(row, col, cell) {
  if (board[row][col] === "👑") {
    // Remove the queen
    board[row][col] = null;
    cell.textContent = "";
  } else {
    // Check if it's valid to place a queen here
    if (isValidMove(row, col)) {
      board[row][col] = "👑";
      cell.textContent = "👑";
    } else {
      alert("Invalid move! A queen already exists in the same row, column, or diagonal.");
    }
  }
}

/**
 * Checks if placing a queen at (row, col) is valid.
 * No queen should be in the same row, column, or diagonal.
 */
function isValidMove(row, col) {
  // Check row and column
  for (let i = 0; i < boardSize; i++) {
    if (board[row][i] === "👑" || board[i][col] === "👑") {
      return false;
    }
  }

  // Check diagonals
  // Top-left diagonal
  for (let r = row, c = col; r >= 0 && c >= 0; r--, c--) {
    if (board[r][c] === "👑") return false;
  }
  // Top-right diagonal
  for (let r = row, c = col; r >= 0 && c < boardSize; r--, c++) {
    if (board[r][c] === "👑") return false;
  }
  // Bottom-left diagonal
  for (let r = row, c = col; r < boardSize && c >= 0; r++, c--) {
    if (board[r][c] === "👑") return false;
  }
  // Bottom-right diagonal
  for (let r = row, c = col; r < boardSize && c < boardSize; r++, c++) {
    if (board[r][c] === "👑") return false;
  }

  return true; // No conflicts found
}

/**
 * Resets the game by reinitializing the board.
 */
function resetGame() {
  initGame();
  console.log("Game has been reset!");
}

// Expose resetGame to the global scope so it can be called by the button
window.resetGame = resetGame;

// Initialize the game when the DOM is loaded
document.addEventListener("DOMContentLoaded", initGame);
