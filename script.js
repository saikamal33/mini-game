let board;
let currentPiece;
let score = 0;
let totalLines = 0;
let gameOver = false;
const GRID_WIDTH = 10;
const GRID_HEIGHT = 20;
const BLOCK_SIZE = 30;

// Tetromino shapes and colors
const SHAPES = [
  { shape: [[1, 1, 1, 1]], color: [0, 255, 255] }, // I
  { shape: [[1, 1], [1, 1]], color: [255, 255, 0] }, // O
  { shape: [[0, 1, 0], [1, 1, 1]], color: [255, 0, 0] }, // T
  { shape: [[1, 1, 0], [0, 1, 1]], color: [0, 255, 0] }, // S
  { shape: [[0, 1, 1], [1, 1, 0]], color: [255, 0, 255] }, // Z
  { shape: [[1, 0, 0], [1, 1, 1]], color: [0, 0, 255] }, // L
  { shape: [[0, 0, 1], [1, 1, 1]], color: [255, 165, 0] } // J
];

function setup() {
  let canvasWidth = GRID_WIDTH * BLOCK_SIZE;
  let canvasHeight = GRID_HEIGHT * BLOCK_SIZE;
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('game-container');
  board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
  currentPiece = newPiece();
  frameRate(2);
  document.getElementById('restart-btn').addEventListener('click', restartGame);

  // Add touch events with preventDefault to avoid scrolling/zooming
  const buttons = {
    'left-btn': moveLeft,
    'right-btn': moveRight,
    'down-btn': moveDown,
    'rotate-btn': rotatePiece
  };

  for (const [id, handler] of Object.entries(buttons)) {
    const button = document.getElementById(id);
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!gameOver) handler();
    }, { passive: false });
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (!gameOver) handler();
    });
  }

  document.addEventListener('keydown', keyPressed);
}

function draw() {
  if (!gameOver) {
    background(220);
    drawBoard();
    drawPiece();
    updateGame();
    updateSpeed();
  }
}

function newPiece() {
  const randomShape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
  return {
    shape: randomShape.shape,
    color: randomShape.color,
    x: Math.floor(GRID_WIDTH / 2) - Math.floor(randomShape.shape[0].length / 2),
    y: 0
  };
}

function drawBoard() {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (board[y][x]) {
        draw3DBlock(x * BLOCK_SIZE, y * BLOCK_SIZE, board[y][x]);
      }
    }
  }
}

function drawPiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        draw3DBlock((currentPiece.x + x) * BLOCK_SIZE, (currentPiece.y + y) * BLOCK_SIZE, currentPiece.color);
      }
    }
  }
}

function draw3DBlock(x, y, color) {
  drawingContext.shadowColor = 'rgba(0, 0, 0, 0.3)';
  drawingContext.shadowBlur = 8;
  drawingContext.shadowOffsetX = 3;
  drawingContext.shadowOffsetY = 3;

  fill(color[0], color[1], color[2]);
  stroke(0);
  strokeWeight(1);
  rect(x, y, BLOCK_SIZE, BLOCK_SIZE);

  drawingContext.shadowColor = 'transparent';
  drawingContext.shadowBlur = 0;
  drawingContext.shadowOffsetX = 0;
  drawingContext.shadowOffsetY = 0;
}

function updateGame() {
  if (canMove(0, 1)) {
    currentPiece.y++;
  } else {
    placePiece();
    clearLines();
    currentPiece = newPiece();
    if (!canMove(0, 0)) {
      gameOver = true;
      document.getElementById('game-over').style.display = 'block';
    }
  }
}

function canMove(dx, dy) {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const newX = currentPiece.x + x + dx;
        const newY = currentPiece.y + y + dy;
        if (
          newX < 0 || newX >= GRID_WIDTH ||
          newY >= GRID_HEIGHT ||
          (newY >= 0 && board[newY][newX])
        ) {
          return false;
        }
      }
    }
  }
  return true;
}

function placePiece() {
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      if (currentPiece.shape[y][x]) {
        const boardY = currentPiece.y + y;
        if (boardY >= 0) {
          board[boardY][currentPiece.x + x] = currentPiece.color;
        }
      }
    }
  }
}

function clearLines() {
  let linesCleared = 0;
  for (let y = GRID_HEIGHT - 1; y >= 0; y--) {
    if (board[y].every(cell => cell !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(GRID_WIDTH).fill(0));
      linesCleared++;
      y++;
    }
  }
  if (linesCleared > 0) {
    score += linesCleared * 100;
    totalLines += linesCleared;
    document.getElementById('score').innerText = `Score: ${score}`;
  }
}

function rotatePiece() {
  const newShape = Array(currentPiece.shape[0].length).fill().map(() => []);
  for (let y = 0; y < currentPiece.shape.length; y++) {
    for (let x = 0; x < currentPiece.shape[y].length; x++) {
      newShape[x][currentPiece.shape.length - 1 - y] = currentPiece.shape[y][x];
    }
  }
  const oldShape = currentPiece.shape;
  currentPiece.shape = newShape;
  if (!canMove(0, 0)) {
    currentPiece.shape = oldShape;
  }
}

function keyPressed() {
  if (!gameOver) {
    if (keyCode === LEFT_ARROW) {
      moveLeft();
    } else if (keyCode === RIGHT_ARROW) {
      moveRight();
    } else if (keyCode === DOWN_ARROW) {
      moveDown();
    } else if (keyCode === UP_ARROW) {
      rotatePiece();
    }
  }
}

function moveLeft() {
  if (canMove(-1, 0)) currentPiece.x--;
}

function moveRight() {
  if (canMove(1, 0)) currentPiece.x++;
}

function moveDown() {
  if (canMove(0, 1)) currentPiece.y++;
}

function restartGame() {
  board = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(0));
  currentPiece = newPiece();
  score = 0;
  totalLines = 0;
  gameOver = false;
  document.getElementById('game-over').style.display = 'none';
  document.getElementById('score').innerText = `Score: ${score}`;
  frameRate(2);
}

function updateSpeed() {
  if (totalLines >= 10) {
    frameRate(3);
  } else {
    frameRate(2);
  }
}
