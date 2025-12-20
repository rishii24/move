# Pixel Pets - Browser Extension

A retro-style browser extension that displays animated pixel art pets (Cat or Fox) on your screen at timed intervals.

## Features

### 🎮 Pixel-Perfect Retro UI
- Mario-game inspired pixelated interface
- Press Start 2P font for authentic retro feel
- Calming pastel color palette
- Smooth animations with pixel-art rendering

### 🐱 🦊 Choose Your Companion
- **Cat**: Playful & Curious companion
- **Fox**: Swift & Clever companion
- Each animal has unique sprite animations

### ⏰ Flexible Timer Options
**Quick Select Presets:**
- 5 seconds
- 10 seconds  
- 30 seconds
- 1 minute
- 5 minutes
- 10 minutes

**Custom Time:**
- Set any duration in seconds or minutes
- Perfect for pomodoro, breaks, or reminders

### 🎬 Animation System
- Pixel-perfect sprite sheet animations
- 6-frame running cycle
- Smooth left/right movement across full screen width
- Uses 4x scale for clear visibility
- Hardware-accelerated transforms for performance

## Technical Implementation

### Sprite Sheets
- **Cat**: Uses `Cat Sprite Sheet Run.png` (6-frame horizontal strip)
- **Fox**: Uses `Fox Sprite Sheet.png` (4th row, 6 frames)
- Frame size: 32x32 pixels
- Scale: 4x (displayed as 128x128)

### Architecture
- **Popup UI**: Multi-screen flow (Animal Select → Timer Config → Active Timer)
- **Background Service Worker**: Manages Chrome alarms API
- **Content Scripts**: Injects animated pets into web pages
  - `catScript.ts` - Cat animation logic
  - `foxScript.ts` - Fox animation logic

### Key Technologies
- React + TypeScript
- Chrome Extensions Manifest V3
- Chrome Alarms API
- CSS Animations with `steps()` for sprite frames
- `requestAnimationFrame` for smooth movement
- Pixel-perfect rendering with `image-rendering: pixelated`

## How It Works

1. **Select Animal**: Choose between Cat or Fox
2. **Set Timer**: Pick a preset or enter custom time
3. **Timer Starts**: Background service worker creates alarm
4. **Pet Appears**: When time's up, your chosen pet runs across all open tabs
5. **Reset**: Set a new timer or change animals

## Animation Details

### Movement
- Full-width screen traversal
- Random target selection (minimum 150px travel)
- 1.5 pixels per frame speed
- Automatic direction changes at boundaries

### Sprite Animation
- `steps(6)` CSS animation for discrete frames
- 0.6s loop duration
- Horizontal sprite strip layout
- Background position animation
- `scaleX(-1)` for direction flipping

## Development

### Build Commands
```bash
npm run dev   # Development mode with hot reload
npm run build # Production build
```

### File Structure
```
src/
├── popup/
│   ├── App.tsx                      # Main app with screen navigation
│   ├── pixel-styles.css            # Retro pixelated UI styles
│   └── components/
│       ├── AnimalSelect.tsx        # Animal selection screen
│       ├── TimeSelectPixel.tsx     # Timer configuration screen
│       └── TimerActive.tsx         # Active countdown display
├── content/
│   ├── catScript.ts               # Cat animation logic
│   ├── foxScript.ts               # Fox animation logic
│   └── Cat/
│       ├── Cat Sprite Sheet Run.png
│       └── Fox Sprite Sheet.png
└── background/
    └── index.ts                    # Service worker for alarms
```

## Color Palette

- **Primary Background**: `#E8F4F8` (Soft Sky Blue)
- **Secondary Background**: `#D4E8F0` (Light Powder Blue)
- **Accent Primary**: `#7FB3D5` (Calm Blue)
- **Success**: `#88C9A1` (Soft Mint)
- **Warning**: `#F4C98A` (Gentle Peach)
- **Text**: `#2C3E50` (Soft Dark Blue)

All colors chosen for a calming, non-intrusive experience.

## Browser Compatibility

- Chrome/Edge (Manifest V3)
- Minimum Chrome version: 88+
- Uses Chrome Alarms API for background timers

## Future Enhancements

- More animals (Dog, Rabbit, etc.)
- Additional animations (idle, sleep, jump)
- Sound effects toggle
- Custom sprite sheet support
- Multiple pets simultaneously
- Pet interaction modes
