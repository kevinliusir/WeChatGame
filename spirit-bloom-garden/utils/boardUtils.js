// utils/boardUtils.js

export function createBoard(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    console.error("Board dimensions must be positive integers.");
    return null;
  }
  // Each cell is an object { flower: null, sprite: null }
  return Array(rows).fill(null).map(() => 
    Array(cols).fill(null).map(() => ({ flower: null, sprite: null }))
  );
}

function isValidCoordinate(board, row, col) {
  if (!board || board.length === 0) return false;
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

export function placeFlower(board, row, col, flower) {
  if (!isValidCoordinate(board, row, col)) {
    console.error(`Placement failed: Coordinates (${row},${col}) are out of bounds.`);
    return false;
  }
  // Prevent placing if a sprite is there (simple rule for now)
  if (board[row][col].sprite) { 
    console.warn(`Placement failed: Cell (${row},${col}) is occupied by a sprite.`);
    return false; 
  }
  if (board[row][col].flower) {
    console.warn(`Placement failed: Cell (${row},${col}) is already occupied by flower ID ${board[row][col].flower.id}.`);
    return false;
  }
  if (!flower || typeof flower !== 'object' || !flower.id) {
    console.error("Placement failed: Invalid flower object provided.");
    return false;
  }

  board[row][col].flower = flower;
  return true;
}

export function removeFlower(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    console.error(`Removal failed: Coordinates (${row},${col}) are out of bounds.`);
    return null;
  }
  const flower = board[row][col].flower;
  board[row][col].flower = null;
  return flower;
}

export function getFlowerAt(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    return null;
  }
  return board[row][col].flower;
}

export function isCellOccupiedByFlower(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    return false;
  }
  return board[row][col].flower !== null;
}

// New Sprite Functions
export function placeSprite(board, row, col, sprite) {
  if (!isValidCoordinate(board, row, col)) {
    console.error(`Sprite placement failed: Coordinates (${row},${col}) are out of bounds.`);
    return false;
  }
  // Optional: Handle interaction if flower is there. For now, sprites can overlay flowers.
  // if (board[row][col].flower) { console.warn("Flower at this plot, sprite interaction may be needed or flower hidden."); }
  if (board[row][col].sprite) {
    console.warn(`Sprite placement failed: Cell (${row},${col}) is already occupied by sprite ID ${board[row][col].sprite.id}.`);
    return false;
  }
  if (!sprite || typeof sprite !== 'object' || !sprite.id) {
    console.error("Sprite placement failed: Invalid sprite object provided.");
    return false;
  }

  board[row][col].sprite = sprite;
  return true;
}

export function getSpriteAt(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    return null;
  }
  return board[row][col].sprite;
}

export function removeSprite(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    console.error(`Sprite removal failed: Coordinates (${row},${col}) are out of bounds.`);
    return null;
  }
  const sprite = board[row][col].sprite;
  board[row][col].sprite = null;
  return sprite;
}

export function isCellOccupiedBySprite(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    return false;
  }
  return board[row][col].sprite !== null;
}
