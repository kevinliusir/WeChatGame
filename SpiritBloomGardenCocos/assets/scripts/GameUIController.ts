import { _decorator, Component, Label, log, systemEvent } from 'cc';
import { GameManager, GameEventType } from './GameManager'; // Import GameManager and GameEventType
const { ccclass, property } = _decorator;

@ccclass('GameUIController')
export class GameUIController extends Component {

    @property(Label)
    public energyLabel: Label = null!;

    private _currentEnergy: number = 0; // Internal state, mainly for reference

    onLoad() {
        if (!this.energyLabel) {
            log("GameUIController: Energy Label is not assigned in the editor!");
        }
        
        // Subscribe to game events
        systemEvent.on(GameEventType.ENERGY_UPDATED, this.onEnergyUpdated, this);
        systemEvent.on(GameEventType.GAME_INIT_COMPLETE, this.onGameInitComplete, this);
        log("GameUIController: Subscribed to ENERGY_UPDATED and GAME_INIT_COMPLETE events.");
    }

    start() {
        // Initial energy will be set by GAME_INIT_COMPLETE event or first ENERGY_UPDATED event.
        // Do not set initial energy here directly.
        // If GameManager.instance is already available and initialized, could fetch here,
        // but event-driven is cleaner.
        if (this.energyLabel) {
            this.energyLabel.string = "Energy: --"; // Placeholder until first update
        }
    }

    onGameInitComplete(gameManager: GameManager) {
        log("GameUIController: Received GAME_INIT_COMPLETE event. Initializing energy display.");
        if (gameManager && gameManager.currentEnergy !== undefined) {
            this.updateEnergyDisplay(gameManager.currentEnergy);
        } else {
            log("GameUIController: GameManager instance or currentEnergy not available on GAME_INIT_COMPLETE.");
        }
    }

    onEnergyUpdated(newEnergy: number) {
        // log(`GameUIController: Received ENERGY_UPDATED event with value: ${newEnergy}`);
        this.updateEnergyDisplay(newEnergy);
    }

    updateEnergyDisplay(energy: number) {
        this._currentEnergy = energy;
        if (this.energyLabel) {
            this.energyLabel.string = `Energy: ${this._currentEnergy}`;
            // log(`GameUIController: Energy display updated to: ${this._currentEnergy}`);
        } else {
            log("GameUIController: Cannot update energy display, label not set.");
        }
    }

    addEnergy(amount: number) { // This method might be called by other systems or directly for debug
        if (GameManager.instance) { // Prefer modifying through GameManager if it's the source of truth
            GameManager.instance.currentEnergy += amount; // Assuming GameManager's setter handles logic
        } else {
            this.updateEnergyDisplay(this._currentEnergy + amount);
        }
    }

    spendEnergy(amount: number): boolean { // Similar to addEnergy
         if (GameManager.instance) {
            const newEnergy = GameManager.instance.currentEnergy - amount;
            if (newEnergy >= 0) {
                GameManager.instance.currentEnergy = newEnergy;
                return true;
            }
            return false;
        } else {
            if (this._currentEnergy >= amount) {
                this.updateEnergyDisplay(this._currentEnergy - amount);
                return true;
            }
            return false;
        }
    }

    getCurrentEnergy(): number {
        return this._currentEnergy;
    }

    onDestroy() {
        systemEvent.off(GameEventType.ENERGY_UPDATED, this.onEnergyUpdated, this);
        systemEvent.off(GameEventType.GAME_INIT_COMPLETE, this.onGameInitComplete, this);
        log("GameUIController: Unsubscribed from events.");
    }
}
