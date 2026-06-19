# Folient — Editor Page Specification

This document defines the functional requirements, user interface design, visual styling guidelines, and interactions for the **Folient Editor Page**.

For the general architecture plan, refer to [Project-Data.md](file:///c:/Project/project%20backup/folient-builder/Project-Data.md).

---

## 1. Page Metadata
- **Route Path:** `/editor` (Authenticated Route)
- **Title Tag:** `Folient — Workspace Editor`
- **Meta Description:** `Build and refine your portfolio. Visually modify layouts, adjust element styles, or write raw code alongside Google Gemini, Groq, and OpenRouter AI engines.`
- **SEO Elements:** Private route, excluded from search engine crawls via `robots.txt` configuration and meta `noindex` tag.

---

## 2. Visual Style & Design System
- **Theme:** Follows user profile settings (persisted in local storage, default: Dark Mode).
- **Color Palette (Dark / Light):**
  - Left/Right Sidebar Background: `#131923` (Dark) / `#FFFFFF` (Light)
  - Canvas Workspace Background: `#F8FAFC` (with a subtle `#ECEFF3` grid-pattern at 4% opacity)
  - Selection Border: `2px solid #3B82F6` (with `rgba(59,130,246,0.12)` box shadow selection glow)
- **Typography:** Inter (for panels/labels), Outfit (for buttons and action links).
- **Animations:**
  - Sidebar toggling: 200ms slide-in/slide-out transitions.
  - Interactive element hovering (canvas overlays): immediate (50ms transition).
  - Floating Chatbox expansion: 250ms fade + scale transition.

---

## 3. Sections & Layout Details

The workspace utilizes a full-viewport, 3-column layout structure:

### 3.1 Top Editor Navbar
- **Brand/Home Button:** Displays "Folient". Clicking triggers an unsaved changes validation dialog, then redirects back to `/dashboard`.
- **Project Title:** An inline-editable input field. Triggers automated database persistence to IndexedDB on focus-blur (autosave indicator shows a green checkmark).
- **Undo / Redo Actions:** Clicking triggers history pointer updates. Supports keyboard binds: `Ctrl+Z` (Undo), `Ctrl+Shift+Z` / `Ctrl+Y` (Redo) with history stack capped at 100 entries.
- **Viewport Device Toggles:** Three-button icon group:
  - **Desktop (default):** Width 100%.
  - **Tablet:** Width 768px (centered inside workspace).
  - **Mobile:** Width 375px (centered inside workspace).
- **Edit Mode Switch:** Global toggle switch labeled "Edit Mode".
  - **ON (default):** Enables element inspection, hover borders, click-to-select, and double-click to edit text directly.
  - **OFF:** Disables interactions. Viewport works as a standard browser preview.
- **Action Toolbar:**
  - **Code View:** Toggle button that opens the Monaco Code Editor Panel (occupies 40% of viewport width from the right).
  - **Save:** Manual save trigger.
  - **Export:** Downloads the currently compiled HTML bundle as a single, stand-alone file.
  - **Deploy:** Triggers a dialog modal containing Netlify and Vercel quick deploy workflows.
- **AI Engine status & Profile:** Displays the active provider badge (e.g. Gemini 2.0 Flash) and user avatar dropdown containing Settings and Logout items.

### 3.2 Left Sidebar (Utility Panel)
Collapsible vertical sidebar containing three tab groups:
- **Sections Tab:**
  - Lists all page sections present in the HTML DOM (identified by `data-folient-section-id` tags).
  - Features dynamic drag-and-drop handles for live layout reordering (changes are synchronized back to the canvas iframe).
  - Include visibility toggles (hidden sections are excluded from the exported file bundle) and quick-delete actions.
- **Layers Tab:**
  - Renders a tree view representing the HTML DOM hierarchy of the currently selected section.
  - Clicking nodes triggers selection states in both the tree view and canvas. Double-clicking labels allows modifying user-defined metadata descriptors.
- **Assets Tab (Media Vault integration):**
  - Displays thumbnail files uploaded to the user's Supabase bucket.
  - Allows dragging image/video assets directly onto canvas elements to trigger source replacement.
  - Includes a direct "Upload Asset" button communicating with the client-side Supabase client.

### 3.3 Canvas (Center Preview)
- Renders the portfolio index page inside a sandboxed `<iframe>` with `sandbox="allow-scripts allow-same-origin"` settings.
- Updates are handled surgically by the `SectionManager` — instead of reloading the iframe, DOM nodes containing matching `data-folient-section-id` attributes are replaced dynamically on AI completion or manual style edits.
- Displays a blue dashed selection box over elements on mouse hover, indicating tag descriptor and label.
- Double-clicking text blocks applies the `contenteditable` property directly inside the iframe context, allowing users to modify content inline and piping inputs back to state.

### 3.4 Right Panel (Property Editor)
Context-sensitive styling controls that map directly to inline CSS of the selected canvas element:
- **Typography Controls:** Adjust Font Size (with px/rem conversion), Font Family (Google Fonts subset), Font Weight (100–900 sliders), Line Height, Text Color (RGB/HEX picker), and alignment.
- **Box Model Controls:** Detailed padding and margin inputs represented on a visual grid layout. Includes border-radius sliders and size dimensions (width, height, min/max values).
- **Layout & Positioning:** Display toggles (`block`, `flex`, `grid`, `inline-block`). When `flex` is selected, flexbox controls (Direction, Align, Justify, Gap) are activated.
- **Backgrounds:** Select between Solid Color, Gradients (linear/radial builder with stop sliders), or Image URLs.
- **AI Re-style:** Short text input ("make this modern", "glassmorphism card look") sending the selected element's inline CSS to the AI orchestrator, returning a style-sheet differential for user review.

### 3.5 Bottom Chatbox (AI Assistant)
A collapsible and draggable panel acting as the primary conversational interface:
- **Model selector dropdown:** Select between Google Gemini, Groq, and OpenRouter engines based on active API keys.
- **Preamble Prompting Context:**
  - **Auto:** AI identifies target elements based on the prompt.
  - **Section Lock:** Focuses the prompt strictly on a single active section.
  - **Full Page:** Full document context is evaluated (ideal for design-wide theme changes).
- **Interface Actions:** Message thread showing user prompt inputs and AI response cards containing interactive side-by-side code diffs with "Apply" and "Discard" actions. Includes attachment (`+`) buttons for local file uploading (sent to personal Supabase storage and inlined).

### 3.6 Monaco Code Editor Panel (Code View)
- Lazy-loaded editor panel opening on the right side of the canvas.
- Real-time debounced compilation (500ms delay) between code modifications and the canvas preview iframe.
- Features a "Format Code" utility executing Prettier in-browser WASM compilation.
- Features a "Detach Panel" action opening the code workspace in a separate browser tab, maintaining communication with the editor state using the `postMessage` protocol.
