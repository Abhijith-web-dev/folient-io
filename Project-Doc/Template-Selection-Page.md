# Folient — Template Selection Page Specification

This document defines the functional requirements, user interface design, visual styling guidelines, and interactions for the **Folient Template Selection Page**.

For the general architecture plan, refer to [Project-Data.md](file:///c:/Project/project%20backup/folient-builder/Project-Data.md).

---

## 1. Page Metadata
- **Route Path:** `/templates` (Authenticated / Public View)
- **Title Tag:** `Folient — Select a Portfolio Template`
- **Meta Description:** `Choose from 10+ official pre-built responsive HTML templates or browse community-contributed layouts. Personalize instantly with AI.`
- **SEO Elements:** Indexable page, includes ItemList schema configurations referencing the templates catalog.

---

## 2. Visual Style & Design System
- **Theme:** Default Light Mode with dark mode overrides.
- **Card Layout:**
  - Standard card spacing: 24px grid gaps, 16px radius, and standard hover animations (lifts card by 4px and increases shadow depth).
  - Thumbnail ratio: `16:10` aspect ratio. Fits preview frames cleanly.

---

## 3. Sections & Layout Details

The Template Selection portal features a sticky navigation filter bar at the top and a multi-column masonry-style grid workspace:

### 3.1 Sticky Top Filter Bar
- **Search input:** Type queries to search templates by name, tags, or authors.
- **Category Filter Pills:** Horizontal scrollable category selectors:
  - `All`, `Minimal`, `Creative`, `Technical`, `Corporate`, `Academic`, `Photography`, `Dark Mode`, `Light Mode`.
- **Advanced Filter Drawer:** Collapsible panel showing:
  - **Sections Included checklist:** Hero, About, Skills, Projects, Blog, Testimonials, Contact, Custom.
- **Sort controls:** Dropdown menu: `Most Popular` (downloads count), `Highest Rated` (community stars), or `Newest`.

### 3.2 Template Gallery Grid
- Responsive 3-column layout (collapses to 2 on tablets, 1 on mobile).
- **Template Card Structure:**
  - **Image Thumbnail:** Hovering reveals a semi-transparent dark overlay showing "Preview Template" and "Use Template" CTA buttons.
  - **Metadata Footer:** Displays Template Name, Author Badge (e.g. `Folient Official` or community user profile link), rating stars, and total downloads count.

### 3.3 Template Preview Modal
- Opens full-viewport overlay when clicking the "Preview" button on any card.
- **Left Workspace (80% width):** Large scrollable frame displaying the live HTML template populated with sample data. Renders inside a responsive canvas wrapper with desktop, tablet, and mobile viewing toggles.
- **Right Sidebar (20% width):**
  - Displays Template Details: title, category tags, author, and description.
  - Displays structured sections index listing: list of HTML sections in order.
  - Rating widget (allows authenticated users who have selected the template to leave a 1–5 star rating).
  - Action buttons: "Use this Template" (Primary) and "Cancel" (Close).

### 3.4 Template Injection Workflow
When a user selects "Use this Template", the application triggers the following routine:
1. **Workspace Option Dialog:** Prompts user to choose: "Start fresh with this template?" (replaces active sandbox project details) or "Create new project?" (generates a new project document in IndexedDB).
2. **IndexedDB Persistance:** Extracts the template HTML source, sets matching `data-folient-section-id` attributes on all section container tags, and saves the records under the `projects` database store.
3. **AI Handshake Sequence:** Launches the Editor workspace and automatically initializes the Chatbox with the onboarding questionnaire context. The AI assistant sends a greeting prompt: *"This template features [n] sections. Tell me about your background and objectives so I can customize them for you."*

### 3.5 Official Template Catalog (Minimum v1.0 Catalog)

The page comes pre-installed with 10 official themes:

| Theme Name | Focus / Category | Built-in Page Sections | Design Tone & Aesthetics |
|---|---|---|---|
| **Horizon** | Minimal / Light | Hero, About, Projects list, Contact | Spacious, elegant serif text, subtle margins |
| **Carbon** | Technical / Dark | Hero, Skills, Projects, GitHub integration | Console font styling, dark grey, bright accents |
| **Lumina** | Creative / Dark | Hero, About, Gallery portfolio, Contact | Gradient text headers, card grids, soft borders |
| **Slate** | Corporate / Light | Hero, About, Services, FAQ Accordion, Contact | Sharp borders, slate backgrounds, clean cards |
| **Prism** | Photography / Light | Hero gallery, Photo Grid, About, Contact | Masonry layout, borderless images, minimal text |
| **Focus** | Academic / Light | Hero, Publications list, Research, Contact | Structured tables, serif typography, left sidebar |
| **Pulse** | Freelancer / Dark | Hero, Services, Pricing cards, Testimonials | Modern badge buttons, animated borders, cards |
| **Mono** | Minimalist / Dark | Hero, About, Selected works, Contact | Monospaced typography, strict black and white theme |
| **Vivid** | Creative / Light | Hero, Radial skill badges, Blog, Contact | Soft shadow cards, pink-orange hues, rounded tabs |
| **Studio** | Agency / Dark | Hero, Showcase, Meet the team, Contact | Overlapping containers, video backgrounds, bold CTAs |
