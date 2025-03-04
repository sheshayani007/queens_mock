import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Home.module.css';

function deepCopy(arr) {
  return JSON.parse(JSON.stringify(arr));
}

export default function Home() {
  const [boardSize, setBoardSize] = useState(5);
  const [board, setBoard] = useState([]);
  const [solution, setSolution] = useState([]);
  const [regions, setRegions] = useState([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

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

  function solveBoard(tempBoard, row = 0) {
    if (row >= boardSize) return true;
    for (let col = 0; col < boardSize; col++) {
      if (isValidMove(tempBoard, row, col)) {
        tempBoard[row][col] = "👑";
        if (solveBoard(tempBoard, row + 1)) return true;
        tempBoard[row][col] = null;
      }
    }
    return false;
  }

  function isValidMove(tempBoard, row, col) {
    for (let i = 0; i < boardSize; i++) {
      if (tempBoard[row][i] === "👑" || tempBoard[i][col] === "👑") return false;
    }
    const currentRegion = regions[row][col];
    for (let r = 0; r < boardSize; r++) {
      for (let c = 0; c < boardSize; c++) {
        if (regions[r][c] === currentRegion && tempBoard[r][c] === "👑") return false;
      }
    }
    return true;
  }

  function generatePuzzle() {
    let emptyBoard = Array.from({ length: boardSize }, () => Array(boardSize).fill(null));
    let sol = deepCopy(emptyBoard);
    solveBoard(sol);
    let puzzle = deepCopy(emptyBoard);
    let clues = Math.floor(boardSize * 1.5);
    while (clues > 0) {
      let row = Math.floor(randomSeed() * boardSize);
      let col = Math.floor(randomSeed() * boardSize);
      if (sol[row][col] === "👑" && puzzle[row][col] === null) {
        puzzle[row][col] = "👑";
        clues--;
      }
    }
    return { puzzle, sol };
  }

  function startTimer() {
    clearInterval(timerRef.current);
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
  }

  function checkWin(currentBoard) {
    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (currentBoard[row][col] !== solution[row][col]) return false;
      }
    }
    return true;
  }

  function startNewGame() {
    const newRegions = generateRegions();
    setRegions(newRegions);
    const { puzzle, sol } = generatePuzzle();
    setBoard(puzzle);
    setSolution(sol);
    startTimer();
  }

  function handleCellClick(row, col) {
    let newBoard = deepCopy(board);
    if (newBoard[row][col] === "👑") {
      newBoard[row][col] = null;
    } else if (isValidMove(newBoard, row, col)) {
      newBoard[row][col] = "👑";
    }
    setBoard(newBoard);
    if (checkWin(newBoard)) {
      clearInterval(timerRef.current);
      setTimeout(() => {
        alert(`🎉 You solved it in ${timer} seconds!`);
        setScore((prev) => prev + 1);
        if ((score + 1) % 3 === 0) {
          setBoardSize((prev) => prev + 1);
        }
        startNewGame();
      }, 300);
    }
  }

  useEffect(() => {
    startNewGame();
    return () => clearInterval(timerRef.current);
  }, [boardSize]);

  // Conditional render until board and regions are ready.
  if (!board.length || !regions.length) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <h1>Queens Game</h1>
      <p>Score: {score}</p>
      <p>Time: {timer} seconds</p>
      <div
        className={styles.gameBoard}
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 60px)`,
          gridTemplateRows: `repeat(${boardSize}, 60px)`
        }}
      >
        {board.map((rowData, rowIndex) =>
          rowData.map((cell, colIndex) => {
            // Safeguard against undefined regions
            const regionValue = regions[rowIndex] ? regions[rowIndex][colIndex] : 0;
            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`${styles.cell} ${styles[`region-${(regionValue % 4) + 1}`]}`}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell === "👑" ? "👑" : ""}
              </div>
            );
          })
        )}
      </div>
      <button
        onClick={() => {
          setScore(0);
          setBoardSize(5);
          startNewGame();
        }}
      >
        Reset
      </button>
    </div>
  );
}
