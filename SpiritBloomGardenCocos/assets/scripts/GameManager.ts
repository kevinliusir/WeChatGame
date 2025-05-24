import { _decorator, Component, log, systemEvent, SystemEvent } from 'cc';
import { INITIAL_ROWS, INITIAL_COLS, createBoard, BoardCell, placeFlower as utilPlaceFlower, placeSprite as utilPlaceSprite, getCell, removeFlower as utilRemoveFlower, removeSprite as utilRemoveSprite } from './utils/boardUtils';
import { Elements, FlowerTiers, createFlower, Flower, mergeFlowers, getFlowerSpriteFramePath } from './utils/flowerUtils'; // Added mergeFlowers
import { SpriteType, createSprite, GameSprite, getSpriteSpriteFramePath } from './utils/spriteUtils';

const { ccclass, property } = _decorator;

// Event Types for GameManager
export enum GameEventType {
    ENERGY_UPDATED = 'ENERGY_UPDATED',
    BOARD_CELL_CHANGED = 'BOARD_CELL_CHANGED',
    GAME_INIT_COMPLETE = 'GAME_INIT_COMPLETE',
    PLOT_SELECTION_CHANGED = 'PLOT_SELECTION_CHANGED', // For selection visual updates
}

export const MAX_ENERGY = 500;
export const ENERGY_PER_INTERVAL = 10;
export const ENERGY_UPDATE_INTERVAL_SECONDS = 1.0;

export const SPRITE_SPAWN_INTERVAL_SECONDS = 5.0;
export const MAX_ACTIVE_SPRITES = 3;

@ccclass('GameManager')
export class GameManager extends Component {
    private static _instance: GameManager | null = null;

    public static get instance(): GameManager {
        if (!GameManager._instance) {
            log("GameManager instance is null. Ensure GameManagerNode is in the scene and active.");
        }
        return GameManager._instance!;
    }

    // Game State Properties
    public gameBoard: BoardCell[][] = [];
    private _currentEnergy: number = 0;
    public get currentEnergy(): number {
        return this._currentEnergy;
    }
    private set currentEnergy(value: number) {
        const oldEnergy = this._currentEnergy;
        this._currentEnergy = Math.max(0, Math.min(value, MAX_ENERGY));
        if (this._currentEnergy !== oldEnergy) {
            log(`GameManager: Energy updated to ${this._currentEnergy}`);
            systemEvent.emit(GameEventType.ENERGY_UPDATED, this._currentEnergy);
        }
    }

    private _selectedPlot: { row: number, col: number } | null = null;
    public get selectedPlot(): { row: number, col: number } | null {
        return this._selectedPlot;
    }
    private set selectedPlot(value: { row: number, col: number } | null) {
        const oldSelection = this._selectedPlot; // Capture old value
        this._selectedPlot = value;

        // Emit PLOT_SELECTION_CHANGED for general UI updates related to selection
        systemEvent.emit(GameEventType.PLOT_SELECTION_CHANGED, this._selectedPlot);
        log(`GameManager: Selected plot changed. Old: ${oldSelection ? `(${oldSelection.row},${oldSelection.col})` : 'null'}, New: ${this._selectedPlot ? `(${this._selectedPlot.row},${this._selectedPlot.col})` : 'null'}`);


        // Specific cell updates for visual deselection/selection highlights
        // These are now handled by GameBoardController listening to PLOT_SELECTION_CHANGED
        // and BOARD_CELL_CHANGED. The latter is important if the cell content itself changed.
        // If only selection highlight changes, PLOT_SELECTION_CHANGED is primary.
        // GameBoardController.updateCellView will be called for any BOARD_CELL_CHANGED,
        // and it will derive the selection state from GameManager.instance.selectedPlot.
        // So, we don't strictly need to emit BOARD_CELL_CHANGED here *just* for selection,
        // but it doesn't hurt if a cell's content *also* changed leading to selection change.
    }

    public readonly rows: number = INITIAL_ROWS;
    public readonly cols: number = INITIAL_COLS;

    onLoad() {
        if (GameManager._instance && GameManager._instance !== this) {
            log("Warning: More than one instance of GameManager found. Destroying new one.");
            this.destroy();
            return;
        }
        GameManager._instance = this;
        this.initGame();
    }

    start() {
        this.schedule(() => { this.accumulateEnergy(); }, ENERGY_UPDATE_INTERVAL_SECONDS);
        this.schedule(() => { this.attemptSpawnSprite(); }, SPRITE_SPAWN_INTERVAL_SECONDS);
        systemEvent.emit(GameEventType.GAME_INIT_COMPLETE, this);
        log("GameManager started, loops scheduled, and GAME_INIT_COMPLETE event emitted.");
    }

    initGame() {
        log("GameManager: Initializing game...");
        this.gameBoard = createBoard(this.rows, this.cols);
        this.currentEnergy = 100; 

        this.placeFlower(0, 0, createFlower(Elements.WATER, FlowerTiers.TIER_1));
        this.placeFlower(0, 1, createFlower(Elements.FIRE, FlowerTiers.TIER_1));
        this.placeFlower(1, 0, createFlower(Elements.WATER, FlowerTiers.TIER_1));
        
        this.selectedPlot = null; // Initialize selectedPlot
        log("GameManager: Game initialized. Board created, initial flowers placed, energy set.");
    }

    public getPlotData(row: number, col: number): BoardCell | null {
        return getCell(this.gameBoard, row, col);
    }
    
    private emitBoardCellChanged(row: number, col: number) {
        const cellData = this.getPlotData(row, col);
        // cellData might be null if a flower/sprite was just removed
        systemEvent.emit(GameEventType.BOARD_CELL_CHANGED, { row, col, cellData: cellData ? {...cellData} : {flower: null, sprite: null} });
    }

    public placeFlower(row: number, col: number, flower: Flower): boolean {
        if (utilPlaceFlower(this.gameBoard, row, col, flower)) {
            log(`GameManager: Placed ${flower.element} T${flower.tier} at (${row},${col})`);
            this.emitBoardCellChanged(row, col);
            return true;
        }
        return false;
    }

    public removeFlower(row: number, col: number): boolean {
        if (utilRemoveFlower(this.gameBoard, row, col)) {
            log(`GameManager: Removed flower at (${row},${col})`);
            this.emitBoardCellChanged(row, col);
            return true;
        }
        return false;
    }

    public placeSprite(row: number, col: number, sprite: GameSprite): boolean {
        if (utilPlaceSprite(this.gameBoard, row, col, sprite)) {
            log(`GameManager: Placed sprite ${sprite.type} (H:${sprite.health}) at (${row},${col})`);
            this.emitBoardCellChanged(row, col);
            return true;
        }
        return false;
    }

    public removeSprite(row: number, col: number): boolean {
        if (utilRemoveSprite(this.gameBoard, row, col)) {
            log(`GameManager: Removed sprite at (${row},${col})`);
            this.emitBoardCellChanged(row, col);
            return true;
        }
        return false;
    }

    private accumulateEnergy() {
        if (this.currentEnergy < MAX_ENERGY) {
            this.currentEnergy += ENERGY_PER_INTERVAL;
        }
    }

    private countActiveSprites(): number {
        let count = 0;
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.gameBoard[r][c].sprite) {
                    count++;
                }
            }
        }
        return count;
    }

    private attemptSpawnSprite() {
        const currentActiveSprites = this.countActiveSprites();
        if (currentActiveSprites < MAX_ACTIVE_SPRITES) {
            const emptyPlots: { r: number, c: number }[] = [];
            for (let r = 0; r < this.rows; r++) {
                for (let c = 0; c < this.cols; c++) {
                    if (!this.gameBoard[r][c].flower && !this.gameBoard[r][c].sprite) {
                        emptyPlots.push({ r, c });
                    }
                }
            }

            if (emptyPlots.length > 0) {
                const plotIndex = Math.floor(Math.random() * emptyPlots.length);
                const plot = emptyPlots[plotIndex];
                const newSpriteObject = createSprite(SpriteType.SHADOW_BASIC);
                if (this.placeSprite(plot.r, plot.c, newSpriteObject)) {
                    log(`GameManager: Sprite ${SpriteType.SHADOW_BASIC} (H:${newSpriteObject.health}) spawned at (${plot.r}, ${plot.c})`);
                }
            }
        }
    }
    
    public onPlotTapped(row: number, col: number) {
        log(`GameManager: Plot tapped at [${row}, ${col}].`);
        const cellData = this.getPlotData(row, col);
        if (!cellData) {
            log(`GameManager: No cell data found for (${row},${col})`);
            return;
        }

        // Sprite Interaction (Priority)
        if (cellData.sprite) {
            cellData.sprite.health -= 1; // Direct modification, GameSprite is an object
            log(`GameManager: Sprite at (${row},${col}) health decreased to ${cellData.sprite.health}`);
            if (cellData.sprite.health <= 0) {
                this.removeSprite(row, col); // Emits BOARD_CELL_CHANGED
                log(`GameManager: Sprite at (${row},${col}) defeated and removed.`);
            } else {
                this.emitBoardCellChanged(row, col); // Sprite damaged, update view
            }
            this.selectedPlot = null; // Deselect any flower, setter handles events
            return; 
        }

        // Flower Interaction (Selection/Merging)
        const previouslySelectedPlot = this.selectedPlot; 

        if (!previouslySelectedPlot) {
            if (cellData.flower) {
                this.selectedPlot = { row, col }; // Setter handles events
                log(`GameManager: Plot (${row},${col}) with flower ${cellData.flower.element} selected.`);
            } else {
                log(`GameManager: Tapped empty plot (${row},${col}), no flower to select.`);
                this.selectedPlot = null; // Ensure deselection if anything was somehow selected
            }
        } else {
            const prevRow = previouslySelectedPlot.row;
            const prevCol = previouslySelectedPlot.col;
            const prevFlowerData = this.getPlotData(prevRow, prevCol);

            if (!prevFlowerData || !prevFlowerData.flower) {
                log("GameManager: Previously selected plot has no flower. This shouldn't happen. Clearing selection.");
                this.selectedPlot = null;
                // Attempt to select the current plot if it has a flower
                if (cellData.flower) {
                    this.selectedPlot = { row, col };
                }
                return;
            }
            const prevFlower = prevFlowerData.flower;

            if (prevRow === row && prevCol === col) {
                this.selectedPlot = null; // Tapped selected plot again (deselect)
                log(`GameManager: Plot (${row},${col}) deselected.`);
            } else if (cellData.flower) { // Tapped a different plot with a flower
                log(`GameManager: Attempting to merge flower at (${prevRow},${prevCol}) with flower at (${row},${col})`);
                const mergedFlower = mergeFlowers(prevFlower, cellData.flower);
                if (mergedFlower) {
                    log(`GameManager: Merge successful. New flower: ${mergedFlower.element} T${mergedFlower.tier}`);
                    this.removeFlower(prevRow, prevCol); 
                    this.removeFlower(row, col);      
                    this.placeFlower(row, col, mergedFlower); 
                    this.selectedPlot = null; 
                } else {
                    log(`GameManager: Merge failed. Selecting new plot (${row},${col}).`);
                    this.selectedPlot = { row, col }; // Select the new plot
                }
            } else { // Tapped an empty plot or one without a flower, while having something selected
                log(`GameManager: Tapped empty plot (${row},${col}) while another was selected. Deselecting old, not selecting new.`);
                this.selectedPlot = null; 
            }
        }
    }

    onDestroy() {
        systemEvent.targetOff(this); 
        if (GameManager._instance === this) {
            GameManager._instance = null;
        }
    }
}
