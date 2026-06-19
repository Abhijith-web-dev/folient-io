# Folient — Dashboard Page Specification

This document defines the functional requirements, user interface design, visual styling guidelines, and interactions for the **Folient Dashboard Page**.

For the general architecture plan, refer to [Project-Data.md](file:///c:/Project/project%20backup/folient-builder/Project-Data.md).

---

## 1. Page Metadata
- **Route Path:** `/dashboard` (Authenticated Route)
- **Title Tag:** `Folient — User Dashboard`
- **Meta Description:** `Manage your portfolio projects, check live deployment environments, configure API key adapters, view AI usage telemetry, and access your media vault.`
- **SEO Elements:** Private route, excluded from indexation via `robots.txt` configuration and meta `noindex` tag.

---

## 2. Visual Style & Design System
- **Theme:** Default Dark Mode with dynamic Light Mode toggle.
- **Composition Rules (from DESIGN.md):**
  - Uses asymmetrical grid layouts rather than equal-sized grids.
  - Large analytics charts and KPI cards combined with mixed-width tables.
  - Symmetrical spacing constraints (margins: 32px, card gaps: 24px, maximum content boundaries: 1600px).
- **Data Visualization Style:**
  - Charts (rendered using Recharts) must employ rounded bars, smooth line splines, floating hover tooltips, and minimal axis clutter.
  - Color markers: Orange (`#FF5B2D`), Purple (`#8B5CF6`), Green (`#22C55E`), Blue (`#3B82F6`), Yellow (`#FACC15`), and Pink (`#EC4899`).
- **Surface Shadows:** Smooth card elevation styling with a 16px border-radius on cards, 24px on standard sections, and 32px on primary panels.

---

## 3. Sections & Layout Details

The page features a persistent left-hand navigation sidebar (collapsible to icon-only on narrow devices) and a main content frame with five tabbed sections:

### 3.1 Overview Tab
- **Projects Grid (Asymmetric Grid):**
  - **New Project Card:** Always positioned first. Features a dashed outline border with a center "+" icon. Clicking redirects to the Template Selection page.
  - **Project Cards:** Display an `html2canvas` layout thumbnail, title (inline editable), last-modified timestamp, and file size.
  - **Actions Dropdown:** Contains Open in Editor, Duplicate Project, Rename, Export HTML, Deploy, and Delete (requires modal confirmation).
- **LLM Generation Activity Widget:**
  - A dual-line spline chart representing prompt call volume over the past 30 days.
  - Sourced from browser IndexedDB telemetry data. Lines are color-coded: Purple (Gemini), Orange (Groq), Blue (OpenRouter).
  - Floating KPI badges: Total Prompts, Estimated Token Count, Response Speed (ms), and Most Active Model.
- **Live Environments Status:**
  - Table displaying live deployments compiled via Netlify or Vercel REST APIs.
  - Columns: Project Name, URL (anchor link), Deploy Provider (badge), Status Indicator (Live - Green, Building - Yellow, Failed - Red), and a "Re-deploy" action button.

### 3.2 User Profile Tab
- **Personal Information:**
  - Profile image field (upload is routed to personal Supabase bucket; URL is synced back to Firestore user document), editable Display Name, unique Username handle (validated for uniqueness via Firestore transaction indexes), and Bio text area (500 character limit).
- **Onboarding Profile Questionnaire:**
  - Selector fields to configure AI generation preambles:
    - **User Type:** Freelancer, Developer, Designer, Student, Agency, Job Seeker, Hobbyist.
    - **Portfolio Objective:** Job Applications, Client Showcase, Personal Brand.
    - **Experience Level:** Beginner, Intermediate, Advanced, Expert.
- **Showcase Settings:** Toggles to opt-in to public Community directory visibility and template sharing permissions.
- **Social Binds:** Input fields for GitHub, LinkedIn, Twitter/X, Dribbble, and Behance (validated for URL schemas).

### 3.3 Connectors Tab
Centralized dashboard for configuring credentials (keys are encrypted client-side using Web Crypto PBKDF2 key derivation and AES-256-GCM prior to Firestore sync):
- **AI Engine Blocks (Gemini, Groq, OpenRouter):**
  - Masked text inputs for API keys with show/hide eye toggles.
  - "Test Connection" button triggering a tiny, zero-cost API completion check.
  - Connected state indicators: green check badge for positive responses, red alert for invalid credentials or exceeded rate limits.
  - Direct helper links redirecting to respective console developers panels to generate keys.
- **Supabase Storage Vault Connection:**
  - Project URL and Anon Key credentials fields.
  - Bucket selector dropdown (includes an option to auto-scaffold a default `folient-media` bucket).
- **Netlify & Vercel OAuth Connectors:**
  - Primary triggers initiating OAuth handshake popups, returning access tokens directly to the client wrapper. Shows connected account name and active plan tier.

### 3.4 AI Telemetry Tab
Detailed analytics view of local prompt data cached in IndexedDB:
- **Response Speed Box-plot:** Compares response latencies across models (Gemini Flash vs Groq Llama vs OpenRouter DeepSeek).
- **Detailed Token Ledger:** Table representing execution data: Prompt strings count, input tokens, output tokens, and calculated expenses (based on a static JSON pricing schema).
- **Experimental Code Quality Score:**
  - A dashboard visualization showing page health metrics.
  - Score represents client-side checks checking for: valid HTML tree structure, absence of runtime frame console errors, inclusion of semantic structures, and mobile meta viewport tags.
- **Completion Playground (Model Sandbox):**
  - Sandbox workspace where developers can write prompt text, set completion parameters (temperature, max tokens), and view raw JSON responses, token counts, and API response logs.

### 3.5 Media Vault Tab
- **Media Asset Grid:** Masonry representation of image and video files uploaded to the user's personal Supabase bucket. Renders thumbnails with filename, file format extension, and size details.
- **Drag-and-Drop Zone:** Top banner area with active drop listeners. Shows uploading progress bars per file.
- **Vault Actions:**
  - **Copy URL:** Copies public asset URL to clipboard.
  - **Use in Editor:** Launches the Editor page with the asset panel pre-loaded.
  - **Delete:** Wipes the file from Supabase storage and refreshes the grid array.
- **Null State:** If Supabase details are missing, renders a redirection card linking to the Connectors Tab.
