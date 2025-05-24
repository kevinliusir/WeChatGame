import { _decorator, Component, Node, Prefab, instantiate, log, Layout } from 'cc';
import { PlotController } from './PlotController'; // Import PlotController
const { ccclass, property } = _decorator;

@ccclass('GameBoardController')
export class GameBoardController extends Component {

    @property(Prefab)
    public plotPrefab: Prefab | null = null;

    @property(Node)
    public gameBoardContainer: Node | null = null; // Optional: if not this.node

    private _gridSize: number = 5; // 5x5 grid

    start() {
        if (!this.plotPrefab) {
            log("Error: Plot Prefab not assigned in GameBoardController.");
            return;
        }

        const container = this.gameBoardContainer || this.node;
        if (!container) {
            log("Error: Game Board Container not found.");
            return;
        }

        // Clear any existing children (e.g., from editor prototyping)
        // container.removeAllChildren(); // This might be too aggressive if there are other fixed children

        for (let r = 0; r < this._gridSize; r++) {
            for (let c = 0; c < this._gridSize; c++) {
                const plotNode = instantiate(this.plotPrefab);
                if (plotNode) {
                    container.addChild(plotNode);
                    const plotCtrl = plotNode.getComponent(PlotController);
                    if (plotCtrl) {
                        plotCtrl.init(r, c);
                    } else {
                        log(`Warning: PlotController script not found on instantiated Plot prefab at [${r},${c}]`);
                    }
                } else {
                    log(`Error: Failed to instantiate Plot prefab at [${r},${c}]`);
                }
            }
        }

        // Optional: Refresh layout if needed, though addChild usually triggers it
        const layout = container.getComponent(Layout);
        if (layout) {
            layout.updateLayout();
        }
        log("Game board initialized with 5x5 plots.");

        // Example: Set flowers and sprites on specific plots
        this.setInitialPlotStates();
    }

    setInitialPlotStates() {
        const container = this.gameBoardContainer || this.node;

        // Plot at [0,0]
        const plot00 = container.getChildByName("Plot_0_0");
        if (plot00) {
            const controller = plot00.getComponent(PlotController);
            if (controller) {
                log("Setting state for Plot_0_0");
                controller.setFlower("earth", 1);
            }
        }

        // Plot at [1,1]
        const plot11 = container.getChildByName("Plot_1_1");
        if (plot11) {
            const controller = plot11.getComponent(PlotController);
            if (controller) {
                log("Setting state for Plot_1_1");
                controller.setFlower("fire", 2);
                controller.setSprite("shadow_basic");
            }
        }

        // Plot at [2,2]
        const plot22 = container.getChildByName("Plot_2_2");
        if (plot22) {
            const controller = plot22.getComponent(PlotController);
            if (controller) {
                log("Setting state for Plot_2_2");
                controller.setFlower("water", 1);
                controller.clearSprite(); // Explicitly clear any sprite
            }
        }
        
        // Plot at [0,1]
        const plot01 = container.getChildByName("Plot_0_1");
        if (plot01) {
            const controller = plot01.getComponent(PlotController);
            if (controller) {
                log("Setting state for Plot_0_1");
                controller.clearFlower(); // Explicitly clear any flower
                controller.setSprite("shadow_basic");
            }
        }
    }
}
