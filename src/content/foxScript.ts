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
import foxSpriteSheet from "./Cat/Fox Sprite Sheet Run.png";

// Sprite frame configuration for Fox (single row)
const SPRITE_CONFIG = {
  frameWidth: 32,
  frameHeight: 32,
  runFrameCount: 6,
  scale: 3, // Visual scale factor
};

// Calculate actual visual width (used for collision detection)
const VISUAL_WIDTH = SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.scale;

const FOX_STYLES = `
  #desktop-pet-grass {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 60px;
    z-index: 2147483646;
    pointer-events: none;
    background-color: #679a45;
    overflow: hidden;
    display: flex;
  }

  #desktop-pet-grass svg {
    height: 100%;
    flex-shrink: 0;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

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
    
    /* Run Animation - 6 frames, single horizontal row */
    animation: fox-run-anim 0.6s steps(${SPRITE_CONFIG.runFrameCount}) infinite;
  }

  @keyframes fox-run-anim {
    from {
      background-position: 0 0;
    }
    to {
      background-position: -${SPRITE_CONFIG.frameWidth * SPRITE_CONFIG.runFrameCount}px 0;
    }
  }

  /* Flip for left direction - NO separate sprite needed */
  #desktop-pet-fox.flip {
    transform: scaleX(-1);
  }

  #desktop-pet-controls {
    position: fixed;
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 2147483648;
    pointer-events: all;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .pet-control-btn {
    font-family: 'Press Start 2P', cursive;
    font-size: 10px;
    padding: 12px 16px;
    background: #7FB3D5;
    border: 3px solid #2C3E50;
    color: #FFFFFF;
    cursor: pointer;
    transition: all 0.1s ease;
    box-shadow: 4px 4px 0 rgba(44, 62, 80, 0.3);
    text-transform: uppercase;
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }

  .pet-control-btn:hover {
    background: #5A9BC4;
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 rgba(44, 62, 80, 0.3);
  }

  .pet-control-btn:active {
    transform: translate(2px, 2px);
    box-shadow: 2px 2px 0 rgba(44, 62, 80, 0.3);
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
  private grassElement: HTMLDivElement | null = null;
  private controlsContainer: HTMLDivElement | null = null;
  private stateMachine: FoxStateMachine;
  private positionX: number = 0;
  private targetPosition: number = 0;
  private animationFrameId: number | null = null;
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;

  private readonly MOVE_SPEED = 1.5;
  private readonly MIN_WALK_DISTANCE = 150;

  constructor() {
    this.stateMachine = new FoxStateMachine();
    this.init();
  }

  private init(): void {
    this.injectStyles();

    // Create grass element with SVG
    const grassElement = document.createElement("div");
    grassElement.id = "desktop-pet-grass";
    this.grassElement = grassElement;
    const grassSVG = `<svg fill="#000000" viewBox="0 -45 120 120" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;width:120px;"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><g id="grass" transform="matrix(1.27,0,0,1.27,-0.96,-123.035)"><g transform="matrix(1.08664,2.12199e-17,2.12199e-17,1,-10.8633,50.5676)"><path d="M10.693,69.932L10.717,61.942L15.701,60.579L18.843,62.761L20.008,59.487L23.617,60.306L24.781,57.032L31.504,59.695L32.901,59.968L46.199,57.032C46.199,57.032 54.228,63.449 54.811,63.722C55.393,63.995 74.599,60.449 74.599,60.449L78.44,57.032L87.168,61.267L97.668,63.729L97.648,69.932L10.693,69.932Z" style="fill:#679a45;fill-rule:nonzero;"></path></g><g transform="matrix(1.08664,2.12199e-17,2.12199e-17,1,-6.70477,50.5676)"><path d="M13.199,68.354L16.925,62.49L23.064,68.422L13.199,68.354Z" style="fill:#35813f;fill-rule:nonzero;"></path></g><g transform="matrix(1.08664,2.12199e-17,2.12199e-17,1,-6.70477,50.5676)"><path d="M30.542,68.354L33.189,65.081L34.936,65.081L39.564,62.42L40.697,65.489L52.745,64.466L57.546,68.149L30.542,68.354Z" style="fill:#35813f;fill-rule:nonzero;"></path></g><g transform="matrix(1.08664,2.12199e-17,2.12199e-17,1,-6.70477,50.5676)"><path d="M69.42,67.943L70.117,66.035L75.122,65.215L76.579,63.17L88.449,68.148L69.42,67.943Z" style="fill:#35813f;fill-rule:nonzero;"></path></g></g></g></svg>`;
    
    // Create multiple SVG copies to tile across screen
    const svgWidth = 120; // SVG viewBox width
    const screenWidth = window.innerWidth;
    const tilesNeeded = Math.ceil(screenWidth / svgWidth) + 1;
    
    for (let i = 0; i < tilesNeeded; i++) {
      const wrapper = document.createElement("div");
      wrapper.innerHTML = grassSVG;
      grassElement.appendChild(wrapper.firstElementChild!);
    }

    this.container = document.createElement("div");
    this.container.id = "desktop-pet-fox";

    // Create controls
    this.createControls();

    if (!document.body) {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(grassElement);
        document.body.appendChild(this.container!);
        document.body.appendChild(this.controlsContainer!);
        this.startBehavior();
      });
    } else {
      document.body.appendChild(grassElement);
      document.body.appendChild(this.container);
      document.body.appendChild(this.controlsContainer!);
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

  /**
   * Create control buttons for snooze and stop
   */
  private createControls(): void {
    this.controlsContainer = document.createElement("div");
    this.controlsContainer.id = "desktop-pet-controls";

    // Snooze button
    const snoozeBtn = document.createElement("button");
    snoozeBtn.className = "pet-control-btn";
    snoozeBtn.textContent = "Snooze +5s";
    snoozeBtn.addEventListener("click", () => this.snooze());

    // Stop button
    const stopBtn = document.createElement("button");
    stopBtn.className = "pet-control-btn";
    stopBtn.textContent = "Stop";
    stopBtn.addEventListener("click", () => this.stop());

    this.controlsContainer.appendChild(snoozeBtn);
    this.controlsContainer.appendChild(stopBtn);
  }

  /**
   * Snooze the reminder by 5 seconds
   */
  private snooze(): void {
    console.log("[Desktop Pet Fox] Snooze activated - 5 seconds added");
    
    // Clear any existing dismiss timeout
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }

    // Reset dismiss timeout for another 5 seconds
    this.dismissTimeout = setTimeout(() => {
      this.stop();
    }, 5000);
  }

  /**
   * Stop the fox and remove from page
   */
  private stop(): void {
    console.log("[Desktop Pet Fox] Stop activated - removing fox");
    
    // Clear timeout
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }

    // Clear animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }

    // Remove fox container
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }

    // Remove grass
    if (this.grassElement && this.grassElement.parentNode) {
      this.grassElement.parentNode.removeChild(this.grassElement);
    }

    // Remove controls
    if (this.controlsContainer && this.controlsContainer.parentNode) {
      this.controlsContainer.parentNode.removeChild(this.controlsContainer);
    }

    // Remove styles
    const styleElement = document.getElementById("desktop-pet-fox-styles");
    if (styleElement && styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }

    this.container = null;
    this.grassElement = null;
    this.controlsContainer = null;
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
