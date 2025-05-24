import { _decorator, Component, Node, Prefab, instantiate, log, Layout, systemEvent } from 'cc';
import { PlotController } from './PlotController';
import { GameManager, GameEventType } from './GameManager'; // Import GameManager and GameEventType
import { BoardCell } from './utils/boardUtils';
import { getFlowerSpriteFramePath } from './utils/flowerUtils';
import { getSpriteSpriteFramePath, createSprite } from './utils/spriteUtils';

const { ccclass, property } = _decorator;

@ccclass('GameBoardController')
export class GameBoardController extends Component {

    @property(Prefab)
    public plotPrefab: Prefab | null = null;

    @property(Node)
    public gameBoardContainer: Node | null = null; // Usually this.node, but can be assigned

    private _gridSize: number = 5; // Default, will be updated from GameManager if possible
    private _plotControllers: (PlotController | null)[][] = [];


    onLoad() {
        systemEvent.on(GameEventType.BOARD_CELL_CHANGED, this.onBoardCellChanged, this);
        systemEvent.on(GameEventType.GAME_INIT_COMPLETE, this.onGameInitComplete, this);
        systemEvent.on(GameEventType.PLOT_SELECTION_CHANGED, this.onPlotSelectionChanged, this);
        log("GameBoardController: Subscribed to BOARD_CELL_CHANGED, GAME_INIT_COMPLETE, and PLOT_SELECTION_CHANGED events.");

        // Initialize plot controllers matrix
        // Try to get grid size from GameManager if it's already instanced.
        // Note: GameManager.instance might not be available if its onLoad hasn't run yet.
        // This is okay as GAME_INIT_COMPLETE will provide the authoritative board state.
        if (GameManager.instance) {
             this._gridSize = GameManager.instance.rows;
        } else {
            log("GameBoardController: GameManager not yet available in onLoad, using default grid size for _plotControllers array init.");
        }
        
        for (let r = 0; r < this._gridSize; r++) {
            this._plotControllers[r] = new Array(this._gridSize).fill(null);
        }
    }

    start() {
        // Ensure physical board is created before GAME_INIT_COMPLETE might try to render it
        this.createPhysicalBoard();
        // Initial rendering of the board will be triggered by the GAME_INIT_COMPLETE event.
    }

    createPhysicalBoard() {
        if (!this.plotPrefab) {
            log("Error: Plot Prefab not assigned in GameBoardController.");
            return;
        }

        const container = this.gameBoardContainer || this.node;
        if (!container) {
            log("Error: Game Board Container not found.");
            return;
        }
        container.removeAllChildren(); // Clear any old plots

        // Update gridSize based on GameManager if it's available now
        if (GameManager.instance) {
            this._gridSize = GameManager.instance.rows;
            // Re-initialize _plotControllers array if it was based on default and differs
            if (this._plotControllers.length !== this._gridSize || (this._plotControllers[0] && this._plotControllers[0].length !== this._gridSize) ) {
                 for (let r = 0; r < this._gridSize; r++) {
                    this._plotControllers[r] = new Array(this._gridSize).fill(null);
                }
            }
        }


        for (let r = 0; r < this._gridSize; r++) {
            for (let c = 0; c < this._gridSize; c++) {
                const plotNode = instantiate(this.plotPrefab);
                if (plotNode) {
                    container.addChild(plotNode);
                    const plotCtrl = plotNode.getComponent(PlotController);
                    if (plotCtrl) {
                        plotCtrl.init(r, c);
                        this._plotControllers[r][c] = plotCtrl;
                        
                        plotNode.off(Node.EventType.TOUCH_END); // Remove any existing listeners first
                        plotNode.on(Node.EventType.TOUCH_END, () => {
                            if (GameManager.instance) {
                                GameManager.instance.onPlotTapped(r,c);
                            }
                        }, this);

                    } else {
                        log(`Warning: PlotController script not found on instantiated Plot prefab at [${r},${c}]`);
                    }
                } else {
                    log(`Error: Failed to instantiate Plot prefab at [${r},${c}]`);
                }
            }
        }

        const layout = container.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }
        log(`GameBoardController: Physical board created/updated with ${this._gridSize}x${this._gridSize} plots.`);
    }
    
    onGameInitComplete(gameManager: GameManager) {
        log("GameBoardController: Received GAME_INIT_COMPLETE event. Rendering initial board state.");
        // Ensure physical board matches GameManager's dimensions if it wasn't available before
        if (this._gridSize !== gameManager.rows) {
            log(`GameBoardController: Grid size mismatch (local: ${this._gridSize}, GM: ${gameManager.rows}). Re-creating physical board.`);
            this._gridSize = gameManager.rows;
            this.createPhysicalBoard(); // This will re-initialize _plotControllers too
        }

        if (gameManager && gameManager.gameBoard) {
            this.renderInitialBoard(gameManager.gameBoard);
        } else {
            log("GameBoardController: GameManager instance or gameBoard not available on GAME_INIT_COMPLETE.");
        }
    }

    onBoardCellChanged(data: { row: number, col: number, cellData: BoardCell }) {
        // log(`GameBoardController: Received BOARD_CELL_CHANGED event for [${data.row},${data.col}].`);
        this.updateCellView(data.row, data.col, data.cellData);
    }

    renderInitialBoard(boardData: BoardCell[][]) {
        log("GameBoardController: Rendering initial board from GameManager data.");
        for (let r = 0; r < this._gridSize; r++) {
            for (let c = 0; c < this._gridSize; c++) {
                // Ensure plot controller exists, important if board was just re-created
                if(!this.getPlotController(r,c)) {
                    log(`GameBoardController: Plot controller for (${r},${c}) missing during initial render. This might indicate an issue.`);
                    continue;
                }
                if (boardData[r] && boardData[r][c]) {
                    this.updateCellView(r, c, boardData[r][c]);
                } else {
                     const plotCtrl = this.getPlotController(r,c);
                     if(plotCtrl) { // Should exist
                        plotCtrl.clearFlower();
                        plotCtrl.clearSprite();
                     }
                }
            }
        }
    }

    getPlotController(row: number, col: number): PlotController | null {
        if (this._plotControllers[row] && this._plotControllers[row][col]) {
            return this._plotControllers[row][col];
        }
        // log(`Error: PlotController not found at [${row},${col}] during getPlotController.`);
        return null;
    }

    updateCellView(row: number, col: number, cellData: BoardCell | null) {
        const plotCtrl = this.getPlotController(row, col);
        if (!plotCtrl) {
            log(`Error: PlotController not found at (${row},${col}) for updating view.`);
            return;
        }

        if (!cellData) {
            plotCtrl.clearFlower();
            plotCtrl.clearSprite();
            return;
        }

        if (cellData.flower) {
            plotCtrl.setFlower(cellData.flower.element, cellData.flower.tier);
        } else {
            plotCtrl.clearFlower();
        }

        if (cellData.sprite) {
            // cellData.sprite is GameSprite, plotCtrl.setSprite expects SpriteType string
            plotCtrl.setSprite(cellData.sprite.type); 
        } else {
            plotCtrl.clearSprite();
        }

        // Update selection highlight
        const gm = GameManager.instance;
        if (gm) {
            const isSelected = gm.selectedPlot?.row === row && gm.selectedPlot?.col === col;
            plotCtrl.showSelected(isSelected);
        } else {
            plotCtrl.showSelected(false);
        }
    }

    onPlotSelectionChanged(newSelectedPlot: { row: number, col: number } | null) {
        log(`GameBoardController: Received PLOT_SELECTION_CHANGED. New selection: ${newSelectedPlot ? `(${newSelectedPlot.row},${newSelectedPlot.col})` : 'null'}`);
        // Iterate through all visible plots and update their selection state
        // This is a bit brute-force but ensures all highlights are correct,
        // especially for clearing the previous selection.
        for (let r = 0; r < this._gridSize; r++) {
            for (let c = 0; c < this._gridSize; c++) {
                const plotCtrl = this.getPlotController(r, c);
                if (plotCtrl) {
                    const isSelected = newSelectedPlot?.row === r && newSelectedPlot?.col === c;
                    plotCtrl.showSelected(isSelected);
                }
            }
        }
    }
    
    onDestroy() {
        systemEvent.off(GameEventType.BOARD_CELL_CHANGED, this.onBoardCellChanged, this);
        systemEvent.off(GameEventType.GAME_INIT_COMPLETE, this.onGameInitComplete, this);
        systemEvent.off(GameEventType.PLOT_SELECTION_CHANGED, this.onPlotSelectionChanged, this);
        log("GameBoardController: Unsubscribed from events.");
    }
}
