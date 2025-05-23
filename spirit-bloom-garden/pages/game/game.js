// pages/game/game.js
import { createFlower, mergeFlowers, ELEMENTS } from '../../utils/flowerUtils.js';
import { createBoard, placeFlower, getFlowerAt, removeFlower } from '../../utils/boardUtils.js';

const INITIAL_ROWS = 5;
const INITIAL_COLS = 5;
const ENERGY_UPDATE_INTERVAL = 1000; // ms, so 1 second

Page({
  data: {
    welcomeMessage: "Welcome to Spirit Bloom Garden!",
    gameBoard: null,
    displayBoard: [],
    currentEnergy: 0,
    selectedPlot: null,
    energyIntervalId: null, // To store the interval ID for later cleanup
  },

  onLoad: function () {
    console.log('Game Page Load');
    this.initGame();
    this.startGameLoop();
  },

  onUnload: function() {
    // Clear the interval when the page is unloaded to prevent memory leaks
    if (this.data.energyIntervalId) {
      clearInterval(this.data.energyIntervalId);
      this.setData({ energyIntervalId: null });
    }
  },

  initGame: function () {
    const board = createBoard(INITIAL_ROWS, INITIAL_COLS);
    this.setData({
        gameBoard: board, 
        selectedPlot: null,
        currentEnergy: 0 
    });

    const flower1 = createFlower(ELEMENTS.WATER, 1); 
    const flower2 = createFlower(ELEMENTS.FIRE, 1);  
    const flower1b = createFlower(ELEMENTS.WATER, 1);

    if (flower1) placeFlower(this.data.gameBoard, 0, 0, flower1);
    if (flower2) placeFlower(this.data.gameBoard, 0, 1, flower2);
    if (flower1b) placeFlower(this.data.gameBoard, 1, 0, flower1b);

    this.updateDisplayBoard();
  },

  startGameLoop: function() {
    if (this.data.energyIntervalId) {
      clearInterval(this.data.energyIntervalId); 
    }
    const intervalId = setInterval(() => {
      this.accumulateEnergy();
    }, ENERGY_UPDATE_INTERVAL);
    this.setData({ energyIntervalId: intervalId });
  },

  accumulateEnergy: function() {
    if (!this.data.gameBoard) return;

    let accumulatedThisTick = 0;
    for (let r = 0; r < this.data.gameBoard.length; r++) {
      for (let c = 0; c < this.data.gameBoard[r].length; c++) {
        const flower = getFlowerAt(this.data.gameBoard, r, c);
        if (flower && flower.energyGenerationRate) {
          accumulatedThisTick += flower.energyGenerationRate;
        }
      }
    }

    const newEnergy = this.data.currentEnergy + accumulatedThisTick;
    this.setData({
      currentEnergy: parseFloat(newEnergy.toFixed(2)) 
    });
  },

  updateDisplayBoard: function () { 
    if (!this.data.gameBoard) return;

    const newDisplayBoard = [];
    for (let r = 0; r < this.data.gameBoard.length; r++) {
      const rowArray = [];
      for (let c = 0; c < this.data.gameBoard[r].length; c++) {
        const flower = getFlowerAt(this.data.gameBoard, r, c);
        let displayCell = {
          flower: null,
          flowerImagePath: '',
          row: r,
          col: c,
          isSelected: false
        };
        if (flower) {
          displayCell.flower = flower;
          displayCell.flowerImagePath = `/assets/images/${flower.imageAssetName}`;
        }
        if (this.data.selectedPlot && this.data.selectedPlot.row === r && this.data.selectedPlot.col === c) {
          displayCell.isSelected = true;
        }
        rowArray.push(displayCell);
      }
      newDisplayBoard.push(rowArray);
    }
    this.setData({
      displayBoard: newDisplayBoard
    });
  },

  onPlotTap: function(event) {
    const { row, col } = event.currentTarget.dataset;
    const tappedFlower = getFlowerAt(this.data.gameBoard, row, col);

    if (this.data.selectedPlot === null) {
      if (tappedFlower) {
        this.setData({ selectedPlot: { row, col } });
      }
    } else {
      const prevSelectedRow = this.data.selectedPlot.row;
      const prevSelectedCol = this.data.selectedPlot.col;
      const selectedFlower = getFlowerAt(this.data.gameBoard, prevSelectedRow, prevSelectedCol);

      if (prevSelectedRow === row && prevSelectedCol === col) {
        this.setData({ selectedPlot: null });
      } else if (tappedFlower && selectedFlower) {
        const mergedFlower = mergeFlowers(selectedFlower, tappedFlower);
        if (mergedFlower) {
          removeFlower(this.data.gameBoard, prevSelectedRow, prevSelectedCol);
          removeFlower(this.data.gameBoard, row, col);
          placeFlower(this.data.gameBoard, row, col, mergedFlower);
          this.setData({ selectedPlot: null });
        } else {
          this.setData({ selectedPlot: { row, col } });
        }
      } else {
        this.setData({ selectedPlot: null });
      }
    }
    this.updateDisplayBoard();
  }
});
