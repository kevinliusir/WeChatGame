// pages/game/game.js
import { createFlower, ELEMENTS } from '../../utils/flowerUtils.js'; // Adjusted path
import { createBoard, placeFlower, getFlowerAt } from '../../utils/boardUtils.js'; // Adjusted path

const INITIAL_ROWS = 5; // Example, can be configured
const INITIAL_COLS = 5; // Example, can be configured

Page({
  data: {
    welcomeMessage: "Welcome to Spirit Bloom Garden!",
    gameBoard: null, // This will hold the logical game board
    displayBoard: [], // This will be used by WXML for rendering
    currentEnergy: 0 // Placeholder for energy display
  },

  onLoad: function () {
    console.log('Game Page Load');
    this.initGame();
  },

  initGame: function () {
    const board = createBoard(INITIAL_ROWS, INITIAL_COLS);
    this.data.gameBoard = board; 

    const flower1 = createFlower(ELEMENTS.WATER, 1);
    const flower2 = createFlower(ELEMENTS.FIRE, 1);
    if (flower1) placeFlower(this.data.gameBoard, 0, 0, flower1);
    if (flower2) placeFlower(this.data.gameBoard, 0, 1, flower2);
    
    const flower3 = createFlower(ELEMENTS.EARTH, 2);
    if (flower3) placeFlower(this.data.gameBoard, 1, 1, flower3);

    this.updateDisplayBoard();
  },

  updateDisplayBoard: function () {
    if (!this.data.gameBoard) return;

    const newDisplayBoard = [];
    for (let r = 0; r < this.data.gameBoard.length; r++) {
      const row = [];
      for (let c = 0; c < this.data.gameBoard[r].length; c++) {
        const flower = getFlowerAt(this.data.gameBoard, r, c);
        let displayCell = {
          flower: null,
          flowerImagePath: '', 
          row: r, 
          col: c
        };
        if (flower) {
          displayCell.flower = flower; 
          displayCell.flowerImagePath = `/assets/images/${flower.imageAssetName}`;
        }
        row.push(displayCell);
      }
      newDisplayBoard.push(row);
    }
    this.setData({
      displayBoard: newDisplayBoard
    });
  },

  onPlotTap: function(event) {
    const { row, col } = event.currentTarget.dataset;
    const flower = getFlowerAt(this.data.gameBoard, row, col);

    if (flower) {
      console.log(`Tapped on flower at (${row}, ${col}):`, flower);
    } else {
      console.log(`Tapped on empty plot at (${row}, ${col})`);
    }
  }
});
