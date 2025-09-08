const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score-value');

context.scale(20, 20);

const arena = createMatrix(12, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
    type: null,
    score: 0
};

const colors = [
    null,
    '#FF0D72', '#0DC2FF', '#0DFF72', '#F538FF',
    '#FF8E0D', '#FFE138', '#3877FF', '#FF5555',
    '#55FF55', '#AA00FF', '#FFAA00', '#00AAAA'
];

const tetrominoes = [
    [[1, 1, 1, 1]], // I
    [[2, 2], [2, 2]], // O
    [[0, 3, 0], [3, 3, 3]], // T
    [[0, 4, 4], [4, 4, 0]], // S
    [[5, 5, 0], [0, 5, 5]], // Z
    [[6, 0, 0], [6, 6, 6]], // J
    [[0, 0, 7], [7, 7, 7]], // L
    [[8, 8, 8], [0, 8, 0]], // Extra 1
    [[9, 0, 9], [9, 9, 9]], // Extra 2
    [[0, 10, 0], [10, 10, 10]], // Extra 3
    [[11, 11, 0], [0, 11, 11]], // Extra 4
    [[0, 12, 12], [12, 12, 0]] // Extra 5
];

const wallKicksI = [
    [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
    [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    [[0, 0], [2, 0], [-1, 0], [2, -1], [-1, 2]],
    [[0, 0], [-2, 0], [1, 0], [-2, 1], [1, -2]],
    [[0, 0], [1, 0], [-2, 0], [1, 2], [-2, -1]],
    [[0, 0], [-1, 0], [2, 0], [-1, -2], [2, 1]],
];

const wallKicksOther = [
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
    [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
    [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
];

function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

function createPiece(type) {
    return tetrominoes[type].map(row => [...row]);
}

function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
                (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

function playerRotate() {
    const originalMatrix = player.matrix.map(row => [...row]);
    const originalPos = { x: player.pos.x, y: player.pos.y };
    let rotated = false;

    rotate(player.matrix);

    const wallKicks = player.type === 0 ? wallKicksI : (player.type === 1 ? [] : wallKicksOther);
    if (wallKicks.length === 0) return;

    for (let kick of wallKicks[player.rotationState || 0]) {
        player.pos.x = originalPos.x + kick[0];
        player.pos.y = originalPos.y + kick[1];
        if (!collide(arena, player)) {
            rotated = true;
            break;
        }
    }

    if (rotated) {
        player.rotationState = (player.rotationState || 0) + 1;
        if (player.rotationState > 3) player.rotationState = 0;
    } else {
        player.matrix = originalMatrix;
        player.pos.x = originalPos.x;
        player.pos.y = originalPos.y;
    }
}

function rotate(matrix) {
    const N = matrix.length;
    const M = matrix[0].length;
    const result = Array.from({ length: M }, () => Array(N).fill(0));
    for (let y = 0; y < N; y++) {
        for (let x = 0; x < M; x++) {
            result[x][N - 1 - y] = matrix[y][x];

