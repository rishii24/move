console.log("[Desktop Pet Cat] 🚀 Script file starting to execute...");

/**
 * Desktop Pet Cat - Content Script
 * Pixel-perfect animated cat using sprite sheet with glitch-free rendering
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

type CatState = "run-right" | "run-left";

// ============================================================================
// SPRITE CONFIGURATION
// ============================================================================

// Import sprite sheet
import catRunSprite from "./Cat/Cat Sprite Sheet Run.png";

// Sprite frame configuration
const SPRITE_CONFIG = {
  frameWidth: 32,
  frameHeight: 32,
  runFrameCount: 6,
  scale: 4, // Visual scale factor
};

// Calculate actual visual width (used for collision detection)
const VISUAL_WIDTH = SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.scale;

const CAT_STYLES = `
  #desktop-pet-cat {
    position: fixed;
    bottom: 20px;
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
    background-image: url('${catRunSprite}');
    
    /* Run Animation - 6 frames, single horizontal row */
    animation: run-anim 0.6s steps(${SPRITE_CONFIG.runFrameCount}) infinite;
  }

  @keyframes run-anim {
    from {
      background-position: 0 0;
    }
    to {
      background-position: -${
        SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.runFrameCount
      }px 0;
    }
  }

  /* Flip for left direction - NO separate sprite needed */
  #desktop-pet-cat.flip {
    transform: scaleX(-1);
  }
`;

// ============================================================================
// FINITE STATE MACHINE
// ============================================================================

class CatStateMachine {
  private currentState: CatState = "run-right";
  private previousState: CatState = "run-right";
  private stateStartTime: number = Date.now();

  constructor() {}

  /**
   * Get the current state
   */
  getState(): CatState {
    return this.currentState;
  }

  /**
   * Transition to a new state
   */
  setState(newState: CatState): void {
    if (this.currentState !== newState) {
      this.previousState = this.currentState;
      this.currentState = newState;
      this.stateStartTime = Date.now();
      console.log(`[Cat FSM] ${this.previousState} → ${newState}`);
    }
  }

  /**
   * Get how long we've been in the current state (ms)
   */
  getStateTime(): number {
    return Date.now() - this.stateStartTime;
  }
}

// ============================================================================
// DESKTOP PET CAT CLASS
// ============================================================================

class DesktopPetCat {
  private container: HTMLDivElement | null = null;
  private stateMachine: CatStateMachine;
  private positionX: number = 0; // Track X position separately
  private targetPosition: number = 0;
  private animationFrameId: number | null = null;

  // Movement configuration - SEPARATED from animation timing
  private readonly MOVE_SPEED = 1.5; // pixels per frame
  private readonly MIN_WALK_DISTANCE = 150; // minimum pixels to walk

  constructor() {
    this.stateMachine = new CatStateMachine();
    this.init();
  }

  /**
   * Initialize the cat - inject CSS and create DOM elements
   */
  private init(): void {
    // Inject CSS
    this.injectStyles();

    // Create container (single element, no nested sprite)
    this.container = document.createElement("div");
    this.container.id = "desktop-pet-cat";

    // Ensure body exists before appending
    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(this.container!);
        this.startBehavior();
      });
    } else {
      document.body.appendChild(this.container);
      this.startBehavior();
    }

    // Set initial random position
    this.positionX = Math.random() * (window.innerWidth - VISUAL_WIDTH);
    this.updatePosition();

    // Start animation loop
    this.startAnimationLoop();

    console.log(
      "[Desktop Pet Cat] Initialized with pixel-perfect rendering ✨"
    );
  }

  /**
   * Inject CSS styles into the page
   */
  private injectStyles(): void {
    const styleId = "desktop-pet-cat-styles";

    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = CAT_STYLES;
    document.head.appendChild(style);
  }

  /**
   * Start the autonomous behavior loop
   */
  private startBehavior(): void {
    this.transitionToRun();
  }

  /**
   * Main animation loop - updates every frame using requestAnimationFrame
   */
  private startAnimationLoop(): void {
    const update = () => {
      this.updateMovement();
      this.animationFrameId = requestAnimationFrame(update);
    };
    update();
  }

  /**
   * Update cat movement - INDEPENDENT from sprite animation
   * Uses transform: translateX() for smooth, sub-pixel movement
   */
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

  /**
   * Update DOM position using transform (NOT left/top)
   */
  private updatePosition(): void {
    if (!this.container) return;

    // Clamp position to viewport
    const maxX = window.innerWidth - VISUAL_WIDTH;
    this.positionX = Math.max(0, Math.min(maxX, this.positionX));

    // Use translateX for smooth movement with scale
    const flipTransform = this.container.classList.contains("flip")
      ? " scaleX(-1)"
      : "";
    this.container.style.transform = `translateX(${this.positionX}px) scale(${SPRITE_CONFIG.scale})${flipTransform}`;
  }

  /**
   * Transition to running state
   */
  private transitionToRun(): void {
    if (!this.container) return;

    // Calculate random target position across full screen
    const maxX = window.innerWidth - VISUAL_WIDTH;
    const minDistance = this.MIN_WALK_DISTANCE;

    let targetX: number;
    do {
      targetX = Math.random() * maxX;
    } while (Math.abs(targetX - this.positionX) < minDistance);

    this.targetPosition = targetX;

    // Determine direction and set state
    if (this.targetPosition > this.positionX) {
      this.stateMachine.setState("run-right");
      this.container.classList.remove("flip");
    } else {
      this.stateMachine.setState("run-left");
      this.container.classList.add("flip");
    }
  }

  /**
   * Trigger reminder - just keeps running
   */
  public triggerReminder(): void {
    console.log("[Desktop Pet Cat] 🔔 Reminder triggered!");
  }

  /**
   * Clean up and remove the cat from the page
   */
  public destroy(): void {
    console.log("[Desktop Pet Cat] Destroying instance 💫");

    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    const styleElement = document.getElementById("desktop-pet-cat-styles");
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    this.container = null;
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

let catInstance: DesktopPetCat | null = null;

/**
 * Initialize the desktop pet cat
 */
function initCat(): void {
  if (catInstance) {
    console.warn("[Desktop Pet Cat] Already initialized");
    return;
  }

  catInstance = new DesktopPetCat();
}

/**
 * Public API: Trigger reminder animation
 */
function triggerReminder(): void {
  if (!catInstance) {
    console.warn("[Desktop Pet Cat] Not initialized. Call initCat() first.");
    return;
  }
  catInstance.triggerReminder();
}

/**
 * Public API: Remove cat from page
 */
function destroyCat(): void {
  if (catInstance) {
    catInstance.destroy();
    catInstance = null;
  }
}

// ============================================================================
// AUTO-INITIALIZE & EXPOSE GLOBAL API
// ============================================================================

// Note: Initialization is handled by onExecute() for CRXJS compatibility

// Expose global API for external control
(window as any).desktopPetCat = {
  triggerReminder,
  destroy: destroyCat,
  init: initCat,
  test: () => {
    console.log("[Desktop Pet Cat] 🧪 Test function called!");
    if (!catInstance) {
      console.log("[Desktop Pet Cat] Initializing for test...");
      initCat();
    }
    console.log("[Desktop Pet Cat] Cat instance exists:", !!catInstance);
    triggerReminder();
  }
};

// Listen for custom event (alternative trigger method)
document.addEventListener("cat-reminder", () => {
  triggerReminder();
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  console.log("[Desktop Pet Cat] Message received:", message);

  if (message.type === "TRIGGER_CAT_REMINDER") {
    console.log("[Desktop Pet Cat] ✅ Trigger confirmed! Initializing cat...");
    // Initialize cat if not already initialized
    if (!catInstance) {
      console.log("[Desktop Pet Cat] Initializing on reminder trigger");
      initCat();
    } else {
      console.log("[Desktop Pet Cat] Cat already initialized");
    }
    triggerReminder();
    sendResponse({ success: true });
  }

  return true;
});

console.log("[Desktop Pet Cat] ✅ Content script loaded and ready (waiting for trigger)");
console.log("[Desktop Pet Cat] Page URL:", window.location.href);

// Expose global immediately to test if script is loading
(window as any).catScriptLoaded = true;
console.log("[Desktop Pet Cat] Set window.catScriptLoaded =", (window as any).catScriptLoaded);

export { triggerReminder, destroyCat, initCat };

// CRXJS compatibility: DO NOT auto-initialize, wait for message
export function onExecute() {
  console.log("[Desktop Pet Cat] Ready and waiting for alarm trigger");
  // Do NOT call initCat() here - wait for TRIGGER_CAT_REMINDER message
}
