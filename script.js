// --- 상수 ---
// 게임 보드 크기 (가로 10칸, 세로 20칸) — CSS 변수와 동기화된다
const COLS = 10;
const ROWS = 20;
const CELL_SIZE = 30;
const DROP_INTERVAL_MS = 800;

const LINE_SCORES = {
  1: 100,
  2: 300,
  3: 500,
  4: 800,
};

// --- DOM 참조 ---
const boardElement = document.getElementById("game-board");
const scoreElement = document.getElementById("score");
const gameStatusElement = document.getElementById("game-status");
const startBtn = document.getElementById("start-btn");
const restartBtn = document.getElementById("restart-btn");

if (!boardElement || !scoreElement || !gameStatusElement || !startBtn || !restartBtn) {
  throw new Error("필수 HTML 요소를 찾을 수 없습니다. index.html을 확인하세요.");
}

// --- 블록 정의 ---
const PIECES = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: "#00f0f0",
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: "#f0f000",
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#a000f0",
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: "#00f000",
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: "#f00000",
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#0000f0",
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: "#f0a000",
  },
};

const PIECE_TYPES = Object.keys(PIECES);

// --- 게임 상태 ---
let board = [];
let currentPiece = null;
let cellCache = [];
let dropTimer = null;
let isPlaying = false;
let isGameOver = false;
let score = 0;
let isKeyboardBound = false;

// --- 보드·셀 유틸 ---
function cloneShape(shape) {
  return shape.map((row) => [...row]);
}

function createEmptyBoard() {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function isInsideBoard(row, col) {
  return row >= 0 && row < ROWS && col >= 0 && col < COLS;
}

function initBoard() {
  boardElement.innerHTML = "";
  cellCache = [];

  boardElement.style.setProperty("--cols", COLS);
  boardElement.style.setProperty("--rows", ROWS);
  boardElement.style.setProperty("--cell-size", `${CELL_SIZE}px`);

  for (let row = 0; row < ROWS; row++) {
    cellCache[row] = [];

    for (let col = 0; col < COLS; col++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.dataset.row = row;
      cell.dataset.col = col;
      boardElement.appendChild(cell);
      cellCache[row][col] = cell;
    }
  }
}

function getCell(row, col) {
  return cellCache[row]?.[col] ?? null;
}

function clearCell(cell) {
  if (!cell) return;

  cell.className = "cell";
  cell.style.removeProperty("background-color");
}

function paintLockedCell(cell, color) {
  if (!cell) return;

  cell.classList.add("filled");
  cell.style.backgroundColor = color;
}

function paintActiveCell(cell, color) {
  if (!cell) return;

  cell.classList.add("filled", "active-piece");
  cell.style.backgroundColor = color;
}

// --- 조각 생성 ---
function createPiece(type) {
  const pieceData = PIECES[type];

  if (!pieceData) {
    throw new Error(`알 수 없는 블록 타입: ${type}`);
  }

  const shape = cloneShape(pieceData.shape);

  return {
    type,
    shape,
    color: pieceData.color,
    row: 0,
    col: Math.floor((COLS - shape[0].length) / 2),
  };
}

function createRandomPiece() {
  const type = PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
  return createPiece(type);
}

// 조각의 채워진 칸마다 콜백을 실행한다
function forEachBlockCell(piece, deltaRow, deltaCol, shapeOverride, callback) {
  if (!piece) return;

  const shape = shapeOverride ?? piece.shape;
  const baseRow = piece.row + deltaRow;
  const baseCol = piece.col + deltaCol;

  for (let shapeRow = 0; shapeRow < shape.length; shapeRow++) {
    for (let shapeCol = 0; shapeCol < shape[shapeRow].length; shapeCol++) {
      if (!shape[shapeRow][shapeCol]) continue;

      callback(baseRow + shapeRow, baseCol + shapeCol);
    }
  }
}

// --- 충돌·고정 ---
function canMove(piece, deltaCol, deltaRow, matrix, shapeOverride) {
  if (!piece) return false;

  let canPlace = true;

  forEachBlockCell(piece, deltaRow, deltaCol, shapeOverride, (boardRow, boardCol) => {
    if (!isInsideBoard(boardRow, boardCol) || matrix[boardRow][boardCol]) {
      canPlace = false;
    }
  });

  return canPlace;
}

function lockPiece(piece) {
  if (!piece) return;

  forEachBlockCell(piece, 0, 0, null, (boardRow, boardCol) => {
    if (isInsideBoard(boardRow, boardCol)) {
      board[boardRow][boardCol] = piece.color;
    }
  });
}

// --- 렌더링 ---
function renderBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const cell = getCell(row, col);
      clearCell(cell);

      if (board[row][col]) {
        paintLockedCell(cell, board[row][col]);
      }
    }
  }
}

function drawPiece(piece) {
  if (!piece) return;

  forEachBlockCell(piece, 0, 0, null, (boardRow, boardCol) => {
    if (!isInsideBoard(boardRow, boardCol)) return;

    paintActiveCell(getCell(boardRow, boardCol), piece.color);
  });
}

function render() {
  renderBoard();
  drawPiece(currentPiece);
}

// --- 조작 ---
function rotateMatrix(matrix) {
  const rowCount = matrix.length;
  const colCount = matrix[0].length;
  const rotated = Array.from({ length: colCount }, () => Array(rowCount).fill(0));

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      rotated[col][rowCount - 1 - row] = matrix[row][col];
    }
  }

  return rotated;
}

function canControlPiece() {
  return currentPiece !== null && isPlaying && !isGameOver;
}

function tryMovePiece(deltaCol, deltaRow) {
  if (!canControlPiece()) return false;

  if (canMove(currentPiece, deltaCol, deltaRow, board)) {
    currentPiece.col += deltaCol;
    currentPiece.row += deltaRow;
    render();
    return true;
  }

  return false;
}

function tryRotatePiece() {
  if (!canControlPiece()) return false;

  const rotatedShape = rotateMatrix(currentPiece.shape);

  if (canMove(currentPiece, 0, 0, board, rotatedShape)) {
    currentPiece.shape = rotatedShape;
    render();
    return true;
  }

  return false;
}

function hardDrop() {
  if (!canControlPiece()) return;

  while (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
  }

  settlePiece();
}

function handleKeyDown(event) {
  if (!isPlaying || isGameOver) return;

  switch (event.code) {
    case "ArrowLeft":
      event.preventDefault();
      tryMovePiece(-1, 0);
      break;
    case "ArrowRight":
      event.preventDefault();
      tryMovePiece(1, 0);
      break;
    case "ArrowDown":
      event.preventDefault();
      tryMovePiece(0, 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      tryRotatePiece();
      break;
    case "Space":
      event.preventDefault();
      hardDrop();
      break;
  }
}

// --- 점수·라인 삭제 ---
function isRowFull(row) {
  return row.every((cell) => cell !== null);
}

function clearFullLines() {
  let linesCleared = 0;

  for (let row = ROWS - 1; row >= 0; row--) {
    if (!isRowFull(board[row])) continue;

    board.splice(row, 1);
    board.unshift(Array(COLS).fill(null));
    linesCleared += 1;
    row += 1;
  }

  return linesCleared;
}

function addScore(linesCleared) {
  if (linesCleared <= 0) return;

  score += LINE_SCORES[linesCleared] ?? linesCleared * 100;
  scoreElement.textContent = String(score);
}

function resetScore() {
  score = 0;
  scoreElement.textContent = "0";
}

// --- 게임 흐름 ---
function updateGameStatus(message) {
  gameStatusElement.textContent = message;
}

function stopGameLoop() {
  isPlaying = false;

  if (dropTimer !== null) {
    clearInterval(dropTimer);
    dropTimer = null;
  }
}

function startGameLoop() {
  stopGameLoop();
  isPlaying = true;
  isGameOver = false;
  dropTimer = setInterval(dropPiece, DROP_INTERVAL_MS);
}

function triggerGameOver() {
  isGameOver = true;
  stopGameLoop();
  currentPiece = null;
  updateGameStatus("게임 오버");
  render();
}

function spawnPiece() {
  currentPiece = createRandomPiece();

  if (!canMove(currentPiece, 0, 0, board)) {
    triggerGameOver();
    return false;
  }

  return true;
}

function settlePiece() {
  if (!currentPiece) return;

  lockPiece(currentPiece);

  const linesCleared = clearFullLines();
  if (linesCleared > 0) {
    addScore(linesCleared);
  }

  spawnPiece();
  render();
}

function dropPiece() {
  if (!currentPiece || !isPlaying || isGameOver) return;

  if (canMove(currentPiece, 0, 1, board)) {
    currentPiece.row += 1;
    render();
    return;
  }

  settlePiece();
}

function resetGameState() {
  stopGameLoop();
  board = createEmptyBoard();
  currentPiece = null;
  isGameOver = false;
  isPlaying = false;
  updateGameStatus("");
}

function beginGame() {
  resetGameState();
  spawnPiece();

  if (!isGameOver) {
    render();
  }
}

function startGame() {
  beginGame();

  if (!isGameOver) {
    startGameLoop();
  }
}

function restartGame() {
  resetGameState();
  resetScore();
  spawnPiece();

  if (!isGameOver) {
    render();
    startGameLoop();
  }
}

// --- UI 바인딩 ---
function setupKeyboardControls() {
  if (isKeyboardBound) return;

  document.addEventListener("keydown", handleKeyDown);
  isKeyboardBound = true;
}

function bindUiControls() {
  startBtn.addEventListener("click", startGame);
  restartBtn.addEventListener("click", restartGame);
}

function initApp() {
  initBoard();
  setupKeyboardControls();
  bindUiControls();
  beginGame();
  resetScore();
}

initApp();
