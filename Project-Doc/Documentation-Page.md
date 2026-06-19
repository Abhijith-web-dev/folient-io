# Folient — Documentation Page Specification

This document defines the functional requirements, user interface design, visual styling guidelines, and interactions for the **Folient Documentation Page**.

For the general architecture plan, refer to [Project-Data.md](file:///c:/Project/project%20backup/folient-builder/Project-Data.md).

---

## 1. Page Metadata
- **Route Path:** `/docs` (Public Root)
- **Title Tag:** `Documentation — Folient`
- **Meta Description:** `Learn how to set up Folient, configure Google Gemini, Groq, or OpenRouter keys, connect your personal Supabase storage, and deploy portfolios with one click.`
- **SEO Elements:** Static generation (SSG) for fast loading times. Contains Article schema markup, open-graph tags, and indexing rules.

---

## 2. Visual Style & Design System
- **Theme:** Default Light Mode with dark mode overrides (toggled via `.dark` class body selector).
- **Layout Constraints:**
  - Content container max-width: 1600px, padded at 32px.
  - Active navigation highlights use Primary (`#b22c00`) color text and light surface fills.
- **Reading Pane Layout:**
  - Center reading column restricted to a readable width of 72 characters (`max-w-[72ch]`) to optimize legibility.
  - Sidebar boundaries: Left sidebar width is 280px, Right sidebar width is 240px.

---

## 3. Sections & Layout Details

The Documentation Portal features a fixed header navbar and a 3-column split view (Left navigation tree, Center reading frame, and Right table of contents):

### 3.1 Top Navbar (Shared Component)
- Displays "Folient" brand logo.
- **Global Search Field:**
  - Center-left positioned search input. Focused automatically on trigger shortcut `⌘K` or `/`.
  - Performs local index-matching across markdown headers. Displays results in a floating modal popover overlay.
- **Active Page Link:** Indicates "Docs" as the active section with a bottom underline indicator.
- **Header Actions:** Contains Dark/Light theme toggle (represented by moon/sun icons), Sign In, and "Start Building Free" CTA button.

### 3.2 Left Navigation Sidebar
Fixed vertical column containing the structural categories list:
- **Getting Started:** Quickstart Guide, Core Concepts, Architecture principles.
- **AI Providers:** Setup guides for Google AI Studio, Groq Console, OpenRouter Console, and Local Models (Ollama).
- **Storage & Media:** Media Vault specifications, connecting personal Supabase.
- **Deployments:** Direct Netlify API publishing, Vercel REST deployment guides.
- **Workspace Manual:** Visual editor guide, keyboard shortcuts reference sheet, code panel synchronizations.

### 3.3 Center Reading Area
Displays the selected article compiled from repository markdown source files:
- **Breadcrumbs navigation:** Shows category hierarchy (e.g. `Documentation > Getting Started > Quickstart`).
- **Article Header:**
  - Standard Heading XL title.
  - Article meta details: Last modified timestamp, author credits, and an "Edit this page" button redirecting directly to the corresponding markdown file on GitHub.
- **GitHub-Style Callouts:**
  - **Tip Callout (Green):** Informs users about optimizations, tips, and guidelines (e.g. BYOK instructions).
  - **Warning Callout (Red):** Flags critical requirements (e.g. API key security instructions).
- **Interactive Step Cards (Quickstart representation):**
  - Timeline progress indicator line displaying steps sequentially.
  - Each step is rendered inside a white card surface displaying step number, title description, and optional code snippet blocks (featuring click-to-copy helpers).
- **Call-to-Action Footer:**
  - "Ready to build?" promo block. Contains a brief teaser, gradient background mesh, and a "Open the Editor" CTA button directing users to `/editor`.

### 3.4 Right Table of Contents (TOC)
- Sticky sidebar listing h2 and h3 headers of the active article.
- Synchronizes with scroll coordinates: as the user scrolls, the corresponding TOC link is highlighted. Includes a vertical timeline progress indicator showing scroll depth.
- Clicking any TOC anchor scrolls the center viewport to the target header with smooth easing.

### 3.5 Documentation Footer
- Displays sitemap links (Product, Company, Legal resources).
- Displays MIT License indicators and copyright info.
