// ====================================
// Configuration
// ====================================

// Allowed board sizes: 5, 7, or 9
const boardSize = 9;

// Use your provided allowedColors:
const allowedColors = [
  "#dfa0bf", // Pink
  "#b3dfa0", // Green
  "#ff7a61", // Red  
  "#bca1e3", // Violet
  "#b9b29f", // Taupe/Beige
  "#f5b995", // Orange
  "#e6f389", // Yellow
  "#97bdfe", // Blue
  "#dfdfdf"  // Gray
];

/**
 * New crown SVG – a filled polygon that omits a drawn top and right border.
 * (This SVG is a simplified crown shape.)
 */
const queenSVG = `
<svg
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  width="80%"
  height="80%"
  viewBox="0 0 160 160"
  fill="black"
>
  <path d="M 20,80 L 40,20 L 60,80 L 80,20 L 100,80 L 120,20 L 140,80 Q 80,130 20,80 Z" fill="black" stroke="none" />
  <ellipse cx="80" cy="145" rx="40" ry="5" fill="black" stroke="none" />
</svg>
`;



// ====================================
// Global Variables
// ====================================

let regionMap = [];         // 2D array for region structure assignments
let regionColors = {};      // Maps each region (1..boardSize) to a hex color
let solutionBoard = null;   // The unique solution (2D array with "👑")
let playerBoard = [];       // The player's board (initially empty)

// ====================================
// Utility Functions
// ====================================

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// ====================================
// Region Map & Color Generation
// ====================================

function generateRegionMap(size) {
  let map = Array.from({ length: size }, () => Array(size).fill(null));
  let indices = [];
  for (let i = 0; i < size * size; i++) {
    indices.push(i);
  }
  shuffleArray(indices);
  let seeds = [];
  for (let i = 0; i < boardSize; i++) {
    let idx = indices[i];
    let r = Math.floor(idx / size);
    let c = idx % size;
    map[r][c] = i + 1;
    seeds.push({ r, c, region: i + 1 });
  }
  let queue = seeds.slice();
  while (queue.length > 0) {
    let cell = queue.shift();
    let { r, c, region } = cell;
    const neighbors = [];
    if (r > 0) neighbors.push({ r: r - 1, c });
    if (r < size - 1) neighbors.push({ r: r + 1, c });
    if (c > 0) neighbors.push({ r, c: c - 1 });
    if (c < size - 1) neighbors.push({ r, c: c + 1 });
    shuffleArray(neighbors);
    for (let n of neighbors) {
      if (map[n.r][n.c] === null) {
        map[n.r][n.c] = region;
        queue.push({ r: n.r, c: n.c, region });
      }
    }
  }
  return map;
}

function generateRegionColors(size) {
  let colors = allowedColors.slice();
  shuffleArray(colors);
  regionColors = {};
  for (let i = 1; i <= size; i++) {
    regionColors[i] = colors[i - 1];
  }
}

// ====================================
// Backtracking Solution Generation
// ====================================

function generateSolution() {
  let sol = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  function backtrack(row) {
    if (row === boardSize) return true;
    let cols = [...Array(boardSize).keys()];
    shuffleArray(cols);
    for (let col of cols) {
      if (isValidMove(row, col, sol)) {
        sol[row][col] = "👑";
        if (backtrack(row + 1)) return true;
        sol[row][col] = null;
      }
    }
    return false;
  }
  return backtrack(0) ? sol : null;
}

// ====================================
// Validation Functions
// ====================================

function isValidMove(row, col, boardState) {
  // Check column.
  for (let r = 0; r < boardSize; r++) {
    if (boardState[r][col] === "👑") return false;
  }
  // Check region.
  const cellRegion = regionMap[row][col];
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (regionMap[r][c] === cellRegion && boardState[r][c] === "👑") {
        return false;
      }
    }
  }
  // Check adjacent cells.
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      let rr = row + dr, cc = col + dc;
      if (rr >= 0 && rr < boardSize && cc >= 0 && cc < boardSize) {
        if (boardState[rr][cc] === "👑") return false;
      }
    }
  }
  return true;
}

function boardsEqual(b1, b2) {
  for (let r = 0; r < boardSize; r++) {
    for (let c = 0; c < boardSize; c++) {
      if (b1[r][c] !== b2[r][c]) return false;
    }
  }
  return true;
}

function isBoardComplete(boardState) {
  return boardsEqual(boardState, solutionBoard);
}

// ====================================
// Dynamic Border Calculation & Board Rendering
// ====================================

/**
 * Helper function to compute the border width for a given cell side.
 * Returns 3px if at edge or adjacent cell is in a different region; 1.5px if same.
 */
function getBorderWidth(row, col, side) {
  if (side === "left") {
    return (col === 0) ? 3 : (regionMap[row][col - 1] === regionMap[row][col] ? 1.5 : 3);
  } else if (side === "top") {
    return (row === 0) ? 3 : (regionMap[row - 1][col] === regionMap[row][col] ? 1.5 : 3);
  } else if (side === "right") {
    return (col === boardSize - 1) ? 3 : (regionMap[row][col + 1] === regionMap[row][col] ? 1.5 : 3);
  } else if (side === "bottom") {
    return (row === boardSize - 1) ? 3 : (regionMap[row + 1][col] === regionMap[row][col] ? 1.5 : 3);
  }
  return 3;
}

/**
 * Renders the board using CSS grid.
 * Each cell is 42px by 42px (compact grid) with dynamic right & bottom borders.
 * The container (#game-board) has its own 3.5px border (set in CSS).
 */
function createBoard() {
  const gameBoard = document.getElementById("game-board");
  gameBoard.innerHTML = "";
  
  gameBoard.style.gridTemplateColumns = `repeat(${boardSize}, 42px)`;
  gameBoard.style.gridTemplateRows = `repeat(${boardSize}, 42px)`;
  
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.dataset.row = row;
      cell.dataset.col = col;
      
      let reg = regionMap[row][col];
      cell.style.backgroundColor = regionColors[reg];
      
      // Insert the crown SVG if there's a queen.
      if (playerBoard[row][col] === "👑") {
        cell.innerHTML = queenSVG;
      } else {
        cell.innerHTML = "";
      }
      
      // Only draw internal borders (right and bottom).
      if (col < boardSize - 1) {
        cell.style.borderRight = (regionMap[row][col] === regionMap[row][col + 1])
          ? "1.5px solid black"
          : "3px solid black";
      }
      if (row < boardSize - 1) {
        cell.style.borderBottom = (regionMap[row][col] === regionMap[row + 1][col])
          ? "1.5px solid black"
          : "3px solid black";
      }
      
      cell.addEventListener("click", () => handleCellClick(row, col, cell));
      gameBoard.appendChild(cell);
    }
  }
}

// ====================================
// Game Initialization & Controls
// ====================================

function newGame() {
  regionMap = generateRegionMap(boardSize);
  generateRegionColors(boardSize);
  solutionBoard = generateSolution();
  if (!solutionBoard) {
    alert("Failed to generate a valid solution!");
    return;
  }
  playerBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  createBoard();
}

function resetCurrentGame() {
  playerBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
  createBoard();
}

function handleCellClick(row, col, cell) {
  if (playerBoard[row][col] === "👑") {
    playerBoard[row][col] = null;
    cell.innerHTML = "";
  } else {
    if (isValidMove(row, col, playerBoard)) {
      playerBoard[row][col] = "👑";
      cell.innerHTML = queenSVG;
    } else {
      alert("Invalid move! Only one queen per row, column, region and no adjacent queens allowed.");
      return;
    }
  }
  
  if (isBoardComplete(playerBoard)) {
    setTimeout(() => alert("Congratulations, you win!"), 100);
  }
}

window.newGame = newGame;
window.resetCurrentGame = resetCurrentGame;

document.addEventListener("DOMContentLoaded", newGame);
