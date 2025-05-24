import { _decorator, Component, Node, Sprite, Color, EventTouch, log, Label, SpriteFrame, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PlotController')
export class PlotController extends Component {

    @property(Sprite)
    public selectionHighlight: Sprite = null!;

    @property(Sprite)
    public flowerSprite: Sprite = null!;

    @property(Sprite)
    public spriteImage: Sprite = null!;

    @property(Label)
    public tierLabel: Label = null!;

    private _isSelected: boolean = false;
    private _row: number = 0;
    private _col: number = 0;

    private _currentFlowerElement: string | null = null;
    private _currentFlowerTier: number = 0;
    private _currentSpriteType: string | null = null;

    onLoad() {
        if (this.selectionHighlight) {
            this.selectionHighlight.enabled = false; // Initially hide highlight
        }
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

        // Ensure sprites and label are clear initially
        this.clearFlower();
        this.clearSprite();
        if (this.tierLabel) {
            this.tierLabel.string = "";
            this.tierLabel.node.active = false;
        }
    }

    init(row: number, col: number) {
        this._row = row;
        this._col = col;
        this.node.name = `Plot_${row}_${col}`;
    }

    // onTouchEnd is now effectively handled by GameBoardController forwarding to GameManager
    // The local _isSelected and direct visual changes here might conflict or be redundant.
    // Commenting out the direct selection logic. Visual state will be driven by showSelected().
    /*
    onTouchEnd(event: EventTouch) {
        // this._isSelected = !this._isSelected;
        // if (this.selectionHighlight) {
        //     this.selectionHighlight.enabled = this._isSelected;
        // }
        // log(`Plot [${this._row}, ${this._col}] tapped. Old direct selection: ${this._isSelected}`);

        // const mainPlotSprite = this.getComponent(Sprite);
        // if (mainPlotSprite) {
        //     mainPlotSprite.color = this._isSelected ? new Color(200, 255, 200) : Color.WHITE;
        // }
    }
    */

    // setSelected(selected: boolean) { // Renamed to showSelected for clarity
    //     this._isSelected = selected;
    //     if (this.selectionHighlight) {
    //         this.selectionHighlight.enabled = this._isSelected;
    //     }
    //     const mainPlotSprite = this.getComponent(Sprite);
    //     if (mainPlotSprite) {
    //         mainPlotSprite.color = this._isSelected ? new Color(200, 255, 200) : Color.WHITE;
    //     }
    // }

    public showSelected(selected: boolean) {
        this._isSelected = selected; // Keep internal state if needed for other logic, though not primary driver now
        if (this.selectionHighlight) {
            this.selectionHighlight.node.active = selected; // Use node.active for visibility
            // log(`Plot [${this._row},${this._col}] showSelected: ${selected}. Highlight active: ${this.selectionHighlight.node.active}`);
        } else {
            log(`Plot [${this._row},${this._col}] showSelected: selectionHighlight is null.`);
        }

        // Optional: Visual feedback on the main plot sprite itself for selection
        const mainPlotSprite = this.getComponent(Sprite);
        if (mainPlotSprite) {
            mainPlotSprite.color = selected ? new Color(210, 255, 210) : Color.WHITE;
        }
    }

    private loadSpriteFrame(path: string, targetSprite: Sprite, callback?: (success: boolean) => void) {
        if (!path) {
            if (targetSprite) {
                targetSprite.spriteFrame = null;
                targetSprite.node.active = false;
            }
            if (callback) callback(true); // Path is null, considered "successful" clearing
            return;
        }

        resources.load(path, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                log(`Error loading spriteFrame [${path}]: ${err.message}`);
                if (targetSprite) {
                    targetSprite.spriteFrame = null;
                    targetSprite.node.active = false;
                }
                if (callback) callback(false);
                return;
            }
            if (targetSprite) {
                targetSprite.spriteFrame = spriteFrame;
                targetSprite.node.active = true;
                log(`Successfully loaded spriteFrame [${path}] for Plot [${this._row},${this._col}]`);
                if (callback) callback(true);
            } else {
                log(`Warning: Target sprite is null for path [${path}] on Plot [${this._row},${this._col}]`);
                if (callback) callback(false);
            }
        });
    }

    setFlower(element: string | null, tier: number) {
        if (!element || tier <= 0) {
            this.clearFlower();
            return;
        }

        this._currentFlowerElement = element;
        this._currentFlowerTier = tier;

        const imagePath = `images/${element}_tier${tier}`; // Assumes images are in assets/resources/images/
        
        if (this.flowerSprite) {
            this.loadSpriteFrame(imagePath, this.flowerSprite, (success) => {
                if (success && this.tierLabel) {
                    this.tierLabel.string = "T" + tier;
                    this.tierLabel.node.active = true;
                } else if (!success) {
                    this.clearFlower(); // Clear if loading failed
                }
            });
        } else {
            log(`Plot [${this._row},${this._col}]: flowerSprite property not set.`);
            this.clearFlower();
        }
    }

    clearFlower() {
        if (this.flowerSprite) {
            this.flowerSprite.spriteFrame = null;
            this.flowerSprite.node.active = false;
        }
        if (this.tierLabel) {
            this.tierLabel.string = "";
            this.tierLabel.node.active = false;
        }
        this._currentFlowerElement = null;
        this._currentFlowerTier = 0;
    }

    setSprite(spriteType: string | null) {
        if (!spriteType) {
            this.clearSprite();
            return;
        }
        this._currentSpriteType = spriteType;
        // Example path: "images/sprite_shadow_basic"
        const imagePath = `images/sprite_${spriteType}`; 

        if (this.spriteImage) {
            this.loadSpriteFrame(imagePath, this.spriteImage, (success) => {
                if (!success) this.clearSprite();
            });
        } else {
            log(`Plot [${this._row},${this._col}]: spriteImage property not set.`);
            this.clearSprite();
        }
    }

    clearSprite() {
        if (this.spriteImage) {
            this.spriteImage.spriteFrame = null;
            this.spriteImage.node.active = false;
        }
        this._currentSpriteType = null;
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }
}
