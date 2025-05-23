// pages/game/game.js
import { createFlower, mergeFlowers, ELEMENTS } from '../../utils/flowerUtils.js';
import { createSprite, SPRITE_TYPES } from '../../utils/spriteUtils.js'; // New
import { 
  createBoard, placeFlower, getFlowerAt, removeFlower, 
  placeSprite, getSpriteAt, removeSprite, isCellOccupiedByFlower, isCellOccupiedBySprite 
} from '../../utils/boardUtils.js'; // Updated imports

const INITIAL_ROWS = 5;
const INITIAL_COLS = 5;
const ENERGY_UPDATE_INTERVAL = 1000;
const SPRITE_SPAWN_INTERVAL = 5000; // ms
const MAX_ACTIVE_SPRITES = 3;

Page({
  data: {
    welcomeMessage: "Welcome to Spirit Bloom Garden!",
    gameBoard: null,
    displayBoard: [],
    currentEnergy: 0,
    selectedPlot: null,
    energyIntervalId: null,
    spriteSpawnIntervalId: null, // New
  },

  onLoad: function () {
    console.log('Game Page Load');
    this.initGame();
    this.startGameLoop();
    this.startSpriteSpawner(); // New
  },

  onUnload: function() {
    if (this.data.energyIntervalId) {
      clearInterval(this.data.energyIntervalId);
      this.setData({ energyIntervalId: null });
    }
    if (this.data.spriteSpawnIntervalId) { // New
      clearInterval(this.data.spriteSpawnIntervalId);
      this.setData({ spriteSpawnIntervalId: null });
    }
  },

  initGame: function () {
    const board = createBoard(INITIAL_ROWS, INITIAL_COLS); // createBoard now makes cells {flower, sprite}
    this.setData({
        gameBoard: board, 
        selectedPlot: null,
        currentEnergy: 0 
    });

    const flower1 = createFlower(ELEMENTS.WATER, 1); 
    const flower2 = createFlower(ELEMENTS.FIRE, 1);  
    const flower1b = createFlower(ELEMENTS.WATER, 1);

    // Use new placeFlower
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
        const cellData = this.data.gameBoard[r][c];
        // Only accumulate from flower if no sprite is "wilting" it (future enhancement)
        if (cellData.flower && !cellData.sprite && cellData.flower.energyGenerationRate) {
          accumulatedThisTick += cellData.flower.energyGenerationRate;
        }
      }
    }
    const newEnergy = this.data.currentEnergy + accumulatedThisTick;
    this.setData({
      currentEnergy: parseFloat(newEnergy.toFixed(2)) 
    });
  },

  startSpriteSpawner: function() { // New
    if (this.data.spriteSpawnIntervalId) {
      clearInterval(this.data.spriteSpawnIntervalId);
    }
    const intervalId = setInterval(() => {
      this.attemptSpawnSprite();
    }, SPRITE_SPAWN_INTERVAL);
    this.setData({ spriteSpawnIntervalId: intervalId });
  },

  attemptSpawnSprite: function() { // New
    if (!this.data.gameBoard) return;

    let activeSpriteCount = 0;
    for (let r = 0; r < this.data.gameBoard.length; r++) {
      for (let c = 0; c < this.data.gameBoard[r].length; c++) {
        if (this.data.gameBoard[r][c].sprite) {
          activeSpriteCount++;
        }
      }
    }

    if (activeSpriteCount >= MAX_ACTIVE_SPRITES) {
      // console.log("Max sprites reached, no spawn attempt.");
      return;
    }

    const emptyPlots = [];
    for (let r = 0; r < this.data.gameBoard.length; r++) {
      for (let c = 0; c < this.data.gameBoard[r].length; c++) {
        if (!this.data.gameBoard[r][c].flower && !this.data.gameBoard[r][c].sprite) {
          emptyPlots.push({ r, c });
        }
      }
    }

    if (emptyPlots.length === 0) {
      // console.log("No empty plots to spawn sprite.");
      return;
    }

    const randomPlotIndex = Math.floor(Math.random() * emptyPlots.length);
    const plot = emptyPlots[randomPlotIndex];
    
    const newSprite = createSprite(SPRITE_TYPES.SHADOW_BASIC);
    if (newSprite) {
      // Using direct assignment as per outline, but placeSprite is also available
      this.data.gameBoard[plot.r][plot.c].sprite = newSprite; 
      newSprite.targetPlot = { row: plot.r, col: plot.c }; // Store its location
      console.log(`Sprite spawned at (${plot.r}, ${plot.c})`, newSprite);
      this.updateDisplayBoard();
    }
  },

  updateDisplayBoard: function () { 
    if (!this.data.gameBoard) return;

    const newDisplayBoard = [];
    for (let r = 0; r < this.data.gameBoard.length; r++) {
      const rowArray = [];
      for (let c = 0; c < this.data.gameBoard[r].length; c++) {
        const cellData = this.data.gameBoard[r][c]; // Cell is now {flower, sprite}
        const flower = cellData.flower; 
        const sprite = cellData.sprite;

        let displayCell = {
          flower: null,
          flowerImagePath: '',
          sprite: null, // New
          spriteImagePath: '', // New
          row: r,
          col: c,
          isSelected: false
        };

        if (flower) {
          displayCell.flower = flower;
          displayCell.flowerImagePath = `/assets/images/${flower.imageAssetName}`;
        }
        if (sprite) { // New
          displayCell.sprite = sprite;
          displayCell.spriteImagePath = `/assets/images/${sprite.imageAssetName}`;
        }

        // Selection logic: only if flower present AND no sprite on that plot
        if (this.data.selectedPlot && this.data.selectedPlot.row === r && this.data.selectedPlot.col === c && flower && !sprite) {
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
    const cellData = this.data.gameBoard[row][col];
    const tappedFlower = cellData.flower; // Directly from cellData
    const tappedSprite = cellData.sprite; // Directly from cellData

    // Sprite interaction (simple tap-to-damage for now)
    if (tappedSprite) {
      console.log(`Tapped on sprite at (${row}, ${col}):`, tappedSprite);
      tappedSprite.health -= 1; // Example: reduce health
      if (tappedSprite.health <= 0) {
        removeSprite(this.data.gameBoard, row, col); // Or this.data.gameBoard[row][col].sprite = null;
        console.log(`Sprite at (${row}, ${col}) defeated.`);
      }
      this.setData({ selectedPlot: null }); // Deselect any flower
      this.updateDisplayBoard();
      return; // Prioritize sprite interaction
    }

    // Flower interaction (selection/merging) - only if no sprite was tapped
    if (this.data.selectedPlot === null) {
      if (tappedFlower) { // Can only select if a flower is present
        this.setData({ selectedPlot: { row, col } });
      }
    } else {
      const prevSelectedRow = this.data.selectedPlot.row;
      const prevSelectedCol = this.data.selectedPlot.col;
      const selectedFlower = getFlowerAt(this.data.gameBoard, prevSelectedRow, prevSelectedCol); // Use getFlowerAt

      if (prevSelectedRow === row && prevSelectedCol === col) { // Tapped selected plot again
        this.setData({ selectedPlot: null });
      } else if (tappedFlower && selectedFlower) { // Tapped a different plot with a flower, and had a flower selected
        const mergedFlower = mergeFlowers(selectedFlower, tappedFlower);
        if (mergedFlower) {
          removeFlower(this.data.gameBoard, prevSelectedRow, prevSelectedCol);
          removeFlower(this.data.gameBoard, row, col);
          placeFlower(this.data.gameBoard, row, col, mergedFlower);
          this.setData({ selectedPlot: null });
        } else { // Merge failed (different types, tiers, etc.) - select the new plot
          this.setData({ selectedPlot: { row, col } });
        }
      } else { // Tapped an empty plot or a plot without a flower, while having something selected
        this.setData({ selectedPlot: null }); // Deselect
      }
    }
    this.updateDisplayBoard();
  }
});
