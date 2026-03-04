# Assistive Technology Continuum - Interactive Sorting Game

## Project Overview

This is an educational web application designed to teach users about the continuum of assistive technology (AT) supports used in educational settings. The application presents 19 different assistive technology tools and strategies that users must categorize into four levels: No Tech, Low Tech, Mid Tech, and High Tech.

## Purpose & Educational Context

The application helps educators, therapists, families, and students understand:
- How assistive technology exists on a continuum from simple environmental supports to advanced digital systems
- How to match tools and strategies to individual learner needs
- That supports can scale in sophistication and cost while maintaining the goal of enabling access, independence, and participation

## Core Functionality

### 1. Interactive Card Sorting
- **19 Cards to Sort**: Each represents a specific assistive technology or support strategy
- **4 Categories**: No Tech, Low Tech, Mid Tech, High Tech
- **Multiple Correct Answers**: Some cards (like "Graphic organizers" or "AAC communication") can correctly belong to multiple categories
- **Visual Feedback**: Cards show colored borders when placed correctly, matching their category color
- **Timer**: Tracks how long it takes to sort all cards, starting automatically when the game begins

### 2. Dual Input Methods
The application supports both desktop and mobile interactions:

**Desktop:**
- Drag and drop cards using the grip handle (6-dot icon on left side)
- Single-click on card text to open category selection modal
- Double-click on card text to view detailed information

**Mobile/Touch:**
- Single-tap on card text to open category selection modal
- Double-tap on card text to view detailed information
- Pinch-to-zoom for page-level zoom control (50% to 200%)

### 3. Rich Information Architecture
Each card includes:
- **Tool name**
- **Detailed description** (2-3 paragraphs explaining what it is, who it helps, and how it's used)
- **Image search suggestions** (pre-defined search terms to help users find visual examples)
- **Multiple possible correct categories**

Each category includes:
- **Definition and scope**
- **Examples of tools in that category**
- **Pros and cons** of that technology level
- **When these tools are most appropriate**

### 4. Educational Modals

**Instructions Modal** (accessed via top-right "Instructions" button):
- **Overview Tab**: Explains the AT continuum concept and the four categories
- **How to Play Tab**: Step-by-step instructions for using the application
- Font size controls (+/- buttons)
- Categorized information with color-coded sections matching the main interface

**Card Information Modal** (double-click/double-tap on cards):
- **Info Tab**: Detailed 2-3 paragraph explanation of the tool
- **Images Tab**: Provides search terms users can use to find visual examples online
- Font size controls
- External link button to perform the image search

**Category Information Modal** (click/tap on category headers):
- Detailed explanation of what defines that technology level
- Examples and context
- Font size controls

## Design System

### Color Scheme
Each category has a distinct color palette for easy visual recognition:

- **No Tech**: Emerald/Teal (from-emerald-500 to-teal-600)
- **Low Tech**: Sky/Blue (from-sky-500 to-blue-600)
- **Mid Tech**: Amber/Orange (from-amber-500 to-orange-600)
- **High Tech**: Rose/Pink (from-rose-500 to-pink-600)
- **Unsorted Cards**: Slate gray gradient
- **Background**: Dark slate theme (slate-900 primary)

### Visual Design Principles

1. **High Contrast**: White text on dark backgrounds with sufficient contrast ratios
2. **Clear Visual Hierarchy**:
   - Large, bold category headers with gradients
   - Clear card borders and hover states
   - Obvious interactive elements (grip handles, buttons)
3. **Accessibility Features**:
   - Font size controls in all modals (12px to 24px range)
   - Page-level zoom (50% to 200%)
   - Presentation mode (fullscreen)
   - Touch-friendly tap targets
   - Visual feedback for all interactions
4. **Responsive Design**:
   - Desktop: 4-column grid for categories
   - Mobile: Single column stack
   - Adaptive interactions based on device capability

### Typography
- Default body text: 16px
- Modal content: Adjustable 12-24px
- Card labels: Medium weight, clear sans-serif
- Headers: Bold weight with gradient colors

## Technical Architecture

### Technology Stack
- **Framework**: React 18.3.1 with TypeScript
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS 3.4.1
- **Icons**: Lucide React (0.344.0)
- **State Management**: React Hooks (useState, useRef, useEffect)

### Project Structure
```
src/
├── App.tsx                    # Main application component (all UI logic)
├── cardInfo.ts               # Detailed descriptions for each AT tool
├── categoryInfo.ts           # Detailed descriptions for each category
├── imageSearchQueries.ts     # Search terms for finding images
├── index.css                 # Tailwind imports
└── main.tsx                  # React entry point
```

### Key State Management

**Cards State:**
- Array of card objects with id, label, category, and correctCategories
- Initially all cards are in "unsorted" category
- Updates when user categorizes cards

**UI State:**
- `draggedCard`: Tracks which card is being dragged
- `timer`: Elapsed time in seconds
- `isRunning`: Timer active state
- `selectedCard`: Card shown in info modal
- `selectedCategory`: Category shown in category modal
- `mobileCategoryModal`: Card awaiting category selection on mobile
- `pageZoom`: Page zoom level (50-200%)
- `isPresentationMode`: Fullscreen mode toggle

**Font Size State:**
- `cardFontSize`: Size for card info modal (16px default)
- `instructionsFontSize`: Size for instructions modal (16px default)
- `categoryFontSize`: Size for category info modal (16px default)

### Interaction Patterns

**Double-Click/Double-Tap Detection:**
- Uses timeout refs to distinguish single vs double interactions
- 300ms delay window for detecting double actions
- Clears pending timeouts when double action detected

**Drag and Drop:**
- Custom drag image created programmatically showing card being moved
- Drag handle (grip icon) prevents accidental drags when clicking card text
- Visual feedback with opacity changes during drag

**Pinch-to-Zoom (Mobile):**
- Listens for 2-finger touch events
- Calculates distance between touch points
- Scales zoom proportionally
- Snaps to 10% increments
- Range limited to 50-200%

**Timer Logic:**
- Starts automatically when any card is in "unsorted" state
- Stops when all cards are categorized
- Shows completion message when finished
- Persists during page interactions

## Educational Content

### 19 Assistive Technology Tools/Strategies

**No Tech (4 items):**
1. Peer buddy/partner support
2. Preferential seating
3. Chunk tasks
4. (Note: Some tools appear here as secondary categories)

**Low Tech (8 items):**
1. Reading guide
2. Graphic organizers (also High Tech)
3. Pencil grips
4. Slant board
5. Magnification (also Mid Tech, High Tech)
6. (Plus overlaps from other categories)

**Mid Tech (5 items):**
1. Portable word processor
2. Calculator
3. Voice recorder
4. Visual timers
5. Magnification (also Low Tech, High Tech)

**High Tech (9 items):**
1. Spell checker
2. Text-to-speech
3. Graphic organizers (also Low Tech)
4. Audiobooks
5. Adapted keyboard
6. AAC communication (also Low Tech, Mid Tech)
7. Single switch access
8. Magnification (also Low Tech, Mid Tech)
9. Artificial intelligence

### Content Philosophy

**Multi-Category Tools**: Some tools intentionally belong to multiple categories because they can be implemented at different technology levels:
- Graphic organizers: Paper-based (Low) or digital/software (High)
- Magnification: Handheld magnifier (Low), electronic magnifier (Mid), screen magnification software (High)
- AAC: Paper communication boards (Low), simple voice output devices (Mid), dynamic display tablets (High)

**No Tech Clarification**: These are support strategy accommodations that require no technology. While not technically assistive technologies, they're included to illustrate how accommodation strategies and AT can work together.

## User Experience Flow

1. **Landing**: User sees 19 unsorted cards in gray at the top, 4 empty colored category sections below, timer at 0:00
2. **Sorting**: User drags or clicks to categorize cards
3. **Feedback**: Correctly placed cards show colored borders; timer runs
4. **Learning**: User can click category headers or double-click cards to learn more
5. **Completion**: When all cards sorted, timer stops and completion message appears
6. **Exploration**: User can continue to explore information, adjust zoom, or reset to try again

## Accessibility Features

### Built-in Accommodations
1. **Font Size Controls**: All text content can be enlarged up to 150% of default
2. **Page Zoom**: Entire interface scales from 50% to 200%
3. **Presentation Mode**: Fullscreen option removes browser UI distractions
4. **Keyboard-Friendly**: Tab navigation and enter/space interactions
5. **Color-Coded**: Distinct colors for each category aid recognition
6. **Clear Visual Feedback**: Hover states, active states, completion states
7. **Multiple Input Methods**: Mouse, touch, keyboard all supported
8. **Error-Tolerant**: Can't break the game; can always reset

### Design for Diverse Learners
The application itself models universal design principles it teaches:
- Multiple means of representation (text, color, icons, spatial organization)
- Multiple means of action/expression (drag, click, tap)
- Multiple means of engagement (timed challenge, exploratory learning, self-paced)

## Key Design Decisions

### 1. Single-File Component Architecture
All UI logic lives in App.tsx. This choice was made because:
- The application has a single view with interconnected state
- Modal dialogs share styling and interaction patterns
- Splitting would require extensive prop drilling or context
- Total file size remains manageable (~1000 lines)

### 2. Comprehensive Tooltips and Information
Every tool and category has detailed (200-300 word) descriptions because:
- The target audience (educators, therapists) needs depth to make informed decisions
- The application serves as both a game and a reference resource
- Users may be unfamiliar with some AT tools

### 3. Multiple Correct Answers
Unlike typical sorting games, this allows flexibility because:
- Real-world AT exists on a true continuum, not rigid categories
- Some tools genuinely span multiple categories depending on implementation
- This models authentic decision-making in AT selection

### 4. No Server/Database
All content is static and client-side because:
- Educational content doesn't change per-user
- No user accounts or data persistence needed
- Simplifies deployment and accessibility
- Faster load times and offline capability

### 5. Timer Without Leaderboard
Timer provides motivation but isn't competitive because:
- Educational goal is learning, not speed
- Different users have different accessibility needs affecting completion time
- Focus remains on understanding concepts, not performance pressure

### 6. Dark Theme
Dark slate background chosen because:
- Reduces eye strain during extended use
- Makes colored category gradients more vibrant
- Creates visual hierarchy with white text
- Professional appearance for adult learners

### 7. Drag Handle Instead of Full-Card Drag
Cards only drag when grip icon is used because:
- Prevents accidental drags when trying to read or click card
- Clearer affordance of draggable functionality
- Allows click/tap on card text to trigger different action (category selection)

### 8. Separate Desktop and Mobile Interactions
Different interaction models per device because:
- Desktop has more precise mouse control, hover states
- Mobile benefits from tap-based modal interactions
- Drag-and-drop is difficult on small touchscreens
- Each interface optimized for its input method

## Future Enhancement Possibilities

While not currently implemented, the architecture could support:
- User progress tracking (local storage)
- Multiple difficulty levels (fewer cards, preset categories)
- Additional card sets for different domains (physical, sensory, communication-specific AT)
- Printable summary/report of user's categorizations
- Embedded video demonstrations
- Multi-language support
- Narration/audio descriptions
- Integration with learning management systems

## Files Reference

### Core Application Files
- **App.tsx** (1000+ lines): All component logic, state management, UI rendering
- **cardInfo.ts**: Object mapping card labels to detailed descriptions
- **categoryInfo.ts**: Object mapping category names to detailed explanations
- **imageSearchQueries.ts**: Object mapping card labels to search terms

### Configuration Files
- **package.json**: Dependencies (React, Vite, Tailwind, Lucide icons)
- **tailwind.config.js**: Standard Tailwind configuration
- **vite.config.ts**: Vite build configuration
- **tsconfig.json**: TypeScript compiler options

## Deployment Notes

The application is a static site requiring no backend:
- Build command: `npm run build`
- Output: Static HTML/CSS/JS bundle
- Can be hosted on any static hosting service
- No environment variables or API keys required
- No database connections needed

## Summary

This project demonstrates a complete educational interactive application with:
- Thoughtful UX for both learning and accessibility
- Rich educational content with 19 tools and 4 categories
- Dual input paradigms (desktop and mobile)
- Professional visual design with dark theme and gradient accents
- Comprehensive information architecture
- Clean, maintainable React + TypeScript codebase
- Production-ready static site deployment
