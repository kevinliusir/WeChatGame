// utils/boardUtils.js

/**
 * Creates a new game board (grid).
 * @param {number} rows - The number of rows in the board.
 * @param {number} cols - The number of columns in the board.
 * @returns {Array<Array<object|null>>} A 2D array representing the board, initialized with nulls.
 */
export function createBoard(rows, cols) {
  if (rows <= 0 || cols <= 0) {
    console.error("Board dimensions must be positive integers.");
    return null;
  }
  return Array(rows).fill(null).map(() => Array(cols).fill(null));
}

/**
 * Checks if the given coordinates are within the board boundaries.
 * @param {Array<Array<object|null>>} board - The game board.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {boolean} True if coordinates are valid, false otherwise.
 */
function isValidCoordinate(board, row, col) {
  if (!board || board.length === 0) return false;
  return row >= 0 && row < board.length && col >= 0 && col < board[0].length;
}

/**
 * Places a flower onto the game board at the specified coordinates.
 * @param {Array<Array<object|null>>} board - The game board.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @param {object} flower - The flower object to place.
 * @returns {boolean} True if placement was successful, false otherwise (e.g., occupied, out of bounds).
 */
export function placeFlower(board, row, col, flower) {
  if (!isValidCoordinate(board, row, col)) {
    console.error(`Placement failed: Coordinates (${row},${col}) are out of bounds.`);
    return false;
  }
  if (board[row][col] !== null) {
    console.warn(`Placement failed: Cell (${row},${col}) is already occupied by flower ID ${board[row][col].id}.`);
    return false;
  }
  if (!flower || typeof flower !== 'object' || !flower.id) {
    console.error("Placement failed: Invalid flower object provided.");
    return false;
  }

  board[row][col] = flower;
  return true;
}

/**
 * Removes a flower from the game board at the specified coordinates.
 * @param {Array<Array<object|null>>} board - The game board.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {object|null} The flower object that was removed, or null if cell was empty or coordinates invalid.
 */
export function removeFlower(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    console.error(`Removal failed: Coordinates (${row},${col}) are out of bounds.`);
    return null;
  }

  const flower = board[row][col];
  board[row][col] = null;
  return flower; // Returns the removed flower or null if the cell was already empty
}

/**
 * Retrieves the flower at the specified coordinates.
 * @param {Array<Array<object|null>>} board - The game board.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {object|null} The flower object at the cell, or null if empty or coordinates invalid.
 */
export function getFlowerAt(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    // console.warn(`Get flower failed: Coordinates (${row},${col}) are out of bounds.`);
    return null;
  }
  return board[row][col];
}

/**
 * Checks if a cell on the board is occupied.
 * @param {Array<Array<object|null>>} board - The game board.
 * @param {number} row - The row index.
 * @param {number} col - The column index.
 * @returns {boolean} True if the cell is occupied, false otherwise (or if out of bounds).
 */
export function isCellOccupied(board, row, col) {
  if (!isValidCoordinate(board, row, col)) {
    return false; // Or throw error, depending on desired strictness for out-of-bounds checks
  }
  return board[row][col] !== null;
}
