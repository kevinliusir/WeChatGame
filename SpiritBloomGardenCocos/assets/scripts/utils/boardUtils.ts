import { Flower } from './flowerUtils';
import { SpriteType, GameSprite } from './spriteUtils';

export const INITIAL_ROWS: number = 5;
export const INITIAL_COLS: number = 5;

export interface BoardCell {
    flower: Flower | null;
    sprite: GameSprite | null;
    // Add other plot-specific data here if needed
}

export function createBoard(rows: number, cols: number): BoardCell[][] {
    const board: BoardCell[][] = [];
    for (let r = 0; r < rows; r++) {
        board[r] = [];
        for (let c = 0; c < cols; c++) {
            board[r][c] = {
                flower: null,
                sprite: null,
            };
        }
    }
    return board;
}

export function placeFlower(board: BoardCell[][], row: number, col: number, flower: Flower): boolean {
    if (board[row] && board[row][col] && !board[row][col].flower) {
        board[row][col].flower = flower;
        return true;
    }
    return false; // Position invalid or already occupied
}

export function removeFlower(board: BoardCell[][], row: number, col: number): boolean {
    if (board[row] && board[row][col] && board[row][col].flower) {
        board[row][col].flower = null;
        return true;
    }
    return false;
}

export function placeSprite(board: BoardCell[][], row: number, col: number, sprite: GameSprite): boolean {
    if (board[row] && board[row][col] && !board[row][col].sprite) {
        board[row][col].sprite = sprite; // Now stores the GameSprite object
        return true;
    }
    return false;
}

export function removeSprite(board: BoardCell[][], row: number, col: number): boolean {
    if (board[row] && board[row][col] && board[row][col].sprite) {
        board[row][col].sprite = null;
        return true;
    }
    return false;
}

export function getCell(board: BoardCell[][], row: number, col: number): BoardCell | null {
    if (board[row] && board[row][col]) {
        return board[row][col];
    }
    return null;
}
