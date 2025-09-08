document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#grid');
  const width = 10;
  const height = 20;
  const totalCells = width * height;
  let squares = [];

  // Create grid squares
  for (let i = 0; i < totalCells; i++) {
    const div = document.createElement('div');
    grid.appendChild(div);
    squares.push(div);
  }

  let currentPosition = 4;
  let currentRotation = 0;
  let score = 0;
  const scoreDisplay = document.getElementById('score');

  const lTetromino = [
    [1, width+1, width*2+1, 2],
    [width, width+1, width+2, width*2+2],
    [1, width+1, width*2+1, width*2],
    [width, width*2, width*2+1, width*2+2]
  ];

  const zTetromino = [
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1],
    [0, width, width+1, width*2+1],
    [width+1, width+2, width*2, width*2+1]
  ];

  const tTetromino = [
    [1, width, width+1, width+2],
    [1, width+1, width+2, width*2+1],
    [width, width+1, width+2, width*2+1],
    [1, width, width+1, width*2+1]
  ];

  const oTetromino = [
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1],
    [0, 1, width, width+1]
  ];

  const iTetromino = [
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3],
    [1, width+1, width*2+1, width*3+1],
    [width, width+1, width+2, width+3]
  ];

  const theTetrominoes = [lTetromino, zTetromino, tTetromino, oTetromino, iTetromino];

  let random = Math.floor(Math.random() * theTetrominoes.length);
  let current = theTetrominoes[random][currentRotation];

  function draw() {
    current.forEach(index => {
      if (squares[currentPosition + index]) {
        squares[currentPosition + index].classList.add('tetromino');
      }
    });
  }

  function undraw() {
    current.forEach(index => {
      if (squares[currentPosition + index]) {
        squares[currentPosition + index].classList.remove('tetromino');
      }
    });
  }

  function control(e) {
    if (e.key === 'ArrowLeft') moveLeft();
    else if (e.key === 'ArrowRight') moveRight();
    else if (e.key === 'ArrowUp') rotate();
    else if (e.key === 'ArrowDown') moveDown();
  }

  document.addEventListener('keydown', control);

  // Mobile buttons
  document.getElementById('left').addEventListener('click', moveLeft);
  document.getElementById('right').addEventListener('click', moveRight);
  document.getElementById('rotate').addEventListener('click', rotate);
  document.getElementById('down').addEventListener('click', moveDown);

  function moveDown() {
    undraw();
    currentPosition += width;
    draw();
    freeze();
  }

  function freeze() {
    if (current.some(index =>
      squares[currentPosition + index + width]?.classList.contains('taken')
    )) {
      current.forEach(index =>
        squares[currentPosition + index]?.classList.add('taken')
      );
      random = Math.floor(Math.random() * theTetrominoes.length);
      currentRotation = 0;
      current = theTetrominoes[random][currentRotation];
      currentPosition = 4;
      draw();
      addScore();
      checkGameOver();
    }
  }

  function moveLeft() {
    undraw();
    const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
    if (!isAtLeftEdge) currentPosition -= 1;
    if (current.some(index => squares[currentPosition + index]?.classList.contains('taken'))) {
      currentPosition += 1;
    }
    draw();
  }

  function moveRight() {
    undraw();
    const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
    if (!isAtRightEdge) currentPosition += 1;
    if (current.some(index => squares[currentPosition + index]?.classList.contains('taken'))) {
      currentPosition -= 1;
    }
    draw();
  }

  function rotate() {
    undraw();
    currentRotation++;
    if (currentRotation === current.length) currentRotation = 0;
    current = theTetrominoes[random][currentRotation];
    draw();
  }

  function addScore() {
    for (let i = 0; i < totalCells; i += width) {
      const row = Array.from({ length: width }, (_, k) => i + k);
      if (row.every(index => squares[index].classList.contains('taken'))) {
        score += 10;
        scoreDisplay.textContent = score;
        row.forEach(index => {
          squares[index].classList.remove('taken', 'tetromino');
        });
        const removed = squares.splice(i, width);
        squares = removed.concat(squares);
        squares.forEach(square => grid.appendChild(square));
      }
    }
  }

  function checkGameOver() {
    if (current.some(index => squares[currentPosition + index]?.classList.contains('taken'))) {
      clearInterval(timerId);
      alert('Game Over');
    }
  }

  let timerId = setInterval(moveDown, 800);
});

