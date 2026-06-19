# Folient — Home Page Specification

This document defines the functional requirements, user interface design, visual styling guidelines, and interactions for the **Folient Home Page**.

For the general architecture plan, refer to [Project-Data.md](file:///c:/Project/project%20backup/folient-builder/Project-Data.md).

---

## 1. Page Metadata
- **Route Path:** `/` (Public Root)
- **Title Tag:** `Folient — Free Open-Source AI Portfolio Builder`
- **Meta Description:** `Build professional portfolio websites in minutes with Google Gemini, Groq, or OpenRouter. Truly client-side, zero-backend, and free forever.`
- **SEO Elements:** Schema.org SoftwareApplication schema, OpenGraph preview metadata (image, title, description).

---

## 2. Visual Style & Design System
- **Theme:** Default Dark Mode with dynamic Light Mode toggle.
- **Color Palette (Dark):** 
  - Primary Background: `#0B0F19` (Sleek slate dark)
  - Secondary Card Background: `#171E2E` (Semi-transparent glassmorphism overlay)
  - Primary Accent Gradient: Purple to Blue (`from-violet-600 to-indigo-500`)
- **Typography:** Inter (for bodies/interfaces), Outfit (for headlines and CTAs).
- **Animations:** 
  - Smooth 200ms transitions on hover states.
  - Typewriter cycle for target roles in the Hero.
  - Slide and fade-in animations on scroll (Intersection Observer).

---

## 3. Sections & Layout Details

### 3.1 Hero Section
- **Heading Text:** "Build your portfolio as a `[developer / designer / freelancer / student]` with AI." (Typewriter effect rotating through highlighted roles).
- **Primary CTA:** "Start Building Free" button. Redirects to `/auth` which redirects to `/editor` after sign-in.
- **Secondary CTA:** "Explore Showcase" button. Scrolls to solutions or redirects to `/community`.
- **Visual Display:** Embed an iframe running a canvas video or canvas animation demonstrating a portfolio being generated segment by segment with floating code snippets.
- **Live Social Proof:**
  - **GitHub Star Count:** Dynamic fetch via `https://api.github.com/repos/folient/folient`.
  - **Total Portfolios Generated:** Public Counter synced from Firebase Firestore (`community/stats/totals`).
  - **Community Count:** Dynamic indicator of active users.

### 3.2 About Section
- **Philosophy Highlight:** Emphasis on BYOK (Bring Your Own Key), Privacy (client-only storage), and Open-Source freedom.
- **Process Diagram:** Responsive step layout illustrating:
  1. **Prompt:** "Describe your brand in natural language."
  2. **Generate:** "AI codes it in the sandboxed preview."
  3. **Refine:** "Customize layouts visually or via code."
  4. **Deploy:** "Publish to Netlify or Vercel with one click."

### 3.3 Features Grid
- Grid arrangement of feature cards with micro-animations on hover (lifts card by 5px and changes border opacity).
- **Featured Cards:**
  - **Multi-Provider AI:** Toggle between Gemini, Groq, and OpenRouter APIs.
  - **Section Isolation:** Surgically alter single elements without resetting the page.
  - **Visual & Code Sync:** Double-edit canvas panels and Monaco code editor.
  - **Supabase Asset Vault:** Personal media integration.
  - **Direct Upload Deployment:** Quick zip Netlify deployment.
  - **Telemetry Log:** Visual performance and cost estimation charts.

### 3.4 Solutions Section
- Target group tab selectors: `Developer`, `Designer`, `Freelancer`, `Student`.
- Clicking a tab replaces the graphic mockups and testimonials with tailored templates (e.g. Carbon for Developers, Prism/Lumina for Designers).
- Uses sliding underline tabs for active state transitions.

### 3.5 FAQ Accordion
- Minimum 12 collapsible items.
- Top keyword filter input. As the user types, it filters visible FAQ cards.
- **Core Topics:** Free tier duration (Forever), how to obtain API keys (Google AI Studio, Groq Console, OpenRouter Console), data ownership, Supabase bucket configuration, exporting guidelines, and offline capabilities.

### 3.6 Footer Section
- Site Map links (Docs, Templates, Community, Privacy, Terms).
- Social link icons: GitHub, Discord, Twitter/X.
- **Theme Toggle Switch:** Alternates CSS class `.dark` on body element and saves `theme: 'light' | 'dark'` to localStorage.
- **Newsletter Signup:** Input field and submit button posting to Firestore collection `community/newsletter/subscribers` directly from the client.
