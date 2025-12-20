/**
 * Desktop Pet Fox - Content Script
 * Pixel-perfect animated fox using sprite sheet (4th row) with glitch-free rendering
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type FoxState = "run-right" | "run-left";

// ============================================================================
// SPRITE CONFIGURATION
// ============================================================================

// Import sprite sheet
import foxSpriteSheet from "./Cat/Fox Sprite Sheet.png";

// Sprite frame configuration for Fox (using 4th row)
const SPRITE_CONFIG = {
  frameWidth: 32,
  frameHeight: 32,
  runFrameCount: 6,
  rowIndex: 3, // 4th row (0-indexed)
  scale: 3, // Visual scale factor
};

// Calculate actual visual width (used for collision detection)
const VISUAL_WIDTH = SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.scale;

const FOX_STYLES = `
  #desktop-pet-fox {
    position: fixed;
    bottom: 30px;
    left: 0;
    width: ${SPRITE_CONFIG.frameWidth}px;
    height: ${SPRITE_CONFIG.frameHeight}px;
    z-index: 2147483647;
    pointer-events: none;
    
    /* Pixel-perfect rendering */
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
    
    /* Performance optimizations */
    will-change: transform;
    backface-visibility: hidden;
    
    background-repeat: no-repeat;
    background-image: url('${foxSpriteSheet}');
    
    /* Run Animation - 6 frames, 4th horizontal row */
    animation: fox-run-anim 0.6s steps(${SPRITE_CONFIG.runFrameCount}) infinite;
  }

  @keyframes fox-run-anim {
    from {
      background-position: 0 -${SPRITE_CONFIG.rowIndex * SPRITE_CONFIG.frameHeight}px;
    }
    to {
      background-position: -${SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.runFrameCount}px -${SPRITE_CONFIG.rowIndex * SPRITE_CONFIG.frameHeight}px;
    }
  }

  /* Flip for left direction - NO separate sprite needed */
  #desktop-pet-fox.flip {
    transform: scaleX(-1);
  }
`;

// ============================================================================
// FINITE STATE MACHINE
// ============================================================================

class FoxStateMachine {
  private currentState: FoxState = "run-right";
  private previousState: FoxState = "run-right";
  private stateStartTime: number = Date.now();

  constructor() {}

  getState(): FoxState {
    return this.currentState;
  }

  setState(newState: FoxState): void {
    if (this.currentState !== newState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.stateStartTime = Date.now();
      console.log(`[Fox FSM] ${this.previousState} → ${newState}`);
    }
  }

  getStateTime(): number {
    return Date.now() - this.stateStartTime;
  }
}

// ============================================================================
// DESKTOP PET FOX CLASS
// ============================================================================

class DesktopPetFox {
  private container: HTMLDivElement | null = null;
  private stateMachine: FoxStateMachine;
  private positionX: number = 0;
  private targetPosition: number = 0;
  private animationFrameId: number | null = null;

  private readonly MOVE_SPEED = 1.5;
  private readonly MIN_WALK_DISTANCE = 150;

  constructor() {
    this.stateMachine = new FoxStateMachine();
    this.init();
  }

  private init(): void {
    this.injectStyles();

    this.container = document.createElement("div");
    this.container.id = "desktop-pet-fox";

    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(this.container!);
        this.startBehavior();
      });
    } else {
      document.body.appendChild(this.container);
      this.startBehavior();
    }

    this.positionX = Math.random() * (window.innerWidth - VISUAL_WIDTH);
    this.updatePosition();

    this.startAnimationLoop();

    console.log("[Desktop Pet Fox] Initialized with pixel-perfect rendering ✨");
  }

  private injectStyles(): void {
    const styleId = "desktop-pet-fox-styles";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = FOX_STYLES;
    document.head.appendChild(style);
  }

  private startBehavior(): void {
    this.transitionToRun();
  }

  private startAnimationLoop(): void {
    const update = () => {
      this.updateMovement();
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  private updateMovement(): void {
    const state = this.stateMachine.getState();

    if (state === "run-right") {
      this.positionX += this.MOVE_SPEED;

      if (this.positionX >= this.targetPosition) {
        this.positionX = this.targetPosition;
        this.transitionToRun();
      }

      this.updatePosition();
    } else if (state === "run-left") {
      this.positionX -= this.MOVE_SPEED;

      if (this.positionX <= this.targetPosition) {
        this.positionX = this.targetPosition;
        this.transitionToRun();
      }

      this.updatePosition();
    }
  }

  private updatePosition(): void {
    if (!this.container) return;

    const maxX = window.innerWidth - VISUAL_WIDTH;
    this.positionX = Math.max(0, Math.min(maxX, this.positionX));

    const flipTransform = this.container.classList.contains("flip")
      ? " scaleX(-1)"
      : "";
    this.container.style.transform = `translateX(${this.positionX}px) scale(${SPRITE_CONFIG.scale})${flipTransform}`;
  }

  private transitionToRun(): void {
    if (!this.container) return;

    const maxX = window.innerWidth - VISUAL_WIDTH;
    const minDistance = this.MIN_WALK_DISTANCE;

    let targetX: number;
    do {
      targetX = Math.random() * maxX;
    } while (Math.abs(targetX - this.positionX) < minDistance);

    this.targetPosition = targetX;

    if (this.targetPosition > this.positionX) {
      this.stateMachine.setState("run-right");
      this.container.classList.remove("flip");
    } else {
      this.stateMachine.setState("run-left");
      this.container.classList.add("flip");
    }
  }

  public triggerReminder(): void {
    console.log("[Desktop Pet Fox] 🔔 Reminder triggered!");
  }

  public destroy(): void {
    console.log("[Desktop Pet Fox] Destroying instance 💫");

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    const styleElement = document.getElementById("desktop-pet-fox-styles");
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    this.container = null;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let foxInstance: DesktopPetFox | null = null;

function initFox(): void {
  if (foxInstance) {
    console.warn("[Desktop Pet Fox] Already initialized");
    return;
  }

  foxInstance = new DesktopPetFox();
}

function triggerReminder(): void {
  if (!foxInstance) {
    console.warn("[Desktop Pet Fox] Not initialized. Call initFox() first.");
    return;
  }
  foxInstance.triggerReminder();
}

function destroyFox(): void {
  if (foxInstance) {
    foxInstance.destroy();
    foxInstance = null;
  }
}

// ============================================================================
// AUTO-INITIALIZE & EXPOSE GLOBAL API
// ============================================================================

(window as any).desktopPetFox = {
  triggerReminder,
  destroy: destroyFox,
  init: initFox,
  test: () => {
    console.log("[Desktop Pet Fox] 🧪 Test function called!");
    if (!foxInstance) {
      console.log("[Desktop Pet Fox] Initializing for test...");
      initFox();
    }
    console.log("[Desktop Pet Fox] Fox instance exists:", !!foxInstance);
    triggerReminder();
  }
};

document.addEventListener("fox-reminder", () => {
  triggerReminder();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[Desktop Pet Fox] Message received:", message);

  if (message.type === "TRIGGER_FOX_REMINDER") {
    console.log("[Desktop Pet Fox] ✅ Trigger confirmed! Initializing fox...");
    // Initialize fox if not already initialized
    if (!foxInstance) {
      console.log("[Desktop Pet Fox] Initializing on reminder trigger");
      initFox();
    } else {
      console.log("[Desktop Pet Fox] Fox already initialized");
    }
    triggerReminder();
    sendResponse({ success: true });
  }

  return true;
});

console.log("[Desktop Pet Fox] ✅ Content script loaded and ready (waiting for trigger)");
console.log("[Desktop Pet Fox] Page URL:", window.location.href);

export { triggerReminder, destroyFox, initFox };

export function onExecute() {
  console.log("[Desktop Pet Fox] Ready and waiting for alarm trigger");
  // Do NOT call initFox() here - wait for TRIGGER_FOX_REMINDER message
}
